import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import acncTickAsset from "@/assets/acnc-charity-tick.jpg.asset.json";

const Facebook = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.3-1.5 1.6-1.5H17V4.2C16.7 4.1 15.7 4 14.6 4 12.3 4 10.7 5.4 10.7 7.9V10.5H8v3h2.7V21h2.8Z" />
  </svg>
);
const Twitter = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.244 2H21l-6.52 7.45L22 22h-6.84l-5.36-6.99L3.6 22H1l6.97-7.97L1.5 2h7l4.84 6.4L18.244 2Zm-2.4 18h1.86L7.27 4H5.3l10.54 16Z" />
  </svg>
);
const Instagram = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);
const Linkedin = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3-.03-3-1.83-3-1.83 0-2.12 1.43-2.12 2.9V21h-4V9Z" />
  </svg>
);
const Youtube = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M23 7.2s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.2-1C16.5 3.6 12 3.6 12 3.6s-4.5 0-7.9.3c-.5.1-1.4.1-2.2 1C1.2 5.6 1 7.2 1 7.2S.8 9 .8 10.9v1.7C.8 14.5 1 16.4 1 16.4s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.7.3 7.7.3s4.5 0 7.9-.3c.5-.1 1.4-.1 2.2-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.7c0-1.9-.2-3.7-.2-3.7ZM9.7 14.6V8.4l5.8 3.1-5.8 3.1Z" />
  </svg>
);
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { NAV_ITEM_DEFS, resolveNavOrder } from "../lib/navItems";

const PATH_FOR: Record<string, string> = {
  home: "/",
  about: "/about",
  programs: "/programs",
  gallery: "/gallery",
  request: "/request",
  news: "/news",
  "get-involved": "/get-involved",
  donate: "/donate",
};

interface FooterSettings {
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
  };
}

const DEFAULTS: FooterSettings = {
  address: "Sydney, NSW, Australia",
  phone: "+61 400 000 000",
  email: "info@manyangfoundation.org",
  workingHours: "Monday – Friday: 9:00 AM – 5:00 PM (AEST)",
  socials: { facebook: "", twitter: "", instagram: "", linkedin: "", youtube: "", tiktok: "" },
};

