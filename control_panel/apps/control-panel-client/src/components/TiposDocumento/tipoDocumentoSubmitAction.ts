import ApiState from "../../utils/api";

export async function tipoDocumentoSubmitAction({ request }: { request: Request }) {
    const formData = await request.formData();
    const jsonData: any = Object.fromEntries(formData.entries());
    try {
        let tipoDocumento = await ApiState.getInstance().post<any>(`/api/tipos/${jsonData.id}`, jsonData);
        console.log("Tipo de documento submitted successfully:", tipoDocumento);
        return {
            tipoDocumento: tipoDocumento,
            success: true,
        }
    } catch (error) {
        console.error(error);
        return {
            error: "Error creating document type",
        };
    }
}