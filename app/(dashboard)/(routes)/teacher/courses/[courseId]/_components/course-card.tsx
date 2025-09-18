"use client";

import { Pencil, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

import { ConfirmModal } from "@/components/confirm-modal";

import type { Classroom } from "@/app/types/classroom";

interface CourseCardProps {
  course: Classroom;
  currentUserId: string;
}

const bgGradients = [
  "bg-gradient-to-br from-slate-700 to-gray-800",
  "bg-gradient-to-br from-indigo-700 to-indigo-900",
  "bg-gradient-to-br from-blue-700 to-slate-800",
  "bg-gradient-to-br from-emerald-700 to-teal-800",
  "bg-gradient-to-br from-neutral-700 to-zinc-800",
  "bg-gradient-to-br from-purple-700 to-gray-800",
];

export const CourseCard = ({ course, currentUserId }: CourseCardProps) => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  // Alege un gradient de background bazat pe hash-ul ID-ului
  const [bgGradient] = useState(() => {
    const hash = course.id
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return bgGradients[hash % bgGradients.length];
  });

  const isOwner = currentUserId === course.userId;

  // Navighează către pagina cursului, diferit pentru rol
  const goToCourse = () => {
    const destination = isOwner
      ? `/teacher/courses/${course.id}`
      : `/student/courses/${course.id}`;
    router.push(destination);
  };

  // Funcții pentru editare și ștergere
  // Acestea sunt apelate la click pe butoanele corespunzătoare
  const onEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/teacher/courses/${course.id}/edit`);
  };

  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  // Șterge cursul prin API și reîmprospătează lista
  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Eroare la ștergere");
      setShowConfirm(false);
      await mutate("/api/courses");
    } catch (err) {
      console.error(err);
      alert("A apărut o eroare la ștergere.");
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={goToCourse}
        onKeyDown={(e) => e.key === "Enter" && goToCourse()}
        className={cn(
          "rounded-2xl shadow-md group transition overflow-hidden flex flex-col justify-between cursor-pointer border border-gray-200 min-h-[260px]",
          "hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] transform duration-200 ease-in-out"
        )}
      >
        {/* Header cu nume și secțiune, cu gradient dinamic */}
        <div className={cn("p-4 text-slate-100", bgGradient)}>
          <h2 className="text-xl font-semibold leading-snug">{course.name}</h2>
          <p className="text-sm opacity-90 mt-1">
            {course.section ?? "Fără descriere"}
          </p>
        </div>

        {/* Zona de acțiuni, vizibilă doar owner-ului la hover */}
        <div className="p-4 bg-white flex flex-col gap-2">
          {isOwner && (
            <div
              className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onEditClick}
                className="p-1 hover:bg-gray-100 rounded"
                title="Editează"
              >
                <Pencil className="h-4 w-4 text-gray-600" />
              </button>

              <button
                onClick={onDeleteClick}
                className="p-1 hover:bg-gray-100 rounded"
                title="Șterge"
              >
                <Trash className="h-4 w-4 text-red-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmare pentru ștergere */}
      {isOwner && (
        <ConfirmModal
          isOpen={showConfirm}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Șterge curs"
          description="Ești sigur că dorești să ștergi acest curs? Această acțiune nu poate fi anulată."
          confirmButtonText="Da, șterge"
          cancelButtonText="Anulează"
        />
      )}
    </>
  );
};
