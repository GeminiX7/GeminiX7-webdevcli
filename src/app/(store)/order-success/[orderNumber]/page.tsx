"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Phone } from "lucide-react";
import { Button, PageLoader } from "@/components/ui";
import { formatNaira } from "@/lib/utils";

export default function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<{ total: number; customerName: string; paymentMethod?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`)
      .then((r) => r.json())
      .then((j) => setOrder(j.order || null))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10"><PageLoader message="Confirming your order..." /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-500"><CheckCircle2 size={44} /></div>
      <h1 className="mt-5 text-3xl font-black text-slate-900">Order Placed Successfully! 🎉</h1>
      <p className="mt-2 text-sm text-slate-500">
        Thank you{order ? `, ${order.customerName.split(" ")[0]}` : ""}! We&apos;ve received your order and will contact you shortly to confirm.
      </p>
      <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Order Number</p>
        <p className="mt-1 text-2xl font-black tracking-tight text-brand-700">{orderNumber}</p>
        {order && (
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Package size={15} /> Total: <b>{formatNaira(order.total)}</b></span>
          </div>
        )}
        <p className="mt-3 text-xs text-slate-500">Screenshot or save this number — you&apos;ll need it to track your order.</p>
      </div>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href={`/track-order`}><Button size="lg">Track Your Order <ArrowRight size={16} /></Button></Link>
        <Link href="/shop"><Button size="lg" variant="outline">Continue Shopping</Button></Link>
      </div>
      <p className="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-slate-500">
        <Phone size={14} /> Questions? Call <b>+234 803 123 4567</b>
      </p>
    </div>
  );
}
