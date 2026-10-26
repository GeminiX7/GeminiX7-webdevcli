import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, sql, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  // product counts
  const counts = await db.select({ categoryId: products.categoryId, count: sql<number>`count(*)` })
    .from(products).groupBy(products.categoryId);
  const map: Record<number, number> = {};
  counts.forEach((c) => { if (c.categoryId) map[c.categoryId] = Number(c.count); });
  return NextResponse.json({ categories: cats.map((c) => ({ ...c, productCount: map[c.id] || 0 })) });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, description, imageUrl, icon, store, sortOrder, isActive } = body;
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const slug = body.slug || slugify(name);
    const [row] = await db.insert(categories).values({
      name, slug, description: description || null, imageUrl: imageUrl || null,
      icon: icon || "Laptop", store: store || "computers",
      sortOrder: sortOrder ?? 0, isActive: isActive ?? true,
    }).returning();
    return NextResponse.json({ category: row }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg.includes("unique") ? "Slug already exists" : "Failed to create category" }, { status: 500 });
  }
}
