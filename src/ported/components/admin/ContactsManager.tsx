import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Plus, Trash2, Search, Mail, Phone, Tag } from "lucide-react";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type Interaction = Database["public"]["Tables"]["contact_interactions"]["Row"];
type Donation = Database["public"]["Tables"]["donations"]["Row"];

const TYPES = ["donor", "lead", "partner", "volunteer", "beneficiary"] as const;
const STAGES = ["lead", "qualified", "engaged", "donor", "lapsed"] as const;

export const ContactsManager: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    setContacts(data || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = contacts.filter(
    (c) =>
      (typeFilter === "all" || c.type === typeFilter) &&
      (filter === "" ||
        c.full_name.toLowerCase().includes(filter.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(filter.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-bold text-slate-900 mr-auto">Contacts &amp; Donors</h2>
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> New contact
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-8 pr-3 py-2 border rounded-md text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="all">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Stage</th>
              <th className="text-left p-3 hidden md:table-cell">Email</th>
              <th className="text-left p-3 hidden md:table-cell">Phone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  No contacts yet.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-slate-50 cursor-pointer"
                onClick={() => setSelected(c)}
              >
                <td className="p-3 font-medium">{c.full_name}</td>
                <td className="p-3 text-slate-600 capitalize">{c.type}</td>
                <td className="p-3 text-slate-600 capitalize">{c.lifecycle_stage}</td>
                <td className="p-3 text-slate-600 hidden md:table-cell">{c.email || "—"}</td>
                <td className="p-3 text-slate-600 hidden md:table-cell">{c.phone || "—"}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm("Delete contact?")) {
                        await supabase.from("contacts").delete().eq("id", c.id);
                        load();
                      }
                    }}
                    className="text-rose-600 hover:text-rose-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(selected || creating) && (
        <ContactDrawer
          contact={selected}
          onClose={() => {
            setSelected(null);
            setCreating(false);
          }}
          onSaved={() => {
            load();
            setSelected(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
};

const ContactDrawer: React.FC<{
  contact: Contact | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ contact, onClose, onSaved }) => {
  const [form, setForm] = useState({
    full_name: contact?.full_name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    organization: contact?.organization || "",
    country: contact?.country || "",
    type: contact?.type || "lead",
    lifecycle_stage: contact?.lifecycle_stage || "lead",
    notes: contact?.notes || "",
    tags: (contact?.tags || []).join(", "),
    source: contact?.source || "",
  });
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [newInt, setNewInt] = useState({ type: "note", subject: "", body: "", follow_up_at: "" });
  const [tab, setTab] = useState<"profile" | "interactions" | "donations">("profile");

  useEffect(() => {
    if (!contact) return;
    supabase
      .from("contact_interactions")
      .select("*")
      .eq("contact_id", contact.id)
      .order("occurred_at", { ascending: false })
      .then(({ data }) => setInteractions(data || []));
    supabase
      .from("donations")
      .select("*")
      .eq("contact_id", contact.id)
      .order("received_at", { ascending: false })
      .then(({ data }) => setDonations(data || []));
  }, [contact?.id]);

  const save = async () => {
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (contact) {
      await supabase.from("contacts").update(payload).eq("id", contact.id);
    } else {
      await supabase.from("contacts").insert(payload);
    }
    onSaved();
  };

  const addInteraction = async () => {
    if (!contact) return;
    await supabase.from("contact_interactions").insert({
      contact_id: contact.id,
      type: newInt.type as Interaction["type"],
      subject: newInt.subject || null,
      body: newInt.body || null,
      follow_up_at: newInt.follow_up_at || null,
    });
    setNewInt({ type: "note", subject: "", body: "", follow_up_at: "" });
    const { data } = await supabase
      .from("contact_interactions")
      .select("*")
      .eq("contact_id", contact.id)
      .order("occurred_at", { ascending: false });
    setInteractions(data || []);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b sticky top-0 bg-white flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {contact ? form.full_name || "Contact" : "New contact"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
            ✕
          </button>
        </div>
        {contact && (
          <div className="border-b flex">
            {(["profile", "interactions", "donations"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm capitalize ${tab === t ? "border-b-2 border-blue-600 text-blue-700 font-medium" : "text-slate-600"}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {(tab === "profile" || !contact) && (
          <div className="p-5 space-y-3">
            {(["full_name", "email", "phone", "organization", "country", "source"] as const).map(
              (k) => (
                <label key={k} className="block">
                  <span className="text-xs uppercase text-slate-500 tracking-wider">
                    {k.replace("_", " ")}
                  </span>
                  <input
                    value={(form as Record<string, string>)[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  />
                </label>
              ),
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs uppercase text-slate-500 tracking-wider">Type</span>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Contact["type"] })}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm capitalize"
                >
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs uppercase text-slate-500 tracking-wider">Stage</span>
                <select
                  value={form.lifecycle_stage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lifecycle_stage: e.target.value as Contact["lifecycle_stage"],
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm capitalize"
                >
                  {STAGES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-xs uppercase text-slate-500 tracking-wider">
                Tags (comma-separated)
              </span>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase text-slate-500 tracking-wider">Notes</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </label>
            <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
              Save
            </button>
          </div>
        )}

        {tab === "interactions" && contact && (
          <div className="p-5 space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <select
                  value={newInt.type}
                  onChange={(e) => setNewInt({ ...newInt, type: e.target.value })}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {["note", "email", "call", "meeting", "task"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <input
                  value={newInt.subject}
                  onChange={(e) => setNewInt({ ...newInt, subject: e.target.value })}
                  placeholder="Subject"
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <textarea
                value={newInt.body}
                onChange={(e) => setNewInt({ ...newInt, body: e.target.value })}
                placeholder="Notes…"
                rows={3}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <div className="flex gap-2 items-center">
                <input
                  type="datetime-local"
                  value={newInt.follow_up_at}
                  onChange={(e) => setNewInt({ ...newInt, follow_up_at: e.target.value })}
                  className="px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={addInteraction}
                  className="ml-auto bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
                >
                  Log
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {interactions.map((i) => (
                <div key={i.id} className="border rounded p-3 text-sm">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="uppercase tracking-wider font-semibold">{i.type}</span>
                    <span>{new Date(i.occurred_at).toLocaleString()}</span>
                    {i.follow_up_at && (
                      <span className="text-amber-600">
                        ⏰ Follow up {new Date(i.follow_up_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {i.subject && <p className="font-medium mt-1">{i.subject}</p>}
                  {i.body && <p className="text-slate-700 mt-1 whitespace-pre-wrap">{i.body}</p>}
                </div>
              ))}
              {interactions.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">No interactions logged.</p>
              )}
            </div>
          </div>
        )}

        {tab === "donations" && contact && (
          <div className="p-5 space-y-2">
            {donations.map((d) => (
              <div
                key={d.id}
                className="border rounded p-3 text-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">
                    {d.currency} {(Number(d.amount_cents) / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(d.received_at).toLocaleDateString()} · {d.method} · {d.status}
                  </p>
                </div>
                {d.receipt_number && (
                  <span className="text-xs text-slate-500">Receipt #{d.receipt_number}</span>
                )}
              </div>
            ))}
            {donations.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No donations recorded.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
