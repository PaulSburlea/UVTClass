"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

import { CourseSubNavbar } from "@/app/(dashboard)/_components/course-sub-navbar";

import type { GradeCategory } from "@/app/types/grade";

interface GradeEntry {
  id?: string;
  category: GradeCategory;
  title: string;
  date: string;
  score: number;
  weight: number;
}

interface Classroom {
  id: string;
  name: string;
  section?: string;
}

// Etichete și stiluri pentru categorii de note
const categoryLabels: Record<GradeCategory, string> = {
  EXAM: "Examen",
  QUIZ: "Test",
  HOMEWORK: "Temă",
  PROJECT: "Proiect",
  OTHER: "Altceva",
};

const categoryColors: Record<GradeCategory, string> = {
  EXAM: "bg-red-100 text-red-800",
  QUIZ: "bg-blue-100 text-blue-800",
  HOMEWORK: "bg-green-100 text-green-800",
  PROJECT: "bg-purple-100 text-purple-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export default function StudentCourseGradesPage() {
  const params = useParams();
  const { user, isLoaded } = useUser();
  const [entries, setEntries] = useState<GradeEntry[]>([]);
  const [course, setCourse] = useState<Classroom | null>(null);
  const [search, setSearch] = useState("");

  // Extrage ID-ul cursului din parametrii URL
  const rawId = params.courseId;
  const courseId = Array.isArray(rawId) ? rawId[0] : rawId;

  // Fetch detalii curs la montare sau când courseId se schimbă
  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/classrooms/${courseId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((c: Classroom) => setCourse(c))
      .catch(() => toast.error("Eroare la încărcarea detaliilor cursului"));
  }, [courseId]);

  // Fetch note student după ce user și courseId sunt disponibile
  useEffect(() => {
    if (!isLoaded || !user?.id || !courseId) return;
    fetch(`/api/grades?courseId=${courseId}&studentId=${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: GradeEntry[]) => {
        // Transformă datele pentru a avea formatul corect
        setEntries(
          data.map((g) => ({
            ...g,
            date: new Date(g.date).toLocaleDateString(),
            score: Number(g.score),
            weight: Number(g.weight),
          }))
        );
      })
      .catch(() => toast.error("Eroare la încărcarea notelor"));
  }, [isLoaded, user?.id, courseId]);

  // Filtrează după textul căutat
  const filtered = useMemo(
    () =>
      entries.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      ),
    [search, entries]
  );

  // Calculează suma ponderilor și media ponderată
  const totalWeight = useMemo(
    () => filtered.reduce((sum, e) => sum + e.weight, 0),
    [filtered]
  );

  const weightedAverage = useMemo(
    () =>
      totalWeight
        ? filtered.reduce((acc, e) => acc + e.score * e.weight, 0) /
          totalWeight
        : 0,
    [filtered, totalWeight]
  );

  if (!courseId) {
    return <p className="text-center mt-8">ID curs invalid.</p>;
  }
  if (!course) {
    return <p className="text-center mt-8">Se încarcă...</p>;
  }

  return (
    <>
      {/* Navbar specific cursului */}   
      <CourseSubNavbar courseId={courseId} />

      <div className="max-w-4xl mx-auto pt-[116px] px-4 md:px-0">
        <h1 className="text-3xl font-semibold mb-4">{course.name}</h1>

        {/* Bara de căutare și afișarea mediei ponderate */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <Input
            placeholder="Caută evaluare..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-sm"
          />
          <div className="text-right">
            <div className="text-lg font-medium">
              Media ponderată: {weightedAverage.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              Total pondere: {totalWeight.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Tabel desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Titlu</th>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-right">Notă</th>
                <th className="p-3 text-right">Pondere</th>
                <th className="p-3 text-left">Categorie</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr
                  key={e.id ?? i}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-3">{e.title}</td>
                  <td className="p-3">{e.date}</td>
                  <td className="p-3 text-right font-medium">
                    {e.score.toFixed(1)}
                  </td>
                  <td className="p-3 text-right">{e.weight.toFixed(1)}%</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded ${categoryColors[e.category]}`}
                    >
                      {categoryLabels[e.category]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vizualizare mobil */}
        <div className="md:hidden space-y-4">
          {filtered.map((e, i) => (
            <div
              key={e.id ?? i}
              className={`border rounded-lg p-4 ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <h2 className="font-semibold text-lg">{e.title}</h2>
                <span
                  className={`text-sm font-medium rounded px-2 py-1 ${categoryColors[e.category]}`}
                >
                  {categoryLabels[e.category]}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">Data: {e.date}</div>
              <div className="mt-1 flex justify-between items-center">
                <div>
                  <span className="font-medium">Notă: </span>
                  {e.score.toFixed(1)}
                </div>
                <div>
                  <span className="font-medium">Pondere: </span>
                  {e.weight.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
