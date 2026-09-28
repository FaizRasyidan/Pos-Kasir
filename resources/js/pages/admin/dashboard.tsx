import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    PackageSearch,
    ReceiptText,
    ShoppingBag,
    TrendingUp,
    Wallet,
} from 'lucide-react';

interface SalesPoint {
    date: string;
    raw_date: string;
    revenue: number;
    transactions: number;
}

interface AdminDashboardProps {
    metrics: {
        today_revenue: number;
        revenue_change: number;
        today_profit: number;
        profit_change: number;
        today_transactions: number;
        transaction_change: number;
        average_transaction: number;
        average_change: number;
    };
    salesChart: SalesPoint[];
    topProducts: Array<{ name: string; sku: string; total_sold: number }>;
    recentTransactions: Array<{
        id: number;
        transaction_number: string;
        cashier_name: string;
        payment_method: string;
        grand_total: number;
        created_at: string;
    }>;
    needsAttention: {
        low_stock: Array<{ id: number; name: string; sku: string; stock: number }>;
        out_of_stock: Array<{ id: number; name: string; sku: string; stock: number }>;
        inactive_cashiers: Array<{ id: number; name: string; email: string }>;
    };
    recentActivity: Array<{
        id: number;
        action: string;
        description: string;
        user_name: string;
        created_at: string;
    }>;
    quickActions: Array<{ label: string; href: string }>;
    storeHealth: {
        active_products: number;
        active_cashiers: number;
        total_stock_units: number;
        attention_count: number;
    };
}

const idr = (val: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(val);

function Delta({ value, suffix = '%' }: { value: number; suffix?: string }) {
    if (!Number.isFinite(value) || value === 0) {
        return (
            <span className="inline-flex items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                ±0{suffix}
            </span>
        );
    }
    const up = value > 0;
    return (
        <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                up
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
            }`}
        >
            {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {up ? '+' : ''}
            {value}
            {suffix}
        </span>
    );
}

function Card({
    children,
    className = '',
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <section
            className={`rise-in rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </section>
    );
}

function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {children}
            </h2>
            {action}
        </div>
    );
}

