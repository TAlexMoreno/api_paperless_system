export interface CollectionResponse<T> {
    "@id": string,
    "totalItems": number,
    "member": T[]
}

export interface Categoria {
    "@id": string,
    id: number,
    nombre: string,
    habilitado: boolean
}