import { Plus, Save } from "lucide-react";
import Multiview from "../../utils/multiview";
import { useFetcher, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Categoria } from "../../../../../packages/server/types";

async function fetchTipoDocumento(id: string) {
    const response = await fetch(`/api/tipos/${id}`);
    return await response.json();
}

async function fetchCategorias() {
    let url = new URL("/api/categorias", window.location.origin);
    let totalItems = 1;
    let page = 1;
    let itemsPerPage = 100;
    let categorias: Categoria[] = [];
    while (categorias.length < totalItems) {
        url.searchParams.set("page", page.toString());
        url.searchParams.set("itemsPerPage", itemsPerPage.toString());
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Error fetching categorias: ${response.statusText}`);
        }
        const data = await response.json();
        categorias = categorias.concat(data.member);
        totalItems = data.totalItems;
        page++;
    }

    return categorias;
}

export default function TiposDocumentoIndex() {
    const { id } = useParams<{ id?: string }>();
    const fetcher = useFetcher<{ error?: string, tipoDocumento?: any, success?: boolean }>();
    const isSubmitting = fetcher.state === "submitting";
    const [tipoDocumento, setTipoDocumento] = useState<any | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    useEffect(() => {
        if (!id) {
            setTipoDocumento(null);
            return;
        }

        fetchTipoDocumento(id)
            .then(setTipoDocumento)
            .catch(error => {
                console.error(error);
            });

        fetchCategorias()
            .then(setCategorias)
            .catch(error => {
                console.error(error);
            });
    }, [id]);

    useEffect(() => {
        if (fetcher.data?.tipoDocumento) {
            setTipoDocumento(fetcher.data.tipoDocumento);
        }
    }, [fetcher.data]);


    if (id) {
        return (
            <div className="grow p-4">
                <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                        <fetcher.Form method="post" id="tipo-documento-form" >
                            <fieldset className="fieldset w-full">
                                <input type="hidden" name="id" value={tipoDocumento?.id || ""} />

                                <label className="label">Nombre</label>
                                <input type="text" name="nombre" className="input w-full" value={tipoDocumento?.nombre || ""} onChange={e => setTipoDocumento({ ...tipoDocumento, nombre: e.target.value })} />

                                <label className="label">Categoria</label>
                                <select name="categoria" value={tipoDocumento?.categoria || ""} className="select w-full" onChange={e => setTipoDocumento({ ...tipoDocumento, categoria: { ...tipoDocumento?.categoria, id: e.target.value } })}>
                                    {categorias.map(categoria => (
                                        <option key={categoria.id} value={categoria["@id"]}>{categoria.nombre}</option>
                                    ))}
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
                                <span>Tipo de documento guardado exitosamente</span>
                            </div>
                        )}
                    </div>
                    <div className="card-actions justify-end items-center p-4 border-t">
                        <button type="submit" form="tipo-documento-form" className="btn btn-primary" disabled={isSubmitting}><Save /></button>
                    </div>
                </div>
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
                    <Multiview endpoint="/api/tipos" columns={[
                        { title: "ID", field: "id", template: "{{id}}" },
                        { title: "Nombre", field: "nombre", template: "{{nombre}}" },
                        { title: "Categoria", field: "categoria.nombre", template: "{{nombre}}", async: true, joinField: "categoria" },
                    ]} indexField="id" />
                </div>
            </div>
        </div>
    );
}