import { useEffect } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

function SidebarShortcut() {
    const { toggleSidebar } = useSidebar();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleSidebar();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [toggleSidebar]);

    return null;
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-14 shrink-0 items-center gap-1 border-b border-zinc-200 px-3 transition-[width,height] ease-linear md:px-4 dark:border-zinc-800">
            <SidebarShortcut />
            <SidebarTrigger className="pressable" />
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <kbd className="ml-auto hidden rounded-md border border-zinc-200 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-400 lg:block dark:border-zinc-700">
                Ctrl B
            </kbd>
        </header>
    );
}
