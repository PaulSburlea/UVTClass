// frontend/app/(dashboard)/(routes)/admin/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
// importăm componenta de form
import AssignTeacherForm from "./_components/assign-teacher-form";
import TeacherTable from "./_components/teacher-list";

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  const isAdmin = await db.admin.findUnique({ where: { userId } });
  if (!isAdmin) {
    return redirect("/");
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Panoul Administratorului</h1>
      <AssignTeacherForm />
      <TeacherTable />
    </div>
  );
}
