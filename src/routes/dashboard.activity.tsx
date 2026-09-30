import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ProtectedRoute } from "../ported/components/ProtectedRoute";
import { listMyActivity } from "../lib/activity.functions";

type Row = {
  id: string;
  event_type: "cookie_consent_updated" | "email_preferences_updated";
  details: Record<string, any>;
  created_at: string;
};

function summarize(row: Row): string {
  const d = row.details ?? {};
  if (row.event_type === "cookie_consent_updated") {
    const parts = [
      `Necessary: on`,
      `Analytics: ${d.analytics ? "on" : "off"}`,
      `Marketing: ${d.marketing ? "on" : "off"}`,
    ];
    return parts.join(" · ") + (d.source ? ` (${d.source})` : "");
  }
  if (row.event_type === "email_preferences_updated") {
    if (d.unsubscribed_all) return "Unsubscribed from all non-essential emails";
    const p = d.preferences ?? d;
    const on = ["receipts", "events", "coordinators", "fundraisers", "account"]
      .filter((k) => p?.[k])
      .join(", ");
    const off = ["receipts", "events", "coordinators", "fundraisers", "account"]
      .filter((k) => p?.[k] === false)
      .join(", ");
    return `On: ${on || "none"} · Off: ${off || "none"}`;
  }
  return "";
}

function LABEL(t: Row["event_type"]) {
  return t === "cookie_consent_updated" ? "Cookie consent" : "Email preferences";
}

function Page() {
  const load = useServerFn(listMyActivity);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((res: any) => {
        if (!cancelled) setRows((res?.rows ?? []) as Row[]);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load activity");
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="text-sm text-blue-700 hover:underline">
          ← Back to dashboard
        </Link>
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Account activity</h1>
          <p className="mt-2 text-sm text-slate-600">
            A record of changes you've made to your cookie consent and email
            preferences. We keep the most recent 100 events.
          </p>

          <div className="mt-6 overflow-x-auto">
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {!error && rows === null && (
              <p className="text-sm text-slate-500">Loading…</p>
            )}
            {!error && rows && rows.length === 0 && (
              <p className="text-sm text-slate-500">No activity yet.</p>
            )}
            {rows && rows.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4">When</th>
                    <th className="py-2 pr-4">Event</th>
                    <th className="py-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.id} className="align-top">
                      <td className="py-3 pr-4 whitespace-nowrap text-slate-700">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap font-medium text-slate-900">
                        {LABEL(r.event_type)}
                      </td>
                      <td className="py-3 text-slate-600">{summarize(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/activity")({
  head: () => ({
    meta: [
      { title: "Account activity — Manyang Disability Foundation" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <Page />
    </ProtectedRoute>
  ),
});
