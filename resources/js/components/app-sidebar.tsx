import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Package,
    History,
    ShoppingCart,
    ArrowLeftRight,
    BarChart3,
    ClipboardList,
    Users,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Accounting',
        href: '/reports',
        icon: BarChart3,
    },
    {
        title: 'List Produk',
        href: '/products',
        icon: Package,
    },
    {
        title: 'Stok',
        href: '/stocks',
        icon: ArrowLeftRight,
    },
    {
        title: 'Riwayat Stok',
        href: '/stock-movements',
        icon: History,
    },
    {
        title: 'Audit Logs',
        href: '/audit-logs',
        icon: ClipboardList,
    },
    {
        title: 'Kelola Kasir',
        href: '/users/cashiers',
        icon: Users,
    },
];

const cashierNavItems: NavItem[] = [
    {
        title: 'POS Kasir',
        href: '/pos',
        icon: ShoppingCart,
    },
    {
        title: 'Riwayat Transaksi',
        href: '/sales',
        icon: History,
    },
];

export function AppSidebar() {
    const page = usePage();
    const userRole = (page.props.auth as any)?.user?.role || 'cashier';

    const filteredNavItems =
        userRole === 'admin' ? adminNavItems : cashierNavItems;

    const homeHref = userRole === 'admin' ? '/admin/dashboard' : '/pos';

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-zinc-200 dark:border-zinc-800"
        >
            <SidebarHeader className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="rounded-lg"
                        >
                            <Link
                                href={homeHref}
                                prefetch
                                className="flex items-center gap-3"
                            >
                                <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                    <ShoppingCart className="size-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold tracking-tight text-zinc-900 dark:text-white">
                                        POS Kasir
                                    </span>
                                    <span className="truncate text-xs text-zinc-400">
                                        {userRole === 'admin' ? 'Command Center' : 'Kasir'}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2">
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-100 p-3 dark:border-slate-800">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
