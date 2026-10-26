"use client";

import { useState } from "react";
import { PackageSearch, Check, Truck, Package, Home, Loader2 } from "lucide-react";
import { Button, Input, Badge } from "@/components/ui";
import { formatNaira, cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

type Order = {
  id: number; orderNumber: string; status: string; paymentStatus: string; total: number;
  customerName: string; trackingNumber?: string | null; createdAt: string; shippingCity?: string | null;
};
type Item = { id: number; productName: string; productImage?: string | null; quantity: number; unitPrice: number };

const STEPS = [
  { id: "pending", label: "Order Placed", icon: Package },
  { id: "processing", label: "Processing", icon: Loader2 },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Home },
];
const ORDER = ["pending", "processing", "shipped", "delivered"];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const r = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim())}`);
      const j = await r.json();
      if (!r.ok) setError(j.error || "Order not found. Check your order number and email.");
      else {
        setOrder(j.order);
        setItems(j.items || []);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepIdx = order ? ORDER.indexOf(order.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-600 text-white shadow-xl shadow-brand-600/30"><PackageSearch size={28} /></div>
        <h1 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl">Track Your Order</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your order number and email to see live status.</p>
      </div>

      <form onSubmit={track} className="mt-6 grid gap-3 rounded-3xl border border-slate-100 bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:p-6">
        <Input placeholder="Order number (e.g. DNW-...)" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        <Input placeholder="Email used for order" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" loading={loading} className="sm:h-11">Track</Button>
      </form>

      {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600">{error}</p>}

      {order && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-100 bg-white fade-up">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Order</p>
              <p className="text-lg font-black text-slate-900">{order.orderNumber}</p>
            </div>
            <div className="flex gap-2">
              <span className={cn("rounded-full border px-3 py-1 text-xs font-bold uppercase", STATUS_COLORS[order.status])}>{order.status}</span>
              <span className={cn("rounded-full border px-3 py-1 text-xs font-bold uppercase", STATUS_COLORS[order.paymentStatus] || STATUS_COLORS.pending)}>{order.paymentStatus}</span>
            </div>
          </div>

          {order.status !== "cancelled" && order.status !== "refunded" ? (
            <div className="grid grid-cols-4 gap-1 p-5 sm:gap-2">
              {STEPS.map((s, i) => {
                const done = i <= stepIdx;
                const current = i === stepIdx;
                return (
                  <div key={s.id} className="flex flex-col items-center text-center">
                    <div className={cn("grid h-11 w-11 place-items-center rounded-2xl border-2", done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-slate-50 text-slate-400")}>
                      {done && !current ? <Check size={18} /> : <s.icon size={18} className={current ? "animate-pulse" : ""} />}
                    </div>
                    <p className={cn("mt-1.5 text-[10px] font-bold uppercase sm:text-[11px]", done ? "text-emerald-700" : "text-slate-400")}>{s.label}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="p-5 text-center text-sm font-bold text-red-500">This order was {order.status}.</p>
          )}

          <div className="space-y-3 border-t border-slate-100 p-5">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.productImage && <img src={it.productImage} alt="" className="h-11 w-14 rounded-lg object-cover" />}
                <p className="flex-1 text-[13px] font-bold text-slate-800">{it.productName} <span className="font-normal text-slate-500">× {it.quantity}</span></p>
                <b className="text-[13px]">{formatNaira(it.unitPrice * it.quantity)}</b>
              </div>
            ))}
            <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 font-black">
              <span>Total</span><span className="text-brand-700">{formatNaira(order.total)}</span>
            </div>
            {order.trackingNumber && <p className="text-xs text-slate-500">Tracking ID: <b>{order.trackingNumber}</b> • {order.shippingCity}</p>}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-brand-50 p-5 text-center text-[13px] text-brand-900">
        Need help? Call us on <b>+234 803 123 4567</b> or visit <b>12 Douglas Road, Owerri</b>.
      </div>
    </div>
  );
}
