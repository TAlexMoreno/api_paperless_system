import { ChevronDown, CircleUser } from "lucide-react";
import { Form } from "react-router-dom";
import type { plessProfile, plessUISettings } from "../../../../../packages/paperless/types";

export default function userDropdown({ profile, uiSettings }: { profile: plessProfile, uiSettings: plessUISettings }) {
    return (
        <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost rounded-field">{uiSettings.user.username} <ChevronDown className="w-4 h-4" /></div>
        <div tabIndex={-1} className="dropdown-content card card-lg bg-base-300 rounded-box z-1 w-md shadow-md">
            <div className="card-body flex flex-row items-center gap-4">
                <div className="avatar">
                    <CircleUser className="w-12 h-12" />
                </div>
                <div className="flex flex-col">
                    <h2 className="card-title">{profile.first_name} {profile.last_name}</h2>
                    <p className="text-sm text-base-content/70">{profile.email}</p>
                </div>
            </div>
            <div className="card-actions justify-end items-center p-4 border-t">
                <input type="checkbox" value="retro" className="toggle theme-controller" />
                <Form action="/logout" method="post">
                    <button type="submit" className="btn btn-primary btn-sm">Cerrar sesión</button>
                </Form>
            </div>
        </div>
      </div>
    );
}