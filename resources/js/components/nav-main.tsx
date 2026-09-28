import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="mb-2 px-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Menu Utama
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);
                    const Icon = item.icon;

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={item.title}
                                className={`h-9 rounded-lg px-3 transition-colors ${
                                    active
                                        ? 'bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white'
                                        : 'text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    className="flex w-full items-center gap-3"
                                >
                                    {Icon && (
                                        <Icon
                                            className={`size-4 shrink-0 ${
                                                active
                                                    ? 'text-[#FF9D50]'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}
                                        />
                                    )}
                                    <span className="truncate text-sm">
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
