import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Award,
    Users,
    Package,
} from 'lucide-react';

interface DailyReport {
    date: string;
    transactions_count: number;
    total_revenue: number;
}

interface ProductItem {
    product_id: number;
    total_qty: number;
    total_revenue: number;
    total_profit: number;
    product?: {
        name: string;
        sku: string;
        category?: {
            name: string;
        };
    };
}

interface CashierPerf {
    cashier_id: number;
    total_transactions: number;
    total_revenue: number;
    avg_transaction: number;
    cashier?: {
        name: string;
    };
}

interface Summary {
    revenue: number;
    transactions_count: number;
    average_transaction: number;
    profit: number;
    total_items_sold: number;
    start_date: string;
    end_date: string;
}

interface Props {
    summary: Summary;
    dailyReports: DailyReport[];
    topProducts: ProductItem[];
    profitableProducts: ProductItem[];
    cashierPerformance: CashierPerf[];
}

export default function ReportsIndex({
    summary,
    dailyReports,
    topProducts,
    profitableProducts,
    cashierPerformance,
}: Props) {
    const [startDate, setStartDate] = useState(summary.start_date);
    const [endDate, setEndDate] = useState(summary.end_date);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/reports',
            { start_date: startDate, end_date: endDate },
            { preserveState: true },
        );
    };

    return (
        <>
            <Head title="Laporan Penjualan & Keuntungan" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            Laporan Penjualan & Analisis
                        </h1>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            Analisis omzet, keuntungan bersih, produk terlaris,
                            dan performa kasir.
                        </p>
                    </div>

                    <form
                        onSubmit={handleFilter}
                        className="bg-card flex items-center gap-2 rounded-xl border p-2"
                    >
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-background rounded border p-1.5 text-xs"
                        />
                        <span className="text-muted-foreground text-xs">
                            s/d
                        </span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-background rounded border p-1.5 text-xs"
                        />
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground rounded px-3 py-1.5 text-xs font-medium hover:opacity-90"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="bg-card flex items-center gap-4 rounded-xl border p-4">
                        <div className="bg-primary/10 text-primary rounded-lg p-3">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-muted-foreground text-xs">
                                Total Omzet
                            </div>
                            <div className="text-primary mt-0.5 text-lg font-bold">
                                Rp{' '}
                                {Number(summary.revenue).toLocaleString(
                                    'id-ID',
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card flex items-center gap-4 rounded-xl border p-4">
                        <div className="rounded-lg bg-green-500/10 p-3 text-green-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-muted-foreground text-xs">
                                Total Profit
                            </div>
                            <div className="mt-0.5 text-lg font-bold text-green-600">
                                Rp{' '}
                                {Number(summary.profit).toLocaleString('id-ID')}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card flex items-center gap-4 rounded-xl border p-4">
                        <div className="rounded-lg bg-blue-500/10 p-3 text-blue-600">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-muted-foreground text-xs">
                                Total Transaksi
                            </div>
                            <div className="mt-0.5 text-lg font-bold">
                                {summary.transactions_count}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card flex items-center gap-4 rounded-xl border p-4">
                        <div className="rounded-lg bg-purple-500/10 p-3 text-purple-600">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-muted-foreground text-xs">
                                Item Terjual
                            </div>
                            <div className="mt-0.5 text-lg font-bold">
                                {summary.total_items_sold} pcs
                            </div>
                        </div>
                    </div>

                    <div className="bg-card flex items-center gap-4 rounded-xl border p-4">
                        <div className="rounded-lg bg-amber-500/10 p-3 text-amber-600">
                            <Award className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-muted-foreground text-xs">
                                Rata-rata / Transaksi
                            </div>
                            <div className="mt-0.5 text-lg font-bold">
                                Rp{' '}
                                {Number(
                                    summary.average_transaction,
                                ).toLocaleString('id-ID', {
                                    maximumFractionDigits: 0,
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Revenue Trend */}
                <div className="bg-card rounded-xl border p-4">
                    <div className="mb-4 text-sm font-semibold">Tren Omzet Harian</div>
                    {dailyReports.length === 0 ? (
                        <p className="text-muted-foreground py-8 text-center text-xs">Tidak ada data omzet pada rentang tanggal ini.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="relative min-w-[640px]">
                                <svg viewBox="0 0 800 240" className="h-56 w-full" role="img" aria-label="Tren omzet harian">
                                    {(() => {
                                        const maxRevenue = Math.max(...dailyReports.map((item) => Number(item.total_revenue)), 1);
                                        const points = dailyReports
                                            .slice()
                                            .reverse()
                                            .map((item, index, items) => {
                                                const x = items.length === 1 ? 400 : (index / (items.length - 1)) * 760 + 20;
                                                const y = 200 - (Number(item.total_revenue) / maxRevenue) * 170;
                                                return { ...item, x, y };
                                            });
                                        const line = points.map((point) => `${point.x},${point.y}`).join(' ');

                                        return (
                                            <>
                                                <polyline points={line} fill="none" stroke="#FF9D50" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                                {points.map((point) => (
                                                    <g key={point.date}>
                                                        <title>{`${point.date}: Rp ${Number(point.total_revenue).toLocaleString('id-ID')}`}</title>
                                                        <circle cx={point.x} cy={point.y} r="6" fill="#FF9D50" />
                                                        <text x={point.x} y="225" textAnchor="middle" className="fill-current text-[10px]">{point.date}</text>
                                                    </g>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Selling Products & Most Profitable Products */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Top Selling */}
                    <div className="bg-card overflow-hidden rounded-xl border">
                        <div className="border-b p-4 text-sm font-semibold">
                            Produk Terlaris (Top 10 Qty)
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-medium uppercase">
                                <tr>
                                    <th className="px-4 py-3">Produk</th>
                                    <th className="px-4 py-3 text-center">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Omzet
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Profit
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {topProducts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-muted-foreground py-6 text-center text-xs"
                                        >
                                            Tidak ada data produk.
                                        </td>
                                    </tr>
                                ) : (
                                    topProducts.map((p, idx) => (
                                        <tr
                                            key={idx}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {p.product?.name ||
                                                        'Produk Dihapus'}
                                                </div>
                                                <div className="text-muted-foreground text-[10px]">
                                                    {p.product?.category
                                                        ?.name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold">
                                                {p.total_qty}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                Rp{' '}
                                                {Number(
                                                    p.total_revenue,
                                                ).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-green-600">
                                                Rp{' '}
                                                {Number(
                                                    p.total_profit,
                                                ).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Most Profitable */}
                    <div className="bg-card overflow-hidden rounded-xl border">
                        <div className="border-b p-4 text-sm font-semibold">
                            Produk Paling Menguntungkan (Top 10 Profit)
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-medium uppercase">
                                <tr>
                                    <th className="px-4 py-3">Produk</th>
                                    <th className="px-4 py-3 text-center">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Omzet
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Profit
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {profitableProducts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-muted-foreground py-6 text-center text-xs"
                                        >
                                            Tidak ada data produk.
                                        </td>
                                    </tr>
                                ) : (
                                    profitableProducts.map((p, idx) => (
                                        <tr
                                            key={idx}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {p.product?.name ||
                                                        'Produk Dihapus'}
                                                </div>
                                                <div className="text-muted-foreground text-[10px]">
                                                    {p.product?.category
                                                        ?.name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold">
                                                {p.total_qty}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                Rp{' '}
                                                {Number(
                                                    p.total_revenue,
                                                ).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-green-600">
                                                Rp{' '}
                                                {Number(
                                                    p.total_profit,
                                                ).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cashier Performance & Daily Breakdown */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Cashier Performance */}
                    <div className="bg-card overflow-hidden rounded-xl border">
                        <div className="flex items-center gap-2 border-b p-4 text-sm font-semibold">
                            <Users className="h-4 w-4" /> Performa Kasir
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-medium uppercase">
                                <tr>
                                    <th className="px-4 py-3">Nama Kasir</th>
                                    <th className="px-4 py-3 text-center">
                                        Transaksi
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Total Omzet
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Rata-rata
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {cashierPerformance.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-muted-foreground py-6 text-center text-xs"
                                        >
                                            Tidak ada data kasir.
                                        </td>
                                    </tr>
                                ) : (
                                    cashierPerformance.map((c, idx) => (
                                        <tr
                                            key={idx}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {c.cashier?.name || 'Kasir'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {c.total_transactions}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                Rp{' '}
                                                {Number(
                                                    c.total_revenue,
                                                ).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                Rp{' '}
                                                {Number(
                                                    c.avg_transaction,
                                                ).toLocaleString('id-ID', {
                                                    maximumFractionDigits: 0,
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Daily Breakdown */}
                    <div className="bg-card overflow-hidden rounded-xl border">
                        <div className="border-b p-4 text-sm font-semibold">
                            Rincian Penjualan Harian
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-medium uppercase">
                                <tr>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3 text-center">
                                        Transaksi
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Total Omzet
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {dailyReports.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="text-muted-foreground py-6 text-center text-xs"
                                        >
                                            Tidak ada data penjualan pada
                                            rentang tanggal ini.
                                        </td>
                                    </tr>
                                ) : (
                                    dailyReports.map((d) => (
                                        <tr
                                            key={d.date}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {d.date}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {d.transactions_count}
                                            </td>
                                            <td className="text-primary px-4 py-3 text-right font-semibold">
                                                Rp{' '}
                                                {Number(
                                                    d.total_revenue,
                                                ).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [{ title: 'Laporan Penjualan', href: '/reports' }],
};
