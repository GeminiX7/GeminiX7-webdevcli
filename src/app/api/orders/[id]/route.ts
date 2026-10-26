import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, requireAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rows = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isAdmin = user.role === "admin" || user.role === "staff";
  if (!isAdmin && rows[0].userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, rows[0].id));
  return NextResponse.json({ order: rows[0], items });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const allowed: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status) allowed.status = body.status;
  if (body.paymentStatus) allowed.paymentStatus = body.paymentStatus;
  if (body.trackingNumber !== undefined) allowed.trackingNumber = body.trackingNumber;
  if (body.notes !== undefined) allowed.notes = body.notes;
  const [row] = await db.update(orders).set(allowed).where(eq(orders.id, Number(id))).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order: row });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.delete(orders).where(eq(orders.id, Number(id)));
  return NextResponse.json({ ok: true });
}
