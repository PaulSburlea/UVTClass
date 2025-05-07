"use client";

import { useEffect, useState } from "react";
import { FileText, Youtube, Link as LinkIcon, File } from "lucide-react";

interface Material {
  id: string;
  title: string;
  type: "FILE" | "YOUTUBE" | "DRIVE" | "LINK" | "TEXT";
  filePath?: string;
  url?: string;
  description?: string;
  uploadedAt: string;
}

export function CourseMaterialsList({ courseId, refetchKey }: { courseId: string, refetchKey: number }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch(`/api/materials?courseId=${courseId}`);
        const data = await res.json();
        setMaterials(data);
      } catch (err) {
        console.error("Eroare la încărcarea materialelor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [courseId, refetchKey]); // depinde de refetchKey pentru a reîncărca

  if (loading) return <p className="mt-4 text-gray-500">Se încarcă...</p>;
  if (!materials.length) return <p className="mt-4 text-gray-500">Nu există materiale.</p>;

  return (
    <div className="mt-6 w-full max-w-screen-lg space-y-4">
      {materials.map((material) => (
        <div key={material.id} className="p-4 border rounded bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            {material.type === "FILE" && <File size={18} />}
            {material.type === "YOUTUBE" && <Youtube size={18} />}
            {material.type === "LINK" || material.type === "DRIVE" ? <LinkIcon size={18} /> : null}
            {material.type === "TEXT" && <FileText size={18} />}
            <span className="font-medium">{material.title}</span>
          </div>

          <div className="text-sm text-gray-700">
            {material.type === "TEXT" && <p>{material.description}</p>}
            {(material.type === "YOUTUBE" || material.type === "LINK" || material.type === "DRIVE") && (
              <a href={material.url} target="_blank" className="text-blue-600 underline">
                {material.url}
              </a>
            )}
            {material.type === "FILE" && material.filePath && (
              <a href={material.filePath} download className="text-blue-600 underline">
                Descarcă fișierul
              </a>
            )}
          </div>

          <div className="text-xs text-gray-400 mt-2">
            {new Date(material.uploadedAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
