import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { Eye, Receipt } from 'lucide-react';

interface Sale {
    id: number;
    transaction_number: string;
    payment_method: string;
    grand_total: number;
    paid_amount: number;
    change_amount: number;
    created_at: string;
    cashier?: {
        name: string;
    };
}

interface Props {
    sales: {
        data: Sale[];
    };
}

export default function SalesIndex({ sales }: Props) {
    return (
        <>
            <Head title="Riwayat Transaksi" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">
                        Riwayat Transaksi Penjualan
                    </h1>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                        Seluruh daftar transaksi kasir beserta detail pembelian.
                    </p>
                </div>

                <div className="bg-card overflow-hidden rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-medium uppercase">
                            <tr>
                                <th className="px-4 py-3">No. Transaksi</th>
                                <th className="px-4 py-3">Waktu</th>
                                <th className="px-4 py-3">Kasir</th>
                                <th className="px-4 py-3">Metode</th>
                                <th className="px-4 py-3 text-right">
                                    Total Transaksi
                                </th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sales.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-muted-foreground py-8 text-center text-xs"
                                    >
                                        Belum ada riwayat transaksi.
                                    </td>
                                </tr>
                            ) : (
                                sales.data.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3 font-mono text-xs font-semibold">
                                            {s.transaction_number}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 text-xs">
                                            {new Date(
                                                s.created_at,
                                            ).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {s.cashier?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs uppercase">
                                            {s.payment_method}
                                        </td>
                                        <td className="text-primary px-4 py-3 text-right font-semibold">
                                            Rp{' '}
                                            {Number(
                                                s.grand_total,
                                            ).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/sales/${s.id}`}
                                                className="hover:bg-muted inline-flex items-center gap-1 rounded p-1.5 text-xs"
                                            >
                                                <Eye className="h-3.5 w-3.5" />{' '}
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

SalesIndex.layout = {
    breadcrumbs: [{ title: 'Riwayat Transaksi', href: '/sales' }],
};
