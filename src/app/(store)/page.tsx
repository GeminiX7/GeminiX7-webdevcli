import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";
import { Hero, CategoryCarousel, BrandBanner, WhyChoose, StoreStrip } from "@/components/store/HomeSections";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    await seedDatabase();
  } catch (e) {
    console.error("seed failed", e);
  }
  const [cats, featured, arrivals, deals] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)).limit(12),
    db.select().from(products).where(eq(products.isFeatured, true)).orderBy(desc(products.soldCount)).limit(10),
    db.select().from(products).where(eq(products.isNewArrival, true)).orderBy(desc(products.createdAt)).limit(5),
    db.select().from(products).where(eq(products.isOnSale, true)).orderBy(desc(products.ratingAvg)).limit(5),
  ]);
  return { cats, featured, arrivals, deals };
}

export default async function HomePage() {
  const { cats, featured, arrivals, deals } = await getData();

  return (
    <div>
      <Hero />
      <StoreStrip />
      <CategoryCarousel categories={cats} />
      <BrandBanner />

      {/* Popular */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <SectionTitle
          title="Popular Products"
          subtitle="Best sellers across all Donwise stores in Owerri"
          action={<Link href="/shop" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-600 hover:text-brand-800">View All Products <ArrowRight size={14} /></Link>}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={{ ...p, images: (p.images as string[]) || [] }} compact />
          ))}
        </div>
      </section>

      {/* New arrivals strip */}
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <SectionTitle
            title="New Arrivals"
            subtitle="Fresh stock — just landed at our Owerri stores"
            action={<Link href="/shop?sort=newest" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-600 hover:text-brand-800">View All <ArrowRight size={14} /></Link>}
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {arrivals.map((p) => (
              <ProductCard key={p.id} product={{ ...p, images: (p.images as string[]) || [] }} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Deals */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionTitle
          title="Hot Deals 🔥"
          subtitle="Discounted prices — while stock lasts"
          action={<Link href="/deals" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-600 hover:text-brand-800">All Deals <ArrowRight size={14} /></Link>}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {deals.map((p) => (
            <ProductCard key={p.id} product={{ ...p, images: (p.images as string[]) || [] }} compact />
          ))}
        </div>
      </section>

      <WhyChoose />

      {/* Visit store banner */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-violet-600 p-8 text-white sm:p-10 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-100">Visit Our Stores</p>
            <h3 className="mt-2 text-2xl font-black sm:text-3xl">Come, See & Test Before You Buy</h3>
            <p className="mt-2 text-sm text-brand-50">12 Douglas Road, Owerri • Shop B14 Somachi Plaza, Ikenegbu. Open Mon–Sat, 8am–8pm.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/contact" className="rounded-xl bg-white px-6 py-3 text-xs font-black uppercase tracking-wide text-brand-700 hover:bg-brand-50">Get Directions</Link>
              <a href="tel:+2348031234567" className="rounded-xl border border-white/40 px-6 py-3 text-xs font-black uppercase tracking-wide text-white hover:bg-white/10">Call: 0803 123 4567</a>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 lg:mt-0">
            {[
              { t: "5+", s: "Stores in Owerri" },
              { t: "12k+", s: "Happy Customers" },
              { t: "4.9★", s: "Google Rating" },
            ].map((x) => (
              <div key={x.s} className="rounded-2xl bg-white/10 p-4 text-center ring-1 ring-white/20 backdrop-blur">
                <p className="text-2xl font-black">{x.t}</p>
                <p className="mt-1 text-[11px] font-semibold text-brand-100">{x.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
