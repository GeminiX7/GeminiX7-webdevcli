import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product: rows[0] });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const b = await req.json();
    const [row] = await db.update(products).set({
      name: b.name, slug: b.slug, sku: b.sku, description: b.description,
      shortDescription: b.shortDescription, price: b.price !== undefined ? Number(b.price) : undefined,
      compareAtPrice: b.compareAtPrice === null ? null : (b.compareAtPrice !== undefined ? Number(b.compareAtPrice) : undefined),
      costPrice: b.costPrice === null ? null : (b.costPrice !== undefined ? Number(b.costPrice) : undefined),
      categoryId: b.categoryId === null ? null : b.categoryId,
      brandId: b.brandId === null ? null : b.brandId,
      store: b.store, stock: b.stock !== undefined ? Number(b.stock) : undefined,
      images: b.images, specs: b.specs, features: b.features, tags: b.tags,
      isFeatured: b.isFeatured, isNewArrival: b.isNewArrival, isOnSale: b.isOnSale, isActive: b.isActive,
      updatedAt: new Date(),
    }).where(eq(products.id, Number(id))).returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product: row });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.delete(products).where(eq(products.id, Number(id)));
  return NextResponse.json({ ok: true });
}
