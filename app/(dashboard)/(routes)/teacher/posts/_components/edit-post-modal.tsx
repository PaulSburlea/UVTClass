"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  Upload,
  Link as LinkIcon,
  FileText,
  FileArchive,
  FileAudio,
  FileVideo,
  FilePlus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExternalFile extends File {
  __external: boolean;
  __type: "YOUTUBE" | "LINK" | "DRIVE";
  __url: string;
  __id?: string;
}

type PreviewFile = File | ExternalFile;
function isExternalFile(file: PreviewFile): file is ExternalFile {
  return (file as ExternalFile).__external === true;
}

function getFileIconAndColor(mime: string) {
  if (mime.startsWith("image/")) {
    return { icon: null, bg: "" };
  }
  if (mime === "application/pdf") {
    return { icon: <FileText size={24} />, bg: "bg-red-100" };
  }
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword"
  ) {
    return { icon: <FileText size={24} />, bg: "bg-blue-100" };
  }
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/vnd.ms-excel"
  ) {
    return { icon: <FilePlus size={24} />, bg: "bg-green-100" };
  }
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mime === "application/vnd.ms-powerpoint"
  ) {
    return { icon: <FilePlus size={24} />, bg: "bg-orange-100" };
  }
  if (mime.startsWith("video/")) {
    return { icon: <FileVideo size={24} />, bg: "bg-purple-100" };
  }
  if (mime.startsWith("audio/")) {
    return { icon: <FileAudio size={24} />, bg: "bg-yellow-100" };
  }
  if (
    mime === "application/zip" ||
    mime === "application/x-7z-compressed" ||
    mime === "application/x-rar-compressed"
  ) {
    return { icon: <FileArchive size={24} />, bg: "bg-gray-100" };
  }
  return { icon: <FileText size={24} />, bg: "bg-gray-50" };
}

interface MaterialFromDB {
  id: string;
  title: string;
  type: string;
  url?: string;
  filePath?: string;
  name?: string;
}

