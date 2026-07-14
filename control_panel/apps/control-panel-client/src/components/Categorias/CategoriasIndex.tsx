import { Plus, Save } from "lucide-react";
import Multiview from "../../utils/multiview";
import { useFetcher, useParams } from "react-router-dom";
import type { Categoria } from "../../../../../packages/server/types";
import { useEffect, useState } from "react";

async function fetchCategoria(id: string): Promise<Categoria> {
    const response = await fetch(`/api/categorias/${id}`);
    if (!response.ok) {
        throw new Error(`Error fetching category with id ${id}: ${response.statusText}`);
    }
    return await response.json();
}

export default function CategoriasIndex() {
    const { id } = useParams<{ id?: string }>();
    const fetcher = useFetcher<{ error?: string, categoria?: Categoria, success?: boolean }>();
    const isSubmitting = fetcher.state === "submitting";
    const [categoria, setCategoria] = useState<Categoria | null>(null);

    useEffect(() => {
        if (!id) {
            setCategoria(null);
            return;
        }

        fetchCategoria(id)
            .then(setCategoria)
            .catch(error => {
                console.error(error);
            });
    }, [id]);

    useEffect(() => {
        if (fetcher.data?.categoria) {
            setCategoria(fetcher.data.categoria);
        }
    }, [fetcher.data]);

    if (id) {
        return categoria ? (
            <div className="grow p-4">
                <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                        <fetcher.Form method="post" id="categoria-form" >
                            <fieldset className="fieldset w-full">
                                <input type="hidden" name="id" value={categoria?.id || ""} />

                                <label className="label">Nombre</label>
                                <input type="text" name="nombre" className="input w-full" value={categoria?.nombre || ""} onChange={e => setCategoria({ ...categoria, nombre: e.target.value } as Categoria)} />

                                <label className="label">Estatus</label>
                                <select name="habilitado" value={categoria?.habilitado ? "true" : "false"} className="select w-full" onChange={e => setCategoria({ ...categoria, habilitado: e.target.value === "true" } as Categoria)}>
                                    <option value="true">Habilitada</option>
                                    <option value="false">Deshabilitada</option>
                                </select>
                            </fieldset>
                        </fetcher.Form>
                        {fetcher.data?.error && (
                            <div className="alert alert-error alert-outline mt-4">
                                <span>{fetcher.data.error}</span>
                            </div>
                        )}
                        {fetcher.data?.success && (
                            <div className="alert alert-success alert-outline mt-4">
                                <span>Categoría guardada exitosamente</span>
                            </div>
                        )}
                    </div>
                    <div className="card-actions justify-end items-center p-4 border-t">
                        <button type="submit" form="categoria-form" className="btn btn-primary" disabled={isSubmitting}><Save /></button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center grow">
                <span className="loading loading-bars loading-xl"></span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 grow p-4">
            <div className="card shadow-lg bg-base-200">
                <div className="card-body">
                    <div className="flex flex-row items-center gap-4">
                        <span className="card-title">Categorías</span>
                        <button className="btn btn-circle btn-accent tooltip" data-tip="Agregar categoría"><Plus /></button>
                    </div>
                    <Multiview endpoint="/api/categorias" columns={[
                        { title: "ID", field: "id", template: "{{id}}" },
                        { title: "Nombre", field: "nombre", template: "{{nombre}}" },
                        { title: "Habilitado", field: "habilitado", template: "{{#if habilitado}}Sí{{else}}No{{/if}}" },
                    ]} indexField="id" />
                </div>
            </div>
        </div>
    );
}