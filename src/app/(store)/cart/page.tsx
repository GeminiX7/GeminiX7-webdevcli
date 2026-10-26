"use client";

import Link from "next/link";
import { Trash2, ArrowRight, ShoppingCart, Truck, ShieldCheck } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Button, QtyStepper, EmptyState, Price } from "@/components/ui";
import { formatNaira, productImage } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart, cartSubtotal, cartCount } = useShop();
  const shipping = cartSubtotal >= SITE.freeShippingThreshold || cartSubtotal === 0 ? 0 : 3500;
  const total = cartSubtotal + shipping;
  const progress = Math.min(100, (cartSubtotal / SITE.freeShippingThreshold) * 100);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <EmptyState
          icon={<ShoppingCart className="h-8 w-8" />}
          title="Your cart is empty"
          message="Looks like you haven't added anything yet. Explore our stores and find something you love!"
          action={<Link href="/shop"><Button>Start Shopping <ArrowRight size={15} /></Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Shopping Cart</h1>
          <p className="text-sm text-slate-500">{cartCount} item{cartCount === 1 ? "" : "s"} in your cart</p>
        </div>
        <button onClick={clearCart} className="flex items-center gap-1.5 text-[13px] font-bold text-red-500 hover:text-red-700"><Trash2 size={15} /> Clear cart</button>
      </div>

      {/* Free shipping bar */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
          <Truck size={16} className="text-brand-600" />
          {shipping === 0 ? (
            <span>🎉 You&apos;ve unlocked <b className="text-emerald-600">FREE delivery</b> in Owerri!</span>
          ) : (
            <span>Add <b className="text-brand-700">{formatNaira(SITE.freeShippingThreshold - cartSubtotal)}</b> more to unlock FREE delivery</span>
          )}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {cart.map((line) => (
            <div key={line.productId} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImage({ images: line.product.images, name: line.product.name })} alt={line.product.name} className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-32" />
              <div className="min-w-0 flex-1">
                <Link href={`/product/${line.product.slug}`} className="line-clamp-2 text-sm font-bold text-slate-900 hover:text-brand-700">{line.product.name}</Link>
                <p className="mt-0.5 text-xs text-slate-500">{line.product.shortDescription}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <QtyStepper value={line.quantity} max={line.product.stock || 99} onChange={(v) => updateQty(line.productId, v)} />
                  <Price price={line.product.price * line.quantity} size="md" />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{formatNaira(line.product.price)} each</span>
                  <button onClick={() => removeFromCart(line.productId)} className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700"><Trash2 size={13} /> Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-slate-100 bg-white p-6 lg:sticky lg:top-36">
          <h3 className="font-extrabold text-slate-900">Order Summary</h3>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><b className="text-slate-900">{formatNaira(cartSubtotal)}</b></div>
            <div className="flex justify-between text-slate-600"><span>Delivery (Owerri)</span><b className={shipping === 0 ? "text-emerald-600" : "text-slate-900"}>{shipping === 0 ? "FREE" : formatNaira(shipping)}</b></div>
            <div className="border-t border-dashed border-slate-200 pt-2.5">
              <div className="flex justify-between text-base font-black text-slate-900"><span>Total</span><span>{formatNaira(total)}</span></div>
            </div>
          </div>
          <Link href="/checkout"><Button className="mt-5 w-full" size="lg">Proceed to Checkout <ArrowRight size={16} /></Button></Link>
          <Link href="/shop"><Button variant="outline" className="mt-2 w-full">Continue Shopping</Button></Link>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <ShieldCheck size={13} className="text-emerald-500" /> Secure checkout • 7-day returns
          </div>
        </div>
      </div>
    </div>
  );
}
