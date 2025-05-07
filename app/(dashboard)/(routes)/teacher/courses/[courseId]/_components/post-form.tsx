"use client";

import { useRef, useState, FormEvent } from "react";
import useDrivePicker from "react-google-drive-picker";
import {
  PlusCircle,
  MinusCircle,
  Upload,
  Youtube,
  FilePlus2,
  Link as LinkIcon,
} from "lucide-react";

export function PostForm({
  courseId,
  onMaterialAdded,
}: {
  courseId: string;
  onMaterialAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [filesPreview, setFilesPreview] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openPicker] = useDrivePicker();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const postExternalMaterial = (url: string, type: "YOUTUBE" | "LINK" | "DRIVE") => {
    // Adaugă materialul în lista de preview, nu îl trimite imediat
    const fakeFile = new File([""], url); // creăm un pseudo-fisier pentru uniformitate
    setFilesPreview((prev) => [
      ...prev,
      Object.assign(fakeFile, { __external: true, __type: type, __url: url }),
    ]);
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

        const res = await fetch("/api/post/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error(`Eroare la fișierul ${file.name}`);
      }

      alert("Fișiere încărcate cu succes!");
      onMaterialAdded?.();
      fileInputRef.current!.value = "";
      setFilesPreview([]);
    } catch (err: any) {
      alert("Eroare la încărcare: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextPost = async () => {
    if (!text.trim() || !title.trim()) return;
  
    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("title", title);
    formData.append("content", text);
  
    for (const file of filesPreview) {
      if ((file as any).__external) {
        // material extern
        formData.append("links", (file as any).__url);
        formData.append("types", (file as any).__type); // corespondent tip
      } else {
        // fișier local
        formData.append("files", file);
      }
    }
  
    const response = await fetch("/api/post/create", {
      method: "POST",
      body: formData,
    });
  
    if (response.ok) {
      alert("Postare salvată!");
      setTitle("");
      setText("");
      setFilesPreview([]);
      setOpen(false);
      onMaterialAdded?.();
    } else {
      alert("Eroare la salvare.");
    }
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFilesPreview([...filesPreview, ...Array.from(files)]);
    }
  };

  return (
    <div className="mt-4 w-full max-w-screen-lg">
      <div
        className="p-4 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {open ? <MinusCircle size={20} /> : <PlusCircle size={20} />}
          <span>{open ? "Ascunde zona de postare" : "Adaugă material / anunț"}</span>
        </div>
      </div>

      {open && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white space-y-4">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Titlul postării"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full p-2 border rounded resize-none h-24"
            placeholder="Scrie un anunț sau descriere..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

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

          <div className="flex flex-wrap gap-3">
            <form onSubmit={handleFileUpload} encType="multipart/form-data">
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
                openPicker({
                  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                  developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
                  viewId: "DOCS",
                  showUploadView: true,
                  multiselect: true,
                  callbackFunction: (data) => {
                    const url = data.docs?.[0]?.url;
                    if (url) postExternalMaterial(url, "DRIVE");
                  },
                })
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

          <div className="text-right">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={handleTextPost}
            >
              Postează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
