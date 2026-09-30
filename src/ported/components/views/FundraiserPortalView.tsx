import React, { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { submitFundraiserRegistration } from "@/lib/intake.functions";
import { supabase } from "@/integrations/supabase/client";

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const EVENT_TYPES = [
  "Run / walk",
  "Gala dinner",
  "Workplace giving",
  "School drive",
  "Community event",
  "Other",
];

interface UpcomingEvent {
  id: string;
  title: string;
  starts_at: string | null;
  location: string | null;
}

export const FundraiserPortalView: React.FC = () => {
  const submit = useServerFn(submitFundraiserRegistration);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "NSW",
    city: "",
    postcode: "",
    eventType: "Run / walk",
    eventDate: "",
    eventId: "",
    expectedParticipants: "",
    fundraisingGoal: "",
    priorExperience: "",
    message: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("events")
        .select("id, title, starts_at, location")
        .eq("status", "published")
        .gte("starts_at", nowIso)
        .order("starts_at", { ascending: true })
        .limit(20);
      if (!cancelled && data) setEvents(data as unknown as UpcomingEvent[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const upd = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setErr("Please enter a valid email address.");
      return;
    }
    if (!form.fullName.trim()) {
      setErr("Please enter your name.");
      return;
    }
    setBusy(true);
    try {
      await submit({
        data: {
          ...form,
          state: form.state as any,
          eventId: form.eventId || null,
        } as any,
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
          <h1 className="text-xl font-bold text-slate-900 mt-3">You’re registered</h1>
          <p className="text-sm text-slate-600 mt-2">
            Welcome aboard. Our Sydney team will contact you within 5 business days with
            a fundraising kit and event support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-br from-amber-600 to-rose-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Secure fundraiser portal · Australia
          </p>
          <h1 className="mt-2 text-2xl md:text-4xl font-bold">
            Volunteer Fundraiser Sign-up
          </h1>
          <p className="mt-3 text-amber-50 text-sm md:text-base">
            Host a run, gala, workplace campaign or community event to fund mobility-aid
            shipments. Every dollar is receipted against ABN 75 986 228 179.
          </p>
        </div>
      </header>

      <form
        onSubmit={onSubmit}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5"
      >
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900">About you</h2>
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
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => upd("phone", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="State" required>
              <select
                value={form.state}
                onChange={(e) => upd("state", e.target.value)}
                className={inputCls}
              >
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="City / suburb">
              <input
                value={form.city}
                onChange={(e) => upd("city", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Postcode">
              <input
                value={form.postcode}
                onChange={(e) => upd("postcode", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Your event</h2>

          <Field label="Link to an upcoming MDF event (optional)">
            <select
              value={form.eventId}
              onChange={(e) => upd("eventId", e.target.value)}
              className={inputCls}
            >
              <option value="">— Standalone event (no link) —</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                  {ev.starts_at
                    ? ` · ${new Date(ev.starts_at).toLocaleDateString("en-AU", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}`
                    : ""}
                  {ev.location ? ` · ${ev.location}` : ""}
                </option>
              ))}
            </select>
            {events.length === 0 && (
              <span className="block text-xs text-slate-500 mt-1">
                No upcoming events listed — describe your own below.
              </span>
            )}
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Event type">
              <select
                value={form.eventType}
                onChange={(e) => upd("eventType", e.target.value)}
                className={inputCls}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Proposed date">
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => upd("eventDate", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Expected participants">
              <input
                type="number"
                min={0}
                value={form.expectedParticipants}
                onChange={(e) => upd("expectedParticipants", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Fundraising goal (AUD)">
              <input
                type="number"
                min={0}
                value={form.fundraisingGoal}
                onChange={(e) => upd("fundraisingGoal", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Prior fundraising experience">
            <textarea
              rows={3}
              value={form.priorExperience}
              onChange={(e) => upd("priorExperience", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Anything else we should know?">
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => upd("message", e.target.value)}
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
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-lg text-sm"
        >
          {busy ? "Submitting…" : "Sign me up"}
        </button>
      </form>
    </div>
  );
};

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500";

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

export default FundraiserPortalView;
