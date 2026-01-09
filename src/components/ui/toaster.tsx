"use client"

import { Toaster as SonnerToaster, toast } from "sonner"

export const toaster = {
    create: ({
        title,
        description,
        type = "info"
    }: {
        title: string;
        description?: string;
        type?: "success" | "error" | "info" | "warning" | "loading"
    }) => {
        const options = {
            description,
        }

        switch (type) {
            case "success":
                return toast.success(title, options)
            case "error":
                return toast.error(title, options)
            case "warning":
                return toast.warning(title, options)
            case "loading":
                return toast.loading(title, options)
            default:
                return toast(title, options)
        }
    },
    dismiss: (toastId?: string | number) => toast.dismiss(toastId)
}

export function Toaster() {
    return (
        <SonnerToaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
                classNames: {
                    toast: "bg-white shadow-lg rounded-lg border border-gray-100",
                    title: "font-semibold text-gray-900",
                    description: "text-gray-500 text-sm",
                }
            }}
        />
    )
}
