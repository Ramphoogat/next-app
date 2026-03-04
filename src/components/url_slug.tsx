"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Custom hook to manage dashboard tab + sub-state synchronization with URL slugs.
 *
 * URL structure: /dashboard/{tab-slug}/{sub-slug?}
 *   e.g. /dashboard/overview
 *        /dashboard/overview/search
 *        /dashboard/management/search
 *
 * @param idToSlug  Mapping of Tab IDs → URL path segments (slugs). All slugs MUST be lowercase.
 * @param defaultId The default Tab ID when no slug is present or slug is invalid.
 */
export function useDashboardSlug<T extends string>(
    idToSlug: Record<T, string>,
    defaultId: T
) {
    const router = useRouter();
    const params = useParams<{ section?: string | string[] }>();

    // Parse the catch-all `[[...section]]` segments
    const segments = Array.isArray(params.section)
        ? params.section
        : params.section
            ? [params.section]
            : [];

    const tabSlug = segments[0]?.toLowerCase() ?? "";
    const subSlug = segments[1]?.toLowerCase() ?? "";

    // Build slug → id reverse map
    const slugToId = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(idToSlug).map(([k, v]) => [
                    (v as string).toLowerCase(),
                    k as T,
                ])
            ) as Record<string, T>,
        [idToSlug]
    );

    // Resolve active tab from URL
    const resolvedTab: T = tabSlug && slugToId[tabSlug] ? slugToId[tabSlug] : defaultId;
    const [activeTab, setActiveTab] = useState<T>(resolvedTab);
    const [activeSubSlug, setActiveSubSlug] = useState<string>(subSlug);

    // Sync state when URL changes (e.g. browser back/forward)
    if (resolvedTab !== activeTab) {
        setActiveTab(resolvedTab);
    }
    if (subSlug !== activeSubSlug) {
        setActiveSubSlug(subSlug);
    }

    // On mount / invalid slug: redirect to valid URL
    useEffect(() => {
        const primarySlug = idToSlug[defaultId];
        if (!tabSlug) {
            // No slug at all → go to default tab
            router.replace(`/dashboard/${primarySlug}`);
        } else if (!slugToId[tabSlug]) {
            // Unknown tab slug → redirect to default
            router.replace(`/dashboard/${primarySlug}`);
        }
        // sub-slug is user-controlled state; we don't validate or redirect it
    }, [tabSlug, slugToId, idToSlug, defaultId, router]);

    /**
     * Navigate to a different primary tab.
     * Clears any active sub-slug.
     */
    const handleTabChange = useCallback(
        (id: string) => {
            const slug = idToSlug[id as T] ?? idToSlug[defaultId];
            router.push(`/dashboard/${slug}`);
            setActiveTab(id as T);
            setActiveSubSlug("");
        },
        [idToSlug, defaultId, router]
    );

    /**
     * Set a sub-slug under the current tab.
     * e.g. openSubSlug("search") → /dashboard/overview/search
     *      openSubSlug("")       → /dashboard/overview
     */
    const setSubSlug = useCallback(
        (sub: string) => {
            const currentTabSlug = idToSlug[activeTab] ?? idToSlug[defaultId];
            if (sub) {
                router.push(`/dashboard/${currentTabSlug}/${sub}`);
            } else {
                router.push(`/dashboard/${currentTabSlug}`);
            }
            setActiveSubSlug(sub);
        },
        [activeTab, idToSlug, defaultId, router]
    );

    /**
     * Close/clear the current sub-slug (goes back to bare tab URL).
     */
    const clearSubSlug = useCallback(() => {
        setSubSlug("");
    }, [setSubSlug]);

    return {
        /** The currently active primary tab ID */
        activeTab,
        /** The currently active sub-slug string (empty string if none) */
        activeSubSlug,
        /** Change the primary tab (and clear sub-slug) */
        handleTabChange,
        /** Programmatically set the active tab ID without navigation side-effects */
        setActiveTab,
        /** Push a sub-slug under the current tab URL */
        setSubSlug,
        /** Clear the sub-slug, returning to the bare tab URL */
        clearSubSlug,
    };
}
