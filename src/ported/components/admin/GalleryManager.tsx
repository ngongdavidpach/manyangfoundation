import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Copy, Check } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

interface MediaAsset {
  id: string;
  storage_path: string;
  url: string;
  alt: string;
  tags: string[];
  created_at: string;
}

export const GalleryManager: React.FC<{ onPick?: (url: string) => void }> = ({ onPick }) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [filter, setFilter] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });
    setAssets((data || []) as MediaAsset[]);
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (a: MediaAsset) => {
    if (!confirm("Delete this image?")) return;
    await supabase.storage.from("site-images").remove([a.storage_path]);
    await supabase.from("media_assets").delete().eq("id", a.id);
    load();
  };

  const updateAlt = async (id: string, alt: string) => {
    await supabase.from("media_assets").update({ alt }).eq("id", id);
    setAssets((a) => a.map((x) => (x.id === id ? { ...x, alt } : x)));
  };

  const visible = assets.filter(
    (a) =>
      !filter ||
      a.alt.toLowerCase().includes(filter.toLowerCase()) ||
      a.tags.some((t) => t.includes(filter.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="text-lg font-bold text-slate-900">Media Library</h3>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by alt or tag…"
          className="ml-auto px-3 py-1.5 border border-slate-300 rounded-md text-sm"
        />
      </div>
      <ImageUploader
        onChange={() => load()}
        label="Upload new image (auto-resized to 1920px WebP)"
        folder="gallery"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map((a) => (
          <div key={a.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              className="block w-full aspect-square bg-slate-100"
              onClick={() => onPick?.(a.url)}
            >
              <img src={a.url} alt={a.alt} loading="lazy" className="w-full h-full object-cover" />
            </button>
            <div className="p-2 space-y-1">
              <input
                defaultValue={a.alt}
                onBlur={(e) => updateAlt(a.id, e.target.value)}
                placeholder="Alt text"
                className="w-full text-xs border-b border-slate-200 px-1 py-0.5 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-between items-center">
                <button
                  className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(a.url);
                    setCopied(a.id);
                    setTimeout(() => setCopied(null), 1500);
                  }}
                >
                  {copied === a.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === a.id ? "Copied" : "URL"}
                </button>
                <button
                  className="text-xs text-rose-600 hover:text-rose-700"
                  onClick={() => remove(a)}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="col-span-full text-sm text-slate-500 italic">
            No images yet. Upload one above.
          </p>
        )}
      </div>
    </div>
  );
};
