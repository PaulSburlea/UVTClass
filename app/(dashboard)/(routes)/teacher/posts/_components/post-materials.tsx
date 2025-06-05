"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import type { Material } from "@/app/types/material";

interface PostMaterialsProps {
  post: { content?: string };
  materials: Material[];
}

interface PreviewData {
  title: string;
  image?: string;
}

export const PostMaterials: React.FC<PostMaterialsProps> = ({ materials, post }) => {
  const [ytTitles, setYtTitles] = useState<Record<string, string>>({});
  const [linkPreviews, setLinkPreviews] = useState<Record<string, PreviewData>>({});
  const [textPreviews, setTextPreviews] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Material | null>(null);

  const extractYouTubeId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  };

  useEffect(() => {
    materials.forEach((m) => {
      if (m.type === "YOUTUBE" && m.url) {
        const vid = extractYouTubeId(m.url);
        if (!vid) return;
        fetch(`/api/youtube-title?id=${vid}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.title) setYtTitles((prev) => ({ ...prev, [m.id]: data.title }));
          });
      }

      if (m.type === "LINK" && m.url) {
        fetch(`/api/get-title?url=${encodeURIComponent(m.url)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.title) {
              setLinkPreviews((prev) => ({
                ...prev,
                [m.id]: { title: data.title, image: data.image },
              }));
            }
          });
      }

      if (m.type === "FILE" && m.url) {
        const filename = m.filePath || m.name || "";
        const ext = filename.split(".").pop()?.toLowerCase();
        if (["txt", "md", "doc", "docx"].includes(ext || "")) {
          fetch(m.url)
            .then((r) => r.text())
            .then((txt) => setTextPreviews((prev) => ({ ...prev, [m.id]: txt })))
            .catch(() => {});
        }
      }
    });
  }, [materials]);

  const renderThumb = (m: Material) => {
    const base = "w-24 h-16 object-cover flex-shrink-0";
    const filename = m.filePath || m.name || "";
    const ext = filename.split(".").pop()?.toLowerCase();

    // 1) YOUTUBE
    if (m.type === "YOUTUBE" && m.url) {
      const vid = extractYouTubeId(m.url);
      return vid ? (
        <Image
          src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
          alt="YouTube thumbnail"
          width={96}
          height={64}
          className={base + " rounded-l-xl"}
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        />
      ) : null;
    }

    // 2) LINK
    if (m.type === "LINK") {
      const prev = linkPreviews[m.id];
      return prev?.image ? (
        <Image
          src={prev.image!}
          alt={prev.title}
          width={96}
          height={64}
          className={base + " rounded-l-xl"}
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        />
      ) : (
        <div
          className={
            base +
            " bg-gray-200 rounded-l-xl flex items-center justify-center text-2xl"
          }
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        >
          🔗
        </div>
      );
    }

    // 3) FILE = imagine (jpg/jpeg/png/gif)
    if (m.type === "FILE" && m.url && ["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      return (
        <Image
          src={m.url}
          alt={filename}
          width={96}
          height={64}
          className={base + " rounded-l-xl"}
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        />
      );
    }

    // 4) FILE = PDF
    if (m.type === "FILE" && m.url && ext === "pdf") {
      return (
        <div
          className="w-24 h-16 overflow-hidden rounded-l-xl cursor-pointer"
          onClick={() => setSelected(m)}
        >
          <object
            data={m.url}
            type="application/pdf"
            width={96}
            height={128}
          >
            <div className="w-full h-full bg-red-100 flex items-center justify-center">
              <span className="text-red-500 font-bold text-sm">PDF</span>
            </div>
          </object>
        </div>
      );
    }

    // 5) FILE = text (txt, md)
    if (
      m.type === "FILE" &&
      m.url &&
      ["txt", "md"].includes(ext || "")
    ) {
      return (
        <div
          className={
            base +
            " bg-yellow-100 rounded-l-xl flex items-center justify-center"
          }
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        >
          <span className="text-yellow-700 font-bold text-sm">TXT</span>
        </div>
      );
    }

    // 6) FILE = doc/docx
    if (
      m.type === "FILE" &&
      m.url &&
      ["doc", "docx"].includes(ext || "")
    ) {
      return (
        <iframe
          src={m.url}
          className={base + " rounded-l-xl cursor-pointer"}
          onClick={() => setSelected(m)}
        />
      );
    }

    // 7) FILE = video (mp4, webm)
    if (
      m.type === "FILE" &&
      m.url &&
      ["mp4", "webm"].includes(ext || "")
    ) {
      return (
        <div
          className={base + " bg-gray-800 text-white rounded-l-xl flex items-center justify-center"}
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        >
          🎬
        </div>
      );
    }

    // 8) FILE = audio (mp3, wav)
    if (
      m.type === "FILE" &&
      m.url &&
      ["mp3", "wav"].includes(ext || "")
    ) {
      return (
        <div
          className={base + " bg-gray-800 text-white rounded-l-xl flex items-center justify-center"}
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        >
          🎵
        </div>
      );
    }

    // 9) orice alt tip de FILE (fără extensie cunoscută)
    if (m.type === "FILE" && m.url) {
      return (
        <div
          className={base + " bg-gray-300 rounded-l-xl flex items-center justify-center"}
          onClick={() => setSelected(m)}
          style={{ cursor: "pointer" }}
        >
          <span className="text-gray-600 text-sm">Fișier</span>
        </div>
      );
    }

    // 10) Default (nu există url, m.type necunoscut)
    return (
      <div
        className={
          base +
          " bg-gray-200 rounded-l-xl flex items-center justify-center text-2xl"
        }
        onClick={() => setSelected(m)}
        style={{ cursor: "pointer" }}
      >
        📁
      </div>
    );
  };

  const getLabel = (m: Material) => {
    if (m.type === "YOUTUBE") return "Videoclip YouTube";

    if (m.type === "LINK") return "Link extern";

    if (m.type === "FILE") {
      const filename = m.filePath || m.name || "Fișier necunoscut";
      const ext = filename.split(".").pop()?.toUpperCase();
      return ext ? `.${ext}` : "";
    }

    if (m.type === "DRIVE") return "Google Drive";
    return "";
  };

  const renderModalContent = () => {
    if (!selected) return null;
    const { url, type, id } = selected;
    const filename = selected.filePath || selected.name || "";
    const ext = filename.split(".").pop()?.toLowerCase();

    // YOUTUBE în modal
    if (type === "YOUTUBE" && url) {
      return (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${extractYouTubeId(url)}?autoplay=1`}
          allow="autoplay; encrypted-media"
        />
      );
    }

    // LINK cu imagine previzualizare
    if (type === "LINK" && linkPreviews[id]?.image) {
      return (
        <Image
          src={linkPreviews[id]!.image!}
          alt={linkPreviews[id]!.title}
          width={600}
          height={400}
          className="max-h-full mx-auto"
        />
      );
    }

    // LINK generic
    if (type === "LINK" && url) {
      return <iframe className="w-full h-full" src={url} />;
    }

    // FILE = PDF
    if (type === "FILE" && url && ext === "pdf") {
      return <iframe src={url} className="w-full h-full" />;
    }

    // FILE = text (txt, md)
    if (type === "FILE" && url && ["txt", "md"].includes(ext || "")) {
      return (
        <pre className="whitespace-pre-wrap overflow-auto p-4">
          {textPreviews[id] ?? "Încărcare..."}
        </pre>
      );
    }

    // FILE = imagine
    if (type === "FILE" && url && ["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      return (
        <Image
          src={url}
          alt={filename}
          width={600}
          height={400}
          className="max-h-full mx-auto"
        />
      );
    }

    // FILE = video (mp4, webm)
    if (type === "FILE" && url && ["mp4", "webm"].includes(ext || "")) {
      return (
        <video controls className="w-full h-full bg-black">
          <source src={url} type={`video/${ext}`} />
          Browser-ul tău nu suportă redarea videoclipului.
        </video>
      );
    }

    // FILE = audio (mp3, wav)
    if (type === "FILE" && url && ["mp3", "wav"].includes(ext || "")) {
      return (
        <audio controls className="w-full">
          <source src={url} type={`audio/${ext}`} />
          Browser-ul tău nu suportă redarea audio.
        </audio>
      );
    }

    // FILE generic (doc/docx sau altele)
    if (type === "FILE" && url) {
      return <iframe src={url} className="w-full h-full" />;
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
                  href={m.url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 font-medium hover:text-blue-600 truncate whitespace-nowrap overflow-hidden"
                >
                  {m.type === "YOUTUBE"
                    ? ytTitles[m.id] ?? m.title
                    : m.type === "LINK"
                    ? linkPreviews[m.id]?.title ?? m.title
                    : m.filePath ?? "Fișier"}
                </a>
                <div className="text-sm text-gray-500">
                  {getLabel(m)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-1/2 h-3/4 relative flex flex-col">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 left-2 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
            >
              &times;
            </button>
            <a
              href={selected.url ?? undefined}
              download
              className="absolute top-2 right-2 bg-blue-600 text-white rounded px-3 py-1 text-sm"
            >
              Descarcă
            </a>
            <div className="flex-1 overflow-auto p-4">{renderModalContent()}</div>
          </div>
        </div>
      )}
    </>
  );
};
