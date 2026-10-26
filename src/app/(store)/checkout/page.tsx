"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Store as StoreIcon, Truck, ShieldCheck, ChevronLeft, Banknote } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Button, Input, Textarea, EmptyState } from "@/components/ui";
import { formatNaira, productImage, cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { ShoppingCart } from "lucide-react";

const PAYMENTS = [
  { id: "pay_on_pickup", label: "Pay on Pickup / Delivery", desc: "Cash or transfer when you receive it", icon: Banknote },
  { id: "bank_transfer", label: "Bank Transfer", desc: "We'll send account details after ordering", icon: CreditCard },
  { id: "in_store", label: "Pay In-Store", desc: "Reserve online, pay at Douglas Road store", icon: StoreIcon },
];

export default function CheckoutPage() {
  const { cart, cartSubtotal, user, clearCart, toast } = useShop();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    customerName: user?.name || "",
    customerEmail: user?.email || "",
    customerPhone: user?.phone || "",
    shippingAddress: "",
    shippingCity: "Owerri",
    shippingState: "Imo State",
    notes: "",
    paymentMethod: "pay_on_pickup",
  });

  const shipping = cartSubtotal >= SITE.freeShippingThreshold || cartSubtotal === 0 ? 0 : 3500;
  const total = cartSubtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <EmptyState icon={<ShoppingCart className="h-8 w-8" />} title="Nothing to checkout" message="Your cart is empty." action={<Link href="/shop"><Button>Go Shopping</Button></Link>} />
      </div>
    );
  }

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail || !form.customerPhone) {
      return toast("Missing details", { message: "Name, email and phone are required", type: "error" });
    }
    setPlacing(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })) }),
      });
      const j = await r.json();
      if (!r.ok) return toast("Order failed", { message: j.error, type: "error" });
      clearCart();
      router.push(`/order-success/${j.orderNumber}`);
    } catch {
      toast("Order failed", { message: "Check your connection and try again", type: "error" });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/cart" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-brand-600"><ChevronLeft size={16} /> Back to cart</Link>
      <h1 className="text-2xl font-black text-slate-900">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">Almost there — confirm your details to place your order.</p>

      <form onSubmit={place} className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-extrabold text-slate-900"><Truck size={18} className="text-brand-600" /> Contact & Delivery Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full Name *" placeholder="e.g. Chiamaka Okafor" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} />
              <Input label="Phone Number *" placeholder="e.g. 0803 123 4567" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} />
              <div className="sm:col-span-2"><Input label="Email Address *" type="email" placeholder="you@example.com" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} /></div>
              <div className="sm:col-span-2"><Input label="Street Address" placeholder="House no, street, area" value={form.shippingAddress} onChange={(e) => set("shippingAddress", e.target.value)} /></div>
              <Input label="City" value={form.shippingCity} onChange={(e) => set("shippingCity", e.target.value)} />
              <Input label="State" value={form.shippingState} onChange={(e) => set("shippingState", e.target.value)} />
              <div className="sm:col-span-2"><Textarea label="Order Notes (optional)" placeholder="Landmark, preferred delivery time..." rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-extrabold text-slate-900"><CreditCard size={18} className="text-brand-600" /> Payment Method</h3>
            <div className="space-y-3">
              {PAYMENTS.map((p) => (
                <label key={p.id} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition", form.paymentMethod === p.id ? "border-brand-600 bg-brand-50" : "border-slate-100 hover:border-slate-200")}>
                  <input type="radio" name="pay" checked={form.paymentMethod === p.id} onChange={() => set("paymentMethod", p.id)} className="h-4 w-4 accent-blue-600" />
                  <div className={cn("grid h-11 w-11 place-items-center rounded-xl", form.paymentMethod === p.id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500")}><p.icon size={19} /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-slate-100 bg-white p-6 lg:sticky lg:top-36">
          <h3 className="font-extrabold text-slate-900">Your Order ({cart.length})</h3>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
            {cart.map((l) => (
              <div key={l.productId} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productImage({ images: l.product.images, name: l.product.name })} alt="" className="h-12 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[13px] font-bold text-slate-800">{l.product.name}</p>
                  <p className="text-xs text-slate-500">Qty {l.quantity} × {formatNaira(l.product.price)}</p>
                </div>
                <b className="text-[13px]">{formatNaira(l.product.price * l.quantity)}</b>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><b className="text-slate-900">{formatNaira(cartSubtotal)}</b></div>
            <div className="flex justify-between text-slate-600"><span>Delivery</span><b className={shipping === 0 ? "text-emerald-600" : ""}>{shipping === 0 ? "FREE" : formatNaira(shipping)}</b></div>
            <div className="flex justify-between text-lg font-black"><span>Total</span><span className="text-brand-700">{formatNaira(total)}</span></div>
          </div>
          <Button type="submit" loading={placing} size="lg" className="mt-5 w-full">Place Order • {formatNaira(total)}</Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500"><ShieldCheck size={13} className="text-emerald-500" /> 100% genuine • 7-day returns • 1yr warranty</p>
        </div>
      </form>
    </div>
  );
}
