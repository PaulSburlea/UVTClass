"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-contex";

const tabs = [
  { label: "Flux", value: "stream" },
  { label: "Activitate la curs", value: "activity" },
  { label: "Persoane", value: "people" },
];

export const CourseSubNavbar = ({ courseId }: { courseId: string }) => {
  const pathname = usePathname();
  const { isSidebarOpen, isSidebarHovered } = useSidebar();

  const sidebarWidth = isSidebarOpen || isSidebarHovered ? 300 : 76;

  return (
    <div
      className="bg-white border-b h-[50px] fixed top-[66px] z-40 flex items-center px-6 transition-all duration-200"
      style={{ left: sidebarWidth, right: 0 }}
    >
      {tabs.map(tab => {
        const isActive = pathname.includes(`/teacher/courses/${courseId}/${tab.value}`);
        return (
          <Link
            key={tab.value}
            href={`/teacher/courses/${courseId}/${tab.value}`}
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
