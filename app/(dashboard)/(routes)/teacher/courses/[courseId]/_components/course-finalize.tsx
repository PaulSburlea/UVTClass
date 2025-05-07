"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export const CourseFinalize = () => {
  const router = useRouter();

  const onClick = () => {
    toast.success("Cursul a fost configurat cu succes!");
    router.push("/teacher");
  };

  return (
    <div className="mt-10">
      <Button onClick={onClick} className="w-full" size="lg">
        Finalizați configurarea
      </Button>
    </div>
  );
};
