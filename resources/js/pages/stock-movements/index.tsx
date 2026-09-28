import { Head, router } from '@inertiajs/react';
import React from 'react';
import {
    Package,
    ArrowUpRight,
    ArrowDownRight,
    History,
    Filter,
    Search,
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string;
    category?: {
        name: string;
    };
}

interface StockMovement {
    id: number;
    product_id: number;
    user_id: number;
    type: string;
    quantity: number;
    buy_price: number;
    selling_price: number;
    stock_before: number;
    stock_after: number;
    description: string;
    created_at: string;
    product?: Product;
    user?: {
        name: string;
    };
}

interface Props {
    stockMovements: {
        data: StockMovement[];
        links: any[];
    };
    products: Product[];
    filters: {
        search?: string;
        product_id?: string;
        type?: string;
        start_date?: string;
        endDate?: string;
    };
}

export default function StockMovementIndex({
    stockMovements,
    products,
    filters,
}: Props) {
    const handleFilterChange = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
    ) => {
        const { name, value } = e.target;
        router.get(
            '/stock-movements',
            { ...filters, [name]: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'sale':
                return 'text-red-600 bg-red-50';
            case 'purchase':
                return 'text-green-600 bg-green-50';
            case 'opening':
                return 'text-blue-600 bg-blue-50';
            case 'adjustment':
                return 'text-orange-600 bg-orange-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <>
            <Head title="Riwayat Stok" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            Riwayat Pergerakan Stok
                        </h1>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            Log lengkap masuk dan keluarnya stok barang secara
                            otomatis.
                        </p>
                    </div>
                </div>

                <div className="bg-card rounded-xl border p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Cari SKU / Nama..."
                                className="h-9 w-full rounded-lg border pl-9 text-sm focus:ring-1 focus:ring-[#FF9D50] focus:outline-none"
                                defaultValue={filters.search}
                                onBlur={handleFilterChange}
                            />
                        </div>
                        <select
                            name="type"
                            className="h-9 rounded-lg border text-sm focus:ring-1 focus:ring-[#FF9D50] focus:outline-none"
                            defaultValue={filters.type}
                            onChange={handleFilterChange}
                        >
                            <option value="">Semua Tipe</option>
                            <option value="opening">Opening</option>
                            <option value="purchase">
                                Stock In / Purchase
                            </option>
                            <option value="sale">Sale</option>
                            <option value="adjustment">Adjustment</option>
                            <option value="return">Return</option>
                        </select>
                        <input
                            type="date"
                            name="start_date"
                            className="h-9 rounded-lg border text-sm focus:ring-1 focus:ring-[#FF9D50] focus:outline-none"
                            defaultValue={filters.start_date}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="date"
                            name="end_date"
                            className="h-9 rounded-lg border text-sm focus:ring-1 focus:ring-[#FF9D50] focus:outline-none"
                            defaultValue={filters.endDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>

                <div className="bg-card overflow-hidden rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-medium uppercase">
                            <tr>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3">Produk</th>
                                <th className="px-4 py-3">Tipe</th>
                                <th className="px-4 py-3 text-right">
                                    Harga Beli
                                </th>
                                <th className="px-4 py-3 text-right">
                                    Harga Jual
                                </th>
                                <th className="px-4 py-3 text-center">
                                    Jumlah
                                </th>
                                <th className="px-4 py-3 text-center">
                                    Sebelum
                                </th>
                                <th className="px-4 py-3 text-center">
                                    Sesudah
                                </th>
                                <th className="px-4 py-3">User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {stockMovements.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="text-muted-foreground py-10 text-center text-xs italic"
                                    >
                                        Data riwayat stok tidak ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                stockMovements.data.map((m) => (
                                    <tr
                                        key={m.id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                                            {new Date(
                                                m.created_at,
                                            ).toLocaleString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold">
                                                    {m.product?.name}
                                                </span>
                                                <span className="text-muted-foreground font-mono text-[10px]">
                                                    {m.product?.sku}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getTypeColor(m.type)}`}
                                            >
                                                {m.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-[11px]">
                                            {Number(m.buy_price) > 0
                                                ? `Rp ${Number(m.buy_price).toLocaleString('id-ID')}`
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-[11px]">
                                            {Number(m.selling_price) > 0
                                                ? `Rp ${Number(m.selling_price).toLocaleString('id-ID')}`
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold">
                                            <div
                                                className={`flex items-center justify-center gap-0.5 text-xs ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {m.quantity > 0 ? (
                                                    <ArrowUpRight className="size-3" />
                                                ) : (
                                                    <ArrowDownRight className="size-3" />
                                                )}
                                                {m.quantity > 0
                                                    ? `+${m.quantity}`
                                                    : m.quantity}
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 text-center font-mono text-xs">
                                            {m.stock_before ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-xs font-bold">
                                            {m.stock_after ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {m.user?.name || '-'}
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

StockMovementIndex.layout = {
    breadcrumbs: [{ title: 'Riwayat Stok', href: '/stock-movements' }],
};
