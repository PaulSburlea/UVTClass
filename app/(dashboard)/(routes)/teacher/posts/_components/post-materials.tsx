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
        if (["txt", "md"].includes(ext || "")) {
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

    if (m.type === "YOUTUBE" && m.url) {
      const vid = extractYouTubeId(m.url);
      return vid ? (
        <Image
          src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
          alt="YouTube thumbnail"
          width={96}
          height={64}
          className={base + " rounded-l-xl"}
        />
      ) : null;
    }

    if (m.type === "LINK") {
      const prev = linkPreviews[m.id];
      return prev?.image ? (
        <Image
          src={prev.image!}
          alt={prev.title}
          width={96}
          height={64}
          className={base + " rounded-l-xl"}
        />
      ) : (
        <div className={base + " bg-gray-200 rounded-l-xl flex items-center justify-center text-2xl"}>
          🔗
        </div>
      );
    }

    if (m.type === "FILE" && m.url && ["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      return <Image src={m.url} alt={filename} width={96} height={64} className={base + " rounded-l-xl"} />;
    }

    if (m.type === "FILE" && m.url) {
      const officeExts = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
      const label = ["pdf"].includes(ext || "")
        ? "PDF"
        : ["txt", "md"].includes(ext || "")
        ? "TXT"
        : ["doc", "docx"].includes(ext || "")
        ? "DOC"
        : ["xls", "xlsx"].includes(ext || "")
        ? "XLS"
        : ["ppt", "pptx"].includes(ext || "")
        ? "PPT"
        : "Fișier";
      const color = ["pdf"].includes(ext || "")
        ? "bg-red-100 text-red-500"
        : ["txt", "md"].includes(ext || "")
        ? "bg-yellow-100 text-yellow-700"
        : ["doc", "docx"].includes(ext || "")
        ? "bg-gray-300 text-gray-700"
        : ["xls", "xlsx"].includes(ext || "")
        ? "bg-green-100 text-green-700"
        : ["ppt", "pptx"].includes(ext || "")
        ? "bg-orange-100 text-orange-700"
        : "bg-gray-200 text-gray-600";

      return (
        <div className={`${base} ${color} flex items-center justify-center rounded-l-xl`}>
          <span className="font-bold text-sm">{label}</span>
        </div>
      );
    }

    return (
      <div className={base + " bg-gray-200 flex items-center justify-center rounded-l-xl"}>
        📁
      </div>
    );
  };

  const getFileLink = (m: Material) => {
    if (!m.url) return "#";
    const filename = m.filePath || m.name || "";
    const ext = filename.split(".").pop()?.toLowerCase();

    // Office Viewer pentru Word / Excel / PowerPoint
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext || "")) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(m.url)}`;
    }

    return m.url;
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
            <div key={m.id} className="flex bg-white border rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden">
              {renderThumb(m)}
              <div className="flex flex-col justify-center px-4 py-2 overflow-hidden w-full">
                <a
                  href={getFileLink(m)}
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
                <div className="text-sm text-gray-500">{getLabel(m)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
