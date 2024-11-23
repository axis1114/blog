import { NavbarBackend } from "@/components/navbar/navbar_backend";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/sidebar/sidebar";

export const AdminIndex = () => {
    return (
        <div className="min-h-screen">
            <NavbarBackend />
            <div className="flex pt-[64px]">
                <Sidebar />
                <main className="flex-1 transition-all duration-300 overflow-y-auto overflow-x-hidden h-[calc(100vh-64px)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

