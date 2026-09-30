import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rateLimit.server";

const contactSchema = z.object({
  contact_person: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  org_name: z.string().trim().max(180).optional().or(z.literal("")),
  org_type: z.string().trim().max(80).optional().or(z.literal("")),
  partnership_type: z.enum([
    "general",
    "partnership",
    "csr",
    "media",
    "volunteer",
    "other",
  ]),
  message: z.string().trim().min(10).max(2000),
  turnstileToken: z.string().min(10).max(4000),
});

export type ContactFormInput = z.input<typeof contactSchema>;

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[contact] TURNSTILE_SECRET_KEY not configured; rejecting submission");
    return false;
  }
  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as { success?: boolean };
    return !!json?.success;
  } catch (err) {
    console.error("[contact] turnstile verify failed", err);
    return false;
  }
}

export const submitContactInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: ContactFormInput) => contactSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    let ip: string | null = null;
    try {
      ip = getRequestIP({ xForwardedFor: true }) ?? null;
    } catch {}

    await enforceRateLimit({
      bucket: "contact",
      max: 5,
      windowSeconds: 600,
      key: ip ?? "unknown",
    });

    const ok = await verifyTurnstile(data.turnstileToken, ip);
    if (!ok) throw new Error("Spam protection check failed. Please try again.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("partner_inquiries").insert({
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone || null,
      org_name: data.org_name || "(individual)",
      org_type: data.org_type || null,
      partnership_type: data.partnership_type,
      message: data.message,
    });
    if (error) {
      console.error("[contact] insert failed", error);
      throw new Error("Could not submit your message. Please try again later.");
    }
    return { ok: true };
  });

export const getTurnstileSiteKey = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ siteKey: string | null }> => {
    return { siteKey: process.env.TURNSTILE_SITE_KEY ?? null };
  },
);
