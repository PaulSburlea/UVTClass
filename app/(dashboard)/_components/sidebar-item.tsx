// sidebar-item.tsx
"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: LucideIcon;
  leadingIcon?: React.ReactNode;
  label: string;
  href: string;
  isSidebarOpen: boolean;
  isSidebarHovered: boolean;
  extraIcon?: React.ReactNode;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  leadingIcon,
  label,
  href,
  isSidebarOpen,
  isSidebarHovered,
  extraIcon,
  onClick,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const pathSegs = pathname.split("/");
  const hrefSegs = href.split("/");

  const isCourseLink =
    (hrefSegs[1] === "teacher" && hrefSegs[2] === "courses") ||
    (hrefSegs[1] === "student" && hrefSegs[2] === "courses");
  const currentCourseId = pathSegs[3];
  const thisCourseId    = hrefSegs[3];

  const isActive =
    pathname === href ||
    (isCourseLink && thisCourseId === currentCourseId);

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(href);
  };

  const shouldExpand = isSidebarOpen || isSidebarHovered;

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      className={cn(
        "h-10 flex items-center text-[#3C4043] text-sm font-[500] transition-colors duration-300",
        isActive ? "bg-[#E8F0FE] text-[#3C4043]" : "hover:bg-[#F6F6F6]",
        shouldExpand ? "w-[95%]" : "w-[85%]",
        "rounded-r-3xl rounded-l-none"
      )}
    >
      <div
        className={cn(
          "flex items-center w-full",
          leadingIcon ? "pl-2.5" : "pl-3"
        )}
      >
        <div className="flex-shrink-0 flex items-center justify-center">
          {leadingIcon ?? (
            <Icon
              className={cn(
                "text-[#5F6368] transition-opacity",
                isActive && "text-[#5F6368]",
                "!w-6 !h-6"
              )}
            />
          )}
        </div>
        <span
          className={cn(
            leadingIcon
              ? "ml-2 transition-opacity duration-300 truncate"
              : "ml-4 transition-opacity duration-300 truncate",
            shouldExpand ? "opacity-100 visible" : "opacity-0 invisible"
          )}
          style={{ minWidth: shouldExpand ? "0px" : "0px" }}
        >
          {label}
        </span>
        {extraIcon && <span className="ml-auto pr-3">{extraIcon}</span>}
      </div>
    </Button>
  );
};
