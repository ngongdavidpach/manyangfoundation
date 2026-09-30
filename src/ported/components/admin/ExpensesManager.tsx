import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Plus, Trash2 } from "lucide-react";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type Category = Database["public"]["Tables"]["expense_categories"]["Row"];
type Budget = Database["public"]["Tables"]["budgets"]["Row"];

const STATUSES = ["planned", "approved", "paid", "cancelled"] as const;

export const ExpensesManager: React.FC = () => {
  const [tab, setTab] = useState<"expenses" | "categories" | "budgets">("expenses");
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Expenses &amp; Budgets</h2>
      <div className="border-b flex">
        {(["expenses", "categories", "budgets"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize ${tab === t ? "border-b-2 border-blue-600 text-blue-700 font-medium" : "text-slate-600"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "expenses" && <ExpensesTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "budgets" && <BudgetsTab />}
    </div>
  );
};

const ExpensesTab: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creating, setCreating] = useState(false);

  const load = () =>
    supabase
      .from("expenses")
      .select("*")
      .order("incurred_at", { ascending: false })
      .then(({ data }) => setExpenses(data || []));
  useEffect(() => {
    load();
    supabase
      .from("expense_categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name || "—";

  return (
    <div className="space-y-3">
      <div className="flex">
        <button
          onClick={() => setCreating(true)}
          className="ml-auto bg-blue-600 text-white px-3 py-2 rounded-md text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> New expense
        </button>
      </div>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Vendor</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  No expenses yet.
                </td>
              </tr>
            )}
            {expenses.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{new Date(e.incurred_at).toLocaleDateString()}</td>
                <td className="p-3 font-medium">{e.description}</td>
                <td className="p-3 text-slate-600">{catName(e.category_id)}</td>
                <td className="p-3 text-slate-600">{e.vendor || "—"}</td>
                <td className="p-3">
                  {e.currency} {(Number(e.amount_cents) / 100).toFixed(2)}
                </td>
                <td className="p-3 capitalize">{e.status}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={async () => {
                      if (confirm("Delete?")) {
                        await supabase.from("expenses").delete().eq("id", e.id);
                        load();
                      }
                    }}
                    className="text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {creating && (
        <ExpenseForm
          categories={categories}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
};

const ExpenseForm: React.FC<{
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ categories, onClose, onSaved }) => {
  const [f, setF] = useState({
    description: "",
    vendor: "",
    amount: "",
    currency: "USD",
    category_id: "",
    status: "paid" as Expense["status"],
    program_pillar: "",
    incurred_at: new Date().toISOString().slice(0, 10),
  });
  const save = async () => {
    const amount_cents = Math.round(parseFloat(f.amount || "0") * 100);
    if (!amount_cents || !f.description) {
      alert("Description and amount required");
      return;
    }
    await supabase.from("expenses").insert({
      description: f.description,
      vendor: f.vendor || null,
      amount_cents,
      currency: f.currency,
      category_id: f.category_id || null,
      status: f.status,
      program_pillar: f.program_pillar || null,
      incurred_at: f.incurred_at,
    });
    onSaved();
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md h-full overflow-y-auto p-5 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold">New expense</h3>
        <input
          placeholder="Description"
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <input
          placeholder="Vendor"
          value={f.vendor}
          onChange={(e) => setF({ ...f, vendor: e.target.value })}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={f.amount}
            onChange={(e) => setF({ ...f, amount: e.target.value })}
            className="col-span-2 px-3 py-2 border rounded text-sm"
          />
          <input
            value={f.currency}
            onChange={(e) => setF({ ...f, currency: e.target.value.toUpperCase() })}
            className="px-3 py-2 border rounded text-sm"
          />
        </div>
        <select
          value={f.category_id}
          onChange={(e) => setF({ ...f, category_id: e.target.value })}
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="">— Category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Program pillar (optional)"
          value={f.program_pillar}
          onChange={(e) => setF({ ...f, program_pillar: e.target.value })}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <input
          type="date"
          value={f.incurred_at}
          onChange={(e) => setF({ ...f, incurred_at: e.target.value })}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <select
          value={f.status}
          onChange={(e) => setF({ ...f, status: e.target.value as Expense["status"] })}
          className="w-full px-3 py-2 border rounded text-sm capitalize"
        >
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-3 py-2 border rounded text-sm">
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoriesTab: React.FC = () => {
  const [cats, setCats] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const load = () =>
    supabase
      .from("expense_categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCats(data || []));
  useEffect(() => {
    load();
  }, []);
  const add = async () => {
    if (!name) return;
    await supabase
      .from("expense_categories")
      .insert({ name, annual_budget_cents: Math.round(parseFloat(budget || "0") * 100) });
    setName("");
    setBudget("");
    load();
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 border rounded text-sm"
        />
        <input
          type="number"
          placeholder="Annual budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-40 px-3 py-2 border rounded text-sm"
        />
        <button onClick={add} className="bg-blue-600 text-white px-3 py-2 rounded text-sm">
          Add
        </button>
      </div>
      <div className="bg-white border rounded-lg divide-y">
        {cats.map((c) => (
          <div key={c.id} className="p-3 flex items-center justify-between text-sm">
            <span className="font-medium">{c.name}</span>
            <span className="text-slate-500">
              Budget: ${(Number(c.annual_budget_cents) / 100).toFixed(2)}
            </span>
            <button
              onClick={async () => {
                if (confirm("Delete?")) {
                  await supabase.from("expense_categories").delete().eq("id", c.id);
                  load();
                }
              }}
              className="text-rose-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {cats.length === 0 && (
          <p className="p-6 text-center text-slate-400 text-sm">No categories yet.</p>
        )}
      </div>
    </div>
  );
};

const BudgetsTab: React.FC = () => {
  const year = new Date().getFullYear();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const load = () => {
    supabase
      .from("budgets")
      .select("*")
      .eq("fiscal_year", year)
      .then(({ data }) => setBudgets(data || []));
    supabase
      .from("expense_categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCats(data || []));
  };
  useEffect(() => {
    load();
  }, []);
  const setBudget = async (categoryId: string, cents: number) => {
    await supabase
      .from("budgets")
      .upsert(
        { fiscal_year: year, category_id: categoryId, planned_cents: cents },
        { onConflict: "fiscal_year,category_id" },
      );
    load();
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Annual planned budgets for fiscal year <strong>{year}</strong>.
      </p>
      <div className="bg-white border rounded-lg divide-y">
        {cats.map((c) => {
          const b = budgets.find((x) => x.category_id === c.id);
          return (
            <div key={c.id} className="p-3 flex items-center gap-3 text-sm">
              <span className="flex-1 font-medium">{c.name}</span>
              <input
                type="number"
                step="0.01"
                defaultValue={b ? (Number(b.planned_cents) / 100).toString() : ""}
                onBlur={(e) => setBudget(c.id, Math.round(parseFloat(e.target.value || "0") * 100))}
                placeholder="0.00"
                className="w-32 px-3 py-1.5 border rounded text-sm"
              />
            </div>
          );
        })}
        {cats.length === 0 && (
          <p className="p-6 text-center text-slate-400 text-sm">Create categories first.</p>
        )}
      </div>
    </div>
  );
};
