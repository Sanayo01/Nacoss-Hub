import { redirect } from "next/navigation";
import AdminClient from "@/components/admin/AdminClient";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (session?.office) redirect("/office");
  return <AdminClient />;
}
