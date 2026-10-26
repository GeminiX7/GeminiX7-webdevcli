"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { Button, Input, Textarea, Select, Modal, EmptyState, PageLoader } from "@/components/ui";
import { useShop } from "@/context/ShopContext";
import { slugify } from "@/lib/utils";

type Cat = { id: number; name: string; slug: string; description?: string | null; imageUrl?: string | null; icon?: string; store: string; sortOrder: number; isActive: boolean; productCount?: number };

const EMPTY = { name: "", description: "", imageUrl: "", icon: "Laptop", store: "computers", sortOrder: 0, isActive: true };

export default function AdminCategoriesPage() {
  const { toast } = useShop();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((j) => setCats(j.categories || [])).finally(() => setLoading(false));
  }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c: Cat) => { setEditing(c); setForm({ name: c.name, description: c.description || "", imageUrl: c.imageUrl || "", icon: c.icon || "Laptop", store: c.store, sortOrder: c.sortOrder, isActive: c.isActive }); setModal(true); };

  const save = async () => {
    if (!form.name) return toast("Name required", { type: "error" });
    setSaving(true);
    try {
      if (editing) {
        const r = await fetch(`/api/categories/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug: editing.slug }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setCats((ps) => ps.map((x) => x.id === editing.id ? { ...x, ...j.category } : x));
        toast("Category updated");
      } else {
        const r = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug: slugify(form.name) }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setCats((ps) => [...ps, { ...j.category, productCount: 0 }]);
        toast("Category created");
      }
      setModal(false);
    } catch (e) {
      toast("Save failed", { message: e instanceof Error ? e.message : "", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!delId) return;
    const prev = [...cats];
    setCats((ps) => ps.filter((c) => c.id !== delId));
    setDelId(null);
    try {
      await fetch(`/api/categories/${delId}`, { method: "DELETE" });
      toast("Category deleted", { type: "info" });
    } catch {
      setCats(prev);
      toast("Delete failed", { type: "error" });
    }
  };

  if (loading) return <PageLoader message="Loading categories..." />;

  const f = (k: string, v: unknown) => setForm({ ...form, [k]: v });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">{cats.length} categories</p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> Add Category</Button>
      </div>

      {cats.length === 0 ? (
        <EmptyState icon={<FolderTree className="h-8 w-8" />} title="No categories" action={<Button onClick={openNew}>Add Category</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cats.map((c) => (
            <div key={c.id} className="flex items-center gap-3.5 rounded-3xl border border-slate-200 bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.imageUrl ? <img src={c.imageUrl} alt="" className="h-14 w-16 shrink-0 rounded-xl object-cover" /> : <div className="grid h-14 w-16 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><FolderTree size={22} /></div>}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900">{c.name}</p>
                <p className="text-[11px] uppercase text-slate-400">{c.store} • {c.productCount || 0} products {!c.isActive && "• hidden"}</p>
              </div>
              <button onClick={() => openEdit(c)} className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><Pencil size={14} /></button>
              <button onClick={() => setDelId(c.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Category" : "Add Category"}>
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => f("name", e.target.value)} />
          <Textarea label="Description" rows={2} value={form.description} onChange={(e) => f("description", e.target.value)} />
          <Input label="Image URL" value={form.imageUrl} onChange={(e) => f("imageUrl", e.target.value)} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Store" value={form.store} onChange={(e) => f("store", e.target.value)}>
              <option value="computers">Computers</option>
              <option value="iphone">iPhone Store</option>
              <option value="games">Games & PS</option>
              <option value="gadgets">Gadgets</option>
              <option value="accessories">Accessories</option>
            </Select>
            <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => f("sortOrder", Number(e.target.value))} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={(e) => f("isActive", e.target.checked)} className="h-4 w-4 accent-blue-600" /> Active</label>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={saving} className="flex-1" onClick={save}>{editing ? "Save" : "Create"}</Button>
        </div>
      </Modal>

      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete Category?">
        <p className="text-sm text-slate-600">Products in this category will become uncategorised.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setDelId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={doDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
