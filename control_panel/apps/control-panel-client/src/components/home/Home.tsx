import { BadgeAlert, Info, Server } from "lucide-react";
import Multiview, { type MultiviewColumn } from "../../utils/multiview";
import type { plessUISettings } from "../../../../../packages/paperless/types";
import type { RouteAuthLoaderData } from "../../utils/routeAuthLoader";
import { useNavigate, useRouteLoaderData } from "react-router-dom";

export function OrphanedExpedientesRow({ item, index, columns }: { item: any, index: number, columns: MultiviewColumn[] }) {
    const navigation = useNavigate();
    return (
        <tr key={index} className="hover cursor-pointer" onClick={() => {
            navigation(`/expedientes/nuevo?clave=${item.value_text}`);
        }}>
            {columns.map((column, colIndex) => (
                <td key={colIndex}>{String(item[column.field] ?? "")}</td>
            ))}
        </tr>
    );
}

export default function Home() {
    return (
        <div className="flex flex-col grow p-5 gap-4">
            <div className="card shadow-md bg-base-300">
                <div className="card-body">
                    <h2 className="card-title">Bienvenido a API Tam - XPControl</h2>
                    <p>Esta herramienta permite gestionar y controlar los expedientes de la Administración Portuaria Integral del estado de Tamaulipas.</p>
                </div>
            </div>
            <div className="flex flex-row gap-4">
                <ServerStatus />
                <OrphanedExpedientes />
            </div>
        </div>
    )
}

export function ServerStatus() {
    const authData = useRouteLoaderData("root") as RouteAuthLoaderData | undefined;
    const uiSettings: plessUISettings | null = authData?.uiSettings ?? null;

    return (
        <div className="card shadow-md bg-base-200 w-lg">
            <div className="card-body">
                <div className="flex flex-row items-center gap-4 w-full">
                    <Server className="text-primary" />
                    <h2 className="card-title">Estado del servidor</h2>
                    <div className="text-info tooltip tooltip-right grow flex flex-row justify-end" data-tip="Información general del servidor y de los servicios relacionados">
                        <Info />
                    </div>
                </div>
                <table className="table table-auto w-full">
                    <tbody>
                        <tr>
                            <td>Paperless</td>
                            <td>{uiSettings?.settings.version}</td>
                            <td className="text-success">{uiSettings ? "En línea" : "Desconectado"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function OrphanedExpedientes() {
    return (
        <div className="card shadow-md bg-base-200 w-lg">
            <div className="card-body">
                <div className="flex flex-row items-center gap-4 w-full">
                    <BadgeAlert className="text-accent" />
                    <h2 className="card-title">Expedientes huerfanos</h2>
                    <div className="text-info tooltip tooltip-right grow flex flex-row justify-end" data-tip="Documentos que tienen número de expedientes pero no están manejados por el control de expedientes">
                        <Info />
                    </div>
                </div>
                <Multiview endpoint="/api/expedientes/orphaned" columns={[
                    { title: "# de expediente", field: "value_text" },
                    { title: "# de documentos", field: "count" },
                ]} indexField="value_text" rowComponent={OrphanedExpedientesRow} />
            </div>
        </div>
    )
}