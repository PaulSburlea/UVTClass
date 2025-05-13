"use client";

import React, { useState, useEffect } from "react";
import { Material, MaterialType } from "@prisma/client";

interface PostMaterialsProps {
    post: {
      content?: string;
    };
    materials: Material[];
  }
  

interface PreviewData {
  title: string;
  image?: string;
}

export const PostMaterials: React.FC<PostMaterialsProps> = ({ materials, post }) => {
  // titluri YouTube & previews link
  const [ytTitles, setYtTitles] = useState<Record<string, string>>({});
  const [linkPreviews, setLinkPreviews] = useState<Record<string, PreviewData>>({});
  // pentru conținut text în modal
  const [textPreviews, setTextPreviews] = useState<Record<string, string>>({});
  // material selectat în modal
  const [selected, setSelected] = useState<Material | null>(null);

  const extractYouTubeId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  };

  // FETCH TITLURI / PREVIEWS
  useEffect(() => {
    materials.forEach((m) => {
      if (m.type === MaterialType.YOUTUBE && m.url) {
        const vid = extractYouTubeId(m.url);
        if (!vid) return;
        fetch(`/api/youtube-title?id=${vid}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.title) setYtTitles((p) => ({ ...p, [m.id]: data.title }));
          });
      }
      if (m.type === MaterialType.LINK && m.url) {
        fetch(`/api/get-title?url=${encodeURIComponent(m.url)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.title) setLinkPreviews((p) => ({ ...p, [m.id]: { title: data.title, image: data.image } }));
          });
      }
      if (m.type === MaterialType.FILE && m.filePath) {
        const ext = m.filePath.split(".").pop()?.toLowerCase();
        if (["txt", "md", "doc", "docx"].includes(ext || "")) {
          fetch(m.filePath)
            .then((r) => r.text())
            .then((txt) => setTextPreviews((p) => ({ ...p, [m.id]: txt })))
            .catch(() => {});
        }
      }
    });
  }, [materials]);

  // thumbnail rendering
  const renderThumb = (m: Material) => {
    const base = "w-24 h-16 object-cover flex-shrink-0";

    // YouTube
    if (m.type === MaterialType.YOUTUBE && m.url) {
      const vid = extractYouTubeId(m.url);
      return vid ? (
        <img
          src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
          className={base + " rounded-l-xl"}
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        />
      ) : null;
    }

    // Link
    if (m.type === MaterialType.LINK) {
      const prev = linkPreviews[m.id];
      return prev?.image ? (
        <img
          src={prev.image}
          className={base + " rounded-l-xl"}
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        />
      ) : (
        <div
          className={base + " bg-gray-200 rounded-l-xl flex items-center justify-center text-2xl"}
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        >
          🔗
        </div>
      );
    }

    // File
    if (m.type === MaterialType.FILE && m.filePath) {
      const ext = m.filePath.split(".").pop()?.toLowerCase();
      if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
        return (
          <img
            src={m.filePath}
            className={base + " rounded-l-xl"}
            onClick={() => setSelected(m)}
            style={{ cursor: "pointer" }}
          />
        );
      }
      if (ext === "pdf") {
        return (
          <div
            className="w-24 h-16 overflow-hidden rounded-l-xl cursor-pointer"
            onClick={() => setSelected(m)}
          >
            <object
              data={m.filePath}
              type="application/pdf"
              width="96"
              height="128"  /* suficient pentru prima pagină */
            >
              {/* fallback icon dacă object nu e suportat */}
              <div className="w-full h-full bg-red-100 flex items-center justify-center">
                <span className="text-red-500 font-bold text-sm">PDF</span>
              </div>
            </object>
          </div>
        );
      }
      
      
      
      if (["txt", "md"].includes(ext || "")) {
        return (
          <div
            className={base + " bg-yellow-100 rounded-l-xl flex items-center justify-center"}
            onClick={() => setSelected(m)}
            style={{ cursor: "pointer" }}
          >
            <span className="text-yellow-700 font-bold text-sm">TXT</span>
          </div>
        );
      }
      if (["doc","docx"].includes(ext || "")) {
        return (
          <iframe
            src={m.filePath}
            className={base + " rounded-l-xl cursor-pointer"}
            onClick={() => setSelected(m)}
          />
        );
      }
      
      // fallback
      return (
        <div
          className={base + " bg-gray-300 rounded-l-xl flex items-center justify-center"}
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        >
          <span className="text-gray-600 text-sm">FILE</span>
        </div>
      );
    }

    // Drive fallback
    return (
      <div
        className={base + " bg-gray-200 rounded-l-xl flex items-center justify-center text-2xl"}
        onClick={() => setSelected(m)}
        style={{ cursor: "pointer" }}
      >
        📁
      </div>
    );
  };

  const getLabel = (m: Material) => {
    if (m.type === MaterialType.YOUTUBE) return "Videoclip YouTube";
    if (m.type === MaterialType.LINK)    return m.url!;
    if (m.type === MaterialType.FILE && m.filePath) {
      const ext = m.filePath.split(".").pop()?.toLowerCase();
      if (["jpg","jpeg","png","gif"].includes(ext||"")) return "Imagine";
      if (ext === "pdf")   return "PDF";
      if (["txt","md"].includes(ext||""))  return "Text";
      if (["doc","docx"].includes(ext||""))return "Document";
      return "Fișier";
    }
    if (m.type === MaterialType.DRIVE)    return "Google Drive";
    return "";
  };
  

  // render modal conținut
  const renderModalContent = () => {
    if (!selected) return null;
    const { filePath, url, type, title, id } = selected;
    const ext = filePath?.split(".").pop()?.toLowerCase();

    if (type === MaterialType.YOUTUBE && url) {
      return (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${extractYouTubeId(url)}?autoplay=1`}
          allow="autoplay; encrypted-media"
        />
      );
    }

    if (type === MaterialType.LINK && linkPreviews[id]?.image) {
      return <img src={linkPreviews[id]!.image!} className="max-h-full mx-auto" />;
    }
    if (type === MaterialType.LINK && url) {
      return <iframe className="w-full h-full" src={url} />;
    }

    if (type === MaterialType.FILE && filePath) {
      if (ext === "pdf") {
        return <iframe src={filePath} className="w-full h-full" />;
      }
      if (["txt","md"].includes(ext||"")) {
        return (
          <pre className="whitespace-pre-wrap overflow-auto p-4">
            {textPreviews[id] ?? "Încărcare..."}
          </pre>
        );
      }
      if (["jpg","jpeg","png","gif"].includes(ext||"")) {
        return <img src={filePath} className="max-h-full mx-auto" />;
      }
      // DOC/DOCX – browser fallback
      return <iframe src={filePath} className="w-full h-full" />;
    }

    return <div>Previzualizare indisponibilă</div>;
  };

  return (
    <>
        {post.content && (
            <div className="mt-8">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            </div>
            )}

      <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materials.map((m) => (
            <div
              key={m.id}
              className="flex bg-white border rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden"
            >
              {renderThumb(m)}
              <div className="flex flex-col justify-center px-4 py-2 overflow-hidden w-full">
                <a
                  href={m.type === MaterialType.FILE ? m.filePath ?? undefined : m.url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 font-medium hover:text-blue-600 truncate whitespace-nowrap overflow-hidden"
                >
                  {m.type === MaterialType.YOUTUBE
                    ? ytTitles[m.id] ?? m.title
                    : m.type === MaterialType.LINK
                    ? linkPreviews[m.id]?.title ?? m.title
                    : m.title}
                </a>
                <p className="text-sm text-gray-500 truncate whitespace-nowrap overflow-hidden">
                  {getLabel(m)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-1/2 h-3/4 relative flex flex-col">
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 left-2 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
            >
              &times;
            </button>
            {/* Download */}
            <a
              href={selected.type === MaterialType.FILE ? selected.filePath! : selected.url!}
              download
              className="absolute top-2 right-2 bg-blue-600 text-white rounded px-3 py-1 text-sm"
            >
              Descarcă
            </a>
            {/* Content */}
            <div className="flex-1 overflow-auto p-4">{renderModalContent()}</div>
          </div>
        </div>
      )}
    </>
  );
};
