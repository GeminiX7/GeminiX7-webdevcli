"use client";

import Link from "next/link";
import { Heart, ShoppingCart, GitCompareArrows, Eye } from "lucide-react";
import { useShop, ProductLite } from "@/context/ShopContext";
import { Price, Stars } from "@/components/ui";
import { discountPercent, productImage, cn } from "@/lib/utils";

export type CardProduct = ProductLite & {
  shortDescription?: string | null;
  compareAtPrice?: number | null;
  ratingAvg?: number;
  ratingCount?: number;
  isNewArrival?: boolean;
  isOnSale?: boolean;
};

export function ProductCard({ product, compact }: { product: CardProduct; compact?: boolean }) {
  const { addToCart, toggleWishlist, isWishlisted, toggleCompare, compare } = useShop();
  const wished = isWishlisted(product.id);
  const inCompare = compare.some((p) => p.id === product.id);
  const pct = discountPercent(product.price, product.compareAtPrice);
  const img = productImage({ images: product.images, name: product.name });
  const out = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-600/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <Link href={`/product/${product.slug}`} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </Link>
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {pct && <span className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-black text-white shadow">-{pct}%</span>}
          {product.isNewArrival && <span className="rounded-lg bg-brand-600 px-2 py-1 text-[10px] font-black uppercase text-white shadow">New</span>}
        </div>
        {out && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-black uppercase tracking-wider text-white">Out of Stock</span>
          </div>
        )}
        {/* hover actions */}
        <div className="absolute right-2.5 top-2.5 z-20 flex flex-col gap-1.5 opacity-0 transition-all group-hover:opacity-100 max-lg:opacity-100">
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            title="Wishlist"
            className={cn("grid h-9 w-9 place-items-center rounded-xl bg-white shadow-lg transition hover:bg-red-50", wished ? "text-red-500" : "text-slate-500")}
          >
            <Heart size={16} className={wished ? "fill-red-500" : ""} />
          </button>
          <button
            type="button"
            onClick={() => toggleCompare(product)}
            title="Compare"
            className={cn("grid h-9 w-9 place-items-center rounded-xl bg-white shadow-lg transition hover:bg-brand-50", inCompare ? "text-brand-600" : "text-slate-500")}
          >
            <GitCompareArrows size={16} />
          </button>
          <Link href={`/product/${product.slug}`} title="Quick view" className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-500 shadow-lg transition hover:bg-slate-100">
            <Eye size={16} />
          </Link>
        </div>
      </div>
      <div className={cn("flex flex-1 flex-col", compact ? "p-3" : "p-4")}>
        <Link href={`/product/${product.slug}`} className="line-clamp-1 text-[13.5px] font-bold text-slate-900 hover:text-brand-700">
          {product.name}
        </Link>
        {!compact && product.shortDescription && (
          <p className="line-clamp-1 mt-0.5 text-[11.5px] text-slate-500">{product.shortDescription}</p>
        )}
        <div className="mt-1.5"><Price price={product.price} compareAt={product.compareAtPrice} size={compact ? "sm" : "md"} /></div>
        <div className="mt-1.5 flex items-center justify-between">
          <Stars value={product.ratingAvg || 0} count={product.ratingCount} size={12} />
        </div>
        <button
          type="button"
          disabled={out}
          onClick={() => addToCart(product)}
          className={cn("mt-3 flex h-9 items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wide transition active:scale-95 disabled:opacity-40",
            out ? "bg-slate-100 text-slate-400" : "bg-ink-900 text-white hover:bg-brand-600")}
        >
          <ShoppingCart size={14} /> {out ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
