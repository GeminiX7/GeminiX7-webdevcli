"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { Button, Input, Textarea, Select, Modal, Badge, PageLoader, EmptyState } from "@/components/ui";
import { useShop } from "@/context/ShopContext";
import { formatNaira, productImage, slugify, cn } from "@/lib/utils";
import { Package } from "lucide-react";

type Product = {
  id: number; name: string; slug: string; sku: string; price: number; compareAtPrice?: number | null;
  categoryId?: number | null; brandId?: number | null; store: string; stock: number;
  images: string[]; description?: string | null; shortDescription?: string | null;
  specs?: Record<string, string>; features?: string[]; tags?: string[];
  isFeatured: boolean; isNewArrival: boolean; isOnSale: boolean; isActive: boolean;
  soldCount: number; ratingAvg: number;
  category?: { name: string } | null; brand?: { name: string } | null;
};

const EMPTY: Partial<Product> & { imagesText?: string; featuresText?: string; tagsText?: string; specsText?: string } = {
  name: "", price: 0, compareAtPrice: null, store: "computers", stock: 10, categoryId: null, brandId: null,
  description: "", shortDescription: "", imagesText: "", featuresText: "", tagsText: "", specsText: "",
  isFeatured: false, isNewArrival: false, isOnSale: false, isActive: true,
};

