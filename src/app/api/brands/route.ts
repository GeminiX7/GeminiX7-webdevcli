import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brands, products } from "@/db/schema";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const all = await db.select().from(brands);
  const counts = await db.select({ brandId: products.brandId, count: sql<number>`count(*)` })
    .from(products).groupBy(products.brandId);
  const map: Record<number, number> = {};
  counts.forEach((c) => { if (c.brandId) map[c.brandId] = Number(c.count); });
  return NextResponse.json({ brands: all.map((b) => ({ ...b, productCount: map[b.id] || 0 })) });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const [row] = await db.insert(brands).values({
      name: body.name, slug: body.slug || slugify(body.name),
      description: body.description || null, logoUrl: body.logoUrl || null,
      isFeatured: body.isFeatured ?? false,
    }).returning();
    return NextResponse.json({ brand: row }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Brand already exists" }, { status: 500 });
  }
}
