"use client";
import { ToastProvider } from "@/components/ToastProvider";
import { NotificationProvider } from "@/context/NotificationContext";
import { ThemeProvider } from "@/context/themeContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ToastProvider>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
