"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "@/components/confirm-modal";

interface Teacher {
  userId: string;
  name: string;
  email: string;
  courses: string[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TeacherTable() {
  const { data, error, mutate, isValidating } = useSWR<{ teachers: Teacher[] }>(
    "/api/admin/teachers",
    fetcher,
    { revalidateOnFocus: false }
  );

  const teachers = data?.teachers || [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    if (!selectedId) return;
    const res = await fetch("/api/admin/remove-teacher", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId: selectedId }),
    });
    if (res.ok) {
      toast.success("Profesor șters cu succes");
      // Optimizăm interfața: actualizăm local și revalidăm în fundal
      mutate(
        prev => ({ teachers: prev?.teachers.filter(t => t.userId !== selectedId) || [] }),
        { revalidate: true }
      );
    } else {
      const { error } = await res.json();
      toast.error(error || "Eroare la ștergere");
    }
    setConfirmOpen(false);
    setSelectedId(null);
  }

  if (error) {
    toast.error("Eroare la preluarea profesorilor");
  }

  return (
    <div className="max-h-[400px] overflow-y-auto border rounded-md shadow-md relative">
      {isValidating && <div className="absolute top-2 right-2 text-sm text-gray-500">Încărcare...</div>}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nume profesor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cursuri predate
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Șterge</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teachers.map((teacher) => (
            <tr key={teacher.userId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {teacher.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {teacher.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {teacher.courses.join(", ")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => {
                    setSelectedId(teacher.userId);
                    setConfirmOpen(true);
                  }}
                >
                  Șterge
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Confirmă ștergerea"
        description="Această acțiune va elimina rolul de profesor al acestui utilizator."
      />
    </div>
  );
}