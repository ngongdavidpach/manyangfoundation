import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireStaffOrAdmin } from "@/integrations/supabase/admin-middleware";
import { enforceRateLimit } from "@/lib/rateLimit.server";

// Generate a donation receipt PDF, store it in the `receipts` bucket,
// insert a row in `public.receipts`, and return the storage path.
export const generateReceipt = createServerFn({ method: "POST" })
  .middleware([requireStaffOrAdmin])
  .validator((d: { donationId: string }) => d)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    await enforceRateLimit({ bucket: "receipt-gen", max: 30, windowSeconds: 3600, key: userId });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: donation, error: dErr } = await supabaseAdmin
      .from("donations")
      .select("*")
      .eq("id", data.donationId)
      .single();
    if (dErr || !donation) throw new Error("Donation not found");
    if (donation.status !== "completed")
      throw new Error("Only completed donations can be receipted");

    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const draw = (
      text: string,
      x: number,
      y: number,
      size = 11,
      f = font,
      color = rgb(0.1, 0.1, 0.1),
    ) => page.drawText(text, { x, y, size, font: f, color });

    draw("Manyang Disability Foundation", 50, 790, 18, bold, rgb(0.12, 0.25, 0.69));
    draw("Donation Receipt", 50, 765, 14, bold);
    draw(`Receipt #${donation.receipt_number ?? "—"}`, 50, 745, 11);
    draw(`Issued: ${new Date().toLocaleDateString()}`, 50, 730);

    let y = 690;
    const row = (label: string, value: string) => {
      draw(label, 50, y, 10, bold);
      draw(value, 200, y, 10);
      y -= 22;
    };
    row("Donor", donation.is_anonymous ? "Anonymous" : donation.donor_name || "—");
    row("Email", donation.is_anonymous ? "—" : donation.donor_email || "—");
    row("Amount", `${donation.currency} ${(Number(donation.amount_cents) / 100).toFixed(2)}`);
    row("Method", String(donation.method).replace("_", " "));
    row("Designation", donation.designation || "Where most needed");
    row("Received", new Date(donation.received_at).toLocaleDateString());
    if (donation.message) row("Message", donation.message.slice(0, 80));

    draw("Thank you for your generous support.", 50, y - 20, 11, bold, rgb(0.12, 0.45, 0.25));
    draw(
      "This receipt acknowledges receipt of the donation above. Keep for your records.",
      50,
      y - 40,
      9,
    );

    const bytes = await pdf.save();
    const path = `donations/${donation.id}/receipt-${donation.receipt_number ?? "draft"}.pdf`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("receipts")
      .upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (upErr) throw upErr;

    const { error: insErr } = await supabaseAdmin.from("receipts").upsert(
      {
        donation_id: donation.id,
        receipt_number: donation.receipt_number ?? 0,
        storage_path: path,
        issued_by: userId,
      },
      { onConflict: "donation_id" },
    );
    if (insErr) throw insErr;

    return { path };
  });

export const getReceiptUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { donationId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await enforceRateLimit({ bucket: "receipt-url", max: 60, windowSeconds: 3600, key: userId });
    const { data: receipt } = await supabase
      .from("receipts")
      .select("storage_path, donation_id, donations!inner(user_id)")
      .eq("donation_id", data.donationId)
      .maybeSingle();
    if (!receipt) throw new Error("No receipt");

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    const donationUserId = (receipt as { donations?: { user_id?: string } | null }).donations
      ?.user_id;
    if (!isAdmin && donationUserId !== userId) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("receipts")
      .createSignedUrl(receipt.storage_path, 60 * 10);
    if (error) throw error;
    return { url: signed.signedUrl };
  });
