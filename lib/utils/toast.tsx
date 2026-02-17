"use client";

import { createToaster, Toast, Toaster } from "@ark-ui/react/toast";
import { X, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";

export const toaster = createToaster({
    placement: "top-end",
    overlap: true,
    duration: 4000,
});

export const showToast = {
    success: (title: string, description?: string) =>
        toaster.create({
            title,
            description,
            type: "success",
            // @ts-ignore
            meta: { icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
        }),
    error: (title: string, description?: string) =>
        toaster.create({
            title,
            description,
            type: "error",
            // @ts-ignore
            meta: { icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
        }),
    info: (title: string, description?: string) =>
        toaster.create({
            title,
            description,
            type: "info",
            // @ts-ignore
            meta: { icon: <Info className="h-4 w-4 text-blue-500" /> },
        }),
    agent: (title: string, description?: string) =>
        toaster.create({
            title,
            description,
            // @ts-ignore
            meta: { icon: <Sparkles className="h-4 w-4 text-purple-500" /> },
        }),
};

export function GlobalToaster() {
    return (
        <Toaster toaster={toaster}>
            {(toast) => (
                <Toast.Root
                    key={toast.id}
                    className="group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border border-stroke bg-white p-4 pr-8 shadow-2xl transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
                    style={{ minWidth: '400px', maxWidth: '500px' }}
                >
                    <div className="flex gap-3 flex-1">
                        {/* @ts-ignore */}
                        {toast.meta?.icon && <div className="mt-0.5 flex-shrink-0">{toast.meta.icon}</div>}
                        <div className="grid gap-1 flex-1 min-w-0">
                            <Toast.Title className="text-sm font-bold leading-none tracking-tight break-words">
                                {toast.title}
                            </Toast.Title>
                            {toast.description && (
                                <Toast.Description className="text-xs text-muted-foreground break-words">
                                    {toast.description}
                                </Toast.Description>
                            )}
                        </div>
                    </div>
                    <Toast.CloseTrigger className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:text-muted-foreground group-hover:opacity-100 flex-shrink-0">
                        <X className="h-4 w-4" />
                    </Toast.CloseTrigger>
                </Toast.Root>
            )}
        </Toaster>
    );
}
