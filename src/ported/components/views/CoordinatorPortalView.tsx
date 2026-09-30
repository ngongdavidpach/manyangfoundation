import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { submitCoordinatorRegistration } from "@/lib/intake.functions";

const COUNTRIES = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Burundi",
  "South Sudan",
  "Ethiopia",
  "Somalia",
  "DR Congo",
];

const AID_TYPES = [
  "Wheelchairs",
  "Prosthetics",
  "Mobility aids",
  "Rehab supplies",
  "Other",
];

export const CoordinatorPortalView: React.FC = () => {
  const submit = useServerFn(submitCoordinatorRegistration);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "Kenya",
    region: "",
    organisation: "",
    roleTitle: "",
    yearsExperience: "",
    languages: "",
    aidTypes: [] as string[],
    estimatedBeneficiaries: "",
    notes: "",
  });

  const upd = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  const toggleAid = (a: string) =>
    setForm((s) => ({
      ...s,
      aidTypes: s.aidTypes.includes(a)
        ? s.aidTypes.filter((x) => x !== a)
        : [...s.aidTypes, a],
    }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await submit({
        data: {
          ...form,
          country: form.country as any,
        },
      });
      setDone(true);
    } catch (e: any) {
      setErr(e?.message || "Submission failed");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900 mt-3">Registration received</h1>
          <p className="text-sm text-slate-600 mt-2">
            Thank you. Our East Africa programmes team will be in touch within 7 business
            days to verify your details and coordinate next steps.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-br from-blue-900 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Secure coordinator portal · East Africa
          </p>
          <h1 className="mt-2 text-2xl md:text-4xl font-bold">
            Local Coordinator Registration
          </h1>
          <p className="mt-3 text-blue-100 text-sm md:text-base">
            For verified community workers and partner organisations across East Africa
            requesting mobility-aid shipments on behalf of beneficiaries.
          </p>
        </div>
      </header>

      <form
        onSubmit={onSubmit}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5"
      >
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Your details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full name" required>
              <input
                required
                value={form.fullName}
                onChange={(e) => upd("fullName", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => upd("email", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Phone (with country code)">
              <input
                value={form.phone}
                onChange={(e) => upd("phone", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Country" required>
              <select
                value={form.country}
                onChange={(e) => upd("country", e.target.value)}
                className={inputCls}
              >
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Region / district / city">
              <input
                value={form.region}
                onChange={(e) => upd("region", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Languages spoken">
              <input
                placeholder="e.g. English, Swahili, Dinka"
                value={form.languages}
                onChange={(e) => upd("languages", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Organisation & role</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Organisation (if any)">
              <input
                value={form.organisation}
                onChange={(e) => upd("organisation", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Role / title">
              <input
                value={form.roleTitle}
                onChange={(e) => upd("roleTitle", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Years of community work">
              <input
                type="number"
                min={0}
                value={form.yearsExperience}
                onChange={(e) => upd("yearsExperience", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Estimated beneficiaries you serve">
              <input
                type="number"
                min={0}
                value={form.estimatedBeneficiaries}
                onChange={(e) => upd("estimatedBeneficiaries", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Aid requested</h2>
          <div className="flex flex-wrap gap-2">
            {AID_TYPES.map((a) => {
              const on = form.aidTypes.includes(a);
              return (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAid(a)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    on
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  {a}
                </button>
              );
            })}
          </div>
          <Field label="Notes about the beneficiaries and need">
            <textarea
              rows={5}
              value={form.notes}
              onChange={(e) => upd("notes", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        {err && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-lg text-sm"
        >
          {busy ? "Submitting…" : "Submit registration"}
        </button>
      </form>
    </div>
  );
};

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label,
  required,
  children,
}) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-700 mb-1">
      {label}
      {required && <span className="text-rose-500"> *</span>}
    </span>
    {children}
  </label>
);

export default CoordinatorPortalView;
