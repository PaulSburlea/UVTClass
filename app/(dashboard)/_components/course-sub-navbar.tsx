// app/(dashboard)/_components/course-sub-navbar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-contex";

const tabs = [
  { label: "Flux",     getHref: (base: string, courseId: string) => `${base}/courses/${courseId}` },
  { label: "Note",     getHref: (base: string, courseId: string) => `${base}/grades/${courseId}` },
  { label: "Persoane", getHref: (base: string, courseId: string) => `${base}/courses/${courseId}/people` },
];

interface CourseSubNavbarProps {
  courseId: string;
}

export const CourseSubNavbar = ({ courseId }: CourseSubNavbarProps) => {
  const pathname = usePathname();
  const { isSidebarOpen, isSidebarHovered } = useSidebar();
  const sidebarWidth = isSidebarOpen || isSidebarHovered ? 300 : 76;

  const base = pathname.startsWith("/student/") ? "/student" : "/teacher";

  return (
    <div
      className="bg-white border-b h-[50px] fixed top-[66px] z-40 flex items-center px-6 transition-all duration-200
                 left-0 right-0 md:left-[var(--sidebar-width)]"
      style={{ 
        '--sidebar-width': `${sidebarWidth}px`
      } as React.CSSProperties}
    >
      {tabs.map((tab) => {
        const href = tab.getHref(base, courseId);
        const isActive = pathname === href;
        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              "mr-6 text-sm font-medium pb-1 border-b-2 transition-colors",
              isActive
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-600"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};