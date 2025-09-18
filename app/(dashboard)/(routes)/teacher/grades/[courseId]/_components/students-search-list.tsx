"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";

interface Student {
  id: string;
  name: string;
}

interface StudentsSearchListProps {
  students: Student[];
  courseId: string;
}

export default function StudentsSearchList({ students, courseId }: StudentsSearchListProps) {
  const [query, setQuery] = useState("");


  // Sortăm studenții alfabetic (folosind localeCompare pentru diacritice etc.)
  // Memoizăm lista sortată pentru a nu reordona la fiecare render
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [students]);

  // Filtrăm lista sortată pe baza query-ului (nume sau ID)
  // Tot memorizat pentru eficiență
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return sortedStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
  }, [query, sortedStudents]);

  return (
    <div className="space-y-4">
      {/* Căsuța de input cu iconiță de search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Caută studenți..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Lista filtrată */}
      <ul className="divide-y border-t border-b border-gray-200">
        {filtered.map((s) => (
          <li
            key={s.id}
            className="py-3 px-2 hover:bg-gray-50 transition"
          >
            {/* Link către pagina de note a studentului */}
            <Link
              href={`/teacher/grades/${courseId}/${s.id}`}
              className="flex justify-between items-center text-gray-700 hover:text-blue-600 transition"
            >
              <span>{s.name || s.id}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </li>
        ))}
        {/* Mesaj când nu există rezultate */}
        {filtered.length === 0 && (
          <li className="py-3 text-gray-500 italic">
            Niciun student găsit.
          </li>
        )}
      </ul>
    </div>
  );
}
