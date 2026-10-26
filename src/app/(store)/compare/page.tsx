"use client";

import Link from "next/link";
import { GitCompareArrows, X, ShoppingCart } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { EmptyState, Button, Stars, Price } from "@/components/ui";
import { productImage } from "@/lib/utils";

export default function ComparePage() {
  const { compare, toggleCompare, clearCompare, addToCart } = useShop();

  if (compare.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <EmptyState
          icon={<GitCompareArrows className="h-8 w-8" />}
          title="Nothing to compare"
          message="Add up to 4 products to compare specs, prices and ratings side by side."
          action={<Link href="/shop"><Button>Browse Products</Button></Link>}
        />
      </div>
    );
  }

  const rows: { label: string; get: (p: (typeof compare)[0]) => React.ReactNode }[] = [
    { label: "Price", get: (p) => <Price price={p.price} compareAt={p.compareAtPrice} /> },
    { label: "Rating", get: (p) => <Stars value={p.ratingAvg || 0} count={p.ratingCount} /> },
    { label: "Stock", get: (p) => <span className={(p.stock || 0) > 0 ? "font-bold text-emerald-600" : "font-bold text-red-500"}>{(p.stock || 0) > 0 ? `${p.stock} in stock` : "Out of stock"}</span> },
    { label: "Store", get: (p) => <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold uppercase">{p.store}</span> },
    { label: "Summary", get: (p) => <span className="text-xs text-slate-600">{p.shortDescription || "—"}</span> },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Compare Products</h1>
          <p className="text-sm text-slate-500">{compare.length} of 4 selected</p>
        </div>
        <button onClick={clearCompare} className="text-[13px] font-bold text-red-500">Clear all</button>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="w-32 p-4 text-left text-xs uppercase text-slate-400">Product</th>
              {compare.map((p) => (
                <th key={p.id} className="p-4 text-left align-top">
                  <div className="relative">
                    <button onClick={() => toggleCompare(p)} className="absolute -left-1 -top-1 z-10 grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-white"><X size={12} /></button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={productImage({ images: p.images, name: p.name })} alt={p.name} className="h-32 w-full rounded-2xl object-cover" />
                    <Link href={`/product/${p.slug}`} className="mt-2 line-clamp-2 block text-[13px] font-bold text-slate-900 hover:text-brand-700">{p.name}</Link>
                    <Button size="sm" className="mt-2 w-full" onClick={() => addToCart(p)}><ShoppingCart size={13} /> Add to Cart</Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className={i % 2 === 0 ? "bg-slate-50/60" : ""}>
                <td className="p-4 text-xs font-black uppercase tracking-wide text-slate-500">{r.label}</td>
                {compare.map((p) => <td key={p.id} className="p-4 align-top">{r.get(p)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
