"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Custom hook to manage dashboard tab synchronization with URL slugs.
 * @param idToSlug Mapping of Tab IDs to URL path segments (slugs)
 * @param defaultId The default Tab ID to use if no slug is present or it's invalid
 */
export function useDashboardSlug<T extends string>(
    idToSlug: Record<T, string>,
    defaultId: T
) {
    const router = useRouter();
    const { section } = useParams<{ section?: string | string[] }>();
    const sectionSlug = Array.isArray(section) ? section[0] : section;
    const [activeTab, setActiveTab] = useState<T>(defaultId);

    // Memoize slugToId to prevent unnecessary recalculations
    const slugToId = useMemo(() => {
        return Object.fromEntries(
            Object.entries(idToSlug).map(([k, v]) => [(v as string).toLowerCase(), k as T])
        ) as Record<string, T>;
    }, [idToSlug]);

    // Sync activeTab with URL during render to avoid cascading updates in useEffect
    const mapped = sectionSlug ? slugToId[sectionSlug.toLowerCase()] : undefined;
    if (mapped && mapped !== activeTab) {
        setActiveTab(mapped);
    }

    useEffect(() => {
        if (sectionSlug) {
            if (!slugToId[sectionSlug.toLowerCase()]) {
                // If invalid slug, redirect to default
                router.replace(`/dashboard/${idToSlug[defaultId]}`);
            }
        } else {
            // Ensure URL shows default slug
            router.replace(`/dashboard/${idToSlug[defaultId]}`);
        }
    }, [sectionSlug, slugToId, idToSlug, defaultId, router]);

    const handleTabChange = (id: string) => {
        const slug = idToSlug[id as T] || idToSlug[defaultId];
        router.push(`/dashboard/${slug}`);
        setActiveTab(id as T);
    };

    return { activeTab, setActiveTab, handleTabChange };
}
