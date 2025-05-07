import { SidebarRoutes } from "./sidebar-routes";

interface SidebarProps {
    isSidebarOpen: boolean;
    isSidebarHovered: boolean;
}

export const Sidebar = ({ isSidebarOpen, isSidebarHovered }: SidebarProps) => {
    return (
        <div className="h-full w-full bg-white shadow-sm">
            <div className="pt-2 pb-2">
                <SidebarRoutes 
                    isSidebarOpen={isSidebarOpen}
                    isSidebarHovered={isSidebarHovered}
                />
            </div>
        </div>
    );
};