// Inline TikTok icon (lucide does not ship one).
const TikTokIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.59a8.32 8.32 0 0 0 4.86 1.56V6.69h-.07Z" />
  </svg>
);

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmailVal] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [s, setS] = useState<FooterSettings>(DEFAULTS);
  const [navLinks, setNavLinks] = useState(
    NAV_ITEM_DEFS.map((d) => ({ id: d.id, label: d.label })),
  );
  const [showDonateButton, setShowDonateButton] = useState(true);

  useEffect(() => {
    supabase
      .from("page_settings")
      .select("content")
      .eq("page_key", "footer")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) setS({ ...DEFAULTS, ...(data.content as any) });
      });
    supabase
      .from("page_settings")
      .select("content")
      .eq("page_key", "navigation")
      .maybeSingle()
      .then(({ data }) => {
        const c = (data?.content as any) || {};
        const order = resolveNavOrder(c.order);
        setNavLinks(
          order
            .map((id) => NAV_ITEM_DEFS.find((d) => d.id === id))
            .filter((d): d is (typeof NAV_ITEM_DEFS)[number] => !!d && c[d.flag] !== false)
            .map((d) => ({ id: d.id, label: d.label })),
        );
      });
    supabase
      .from("page_settings")
      .select("content")
      .eq("page_key", "donate")
      .maybeSingle()
      .then(({ data }) => {
        const c = data?.content as any;
        if (c && c.showDonateButton === false) setShowDonateButton(false);
      });
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmailVal("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const handleLink = (page: string) => {
    navigate({ to: PATH_FOR[page] || "/" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks: { key: string; url: string; Icon: any; label: string }[] = [
    { key: "facebook", url: s.socials.facebook, Icon: Facebook, label: "Facebook" },
    { key: "twitter", url: s.socials.twitter, Icon: Twitter, label: "Twitter" },
    { key: "instagram", url: s.socials.instagram, Icon: Instagram, label: "Instagram" },
    { key: "linkedin", url: s.socials.linkedin, Icon: Linkedin, label: "LinkedIn" },
    { key: "youtube", url: s.socials.youtube, Icon: Youtube, label: "YouTube" },
    { key: "tiktok", url: s.socials.tiktok, Icon: TikTokIcon, label: "TikTok" },
  ].filter((l) => !!l.url);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Can you help restore mobility today?</h3>
            <p className="text-blue-200 text-sm mt-1 max-w-xl">
              Your contribution procures custom wheelchairs, funds rehabilitation, and builds
              inclusive classroom tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {showDonateButton && (
              <button
                onClick={() => handleLink("donate")}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-lg text-sm flex items-center gap-2"
              >
                <Heart className="w-4 h-4 fill-slate-950 text-slate-950" /> Donate Now
              </button>
            )}
            <button
              onClick={() => handleLink("get-involved")}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-3 rounded-lg text-sm"
            >
              Become a Volunteer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Manyang Disability Foundation Logo"
                className="w-12 h-12 object-contain"
                loading="lazy"
              />
              <span className="font-bold text-lg text-white">Manyang Disability Foundation</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Providing the care your family your family deserve.
            </p>
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Connect With Us
                </span>
                <div className="flex gap-3 flex-wrap">
                  {socialLinks.map(({ key, url, Icon, label }) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                      aria-label={label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLink(link.id)}
                    className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-1 transition-transform text-blue-500">
                      ›
                    </span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/csr-sponsorship" className="hover:text-white transition-colors">
                  CSR Sponsorship
                </Link>
              </li>
              <li>
                <Link to="/portal/coordinators" className="hover:text-white transition-colors">
                  Coordinator Portal (East Africa)
                </Link>
              </li>
              <li>
                <Link to="/portal/fundraisers" className="hover:text-white transition-colors">
                  Fundraiser Sign-up (AU)
                </Link>
              </li>
              <li>
                <Link to="/guides/mobility-aid-grants" className="hover:text-white transition-colors">
                  Mobility Aid Grants
                </Link>
              </li>
              <li>
                <Link to="/faq/donations" className="hover:text-white transition-colors">
                  Donation FAQ
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Events Calendar
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact &amp; Partnerships
                </Link>
              </li>
            </ul>
          </div>


          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Headquarters
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{s.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{s.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">{s.email}</span>
              </li>
              <li className="pt-2 text-xs text-slate-500 border-t border-slate-800">
                {s.workingHours}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-1">
            <h5 className="text-sm font-semibold text-white">Subscribe to Impact Updates</h5>
            <p className="text-xs text-slate-400 mt-1">Receive quarterly stories from the field.</p>
          </div>
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-2 max-w-md lg:max-w-none lg:justify-end"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmailVal(e.target.value)}
                placeholder="Enter your email"
                className="bg-slate-800 text-sm text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-hidden focus:border-blue-500 w-full sm:w-72"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg flex items-center justify-center gap-1 shrink-0"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 lg:justify-end">
                <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <a
              href="https://www.acnc.gov.au/charity"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ACNC Registered Charity — verify on the ACNC Charity Register"
              className="shrink-0"
            >
              <img
                src={acncTickAsset.url}
                alt="ACNC Registered Charity Tick — Manyang Disability Foundation"
                width={64}
                height={64}
                loading="lazy"
                className="w-16 h-16"
              />
            </a>
            <div className="space-y-1">
              <p className="text-slate-300">
                <span className="font-semibold text-slate-200">ABN</span>{" "}
                <a
                  href="https://abr.business.gov.au/ABN/View?id=75986228179"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  75 986 228 179
                </a>{" "}
                · verified on the Australian Business Register
              </p>
              <p className="cursor-default">
                © {new Date().getFullYear()} Manyang Disability Foundation. All rights reserved.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-4 flex-wrap">
            <Link to="/privacy" className="hover:text-slate-300">
              Privacy
            </Link>
            <span>•</span>
            <Link to="/cookie-settings" className="hover:text-slate-300">
              Cookie settings
            </Link>
            <span>•</span>
            <button onClick={() => handleLink("about")} className="hover:text-slate-300">
              Governance
            </button>
          </div>

        </div>
      </div>

    </footer>
  );
};
