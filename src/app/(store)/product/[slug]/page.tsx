"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ShoppingCart, GitCompareArrows, Truck, ShieldCheck, RotateCcw, Minus, Plus, ChevronRight, BadgeCheck, Store, Zap } from "lucide-react";
import { useShop, ProductLite } from "@/context/ShopContext";
import { Price, Stars, Badge, Button, PageLoader, EmptyState, Textarea, Input } from "@/components/ui";
import { ProductCard, CardProduct } from "@/components/store/ProductCard";
import { discountPercent, cn, formatNaira } from "@/lib/utils";

type FullProduct = CardProduct & {
  description?: string | null; specs?: Record<string, string>; features?: string[]; tags?: string[];
  sku?: string; soldCount?: number; category?: { name: string; slug: string } | null; brand?: { name: string; slug: string } | null;
};

type Review = { id: number; authorName: string; rating: number; title?: string | null; comment?: string | null; createdAt: string };

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted, toggleCompare, user, toast } = useShop();
  const [product, setProduct] = useState<FullProduct | null>(null);
  const [related, setRelated] = useState<CardProduct[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [revForm, setRevForm] = useState({ rating: 5, title: "", comment: "", authorName: "" });
  const [revLoading, setRevLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?slug=${slug}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.product) {
          setProduct(j.product);
          setRelated(j.related || []);
          return fetch(`/api/reviews?productId=${j.product.id}`).then((r) => r.json());
        }
      })
      .then((j) => { if (j?.reviews) setReviews(j.reviews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10"><PageLoader message="Loading product..." /></div>;
  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <EmptyState title="Product not found" message="This product may have been removed." action={<Button onClick={() => router.push("/shop")}>Back to Shop</Button>} />
      </div>
    );
  }

  const pct = discountPercent(product.price, product.compareAtPrice);
  const images = product.images?.length ? product.images : [];
  const out = product.stock <= 0;
  const wished = isWishlisted(product.id);
  const lite: ProductLite = { id: product.id, name: product.name, slug: product.slug, price: product.price, compareAtPrice: product.compareAtPrice, images, stock: product.stock, ratingAvg: product.ratingAvg, ratingCount: product.ratingCount, shortDescription: product.shortDescription, store: product.store };

  const buyNow = () => {
    addToCart(lite, qty);
    router.push("/checkout");
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revForm.comment) return toast("Write a review", { message: "Please add your comment", type: "error" });
    setRevLoading(true);
    try {
      const r = await fetch("/api/reviews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, rating: revForm.rating, title: revForm.title, comment: revForm.comment, authorName: revForm.authorName || user?.name }),
      });
      const j = await r.json();
      if (r.ok) {
        setReviews((prev) => [j.review, ...prev]);
        setRevForm({ rating: 5, title: "", comment: "", authorName: "" });
        toast("Review submitted", { message: "Thanks for your feedback! ⭐" });
      } else toast("Failed", { message: j.error, type: "error" });
    } catch {
      toast("Failed", { message: "Try again", type: "error" });
    } finally {
      setRevLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:text-brand-600">Shop</Link>
        <ChevronRight size={12} />
        {product.category && (<><Link href={`/shop?category=${product.category.slug}`} className="hover:text-brand-600">{product.category.name}</Link><ChevronRight size={12} /></>)}
        <span className="truncate font-semibold text-slate-700">{product.name.slice(0, 40)}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[imgIdx]} alt={product.name} className="aspect-[4/3] w-full object-cover" />
            <div className="absolute left-4 top-4 flex gap-2">
              {pct && <span className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-black text-white">-{pct}% OFF</span>}
              {product.isNewArrival && <span className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-black uppercase text-white">New</span>}
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((im, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={cn("h-20 w-24 overflow-hidden rounded-xl border-2 bg-white", i === imgIdx ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && <Link href={`/shop?brand=${product.brand.slug}`}><Badge tone="blue">{product.brand.name}</Badge></Link>}
            <Badge tone={out ? "red" : product.stock <= 5 ? "amber" : "green"}>{out ? "Out of Stock" : product.stock <= 5 ? `Only ${product.stock} left!` : "In Stock"}</Badge>
            {product.soldCount ? <span className="text-xs font-semibold text-slate-500">🔥 {product.soldCount} sold</span> : null}
          </div>
          <h1 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">{product.name}</h1>
          {product.shortDescription && <p className="mt-1 text-sm font-medium text-slate-500">{product.shortDescription}</p>}
          <div className="mt-2 flex items-center gap-3">
            <Stars value={product.ratingAvg || 0} count={product.ratingCount} size={16} />
            <span className="text-xs text-slate-400">SKU: {product.sku}</span>
          </div>
          <div className="mt-4 flex items-end gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
            <Price price={product.price} compareAt={product.compareAtPrice} size="lg" />
            {pct && <span className="mb-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600">You save {formatNaira((product.compareAtPrice || 0) - product.price)}</span>}
          </div>

          {/* Qty + actions */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"><Minus size={15} /></button>
              <span className="min-w-8 text-center font-black">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"><Plus size={15} /></button>
            </div>
            <Button disabled={out} onClick={() => addToCart(lite, qty)} className="h-12 flex-1 sm:flex-none sm:px-8">
              <ShoppingCart size={17} /> Add to Cart
            </Button>
            <Button disabled={out} variant="dark" onClick={buyNow} className="h-12 flex-1 sm:flex-none sm:px-8">
              <Zap size={17} /> Buy Now
            </Button>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => toggleWishlist(lite)} className={cn("flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-[13px] font-bold transition sm:flex-none sm:px-5", wished ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 bg-white text-slate-600 hover:border-red-200")}>
              <Heart size={15} className={wished ? "fill-red-500 text-red-500" : ""} /> {wished ? "Wishlisted" : "Wishlist"}
            </button>
            <button onClick={() => toggleCompare(lite)} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-600 transition hover:border-brand-300 sm:flex-none sm:px-5">
              <GitCompareArrows size={15} /> Compare
            </button>
          </div>

          {/* Trust */}
          <div className="mt-5 grid grid-cols-1 gap-2.5 rounded-2xl border border-slate-100 bg-white p-4 text-[13px] sm:grid-cols-3">
            <div className="flex items-center gap-2"><Truck size={18} className="text-brand-600" /><span><b>Free delivery</b><br /><span className="text-xs text-slate-500">Owerri, orders ₦250k+</span></span></div>
            <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-600" /><span><b>1yr warranty</b><br /><span className="text-xs text-slate-500">100% genuine</span></span></div>
            <div className="flex items-center gap-2"><RotateCcw size={18} className="text-amber-600" /><span><b>7-day returns</b><br /><span className="text-xs text-slate-500">No questions asked</span></span></div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-brand-50 p-3.5 text-[13px] text-brand-900">
            <Store size={17} className="shrink-0" />
            <span>Available for pickup at <b>12 Douglas Road, Owerri</b> — open Mon–Sat, 8am–8pm.</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <div className="flex gap-1 border-b border-slate-100 p-2">
          {(["desc", "specs", "reviews"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("rounded-xl px-5 py-2.5 text-sm font-bold capitalize transition", tab === t ? "bg-ink-900 text-white" : "text-slate-500 hover:bg-slate-50")}>
              {t === "desc" ? "Description" : t === "specs" ? "Specifications" : `Reviews (${reviews.length})`}
            </button>
          ))}
        </div>
        <div className="p-5 sm:p-8">
          {tab === "desc" && (
            <div>
              <p className="leading-relaxed text-slate-600">{product.description || "No description available."}</p>
              {product.features && product.features.length > 0 && (
                <div className="mt-5">
                  <h4 className="mb-2 font-extrabold text-slate-900">Key Features</h4>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600"><BadgeCheck size={16} className="shrink-0 text-emerald-500" /> {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {tab === "specs" && (
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              {product.specs && Object.keys(product.specs).length > 0 ? Object.entries(product.specs).map(([k, v], i) => (
                <div key={k} className={cn("grid grid-cols-2 gap-4 px-5 py-3 text-sm", i % 2 === 0 ? "bg-slate-50" : "bg-white")}>
                  <span className="font-bold text-slate-700">{k}</span>
                  <span className="text-slate-600">{v}</span>
                </div>
              )) : <p className="p-5 text-sm text-slate-500">No specifications listed.</p>}
            </div>
          )}
          {tab === "reviews" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-4">
                {reviews.length === 0 && <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">No reviews yet. Be the first to review this product! ⭐</p>}
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{r.authorName}</p>
                      <Stars value={r.rating} size={13} />
                    </div>
                    {r.title && <p className="mt-1 text-[13px] font-bold text-slate-700">{r.title}</p>}
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.comment}</p>
                    <p className="mt-2 text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={submitReview} className="h-fit space-y-3 rounded-2xl bg-slate-50 p-5">
                <h4 className="font-extrabold text-slate-900">Write a Review</h4>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} onClick={() => setRevForm({ ...revForm, rating: n })} className={n <= revForm.rating ? "text-amber-400" : "text-slate-300"}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" /></svg>
                      </button>
                    ))}
                  </div>
                </div>
                <Input placeholder="Your name" value={revForm.authorName || user?.name || ""} onChange={(e) => setRevForm({ ...revForm, authorName: e.target.value })} />
                <Input placeholder="Review title" value={revForm.title} onChange={(e) => setRevForm({ ...revForm, title: e.target.value })} />
                <Textarea placeholder="Share your experience with this product..." rows={4} value={revForm.comment} onChange={(e) => setRevForm({ ...revForm, comment: e.target.value })} />
                <Button type="submit" loading={revLoading} className="w-full">Submit Review</Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-extrabold text-slate-900">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} compact />)}
          </div>
        </div>
      )}
    </div>
  );
}
