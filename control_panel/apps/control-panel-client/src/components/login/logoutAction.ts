import { redirect } from "react-router-dom";
import ApiState from "../../utils/api";

export default async function logoutAction() {
    try {
        await fetch("/api/logout", {
            method: "POST",
            credentials: "include"
        });
        ApiState.getInstance().status = "unauthenticated";
        return redirect("/login");
    } catch (error) {
        console.error(error);
        return redirect("/login");
    }
}