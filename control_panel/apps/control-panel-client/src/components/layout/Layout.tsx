import { Outlet, useRouteLoaderData } from "react-router-dom";
import type { plessProfile, plessUISettings } from "../../../../../packages/paperless/types";
import type { RouteAuthLoaderData } from "../../utils/routeAuthLoader";
import UserDropdown from "./userDropdown";
import { Menu } from "lucide-react";
import { SidebarMenu } from "./SidebarMenu";

export default function Layout(){
    const authData = useRouteLoaderData("root") as RouteAuthLoaderData | undefined;
    const loggedInUser: plessProfile | null = authData?.loggedInUser ?? null;
    const uiSettings: plessUISettings | null = authData?.uiSettings ?? null;

    return (
        <div className="drawer lg:drawer-open">
            <input id="sidebar" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col min-h-screen">
                <nav className="navbar bg-base-200 p-4 h-16 flex justify-between items-center shadow-sm">
                    {loggedInUser && (
                        <label htmlFor="sidebar" aria-label="open sidebar" className="btn btn-square btn-ghost">
                            <Menu />
                        </label>
                    )}
                    {loggedInUser ? (
                        <UserDropdown profile={loggedInUser} uiSettings={uiSettings!} />
                    ) : (
                        <input type="checkbox" value="retro" className="toggle theme-controller" />
                    )}
                </nav>
                <Outlet />
                <footer className="bg-base-300 p-4 text-right shadow-sm">
                    <p className="text-sm">&copy; 2026 All X Solutions.</p>
                </footer>
            </div>
            
            {loggedInUser && <SidebarMenu loggedInUser={loggedInUser} uiSettings={uiSettings!} />}
        </div>
    )
}