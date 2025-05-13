"use client";

import { useUser } from "@clerk/nextjs";
import { Mail, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

interface Person {
  id: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  email?: string;
}

interface ClassroomPeopleProps {
  teacher: Person;
  students: Person[];
  courseId: string;
  canRemove: boolean;
}

export const ClassroomPeople: React.FC<ClassroomPeopleProps> = ({
  teacher,
  students,
  courseId,
  canRemove,
}) => {
  const { user } = useUser();
  const [current, setCurrent] = useState(students);

  async function handleRemove(sid: string) {
    const res = await fetch(`/api/courses/${courseId}/remove-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: sid }),
    });
    if (res.ok) {
      setCurrent((cs) => cs.filter((s) => s.id !== sid));
      toast.success("Student eliminat cu succes");
    } else {
      toast.error("Eroare la eliminare");
    }
  }

  return (
    <div className="pt-4">
      <h2 className="text-xl font-semibold mb-2">Profesor</h2>
      <div className="flex items-center justify-between border-b py-3">
        <div className="flex items-center space-x-4">
          {teacher.imageUrl && (
            <Image
              src={teacher.imageUrl}
              alt="Profesor"
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <span>
            {teacher.firstName} {teacher.lastName}
          </span>
        </div>
        {/* afișează mail doar dacă userul curent NU e profesorul însuși */}
        {user?.id !== teacher.id && teacher.email && (
          <Link
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${teacher.email}`}
            target="_blank"
          >
            <Mail className="w-5 h-5 text-gray-600 hover:text-blue-600" />
          </Link>
        )}
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Studenți ({current.length})
      </h2>
      {current.map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between border-b py-3"
        >
          <div className="flex items-center space-x-4">
            {s.imageUrl && (
              <Image
                src={s.imageUrl}
                alt="Student"
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <span>
              {s.firstName} {s.lastName}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {s.email && (
              <Link
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${s.email}`}
                target="_blank"
              >
                <Mail className="w-5 h-5 text-gray-600 hover:text-blue-600" />
              </Link>
            )}
            {canRemove && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleRemove(s.id)}>
                    Elimină
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