function ProductsInner() {
  const sp = useSearchParams();
  const { toast } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(sp.get("q") || "");
  const [storeF, setStoreF] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c, b] = await Promise.all([
        fetch("/api/products?limit=100").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/brands").then((r) => r.json()),
      ]);
      setProducts(p.products || []);
      setCats(c.categories || []);
      setBrands(b.brands || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => {
    if (storeF && p.store !== storeF) return false;
    if (q && !`${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      ...p,
      imagesText: (p.images || []).join("\n"),
      featuresText: (p.features || []).join("\n"),
      tagsText: (p.tags || []).join(", "),
      specsText: p.specs ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join("\n") : "",
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.name || !form.price) return toast("Missing fields", { message: "Name and price are required", type: "error" });
    setSaving(true);
    const specs: Record<string, string> = {};
    (form.specsText || "").split("\n").forEach((line) => {
      const i = line.indexOf(":");
      if (i > 0) specs[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    const payload = {
      name: form.name,
      slug: editing?.slug || `${slugify(form.name || "")}-${Date.now().toString(36)}`,
      sku: editing?.sku || `DNW-${Date.now().toString(36).toUpperCase()}`,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      store: form.store, stock: Number(form.stock ?? 0),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      brandId: form.brandId ? Number(form.brandId) : null,
      description: form.description, shortDescription: form.shortDescription,
      images: (form.imagesText || "").split("\n").map((s) => s.trim()).filter(Boolean),
      features: (form.featuresText || "").split("\n").map((s) => s.trim()).filter(Boolean),
      tags: (form.tagsText || "").split(",").map((s) => s.trim()).filter(Boolean),
      specs,
      isFeatured: !!form.isFeatured, isNewArrival: !!form.isNewArrival, isOnSale: !!form.isOnSale, isActive: form.isActive !== false,
    };
    // optimistic
    const prev = [...products];
    try {
      if (editing) {
        setProducts((ps) => ps.map((x) => x.id === editing.id ? { ...x, ...payload, compareAtPrice: payload.compareAtPrice ?? undefined } as Product : x));
        const r = await fetch(`/api/products/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setProducts((ps) => ps.map((x) => x.id === editing.id ? { ...j.product, category: x.category, brand: x.brand } : x));
        toast("Product updated", { message: payload.name });
      } else {
        const r = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setProducts((ps) => [{ ...j.product }, ...ps]);
        toast("Product created", { message: payload.name });
      }
      setModal(false);
    } catch (e) {
      setProducts(prev);
      toast("Save failed", { message: e instanceof Error ? e.message : "Try again", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!delId) return;
    const prev = [...products];
    setProducts((ps) => ps.filter((p) => p.id !== delId));
    setDelId(null);
    try {
      await fetch(`/api/products/${delId}`, { method: "DELETE" });
      toast("Product deleted", { type: "info" });
    } catch {
      setProducts(prev);
      toast("Delete failed", { type: "error" });
    }
  };

  const f = (k: string, v: unknown) => setForm({ ...form, [k]: v });

  if (loading) return <PageLoader message="Loading products..." />;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">{products.length} products • {filtered.length} shown</p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> Add Product</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex h-10 min-w-52 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
          <Search size={15} className="text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU..." className="w-full bg-transparent text-sm outline-none" />
          {q && <button onClick={() => setQ("")}><X size={14} /></button>}
        </div>
        <select value={storeF} onChange={(e) => setStoreF(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold">
          <option value="">All Stores</option>
          <option value="computers">Computers</option>
          <option value="iphone">iPhone Store</option>
          <option value="games">Games & PS</option>
          <option value="gadgets">Gadgets</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Package className="h-8 w-8" />} title="No products" message="Try a different search or add a new product." action={<Button onClick={openNew}><Plus size={15} /> Add Product</Button>} />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="p-4">Product</th>
                <th className="p-4">Store</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Sold</th>
                <th className="p-4">Flags</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImage({ images: p.images, name: p.name })} alt="" className="h-12 w-14 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="line-clamp-1 max-w-56 font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.sku} • {p.brand?.name || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase">{p.store}</span></td>
                  <td className="p-4 font-bold">{formatNaira(p.price)}</td>
                  <td className="p-4"><b className={p.stock <= 5 ? "text-red-600" : "text-emerald-600"}>{p.stock}</b></td>
                  <td className="p-4 text-slate-500">{p.soldCount}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {p.isFeatured && <Badge tone="blue">Feat</Badge>}
                      {p.isOnSale && <Badge tone="red">Sale</Badge>}
                      {!p.isActive && <Badge tone="slate">Hidden</Badge>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(p)} className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100"><Pencil size={14} /></button>
                      <button onClick={() => setDelId(p.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Product" : "Add New Product"} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Input label="Product Name *" value={form.name || ""} onChange={(e) => f("name", e.target.value)} placeholder="e.g. Apple MacBook Air M3 13-inch" /></div>
          <Input label="Price (₦) *" type="number" value={form.price as number} onChange={(e) => f("price", e.target.value)} />
          <Input label="Compare-at Price (₦)" type="number" placeholder="For sale items" value={(form.compareAtPrice as number) || ""} onChange={(e) => f("compareAtPrice", e.target.value)} />
          <Select label="Store" value={form.store as string} onChange={(e) => f("store", e.target.value)}>
            <option value="computers">Computers</option>
            <option value="iphone">iPhone Store</option>
            <option value="games">Games & PlayStation</option>
            <option value="gadgets">Gadgets</option>
            <option value="accessories">Accessories</option>
          </Select>
          <Input label="Stock" type="number" value={form.stock as number} onChange={(e) => f("stock", e.target.value)} />
          <Select label="Category" value={(form.categoryId as number) || ""} onChange={(e) => f("categoryId", e.target.value)}>
            <option value="">— Select —</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Brand" value={(form.brandId as number) || ""} onChange={(e) => f("brandId", e.target.value)}>
            <option value="">— Select —</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
          <div className="sm:col-span-2"><Input label="Short Description" value={form.shortDescription || ""} onChange={(e) => f("shortDescription", e.target.value)} placeholder="e.g. 13.6-inch | 8GB | 256GB SSD" /></div>
          <div className="sm:col-span-2"><Textarea label="Full Description" rows={3} value={form.description || ""} onChange={(e) => f("description", e.target.value)} /></div>
          <div className="sm:col-span-2"><Textarea label="Image URLs (one per line)" rows={2} value={form.imagesText || ""} onChange={(e) => f("imagesText", e.target.value)} placeholder="https://..." /></div>
          <div className="sm:col-span-2"><Textarea label="Specifications (Key: Value per line)" rows={2} value={form.specsText || ""} onChange={(e) => f("specsText", e.target.value)} placeholder={"Display: 13.6-inch\nRAM: 8GB"} /></div>
          <Textarea label="Features (one per line)" rows={2} value={form.featuresText || ""} onChange={(e) => f("featuresText", e.target.value)} />
          <Input label="Tags (comma separated)" value={form.tagsText || ""} onChange={(e) => f("tagsText", e.target.value)} />
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            {[["isFeatured", "Featured"], ["isNewArrival", "New Arrival"], ["isOnSale", "On Sale"], ["isActive", "Active"]].map(([k, l]) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={!!(form as Record<string, unknown>)[k]} onChange={(e) => f(k, e.target.checked)} className="h-4 w-4 rounded accent-blue-600" /> {l}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={saving} className="flex-1" onClick={save}>{editing ? "Save Changes" : "Create Product"}</Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete Product?">
        <p className="text-sm text-slate-600">This will permanently remove the product. This action cannot be undone.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setDelId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={doDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminProductsPage() {
  return <Suspense fallback={<PageLoader />}><ProductsInner /></Suspense>;
}
