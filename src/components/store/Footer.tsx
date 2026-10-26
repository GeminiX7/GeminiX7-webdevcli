"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Phone, Mail, Globe, AtSign, Share2, Play, Send, Clock, Loader2 } from "lucide-react";
import { SITE } from "@/lib/constants";
import { useShop } from "@/context/ShopContext";
import { StoreLogo } from "@/components/store/StoreLogo";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useShop();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const j = await r.json();
      if (r.ok) {
        toast("Subscribed!", { message: "You'll get our hottest deals first 🔥" });
        setEmail("");
      } else toast("Oops", { message: j.error, type: "error" });
    } catch {
      toast("Failed", { message: "Try again later", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ink-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-10 lg:flex-row lg:justify-between">
        <div className="flex items-start gap-4 text-center lg:text-left">
          <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600/20 text-brand-400 sm:grid"><Send size={22} /></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-400">Stay Updated</p>
            <h3 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">Subscribe to Our Newsletter</h3>
            <p className="mt-1 text-sm text-slate-400">Get the latest deals, new arrivals, and exclusive Owerri store offers.</p>
          </div>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-md items-center overflow-hidden rounded-xl bg-white p-1.5">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email address" className="h-10 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400" />
          <button disabled={loading} className="flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-5 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="flex items-center gap-2.5">
            <StoreLogo />
            <div className="leading-tight">
              <p className="text-lg font-black text-white">Don<span className="text-brand-400">wise</span></p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Power Your Potential</p>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-slate-400">
            Owerri&apos;s one-stop destination for premium computers, iPhones, PlayStation, gadgets & accessories. Quality, trust, and performance guaranteed.
          </p>
          <div className="mt-4 flex gap-2">
            {[Globe, AtSign, Share2, Play].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-slate-300 transition hover:bg-brand-600 hover:text-white"><Icon size={16} /></a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Our Stores</h4>
          <ul className="space-y-2.5 text-[13px]">
            <li><Link href="/shop?store=computers" className="hover:text-brand-400">💻 Computers Store</Link></li>
            <li><Link href="/shop?store=iphone" className="hover:text-brand-400">📱 iPhone Store</Link></li>
            <li><Link href="/shop?store=games" className="hover:text-brand-400">🎮 Games & PlayStation</Link></li>
            <li><Link href="/shop?store=gadgets" className="hover:text-brand-400">⌚ Gadget Store</Link></li>
            <li><Link href="/shop?store=accessories" className="hover:text-brand-400">🎧 Accessory Store</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Customer Service</h4>
          <ul className="space-y-2.5 text-[13px]">
            <li><Link href="/track-order" className="hover:text-brand-400">Track Order</Link></li>
            <li><Link href="/contact" className="hover:text-brand-400">Shipping & Delivery</Link></li>
            <li><Link href="/contact" className="hover:text-brand-400">Returns & Refunds</Link></li>
            <li><Link href="/contact" className="hover:text-brand-400">Warranty</Link></li>
            <li><Link href="/about" className="hover:text-brand-400">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-brand-400">Help Center</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Quick Links</h4>
          <ul className="space-y-2.5 text-[13px]">
            <li><Link href="/" className="hover:text-brand-400">Home</Link></li>
            <li><Link href="/shop" className="hover:text-brand-400">Shop All</Link></li>
            <li><Link href="/deals" className="hover:text-brand-400">Today&apos;s Deals</Link></li>
            <li><Link href="/brands" className="hover:text-brand-400">Brands</Link></li>
            <li><Link href="/wishlist" className="hover:text-brand-400">Wishlist</Link></li>
            <li><Link href="/compare" className="hover:text-brand-400">Compare</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Contact Us</h4>
          <ul className="space-y-3 text-[13px]">
            <li className="flex gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-brand-400" /> {SITE.address}<br /></li>
            <li className="flex gap-2"><Phone size={15} className="mt-0.5 shrink-0 text-brand-400" /> {SITE.phone}</li>
            <li className="flex gap-2"><Mail size={15} className="mt-0.5 shrink-0 text-brand-400" /> {SITE.email}</li>
            <li className="flex gap-2"><Clock size={15} className="mt-0.5 shrink-0 text-brand-400" /> {SITE.hours}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["VISA", "Mastercard", "Verve", "Paystack", "Transfer"].map((p) => (
              <span key={p} className="rounded-md bg-white px-2 py-1 text-[10px] font-black uppercase text-ink-900">{p}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 Donwise Computers & iPhone Stores, Owerri. All Rights Reserved.</p>
          <p className="flex gap-4"><Link href="/about" className="hover:text-slate-300">Privacy Policy</Link><Link href="/about" className="hover:text-slate-300">Terms & Conditions</Link></p>
        </div>
      </div>
    </footer>
  );
}
