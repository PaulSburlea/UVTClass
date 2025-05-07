"use client";

import { useState, useRef, FormEvent } from "react";
import useDrivePicker from "react-google-drive-picker";

// Lucide icons
import {
  PlusCircle,
  MinusCircle,
  Upload,
  Youtube,
  FilePlus2,
  Link as LinkIcon,
} from "lucide-react";

export function MaterialsBox({
  courseId,
  onMaterialAdded,
}: {
  courseId: string;
  onMaterialAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [openPicker, authResponse] = useDrivePicker();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [showYouTubePicker, setShowYouTubePicker] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const postExternalMaterial = async (url: string, type: "YOUTUBE" | "LINK" | "DRIVE") => {
    const res = await fetch("/api/materials/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, url, type }),
    });
  
    if (res.ok) {
      alert("Material adăugat!");
      onMaterialAdded?.();
    } else {
      alert("Eroare la salvare.");
    }
  };
  

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    formData.append("courseId", courseId);
    
    setIsUploading(true);
    
    try {
      // Send to your API endpoint that will handle the upload
      const response = await fetch("/api/materials/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Upload result:", result);
      alert("Fișier încărcat!");
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Eroare la încărcare: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="mt-4 w-full max-w-screen-lg">
      {/* Header box */}
      <div
        className="p-4 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {open ? <MinusCircle size={20} /> : <PlusCircle size={20} />}
          <span>{open ? "Ascunde zona de postare" : "Adaugă material / anunț"}</span>
        </div>
      </div>

      {open && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white space-y-4">
          {/* Textarea */}
          <textarea
            className="w-full p-2 border rounded resize-none h-24"
            placeholder="Scrie un anunț sau descriere..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Icon-only buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Upload local - with form */}
            <form onSubmit={handleFormSubmit} encType="multipart/form-data">
              <input
                type="file"
                name="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={(e) => {
                  // Auto-submit when files are selected
                  if (e.target.files && e.target.files.length > 0) {
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleUploadClick}
                className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100 transition"
                title="Încarcă fișier"
                disabled={isUploading}
              >
                <Upload size={18} />
              </button>
            </form>

            {/* YouTube */}
            <button
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100 transition"
              onClick={() => {
                const url = prompt("Adaugă URL YouTube");
                if (url) postExternalMaterial(url, "YOUTUBE");
              }}
              
              title="YouTube"
            >
              <Youtube size={18} />
            </button>

            {/* Google Drive */}
            <button
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100 transition"
              onClick={() =>
                openPicker({
                  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                  developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
                  viewId: "DOCS",
                  showUploadView: true,
                  multiselect: true,
                  callbackFunction: (data) => {
                    console.log("Google Drive:", data);
                  },
                })
              }
              title="Google Drive"
            >
              <FilePlus2 size={18} />
            </button>

            {/* Link extern */}
            <button
              className="w-10 h-10 rounded-full border shadow-sm flex items-center justify-center hover:bg-gray-100 transition"
              onClick={() => {
                const link = prompt("Adaugă URL");
                if (link) console.log("Link:", link);
              }}
              title="Link extern"
            >
              <LinkIcon size={18} />
            </button>
          </div>

          {/* Buton de postare */}
          <div className="text-right">
          <button
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
  onClick={async () => {
    if (!text.trim()) return;

    const response = await fetch("/api/materials/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, description: text }),
    });

    if (response.ok) {
      alert("Postare salvată!");
      setText("");
      setOpen(false);  // Închide secțiunea de postare
      onMaterialAdded?.();  // Apelează funcția de reîmprospătare
    } else {
      alert("Eroare la salvare.");
    }
  }}
>
  Postează
</button>

          </div>
        </div>
      )}
    </div>
  );
}
