"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, Search } from "lucide-react";
import { Button, Modal, EmptyState, PageLoader } from "@/components/ui";
import { useShop } from "@/context/ShopContext";
import { formatNaira, timeAgo } from "@/lib/utils";

type Customer = { id: number; name: string; email: string; phone?: string | null; city?: string | null; role: string; createdAt: string; totalSpent: number; orderCount: number };

export default function AdminCustomersPage() {
  const { toast } = useShop();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [delId, setDelId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((j) => setCustomers(j.customers || [])).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => !q || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase()));

  const doDelete = async () => {
    if (!delId) return;
    const prev = [...customers];
    setCustomers((cs) => cs.filter((c) => c.id !== delId));
    setDelId(null);
    try {
      await fetch(`/api/customers?id=${delId}`, { method: "DELETE" });
      toast("Customer removed", { type: "info" });
    } catch {
      setCustomers(prev);
      toast("Delete failed", { type: "error" });
    }
  };

  if (loading) return <PageLoader message="Loading customers..." />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-black text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">{customers.length} registered accounts</p>
      </div>
      <div className="mb-4 flex h-10 max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
        <Search size={15} className="text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers..." className="w-full bg-transparent text-sm outline-none" />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-8 w-8" />} title="No customers found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-lg font-black text-white">{c.name[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900">{c.name}</p>
                  <p className="truncate text-xs text-slate-500">{c.email}</p>
                  <p className="text-xs text-slate-500">{c.phone || "No phone"} • {c.city || "Owerri"}</p>
                </div>
                {c.role !== "admin" && (
                  <button onClick={() => setDelId(c.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500"><Trash2 size={14} /></button>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-sm font-black">{c.orderCount}</p>
                  <p className="text-[10px] uppercase text-slate-500">Orders</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="truncate text-[13px] font-black">{formatNaira(c.totalSpent)}</p>
                  <p className="text-[10px] uppercase text-slate-500">Spent</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-[11px] font-black">{timeAgo(c.createdAt)}</p>
                  <p className="text-[10px] uppercase text-slate-500">Joined</p>
                </div>
              </div>
              {c.role === "admin" && <span className="mt-3 inline-block rounded-full bg-ink-900 px-2.5 py-1 text-[10px] font-bold uppercase text-white">Admin</span>}
            </div>
          ))}
        </div>
      )}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Remove Customer?">
        <p className="text-sm text-slate-600">This will delete the customer account. Their orders will be kept.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setDelId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={doDelete}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
