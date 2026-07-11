import { redirect, type ActionFunctionArgs } from "react-router-dom";
import ApiState from "../../utils/api";

export default async function loginAction({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const jsonData = Object.fromEntries(formData.entries()) as { username: string; password: string };
    try {
        await ApiState.getInstance().login(jsonData);
        ApiState.getInstance().status = "authenticated";
        return redirect("/");
    } catch (error) {
        console.error(error);
        return {
            error: "Invalid username or password"
        };
    }
}