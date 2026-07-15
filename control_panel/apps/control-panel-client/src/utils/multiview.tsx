import { useEffect, useRef, useState } from "react";
import Handlebars from "handlebars";
import type { CollectionResponse, Categoria } from "../../../../packages/server/types";
import { ListSortAscending, ListSortDescending } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

function getValueByPath(item: any, path: string): unknown {
    return path.split(".").reduce((current, key) => {
        if (current == null) return undefined;
        return current[key];
    }, item);
}

export interface MultiviewProps {
    endpoint: string;
    columns: MultiviewColumn[];
    itemsPerPage?: number;
    pageOptions?: number[];
    indexField: string;
    rowComponent?: React.ComponentType<{ item: any, index: number, columns: MultiviewColumn[], redirectToDetailPage: (item: any) => void }>;
    emptyMessage?: string;
}

export interface MultiviewColumn {
    title: string;
    field: string;
    sorteable?: boolean;
}

export interface SortData {
    field: string;
    direction: "asc" | "desc";
}

export default function Multiview({ endpoint, columns, itemsPerPage, pageOptions, indexField, rowComponent, emptyMessage }: MultiviewProps) {
    const [perPage, setPerPage] = useState<number>(itemsPerPage ?? 10);
    const [data, setData] = useState<CollectionResponse<Categoria> | null>(null);
    const [sortData, setSortData] = useState<SortData | null>({ field: "id", direction: "asc" });
    const [currentPage, setCurrentPage] = useState<number>(1);

    const navigation = useNavigate();
    const asyncColumnsRef = useRef<(HTMLTableCellElement | null)[]>([]);

    const lastPage = data?.totalItems ? Math.ceil(data.totalItems / perPage) : 1;


    useEffect(() => {
        const controller = new AbortController();
        let signal = controller.signal;

        async function getData() {
            try {
                let url = new URL(endpoint, window.location.origin);
                if (sortData) url.searchParams.append(`order[${sortData.field}]`, sortData.direction);
                url.searchParams.append("itemsPerPage", perPage.toString());
                url.searchParams.append("page", currentPage.toString());
                const response = await fetch(url.toString(), { signal });
                const data = await response.json();
                return data;
            } catch (error: any) {
                if (error instanceof Error && error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    console.error('Fetch error:', error);
                }
            }
        }

        getData().then(data => {
            setData(data);
        });

        return () => {
            controller.abort();
        };
    }, [endpoint, sortData, perPage, currentPage]);

    useEffect(() => {
        async function fetchAsyncColumns() {
            for (let td of asyncColumnsRef.current) {
                let uri = td?.dataset.uri;
                if (!uri || uri === "" ) continue;
                let response = await fetch(uri);
                let data = await response.json();
                if (td) td.innerHTML = Handlebars.compile(td.dataset.template || "")(data);
            }
        }

        fetchAsyncColumns();
    });

    let headerClickHandler = (column: MultiviewColumn) => {
        if (!sortData) {
            setSortData({ field: column.field, direction: "asc" });
        } else if (sortData.field === column.field && sortData.direction === "asc") {
            setSortData({ field: column.field, direction: "desc" });
        } else if (sortData.field === column.field && sortData.direction === "desc") {
            setSortData(null);
        } else {
            setSortData({ field: column.field, direction: "asc" });
        }
    }

    let redirectToDetailPage = (item: any) => {
        const id = item[indexField];
        navigation(window.location.pathname + "/" + id);
    }

    return (
        <div className="overflow-x-auto">
            <table className="table table-zebra w-full flex flex-col">
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} onClick={() => headerClickHandler(column)}>
                                <div className="flex flex-row items-center gap-2">
                                    {column.title}
                                    {sortData?.field === column.field && (
                                            sortData.direction === "asc" ? (<ListSortAscending className="size-4" />) : <ListSortDescending className="size-4" />
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="grow">
                        {data?.member?.length ?? 0 > 0 ? data?.member.map((item:any, index:number) => (
                            rowComponent ? (
                                React.createElement(rowComponent, { key: index, item, index, columns, redirectToDetailPage })
                            ) : (
                                <tr key={index} className="hover cursor-pointer" onClick={() => redirectToDetailPage(item)}>
                                    <td colSpan={columns.length}>No se ha definido un elemento para renderizar</td>
                                </tr>
                            )
                        )) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center">{emptyMessage ?? "No hay datos disponibles"}</td>
                            </tr>
                        )}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={columns.length}>
                            <div className="flex flex-row items-center gap-2 justify-end">
                                <select className="select select-sm w-20" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                                    {(pageOptions ?? [10, 25, 50, 100]).map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <span>de {data?.totalItems}</span>
                                <div className="grow"></div>
                                <div className="join">
                                    <button className="join-item btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>«</button>
                                    <span className="join-item btn">{currentPage}</span>
                                    <button className="join-item btn" disabled={currentPage === lastPage} onClick={() => setCurrentPage(currentPage + 1)}>»</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}