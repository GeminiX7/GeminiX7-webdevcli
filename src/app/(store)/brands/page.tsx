"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { PageLoader } from "@/components/ui";

type Brand = { id: number; name: string; slug: string; description?: string | null; isFeatured: boolean; productCount: number };

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then((j) => setBrands(j.brands || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10"><PageLoader message="Loading brands..." /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Shop by Brand</h1>
      <p className="mt-1 text-sm text-slate-500">100% genuine products from the world&apos;s leading brands.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((b) => (
          <Link key={b.id} href={`/shop?brand=${b.slug}`} className="group rounded-3xl border border-slate-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-ink-900 text-xl font-black text-white">
              {b.name[0]}
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 font-extrabold text-slate-900 group-hover:text-brand-700">
              {b.name}
              {b.isFeatured && <Award size={15} className="text-amber-500" />}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">{b.description || `${b.productCount} products`}</p>
            <p className="mt-2 text-xs font-bold text-brand-600">{b.productCount} product{b.productCount === 1 ? "" : "s"}</p>
            <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-400 group-hover:text-brand-600">Shop now <ArrowRight size={12} /></p>
          </Link>
        ))}
      </div>
    </div>
  );
}
