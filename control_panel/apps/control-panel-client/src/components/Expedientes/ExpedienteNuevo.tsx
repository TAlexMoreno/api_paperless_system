import { BookText, CircleCheck } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ApiState from "../../utils/api";
import type { Categoria, Expediente, TipoDocumento } from "../../../../../packages/server/types";
import { AutocompleteSelect } from "../../sharedComponents/AutocompleteSelect";
import IMaskInput from "react-imask/esm/input";
import { IMask } from "react-imask";

async function getCategoriasAndTiposDocumento(): Promise<{ categorias: Categoria[], tipos: TipoDocumento[] }> {
    let api = ApiState.getInstance();
    return { 
        categorias: await api.getAll<Categoria>(new URL(ApiState.categoriasEndpoint, window.location.origin)),
        tipos: await api.getAll<TipoDocumento>(new URL(ApiState.tiposDocumentoEndpoint, window.location.origin))
    };
}

export default function ExpedienteNuevo() {
    const [searchParams] = useSearchParams();
    const clave = searchParams.get("clave");
    const [step, setStep] = useState<number>(0);
    const [expediente, setExpediente] = useState<Expediente>({
        "@id": "",
        id: 0,
        clave: clave ?? "",
        descripcion: "",
        tiposDocumento: [],
        correspondentId: 0,
        monto: 0,
        createdAt: "",
        updatedAt: "",
        createdBy: "",
    });
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
            <div className="card shadow-md bg-base-200 border-3 border-base-300">
                <div className="card-body">
                    <ul className="steps">
                        <li className={`step ${step === 0 ? "step-primary" : "step-secondary"}`}>Datos generales</li>
                        <li className={`step ${step < 1 ? "" : step === 1 ? "step-primary" : "step-secondary"}`}>Documentación</li>
                        <li className={`step ${step < 2 ? "" : step === 2 ? "step-primary" : "step-secondary"}`}>Revisión</li>
                        <li className={`step ${step < 3 ? "" : step === 3 ? "step-primary" : "step-secondary"}`}>Confirmación</li>
                    </ul>
                </div>
            </div>
            <div className="card shadow-lg bg-base-300">
                <div className="card-body flex flex-row items-center gap-4 border-b pb-4 mb-4">
                    <BookText className="text-primary" />
                    <span className="card-title text-primary">Nuevo expediente</span>
                </div>
                <div className="card-body">
                    <form id="expediente-step-0" onSubmit={onSubmitForm} className={`${step === 0 ? "" : "hidden"}`}>
                        <fieldset className="fieldset w-full">
                            <label className="label">Número de expediente</label>
                            <input required type="text" name="clave" className="input validator w-full" value={expediente.clave} onChange={e => setExpediente({ ...expediente, clave: e.target.value })} />

                            <AutocompleteSelect
                                name="correspondentId"
                                label="Empresa o interlocutor"
                                placeholder="Teclea el nombre de la empresa para buscar en el catálogo"
                                queryParamName="name__icontains"
                                endPoint="/api/paperless/correspondents/"
                                resultsResolver={(results: any) => results.results ?? []}
                                renderItem={(item: any) => <div>{item.name}</div>}
                                valueGetter={(item: any) => item.id}
                                labelGetter={(item: any) => item.name}
                                onChange={(value: any) => setExpediente({ ...expediente, correspondentId: value.id, correspondentData: value })}
                                required={true}
                            />

                            <label className="label">Monto total del expediente</label>
                            <div className="input w-full">
                                <span>$</span>
                                <IMaskInput 
                                    className="validator" 
                                    mask={IMask.MaskedNumber} 
                                    radix="." 
                                    scale={2} 
                                    thousandsSeparator=","
                                    onAccept={(value: any, mask: any) => {
                                        setExpediente({ ...expediente, monto: mask.unmaskedValue })
                                    }}
                                />
                                <span>MXN</span>
                            </div>

                            <label className="label">Descripción del expediente</label>
                            <textarea required name="descripcion" maxLength={240} className="textarea validator w-full" value={expediente.descripcion} onChange={e => setExpediente({ ...expediente, descripcion: e.target.value.slice(0, 240) })}></textarea>
                            <div className="label justify-end">{expediente.descripcion?.length ?? 0}/240</div>

                        </fieldset>
                    </form>

                    <form id="expediente-step-1" onSubmit={onSubmitForm} className={`${step === 1 ? "" : "hidden"}`}>
                        <p className="text-xl font-semibold">Check list de expediente unitario</p>
                        <p className="text-sm">Seleccione los tipos de documento que aplican para este expediente. El progreso del expediente se mostrara basado en los documentos seleccionados.</p>

                        <table className="table w-full table-zebra mt-4 border">
                            <tbody>
                            {categorias.length > 0 ? categorias.map(categoria => (
                                <Fragment key={categoria.id}>
                                    <tr className="bg-primary text-primary-content" key={categoria.id}>
                                        <th className="text-center">{categoria.nombre}</th>
                                        <th className="text-center">
                                            <button tabIndex={0} className="btn btn-xs btn-secondary" type="button" onClick={() => {
                                                const tiposEnCategoria = tiposDocumento.filter(tipo => tipo.categoria === categoria["@id"]).map(tipo => tipo.id);
                                                const tiposSeleccionadosEnCategoria = expediente.tiposDocumento?.filter((tipo) => tiposEnCategoria.includes(tipo.id)) ?? [];
                                                if (tiposSeleccionadosEnCategoria.length === tiposEnCategoria.length) {
                                                    // Deselect all
                                                    setExpediente({ ...expediente, tiposDocumento: (expediente.tiposDocumento ?? []).filter((tipo) => !tiposEnCategoria.includes(tipo.id)) });
                                                } else {
                                                    // Select all
                                                    setExpediente({ ...expediente, tiposDocumento: [...new Set([...(expediente.tiposDocumento ?? []).map(tipo => tipo.id), ...tiposEnCategoria])].map(id => ({ "@id": "", id, nombre: "", categoria: "" })) });
                                                }
                                            }}><CircleCheck className="size-4" />{expediente.tiposDocumento?.filter((tipo) => tiposDocumento.find(t => t.id === tipo.id)?.categoria === categoria["@id"]).length ?? 0}</button>
                                        </th>
                                    </tr>
                                    {tiposDocumento.filter(tipo => tipo.categoria === categoria["@id"]).map(tipo => (
                                        <tr key={tipo.id} className={`${expediente.tiposDocumento?.some(t => t.id === tipo.id) ? "bg-secondary/60 text-secondary-content" : ""} cursor-pointer group hover:bg-accent/60`} onClick={() => {
                                            const isSelected = expediente.tiposDocumento?.some(t => t.id === tipo.id);
                                            if (isSelected) {
                                                setExpediente({ ...expediente, tiposDocumento: (expediente.tiposDocumento ?? []).filter((t) => t.id !== tipo.id) });
                                            } else {
                                                setExpediente({ ...expediente, tiposDocumento: [...(expediente.tiposDocumento ?? []), tipo] });
                                            }
                                        }}>
                                            <td>{tipo.nombre}</td>
                                            <td className="text-center">
                                                <input type="checkbox" name={`tipo_${tipo.id}`} checked={Boolean(expediente.tiposDocumento?.some(t => t.id === tipo.id))} onChange={e => {
                                                    if (e.target.checked) {
                                                        setExpediente({ ...expediente, tiposDocumento: [...(expediente.tiposDocumento ?? []), tipo] });
                                                    } else {
                                                        setExpediente({ ...expediente, tiposDocumento: (expediente.tiposDocumento ?? []).filter((t) => t.id !== tipo.id) });
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

                    <form id="expediente-step-2" onSubmit={onSubmitForm} className={`${step === 2 ? "" : "hidden"}`}>
                        <p className="text-xl font-semibold">Revisión de datos del expediente</p>
                        <p className="text-sm">Revise los datos del expediente antes de continuar. Si necesita hacer cambios, puede regresar a los pasos anteriores.</p>

                        <p className="text-lg mt-4">{expediente.clave}</p>
                        <p className="text-sm">{expediente.descripcion}</p>
                        <p className="mt-2"><span className="font-bold">Empresa: </span>{expediente.correspondentData?.name}</p>
                        <p className="mt-2"><span className="font-bold">Monto total:</span> {Number(expediente.monto).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-lg font-bold mt-4">Documentos solicitados</p>
                        <table className="table table-zebra border">
                            <thead>
                                <tr>
                                    <th>Categoria/Etapa</th>
                                    <th>Tipo de documento</th>
                                    <th>Comentarios</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expediente.tiposDocumento?.map(tipo => {
                                    const categoria = categorias.find(c => c["@id"] === tipo.categoria);
                                    return (
                                        <tr key={tipo.id}>
                                            <td>{categoria?.nombre}</td>
                                            <td>{tipo.nombre}</td>
                                            <td className="w-1/2">
                                                <textarea className="textarea textarea-bordered w-full min-h-10"></textarea>
                                            </td>
                                        </tr>
                                    )
                                })}
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