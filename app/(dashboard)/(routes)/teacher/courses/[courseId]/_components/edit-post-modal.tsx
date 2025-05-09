"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Youtube, FilePlus2, Link as LinkIcon } from "lucide-react";

interface EditPostModalProps {
  post: {
    id: string;
    title: string;
    content: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditPostModal({ post, isOpen, onClose, onUpdated }: EditPostModalProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [filesPreview, setFilesPreview] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const response = await fetch(`/api/post/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      toast.success("Postarea a fost actualizată!");
      onUpdated();
      onClose();
    } else {
      toast.error("Eroare la actualizare.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFilesPreview([...filesPreview, ...Array.from(files)]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const postExternalMaterial = (url: string, type: "YOUTUBE" | "LINK" | "DRIVE") => {
    const fakeFile = new File([""], url); // creăm un pseudo-fisier pentru uniformitate
    setFilesPreview((prev) => [
      ...prev,
      Object.assign(fakeFile, { __external: true, __type: type, __url: url }),
    ]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editează Postarea</DialogTitle>
        </DialogHeader>

        <input
          className="w-full border p-2 rounded mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border p-2 rounded resize-none h-24"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Preview fișiere */}
        {filesPreview.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">Preview fișiere:</h3>
            <div className="flex gap-3 flex-wrap">
              {filesPreview.map((file, index) => {
                const external = (file as any).__external;
                const url = (file as any).__url;
                const type = (file as any).__type;

                return (
                  <div key={index} className="flex flex-col items-center">
                    {external ? (
                      type === "YOUTUBE" ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${new URL(url).searchParams.get("v")}`}
                          className="w-40 h-24 rounded-md"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : (
                        <a href={url} target="_blank" className="text-sm text-blue-600 underline">
                          Link extern ({type})
                        </a>
                      )
                    ) : file.type.startsWith("image") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-md text-xs text-center px-1">
                        {file.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Butoane pentru încărcare fișiere */}
        <div className="flex flex-wrap gap-3 mt-4">
          <form encType="multipart/form-data">
            <input
              type="file"
              name="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={handleUploadClick}
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
              title="Încarcă fișier"
              disabled={isUploading}
            >
              <Upload size={18} />
            </button>
          </form>

          {/* Butoane pentru materiale externe */}
          <button
            title="YouTube"
            className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
            onClick={() => {
              const url = prompt("Adaugă URL YouTube");
              if (url) postExternalMaterial(url, "YOUTUBE");
            }}
          >
            <Youtube size={18} />
          </button>

          <button
            title="Google Drive"
            className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
            onClick={() =>
              alert("Integrate Google Drive Picker here")
              // Aici adăugăm logica pentru a deschide Google Drive Picker
            }
          >
            <FilePlus2 size={18} />
          </button>

          <button
            title="Link extern"
            className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100"
            onClick={() => {
              const url = prompt("Adaugă URL");
              if (url) postExternalMaterial(url, "LINK");
            }}
          >
            <LinkIcon size={18} />
          </button>
        </div>

        {/* Buton de salvare */}
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
  );
}
