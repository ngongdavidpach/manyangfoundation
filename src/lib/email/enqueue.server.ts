// Server-only helper to render and enqueue a transactional email using the
// service-role client. Used for background/system triggers (cron purge jobs,
// account-deletion flows) that can't authenticate as an admin end-user.
import * as React from "react";
import { render } from "react-email";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "manyangdisabilityfoundation";
const SENDER_DOMAIN = "notify.manyangdisabilityfoundation.org";
const FROM_DOMAIN = "manyangdisabilityfoundation.org";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type EnqueueOptions = {
  templateName: string;
  recipientEmail: string;
  templateData?: Record<string, any>;
  idempotencyKey?: string;
  /** If true, skip suppression check (e.g. account-deletion confirmation
   * must still reach the user even if they've unsubscribed). */
  bypassSuppression?: boolean;
};

export async function enqueueTransactionalEmail(
  opts: EnqueueOptions,
): Promise<{ ok: true; messageId: string } | { ok: false; reason: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const template = TEMPLATES[opts.templateName];
  if (!template) return { ok: false, reason: "template_not_found" };

  const recipient = (template.to || opts.recipientEmail || "").trim();
  if (!recipient) return { ok: false, reason: "missing_recipient" };

  const normalizedEmail = recipient.toLowerCase();
  const messageId = crypto.randomUUID();

  if (!opts.bypassSuppression) {
    const { data: suppressed } = await supabaseAdmin
      .from("suppressed_emails")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (suppressed) return { ok: false, reason: "suppressed" };

    const { categoryForTemplate } = await import("@/lib/email/preferences");
    const category = categoryForTemplate(opts.templateName);
    if (category) {
      const { data: prefs } = await supabaseAdmin
        .from("email_preferences")
        .select("unsubscribed_all, receipts, events, coordinators, fundraisers, account")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (prefs && (prefs.unsubscribed_all || (prefs as any)[category] === false)) {
        return { ok: false, reason: "category_opted_out" };
      }
    }
  }

  // Ensure an unsubscribe token exists
  let unsubscribeToken: string | undefined;
  const { data: existingToken } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token;
  } else if (!existingToken) {
    const newTok = generateToken();
    await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .upsert(
        { token: newTok, email: normalizedEmail },
        { onConflict: "email", ignoreDuplicates: true },
      );
    const { data: stored } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalizedEmail)
      .maybeSingle();
    unsubscribeToken = stored?.token ?? newTok;
  } else {
    unsubscribeToken = existingToken.token;
  }

  const data = opts.templateData ?? {};
  const element = React.createElement(template.component, data);
  const html = await render(element);
  const plainText = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function" ? template.subject(data) : template.subject;

  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: opts.templateName,
    recipient_email: recipient,
    status: "pending",
  });

  const { error: enqueueError } = await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: recipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text: plainText,
      purpose: "transactional",
      label: opts.templateName,
      idempotency_key: opts.idempotencyKey || messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (enqueueError) {
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: opts.templateName,
      recipient_email: recipient,
      status: "failed",
      error_message: "Failed to enqueue email",
    });
    return { ok: false, reason: "enqueue_failed" };
  }

  return { ok: true, messageId };
}
