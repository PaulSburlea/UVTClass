"use client";

import React from "react";
import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  House,
  GraduationCap,
  UsersRound,
  ChevronDown,
} from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";
import Link from "next/link";

import type { Classroom } from "@/app/types/classroom";

// Funcția folosită de SWR pentru a face fetch la date JSON
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Returnează o culoare dintr-un set predefinit pe baza primei litere a numelui cursului
const getColorForCourse = (name: string) => {
  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

interface SidebarRoutesProps {
  isSidebarOpen: boolean;
  isSidebarHovered: boolean;
  isInsideSheet?: boolean;
  closeSheet?: () => void;
}

export const SidebarRoutes = ({
  isSidebarOpen,
  isSidebarHovered,
  isInsideSheet = false,
  closeSheet,
}: SidebarRoutesProps) => {
  const pathname = usePathname();

  // Detectăm dacă suntem pe pagina profesorului sau studentului după URL
  const isTeacherPage = pathname.includes("/teacher");
  const isStudentPage = pathname.includes("/student");

  // SWR face fetch la lista de cursuri în funcție de rolul utilizatorului
  const { data: teachingCourses = [] } = useSWR<Classroom[]>(
    isTeacherPage ? "/api/courses" : null,
    fetcher
  );
  const { data: enrolledCourses = [] } = useSWR<Classroom[]>(
    isStudentPage ? "/api/enrolled-courses" : null,
    fetcher
  );

  // Stările locale pentru a deschide/închide grupurile de cursuri expandabile
  const [isTeachingOpen, setIsTeachingOpen] = useState(true);
  const [isEnrolledOpen, setIsEnrolledOpen] = useState(true);

  // Dacă sidebar-ul se închide, resetăm grupurile expandate la deschis
  useEffect(() => {
    if (!isSidebarOpen) {
      setIsTeachingOpen(true);
      setIsEnrolledOpen(true);
    }
  }, [isSidebarOpen]);

  // Rute principale comune: Acasă și Catalog, cu variante pentru profesor sau student
  const homeRoute = {
    icon: House,
    label: "Acasă",
    href: isTeacherPage
      ? "/teacher"
      : isStudentPage
      ? "/student"
      : "/",
  };
  const teacherMain = [
    homeRoute,
    { icon: GraduationCap, label: "Catalog", href: "/teacher/grades" },
  ];
  const studentMain = [
    homeRoute,
    { icon: GraduationCap, label: "Catalog", href: "/student/grades" },
  ];
  const guestMain = [
    homeRoute,
    { icon: GraduationCap, label: "Catalog", href: "/grades" },
  ];

  // Funcție care se ocupă de click pe link-uri și eventual închide sheet-ul dacă există
  const handleClickFactory =
    (originalOnClick?: () => void) => () => {
      if (originalOnClick) {
        originalOnClick();
      }
      if (isInsideSheet && closeSheet) {
        closeSheet();
      }
    };

  return (
    <div className="flex flex-col w-full">
      {/* Render rutele principale în funcție de rol */}
      {(isTeacherPage
        ? teacherMain
        : isStudentPage
        ? studentMain
        : guestMain
      ).map((route) => (
        <Link
          href={route.href}
          key={route.href}
          onClick={handleClickFactory(undefined)}
        >
          <SidebarItem
            icon={route.icon}
            label={route.label}
            href={route.href}
            isSidebarOpen={isSidebarOpen}
            isSidebarHovered={isSidebarHovered}
          />
        </Link>
      ))}

      {/* Dacă suntem profesor, afișăm secțiunea de cursuri la care predă */}
      {isTeacherPage && (
        <>
          <hr className="border-t border-gray-300 my-2" />

          {/* Item expandabil pentru cursurile la care predă */}
          <Link
            href="#"
            onClick={handleClickFactory(() => setIsTeachingOpen((o) => !o))}
          >
            <SidebarItem
              icon={UsersRound}
              label="Cursuri la care predai"
              href="#"
              isSidebarOpen={isSidebarOpen}
              isSidebarHovered={isSidebarHovered}
              extraIcon={
                (isSidebarOpen || isSidebarHovered) && (
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${
                      isTeachingOpen ? "rotate-180" : "rotate-0"
                    } text-gray-600`}
                  />
                )
              }
            />
          </Link>

          {/* Listarea cursurilor efectiv, afișate doar dacă sidebar-ul e extins și secțiunea e deschisă */}
          {isTeachingOpen &&
            (isSidebarOpen || isSidebarHovered) &&
            teachingCourses.map((c) => (
              <Link
                href={`/teacher/courses/${c.id}`}
                key={c.id}
                onClick={handleClickFactory(undefined)}
              >
                <SidebarItem
                  leadingIcon={
                    <div
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-white text-sm font-semibold ${getColorForCourse(
                        c.name
                      )}`}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  }
                  label={c.name}
                  href={`/teacher/courses/${c.id}`}
                  isSidebarOpen={isSidebarOpen}
                  isSidebarHovered={isSidebarHovered}
                  icon={UsersRound}
                />
              </Link>
            ))}
        </>
      )}

      {/* Dacă suntem student, afișăm secțiunea de cursuri la care e înscris */}
      {isStudentPage && (
        <>
          <hr className="border-t border-gray-300 my-2" />

          {/* Item expandabil pentru cursurile la care e înscris */}
          <Link
            href="#"
            onClick={handleClickFactory(() => setIsEnrolledOpen((o) => !o))}
          >
            <SidebarItem
              icon={UsersRound}
              label="Cursuri la care ești înscris"
              href="#"
              isSidebarOpen={isSidebarOpen}
              isSidebarHovered={isSidebarHovered}
              extraIcon={
                (isSidebarOpen || isSidebarHovered) && (
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${
                      isEnrolledOpen ? "rotate-180" : "rotate-0"
                    } text-gray-600`}
                  />
                )
              }
            />
          </Link>

          {/* Listarea cursurilor în care studentul e înscris */}
          {isEnrolledOpen &&
            (isSidebarOpen || isSidebarHovered) &&
            enrolledCourses.map((c) => (
              <Link
                href={`/student/courses/${c.id}`}
                key={c.id}
                onClick={handleClickFactory(undefined)}
              >
                <SidebarItem
                  leadingIcon={
                    <div
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-white text-sm font-semibold ${getColorForCourse(
                        c.name
                      )}`}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  }
                  label={c.name}
                  href={`/student/courses/${c.id}`}
                  isSidebarOpen={isSidebarOpen}
                  isSidebarHovered={isSidebarHovered}
                  icon={UsersRound}
                />
              </Link>
            ))}
        </>
      )}
    </div>
  );
};
