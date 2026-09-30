import React, { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { reviewCoordinatorRegistration } from "@/lib/intake.functions";

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  region: string | null;
  organisation: string | null;
  role_title: string | null;
  years_experience: number | null;
  languages: string | null;
  aid_types: string[] | null;
  estimated_beneficiaries: number | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export const CoordinatorsManager: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const review = useServerFn(reviewCoordinatorRegistration);

  const load = () => {
    setLoading(true);
    supabase
      .from("coordinator_registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Row[]) || []);
        setLoading(false);
      });
  };
  useEffect(load, []);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("coordinator_registrations").update({ status }).eq("id", id);
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
    await supabase.from("coordinator_registrations").delete().eq("id", id);
    load();
  };


  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Coordinator Registrations</h2>
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
                <th>Country</th>
                <th>Org / role</th>
                <th>Contact</th>
                <th>Aid</th>
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
                    {r.country}
                    {r.region ? `, ${r.region}` : ""}
                  </td>
                  <td>
                    {r.organisation || "—"}
                    <div className="text-xs text-slate-500">{r.role_title}</div>
                  </td>
                  <td>
                    <div>{r.email}</div>
                    <div className="text-xs text-slate-500">{r.phone}</div>
                  </td>
                  <td className="max-w-[180px]">
                    {r.aid_types?.join(", ") || "—"}
                  </td>
                  <td>
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value)}
                      className="text-xs border border-slate-300 rounded px-2 py-1"
                    >
                      <option value="new">New</option>
                      <option value="verifying">Verifying</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
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
