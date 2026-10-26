import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    redirect("/login?next=/admin");
  }
  return <AdminShell user={user}>{children}</AdminShell>;
}
