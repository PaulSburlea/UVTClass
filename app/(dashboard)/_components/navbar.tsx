"use client";

import { NavbarRoutes } from "@/components/navbar-routes";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSidebar } from "./sidebar-contex";
import { MobileSidebar } from "./mobile-sidebar";

export const Navbar = () => {
  const [hasShadow, setHasShadow] = useState(false);
  const { setIsSidebarOpen } = useSidebar();

  useEffect(() => {
    const handleScroll = () => {
      setHasShadow(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`p-4 border-b h-[66px] flex items-center bg-white justify-between fixed inset-x-0 top-0 z-50 transition-shadow duration-100 ${
        hasShadow ? "shadow-md" : "shadow-none"
      }`}
    >
    <div className="flex items-center gap-x-4">
      <div className="md:hidden">
        <MobileSidebar />
      </div>

      <div className="hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          <Menu className="!h-6 !w-6 text-[#5F6368]" />
        </Button>
      </div>

      <Link href="/">
        <Button variant="ghost" className="hover:bg-transparent flex items-center gap-2">
          <Logo />
          <span className="font-sans text-[24px] font-normal leading-7 text-[#5F6368] hover:text-[#2D71B7] hover:underline">
            UVT Class
          </span>
        </Button>
      </Link>
    </div>

      <NavbarRoutes />
    </div>
  );
};
