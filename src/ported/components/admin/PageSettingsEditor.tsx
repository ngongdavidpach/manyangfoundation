import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "./ImageUploader";
import { Save } from "lucide-react";

const SEO_FIELDS = [
  { path: "seo.title", label: "SEO title (browser tab + search result)", type: "text" },
  { path: "seo.description", label: "SEO description (search result snippet)", type: "textarea" },
  { path: "seo.ogImage", label: "Social share image (og:image)", type: "image" },
  { path: "seo.noindex", label: "Hide this page from search engines (noindex)", type: "bool" },
];

const PAGES_RAW = [
  {
    key: "home",
    label: "Home Page",
    fields: [
      { path: "hero.title", label: "Hero title", type: "text" },
      { path: "hero.subtitle", label: "Hero subtitle", type: "textarea" },
      { path: "hero.image", label: "Hero image", type: "image" },
      { path: "hero.ctaPrimary", label: "Primary CTA label", type: "text" },
      { path: "intro.heading", label: "Intro heading", type: "text" },
      { path: "intro.body", label: "Intro body", type: "textarea" },
      { path: "insight.title", label: "Foundation insight title", type: "text" },
      { path: "insight.body", label: "Foundation insight body", type: "textarea" },
      { path: "insight.cover", label: "Foundation insight cover image", type: "image" },
      { path: "insight.brochureUrl", label: "Foundation brochure URL (optional)", type: "text" },
      { path: "showInsight", label: "Show foundation insight section", type: "bool" },
      { path: "showStats", label: "Show stats section", type: "bool" },
      { path: "showPrograms", label: "Show programs section", type: "bool" },
    ],
    seo: true,
  },
  {
    key: "about",
    label: "About",
    fields: [
      { path: "heading", label: "Heading", type: "text" },
      { path: "intro", label: "Intro", type: "textarea" },
      { path: "showStaff", label: "Show staff grid", type: "bool" },
      { path: "structuredData.orgName", label: "Structured data · Organization name", type: "text" },
      { path: "structuredData.orgUrl", label: "Structured data · Organization URL", type: "text" },
      { path: "structuredData.orgLogo", label: "Structured data · Organization logo URL", type: "text" },
      { path: "structuredData.orgDescription", label: "Structured data · Organization description", type: "textarea" },
      { path: "structuredData.orgSameAs", label: "Structured data · sameAs URLs (one per line or comma-separated)", type: "textarea" },
    ],
    seo: true,
  },
  {
    key: "programs",
    label: "Programs",
    fields: [
      { path: "heading", label: "Heading", type: "text" },
      { path: "intro", label: "Intro", type: "textarea" },
      { path: "structuredData.name", label: "Structured data · Page name", type: "text" },
      { path: "structuredData.description", label: "Structured data · Description", type: "textarea" },
      { path: "structuredData.url", label: "Structured data · Canonical URL", type: "text" },
      { path: "structuredData.topics", label: "Structured data · Topics (comma-separated)", type: "textarea" },
    ],
    seo: true,
  },
  {
    key: "gallery",
    label: "Gallery",
    fields: [
      { path: "heading", label: "Heading", type: "text" },
      { path: "intro", label: "Intro", type: "textarea" },
    ],
    seo: true,
  },
  {
    key: "news",
    label: "News",
    fields: [
      { path: "heading", label: "Heading", type: "text" },
      { path: "intro", label: "Intro", type: "textarea" },
    ],
    seo: true,
  },
  {
    key: "events",
    label: "Events",
    fields: [
      { path: "heading", label: "Heading", type: "text" },
      { path: "intro", label: "Intro", type: "textarea" },
    ],
    seo: false,
  },
  {
    key: "get-involved",
    label: "Get Involved",
    fields: [
      { path: "heading", label: "Heading", type: "text" },
      { path: "intro", label: "Intro", type: "textarea" },
    ],
    seo: true,
  },
  {
    key: "donate",
    label: "Donate",
    fields: [
      { path: "heading", label: "Heading", type: "text" },
      { path: "intro", label: "Intro", type: "textarea" },
      { path: "paymentDetails.bankName", label: "Bank name", type: "text" },
      { path: "paymentDetails.accountName", label: "Account name", type: "text" },
      { path: "paymentDetails.bsb", label: "BSB", type: "text" },
      { path: "paymentDetails.accountNumber", label: "Account number", type: "text" },
      { path: "paymentDetails.payId", label: "PayID", type: "text" },
      { path: "showDonateButton", label: "Show Donate Now button (header & footer)", type: "bool" },
    ],
    seo: true,
  },
  {
    key: "request",
    label: "Request",
    fields: [
      { path: "heading", label: "Heading", type: "text" },
      { path: "intro", label: "Intro", type: "textarea" },
    ],
    seo: false,
  },
  {
    key: "footer",
    label: "Footer & Contact",
    fields: [
      { path: "address", label: "Address", type: "text" },
      { path: "phone", label: "Phone", type: "text" },
      { path: "email", label: "Email", type: "text" },
      { path: "workingHours", label: "Working hours", type: "text" },
      { path: "socials.facebook", label: "Facebook URL", type: "text" },
      { path: "socials.twitter", label: "Twitter / X URL", type: "text" },
      { path: "socials.instagram", label: "Instagram URL", type: "text" },
      { path: "socials.linkedin", label: "LinkedIn URL", type: "text" },
      { path: "socials.youtube", label: "YouTube URL", type: "text" },
      { path: "socials.tiktok", label: "TikTok URL", type: "text" },
    ],
    seo: false,
  },
  // Navigation visibility & order live in Settings tab → Navigation pages.
  {
    key: "site",
    label: "Site / Security",
    fields: [
      { path: "name", label: "Site name", type: "text" },
      { path: "tagline", label: "Tagline", type: "text" },
    ],
    seo: false,
  },
];

