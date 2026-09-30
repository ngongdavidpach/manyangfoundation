import React, { useEffect, useState } from "react";
import { z } from "zod";
import { Save, FileText, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "./ImageUploader";
import { uploadRawFile } from "../../lib/storage";

interface InsightContent {
  title?: string;
  body?: string;
  cover?: string;
  brochureUrl?: string;
  brochureName?: string;
  videoUrl?: string;
}

const schema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "Title must be 120 characters or fewer")
    .optional()
    .or(z.literal("")),
  body: z
    .string()
    .trim()
    .max(1000, "Intro must be 1000 characters or fewer")
    .optional()
    .or(z.literal("")),
  cover: z.string().optional().or(z.literal("")),
  brochureUrl: z.string().url("Invalid brochure URL").optional().or(z.literal("")),
  videoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export const FoundationInsightManager: React.FC = () => {
  const [home, setHome] = useState<any>({});
  const [insight, setInsight] = useState<InsightContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("page_settings")
      .select("content")
      .eq("page_key", "home")
      .maybeSingle()
      .then(({ data }) => {
        const content = (data?.content as any) || {};
        setHome(content);
        setInsight(content.insight || {});
        setLoading(false);
      });
  }, []);

  const update = (patch: Partial<InsightContent>) => setInsight((p) => ({ ...p, ...patch }));

  const handlePdf = async (file: File) => {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("PDF must be 10 MB or smaller.");
      return;
    }
    setUploadingPdf(true);
    try {
      const res = await uploadRawFile(file, "pages/home/brochures");
      update({ brochureUrl: res.url, brochureName: res.name });
    } catch (e: any) {
      setError(e?.message || "Brochure upload failed");
    } finally {
      setUploadingPdf(false);
    }
  };

  const save = async () => {
    setError(null);
    const parsed = schema.safeParse(insight);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const merged = { ...home, insight, showInsight: true };
    const { error: upErr } = await supabase
      .from("page_settings")
      .upsert({ page_key: "home", content: merged }, { onConflict: "page_key" });
    setSaving(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    setHome(merged);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="p-6 text-slate-500">Loading…</div>;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Foundation Insight</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Featured on the home page: a brief introduction with optional brochure and intro video.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      {error && (
        <div className="text-sm bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600">Title</label>
        <input
          type="text"
          value={insight.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="About Our Foundation"
          maxLength={120}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600">Brief introduction</label>
        <textarea
          rows={5}
          value={insight.body ?? ""}
          onChange={(e) => update({ body: e.target.value })}
          maxLength={1000}
          placeholder="A short paragraph telling visitors who you are and what you do…"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
        />
        <p className="text-[11px] text-slate-400 text-right">{(insight.body ?? "").length}/1000</p>
      </div>

      <ImageUploader
        label="Cover image"
        value={insight.cover}
        folder="pages/home"
        onChange={(url) => update({ cover: url })}
      />

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-600">
          Brochure (PDF, max 10 MB)
        </label>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            {insight.brochureUrl ? (
              <a
                href={insight.brochureUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline block truncate"
              >
                {insight.brochureName || "View current brochure"}
              </a>
            ) : (
              <p className="text-xs text-slate-500">No brochure uploaded yet.</p>
            )}
            <input
              type="file"
              accept="application/pdf"
              disabled={uploadingPdf}
              onChange={(e) => e.target.files?.[0] && handlePdf(e.target.files[0])}
              className="block text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:text-xs file:font-medium hover:file:bg-blue-700"
            />
            {uploadingPdf && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Upload className="w-3 h-3 animate-pulse" /> Uploading…
              </p>
            )}
            {insight.brochureUrl && (
              <button
                onClick={() => update({ brochureUrl: "", brochureName: "" })}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove brochure
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600">
          Intro video URL (YouTube or Vimeo)
        </label>
        <input
          type="url"
          value={insight.videoUrl ?? ""}
          onChange={(e) => update({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=…"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
        />
        <p className="text-[11px] text-slate-400">
          Paste a YouTube or Vimeo link — we'll embed it on the home page.
        </p>
      </div>
    </div>
  );
};

export default FoundationInsightManager;
