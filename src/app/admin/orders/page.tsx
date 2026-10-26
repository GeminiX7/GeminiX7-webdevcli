"use client";

import { useEffect, useState } from "react";
import { Eye, Search, ShoppingBag, Trash2 } from "lucide-react";
import { Button, Modal, EmptyState, PageLoader, Select } from "@/components/ui";
import { useShop } from "@/context/ShopContext";
import { formatNaira, timeAgo, cn } from "@/lib/utils";
import { STATUS_COLORS, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";

type Item = { id: number; productName: string; productImage?: string | null; unitPrice: number; quantity: number };
type Order = {
  id: number; orderNumber: string; status: string; paymentStatus: string; paymentMethod?: string | null;
  total: number; subtotal: number; shippingFee: number; customerName: string; customerEmail: string;
  customerPhone?: string | null; shippingAddress?: string | null; shippingCity?: string | null;
  trackingNumber?: string | null; createdAt: string; items: Item[];
};

export default function AdminOrdersPage() {
  const { toast } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((j) => setOrders(j.orders || [])).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (statusF && o.status !== statusF) return false;
    if (q && !`${o.orderNumber} ${o.customerName} ${o.customerEmail}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const update = async (id: number, patch: Partial<Order>) => {
    setSaving(true);
    const prev = [...orders];
    setOrders((os) => os.map((o) => o.id === id ? { ...o, ...patch } : o));
    if (selected?.id === id) setSelected({ ...selected, ...patch });
    try {
      const r = await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      if (!r.ok) throw new Error("Failed");
      toast("Order updated");
    } catch {
      setOrders(prev);
      toast("Update failed", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!delId) return;
    const prev = [...orders];
    setOrders((os) => os.filter((o) => o.id !== delId));
    setDelId(null);
    setSelected(null);
    try {
      await fetch(`/api/orders/${delId}`, { method: "DELETE" });
      toast("Order deleted", { type: "info" });
    } catch {
      setOrders(prev);
      toast("Delete failed", { type: "error" });
    }
  };

  if (loading) return <PageLoader message="Loading orders..." />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-black text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">{orders.length} orders • {formatNaira(orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0))} revenue</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex h-10 min-w-52 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
          <Search size={15} className="text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, customer, email..." className="w-full bg-transparent text-sm outline-none" />
        </div>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ShoppingBag className="h-8 w-8" />} title="No orders found" message="Orders placed on the store will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{o.orderNumber}</p>
                    <p className="text-[11px] text-slate-400">{timeAgo(o.createdAt)} • {o.items.length} items</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">{o.customerName}</p>
                    <p className="text-xs text-slate-400">{o.customerPhone || o.customerEmail}</p>
                  </td>
                  <td className="p-4"><span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase", STATUS_COLORS[o.status])}>{o.status}</span></td>
                  <td className="p-4"><span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase", STATUS_COLORS[o.paymentStatus] || STATUS_COLORS.pending)}>{o.paymentStatus}</span></td>
                  <td className="p-4 font-bold">{formatNaira(o.total)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => setSelected(o)} className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><Eye size={14} /></button>
                      <button onClick={() => setDelId(o.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Order ${selected.orderNumber}` : ""} wide>
        {selected && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Order Status" value={selected.status} disabled={saving} onChange={(e) => update(selected.id, { status: e.target.value })}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Select label="Payment Status" value={selected.paymentStatus} disabled={saving} onChange={(e) => update(selected.id, { paymentStatus: e.target.value })}>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 text-[13px] sm:grid-cols-2">
              <div>
                <p className="font-black text-slate-900">{selected.customerName}</p>
                <p className="text-slate-600">{selected.customerEmail}</p>
                <p className="text-slate-600">{selected.customerPhone}</p>
                <p className="mt-1 text-slate-500">{selected.shippingAddress}, {selected.shippingCity}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-slate-500">Tracking: <b className="text-slate-800">{selected.trackingNumber || "—"}</b></p>
                <p className="text-slate-500">Payment: <b className="text-slate-800">{selected.paymentMethod?.replaceAll("_", " ")}</b></p>
                <p className="text-slate-500">{new Date(selected.createdAt).toLocaleString("en-NG")}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {selected.items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {it.productImage && <img src={it.productImage} alt="" className="h-12 w-14 rounded-lg object-cover" />}
                  <p className="flex-1 text-[13px] font-bold">{it.productName} <span className="font-normal text-slate-500">× {it.quantity}</span></p>
                  <b className="text-[13px]">{formatNaira(it.unitPrice * it.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 border-t border-dashed border-slate-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatNaira(selected.subtotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Delivery</span><span>{selected.shippingFee === 0 ? "FREE" : formatNaira(selected.shippingFee)}</span></div>
              <div className="flex justify-between text-lg font-black"><span>Total</span><span className="text-brand-700">{formatNaira(selected.total)}</span></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete Order?">
        <p className="text-sm text-slate-600">This will permanently remove the order record.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setDelId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={doDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
