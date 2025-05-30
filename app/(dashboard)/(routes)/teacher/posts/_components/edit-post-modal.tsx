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

// helper care alege icon și culoare pe baza tipului MIME
function getFileIconAndColor(mime: string) {
  if (mime.startsWith("image/")) return { icon: null, bg: "" };
  if (mime === "application/pdf") return { icon: <FileText size={24} />, bg: "bg-red-100" };
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword"
  ) return { icon: <FileText size={24} />, bg: "bg-blue-100" };
  if (
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/vnd.ms-excel"
  ) return { icon: <FilePlus size={24} />, bg: "bg-green-100" };
  if (
    mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mime === "application/vnd.ms-powerpoint"
  ) return { icon: <FilePlus size={24} />, bg: "bg-orange-100" };
  if (mime.startsWith("video/")) return { icon: <FileVideo size={24} />, bg: "bg-purple-100" };
  if (mime.startsWith("audio/")) return { icon: <FileAudio size={24} />, bg: "bg-yellow-100" };
  if (
    mime === "application/zip" ||
    mime === "application/x-7z-compressed" ||
    mime === "application/x-rar-compressed"
  ) return { icon: <FileArchive size={24} />, bg: "bg-gray-100" };
  return { icon: <FileText size={24} />, bg: "bg-gray-50" };
}

interface MaterialFile extends File {
  __external?: boolean;
  __type?: string;
  __url?: string;
  __id?: string;
}

interface EditPostModalProps {
  post: {
    id: string;
    title: string;
    content?: string | null;
    materials?: {
      id: string;
      title: string;
      type: string;
      filePath?: string;
      url?: string;
    }[];
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
  const [filesPreview, setFilesPreview] = useState<MaterialFile[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [linkPreviews, setLinkPreviews] = useState<Record<string, { image?: string }>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [ytModal, setYtModal] = useState(false);
  const [linkModal, setLinkModal] = useState(false);
  const [modalUrl, setModalUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // populate on open
  useEffect(() => {
    if (!isOpen) return;
    setTitle(post.title);
    setContent(post.content ?? "");
    setRemovedIds([]);
    const mapped = (post.materials || []).map((m) => {
      const fake = new File([""], m.title) as MaterialFile;
      fake.__external = m.type !== "FILE";
      fake.__type = m.type;
      fake.__url = m.url;
      fake.__id = m.id;
      return fake;
    });
    setFilesPreview(mapped);
  }, [isOpen, post]);

  // fetch OG images for externals
  useEffect(() => {
    filesPreview.forEach((f) => {
      if (f.__external && f.__type === "LINK" && f.__url && !linkPreviews[f.name]) {
        fetch(`/api/get-title?url=${encodeURIComponent(f.__url)}`)
          .then((r) => r.json())
          .then((data) => {
            setLinkPreviews((p) => ({ ...p, [f.name]: { image: data.image } }));
          });
      }
    });
  }, [filesPreview, linkPreviews]);

  const handleRemoveFile = (file: MaterialFile) => {
    setFilesPreview((prev) => prev.filter((f) => f !== file));
    if (file.__id) setRemovedIds((prev) => [...prev, file.__id!]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const postExternalMaterial = (url: string, type: "YOUTUBE" | "LINK") => {
    if (filesPreview.some((f) => f.__external && f.__url === url)) {
      toast.error("Link-ul a fost deja adăugat.");
      return;
    }
    const fake = new File([""], url) as MaterialFile;
    fake.__external = true;
    fake.__type = type;
    fake.__url = url;
    setFilesPreview((p) => [...p, fake]);
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
  if (f.__external) {
    // only send brand‑new externals (those without an __id)
    if (!f.__id) {
      form.append("links", f.__url!)
      form.append("types", f.__type!)
    }
  } else {
    if (f.size > 0) {
      form.append("files", f)
    }
  }
})

    
    setIsUploading(true);
    const res = await fetch(`/api/post/${post.id}`, { method: "PUT", body: form });
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
    ) as MaterialFile[];
    setFilesPreview((p) => [...p, ...newFiles]);
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
                  const isExternal = file.__external;
                  const url = file.__url;
                  const type = file.__type;
                  let thumb: React.ReactNode;

                  if (isExternal && type === "YOUTUBE" && url) {
                    thumb = (
                      <div className="w-20 h-12 overflow-hidden rounded">
                        <iframe
                          src={`https://www.youtube.com/embed/${new URL(url).searchParams.get(
                            "v"
                          )}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    );
                                } else if (isExternal && type === "LINK" && url) {
                const imgUrl =
                  linkPreviews[file.name]?.image ||
                  `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`;
                thumb = (
                  <Image
                    src={imgUrl}
                    alt="Preview link"
                    width={48}
                    height={48}
                    className="object-cover rounded cursor-pointer"
                  />
                );
              } else if (!isExternal && file.type.startsWith("image/")) {
                thumb = (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    width={48}
                    height={48}
                    className="object-cover rounded cursor-pointer"
                  />
                );
              } else {
                    const mime = isExternal ? "application/octet-stream" : file.type;
                    const { icon, bg } = getFileIconAndColor(mime);
                    thumb = (
                      <div className={`${bg} w-12 h-12 rounded flex items-center justify-center`}>
                        {icon}
                      </div>
                    );
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
                          <span className="text-sm font-medium truncate">{file.name}</span>
                          {ext && (
                            <span className="text-xs text-gray-500 uppercase">.{ext}</span>
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
            >
              <Upload size={18} />
            </button>
            <button
              title="YouTube"
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
              onClick={() => setYtModal(true)}
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                className="w-[18px] h-[18px] text-red-600"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </button>
            <button
              title="Link extern"
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
              onClick={() => setLinkModal(true)}
            >
              <LinkIcon size={18} />
            </button>
          </div>

          <div className="text-right mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Salvează
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

      {/* Link Modal */}
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
