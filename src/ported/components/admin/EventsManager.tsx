import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "./ImageUploader";
import { Plus, Trash2, Edit3, Eye, EyeOff } from "lucide-react";

interface Ev {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: "draft" | "published";
}

const empty = (): Partial<Ev> => ({
  slug: "",
  title: "",
  description: "",
  cover_image: "",
  starts_at: new Date().toISOString().slice(0, 16),
  ends_at: "",
  location: "",
  status: "draft",
});

export const EventsManager: React.FC = () => {
  const [items, setItems] = useState<Ev[]>([]);
  const [editing, setEditing] = useState<Partial<Ev> | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: false });
    setItems((data || []) as Ev[]);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing?.title || !editing?.slug || !editing?.starts_at)
      return alert("Title, slug and start date required");
    const payload: any = { ...editing, ends_at: editing.ends_at || null };
    const { error } = editing.id
      ? await supabase.from("events").update(payload).eq("id", editing.id)
      : await supabase.from("events").insert(payload);
    if (error) return alert(error.message);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    load();
  };

  const togglePublish = async (e: Ev) => {
    await supabase
      .from("events")
      .update({ status: e.status === "published" ? "draft" : "published" })
      .eq("id", e.id);
    load();
  };

  if (editing) {
    return (
      <div className="bg-white rounded-lg border p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold">{editing.id ? "Edit Event" : "New Event"}</h3>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="text-sm px-3 py-1.5">
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
            <label className="text-xs font-semibold">Description</label>
            <textarea
              rows={4}
              value={editing.description || ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Starts at</label>
            <input
              type="datetime-local"
              value={editing.starts_at?.slice(0, 16) || ""}
              onChange={(e) =>
                setEditing({ ...editing, starts_at: new Date(e.target.value).toISOString() })
              }
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Ends at (optional)</label>
            <input
              type="datetime-local"
              value={editing.ends_at?.slice(0, 16) || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold">Location</label>
            <input
              value={editing.location || ""}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploader
              label="Cover image"
              value={editing.cover_image || ""}
              folder="events"
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
        <h3 className="text-lg font-bold">Events</h3>
        <button
          onClick={() => setEditing(empty())}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>
      <div className="bg-white rounded-lg border divide-y">
        {items.map((e) => (
          <div key={e.id} className="p-4 flex items-center gap-3 hover:bg-slate-50">
            {e.cover_image && (
              <img src={e.cover_image} alt="" className="w-16 h-16 object-cover rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{e.title}</p>
              <p className="text-xs text-slate-500">
                {new Date(e.starts_at).toLocaleString()} · {e.location || "—"} · {e.status}
              </p>
            </div>
            <button
              onClick={() => togglePublish(e)}
              className="p-2 text-slate-500 hover:text-blue-600"
            >
              {e.status === "published" ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setEditing(e)}
              className="p-2 text-slate-500 hover:text-blue-600"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={() => remove(e.id)} className="p-2 text-rose-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-500 italic">No events yet.</p>
        )}
      </div>
    </div>
  );
};
