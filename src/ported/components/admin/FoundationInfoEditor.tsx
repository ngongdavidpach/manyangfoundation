import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useFoundationInfo, type FoundationInfo } from "../../hooks/useFoundationInfo";

export const FoundationInfoEditor: React.FC = () => {
  const { content, save, loading } = useFoundationInfo();
  const [form, setForm] = useState<FoundationInfo>(content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(content);
  }, [content]);

  const update = (patch: Partial<FoundationInfo>) => setForm((f) => ({ ...f, ...patch }));
  const updateSocial = (key: keyof FoundationInfo["socials"], value: string) =>
    setForm((f) => ({ ...f, socials: { ...f.socials, [key]: value } }));

  const onSave = async () => {
    setSaving(true);
    try {
      await save(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-slate-500">Loading…</div>;

  const field = "w-full border border-slate-300 rounded-md px-3 py-2 text-sm";
  const label = "block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1";

  return (
    <div className="bg-white rounded-lg border p-6 space-y-5 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Foundation Info</h3>
          <p className="text-xs text-slate-500 mt-1">
            Org identity, contact details, and social links shown across the public site.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-md disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Name</label>
          <input className={field} value={form.name} onChange={(e) => update({ name: e.target.value })} />
        </div>
        <div>
          <label className={label}>Short name</label>
          <input className={field} value={form.shortName} onChange={(e) => update({ shortName: e.target.value })} />
        </div>
      </div>

      <div>
        <label className={label}>Tagline</label>
        <input className={field} value={form.tagline} onChange={(e) => update({ tagline: e.target.value })} />
      </div>

      <div>
        <label className={label}>Mission</label>
        <textarea className={field} rows={3} value={form.mission} onChange={(e) => update({ mission: e.target.value })} />
      </div>

      <div>
        <label className={label}>Vision</label>
        <textarea className={field} rows={3} value={form.vision} onChange={(e) => update({ vision: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Email</label>
          <input className={field} value={form.email} onChange={(e) => update({ email: e.target.value })} />
        </div>
        <div>
          <label className={label}>Phone</label>
          <input className={field} value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
        </div>
        <div>
          <label className={label}>Alt phone</label>
          <input className={field} value={form.altPhone} onChange={(e) => update({ altPhone: e.target.value })} />
        </div>
        <div>
          <label className={label}>Working hours</label>
          <input className={field} value={form.workingHours} onChange={(e) => update({ workingHours: e.target.value })} />
        </div>
      </div>

      <div>
        <label className={label}>Address</label>
        <input className={field} value={form.address} onChange={(e) => update({ address: e.target.value })} />
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-2">Socials</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["facebook", "twitter", "linkedin", "instagram"] as const).map((k) => (
            <div key={k}>
              <label className={label}>{k}</label>
              <input
                className={field}
                placeholder="https://…"
                value={form.socials[k]}
                onChange={(e) => updateSocial(k, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoundationInfoEditor;
