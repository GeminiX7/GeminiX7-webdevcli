import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ items: [] });
  const rows = await db.select({ cart: cartItems, product: products })
    .from(cartItems).innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, user.id));
  return NextResponse.json({
    items: rows.map((r) => ({ id: r.cart.id, productId: r.cart.productId, quantity: r.cart.quantity, product: r.product })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required", guest: true }, { status: 401 });
  const { productId, quantity } = await req.json();
  const qty = Math.max(1, Number(quantity || 1));
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, Number(productId)))).limit(1);
  if (existing[0]) {
    const [row] = await db.update(cartItems).set({ quantity: existing[0].quantity + qty })
      .where(eq(cartItems.id, existing[0].id)).returning();
    return NextResponse.json({ item: row });
  }
  const [row] = await db.insert(cartItems).values({ userId: user.id, productId: Number(productId), quantity: qty }).returning();
  return NextResponse.json({ item: row }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { productId, quantity } = await req.json();
  const qty = Number(quantity);
  if (qty <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, Number(productId))));
    return NextResponse.json({ ok: true, removed: true });
  }
  const [row] = await db.update(cartItems).set({ quantity: qty })
    .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, Number(productId)))).returning();
  return NextResponse.json({ item: row });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const productId = sp.get("productId");
  if (productId) {
    await db.delete(cartItems).where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, Number(productId))));
  } else {
    await db.delete(cartItems).where(eq(cartItems.userId, user.id));
  }
  return NextResponse.json({ ok: true });
}
