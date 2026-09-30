import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "./ImageUploader";
import { Plus, Trash2, Edit3, Eye, EyeOff } from "lucide-react";

interface News {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string | null;
  cover_image: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
}

const empty = (): Partial<News> => ({
  slug: "",
  title: "",
  excerpt: "",
  body_md: "",
  cover_image: "",
  status: "draft",
});

export const NewsManager: React.FC<{ focusArticleId?: string | null }> = ({ focusArticleId }) => {
  const [items, setItems] = useState<News[]>([]);
  const [editing, setEditing] = useState<Partial<News> | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("news_articles")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data || []) as News[]);
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!focusArticleId) return;
    const match = items.find((i) => i.id === focusArticleId);
    if (match) setEditing(match);
  }, [focusArticleId, items]);

  const save = async () => {
    if (!editing?.title || !editing?.slug) return alert("Title and slug are required");
    const payload: any = { ...editing };
    if (payload.status === "published" && !payload.published_at)
      payload.published_at = new Date().toISOString();
    const { error } = editing.id
      ? await supabase.from("news_articles").update(payload).eq("id", editing.id)
      : await supabase.from("news_articles").insert(payload);
    if (error) return alert(error.message);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await supabase.from("news_articles").delete().eq("id", id);
    load();
  };

  const togglePublish = async (n: News) => {
    const next = n.status === "published" ? "draft" : "published";
    await supabase
      .from("news_articles")
      .update({
        status: next,
        published_at: next === "published" ? new Date().toISOString() : null,
      })
      .eq("id", n.id);
    load();
  };

  if (editing) {
    return (
      <div className="bg-white rounded-lg border p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold">{editing.id ? "Edit Article" : "New Article"}</h3>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="text-sm text-slate-600 px-3 py-1.5">
              Cancel
            </button>
            <button
              onClick={save}
              className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md"
            >
              Save
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold">Title</label>
            <input
              value={editing.title || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  title: e.target.value,
                  slug:
                    editing.slug ||
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                })
              }
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Slug</label>
            <input
              value={editing.slug || ""}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold">Excerpt</label>
            <textarea
              rows={2}
              value={editing.excerpt || ""}
              onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold">Body (Markdown)</label>
            <textarea
              rows={10}
              value={editing.body_md || ""}
              onChange={(e) => setEditing({ ...editing, body_md: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm font-mono"
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploader
              label="Cover image"
              value={editing.cover_image || ""}
              folder="news"
              onChange={(url) => setEditing({ ...editing, cover_image: url })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Status</label>
            <select
              value={editing.status}
              onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">News Articles</h3>
        <button
          onClick={() => setEditing(empty())}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>
      <div className="bg-white rounded-lg border divide-y">
        {items.map((n) => (
          <div key={n.id} className="p-4 flex items-center gap-3 hover:bg-slate-50">
            {n.cover_image && (
              <img src={n.cover_image} alt="" className="w-16 h-16 object-cover rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{n.title}</p>
              <p className="text-xs text-slate-500">
                /{n.slug} · {n.status === "published" ? "✓ Live" : "Draft"}
              </p>
            </div>
            <button
              onClick={() => togglePublish(n)}
              title="Publish/unpublish"
              className="p-2 text-slate-500 hover:text-blue-600"
            >
              {n.status === "published" ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setEditing(n)}
              className="p-2 text-slate-500 hover:text-blue-600"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={() => remove(n.id)} className="p-2 text-rose-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-500 italic">No articles yet.</p>
        )}
      </div>
    </div>
  );
};
