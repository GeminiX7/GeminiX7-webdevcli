"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { ProductCard, CardProduct } from "@/components/store/ProductCard";
import { ProductSkeleton } from "@/components/ui";

export default function DealsPage() {
  const [items, setItems] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?sale=true&limit=40&sort=price_asc")
      .then((r) => r.json())
      .then((j) => setItems(j.products || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 p-6 text-white sm:p-8">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20"><Flame size={28} /></div>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Hot Deals 🔥</h1>
          <p className="text-sm text-white/85">Discounted prices across all Donwise stores — while stock lasts!</p>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} compact />)}
        </div>
      )}
    </div>
  );
}
