import React, { useState } from "react";
import {
  Mail,
  ShieldCheck,
  AlertTriangle,
  Send,
  User,
  CheckCircle2,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactMessage } from "@/lib/intake.functions";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Volunteer Opportunity",
  "Donation Question",
  "Partnership",
  "Media / Press",
  "Other",
];

export const LoginView: React.FC = () => {
  const sendContactMessage = useServerFn(submitContactMessage);
  const [msg, setMsg] = useState({
    name: "",
    email: "",
    subject: SUBJECT_OPTIONS[0],
    message: "",
  });
  const [msgError, setMsgError] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgError("");

    const name = msg.name.trim();
    const email = msg.email.trim();
    const subject = msg.subject.trim();
    const message = msg.message.trim();

    if (!name || !email || !subject || !message) {
      setMsgError("Please fill in all fields.");
      return;
    }
    if (name.length > 100) {
      setMsgError("Name must be less than 100 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      setMsgError("Please enter a valid email address.");
      return;
    }
    if (message.length > 2000) {
      setMsgError("Message must be less than 2000 characters.");
      return;
    }

    setMsgSending(true);
    try {
      await sendContactMessage({ data: { name, email, subject, message } });
    } catch (err) {
      setMsgSending(false);
      const message =
        err instanceof Error ? err.message : "Could not send your message. Please try again later.";
      setMsgError(message);
      return;
    }
    setMsgSending(false);
    setMsgSent(true);
    setMsg({ name: "", email: "", subject: SUBJECT_OPTIONS[0], message: "" });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left: Brand panel */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="MDF Logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Manyang Disability Foundation
              </h1>
              <p className="text-xs text-blue-600 font-medium">We're here to help</p>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Get in touch. <br />
            <span className="text-blue-600">We read every message.</span>
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed max-w-md">
            Whether you'd like to volunteer, partner with us, ask about a donation, or share your
            story — send us a message and our team will get back to you within 1–2 business days.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Your information is handled securely and privately</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Foundation staff respond personally to every inquiry</span>
            </div>
          </div>
        </div>

        {/* Right: Contact form panel */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src="/images/logo.png" alt="MDF Logo" className="w-12 h-12 object-contain" />
            <h1 className="text-lg font-bold text-slate-900">Manyang Disability Foundation</h1>
          </div>

          <h3 className="text-2xl font-bold text-slate-900">Send us a message</h3>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the form below and we'll get back to you shortly.
          </p>

          {msgSent ? (
            <div className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-emerald-900">Message sent!</h4>
              <p className="text-xs text-emerald-700 mt-1">
                Thank you for reaching out. Our team will respond within 1–2 business days.
              </p>
              <button
                type="button"
                onClick={() => setMsgSent(false)}
                className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4 mt-6">
              {msgError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{msgError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={msg.name}
                    onChange={(e) => setMsg({ ...msg, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    maxLength={255}
                    value={msg.email}
                    onChange={(e) => setMsg({ ...msg, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
                <select
                  value={msg.subject}
                  onChange={(e) => setMsg({ ...msg, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Message{" "}
                  <span className="text-slate-400 font-normal">
                    ({msg.message.length}/2000)
                  </span>
                </label>
                <textarea
                  required
                  maxLength={2000}
                  rows={5}
                  value={msg.message}
                  onChange={(e) => setMsg({ ...msg, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={msgSending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {msgSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
