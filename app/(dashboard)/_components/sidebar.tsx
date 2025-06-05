import { SidebarRoutes } from "./sidebar-routes";

interface SidebarProps {
  isSidebarOpen: boolean;
  isSidebarHovered: boolean;
  closeSheet?: () => void;
  isInsideSheet?: boolean;
}

export const Sidebar = ({
  isSidebarOpen,
  isSidebarHovered,
  closeSheet,
  isInsideSheet = false,
}: SidebarProps) => {
  return (
    <div className="h-full w-full bg-white shadow-sm">
      <div className="pt-2 pb-2">
        <SidebarRoutes
          isSidebarOpen={isSidebarOpen}
          isSidebarHovered={isSidebarHovered}
          isInsideSheet={isInsideSheet}
          closeSheet={closeSheet}
        />
      </div>
    </div>
  );
};
