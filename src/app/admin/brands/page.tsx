"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Award } from "lucide-react";
import { Button, Input, Textarea, Modal, EmptyState, PageLoader } from "@/components/ui";
import { useShop } from "@/context/ShopContext";
import { slugify } from "@/lib/utils";

type Brand = { id: number; name: string; slug: string; description?: string | null; logoUrl?: string | null; isFeatured: boolean; productCount?: number };

export default function AdminBrandsPage() {
  const { toast } = useShop();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: "", description: "", logoUrl: "", isFeatured: false });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then((j) => setBrands(j.brands || [])).finally(() => setLoading(false));
  }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", description: "", logoUrl: "", isFeatured: false }); setModal(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, description: b.description || "", logoUrl: b.logoUrl || "", isFeatured: b.isFeatured }); setModal(true); };

  const save = async () => {
    if (!form.name) return toast("Name required", { type: "error" });
    setSaving(true);
    try {
      if (editing) {
        const r = await fetch(`/api/brands/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug: editing.slug }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setBrands((ps) => ps.map((x) => x.id === editing.id ? { ...x, ...j.brand } : x));
        toast("Brand updated");
      } else {
        const r = await fetch("/api/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug: slugify(form.name) }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setBrands((ps) => [...ps, { ...j.brand, productCount: 0 }]);
        toast("Brand created");
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
    const prev = [...brands];
    setBrands((ps) => ps.filter((b) => b.id !== delId));
    setDelId(null);
    try {
      await fetch(`/api/brands/${delId}`, { method: "DELETE" });
      toast("Brand deleted", { type: "info" });
    } catch {
      setBrands(prev);
      toast("Delete failed", { type: "error" });
    }
  };

  if (loading) return <PageLoader message="Loading brands..." />;
  const f = (k: string, v: unknown) => setForm({ ...form, [k]: v });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Brands</h1>
          <p className="text-sm text-slate-500">{brands.length} brands</p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> Add Brand</Button>
      </div>

      {brands.length === 0 ? (
        <EmptyState icon={<Award className="h-8 w-8" />} title="No brands" action={<Button onClick={openNew}>Add Brand</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {brands.map((b) => (
            <div key={b.id} className="flex items-center gap-3.5 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-ink-900 text-xl font-black text-white">{b.name[0]}</div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-bold text-slate-900">{b.name} {b.isFeatured && <Award size={14} className="text-amber-500" />}</p>
                <p className="text-xs text-slate-500">{b.productCount || 0} products</p>
              </div>
              <button onClick={() => openEdit(b)} className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><Pencil size={14} /></button>
              <button onClick={() => setDelId(b.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Brand" : "Add Brand"}>
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => f("name", e.target.value)} />
          <Textarea label="Description" rows={2} value={form.description} onChange={(e) => f("description", e.target.value)} />
          <Input label="Logo URL" value={form.logoUrl} onChange={(e) => f("logoUrl", e.target.value)} placeholder="https://..." />
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isFeatured} onChange={(e) => f("isFeatured", e.target.checked)} className="h-4 w-4 accent-blue-600" /> Featured brand</label>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={saving} className="flex-1" onClick={save}>{editing ? "Save" : "Create"}</Button>
        </div>
      </Modal>

      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete Brand?">
        <p className="text-sm text-slate-600">Products of this brand will become unbranded.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setDelId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={doDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
