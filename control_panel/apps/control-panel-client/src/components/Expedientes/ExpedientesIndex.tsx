import { Plus } from "lucide-react";
import { Outlet } from "react-router-dom";
import Multiview from "../../utils/multiview";


export function ExpedientesIndex() {
    return (
        <div className="grow p-4">
            <div className="card shadow-lg bg-base-200">
                <div className="card-body">
                    <div className="flex flex-row gap-4">
                        <span className="card-title">Expedientes</span>
                        <button className="btn btn-circle btn-accent tooltip" data-tip="Empezar nuevo expediente"><Plus /></button>
                    </div>
                    <Multiview endpoint={`api/expedientes`} columns={[
                        {field: "clave", title: "# de Expediente"},
                    ]} indexField="clave" emptyMessage="No hay expedientes disponibles"/>
                </div>
            </div>
            <Outlet />
        </div>
    )
}