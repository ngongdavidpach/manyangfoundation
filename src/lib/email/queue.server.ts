// Server-only helper to render + enqueue a transactional email directly via
// pgmq using the service-role client. Use this from server functions that
// run unauthenticated public intake flows (contact, registration, etc.)
// where the JWT-protected /lovable/email/transactional/send route can't be
// called. Mirrors the logic of that route.
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

export interface EnqueueArgs {
  templateName: string;
  recipientEmail?: string;
  templateData?: Record<string, any>;
  idempotencyKey?: string;
}

export async function enqueueTransactionalEmail(args: EnqueueArgs): Promise<{
  ok: boolean;
  reason?: string;
}> {
  const template = TEMPLATES[args.templateName];
  if (!template) {
    console.error("[enqueueTransactionalEmail] unknown template", args.templateName);
    return { ok: false, reason: "unknown_template" };
  }

  const recipient = template.to || args.recipientEmail;
  if (!recipient) return { ok: false, reason: "no_recipient" };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const normalised = recipient.toLowerCase();
  const messageId = crypto.randomUUID();

  // Suppression check
  const { data: suppressed } = await supabaseAdmin
    .from("suppressed_emails")
    .select("id")
    .eq("email", normalised)
    .maybeSingle();
  if (suppressed) {
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: args.templateName,
      recipient_email: recipient,
      status: "suppressed",
    });
    return { ok: false, reason: "suppressed" };
  }

  // Per-category preference check (opt-out)
  const { categoryForTemplate } = await import("@/lib/email/preferences");
  const category = categoryForTemplate(args.templateName);
  if (category) {
    const { data: prefs } = await supabaseAdmin
      .from("email_preferences")
      .select("unsubscribed_all, receipts, events, coordinators, fundraisers, account")
      .eq("email", normalised)
      .maybeSingle();
    if (prefs && (prefs.unsubscribed_all || (prefs as any)[category] === false)) {
      await supabaseAdmin.from("email_send_log").insert({
        message_id: messageId,
        template_name: args.templateName,
        recipient_email: recipient,
        status: "suppressed",
        error_message: `category_opted_out:${category}`,
      });
      return { ok: false, reason: "category_opted_out" };
    }
  }

  // Get-or-create unsubscribe token
  let unsubscribeToken: string;
  const { data: existingToken } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalised)
    .maybeSingle();

  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token;
  } else if (!existingToken) {
    const t = generateToken();
    await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .upsert({ token: t, email: normalised }, { onConflict: "email", ignoreDuplicates: true });
    const { data: stored } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalised)
      .maybeSingle();
    unsubscribeToken = stored?.token || t;
  } else {
    return { ok: false, reason: "token_used" };
  }

  const data = args.templateData || {};
  const element = React.createElement(template.component, data);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function" ? template.subject(data) : template.subject;

  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: args.templateName,
    recipient_email: recipient,
    status: "pending",
  });

  const { error } = await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: recipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: args.templateName,
      idempotency_key: args.idempotencyKey || messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error("[enqueueTransactionalEmail] enqueue failed", error);
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: args.templateName,
      recipient_email: recipient,
      status: "failed",
      error_message: "Failed to enqueue email",
    });
    return { ok: false, reason: "enqueue_failed" };
  }

  return { ok: true };
}
