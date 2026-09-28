import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF9D8]/60 via-white to-[#FFF9D8]/30 p-6 md:p-10 font-sans">
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#FF9D50]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#1DCED8]/15 blur-3xl" />

            <div className="relative z-10 flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex items-center justify-center gap-1 self-center text-2xl font-black tracking-tight text-slate-900 transition hover:opacity-90"
                >
                    <span>POS</span>
                    <span className="text-[#FF9D50]">KASIR</span>
                </Link>

                <Card className="rounded-2xl border border-[#FF9D50]/20 bg-white/95 shadow-xl shadow-slate-200/50 backdrop-blur-sm dark:bg-slate-900/90 dark:border-slate-800">
                    <CardHeader className="px-8 pt-8 pb-2 text-center">
                        <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                {description}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="px-8 py-6">
                        {children}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
