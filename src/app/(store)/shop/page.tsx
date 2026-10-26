"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard, CardProduct } from "@/components/store/ProductCard";
import { ProductSkeleton, EmptyState, Button, PageLoader } from "@/components/ui";
import { STORE_META, cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

type Category = { id: number; name: string; slug: string; store: string };
type Brand = { id: number; name: string; slug: string };

const SORTS = [
  { v: "featured", l: "Most Popular" },
  { v: "newest", l: "Newest First" },
  { v: "price_asc", l: "Price: Low to High" },
  { v: "price_desc", l: "Price: High to Low" },
  { v: "rating", l: "Top Rated" },
  { v: "name", l: "Name A–Z" },
];

const STORES = ["computers", "iphone", "games", "gadgets", "accessories"];

function ShopInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const search = sp.get("search") || "";
  const category = sp.get("category") || "";
  const brand = sp.get("brand") || "";
  const store = sp.get("store") || "";
  const sort = sp.get("sort") || "featured";
  const sale = sp.get("sale") || "";

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ]).then(([c, b]) => {
      setCats(c.categories || []);
      setBrands(b.brands || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (store) params.set("store", store);
    if (sort) params.set("sort", sort);
    if (sale) params.set("sale", sale);
    params.set("page", String(page));
    params.set("limit", "18");
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((j) => {
        setProducts(j.products || []);
        setTotal(j.total || 0);
        setTotalPages(j.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, brand, store, sort, sale, page]);

  useEffect(() => { setPage(1); }, [search, category, brand, store, sort, sale]);

  const set = (k: string, v: string) => {
    const params = new URLSearchParams(sp.toString());
    if (v) params.set(k, v);
    else params.delete(k);
    router.push(`/shop?${params.toString()}`);
  };

  const clearAll = () => router.push("/shop");
  const hasFilters = search || category || brand || store || sale;

  const title = store && STORE_META[store] ? STORE_META[store].label : category ? cats.find((c) => c.slug === category)?.name || "Shop" : search ? `Results for "${search}"` : "Shop All Products";

  const Filters = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2.5 text-xs font-black uppercase tracking-widest text-slate-500">Stores</h4>
        <div className="space-y-1">
          <button onClick={() => set("store", "")} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold", !store ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100")}>All Stores</button>
          {STORES.map((s) => (
            <button key={s} onClick={() => set("store", s)} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold", store === s ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100")}>
              {STORE_META[s].label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2.5 text-xs font-black uppercase tracking-widest text-slate-500">Categories</h4>
        <div className="max-h-56 space-y-1 overflow-y-auto">
          <button onClick={() => set("category", "")} className={cn("flex w-full rounded-xl px-3 py-2 text-left text-sm", !category ? "bg-brand-50 font-bold text-brand-700" : "text-slate-600 hover:bg-slate-50")}>All Categories</button>
          {cats.filter((c) => !store || c.store === store).map((c) => (
            <button key={c.id} onClick={() => set("category", c.slug)} className={cn("flex w-full rounded-xl px-3 py-2 text-left text-sm", category === c.slug ? "bg-brand-50 font-bold text-brand-700" : "text-slate-600 hover:bg-slate-50")}>{c.name}</button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2.5 text-xs font-black uppercase tracking-widest text-slate-500">Brands</h4>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <button key={b.id} onClick={() => set("brand", brand === b.slug ? "" : b.slug)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-bold transition", brand === b.slug ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-brand-300")}>{b.name}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={sale === "true"} onChange={(e) => set("sale", e.target.checked ? "true" : "")} className="h-4 w-4 rounded accent-red-500" />
          On sale only 🔥
        </label>
      </div>
      {hasFilters && <Button variant="outline" size="sm" className="w-full" onClick={clearAll}>Clear all filters</Button>}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Donwise Stores • Owerri</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{loading ? "Searching products..." : `${total} product${total === 1 ? "" : "s"} found`}</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-36 rounded-2xl border border-slate-100 bg-white p-5">{Filters}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex items-center gap-3">
            <button onClick={() => setFiltersOpen(true)} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 lg:hidden">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs font-semibold text-slate-500 sm:block">Sort by:</span>
              <select value={sort} onChange={(e) => set("sort", e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-brand-500">
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-8 w-8" />}
              title="No products found"
              message="Try adjusting your search or filters — or check out our deals for discounted items."
              action={<Button onClick={clearAll}>Clear Filters</Button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {products.map((p) => <ProductCard key={p.id} product={p} compact />)}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                  <span className="px-3 text-sm font-bold text-slate-600">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-ink-900/60" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 fade-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100"><X size={16} /></button>
            </div>
            {Filters}
            <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>Show {total} results</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading shop..." />}>
      <ShopInner />
    </Suspense>
  );
}
