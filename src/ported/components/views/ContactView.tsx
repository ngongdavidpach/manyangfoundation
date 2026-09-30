import React, { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, Mail, Send } from "lucide-react";
import { submitContactInquiry, type ContactFormInput } from "@/lib/contact.functions";
import { useFoundationInfo } from "../../hooks/useFoundationInfo";

type Props = { siteKey: string | null };

const PARTNERSHIP_OPTIONS: { value: ContactFormInput["partnership_type"]; label: string }[] = [
  { value: "general", label: "General inquiry" },
  { value: "partnership", label: "Partnership" },
  { value: "csr", label: "Corporate / CSR sponsorship" },
  { value: "media", label: "Media / press" },
  { value: "volunteer", label: "Volunteering" },
  { value: "other", label: "Other" },
];

export const ContactView: React.FC<Props> = ({ siteKey }) => {
  const { content: info } = useFoundationInfo();
  const submit = useServerFn(submitContactInquiry);
  const [form, setForm] = useState<Omit<ContactFormInput, "turnstileToken">>({
    contact_person: "",
    email: "",
    phone: "",
    org_name: "",
    org_type: "",
    partnership_type: "general",
    message: "",
  });
  const [token, setToken] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!token) {
      setStatus("error");
      setErrorMsg("Please complete the spam-protection check before submitting.");
      return;
    }
    setStatus("loading");
    try {
      await submit({ data: { ...form, turnstileToken: token } });
      setStatus("ok");
      setForm({
        contact_person: "",
        email: "",
        phone: "",
        org_name: "",
        org_type: "",
        partnership_type: "general",
        message: "",
      });
      setToken("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Could not send your message. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Contact &amp; Partner Inquiries
        </h1>
        <p className="text-base text-slate-600 max-w-2xl">
          Partnerships, CSR sponsorships, media questions, and general enquiries. We reply within
          three working days.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <h2 className="font-bold text-slate-900 text-sm">Reach us directly</h2>
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <a className="hover:text-blue-700" href={`mailto:${info.email}`}>{info.email}</a>
            </p>
            {info.phone && <p className="text-sm text-slate-600">{info.phone}</p>}
            {info.address && <p className="text-xs text-slate-500 leading-relaxed">{info.address}</p>}
          </div>
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 text-xs text-blue-900 leading-relaxed">
            <strong className="block mb-1">Prefer a formal proposal?</strong>
            For CSR programs, download our sponsorship prospectus from the{" "}
            <a href="/csr-sponsorship" className="underline font-semibold">CSR page</a>.
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs"
        >
          {status === "ok" && (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <strong className="block">Message sent.</strong>
                Thanks — a team member will reply to {form.email || "your email"} shortly.
              </div>
            </div>
          )}
          {status === "error" && errorMsg && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-person" className="text-xs font-bold text-slate-700">
                Your name *
              </label>
              <input
                id="contact-person"
                name="contact_person"
                required
                maxLength={120}
                value={form.contact_person}
                onChange={(e) => update("contact_person", e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="text-xs font-bold text-slate-700">
                Email *
              </label>
              <input
                id="contact-email"
                name="email"
                required
                type="email"
                maxLength={255}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className="text-xs font-bold text-slate-700">
                Phone (optional)
              </label>
              <input
                id="contact-phone"
                name="phone"
                maxLength={40}
                value={form.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label htmlFor="contact-org" className="text-xs font-bold text-slate-700">
                Organisation (optional)
              </label>
              <input
                id="contact-org"
                name="org_name"
                maxLength={180}
                value={form.org_name || ""}
                onChange={(e) => update("org_name", e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-reason" className="text-xs font-bold text-slate-700">
                Reason for contact *
              </label>
              <select
                id="contact-reason"
                name="partnership_type"
                aria-label="Reason for contact"
                value={form.partnership_type}
                onChange={(e) =>
                  update("partnership_type", e.target.value as ContactFormInput["partnership_type"])
                }
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
              >
                {PARTNERSHIP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-message" className="text-xs font-bold text-slate-700">
                Message *
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={6}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                placeholder="Tell us a little about what you're hoping to discuss…"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {form.message.length}/2000 characters
              </p>
            </div>
          </div>

          {siteKey ? (
            <Turnstile
              siteKey={siteKey}
              onSuccess={(t) => setToken(t)}
              onError={() => setToken("")}
              onExpire={() => setToken("")}
              options={{ theme: "light" }}
            />
          ) : (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
              Spam protection is not configured yet — messages cannot be sent. Please email us
              directly at{" "}
              <a href={`mailto:${info.email}`} className="underline font-semibold">
                {info.email}
              </a>
              .
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500">
              By submitting, you agree to our{" "}
              <a href="/privacy" className="underline hover:text-slate-700">
                Privacy Policy
              </a>
              .
            </p>
            <button
              type="submit"
              disabled={status === "loading" || !siteKey}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-md shadow-sm"
            >
              {status === "loading" ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {status === "loading" ? "Sending…" : "Send message"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
