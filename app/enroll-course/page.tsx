"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function EnrollCoursePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEnroll = async () => {
    setError("");

    const res = await fetch("/api/enroll-course", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const text = await res.text();
      setError(text || "Something went wrong");
      return;
    }

    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Înapoi
      </Button>

      <h1 className="text-xl font-semibold mb-4">Înscrie-te la un curs</h1>

      <Input
        placeholder="Codul cursului"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button onClick={handleEnroll} className="mt-2">
        Înscrie-mă
      </Button>
    </div>
  );
}
