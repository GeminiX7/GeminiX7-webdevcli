import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getSessionUser, requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const productId = sp.get("productId");
  if (productId) {
    const rows = await db.select().from(reviews)
      .where(eq(reviews.productId, Number(productId))).orderBy(desc(reviews.createdAt)).limit(20);
    return NextResponse.json({ reviews: rows });
  }
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(100);
  return NextResponse.json({ reviews: rows });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  const body = await req.json();
  const { productId, rating, title, comment, authorName } = body;
  if (!productId || !rating) return NextResponse.json({ error: "Product and rating required" }, { status: 400 });
  const [row] = await db.insert(reviews).values({
    productId: Number(productId), userId: user?.id ?? null,
    authorName: authorName || user?.name || "Verified Buyer",
    rating: Math.min(5, Math.max(1, Number(rating))), title: title || null, comment: comment || null,
  }).returning();
  // update product rating avg
  const agg = await db.select({ avg: sql<number>`avg(${reviews.rating})`, count: sql<number>`count(*)` })
    .from(reviews).where(eq(reviews.productId, Number(productId)));
  await db.update(products).set({
    ratingAvg: Number(agg[0]?.avg || rating),
    ratingCount: Number(agg[0]?.count || 1),
  }).where(eq(products.id, Number(productId)));
  return NextResponse.json({ review: row }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(reviews).where(eq(reviews.id, Number(id)));
  return NextResponse.json({ ok: true });
}
