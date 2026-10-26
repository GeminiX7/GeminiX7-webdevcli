"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, ChevronRight, ChevronLeft, ShieldCheck, Truck, RotateCcw, Lock,
  BadgePercent, Zap, Laptop, Smartphone, Gamepad2, Watch, Headphones, Monitor, Briefcase, Joystick, TabletSmartphone, Gamepad,
} from "lucide-react";

export const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Laptop, Smartphone, Gamepad2, Watch, Headphones, Monitor, Briefcase, Joystick, TabletSmartphone, Gamepad,
};

type Category = { id: number; name: string; slug: string; description?: string | null; imageUrl?: string | null; icon?: string | null; store: string; productCount?: number };

// ---------- HERO ----------
export function Hero() {
  return (
    <section className="hero-grid-bg overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-10 lg:grid-cols-2 lg:pt-14">
        <div className="fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-700 shadow-sm">
            <Zap size={12} className="fill-amber-400 text-amber-400" /> New Arrival — Owerri Stores
          </div>
          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]">
            Powerful Tech.
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">Limitless Possibilities.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
            From laptops to iPhones, PS5 to smart gadgets — find the perfect device that fits your life and fuels your passion. 100% genuine, best prices in Imo State.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-7 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700">
              SHOP NOW <ArrowRight size={16} />
            </Link>
            <Link href="/deals" className="flex h-12 items-center rounded-xl border-2 border-brand-200 bg-white px-7 text-sm font-bold text-brand-700 transition hover:border-brand-400">
              EXPLORE DEALS
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: ShieldCheck, t: "100%", s: "Authentic Products" },
              { icon: Truck, t: "Free Delivery", s: "Orders over ₦250k" },
              { icon: RotateCcw, t: "Easy Returns", s: "7-Day Return" },
              { icon: Lock, t: "Secure Payment", s: "100% Safe & Secure" },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-2.5">
                <f.icon size={26} className="shrink-0 text-brand-600" strokeWidth={1.6} />
                <div className="leading-tight">
                  <p className="text-xs font-extrabold text-slate-900">{f.t}</p>
                  <p className="text-[11px] text-slate-500">{f.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative fade-up">
          <div className="absolute -right-4 top-0 z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed border-brand-300 bg-white text-center shadow-xl sm:h-28 sm:w-28">
            <span className="text-[9px] font-bold uppercase text-slate-500">Up to</span>
            <span className="text-2xl font-black text-brand-600 sm:text-3xl">25%</span>
            <span className="text-[9px] font-bold uppercase text-slate-500">Off</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://rp0sd4q07g.ufs.sh/f/8t6otpGzNZFgDgtZvAwxKuQ21aPHWr6GkivJT4gBflyV9X8w?auto=format&fit=crop&w=1200&q=80"
            alt="Powerful laptops at Donwise"
            className="w-full rounded-3xl object-cover shadow-2xl shadow-brand-900/20 [mask-image:linear-gradient(to_bottom,black_88%,transparent)]"
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><BadgePercent size={20} /></div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">PS5 Slim + 2 Pads</p>
              <p className="text-[11px] text-slate-500">Now <span className="font-bold text-brand-700">₦850,000</span> <span className="line-through">₦920,000</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- CATEGORY CAROUSEL ----------
export function CategoryCarousel({ categories }: { categories: Category[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 text-center">
        <h2 className="text-xl font-extrabold tracking-wide text-ink-900 sm:text-2xl">SHOP BY CATEGORY</h2>
        <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-brand-600" />
      </div>
      <div className="relative">
        <div ref={ref} className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2">
          {categories.map((c) => {
            const Icon = ICONS[c.icon || "Laptop"] || Laptop;
            return (
              <Link key={c.id} href={`/shop?category=${c.slug}`} className="group w-44 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 text-center transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl sm:w-52">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-50">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.imageUrl} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="grid h-full place-items-center text-brand-300"><Icon size={48} /></div>
                  )}
                </div>
                <p className="mt-3 text-[13px] font-extrabold text-slate-900 group-hover:text-brand-700">{c.name}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{c.description}</p>
              </Link>
            );
          })}
        </div>
        <button onClick={() => scroll(1)} className="absolute -right-2 top-1/3 z-10 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg hover:bg-brand-600 hover:text-white"><ChevronRight size={18} /></button>
        <button onClick={() => scroll(-1)} className="absolute -left-2 top-1/3 z-10 hidden h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg hover:bg-brand-600 hover:text-white md:grid"><ChevronLeft size={18} /></button>
      </div>
    </section>
  );
}

