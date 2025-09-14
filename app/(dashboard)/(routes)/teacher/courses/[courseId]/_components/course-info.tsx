"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

import type { Classroom } from "@/app/types/classroom";

interface CourseCardProps {
  course: Classroom;
  currentUserId: string;

}

export default function CourseCard({ course }: CourseCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden shadow bg-white border w-full max-w-screen-lg">
      {/* Header curs cu titlu și buton info */}
      <div className="relative bg-gray-700 text-white min-h-[250px] p-6 pb-12 flex flex-col justify-end">
        <h1 className="text-5xl font font-serif leading-tight">
          {course.name}
        </h1>
        {course.section && (
          <p className="text-2xl  mt-2 opacity-90">{course.section}</p>
        )}

        {/* Toggle detalii */}
        <div className="absolute bottom-4 right-4">
          <Button
            size="icon"
            variant="outline"
            className="rounded-4xl bg-transparent hover:bg-gray-100" 
            onClick={() => setShowDetails((v) => !v)}
            title={showDetails ? "Ascunde detalii" : "Afișează detalii"}
          >
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Secțiunea detalii, expandabilă */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-300 ease-in-out",
          showDetails ? "max-h-60" : "max-h-0"
        )}
      >
        <div className="p-4 space-y-1 text-sm text-gray-700 bg-white border-t">
          <p>
            <span className="font-semibold text-gray-800">Cod curs:</span>{" "}
            <span className="text-blue-600 font-mono">
              {course.code.slice(0, 8)}
            </span>
          </p>
          <p>
            <span className="font-semibold">Subiectul cursului:</span>{" "}
            {course.subject || "Nedefinit"}
          </p>
          <p>
            <span className="font-semibold">Sala:</span> {course.room || "Nedefinit"}
          </p>
        </div>
      </div>
    </div>
  );
}