interface EditPostModalProps {
  post: {
    id: string;
    title: string;
    content?: string | null;
    materials?: MaterialFromDB[];
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditPostModal({
  post,
  isOpen,
  onClose,
  onUpdated,
}: EditPostModalProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content ?? "");
  const [filesPreview, setFilesPreview] = useState<PreviewFile[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [linkPreviews, setLinkPreviews] = useState<
    Record<string, { image?: string }>
  >({});
  const [isUploading, setIsUploading] = useState(false);
  const [ytModal, setYtModal] = useState(false);
  const [linkModal, setLinkModal] = useState(false);
  const [modalUrl, setModalUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(post.title);
    setContent(post.content ?? "");
    setRemovedIds([]);
    setLinkPreviews({});

    const mapped: PreviewFile[] = (post.materials || []).map((m) => {
      const originalFilename = m.filePath || m.name || m.title;
      const fake = new File([""], originalFilename) as ExternalFile;
      fake.__external = m.type !== "FILE";
      fake.__type = m.type as ExternalFile["__type"];
      fake.__url = m.url!;
      fake.__id = m.id;
      return fake;
    });
    setFilesPreview(mapped);
  }, [isOpen, post]);

  useEffect(() => {
    filesPreview.forEach((f) => {
      if (
        isExternalFile(f) &&
        f.__type === "LINK" &&
        f.__url &&
        !linkPreviews[f.name]
      ) {
        fetch(`/api/get-title?url=${encodeURIComponent(f.__url)}`)
          .then((r) => r.json())
          .then((data) => {
            setLinkPreviews((p) => ({
              ...p,
              [f.name]: { image: data.image },
            }));
          })
          .catch(() => {
          });
      }
    });
  }, [filesPreview, linkPreviews]);

  const handleRemoveFile = async (fileToRemove: PreviewFile) => {
    setFilesPreview((prev) => prev.filter((f) => f !== fileToRemove));

    if (isExternalFile(fileToRemove) && fileToRemove.__id) {
      setRemovedIds((prev) => [...prev, fileToRemove.__id!]);
    }

    if (
      !isExternalFile(fileToRemove) &&
      "__url" in (fileToRemove as ExternalFile)
    ) {
      try {
        const fileUrl = (fileToRemove as ExternalFile).__url;
        const urlObj = new URL(fileUrl);
        const lastSegment = urlObj.pathname.split("/").pop()!;
        const raw = lastSegment.split("?")[0];
        const fileKey = raw.split("-")[0];
        if (fileKey) {
          const res = await fetch("/api/delete-uploadthing-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileKey }),
          });
          if (!res.ok) {
            console.error("Ștergere UTapi a eșuat:", await res.text());
            toast.error("Nu s-a putut șterge fișierul din UploadThing.");
          }
        }
      } catch (err) {
        console.error("Eroare la extragerea sau ștergerea UTapi:", err);
        toast.error("Eroare la ștergerea fișierului.");
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const postExternalMaterial = (
    url: string,
    type: ExternalFile["__type"]
  ) => {
    const already = filesPreview.some(
      (file) => isExternalFile(file) && file.__url === url
    );
    if (already) {
      toast.error("Link-ul a fost deja adăugat.");
      return;
    }
    const fakeFile = new File([""], url) as ExternalFile;
    fakeFile.__external = true;
    fakeFile.__type = type;
    fakeFile.__url = url;
    setFilesPreview((prev) => [...prev, fakeFile]);
    setModalUrl("");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Titlul este obligatoriu.");
      return;
    }

    const form = new FormData();
    form.append("title", title.trim());
    form.append("content", content.trim());

    removedIds.forEach((id) => form.append("removedIds", id));

    filesPreview.forEach((f) => {
      const isExt = isExternalFile(f);
      const hasId = isExt && f.__id ? true : false;
      if (isExt) {
        if (!hasId) {
          form.append("links", f.__url);
          form.append("types", f.__type);
        }
      } else {
        if (!hasId) {
          form.append("files", f);
          form.append("fileNames", f.name);
        }
      }
    });

    setIsUploading(true);
    const res = await fetch(`/api/post/${post.id}`, {
      method: "PUT",
      body: form,
    });
    setIsUploading(false);

    if (res.ok) {
      toast.success("Postarea a fost actualizată!");
      onUpdated();
      onClose();
    } else {
      toast.error("Eroare la actualizare.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).filter(
      (f) => !filesPreview.some((pf) => pf.name === f.name)
    ) as File[];
    setFilesPreview((prev) => [...prev, ...newFiles]);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFilesPreview([]);
            setRemovedIds([]);
            setModalUrl("");
            onClose();
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editează Postarea</DialogTitle>
          </DialogHeader>

          <input
            className="w-full p-2 border rounded mb-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titlul postării"
          />
          <textarea
            className="w-full p-2 border rounded resize-none h-24 mb-4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conținutul (opțional)"
          />

          {filesPreview.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto">
              <h3 className="font-semibold mb-2">Preview fișiere:</h3>
              <ul className="space-y-2">
                {filesPreview.map((file, i) => {
                  let thumb: React.ReactNode;

                  if (isExternalFile(file) && file.__type === "YOUTUBE") {
                    const vid = new URL(file.__url).searchParams.get("v");
                    thumb = (
                      <div className="w-20 h-12 overflow-hidden rounded cursor-pointer">
                        <iframe
                          src={`https://www.youtube.com/embed/${vid}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    );
                  } else if (
                    isExternalFile(file) &&
                    file.__type === "LINK"
                  ) {
                    const hostname = new URL(file.__url).hostname;
                    const imgUrl =
                      linkPreviews[file.name]?.image ||
                      `https://www.google.com/s2/favicons?domain=${hostname}`;

                    thumb = (
                      <Image
                        src={imgUrl}
                        alt="Preview link"
                        width={48}
                        height={48}
                        className="object-cover rounded cursor-pointer"
                      />
                    );
                  } else if (
                    isExternalFile(file) &&
                    file.__type === "DRIVE"
                  ) {
                    const { icon, bg } = getFileIconAndColor(
                      "application/octet-stream"
                    );
                    thumb = (
                      <div
                        className={`${bg} w-12 h-12 rounded flex items-center justify-center`}
                      >
                        {icon}
                      </div>
                    );
                  } else {
                    const mimeType = file.type || "";
                    if (mimeType.startsWith("image/")) {
                      if (isExternalFile(file) && file.__url) {
                        thumb = (
                          <Image
                            src={file.__url}
                            alt={file.name}
                            width={48}
                            height={48}
                            className="object-cover rounded cursor-pointer"
                          />
                        );
                      } else {
                        thumb = (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            width={48}
                            height={48}
                            className="object-cover rounded cursor-pointer"
                          />
                        );
                      }
                    } else {
                      const { icon, bg } = getFileIconAndColor(
                        mimeType || "application/octet-stream"
                      );
                      thumb = (
                        <div
                          className={`${bg} w-12 h-12 rounded flex items-center justify-center`}
                        >
                          {icon}
                        </div>
                      );
                    }
                  }

                  const ext = file.name.split(".").pop()?.toUpperCase();

                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between border p-2 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {thumb}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {file.name}
                          </span>
                          {ext && (
                            <span className="text-xs text-gray-500 uppercase">
                              .{ext}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file)}
                        className="text-gray-500 hover:text-gray-900 ml-2"
                      >
                        <X size={18} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
              disabled={isUploading}
              title="Încarcă fișier"
            >
              <Upload size={18} />
            </button>

            <button
              title="YouTube"
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
              onClick={() => {
                setModalUrl("");
                setYtModal(true);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[18px] h-[18px]"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M20.5245 6.00694C20.3025 5.81544 20.0333 5.70603 19.836 5.63863C19.6156 5.56337 19.3637 5.50148 19.0989 5.44892C18.5677 5.34348 17.9037 5.26005 17.1675 5.19491C15.6904 5.06419 13.8392 5 12 5C10.1608 5 8.30956 5.06419 6.83246 5.1949C6.09632 5.26005 5.43231 5.34348 4.9011 5.44891C4.63628 5.50147 4.38443 5.56337 4.16403 5.63863C3.96667 5.70603 3.69746 5.81544 3.47552 6.00694C3.26514 6.18846 3.14612 6.41237 3.07941 6.55976C3.00507 6.724 2.94831 6.90201 2.90314 7.07448C2.81255 7.42043 2.74448 7.83867 2.69272 8.28448C2.58852 9.18195 2.53846 10.299 2.53846 11.409C2.53846 12.5198 2.58859 13.6529 2.69218 14.5835C2.74378 15.047 2.81086 15.4809 2.89786 15.8453C2.97306 16.1603 3.09841 16.5895 3.35221 16.9023C3.58757 17.1925 3.92217 17.324 4.08755 17.3836C4.30223 17.461 4.55045 17.5218 4.80667 17.572C5.32337 17.6733 5.98609 17.7527 6.72664 17.8146C8.2145 17.9389 10.1134 18 12 18C13.8865 18 15.7855 17.9389 17.2733 17.8146C18.0139 17.7527 18.6766 17.6733 19.1933 17.572C19.4495 17.5218 19.6978 17.461 19.9124 17.3836C20.0778 17.324 20.4124 17.1925 20.6478 16.9023C20.9016 16.5895 21.0269 16.1603 21.1021 15.8453C21.1891 15.4809 21.2562 15.047 21.3078 14.5835C21.4114 13.6529 21.4615 12.5198 21.4615 11.409C21.4615 10.299 21.4115 9.18195 21.3073 8.28448C21.2555 7.83868 21.1874 7.42043 21.0969 7.07448C21.0517 6.90201 20.9949 6.72401 20.9206 6.55976C20.8539 6.41236 20.7349 6.18846 20.5245 6.00694Z"
                    stroke="#333333"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M14.5385 11.5L10.0962 14.3578L10.0962 8.64207L14.5385 11.5Z"
                    stroke="#333333"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </g>
              </svg>
            </button>

            <button
              title="Link extern"
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
              onClick={() => {
                setModalUrl("");
                setLinkModal(true);
              }}
            >
              <LinkIcon size={18} />
            </button>
          </div>

          <div className="text-right mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isUploading}
            >
              {isUploading ? "Se încarcă..." : "Salvează"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* YouTube Modal */}
      <Dialog open={ytModal} onOpenChange={setYtModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adaugă URL YouTube</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            placeholder="https://www.youtube.com/watch?v=..."
            value={modalUrl}
            onChange={(e) => setModalUrl(e.target.value)}
          />
          <div className="text-right space-x-2">
            <button
              onClick={() => {
                if (modalUrl.trim())
                  postExternalMaterial(modalUrl.trim(), "YOUTUBE");
                setYtModal(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Adaugă
            </button>
            <button
              onClick={() => setYtModal(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Anulează
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link extern Modal */}
      <Dialog open={linkModal} onOpenChange={setLinkModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adaugă link extern</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            placeholder="https://..."
            value={modalUrl}
            onChange={(e) => setModalUrl(e.target.value)}
          />
          <div className="text-right space-x-2">
            <button
              onClick={() => {
                if (modalUrl.trim())
                  postExternalMaterial(modalUrl.trim(), "LINK");
                setLinkModal(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Adaugă
            </button>
            <button
              onClick={() => setLinkModal(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Anulează
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
