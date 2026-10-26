"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Package, Heart, LogOut, MapPin } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Button, PageLoader, EmptyState } from "@/components/ui";
import { formatNaira, timeAgo, cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

type Order = { id: number; orderNumber: string; status: string; paymentStatus: string; total: number; createdAt: string; items: { productName: string; quantity: number }[] };

export default function AccountPage() {
  const { user, authLoading, logout, wishlist } = useShop();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?next=/account");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/orders").then((r) => r.json()).then((j) => setOrders(j.orders || [])).finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || !user) return <div className="mx-auto max-w-7xl px-4 py-10"><PageLoader message="Loading your account..." /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-2xl font-black">{user.name[0]}</div>
          <div>
            <h1 className="text-xl font-black sm:text-2xl">Hello, {user.name} 👋</h1>
            <p className="text-sm text-slate-300">{user.email} • {user.city || "Owerri"}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={logout}><LogOut size={15} /> Sign Out</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500"><Package size={17} /><span className="text-xs font-bold uppercase">Total Orders</span></div>
          <p className="mt-1 text-3xl font-black">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500"><Heart size={17} /><span className="text-xs font-bold uppercase">Wishlist</span></div>
          <p className="mt-1 text-3xl font-black">{wishlist.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500"><MapPin size={17} /><span className="text-xs font-bold uppercase">City</span></div>
          <p className="mt-1 text-2xl font-black">{user.city || "Owerri"}</p>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-lg font-extrabold text-slate-900">My Orders</h2>
      {loading ? (
        <PageLoader message="Loading orders..." />
      ) : orders.length === 0 ? (
        <EmptyState icon={<Package className="h-8 w-8" />} title="No orders yet" message="Your orders will appear here once you shop with us." action={<Link href="/shop"><Button>Start Shopping</Button></Link>} />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-900">{o.orderNumber}</p>
                <p className="mt-0.5 line-clamp-1 text-[13px] text-slate-500">{o.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}</p>
                <p className="mt-1 text-xs text-slate-400">{timeAgo(o.createdAt)}</p>
              </div>
              <span className={cn("rounded-full border px-3 py-1 text-[11px] font-bold uppercase", STATUS_COLORS[o.status])}>{o.status}</span>
              <p className="font-black text-slate-900">{formatNaira(o.total)}</p>
              <Link href={`/track-order`}><Button size="sm" variant="outline">Track</Button></Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
