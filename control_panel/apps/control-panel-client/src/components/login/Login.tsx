import { CircleSlash, KeyRound, LogIn, User } from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router-dom";

export default function Login() {
    const navigation = useNavigation();
    const actionData = useActionData() as { error?: string } | undefined;

    const isSubmitting = navigation.state === "submitting";
    const hide = !actionData?.error ? "hidden" : "";

    return (
        <div className="flex flex-col items-center justify-center grow">
            <div className={`shadow-lg w-full max-w-lg ${isSubmitting ? "aura aura-dual" : ""}`}>
                <div className="card bg-base-200">
                    <div className="card-actions px-6 py-4 border-b">
                        <h2 className="card-title">Inicio de sesión</h2>
                    </div>
                    <div className="card-body">
                        <Form id="login-form" method="post" className="flex flex-col gap-2">
                            <label className="input w-full">
                                <User />
                                <input type="text" name="username" className="grow" />
                                <span className="badge badge-neutral badge-xs">Paperless</span>
                            </label>
                            <label className="input w-full">
                                <KeyRound />
                                <input type="password" name="password" className="grow" />
                                <span className="badge badge-neutral badge-xs">Paperless</span>
                            </label>
                        </Form>
                    </div>
                    <div className="card-actions justify-end items-center px-6 py-4 border-t">
                        <div className={`alert alert-error alert-outline grow p-2 py-1 ${hide}`}>
                            <CircleSlash />
                            <span>{actionData?.error ?? "Error placeholder"}</span>
                        </div>
                        <button className="btn btn-sm btn-primary" type="submit" form="login-form" disabled={isSubmitting}><LogIn /></button>
                    </div>
                </div>
            </div>
            
        </div>
    )
}