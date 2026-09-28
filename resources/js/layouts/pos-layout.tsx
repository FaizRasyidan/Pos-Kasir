import { Link, usePage } from '@inertiajs/react';
import { History, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { index as salesIndex } from '@/routes/sales';
import { dashboard } from '@/routes';
import { UserMenuContent } from '@/components/user-menu-content';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

function useClock() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 10_000);
        return () => window.clearInterval(id);
    }, []);
    return now;
}

/**
 * Fullscreen POS shell — no sidebar by design.
 * Tablet-first: fixed 56px top bar, app-height content (100dvh),
 * safe-area aware, its own scroll containers.
 */
export default function PosLayout({ children }: { children: React.ReactNode }) {
    const page = usePage();
    const user = (page.props.auth as any)?.user ?? {};
    const storeSettings = (page.props as any)?.storeSettings ?? {};
    const storeName = storeSettings.store_name || 'POS Kasir';
    const now = useClock();
    const getInitials = useInitials();

    return (
        <div className="flex h-dvh flex-col bg-zinc-100 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
            <header
                className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-3 sm:px-4 dark:border-zinc-800 dark:bg-zinc-900"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                        <ShoppingCart className="size-4.5" strokeWidth={2.25} />
                    </span>
                    <span className="min-w-0 leading-tight">
                        <span className="block truncate text-[15px] font-semibold tracking-tight">
                            {storeName}
                        </span>
                        <span className="block text-[11px] font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                            Point of Sale
                        </span>
                    </span>
                </div>

                <p className="hidden items-baseline gap-2 tabular-nums md:flex">
                    <span className="text-sm font-semibold tracking-tight">
                        {now.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {now.toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                        })}
                    </span>
                </p>

                <div className="flex shrink-0 items-center gap-1.5">
                    {user?.role === 'admin' ? (
                        <Link
                            href={dashboard()}
                            className="pressable hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-zinc-600 sm:inline-flex dark:text-zinc-300"
                        >
                            Dashboard
                        </Link>
                    ) : null}
                    <Link
                        href={salesIndex()}
                        className="pressable inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-2 text-[13px] font-medium text-zinc-700 sm:px-3 dark:border-zinc-700 dark:text-zinc-200"
                    >
                        <History className="size-4" />
                        <span className="hidden sm:inline">Riwayat</span>
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="pressable rounded-full"
                            aria-label="Menu pengguna"
                        >
                            <Avatar className="size-9">
                                <AvatarFallback className="bg-zinc-900 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
                                    {getInitials(user?.name || 'K')}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <UserMenuContent user={user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main
                className="min-h-0 flex-1"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                {children}
            </main>
        </div>
    );
}
