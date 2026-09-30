import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];

const STAGES = ["lead", "qualified", "engaged", "donor", "lapsed"] as const;
const STAGE_LABEL: Record<(typeof STAGES)[number], string> = {
  lead: "Lead",
  qualified: "Qualified",
  engaged: "Engaged",
  donor: "Donor",
  lapsed: "Lapsed",
};

export const PipelineView: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const load = () =>
    supabase
      .from("contacts")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setContacts(data || []));
  useEffect(() => {
    load();
  }, []);

  const move = async (id: string, stage: (typeof STAGES)[number]) => {
    await supabase.from("contacts").update({ lifecycle_stage: stage }).eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Donor Pipeline</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {STAGES.map((stage) => {
          const items = contacts.filter((c) => c.lifecycle_stage === stage);
          return (
            <div
              key={stage}
              className="bg-slate-100 rounded-lg p-3 min-h-[200px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/plain");
                if (id) move(id, stage);
              }}
            >
              <h3 className="font-semibold text-sm text-slate-700 mb-2 flex items-center justify-between">
                {STAGE_LABEL[stage]} <span className="text-xs text-slate-500">{items.length}</span>
              </h3>
              <div className="space-y-2">
                {items.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                    className="bg-white border rounded p-2 text-sm cursor-move"
                  >
                    <p className="font-medium">{c.full_name}</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {c.type}
                      {c.organization ? ` · ${c.organization}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
