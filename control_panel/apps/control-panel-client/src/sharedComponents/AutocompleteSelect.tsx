import { useEffect, useMemo, useRef, useState } from "react";
import ApiState from "../utils/api";
import { X } from "lucide-react";
import _ from "lodash";

export interface AutocompleteSelectProps {
    name: string;
    value?: string;
    label?: string;
    placeholder?: string;
    queryParamName: string;
    endPoint: string;
    required?: boolean;
    resultsResolver: (results: any) => any[];
    renderItem: (item: any) => React.ReactNode;
    valueGetter?: (item: any) => string;
    labelGetter?: (item: any) => string;
    onChange?: (value: any) => void;
}

export async function searchItems(url: URL): Promise<any> {
    const response = await ApiState.getInstance().get(url);
    return response;
}

export function AutocompleteSelect({ name, value, label, placeholder, queryParamName, endPoint, resultsResolver, renderItem, valueGetter, labelGetter, required, onChange }: AutocompleteSelectProps) {
    const uuid = crypto.randomUUID();
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLUListElement>(null);
    const listItemRefs = useRef<(HTMLLIElement | null)[]>([]);
    const [query, setQuery] = useState<string | null>("");
    const [results, setResults] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState<string | null>(value ?? null);
    const [inputLabel, setInputLabel] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const normalizeText = (text: string | null) => (text ?? "").trim().toLowerCase();
    const selectedLabel = inputLabel ?? inputValue ?? "";
    const isPopoverOpen = () => popoverRef.current?.matches(":popover-open") ?? false;

    const showPopover = () => {
        if (isPopoverOpen()) return;
        popoverRef.current?.showPopover();
    };

    const hidePopover = () => {
        if (!isPopoverOpen()) return;
        popoverRef.current?.hidePopover();
    };

    const restoreSelectedIfQueryDiffers = () => {
        if (normalizeText(query) !== normalizeText(selectedLabel)) {
            setQuery(selectedLabel || "");
        }
    };

    const selectItem = (item: any) => {
        const selectedLabel = labelGetter ? labelGetter(item) : valueGetter ? valueGetter(item) : "";
        setQuery(selectedLabel);
        setInputValue(valueGetter ? valueGetter(item) : null);
        setInputLabel(selectedLabel);
        hidePopover();
    };

    const debouncedSearch = useMemo(
        () => _.debounce(
            (url: URL, onSuccess: (results: any) => void, onError: () => void) => {
                searchItems(url)
                    .then(onSuccess)
                    .catch(onError);
            },
            500
        ),
        []
    );

    useEffect(() => {
        const url = new URL(endPoint, window.location.origin);
        url.searchParams.set(queryParamName, query!);
        setIsLoading(true);
        debouncedSearch(
            url,
            (results) => {
                setResults(resultsResolver ? resultsResolver(results) : results);
                setIsLoading(false);
            },
            () => {
                setIsLoading(false);
            }
        );

        return () => {
            debouncedSearch.cancel();
        };
    }, [query, endPoint, queryParamName, resultsResolver, debouncedSearch]);

    useEffect(() => {
        if (results.length === 0) {
            setHighlightedIndex(-1);
            return;
        }
        setHighlightedIndex((prev) => (prev >= 0 && prev < results.length ? prev : 0));
    }, [results]);

    useEffect(() => {
        if (highlightedIndex < 0) return;
        listItemRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }, [highlightedIndex]);

    useEffect(() => {
        const onPointerDownOutside = (ev: MouseEvent) => {
            const target = ev.target as Node | null;
            if (!target) return;
            if (containerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
                return;
            }
            restoreSelectedIfQueryDiffers();
            hidePopover();
        };

        document.addEventListener("mousedown", onPointerDownOutside);
        return () => {
            document.removeEventListener("mousedown", onPointerDownOutside);
        };
    }, [query, selectedLabel]);

    return (
        <>
            {label && <label className="label">{label}</label>}
            <div 
                ref={containerRef}
                className="input w-full"
                style={{ anchorName: `--anchor-${uuid}` }}
                onClick={(ev) => {
                    ev.stopPropagation();
                }}
            >   <input type="hidden" name={name} value={inputValue ?? ""} data-label={inputLabel ?? ""} />
                <input 
                    type="text" 
                    className="validator"
                    required={required}
                    placeholder={placeholder ?? "Buscar..."}
                    value={query ?? ""}
                    onChange={(ev) => setQuery(ev.target.value)}
                    onFocus={(ev) => {
                        ev.stopPropagation();
                        showPopover();
                    }}
                    onBlur={() => {
                        requestAnimationFrame(() => {
                            const active = document.activeElement as Node | null;
                            if (active && (containerRef.current?.contains(active) || popoverRef.current?.contains(active))) {
                                return;
                            }
                            restoreSelectedIfQueryDiffers();
                            hidePopover();
                        });
                    }}
                    onKeyDown={(ev) => {
                        if (ev.key === "ArrowDown") {
                            ev.preventDefault();
                            showPopover();
                            if (results.length === 0) return;
                            setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
                            return;
                        }

                        if (ev.key === "ArrowUp") {
                            ev.preventDefault();
                            showPopover();
                            if (results.length === 0) return;
                            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
                            return;
                        }

                        if (ev.key === "Enter") {
                            if (!isPopoverOpen() || highlightedIndex < 0 || highlightedIndex >= results.length) return;
                            ev.preventDefault();
                            selectItem(results[highlightedIndex]);
                            return;
                        }

                        if (ev.key === "Escape") {
                            hidePopover();
                        }
                    }}
                    onClick={(ev) => {
                        ev.stopPropagation();
                        showPopover();
                    }}
                />
                {isLoading && <button className="btn btn-circle btn-xs btn-ghost" type="button"><span className="loading loading-spinner loading-xs"></span></button>}
                <button className="btn btn-circle btn-xs btn-error" type="button" onClick={() => {
                    setQuery("");
                    setInputValue(null);
                    setInputLabel(null);
                }}><X className="size-4" /></button>
                <ul ref={popoverRef} id={`popover-${uuid}`}
                    className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm" 
                    style={{ positionAnchor: `--anchor-${uuid}`, width: "anchor-size(width)", marginTop: "0.5rem" }}
                    popover="auto"
                >
                    {!isLoading && results.length === 0 && (
                        <li className="opacity-60 px-3 py-2 pointer-events-none">Sin resultados</li>
                    )}
                    {results.map((item, index) => <li className={`cursor-pointer ${highlightedIndex === index ? "bg-base-200" : ""}`} key={index} ref={(el) => {
                        listItemRefs.current[index] = el;
                    }} onMouseEnter={() => {
                        setHighlightedIndex(index);
                    }} onMouseDown={(ev) => {
                        ev.preventDefault();
                    }} onClick={(ev) => {
                        ev.stopPropagation();
                        selectItem(item);
                        onChange && onChange(item);
                    }}>{renderItem(item)}</li>)}
                </ul>
            </div>
        </>
    )
}