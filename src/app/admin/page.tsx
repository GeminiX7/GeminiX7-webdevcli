"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banknote, ShoppingBag, Package, Users, AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";
import { PageLoader } from "@/components/ui";
import { formatNaira, timeAgo, cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

type Stats = {
  revenue: number; orders: number; productsCount: number; customers: number;
  lowStock: { id: number; name: string; stock: number; price: number }[];
  recentOrders: { id: number; orderNumber: string; customerName: string; total: number; status: string; createdAt: string }[];
  topProducts: { id: number; name: string; soldCount: number; price: number; stock: number }[];
  byStatus: { status: string; count: number }[];
  byStore: { store: string; count: number; value: number }[];
  monthly: { month: string; total: number; count: number }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return <PageLoader message="Loading dashboard..." />;

  const cards = [
    { label: "Total Revenue", value: formatNaira(stats.revenue), icon: Banknote, grad: "from-emerald-500 to-teal-600", sub: `${stats.orders} orders` },
    { label: "Total Orders", value: String(stats.orders), icon: ShoppingBag, grad: "from-brand-500 to-blue-700", sub: "All time" },
    { label: "Products", value: String(stats.productsCount), icon: Package, grad: "from-violet-500 to-purple-700", sub: `${stats.lowStock.length} low stock` },
    { label: "Customers", value: String(stats.customers), icon: Users, grad: "from-amber-500 to-orange-600", sub: "Registered" },
  ];

  const maxMonth = Math.max(...stats.monthly.map((m) => Number(m.total)), 1);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Welcome back! Here&apos;s what&apos;s happening at Donwise today.</p>
        </div>
        <Link href="/admin/products" className="flex h-10 items-center gap-2 rounded-xl bg-ink-900 px-4 text-[13px] font-bold text-white">
          <Package size={15} /> Manage Products
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg ${c.grad}`}>
            <c.icon size={64} className="absolute -bottom-3 -right-3 opacity-15" />
            <p className="text-xs font-bold uppercase tracking-widest text-white/75">{c.label}</p>
            <p className="mt-1 text-3xl font-black">{c.value}</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/80"><TrendingUp size={12} /> {c.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {/* Revenue chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900">Revenue Trend</h3>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Last {stats.monthly.length} months</span>
          </div>
          {stats.monthly.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No sales data yet.</p>
          ) : (
            <div className="flex h-48 items-end gap-2 sm:gap-3">
              {stats.monthly.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500">{m.count}</span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-brand-600 to-brand-400 transition-all hover:from-brand-700"
                    style={{ height: `${Math.max(8, (Number(m.total) / maxMonth) * 130)}px` }}
                    title={formatNaira(Number(m.total))}
                  />
                  <span className="text-[10px] font-bold uppercase text-slate-500">{m.month}</span>
                </div>
              ))}
            </div>
          )}
          {/* By store */}
          <div className="mt-6 grid gap-2 sm:grid-cols-5">
            {stats.byStore.map((s) => (
              <div key={s.store} className="rounded-2xl bg-slate-50 p-3 text-center">
                <p className="text-[10px] font-black uppercase text-slate-500">{s.store}</p>
                <p className="mt-0.5 text-lg font-black text-slate-900">{s.count}</p>
                <p className="text-[10px] text-slate-500">{formatNaira(Number(s.value))} stock</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by status */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-extrabold text-slate-900">Orders by Status</h3>
          <div className="space-y-2.5">
            {stats.byStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase", STATUS_COLORS[s.status])}>{s.status}</span>
                <b className="text-lg">{Number(s.count)}</b>
              </div>
            ))}
            {stats.byStatus.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No orders yet.</p>}
          </div>
          <Link href="/admin/orders" className="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-50 text-[13px] font-bold text-brand-700 hover:bg-brand-100">
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {/* Recent orders */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs font-bold text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2.5">
            {stats.recentOrders.map((o) => (
              <Link key={o.id} href="/admin/orders" className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3.5 transition hover:border-brand-200 hover:bg-brand-50/40">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{o.orderNumber}</p>
                  <p className="text-xs text-slate-500">{o.customerName} • {timeAgo(o.createdAt)}</p>
                </div>
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase", STATUS_COLORS[o.status])}>{o.status}</span>
                <b className="text-sm">{formatNaira(o.total)}</b>
              </Link>
            ))}
            {stats.recentOrders.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No orders yet.</p>}
          </div>
        </div>

        <div className="space-y-5">
          {/* Low stock */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
            <h3 className="mb-3 flex items-center gap-2 font-extrabold text-slate-900"><AlertTriangle size={17} className="text-amber-500" /> Low Stock Alerts</h3>
            <div className="space-y-2">
              {stats.lowStock.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-[13px]">
                  <span className="line-clamp-1 font-semibold text-slate-700">{p.name}</span>
                  <b className={p.stock === 0 ? "text-red-600" : "text-amber-600"}>{p.stock} left</b>
                </div>
              ))}
              {stats.lowStock.length === 0 && <p className="py-4 text-center text-sm text-slate-500">All stocked up! ✅</p>}
            </div>
          </div>
          {/* Top products */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <h3 className="mb-3 font-extrabold text-slate-900">Top Sellers 🔥</h3>
            <div className="space-y-2.5">
              {stats.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-900 text-xs font-black text-white">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[13px] font-bold text-slate-800">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.soldCount} sold</p>
                  </div>
                  <b className="text-xs">{formatNaira(p.price)}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
