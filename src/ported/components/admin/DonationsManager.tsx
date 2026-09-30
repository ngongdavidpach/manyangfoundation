import React, { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Plus, FileDown, Trash2 } from "lucide-react";
import { generateReceipt, getReceiptUrl } from "@/lib/receipts.functions";
import { insertDonation, deleteDonation } from "@/lib/donations.functions";

type Donation = Database["public"]["Tables"]["donations"]["Row"];
type Contact = Database["public"]["Tables"]["contacts"]["Row"];

const METHODS = ["cash", "bank_transfer", "cheque", "mobile_money", "stripe", "other"] as const;
const STATUSES = ["pending", "completed", "refunded", "failed"] as const;

export const DonationsManager: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const gen = useServerFn(generateReceipt);
  const getUrl = useServerFn(getReceiptUrl);
  const delFn = useServerFn(deleteDonation);

  const load = () => {
    supabase
      .from("donations")
      .select("*")
      .order("received_at", { ascending: false })
      .then(({ data }) => setDonations(data || []));
  };
  useEffect(() => {
    load();
    supabase
      .from("contacts")
      .select("*")
      .order("full_name")
      .then(({ data }) => setContacts(data || []));
  }, []);

  const issueReceipt = async (d: Donation) => {
    setBusyId(d.id);
    try {
      await gen({ data: { donationId: d.id } });
      const { url } = await getUrl({ data: { donationId: d.id } });
      window.open(url, "_blank");
      load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const downloadReceipt = async (d: Donation) => {
    setBusyId(d.id);
    try {
      const { url } = await getUrl({ data: { donationId: d.id } });
      window.open(url, "_blank");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-slate-900 mr-auto">Donations</h2>
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Log donation
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Donor</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Method</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Receipt</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  No donations yet.
                </td>
              </tr>
            )}
            {donations.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-3">{new Date(d.received_at).toLocaleDateString()}</td>
                <td className="p-3">{d.is_anonymous ? "Anonymous" : d.donor_name || "—"}</td>
                <td className="p-3 font-medium">
                  {d.currency} {(Number(d.amount_cents) / 100).toFixed(2)}
                </td>
                <td className="p-3 capitalize">{d.method.replace("_", " ")}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      d.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : d.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="p-3">
                  {d.receipt_number ? (
                    <button
                      onClick={() => downloadReceipt(d)}
                      disabled={busyId === d.id}
                      className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                    >
                      <FileDown className="w-3 h-3" /> #{d.receipt_number}
                    </button>
                  ) : d.status === "completed" ? (
                    <button
                      onClick={() => issueReceipt(d)}
                      disabled={busyId === d.id}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {busyId === d.id ? "…" : "Issue"}
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={async () => {
                      if (confirm("Delete donation?")) {
                        try {
                          await delFn({ data: { id: d.id } });
                          load();
                        } catch (e) {
                          alert((e as Error).message);
                        }
                      }
                    }}
                    className="text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <DonationForm
          contacts={contacts}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
};

const DonationForm: React.FC<{ contacts: Contact[]; onClose: () => void; onSaved: () => void }> = ({
  contacts,
  onClose,
  onSaved,
}) => {
  const insert = useServerFn(insertDonation);
  const [form, setForm] = useState({
    contact_id: "",
    donor_name: "",
    donor_email: "",
    amount: "",
    currency: "USD",
    method: "cash" as Database["public"]["Enums"]["donation_method"],
    status: "completed" as Database["public"]["Enums"]["donation_status"],
    designation: "",
    received_at: new Date().toISOString().slice(0, 10),
    notes: "",
    is_anonymous: false,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const amount_cents = Math.round(parseFloat(form.amount || "0") * 100);
    if (!amount_cents) {
      alert("Enter an amount");
      return;
    }
    const contact = contacts.find((c) => c.id === form.contact_id);
    setSaving(true);
    try {
      await insert({
        data: {
          contact_id: form.contact_id || null,
          amount_cents,
          currency: form.currency,
          method: form.method,
          status: form.status,
          designation: form.designation || null,
          donor_name: form.donor_name || contact?.full_name || null,
          donor_email: form.donor_email || contact?.email || null,
          is_anonymous: form.is_anonymous,
          notes: form.notes || null,
          received_at: new Date(form.received_at).toISOString(),
        },
      });
      onSaved();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-bold">Log donation</h3>
          <button onClick={onClose} className="text-slate-500">
            ✕
          </button>
        </div>
        <div className="p-5 space-y-3">
          <label className="block">
            <span className="text-xs uppercase text-slate-500">Link to contact (optional)</span>
            <select
              value={form.contact_id}
              onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            >
              <option value="">— none —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                  {c.email ? ` (${c.email})` : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs uppercase text-slate-500">Donor name</span>
              <input
                value={form.donor_name}
                onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase text-slate-500">Email</span>
              <input
                value={form.donor_email}
                onChange={(e) => setForm({ ...form, donor_email: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="block col-span-2">
              <span className="text-xs uppercase text-slate-500">Amount</span>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase text-slate-500">Currency</span>
              <input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs uppercase text-slate-500">Method</span>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value as typeof form.method })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm capitalize"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs uppercase text-slate-500">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs uppercase text-slate-500">Designation / program</span>
            <input
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase text-slate-500">Received on</span>
            <input
              type="date"
              value={form.received_at}
              onChange={(e) => setForm({ ...form, received_at: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_anonymous}
              onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
            />
            Anonymous donation
          </label>
          <label className="block">
            <span className="text-xs uppercase text-slate-500">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm w-full disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save donation"}
          </button>
        </div>
      </div>
    </div>
  );
};
