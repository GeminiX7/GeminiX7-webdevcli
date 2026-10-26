"use client";

import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { ProductCard } from "@/components/store/ProductCard";
import { EmptyState, Button } from "@/components/ui";

export default function WishlistPage() {
  const { wishlist } = useShop();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-black text-slate-900">My Wishlist</h1>
      <p className="mt-1 text-sm text-slate-500">{wishlist.length} saved item{wishlist.length === 1 ? "" : "s"}</p>
      {wishlist.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Heart className="h-8 w-8" />}
            title="No saved items yet"
            message="Tap the heart icon on any product to save it here for later."
            action={<Link href="/shop"><Button>Discover Products <ArrowRight size={15} /></Button></Link>}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((p) => <ProductCard key={p.id} product={p} compact />)}
        </div>
      )}
    </div>
  );
}
