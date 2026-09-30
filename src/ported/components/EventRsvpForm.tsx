import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { submitEventRsvp } from "@/lib/intake.functions";

interface Props {
  eventId: string;
  eventTitle: string;
}

export function EventRsvpForm({ eventId, eventTitle }: Props) {
  const submit = useServerFn(submitEventRsvp);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 flex items-start gap-3">
        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-green-900">RSVP confirmed</h3>
          <p className="text-sm text-green-800 mt-1">
            Thanks, {fullName || "friend"}. We've sent a confirmation to {email}. See you there!
          </p>
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    try {
      await submit({
        data: {
          eventExternalId: eventId,
          eventTitle,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
        },
      });
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900">RSVP for this event</h3>
        <p className="text-sm text-slate-600 mt-1">
          Let us know you're coming and we'll send a confirmation to your inbox.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">Full name *</span>
          <input
            type="text"
            required
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">Email *</span>
          <input
            type="email"
            required
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-semibold text-slate-700">Phone (optional)</span>
        <input
          type="tel"
          maxLength={40}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </label>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-bold px-5 py-2.5 rounded-md transition"
      >
        {status === "submitting" ? "Sending…" : "Confirm RSVP"}
      </button>
    </form>
  );
}
