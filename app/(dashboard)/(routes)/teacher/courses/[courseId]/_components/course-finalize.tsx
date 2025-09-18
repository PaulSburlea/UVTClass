"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export const CourseFinalize = () => {
  const router = useRouter();

  // Afișează mesaj de succes și redirecționează profesorul înapoi la dashboard
  const onClick = () => {
    toast.success("Cursul a fost configurat cu succes!");
    router.push("/teacher");
  };

  return (
    <div className="mt-10">
      {/* Buton pentru finalizarea configurării cursului */}
      <Button 
        data-cy="btn-finalize" 
        onClick={onClick} 
        className="w-full" 
        size="lg"
      >
        Finalizați configurarea
      </Button>
    </div>
  );
};
