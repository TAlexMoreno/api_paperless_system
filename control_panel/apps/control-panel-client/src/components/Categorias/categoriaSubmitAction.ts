import type { ActionFunctionArgs } from "react-router-dom";
import ApiState from "../../utils/api";
import type { Categoria } from "../../../../../packages/server/types";

export default async function categoriaSubmitAction({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const jsonData: Categoria = Object.fromEntries(formData.entries()) as unknown as Categoria;
    try {
        let categoria = await ApiState.getInstance().post<Categoria>(`/api/categorias/${jsonData.id}`, jsonData);
        console.log("Categoria submitted successfully:", categoria);
        return {
            categoria: categoria,
            success: true,
        }
    } catch (error) {
        console.error(error);
        return {
            error: "Error creating category",
        };
    }
}