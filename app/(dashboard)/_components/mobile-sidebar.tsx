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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white">
        <SheetHeader>
          <SheetTitle>
            <VisuallyHidden>Mobile navigation</VisuallyHidden>
          </SheetTitle>
        </SheetHeader>

        <Sidebar
          isSidebarOpen={true}
          isSidebarHovered={false}
          isInsideSheet={true}
          closeSheet={() => setIsOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};
