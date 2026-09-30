import React, { useEffect, useState } from "react";
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  FOCUS_AREA_ICONS,
  normalizeFocusAreas,
  slugifyFocusArea,
  type FocusArea,
} from "../../lib/focusAreas";

export const FocusAreasManager: React.FC = () => {
  const [content, setContent] = useState<Record<string, any>>({});
  const [areas, setAreas] = useState<FocusArea[]>([]);
  const [showOnHome, setShowOnHome] = useState(true);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("page_settings")
      .select("content, published")
      .eq("page_key", "programs")
      .maybeSingle()
      .then(({ data }) => {
        const c = (data?.content as Record<string, any>) || {};
        setContent(c);
        setAreas(normalizeFocusAreas(c.focusAreas));
        setShowOnHome(c.showFocusAreasOnHome !== false);
        setPublished((data as any)?.published !== false);
        setLoading(false);
      });
  }, []);

  const update = (index: number, patch: Partial<FocusArea>) =>
    setAreas((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));

  const move = (index: number, dir: -1 | 1) =>
    setAreas((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = async () => {
    setError(null);
    const cleaned = areas.map((a) => ({
      ...a,
      title: a.title.trim(),
      slug: slugifyFocusArea(a.slug?.trim() || a.title),
      activities: (a.activities || []).map((x) => x.trim()).filter(Boolean),
    }));
    if (cleaned.some((a) => !a.title)) {
      setError("Every program needs a title.");
      return;
    }
    const slugs = cleaned.map((a) => a.slug);
    const dupe = slugs.find((s, i) => slugs.indexOf(s) !== i);
    if (dupe) {
      setError(`Two programs share the same web address ("${dupe}"). Make them unique.`);
      return;
    }
    setSaving(true);
    const merged = { ...content, focusAreas: cleaned, showFocusAreasOnHome: showOnHome };
    const { error: upErr } = await supabase
      .from("page_settings")
      .upsert({ page_key: "programs", content: merged, published } as any, {
        onConflict: "page_key",
      });
    setSaving(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    setContent(merged);
    setAreas(cleaned);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="p-6 text-slate-500">Loading…</div>;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Programs</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Shown on the Programs page, and optionally as a condensed list on the home page.
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

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={showOnHome}
          onChange={(e) => setShowOnHome(e.target.checked)}
          className="rounded border-slate-300"
        />
        Show the condensed list on the home page
      </label>

      <div className="space-y-4">
        {areas.length === 0 && (
          <p className="text-sm text-slate-500">
            No focus areas yet — add your first one below.
          </p>
        )}
        {areas.map((area, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Title</label>
                  <input
                    type="text"
                    value={area.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                    maxLength={160}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Short description (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={area.description ?? ""}
                    onChange={(e) => update(i, { description: e.target.value })}
                    maxLength={400}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Icon</label>
                  <select
                    value={area.icon || "Sparkles"}
                    onChange={(e) => update(i, { icon: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                  >
                    {FOCUS_AREA_ICONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Web address (page link)
                  </label>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-slate-400 shrink-0">/programs/</span>
                    <input
                      type="text"
                      value={area.slug ?? ""}
                      onChange={(e) => update(i, { slug: e.target.value })}
                      placeholder={slugifyFocusArea(area.title || "")}
                      maxLength={80}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Leave blank to build it from the title.
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Overview</label>
                  <textarea
                    rows={4}
                    value={area.overview ?? ""}
                    onChange={(e) => update(i, { overview: e.target.value })}
                    maxLength={3000}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    What we do (one activity per line)
                  </label>
                  <textarea
                    rows={4}
                    value={(area.activities || []).join("\n")}
                    onChange={(e) => update(i, { activities: e.target.value.split("\n") })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Who it benefits</label>
                  <textarea
                    rows={3}
                    value={area.benefits ?? ""}
                    onChange={(e) => update(i, { benefits: e.target.value })}
                    maxLength={1500}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Cover image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={area.image ?? ""}
                    onChange={(e) => update(i, { image: e.target.value })}
                    placeholder="https://…"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="p-1.5 rounded border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === areas.length - 1}
                  aria-label="Move down"
                  className="p-1.5 rounded border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAreas((prev) => prev.filter((_, x) => x !== i))}
                  aria-label="Delete focus area"
                  className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          setAreas((prev) => [...prev, { title: "", description: "", icon: "Sparkles" }])
        }
        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <Plus className="w-4 h-4" /> Add program
      </button>
    </div>
  );
};

export default FocusAreasManager;
