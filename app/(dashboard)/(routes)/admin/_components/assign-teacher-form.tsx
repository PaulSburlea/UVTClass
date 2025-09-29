"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface Props {
  mutateTeachers: () => void;
}

export default function AssignTeacherForm({ mutateTeachers }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const trimmedEmail = email.trim();
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      toast.error("Te rog introdu un email valid");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (res.ok) {
        toast.success("Rolul Teacher a fost atribuit!");
        setEmail("");
        mutateTeachers();
      } else {
        const { error } = await res.json();
        toast.error(error || "Eroare la atribuire");
      }
    } catch {
      toast.error("Eroare de rețea");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 p-4 border rounded">
      <h2 className="text-xl font-semibold">Atribuie rol de Profesor</h2>
      <input
        type="email"
        placeholder="Email-ul profesorului"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Se atribuie..." : "Atribuie"}
      </button>
    </form>
  );
}
