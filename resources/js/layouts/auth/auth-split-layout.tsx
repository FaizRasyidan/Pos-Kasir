import type { AuthLayoutProps } from '@/types';
import {
    BarChart3,
    CheckCircle2,
    CreditCard,
    Receipt,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Store,
    TrendingUp,
    Zap,
} from 'lucide-react';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh w-full lg:grid-cols-2">
            {/* Left Decorative Side Banner */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 text-white lg:flex xl:p-14">
                {/* Background ambient lighting blobs */}
                <div
                    className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, #FF9D50 0%, transparent 70%)',
                    }}
                />
                <div
                    className="pointer-events-none absolute top-1/2 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, #1DCED8 0%, transparent 70%)',
                    }}
                />
                <div
                    className="pointer-events-none absolute -bottom-20 left-1/3 h-80 w-80 rounded-full opacity-20 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, #55E07E 0%, transparent 70%)',
                    }}
                />

                {/* Top Badge (No Logo) */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium backdrop-blur-md">
                        <Sparkles className="size-3.5 text-[#FF9D50]" />
                        <span className="bg-gradient-to-r from-[#FF9D50] via-[#FFF9D8] to-[#1DCED8] bg-clip-text font-semibold text-transparent">
                            POS Kasir Smart System
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <ShieldCheck className="size-4 text-[#55E07E]" />
                        <span>Sistem Keamanan Terjamin</span>
                    </div>
                </div>

                {/* Center POS Visual Illustration / Mockup Card */}
                <div className="relative z-10 my-auto flex flex-col items-center py-8">
                    <div className="relative w-full max-w-md">
                        {/* Glassmorphism Dashboard Preview Card */}
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#FF9D50]/20 text-[#FF9D50]">
                                        <Store className="size-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-white">
                                            Ringkasan Kasir Hari Ini
                                        </h4>
                                        <p className="text-xs text-slate-300">
                                            Pantau transaksi real-time
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#55E07E]/20 px-2.5 py-1 text-xs font-medium text-[#55E07E]">
                                    <span className="size-1.5 animate-pulse rounded-full bg-[#55E07E]" />
                                    Sistem Aktif
                                </span>
                            </div>

                            {/* Stat Cards */}
                            <div className="my-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
                                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                                        <span>Penjualan Hari Ini</span>
                                        <TrendingUp className="size-3.5 text-[#55E07E]" />
                                    </div>
                                    <div className="text-lg font-bold text-white">
                                        Rp 2.850.000
                                    </div>
                                    <div className="mt-1 text-[10px] font-medium text-[#55E07E]">
                                        +18.5% peningkatan
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
                                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                                        <span>Total Transaksi</span>
                                        <Receipt className="size-3.5 text-[#1DCED8]" />
                                    </div>
                                    <div className="text-lg font-bold text-white">
                                        142 Struk
                                    </div>
                                    <div className="mt-1 text-[10px] font-medium text-[#1DCED8]">
                                        Proses kilat
                                    </div>
                                </div>
                            </div>

                            {/* Feature list preview */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5 text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-7 items-center justify-center rounded-md bg-[#FF9D50]/20 text-[#FF9D50]">
                                            <ShoppingBag className="size-3.5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                Manajemen Produk & Stok
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                Sinkronisasi stok otomatis
                                            </p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="size-4 text-[#55E07E]" />
                                </div>

                                <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5 text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-7 items-center justify-center rounded-md bg-[#1DCED8]/20 text-[#1DCED8]">
                                            <CreditCard className="size-3.5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                Multi-Metode Pembayaran
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                Tunai, Transfer, & QRIS
                                            </p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="size-4 text-[#55E07E]" />
                                </div>
                            </div>
                        </div>

                        {/* Floating Badges */}
                        <div className="absolute -top-4 -right-3 flex items-center gap-2 rounded-xl border border-white/20 bg-[#FF9D50] px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-lg">
                            <Zap className="size-4 fill-slate-950" />
                            <span>Kasir Cepat & Praktis</span>
                        </div>

                        <div className="absolute -bottom-4 -left-3 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2 text-xs text-white shadow-lg backdrop-blur-md">
                            <BarChart3 className="size-4 text-[#1DCED8]" />
                            <span>Laporan Penjualan Otomatis</span>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div className="mt-10 max-w-sm text-center">
                        <h3 className="text-xl font-bold tracking-tight text-white">
                            Kelola Usaha Lebih Profesional
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-300">
                            Solusi kasir terpadu untuk mencatat transaksi,
                            memantau riwayat penjualan, dan mengelola keuangan
                            toko Anda secara efisien.
                        </p>
                    </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center text-xs">
                    <div>
                        <p className="font-semibold text-white">
                            Transaksi Cepat
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Tanpa hambatan
                        </p>
                    </div>
                    <div className="border-x border-white/10 px-2">
                        <p className="font-semibold text-white">Stok Terbaca</p>
                        <p className="text-[11px] text-slate-400">
                            Update otomatis
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold text-white">Laporan Rapi</p>
                        <p className="text-[11px] text-slate-400">
                            Keuangan akurat
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Form Container Section */}
            <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-amber-50/40 via-white to-teal-50/20 p-6 sm:p-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="w-full max-w-md space-y-6">
                    {/* Header Badge & Title */}
                    <div className="space-y-2 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#FF9D50]/15 px-3.5 py-1 text-xs font-semibold text-[#FF9D50] dark:bg-[#FF9D50]/20">
                            <Store className="size-3.5" />
                            <span>Aplikasi Kasir POS</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Main Form Box */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-md sm:p-8 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none">
                        {children}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} POS Kasir. Hak cipta
                        dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}
