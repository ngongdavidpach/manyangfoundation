import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { cancelAccountDeletionByToken, RATE_LIMIT_MESSAGE } from "@/lib/auth.functions";

export const Route = createFileRoute("/auth/cancel-deletion")({
  head: () => ({
    meta: [
      { title: "Cancel Account Deletion — Manyang Disability Foundation" },
      { name: "description", content: "Cancel a pending MDF account deletion request." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: CancelDeletionRoute,
});

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "error"; message: string };

function CancelDeletionRoute() {
  const { token } = Route.useSearch();
  const cancelFn = useServerFn(cancelAccountDeletionByToken);
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    if (!token) {
      setState({
        kind: "error",
        message: "This cancellation link is missing its token.",
      });
      return;
    }
    let alive = true;
    (async () => {
      setState({ kind: "loading" });
      let result: Awaited<ReturnType<typeof cancelFn>>;
      try {
        result = await cancelFn({ data: { token } });
      } catch {
        if (alive) setState({ kind: "error", message: "Could not process the request. Please try again." });
        return;
      }
      if (!alive) return;
      if (result.ok) {
        setState({ kind: "success" });
        return;
      }
      switch (result.reason) {
        case "invalid":
          setState({ kind: "error", message: "This cancellation link is invalid." });
          break;
        case "already_used":
          setState({
            kind: "error",
            message: "This link has already been used to cancel your deletion.",
          });
          break;
        case "expired":
          setState({
            kind: "error",
            message: "The grace period has ended — this account has already been purged.",
          });
          break;
        case "not_pending":
          setState({
            kind: "error",
            message: "There is no pending deletion request for this account.",
          });
          break;
        case "rate_limited":
          setState({ kind: "error", message: result.message || RATE_LIMIT_MESSAGE });
          break;
        default:
          setState({
            kind: "error",
            message: ("message" in result && result.message) || "Could not cancel the deletion.",
          });
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, cancelFn]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Cancel account deletion</h1>
            <p className="text-xs text-slate-500">Keep your MDF account active.</p>
          </div>
        </div>

        {state.kind === "loading" || state.kind === "idle" ? (
          <div className="flex items-center justify-center py-8 gap-2 text-slate-500 text-xs">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
            <span>Cancelling deletion…</span>
          </div>
        ) : null}

        {state.kind === "success" && (
          <div className="space-y-4">
            <div
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-start gap-2"
              role="status"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Your account deletion has been cancelled. You can sign in again with your
                existing password.
              </span>
            </div>
            <Link
              to="/admin"
              className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition-colors"
            >
              Go to sign in
            </Link>
          </div>
        )}

        {state.kind === "error" && (
          <div className="space-y-4">
            <div
              className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2"
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{state.message}</span>
            </div>
            <Link
              to="/contact"
              className="block text-center text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contact support
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
