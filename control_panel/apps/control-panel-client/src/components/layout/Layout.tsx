import { Outlet, useRouteLoaderData } from "react-router-dom";
import type { plessProfile, plessUISettings } from "../../../../../packages/paperless/types";
import type { RouteAuthLoaderData } from "../../utils/routeAuthLoader";
import UserDropdown from "./userDropdown";
import { Home, Menu, TrendingUp } from "lucide-react";

export default function Layout(){
    const authData = useRouteLoaderData("root") as RouteAuthLoaderData | undefined;
    const loggedInUser: plessProfile | null = authData?.loggedInUser ?? null;
    const uiSettings: plessUISettings | null = authData?.uiSettings ?? null;

    return (
        <div className="drawer lg:drawer-open">
            <input id="sidebar" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col min-h-screen">
                <nav className="navbar bg-base-200 p-4 h-16 flex justify-between items-center shadow-sm">
                    <label htmlFor="sidebar" aria-label="open sidebar" className="btn btn-square btn-ghost">
                        <Menu />
                    </label>
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
            
            {loggedInUser && (
            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="flex min-h-full flex-col items-start bg-base-300 is-drawer-close:w-14 is-drawer-open:w-64">
                    <div className="w-full h-16 flex items-center justify-center">
                        <TrendingUp className="text-accent" />
                        <span className="ml-2 text-lg font-bold is-drawer-close:hidden whitespace-nowrap">API Tam - Control</span>
                    </div>
                    <ul className="menu w-full grow">
                        <li>
                            <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Inicio">
                                <Home className="size-4" />
                                <span className="is-drawer-close:hidden">Inicio</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            )}
        </div>
    )
}