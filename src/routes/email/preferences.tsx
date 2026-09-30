import { createFileRoute } from "@tanstack/react-router";
import { EmailPreferencesPanel } from "../../ported/components/EmailPreferencesPanel";

function TokenPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Email preferences</h1>
          <p className="mt-2 text-sm text-slate-600">
            Choose which emails you'd like to receive from Manyang Disability Foundation.
            Account-security emails (sign-in, password reset, invites) cannot be turned off
            while your account exists.
          </p>
          <div className="mt-6">
            <EmailPreferencesPanel mode="token" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/email/preferences")({
  head: () => ({
    meta: [
      { title: "Email preferences — Manyang Disability Foundation" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TokenPage,
});
