"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "./dashboards/AdminDashboard";
import AuthorDashboard from "./dashboards/AuthorDashboard";
import EditorDashboard from "./dashboards/EditorDashboard";
import UserDashboard from "./dashboards/UserDashboard";

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
