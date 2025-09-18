"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

import type { GradeCategory } from "@/app/types/grade";

interface GradeEntry {
  id?: string;
  category: GradeCategory;
  title: string;
  date: string;
  score: number | string;
  weight: number | string;
  position?: number;
}

type GradePayload = {
  id?: string;
  category: GradeCategory;
  title: string;
  date: string;
  score: number;
  weight: number;
  position: number;
};

const categoryLabels: Record<GradeCategory, string> = {
  EXAM: "Examen",
  QUIZ: "Test",
  HOMEWORK: "Temă",
  PROJECT: "Proiect",
  OTHER: "Altceva",
};

export default function StudentGradePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const studentId = params?.studentId as string;


  const categories: GradeCategory[] = [
    "HOMEWORK",
    "QUIZ",
    "PROJECT",
    "EXAM",
    "OTHER",
  ];

  const [entries, setEntries] = useState<GradeEntry[]>([]);
  const [invalidFields, setInvalidFields] = useState<
    Record<number, (keyof GradeEntry)[]>
  >({});

  // La montare, preluăm notele existente din API
  useEffect(() => {
    if (!courseId || !studentId) return;
    fetch(`/api/grades?courseId=${courseId}&studentId=${studentId}`)
      .then((res) => res.json())
      .then((data: GradeEntry[]) => {
        setEntries(
          data.map((g) => ({
            ...g,
            date: new Date(g.date).toISOString().slice(0, 10),
            score: g.score ?? "",
            weight: g.weight ?? 0,
            position: g.position,
          }))
        );
      })
      .catch(() => toast.error("Eroare la încărcarea notelor."));
  }, [courseId, studentId]);

  // Calculăm suma ponderilor
  const totalWeight = useMemo(
    () =>
      entries.reduce(
        (sum, e) => sum + (typeof e.weight === "number" ? e.weight : 0),
        0
      ),
    [entries]
  );

  // Media ponderată a notelor
  const weightedAverage = useMemo(() => {
    if (totalWeight === 0) return 0;
    return (
      entries.reduce(
        (acc, e) =>
          acc +
          (typeof e.score === "number" ? e.score : 0) *
            (typeof e.weight === "number" ? e.weight : 0),
        0
      ) / totalWeight
    );
  }, [entries, totalWeight]);

  // Adaugă un rând gol în tabel
  function addRow() {
    setEntries((prev) => [
      ...prev,
      {
        category: "OTHER",
        title: "",
        date: new Date().toISOString().slice(0, 10),
        score: "",
        weight: "",
      },
    ]);
  }

  // Șterge un rând; dacă are id, face DELETE API, altfel doar din UI
  function removeRow(idx: number) {
    const entry = entries[idx];
    if (entry.id) {
      fetch(`/api/grades?id=${entry.id}`, { method: "DELETE" })
        .then(() => {
          toast.success("Notă ștearsă.");
          setEntries((prev) => prev.filter((_, i) => i !== idx));
        })
        .catch(() => toast.error("Eroare la ștergerea notei."));
    } else {
      setEntries((prev) => prev.filter((_, i) => i !== idx));
    }
  }

  // Actualizează valoarea unui câmp în rândul idx
  function updateRow(
    idx: number,
    field: keyof GradeEntry,
    value: string | number
  ) {
    setEntries((prev) => {
      const next = [...prev];

      if (field === "score" || field === "weight") {
        if (value === "") {
          (next[idx] as GradeEntry)[field] = value;
          return next;
        }

        const newValue = typeof value === "string" ? parseFloat(value) : value;
        if (isNaN(newValue)) return prev;

        // Nota trebuie să fie între 0 și 10
        if (field === "score" && (newValue < 0 || newValue > 10)) {
          setTimeout(() => toast.error("Nota trebuie să fie între 0 și 10."), 0);
          return prev;
        }

        // Ponderea trebuie să fie între 0 și 100
        if (field === "weight") {
          const sumExcl = next.reduce((sum, e, i) => {
            if (i === idx) return sum;
            return sum + (typeof e.weight === "number" ? e.weight : 0);
          }, 0);

          if (sumExcl + newValue > 100) {
            setTimeout(
              () => toast.error("Ponderea totală nu poate depăși 100%."),0
            );
            return prev;
          }
        }

        next[idx] = { ...next[idx], [field]: newValue };
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }

      return next;
    });
  }

  // La submit, validăm completitudinea și trimitem payload-ul
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Verificăm fiecare rând pentru câmpuri goale
    const newInvalid: Record<number, (keyof GradeEntry)[]> = {};
    entries.forEach((entry, i) => {
      const empties: (keyof GradeEntry)[] = [];
      if (!entry.title.trim()) empties.push("title");
      if (!entry.date.trim()) empties.push("date");
      if (entry.score === "") empties.push("score");
      if (entry.weight === "") empties.push("weight");
      if (empties.length) newInvalid[i] = empties;
    });

    if (Object.keys(newInvalid).length) {
      setInvalidFields(newInvalid);
      toast.error("Completează toate câmpurile înainte de salvare.");
      return;
    }
    setInvalidFields({});

    // Pregătim datele pentru API (convertim string->number unde trebuie)
    const sanitized: GradePayload[] = entries.map((e, idx) => ({
      id: e.id,
      category: e.category,
      title: e.title,
      date: e.date,
      score: typeof e.score === "string" ? parseFloat(e.score) : e.score,
      weight: typeof e.weight === "string" ? parseFloat(e.weight) : e.weight,
      position: idx,
    }));

    // Trimitem POST cu toate notele
    await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, studentId, grades: sanitized }),
    });

    router.refresh();
    toast.success("Note salvate!");
  }

  return (
    <>
    {/* Buton Înapoi */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <Link href={`/teacher/grades/${courseId}`} legacyBehavior>
          <Button variant="ghost" size="sm" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi
          </Button>
        </Link>
      </div>

      {/* Card cu statistici și tabelul de notare */}
      <Card className="max-w-full mx-4 md:mx-auto mt-2">
        <CardHeader>
          <CardTitle>Notarea studentului</CardTitle>
          {/* Afișăm media ponderată și totalul de ponderi */}
          <div className="mt-2 text-base font-medium text-gray-700 md:text-lg">
            Media ponderată: {weightedAverage.toFixed(2)} / 10
          </div>
          <div className="text-sm text-gray-500 md:text-base">
            Total pondere: {totalWeight}%
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full table-auto min-w-[600px] border-collapse rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left text-sm md:text-base">Categorie</th>
                    <th className="p-2 text-left text-sm md:text-base">Titlu</th>
                    <th className="p-2 text-left text-sm md:text-base">Data</th>
                    <th className="p-2 text-left text-sm md:text-base">Notă</th>
                    <th className="p-2 text-left text-sm md:text-base">Pondere (%)</th>
                    <th className="p-2 text-left text-sm md:text-base">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {/* Câmpul de input pentru categorie */}
                      <td className="p-1">
                        <select
                          value={row.category}
                          onChange={(e) =>
                            updateRow(i, "category", e.target.value as GradeCategory)
                          }
                          className="w-full p-1 text-sm md:text-base rounded border border-gray-300"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {categoryLabels[cat]}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Câmpul de input pentru titlu */}
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.title}
                          onChange={(e) => updateRow(i, "title", e.target.value)}
                          className={`
                            w-full p-1 text-sm md:text-base rounded border 
                            ${invalidFields[i]?.includes("title")
                              ? "border-red-500"
                              : "border-gray-300"
                            }`}
                        />
                      </td>

                      {/* Câmpul de input pentru data */}
                      <td className="p-1">
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => updateRow(i, "date", e.target.value)}
                          className={`
                            w-full p-1 text-sm md:text-base rounded border 
                            ${invalidFields[i]?.includes("date")
                              ? "border-red-500"
                              : "border-gray-300"
                            }`}
                        />
                      </td>

                      {/* Câmpul de input pentru notă */}
                      <td className="p-1">
                        <input
                          type="number"
                          step="0.1"
                          value={row.score}
                          onChange={(e) => updateRow(i, "score", e.target.value)}
                          className={`
                            w-full p-1 text-sm md:text-base rounded border 
                            ${invalidFields[i]?.includes("score")
                              ? "border-red-500"
                              : "border-gray-300"
                            }`}
                        />
                      </td>

                      {/* Câmpul de input pentru pondere */}
                      <td className="p-1">
                        <input
                          type="number"
                          step="0.1"
                          value={row.weight}
                          onChange={(e) => updateRow(i, "weight", e.target.value)}
                          className={`
                            w-full p-1 text-sm md:text-base rounded border 
                            ${invalidFields[i]?.includes("weight")
                              ? "border-red-500"
                              : "border-gray-300"
                            }`}
                        />
                      </td>

                      {/* Buton ștergere rând */}
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          className="text-red-600 hover:underline text-sm md:text-base"
                        >
                          Șterge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Butoane Add Row și Submit */}
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:justify-between">
              <Button variant="outline" type="button" onClick={addRow} className="w-full md:w-auto">
                + Adaugă evaluare
              </Button>
              <Button type="submit" className="w-full md:w-auto">
                Salvează note
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
