"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Controlează starea de deschidere a meniului mobil

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Butonul care deschide meniul lateral pe mobil */}
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>

      {/* Conținutul meniului lateral (afișat din stânga) */}
      <SheetContent side="left" className="p-0 bg-white">
        <SheetHeader>
          <SheetTitle>
            <VisuallyHidden>Mobile navigation</VisuallyHidden>
          </SheetTitle>
        </SheetHeader>

        {/* Sidebar-ul propriu-zis, adaptat pentru Sheet */}
        <Sidebar
          isSidebarOpen={true}
          isSidebarHovered={false}
          isInsideSheet={true}
          closeSheet={() => setIsOpen(false)} // Închide meniul când se navighează
        />
      </SheetContent>
    </Sheet>
  );
};
