import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "./ImageUploader";
import { Plus, Trash2, Edit3 } from "lucide-react";

interface Staff {
  id: string;
  full_name: string;
  role_title: string;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  sort_order: number;
  is_active: boolean;
}

const empty = (): Partial<Staff> => ({
  full_name: "",
  role_title: "",
  bio: "",
  photo_url: "",
  email: "",
  sort_order: 0,
  is_active: true,
});

export const StaffManager: React.FC = () => {
  const [items, setItems] = useState<Staff[]>([]);
  const [editing, setEditing] = useState<Partial<Staff> | null>(null);

  const load = async () => {
    const { data } = await supabase.from("staff_members").select("*").order("sort_order");
    setItems((data || []) as Staff[]);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing?.full_name || !editing?.role_title) return alert("Name and role required");
    const payload: any = { ...editing };
    const { error } = editing.id
      ? await supabase.from("staff_members").update(payload).eq("id", editing.id)
      : await supabase.from("staff_members").insert(payload);
    if (error) return alert(error.message);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this staff member?")) return;
    await supabase.from("staff_members").delete().eq("id", id);
    load();
  };

  if (editing) {
    return (
      <div className="bg-white rounded-lg border p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold">{editing.id ? "Edit Staff" : "New Staff Member"}</h3>
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
            <label className="text-xs font-semibold">Full name</label>
            <input
              value={editing.full_name || ""}
              onChange={(e) => setEditing({ ...editing, full_name: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Role / Title</label>
            <input
              value={editing.role_title || ""}
              onChange={(e) => setEditing({ ...editing, role_title: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold">Bio</label>
            <textarea
              rows={3}
              value={editing.bio || ""}
              onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Email (optional)</label>
            <input
              value={editing.email || ""}
              onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Sort order</label>
            <input
              type="number"
              value={editing.sort_order ?? 0}
              onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploader
              label="Profile photo"
              value={editing.photo_url || ""}
              folder="staff"
              onChange={(url) => setEditing({ ...editing, photo_url: url })}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editing.is_active ?? true}
              onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
            />
            <span className="text-sm">Active (visible on About page)</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Staff Members</h3>
        <button
          onClick={() => setEditing(empty())}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Staff
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((s) => (
          <div key={s.id} className="bg-white rounded-lg border p-4 flex gap-3">
            {s.photo_url ? (
              <img
                src={s.photo_url}
                alt={s.full_name}
                className="w-16 h-16 object-cover rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-xs">
                No photo
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{s.full_name}</p>
              <p className="text-xs text-blue-600">{s.role_title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {s.is_active ? "Active" : "Hidden"} · order {s.sort_order}
              </p>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => setEditing(s)}
                  className="p-1 text-slate-500 hover:text-blue-600"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(s.id)} className="p-1 text-rose-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="col-span-full p-6 text-center text-sm text-slate-500 italic">
            No staff yet.
          </p>
        )}
      </div>
    </div>
  );
};