const PAGES = PAGES_RAW.map((p) => ({
  ...p,
  fields: p.seo ? [...p.fields, ...SEO_FIELDS] : p.fields,
}));

function get(obj: any, path: string) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}
function set(obj: any, path: string, value: any) {
  const out = { ...obj };
  const keys = path.split(".");
  let cur = out;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] ?? {}) };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return out;
}

export const PageSettingsEditor: React.FC = () => {
  const [activeKey, setActiveKey] = useState(PAGES[0].key);
  const [content, setContent] = useState<any>({});
  const [published, setPublished] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const active = PAGES.find((p) => p.key === activeKey)!;

  useEffect(() => {
    supabase
      .from("page_settings")
      .select("content, published")
      .eq("page_key", activeKey)
      .maybeSingle()
      .then(({ data }) => {
        setContent(data?.content || {});
        // Default new (not-yet-saved) pages to Published so admins don't have to flip a switch
        setPublished(data ? !!(data as any).published : true);
      });
  }, [activeKey]);


  const save = async () => {
    setSaving(true);
    await supabase
      .from("page_settings")
      .upsert(
        { page_key: activeKey, content, published } as any,
        { onConflict: "page_key" },
      );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const togglePublished = async (next: boolean) => {
    setPublished(next);
    await supabase
      .from("page_settings")
      .upsert(
        { page_key: activeKey, content, published: next } as any,
        { onConflict: "page_key" },
      );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
      <aside className="space-y-1">
        <h3 className="text-xs font-semibold uppercase text-slate-500 mb-2 px-2">Pages</h3>
        {PAGES.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveKey(p.key)}
            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
              activeKey === p.key ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </aside>
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">{active.label}</h3>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                published
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {published ? "● Live" : "● Draft"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => togglePublished(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Published (visible to public)</span>
            </label>
            <button
              onClick={save}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active.fields.map((f) => {
            const v = get(content, f.path);
            if (f.type === "image") {
              return (
                <div key={f.path} className="md:col-span-2">
                  <ImageUploader
                    label={f.label}
                    value={v}
                    folder={`pages/${activeKey}`}
                    onChange={(url) => setContent(set(content, f.path, url))}
                  />
                </div>
              );
            }
            if (f.type === "bool") {
              return (
                <label key={f.path} className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    checked={!!v}
                    onChange={(e) => setContent(set(content, f.path, e.target.checked))}
                  />
                  <span className="text-sm text-slate-700">{f.label}</span>
                </label>
              );
            }
            if (f.type === "textarea") {
              return (
                <div key={f.path} className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">{f.label}</label>
                  <textarea
                    rows={3}
                    value={v ?? ""}
                    onChange={(e) => setContent(set(content, f.path, e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              );
            }
            return (
              <div key={f.path} className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">{f.label}</label>
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={v ?? ""}
                  onChange={(e) =>
                    setContent(
                      set(
                        content,
                        f.path,
                        f.type === "number" ? Number(e.target.value) : e.target.value,
                      ),
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
