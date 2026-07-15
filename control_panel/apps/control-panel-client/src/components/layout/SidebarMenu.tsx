import { Archive, Bookmark, BookText, FileText, Home, TrendingUp } from "lucide-react";
import type { plessProfile, plessUISettings } from "../../../../../packages/paperless/types";
import { Link } from "react-router-dom";

type SidebarMenuProps = {
    loggedInUser: plessProfile;
    uiSettings: plessUISettings;
};

export function SidebarMenu({ loggedInUser: _loggedInUser, uiSettings: _uiSettings }: SidebarMenuProps) {
    return (
        <div className="drawer-side is-drawer-close:overflow-visible">
            <label htmlFor="sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="flex min-h-full flex-col items-start bg-base-300 is-drawer-close:w-18 is-drawer-open:w-64">
                <div className="w-full h-16 flex items-center justify-center">
                    <TrendingUp className="text-accent" />
                    <span className="ml-2 text-lg font-bold is-drawer-close:hidden whitespace-nowrap">API Tam - Control</span>
                </div>
                <ul className="menu w-full grow">
                    <li>
                        <Link to="/" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Inicio">
                            <Home className="size-6" />
                            <span className="is-drawer-close:hidden">Inicio</span>
                        </Link>   
                    </li>
                    <li>
                        <Link to="/expedientes" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Expedientes">
                            <BookText className="size-6" />
                            <span className="is-drawer-close:hidden">Expedientes</span>
                        </Link>   
                    </li>
                    <li>
                       <details open>
                            <summary>
                                <Archive className="size-6" />
                                <span className="is-drawer-close:hidden">Catálogos</span>
                            </summary>
                            <ul className="is-drawer-close:m-0 is-drawer-close:p-0">
                                <li><Link to="/catalogos/categorias" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Categorías">
                                    <Bookmark className="size-6" />
                                    <span className="is-drawer-close:hidden">Categorías</span>
                                </Link></li>
                                <li><Link to="/catalogos/tipos-de-documento" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Tipos de Documento">
                                    <FileText className="size-6" />
                                    <span className="is-drawer-close:hidden">Tipos de Documento</span>
                                </Link></li>
                            </ul>
                        </details> 
                    </li>
                </ul>
            </div>
        </div>
    )
}