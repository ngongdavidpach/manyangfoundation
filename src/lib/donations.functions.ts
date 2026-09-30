import { createServerFn } from "@tanstack/react-start";
import { requireStaffOrAdmin } from "@/integrations/supabase/admin-middleware";
import { enforceRateLimit } from "@/lib/rateLimit.server";

type DonationInput = {
  contact_id?: string | null;
  amount_cents: number;
  currency: string;
  method: string;
  status: string;
  designation?: string | null;
  donor_name?: string | null;
  donor_email?: string | null;
  is_anonymous?: boolean;
  notes?: string | null;
  received_at: string;
};

function validate(d: DonationInput): DonationInput {
  if (!Number.isInteger(d.amount_cents) || d.amount_cents <= 0 || d.amount_cents > 1_000_000_00) {
    throw new Error("Amount must be between 0.01 and 1,000,000");
  }
  if (!/^[A-Z]{3}$/.test(d.currency)) throw new Error("Invalid currency code");
  if (d.notes && d.notes.length > 2000) throw new Error("Notes too long");
  return d;
}

export const insertDonation = createServerFn({ method: "POST" })
  .middleware([requireStaffOrAdmin])
  .validator((d: DonationInput) => validate(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    await enforceRateLimit({
      bucket: "donation-insert",
      max: 120,
      windowSeconds: 3600,
      key: userId,
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("donations")
      .insert({
        contact_id: data.contact_id || null,
        amount_cents: data.amount_cents,
        currency: data.currency,
        method: data.method as never,
        status: data.status as never,
        designation: data.designation || null,
        donor_name: data.donor_name || null,
        donor_email: data.donor_email || null,
        is_anonymous: !!data.is_anonymous,
        notes: data.notes || null,
        received_at: data.received_at,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: row.id };
  });

export const deleteDonation = createServerFn({ method: "POST" })
  .middleware([requireStaffOrAdmin])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    await enforceRateLimit({
      bucket: "admin-sensitive",
      max: 60,
      windowSeconds: 3600,
      key: userId,
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("donations").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
