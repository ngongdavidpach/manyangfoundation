import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, AlertTriangle } from "lucide-react";

// Local typed wrapper for the beta `supabase.auth.oauth` namespace.
type AuthorizationDetails = {
  client?: { name?: string; redirect_uris?: string[] } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
  scope?: string | null;
  scopes?: string[] | null;
};
type OAuthResult<T = AuthorizationDetails> = {
  data: T | null;
  error: { message: string } | null;
};
type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
const authOAuth = (): OAuthNs =>
  (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

function isSameOriginPath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//");
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/admin", search: { redirect: next } as never });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await authOAuth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center bg-white p-8 rounded-2xl border border-red-200">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <h1 className="font-bold text-slate-900">Could not load this authorization request</h1>
        <p className="text-sm text-slate-600 mt-2">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "an external app";
  const scopeList: string[] =
    details?.scopes ?? (details?.scope ? String(details.scope).split(/\s+/).filter(Boolean) : []);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await authOAuth().approveAuthorization(authorization_id)
      : await authOAuth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    if (isSameOriginPath(target)) {
      window.location.assign(target);
    } else {
      window.location.href = target;
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Connect {clientName} to Manyang Disability Foundation
            </h1>
            <p className="text-xs text-slate-500">
              This lets {clientName} use this app as you.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-700 space-y-2">
          <p>
            {clientName} will be able to call this app's enabled tools while you are signed in.
            App permissions and backend policies still decide what data is accessible.
          </p>
          {scopeList.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              {scopeList.map((s) => (
                <li key={s}>
                  {s === "openid" || s === "profile"
                    ? "Share your basic profile"
                    : s === "email"
                      ? "Share your email address"
                      : `Additional permission requested: ${s}`}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            {busy ? "Working…" : "Approve"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            Cancel connection
          </button>
        </div>
      </div>
    </main>
  );
}
