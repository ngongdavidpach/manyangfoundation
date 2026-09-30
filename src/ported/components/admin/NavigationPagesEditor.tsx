import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, GripVertical, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { NAV_ITEM_DEFS, resolveNavOrder } from "../../lib/navItems";

const DEFAULT_ORDER = NAV_ITEM_DEFS.map((i) => i.id);

export const NavigationPagesEditor: React.FC = () => {
  const [content, setContent] = useState<any>({});
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("page_settings")
      .select("content")
      .eq("page_key", "navigation")
      .maybeSingle()
      .then(({ data }) => {
        const c = (data?.content as any) || {};
        setContent(c);
        setOrder(resolveNavOrder(c.order));
      });
  }, []);

  const isVisible = (flag: string) => content[flag] !== false; // default ON

  const toggle = (flag: string) =>
    setContent((c: any) => ({ ...c, [flag]: c[flag] === false ? true : false }));

  const move = (id: string, delta: number) => {
    setOrder((o) => {
      const i = o.indexOf(id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= o.length) return o;
      const next = [...o];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    setOrder((o) => {
      const next = o.filter((x) => x !== dragId);
      const idx = next.indexOf(targetId);
      next.splice(idx, 0, dragId);
      return next;
    });
    setDragId(null);
  };

  const save = async () => {
    setSaving(true);
    await supabase
      .from("page_settings")
      .upsert(
        { page_key: "navigation", content: { ...content, order } },
        { onConflict: "page_key" },
      );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Navigation pages</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag to reorder, or hide pages from the public navbar.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>
      <ul className="space-y-2">
        {order.map((id, idx) => {
          const def = NAV_ITEM_DEFS.find((d) => d.id === id);
          if (!def) return null;
          const visible = isVisible(def.flag);
          return (
            <li
              key={id}
              draggable
              onDragStart={() => setDragId(id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(id)}
              className={`flex items-center gap-3 p-3 rounded-md border ${
                dragId === id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
              <span className="text-xs text-slate-400 w-5">{idx + 1}.</span>
              <span className="flex-1 text-sm font-medium text-slate-800">{def.label}</span>
              <button
                onClick={() => move(id, -1)}
                disabled={idx === 0}
                className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => move(id, 1)}
                disabled={idx === order.length - 1}
                className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggle(def.flag)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded ${
                  visible ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                }`}
              >
                {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {visible ? "Visible" : "Hidden"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
