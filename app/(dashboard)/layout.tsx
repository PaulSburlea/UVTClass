"use client";

import { SidebarProvider, useSidebar } from "./_components/sidebar-contex";
import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
};

const DashboardLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarOpen, isSidebarHovered, setIsSidebarHovered } = useSidebar();

  return (
    <div className="h-screen">
      {/* Navbar */}
      <div className="h-[66px] fixed inset-x-0 top-0 w-full z-50 bg-white border-b">
        <Navbar />
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-[66px] left-0 h-[calc(100vh-66px)] bg-white shadow-lg transition-all duration-200 z-40 border-r overflow-y-auto overflow-x-hidden
          ${isSidebarOpen ? "w-[300px]" : "w-[76px]"}
          ${!isSidebarOpen && isSidebarHovered ? "w-[300px]" : ""}`}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} isSidebarHovered={isSidebarHovered} />
      </div>

      {/* Content */}
      <main
        className={`p-4 transition-all duration-200 h-[calc(100vh-66px)] ${
          isSidebarOpen || isSidebarHovered ? "ml-[300px]" : "ml-[76px]"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
