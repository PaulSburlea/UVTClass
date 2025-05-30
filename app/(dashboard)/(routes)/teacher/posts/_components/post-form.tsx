"use client";

import { useRef, useState, FormEvent } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  PlusCircle,
  MinusCircle,
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

// Tip pentru fișiere externe (link YouTube, Drive, link)
interface ExternalFile extends File {
  __external: true;
  __type: "YOUTUBE" | "LINK" | "DRIVE";
  __url: string;
}

type PreviewFile = File | ExternalFile;

// Helper pentru a detecta ExternalFile
function isExternalFile(file: PreviewFile): file is ExternalFile {
  return (file as ExternalFile).__external === true;
}

// helper care alege icon și culoare pe baza tipului MIME
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

export function PostForm({
  courseId,
  onMaterialAdded,
}: {
  courseId: string;
  onMaterialAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [ytModal, setYtModal] = useState(false);
  const [linkModal, setLinkModal] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [extUrl, setExtUrl] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [filesPreview, setFilesPreview] = useState<PreviewFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const postExternalMaterial = (url: string, type: ExternalFile["__type"]) => {
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
  };

  const handleFileUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("courseId", courseId);
        const res = await fetch("/api/post/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error(`Eroare la fișierul ${file.name}`);
      }
      toast.success("Fișiere încărcate cu succes!");
      onMaterialAdded?.();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFilesPreview([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Eroare necunoscută";
      toast.error("Eroare la încărcare: " + msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextPost = async () => {
    if (!title.trim()) {
      toast.error("Titlul este obligatoriu.");
      return;
    }
    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("title", title);
    formData.append("content", text);
    filesPreview.forEach((file) => {
      if (isExternalFile(file)) {
        formData.append("links", file.__url);
        formData.append("types", file.__type);
      } else {
        formData.append("files", file);
      }
    });
    const response = await fetch("/api/post/create", { method: "POST", body: formData });
    if (response.ok) {
      toast.success("Postarea a fost publicată cu succes!");
      setTitle("");
      setText("");
      setFilesPreview([]);
      setOpen(false);
      onMaterialAdded?.();
    } else {
      toast.error("Eroare la salvare.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const unique = newFiles.filter(
        (file) => !filesPreview.some((pf) => pf.name === file.name)
      );
      setFilesPreview((prev) => [...prev, ...unique]);
    }
  };

  const handleRemoveFile = (fileToRemove: PreviewFile) => {
    setFilesPreview((prev) => prev.filter((file) => file !== fileToRemove));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mt-4 w-full max-w-screen-lg">
      <div
        className="p-4 border rounded-lg cursor-pointer bg-white hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          {open ? <MinusCircle size={20} /> : <PlusCircle size={20} />}
          <span>{open ? "Ascunde zona de postare" : "Adaugă material / anunț"}</span>
        </div>
      </div>

      {open && (
        <div className="mt-4 p-4 border rounded-lg bg-white space-y-4">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Titlul postării"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full p-2 border rounded h-24 resize-none"
            placeholder="Scrie un anunț sau descriere..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {filesPreview.length > 0 && (
            <div className="mt-4 max-h-60 overflow-auto">
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
                  } else if (!isExternalFile(file) && file.type.startsWith("image")) {
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
                    const { icon, bg } = getFileIconAndColor(file.type);
                    thumb = (
                      <div className={`${bg} w-12 h-12 rounded flex items-center justify-center`}>
                        {icon}
                      </div>
                    );
                  }

                  const ext = file.name.split(".").pop()?.toUpperCase();

                  return (
                    <li key={i} className="flex items-center justify-between border p-2 rounded-lg">
                      <div className="flex items-center gap-3">
                        {thumb}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium truncate">{file.name}</span>
                          {ext && <span className="text-xs text-gray-500 uppercase">.{ext}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file)}
                        className="text-gray-500 hover:text-gray-900"
                      >
                        <X size={18} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <form onSubmit={handleFileUpload} encType="multipart/form-data">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={handleUploadClick}
                className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
                disabled={isUploading}
                title="Încarcă fișier"
              >
                <Upload size={18} />
              </button>
            </form>

            <button
              title="YouTube"
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
              onClick={() => setYtModal(true)}
            >
              <LinkIcon size={18} />
            </button>

            <button
              title="Link extern"
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
              onClick={() => setLinkModal(true)}
            >
              <LinkIcon size={18} />
            </button>
          </div>

          <div className="text-right">
            <button
              onClick={handleTextPost}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Postează
            </button>
          </div>
        </div>
      )}


      {/* Modal YouTube */}
      <Dialog open={ytModal} onOpenChange={setYtModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adaugă URL YouTube</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            placeholder="https://www.youtube.com/watch?v=..."
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
          />
          <div className="text-right">
            <button
              onClick={() => {
                if (ytUrl.trim()) postExternalMaterial(ytUrl.trim(), "YOUTUBE");
                setYtModal(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
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

      {/* Modal Link extern */}
      <Dialog open={linkModal} onOpenChange={setLinkModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adaugă link extern</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            placeholder="https://..."
            value={extUrl}
            onChange={(e) => setExtUrl(e.target.value)}
          />
          <div className="text-right">
            <button
              onClick={() => {
                if (extUrl.trim()) postExternalMaterial(extUrl.trim(), "LINK");
                setLinkModal(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
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
    </div>
  );
}
