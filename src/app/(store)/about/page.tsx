import Link from "next/link";
import { Store, ShieldCheck, Users, Award, Truck, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="overflow-hidden rounded-3xl bg-ink-900 p-8 text-white sm:p-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-400">Our Story</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
          Owerri&apos;s Most Trusted Tech Destination Since 2015
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
          Donwise started as a small computer shop on Douglas Road with one promise — 100% genuine products at honest prices.
          Today, we run 5 specialised stores: Computers, iPhone Store, Games & PlayStation, Gadgets and Accessories — serving
          thousands of happy customers across Imo State and beyond.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Store, t: "5 Specialist Stores", s: "Computers, iPhones, Games, Gadgets & Accessories under one roof." },
          { icon: Users, t: "12,000+ Customers", s: "Students, businesses, gamers and creators trust Donwise." },
          { icon: ShieldCheck, t: "100% Genuine", s: "Every product is sealed with manufacturer warranty." },
          { icon: Award, t: "4.9★ Rated", s: "Top-rated tech store in Owerri on Google reviews." },
        ].map((f) => (
          <div key={f.t} className="rounded-3xl border border-slate-100 bg-white p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><f.icon size={22} /></div>
            <p className="mt-3 font-extrabold text-slate-900">{f.t}</p>
            <p className="mt-1 text-[13px] text-slate-500">{f.s}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-black text-slate-900">Our Stores in Owerri</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "💻 Donwise Computers — 12 Douglas Road, Owerri",
              "📱 Donwise iPhone Store — Shop B14 Somachi Plaza, Ikenegbu",
              "🎮 Games & PlayStation Store — 12 Douglas Road (Annex)",
              "⌚ Gadget Store — Shop B14 Somachi Plaza, Ikenegbu",
              "🎧 Accessory Store — 12 Douglas Road, Owerri",
            ].map((s) => (
              <li key={s} className="rounded-xl bg-slate-50 px-4 py-3 font-semibold text-slate-700">{s}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-brand-600 to-violet-600 p-6 text-white sm:p-8">
          <div>
            <Truck size={32} />
            <h2 className="mt-3 text-xl font-black">Fast Delivery, Anywhere</h2>
            <p className="mt-2 text-sm text-white/85">
              Same-day delivery within Owerri (Nekede, Ihiagwa, FUTO, Orji, Egbu). 24–48hrs to all South-East states.
              Free delivery on orders above ₦250,000.
            </p>
          </div>
          <Link href="/shop" className="mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-brand-700">
            Shop Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
