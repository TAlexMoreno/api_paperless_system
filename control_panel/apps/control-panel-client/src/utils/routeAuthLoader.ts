import { redirect } from "react-router-dom";
import ApiState from "./api";
import type { plessProfile, plessUISettings } from "../../../../packages/paperless/types";

export interface RouteAuthLoaderData {
    loggedInUser: plessProfile;
    uiSettings: plessUISettings;
}

export default async function routeAuthLoader(): Promise<RouteAuthLoaderData | Response> {
    try {
        let loggedInUser: plessProfile = await ApiState.getInstance().get(new URL(ApiState.profileEndpoint, window.location.origin));
        let uiSettings: plessUISettings = await ApiState.getInstance().get(new URL(ApiState.uiSettingsEndpoint, window.location.origin));
        return { loggedInUser, uiSettings };
    } catch (error) {
        return redirect("/login");
    }
}