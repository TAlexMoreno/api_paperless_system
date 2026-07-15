import { BookText, CircleCheck } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ApiState from "../../utils/api";
import type { Categoria, CollectionResponse, TipoDocumento } from "../../../../../packages/server/types";

async function getCategoriasAndTiposDocumento(): Promise<{ categorias: Categoria[], tipos: TipoDocumento[] }> {
    let categorias: Categoria[] = [];
    let total = 1
    let page = 1;
    while (categorias.length < total) {
        let url = new URL(ApiState.categoriasEndpoint, window.location.origin);
        url.searchParams.append("itemsPerPage", "100");
        url.searchParams.append("page", page.toString());
        url.searchParams.append("order[id]", "asc");
        const response = ApiState.getInstance().get<CollectionResponse<Categoria>>(url);
        const data: CollectionResponse<Categoria> = await response;
        categorias.push(...data.member);
        total = data.totalItems;
        page++;// Return early to avoid infinite loop
    }

    let tipos = [];
    total = 1;
    page = 1;
    while (tipos.length < total) {
        let url = new URL(ApiState.tiposDocumentoEndpoint, window.location.origin);
        url.searchParams.append("itemsPerPage", "100");
        url.searchParams.append("page", page.toString());
        const response = ApiState.getInstance().get<CollectionResponse<TipoDocumento>>(url);
        const data: CollectionResponse<TipoDocumento> = await response;
        tipos.push(...data.member);
        total = data.totalItems;
        page++;
    }

    return { categorias, tipos };
}

export default function ExpedienteNuevo() {
    const [searchParams] = useSearchParams();
    const clave = searchParams.get("clave");
    const [step, setStep] = useState<number>(0);
    const [expediente, setExpediente] = useState<any>({ clave: clave ?? "", descripcion: "", tipos: [] });
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);

    const onSubmitForm = (e: any) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
        } else {
            // Submit the expediente data to the server
            console.log("Submitting expediente:", expediente);
            // You can add your API call here to submit the expediente
        }
    }

    useEffect(() => {
        getCategoriasAndTiposDocumento().then(({ categorias, tipos }) => {
            setCategorias(categorias);
            setTiposDocumento(tipos);
        }).catch(error => {
            console.error("Error fetching categorias and tipos de documento:", error);
        });
    }, []);

    return (
        <div className="flex flex-col gap-4 grow p-4">
            <div className="card shadow-lg bg-base-300">
                <div className="card-body">
                    <ul className="steps">
                        <li className={`step ${step === 0 ? "step-primary" : ""}`}>Datos generales</li>
                        <li className={`step ${step === 1 ? "step-primary" : ""}`}>Documentación</li>
                        <li className={`step ${step === 2 ? "step-primary" : ""}`}>Revisión</li>
                        <li className={`step ${step === 3 ? "step-primary" : ""}`}>Confirmación</li>
                    </ul>
                </div>
            </div>
            <div className="card shadow-lg bg-base-300">
                <div className="card-body">
                    <div className="flex flex-row items-center gap-4">
                        <BookText className="text-primary" />
                        <span className="card-title text-primary">Nuevo expediente</span>
                    </div>

                    <form id="expediente-step-0" onSubmit={onSubmitForm} className={`${step === 0 ? "" : "hidden"}`}>
                        <fieldset className="fieldset w-full">
                            <label className="label">Número de expediente</label>
                            <input required type="text" name="clave" className="input validator w-full" value={expediente.clave} onChange={e => setExpediente({ ...expediente, clave: e.target.value })} />
                        
                            <label className="label">Descripción del expediente</label>
                            <textarea required name="descripcion" maxLength={240} className="textarea validator w-full" value={expediente.descripcion} onChange={e => setExpediente({ ...expediente, descripcion: e.target.value.slice(0, 240) })}></textarea>
                            <div className="label justify-end">{expediente.descripcion?.length ?? 0}/240</div>
                        </fieldset>
                    </form>

                    <form id="expediente-step-1" onSubmit={onSubmitForm} className={`${step === 1 ? "" : "hidden"}`}>
                        <p className="text-xl font-semibold">Check list de expediente unitario</p>
                        <p className="text-sm">Seleccione los tipos de documento que aplican para este expediente. El progreso del expediente se mostrara basado en los documentos seleccionados.</p>

                        <table className="table w-full table-zebra mt-4">
                            <tbody>
                            {categorias.length > 0 ? categorias.map(categoria => (
                                <Fragment key={categoria.id}>
                                    <tr className="bg-primary text-primary-content" key={categoria.id}>
                                        <th className="text-center">{categoria.nombre}</th>
                                        <th className="text-center">
                                            <button className="btn btn-xs btn-secondary" type="button" onClick={() => {
                                                const tiposEnCategoria = tiposDocumento.filter(tipo => tipo.categoria === categoria["@id"]).map(tipo => tipo.id);
                                                const tiposSeleccionadosEnCategoria = expediente.tipos?.filter((id: number) => tiposEnCategoria.includes(id)) ?? [];
                                                if (tiposSeleccionadosEnCategoria.length === tiposEnCategoria.length) {
                                                    // Deselect all
                                                    setExpediente({ ...expediente, tipos: (expediente.tipos ?? []).filter((id: number) => !tiposEnCategoria.includes(id)) });
                                                } else {
                                                    // Select all
                                                    setExpediente({ ...expediente, tipos: [...new Set([...(expediente.tipos ?? []), ...tiposEnCategoria])] });
                                                }
                                            }}><CircleCheck className="size-4" />{expediente.tipos?.filter((id: number) => tiposDocumento.find(tipo => tipo.id === id)?.categoria === categoria["@id"]).length ?? 0}</button>
                                        </th>
                                    </tr>
                                    {tiposDocumento.filter(tipo => tipo.categoria === categoria["@id"]).map(tipo => (
                                        <tr key={tipo.id} className={`${expediente.tipos?.includes(tipo.id) ? "bg-secondary/60 text-secondary-content" : ""} cursor-pointer group hover:bg-accent/60`} onClick={() => {
                                            const isSelected = expediente.tipos?.includes(tipo.id);
                                            if (isSelected) {
                                                setExpediente({ ...expediente, tipos: (expediente.tipos ?? []).filter((id: number) => id !== tipo.id) });
                                            } else {
                                                setExpediente({ ...expediente, tipos: [...(expediente.tipos ?? []), tipo.id] });
                                            }
                                        }}>
                                            <td>{tipo.nombre}</td>
                                            <td className="text-center">
                                                <input type="checkbox" name={`tipo_${tipo.id}`} checked={Boolean(expediente.tipos?.includes(tipo.id))} onChange={e => {
                                                    if (e.target.checked) {
                                                        setExpediente({ ...expediente, tipos: [...(expediente.tipos ?? []), tipo.id] });
                                                    } else {
                                                        setExpediente({ ...expediente, tipos: (expediente.tipos ?? []).filter((id: number) => id !== tipo.id) });
                                                    }
                                                }} className="checkbox"/>
                                            </td>
                                        </tr>
                                    ))}
                                </Fragment>
                            )) : (
                                <tr><th colSpan={2} className="text-center">No hay categorías disponibles</th></tr>
                            )}
                            </tbody>
                        </table>
                    </form>

                </div>
                <div className="card-actions justify-end items-center p-4 border-t">
                    {step > 0 && (
                        <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Anterior</button>
                    )}
                    <button className="btn btn-primary" form={`expediente-step-${step}`}>Siguiente</button>
                </div>
            </div>

        </div>
    )
}