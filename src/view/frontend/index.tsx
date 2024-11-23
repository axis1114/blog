import { Outlet } from "react-router-dom";
import { NavbarFrontend } from "@/components/navbar/navbar_frontend";
export const WebIndex = () => {
    return (
        <div className="web_index flex flex-col">
            <NavbarFrontend />
            <main className="pt-[100px] w-full flex-1">
                <Outlet />
            </main>
        </div>
    );
}

