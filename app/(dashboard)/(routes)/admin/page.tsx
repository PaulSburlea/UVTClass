import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

import AssignTeacherForm from "./_components/assign-teacher-form";
import TeacherTable from "./_components/teacher-list";

export default async function AdminDashboardPage() {
  // Verificăm dacă utilizatorul este autentificat
  const { userId } = await auth();
  if (!userId) return redirect("/");

  // Verificăm dacă utilizatorul are rolul de administrator
  // folosind baza de date
  const isAdmin = await db.admin.findUnique({ where: { userId } });
  if (!isAdmin) {
    // Dacă nu este administrator, redirecționăm către pagina principală
    return redirect("/");
  }

  // Dacă utilizatorul este administrator, afișăm pagina de administrare
  // cu formularul de alocare a profesorilor și lista de profesori
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Panoul Administratorului</h1>
      <AssignTeacherForm />
      <TeacherTable />
    </div>
  );
}
