"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { toast } from "react-hot-toast";

import AssignTeacherForm from "./_components/assign-teacher-form";
import TeacherTable from "./_components/teacher-list";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboardPage() {
  const { data, error, mutate, isLoading } = useSWR("/api/admin/teachers", fetcher);

  useEffect(() => {
    if (error) toast.error("Eroare la încărcarea profesorilor");
  }, [error]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Panoul Administratorului</h1>

      <AssignTeacherForm mutateTeachers={mutate} />

      {isLoading && <div className="text-gray-500">Încărcare profesori...</div>}

      {data && <TeacherTable teachers={data.teachers} mutateTeachers={mutate} />}
    </div>
  );
}
