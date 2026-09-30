import React, { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAdminAccessLog, type AccessLogEntry } from "@/lib/adminAccessLog.functions";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const AccessLogViewer: React.FC = () => {
  const fetcher = useServerFn(listAdminAccessLog);
  const [rows, setRows] = useState<AccessLogEntry[] | null>(null);
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await fetcher();
      setRows(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load access log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Admin Access Log</h3>
          <p className="text-xs text-slate-500">
            Recent forbidden admin access attempts (last 100). Best-effort audit trail — never
            includes tokens or request bodies.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>
      {err && (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {err}
        </div>
      )}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">When</th>
              <th className="text-left px-3 py-2 font-semibold">User</th>
              <th className="text-left px-3 py-2 font-semibold">Endpoint</th>
              <th className="text-left px-3 py-2 font-semibold">Reason</th>
              <th className="text-left px-3 py-2 font-semibold">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500 italic">
                  No denied attempts recorded.
                </td>
              </tr>
            )}
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2 font-mono text-[10px] text-slate-500">
                  {r.user_id ? r.user_id.slice(0, 8) + "…" : "—"}
                </td>
                <td className="px-3 py-2 font-mono text-slate-700">{r.endpoint || "—"}</td>
                <td className="px-3 py-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                    {r.reason || "denied"}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-500">{r.ip || "—"}</td>
              </tr>
            ))}
            {!rows && !err && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500 italic">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
