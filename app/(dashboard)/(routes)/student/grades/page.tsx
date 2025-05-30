// app/student/grades/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { ChevronRight } from "lucide-react";

interface EnrolledCourse {
  id: string;
  name: string;
}

export default function StudentGradesPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [filtered, setFiltered] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetch("/api/student/courses")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: EnrolledCourse[]) => {
        setCourses(data);
        setFiltered(data);
      })
      .catch(() => toast.error("Eroare la încărcarea cursurilor"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(
      q === "" ? courses : courses.filter((c) => c.name.toLowerCase().includes(q))
    );
  }, [search, courses]);

  if (loading) {
    return <p className="text-center mt-8 text-gray-600">Se încarcă cursurile…</p>;
  }
  if (filtered.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center text-gray-500">
        <Input
          placeholder="Caută curs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6"
        />
        <p>Nu s-au găsit cursuri.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-4">
    <Input
        placeholder="Caută curs…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5"
    />

    <ul className="divide-y divide-gray-200 bg-white rounded-2xl shadow-md overflow-hidden">
        {filtered.map((course) => (
        <li
            key={course.id}
            className="flex items-center justify-between px-8 py-5 hover:bg-gray-50 transition"
        >
            <Link href={`/student/grades/${course.id}`} className="flex-1">
            <span className="text-gray-900 text-lg font-semibold">
                {course.name}
            </span>
            </Link>
            <ChevronRight className="w-5 h-5 text-gray-400" />
        </li>
        ))}
    </ul>
    </div>
  );
}
