import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCookieConsent } from "../ported/hooks/useCookieConsent";

function Page() {
  const { consent, save, acceptAll, rejectAll } = useCookieConsent();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAnalytics(consent?.analytics ?? false);
    setMarketing(consent?.marketing ?? false);
  }, [consent]);

  const onSave = () => {
    save({ analytics, marketing });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-sm text-blue-700 hover:underline">
          ← Back to home
        </Link>
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Cookie settings</h1>
          <p className="mt-2 text-sm text-slate-600">
            Choose which cookie categories you allow. You can change this at any time.
            See our{" "}
            <Link to="/privacy" className="underline hover:text-slate-700">
              Privacy Policy
            </Link>{" "}
            for details.
          </p>

          <div className="mt-6 rounded-xl border border-slate-200 divide-y divide-slate-100">
            <Row
              title="Strictly necessary"
              desc="Auth and session cookies required to sign in and keep pages working. Always on."
              checked
              disabled
            />
            <Row
              title="Analytics"
              desc="Anonymous usage measurement to help us improve the site. Not currently active."
              checked={analytics}
              onChange={setAnalytics}
            />
            <Row
              title="Marketing"
              desc="Used for personalised outreach or ads. Not currently active."
              checked={marketing}
              onChange={setMarketing}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={onSave}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              Save preferences
            </button>
            <button
              onClick={acceptAll}
              className="border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold px-4 py-2 rounded-lg"
            >
              Accept all
            </button>
            <button
              onClick={rejectAll}
              className="border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold px-4 py-2 rounded-lg"
            >
              Reject non-essential
            </button>
            {saved && (
              <span className="self-center text-sm text-emerald-600">Saved ✓</span>
            )}
          </div>

          {consent && (
            <p className="mt-6 text-xs text-slate-500">
              Last updated: {new Date(consent.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 p-4 ${
        disabled ? "opacity-70" : "cursor-pointer"
      }`}
    >
      <span>
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="block text-xs text-slate-600 mt-0.5">{desc}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
      />
    </label>
  );
}

export const Route = createFileRoute("/cookie-settings")({
  head: () => ({
    meta: [
      { title: "Cookie settings — Manyang Disability Foundation" },
      {
        name: "description",
        content:
          "Manage cookie preferences: strictly necessary, analytics, and marketing categories.",
      },
    ],
  }),
  component: Page,
});
