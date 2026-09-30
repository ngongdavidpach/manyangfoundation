import React, { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { reviewFundraiserRegistration } from "@/lib/intake.functions";

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  state: string;
  city: string | null;
  postcode: string | null;
  event_type: string | null;
  event_date: string | null;
  event_id: string | null;
  expected_participants: number | null;
  fundraising_goal_cents: number | null;
  prior_experience: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

export const FundraisersManager: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [eventTitles, setEventTitles] = useState<Record<string, string>>({});
  const review = useServerFn(reviewFundraiserRegistration);

  const load = () => {
    setLoading(true);
    supabase
      .from("fundraiser_registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const list = (data as unknown as Row[]) || [];
        setRows(list);
        const ids = Array.from(
          new Set(list.map((r) => r.event_id).filter(Boolean) as string[]),
        );
        if (ids.length) {
          const { data: evs } = await supabase
            .from("events")
            .select("id, title")
            .in("id", ids);
          const map: Record<string, string> = {};
          (evs || []).forEach((e: any) => (map[e.id] = e.title));
          setEventTitles(map);
        } else {
          setEventTitles({});
        }
        setLoading(false);
      });
  };
  useEffect(load, []);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("fundraiser_registrations").update({ status }).eq("id", id);
    load();
  };
  const decide = async (id: string, decision: "approve" | "decline") => {
    setPending(id);
    try {
      await review({ data: { id, decision } });
      load();
    } catch (e: any) {
      alert(e?.message || "Action failed");
    } finally {
      setPending(null);
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this registration?")) return;
    await supabase.from("fundraiser_registrations").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Fundraiser Registrations</h2>
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">No registrations yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-700 border-b border-slate-200">
                <th className="py-2">Submitted</th>
                <th>Name</th>
                <th>Location</th>
                <th>Event</th>
                <th>Goal (AUD)</th>
                <th>Contact</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 whitespace-nowrap text-slate-600">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td>{r.full_name}</td>
                  <td>
                    {r.state}
                    {r.city ? `, ${r.city}` : ""}
                    {r.postcode ? ` ${r.postcode}` : ""}
                  </td>
                  <td className="max-w-[200px]">
                    {r.event_type || "—"}
                    <div className="text-xs text-slate-500">{r.event_date || ""}</div>
                    {r.event_id && eventTitles[r.event_id] && (
                      <div className="text-xs text-indigo-600 mt-0.5">
                        ↳ {eventTitles[r.event_id]}
                      </div>
                    )}
                  </td>
                  <td>
                    {r.fundraising_goal_cents
                      ? `$${(r.fundraising_goal_cents / 100).toLocaleString()}`
                      : "—"}
                  </td>
                  <td>
                    <div>{r.email}</div>
                    <div className="text-xs text-slate-500">{r.phone}</div>
                  </td>
                  <td>
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value)}
                      className="text-xs border border-slate-300 rounded px-2 py-1"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <button
                      onClick={() => decide(r.id, "approve")}
                      disabled={pending === r.id || r.status === "approved"}
                      className="text-emerald-700 text-xs hover:underline mr-3 disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => decide(r.id, "decline")}
                      disabled={pending === r.id || r.status === "declined"}
                      className="text-amber-700 text-xs hover:underline mr-3 disabled:opacity-40"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="text-rose-600 text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
