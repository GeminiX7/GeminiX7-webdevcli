import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const all = await db.select({
    id: users.id, name: users.name, email: users.email, phone: users.phone,
    city: users.city, role: users.role, createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt)).limit(100);
  const spent = await db.select({
    userId: orders.userId, total: sql<number>`coalesce(sum(${orders.total}),0)`, count: sql<number>`count(*)` ,
  }).from(orders).groupBy(orders.userId);
  const map = new Map(spent.map((s) => [s.userId, s]));
  return NextResponse.json({
    customers: all.map((c) => ({
      ...c,
      totalSpent: Number(map.get(c.id)?.total || 0),
      orderCount: Number(map.get(c.id)?.count || 0),
    })),
  });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(users).where(eq(users.id, Number(id)));
  return NextResponse.json({ ok: true });
}
