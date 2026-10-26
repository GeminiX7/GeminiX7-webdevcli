import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, users, orderItems, categories } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [rev, ordCount, prodCount, custCount, lowStock] = await Promise.all([
    db.select({ total: sql<number>`coalesce(sum(${orders.total}),0)` }).from(orders).where(sql`${orders.status} != 'cancelled'`),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "customer")),
    db.select().from(products).where(sql`${products.stock} <= ${products.lowStockThreshold}`).limit(8),
  ]);

  const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6);
  const topProducts = await db.select().from(products).orderBy(desc(products.soldCount)).limit(5);
  const byStatus = await db.select({ status: orders.status, count: sql<number>`count(*)` }).from(orders).groupBy(orders.status);
  const byStore = await db.select({ store: products.store, count: sql<number>`count(*)`, value: sql<number>`coalesce(sum(${products.price} * ${products.stock}),0)` }).from(products).groupBy(products.store);
  const monthly = await db.select({
    month: sql<string>`to_char(${orders.createdAt}, 'Mon')`,
    total: sql<number>`coalesce(sum(${orders.total}),0)`,
    count: sql<number>`count(*)`,
  }).from(orders).where(sql`${orders.status} != 'cancelled'`).groupBy(sql`to_char(${orders.createdAt}, 'Mon'), date_trunc('month', ${orders.createdAt})`).orderBy(sql`date_trunc('month', ${orders.createdAt})`).limit(8);

  return NextResponse.json({
    revenue: Number(rev[0]?.total || 0),
    orders: Number(ordCount[0]?.count || 0),
    productsCount: Number(prodCount[0]?.count || 0),
    customers: Number(custCount[0]?.count || 0),
    lowStock,
    recentOrders,
    topProducts,
    byStatus,
    byStore,
    monthly,
  });
}
