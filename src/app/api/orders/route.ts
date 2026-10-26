import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products, cartItems } from "@/db/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { getSessionUser, requireAdmin } from "@/lib/auth";
import { generateOrderNumber, generateTrackingNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const orderNumber = sp.get("orderNumber");
  const email = sp.get("email");
  const user = await getSessionUser();

  // Tracking lookup (public with order number + email)
  if (orderNumber) {
    const rows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (!rows[0]) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (email && rows[0].customerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, rows[0].id));
    return NextResponse.json({ order: rows[0], items });
  }

  // Admin: all orders
  if (user && (user.role === "admin" || user.role === "staff")) {
    const status = sp.get("status");
    const where = status ? eq(orders.status, status) : undefined;
    const all = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(100);
    const ids = all.map((o) => o.id);
    const items = ids.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)) : [];
    const grouped: Record<number, typeof items> = {};
    items.forEach((i) => { (grouped[i.orderId] ||= []).push(i); });
    return NextResponse.json({ orders: all.map((o) => ({ ...o, items: grouped[o.id] || [] })) });
  }

  // Customer: own orders
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const mine = await db.select().from(orders)
    .where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt)).limit(50);
  const ids = mine.map((o) => o.id);
  const items = ids.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)) : [];
  const grouped: Record<number, typeof items> = {};
  items.forEach((i) => { (grouped[i.orderId] ||= []).push(i); });
  return NextResponse.json({ orders: mine.map((o) => ({ ...o, items: grouped[o.id] || [] })) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await getSessionUser();
    const { customerName, customerEmail, customerPhone, shippingAddress, shippingCity, shippingState, notes, paymentMethod, items } = body;
    if (!customerName || !customerEmail) return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    if (!items || items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    // Validate products & compute totals
    let subtotal = 0;
    const lines: { productId: number; name: string; image: string; price: number; qty: number }[] = [];
    for (const it of items) {
      const rows = await db.select().from(products).where(eq(products.id, Number(it.productId))).limit(1);
      if (!rows[0]) continue;
      const p = rows[0];
      const qty = Math.max(1, Number(it.quantity || 1));
      subtotal += p.price * qty;
      lines.push({ productId: p.id, name: p.name, image: (p.images as string[])[0] || "", price: p.price, qty });
    }
    if (lines.length === 0) return NextResponse.json({ error: "No valid items" }, { status: 400 });
    const shippingFee = subtotal >= 250000 ? 0 : 3500;
    const total = subtotal + shippingFee;
    const orderNumber = generateOrderNumber();

    const [order] = await db.insert(orders).values({
      orderNumber,
      userId: user?.id ?? null,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "pay_on_pickup",
      subtotal, shippingFee, discount: 0, total,
      customerName, customerEmail, customerPhone: customerPhone || null,
      shippingAddress: shippingAddress || null, shippingCity: shippingCity || "Owerri", shippingState: shippingState || "Imo State",
      notes: notes || null, trackingNumber: generateTrackingNumber(),
    }).returning();

    for (const l of lines) {
      await db.insert(orderItems).values({
        orderId: order.id, productId: l.productId, productName: l.name, productImage: l.image,
        unitPrice: l.price, quantity: l.qty, total: l.price * l.qty,
      });
      // decrement stock + increment sold
      await db.update(products).set({
        stock: sql`GREATEST(0, ${products.stock} - ${l.qty})`,
        soldCount: sql`${products.soldCount} + ${l.qty}`,
      }).where(eq(products.id, l.productId));
    }

    // clear server cart if logged in
    if (user) await db.delete(cartItems).where(eq(cartItems.userId, user.id));

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
