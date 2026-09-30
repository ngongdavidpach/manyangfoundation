import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type Status = "checking" | "ready" | "invalid" | "already" | "done" | "error";

function UnsubscribePage() {
  const [status, setStatus] = useState<Status>("checking");
  const [token, setToken] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token") || "";
    setToken(t);
    if (!t) {
      setStatus("invalid");
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) setStatus("ready");
        else if (d.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      })
      .catch(() => setStatus("error"));
  }, []);

  const confirm = async () => {
    setStatus("checking");
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const d = await res.json();
      if (d.success) setStatus("done");
      else if (d.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Email preferences</h1>
        {status === "checking" && (
          <p className="mt-3 text-sm text-slate-600">Checking your link…</p>
        )}
        {status === "ready" && (
          <>
            <p className="mt-3 text-sm text-slate-600">
              Unsubscribe from Manyang Disability Foundation emails?
            </p>
            <button
              onClick={confirm}
              className="mt-5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-lg text-sm"
            >
              Confirm unsubscribe
            </button>
            <p className="mt-4 text-xs text-slate-500">
              Prefer to keep some emails?{" "}
              <a
                href={`/email/preferences?token=${encodeURIComponent(token)}`}
                className="text-blue-700 hover:underline"
              >
                Manage individual preferences
              </a>
              .
            </p>
          </>
        )}
        {status === "done" && (
          <p className="mt-3 text-sm text-emerald-600">
            You've been unsubscribed. We're sorry to see you go.
          </p>
        )}
        {status === "already" && (
          <p className="mt-3 text-sm text-slate-600">
            This address is already unsubscribed.
          </p>
        )}
        {status === "invalid" && (
          <p className="mt-3 text-sm text-rose-600">This unsubscribe link is invalid or expired.</p>
        )}
        {status === "error" && (
          <p className="mt-3 text-sm text-rose-600">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Unsubscribe — Manyang Disability Foundation" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnsubscribePage,
});