export default function AdminDashboard({
    metrics,
    salesChart = [],
    topProducts = [],
    recentTransactions = [],
    needsAttention,
    recentActivity = [],
    quickActions = [],
    storeHealth,
}: AdminDashboardProps) {
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const attentionItems = [
        ...needsAttention.out_of_stock.map((p) => ({ ...p, kind: 'habis' as const })),
        ...needsAttention.low_stock.map((p) => ({ ...p, kind: 'rendah' as const })),
    ];
    const maxRevenue = Math.max(1, ...salesChart.map((d) => d.revenue));

    const cards = [
        {
            label: 'Omzet hari ini',
            value: idr(metrics.today_revenue),
            delta: <Delta value={metrics.revenue_change} />,
            hint: 'vs kemarin',
            icon: Wallet,
        },
        {
            label: 'Transaksi hari ini',
            value: String(metrics.today_transactions),
            delta: <Delta value={metrics.transaction_change} />,
            hint: 'vs kemarin',
            icon: ShoppingBag,
        },
        {
            label: 'Estimasi profit hari ini',
            value: idr(metrics.today_profit),
            delta: null,
            hint: 'jual − beli',
            icon: TrendingUp,
        },
        {
            label: 'Rata-rata per transaksi',
            value: idr(metrics.average_transaction),
            delta: null,
            hint: `${storeHealth.active_products} produk aktif · ${storeHealth.total_stock_units.toLocaleString('id-ID')} unit stok`,
            icon: ReceiptText,
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="mx-auto w-full max-w-6xl space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-zinc-500 capitalize dark:text-zinc-400">
                            {today}
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                            Ringkasan toko
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Kinerja penjualan dan hal yang butuh perhatian hari ini.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {quickActions.slice(0, 2).map((a) => (
                            <Link
                                key={a.href}
                                href={a.href}
                                className="pressable inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-[13px] font-medium text-white dark:bg-white dark:text-zinc-900"
                            >
                                {a.label}
                                <ArrowRight className="size-3.5" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((c, i) => (
                        <Card key={c.label} delay={i * 50}>
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
                                    {c.label}
                                </p>
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                    <c.icon className="size-4" />
                                </span>
                            </div>
                            <p className="mt-2 text-[22px] leading-7 font-semibold tracking-tight tabular-nums">
                                {c.value}
                            </p>
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                {c.delta}
                                <span className="truncate">{c.hint}</span>
                            </p>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
                    <Card className="lg:col-span-3" delay={100}>
                        <CardTitle
                            action={
                                <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                                    7 hari terakhir
                                </span>
                            }
                        >
                            Pendapatan harian
                        </CardTitle>
                        {salesChart.length === 0 ? (
                            <p className="py-10 text-center text-sm text-zinc-400">
                                Belum ada data penjualan.
                            </p>
                        ) : (
                            <div>
                                <div
                                    className="flex h-40 items-end gap-2 sm:gap-3"
                                    role="img"
                                    aria-label="Grafik pendapatan 7 hari"
                                >
                                    {salesChart.map((d, i) => {
                                        const isToday = i === salesChart.length - 1;
                                        const height = Math.max(
                                            4,
                                            Math.round((d.revenue / maxRevenue) * 100),
                                        );
                                        return (
                                            <div
                                                key={d.raw_date}
                                                className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                                                title={`${d.date}: ${idr(d.revenue)} · ${d.transactions} transaksi`}
                                            >
                                                <div className="flex h-40 w-full items-end">
                                                    <div
                                                        className={`w-full rounded-md transition-[height] duration-200 ease-out ${
                                                            isToday
                                                                ? 'bg-zinc-900 dark:bg-white'
                                                                : 'bg-zinc-200 dark:bg-zinc-700'
                                                        }`}
                                                        style={{ height: `${height}%` }}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-[10px] tabular-nums ${isToday ? 'font-semibold text-zinc-900 dark:text-white' : 'text-zinc-400'}`}
                                                >
                                                    {d.date}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card className="lg:col-span-2" delay={150}>
                        <CardTitle>Produk terlaris · 7 hari</CardTitle>
                        {topProducts.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-center">
                                <PackageSearch className="mb-2 size-8 text-zinc-300 dark:text-zinc-700" />
                                <p className="text-sm text-zinc-400">Belum ada penjualan.</p>
                            </div>
                        ) : (
                            <ol className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {topProducts.map((p, i) => (
                                    <li key={`${p.sku}-${i}`} className="flex items-center gap-3 py-2.5">
                                        <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-zinc-400">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                                                {p.name}
                                            </span>
                                            <span className="block font-mono text-[11px] text-zinc-400">
                                                {p.sku}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                                            {p.total_sold.toLocaleString('id-ID')}
                                            <span className="ml-1 text-[11px] font-normal text-zinc-400">
                                                terjual
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
                    <Card className="lg:col-span-3" delay={200}>
                        <CardTitle
                            action={
                                <Link
                                    href="/sales"
                                    className="pressable inline-flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400"
                                >
                                    Semua transaksi
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            }
                        >
                            Transaksi terbaru
                        </CardTitle>
                        {recentTransactions.length === 0 ? (
                            <p className="py-8 text-center text-sm text-zinc-400">
                                Belum ada transaksi.
                            </p>
                        ) : (
                            <div className="-mx-1 overflow-x-auto">
                                <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
                                    <thead>
                                        <tr className="border-b border-zinc-100 text-[11px] font-medium tracking-wide text-zinc-400 uppercase dark:border-zinc-800">
                                            <th className="px-2 py-2 font-medium">Nomor</th>
                                            <th className="px-2 py-2 font-medium">Kasir</th>
                                            <th className="px-2 py-2 font-medium">Bayar</th>
                                            <th className="px-2 py-2 text-right font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {recentTransactions.map((t) => (
                                            <tr key={t.id}>
                                                <td className="px-2 py-2.5">
                                                    <Link
                                                        href={`/sales/${t.id}`}
                                                        className="pressable font-mono text-xs font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-100 dark:decoration-zinc-700"
                                                    >
                                                        {t.transaction_number}
                                                    </Link>
                                                    <span className="block text-[11px] text-zinc-400">
                                                        {t.created_at}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2.5 text-zinc-600 dark:text-zinc-300">
                                                    {t.cashier_name}
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <span className="inline-flex rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase dark:bg-zinc-800">
                                                        {t.payment_method}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2.5 text-right font-semibold tabular-nums">
                                                    {idr(t.grand_total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    <div className="space-y-3 lg:col-span-2">
                        <Card delay={250}>
                            <CardTitle
                                action={
                                    attentionItems.length + needsAttention.inactive_cashiers.length > 0 ? (
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                            {attentionItems.length + needsAttention.inactive_cashiers.length}
                                        </span>
                                    ) : undefined
                                }
                            >
                                Butuh perhatian
                            </CardTitle>
                            {attentionItems.length === 0 &&
                            needsAttention.inactive_cashiers.length === 0 ? (
                                <p className="py-4 text-center text-sm text-zinc-400">
                                    Semua stok dan kasir dalam kondisi aman.
                                </p>
                            ) : (
                                <ul className="max-h-52 space-y-1.5 overflow-y-auto overscroll-contain pr-0.5">
                                    {attentionItems.map((p) => (
                                        <li
                                            key={`${p.kind}-${p.id}`}
                                            className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 px-2.5 py-2 text-[13px] dark:border-zinc-800"
                                        >
                                            <span className="min-w-0">
                                                <span className="block truncate font-medium">
                                                    {p.name}
                                                </span>
                                                <span className="block text-[11px] text-zinc-400">
                                                    {p.kind === 'habis' ? 'Stok habis' : 'Stok menipis'} ·{' '}
                                                    <span className="font-mono">{p.sku}</span>
                                                </span>
                                            </span>
                                            <span
                                                className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                                                    p.kind === 'habis'
                                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                                }`}
                                            >
                                                {p.stock}
                                            </span>
                                        </li>
                                    ))}
                                    {needsAttention.inactive_cashiers.map((c) => (
                                        <li
                                            key={`kasir-${c.id}`}
                                            className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 px-2.5 py-2 text-[13px] dark:border-zinc-800"
                                        >
                                            <span className="min-w-0">
                                                <span className="block truncate font-medium">{c.name}</span>
                                                <span className="block truncate text-[11px] text-zinc-400">
                                                    Kasir nonaktif · {c.email}
                                                </span>
                                            </span>
                                            <Link
                                                href="/users/cashiers"
                                                className="pressable shrink-0 rounded-md border border-zinc-200 px-2 py-1 text-[11px] font-medium dark:border-zinc-700"
                                            >
                                                Kelola
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>

                        <Card delay={300}>
                            <CardTitle>Aktivitas terbaru</CardTitle>
                            {recentActivity.length === 0 ? (
                                <p className="py-4 text-center text-sm text-zinc-400">
                                    Belum ada aktivitas terekam.
                                </p>
                            ) : (
                                <ul className="max-h-52 space-y-3 overflow-y-auto overscroll-contain pr-0.5">
                                    {recentActivity.map((a) => (
                                        <li key={a.id} className="flex gap-2.5 text-[13px]">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                            <span className="min-w-0">
                                                <span className="block truncate font-medium text-zinc-800 dark:text-zinc-200">
                                                    {a.description}
                                                </span>
                                                <span className="block text-[11px] text-zinc-400">
                                                    {a.user_name} · {a.created_at}
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>
                </div>

                {quickActions.length > 2 ? (
                    <Card delay={350}>
                        <CardTitle>Aksi cepat</CardTitle>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {quickActions.map((a) => (
                                <Link
                                    key={a.href}
                                    href={a.href}
                                    className="pressable hoverable inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2.5 text-[13px] font-medium dark:border-zinc-700"
                                >
                                    {a.label}
                                    <ArrowRight className="size-3.5 text-zinc-400" />
                                </Link>
                            ))}
                        </div>
                    </Card>
                ) : null}
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }],
};
