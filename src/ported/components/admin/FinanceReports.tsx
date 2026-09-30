import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Donation = Database["public"]["Tables"]["donations"]["Row"];
type Expense = Database["public"]["Tables"]["expenses"]["Row"];

export const FinanceReports: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    supabase
      .from("donations")
      .select("*")
      .eq("status", "completed")
      .then(({ data }) => setDonations(data || []));
    supabase
      .from("expenses")
      .select("*")
      .neq("status", "cancelled")
      .then(({ data }) => setExpenses(data || []));
  }, []);

  const monthly = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number }> = {};
    const key = (d: string) => d.slice(0, 7);
    donations.forEach((d) => {
      const k = key(d.received_at);
      map[k] = map[k] || { month: k, income: 0, expense: 0 };
      map[k].income += Number(d.amount_cents) / 100;
    });
    expenses.forEach((e) => {
      const k = key(e.incurred_at);
      map[k] = map[k] || { month: k, income: 0, expense: 0 };
      map[k].expense += Number(e.amount_cents) / 100;
    });
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }, [donations, expenses]);

  const totals = useMemo(() => {
    const income = donations.reduce((s, d) => s + Number(d.amount_cents) / 100, 0);
    const expense = expenses.reduce((s, e) => s + Number(e.amount_cents) / 100, 0);
    return { income, expense, net: income - expense };
  }, [donations, expenses]);

  const topDonors = useMemo(() => {
    const map = new Map<string, { name: string; total: number }>();
    donations.forEach((d) => {
      const key = d.contact_id || d.donor_email || d.donor_name || "Anonymous";
      const e = map.get(key) || {
        name: d.is_anonymous ? "Anonymous" : d.donor_name || d.donor_email || "Anonymous",
        total: 0,
      };
      e.total += Number(d.amount_cents) / 100;
      map.set(key, e);
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [donations]);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-900">Financial Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat label="Total income" value={totals.income} accent="emerald" />
        <Stat label="Total expenses" value={totals.expense} accent="rose" />
        <Stat label="Net" value={totals.net} accent={totals.net >= 0 ? "emerald" : "rose"} />
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-sm text-slate-700 mb-3">
          Income vs Expense (last 12 months)
        </h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expense" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-sm text-slate-700 mb-3">Top donors</h3>
        <table className="w-full text-sm">
          <tbody>
            {topDonors.map((d, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 text-slate-500 w-8">{i + 1}</td>
                <td className="p-2">{d.name}</td>
                <td className="p-2 text-right font-medium">${d.total.toFixed(2)}</td>
              </tr>
            ))}
            {topDonors.length === 0 && (
              <tr>
                <td className="p-4 text-center text-slate-400">No completed donations yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number; accent: "emerald" | "rose" }> = ({
  label,
  value,
  accent,
}) => (
  <div className="bg-white border rounded-lg p-4">
    <p className="text-xs uppercase text-slate-500 tracking-wider">{label}</p>
    <p
      className={`text-3xl font-bold mt-1 ${accent === "emerald" ? "text-emerald-600" : "text-rose-600"}`}
    >
      ${value.toFixed(2)}
    </p>
  </div>
);
