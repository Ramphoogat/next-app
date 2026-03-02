"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import AuthorDashboard from "@/components/dashboards/AuthorDashboard";
import EditorDashboard from "@/components/dashboards/EditorDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";

const UnifiedDashboard = () => {
    const router = useRouter();

    const hasHydrated = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    const role = hasHydrated ? (localStorage.getItem("role") || sessionStorage.getItem("role")) : null;

    useEffect(() => {
        if (hasHydrated && !role) {
            router.replace("/login");
        }
    }, [hasHydrated, role, router]);

    if (!hasHydrated || !role) return null;

    switch (role) {
        case "admin":
            return <AdminDashboard />;
        case "author":
            return <AuthorDashboard />;
        case "editor":
            return <EditorDashboard />;
        case "user":
            return <UserDashboard />;
        default:
            return null;
    }
};

export default UnifiedDashboard;
