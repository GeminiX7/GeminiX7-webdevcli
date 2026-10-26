import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlists, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ items: [] });
  const rows = await db.select({ wish: wishlists, product: products })
    .from(wishlists).innerJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.userId, user.id));
  return NextResponse.json({ items: rows.map((r) => ({ id: r.wish.id, productId: r.wish.productId, product: r.product })) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required", guest: true }, { status: 401 });
  const { productId } = await req.json();
  const existing = await db.select().from(wishlists)
    .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, Number(productId)))).limit(1);
  if (existing[0]) return NextResponse.json({ item: existing[0], exists: true });
  const [row] = await db.insert(wishlists).values({ userId: user.id, productId: Number(productId) }).returning();
  return NextResponse.json({ item: row }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  await db.delete(wishlists).where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, Number(productId))));
  return NextResponse.json({ ok: true });
}
