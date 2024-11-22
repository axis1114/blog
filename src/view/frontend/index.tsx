import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/navbar/navbar";
export const WebIndex: React.FC = () => {
    return (
        <div className="web_index flex flex-col">
            <Navbar />
            <main className="pt-[100px] w-full">
                <Outlet />
            </main>
        </div>
    );
}

