import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="flex flex-col min-w-0 flex-1 overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <main className="w-full flex-1 px-4 py-4 md:px-5 md:py-5">
                    {children}
                </main>
            </AppContent>
        </AppShell>
    );
}