// ---------- BRAND BANNER ----------
export function BrandBanner() {
  const brands = ["APPLE", "SAMSUNG", "SONY", "HP", "DELL", "LENOVO", "ASUS", "JBL", "ORAIMO", "ANKER"];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-400">Limited Time Offer</p>
            <h3 className="mt-2 text-3xl font-black text-white sm:text-4xl">Best Deals on<br />Top <span className="text-brand-400">Brands</span></h3>
            <p className="mt-2 max-w-xs text-sm text-slate-400">Grab exciting offers on premium tech from leading brands.</p>
            <Link href="/deals" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-6 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-500">
              View All Deals <ArrowRight size={15} />
            </Link>
          </div>
          <div className="hidden lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80" alt="Gaming laptop deal" className="h-52 w-80 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20" />
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              {brands.slice(0, 6).map((b) => (
                <span key={b} className="text-lg font-black tracking-tight text-white/90">{b}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 ring-1 ring-white/10">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-slate-400">Up to</p>
                <p className="text-4xl font-black text-brand-400">30%</p>
                <p className="text-[10px] font-bold uppercase text-slate-400">Off selected items</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- WHY CHOOSE ----------
export function WhyChoose() {
  const items = [
    { icon: BadgePercent, t: "Best Price Guarantee", s: "We offer the best prices on top brands in Owerri." },
    { icon: ShieldCheck, t: "Expert Support", s: "Get help from our product specialists anytime." },
    { icon: RotateCcw, t: "Hassle-Free Returns", s: "7-day easy returns for peace of mind." },
    { icon: Lock, t: "Secure Payments", s: "Safe & secure payment methods." },
    { icon: Truck, t: "Fast Owerri Delivery", s: "Same-day delivery within Owerri." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="mb-5 text-center">
        <h2 className="text-xl font-extrabold tracking-wide text-ink-900 sm:text-2xl">WHY CHOOSE DONWISE?</h2>
        <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-brand-600" />
      </div>
      <div className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-6 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((f) => (
          <div key={f.t} className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600"><f.icon size={20} /></div>
            <div>
              <p className="text-[13px] font-extrabold text-slate-900">{f.t}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{f.s}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- STORE STRIP ----------
export function StoreStrip() {
  const stores = [
    { label: "Computers", href: "/shop?store=computers", icon: Laptop, grad: "from-blue-500 to-blue-700", desc: "Laptops & Desktops" },
    { label: "iPhone Store", href: "/shop?store=iphone", icon: Smartphone, grad: "from-slate-700 to-slate-900", desc: "Apple & Smartphones" },
    { label: "Games & PS", href: "/shop?store=games", icon: Gamepad2, grad: "from-violet-500 to-purple-700", desc: "Consoles & Titles" },
    { label: "Gadgets", href: "/shop?store=gadgets", icon: Watch, grad: "from-emerald-500 to-teal-700", desc: "Wearables & Drones" },
    { label: "Accessories", href: "/shop?store=accessories", icon: Headphones, grad: "from-amber-500 to-orange-600", desc: "Audio, Power & More" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stores.map((s) => (
          <Link key={s.label} href={s.href} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${s.grad}`}>
            <s.icon size={44} className="absolute -bottom-2 -right-2 opacity-20 transition group-hover:scale-110" />
            <p className="text-sm font-black">{s.label}</p>
            <p className="mt-0.5 text-[11px] text-white/75">{s.desc}</p>
            <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide">Shop now <ArrowRight size={12} /></p>
          </Link>
        ))}
      </div>
    </section>
  );
}
