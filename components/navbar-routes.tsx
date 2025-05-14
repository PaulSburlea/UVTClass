"use client";

import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

export const NavbarRoutes = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const isTeacherPage = pathname?.startsWith("/teacher");

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    const closeDropdown = () => setIsDropdownOpen(false);

    return (
        <div className="flex gap-x-3 ml-auto">
            {/* Dropdown cu acțiuni */}
            <div className="relative" ref={dropdownRef}>
                <Button
                    ref={buttonRef}
                    size="icon"
                    variant="ghost"
                    className="rounded-full transition"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <Plus className="!w-6 !h-6" />
                </Button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg p-2 space-y-1">
                        {!isTeacherPage && (
                            <Button
                                onClick={() => {
                                    closeDropdown();
                                    router.push("/enroll-course");
                                }}
                                variant="ghost"
                                className="w-full justify-start"
                            >
                                Înscrie-te la un curs
                            </Button>
                        )}

                        {isTeacherPage && (
                            <Button
                                onClick={() => {
                                    closeDropdown();
                                    router.push("/teacher/create");
                                }}
                                variant="ghost"
                                className="w-full justify-start"
                            >
                                Creează un curs
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center">
                <UserButton />
            </div>
        </div>
    );
};