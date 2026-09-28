import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    category_id: number;
    name: string;
    sku: string;
    barcode?: string;
    buy_price: number;
    sell_price: number;
    stock: number;
    min_stock: number;
    unit: string;
    is_active: boolean;
    category?: Category;
}

interface Props {
    products: {
        data: Product[];
        links: any[];
    };
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
        status?: string;
    };
}

function getStatus(
    stock: number,
    minStock: number,
): { label: string; color: string } {
    if (stock <= 0) return { label: 'Habis', color: 'bg-red-100 text-red-700' };
    if (stock <= minStock)
        return {
            label: 'Stok Menipis',
            color: 'bg-orange-100 text-orange-700',
        };
    return { label: 'Tersedia', color: 'bg-green-100 text-green-700' };
}

export default function StocksIndex({ products, categories, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<'stock' | 'in' | 'out'>('stock');

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        category_id: categories[0]?.id || '',
        name: '',
        sku: '',
        barcode: '',
        buy_price: '',
        sell_price: '',
        stock: '',
        min_stock: '2',
        unit: 'pcs',
    });

    const stockInForm = useForm({
        product_id: '',
        quantity: '',
        buy_price: '',
        sell_price: '',
        description: '',
    });

    const stockOutForm = useForm({
        product_id: '',
        quantity: '',
        reason: '',
    });

    const openEditModal = (p: Product) => {
        setEditingProduct(p);
        setData({
            category_id: p.category_id,
            name: p.name,
            sku: p.sku,
            barcode: p.barcode || '',
            buy_price: String(p.buy_price),
            sell_price: String(p.sell_price),
            stock: String(p.stock),
            min_stock: String(p.min_stock),
            unit: p.unit || 'pcs',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            put(`/products/${editingProduct.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/products', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleStockIn = (e: React.FormEvent) => {
        e.preventDefault();
        stockInForm.post('/stocks/in', {
            onSuccess: () => {
                setIsModalOpen(false);
                stockInForm.reset();
            },
        });
    };

    const handleStockOut = (e: React.FormEvent) => {
        e.preventDefault();
        stockOutForm.post('/stocks/out', {
            onSuccess: () => {
                setIsModalOpen(false);
                stockOutForm.reset();
            },
        });
    };

    const handleDelete = (p: Product) => {
        if (
            confirm(
                `Hapus produk "${p.name}"? Produk tidak terhapus permanen (soft delete).`,
            )
        ) {
            destroy(`/products/${p.id}`);
        }
    };

    const formatPrice = (val: number | string) =>
        `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

    return (
        <>
            <Head title="Stok Produk" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            Manajemen Stok
                        </h1>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            Lihat, tambah, dan koreksi stok produk.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setActiveTab('in');
                                setIsModalOpen(true);
                            }}
                            className="rounded-lg border border-[#55E07E]/40 bg-[#55E07E]/10 px-3 py-2 text-xs font-bold text-[#55E07E] transition hover:bg-[#55E07E]/20"
                        >
                            Tambah Stok
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('out');
                                setIsModalOpen(true);
                            }}
                            className="rounded-lg border border-red-400/40 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                        >
                            Kurangi Stok
                        </button>
                    </div>
                </div>

                {/* Search + Filters */}
                <div className="bg-card rounded-xl border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Cari nama, SKU, barcode..."
                                className="h-9 w-full rounded-lg border pl-9 text-sm focus:ring-1 focus:ring-[#FF9D50] focus:outline-none"
                                defaultValue={filters.search}
                                onBlur={(e) =>
                                    router.get(
                                        '/stocks',
                                        {
                                            ...filters,
                                            search: e.target.value || undefined,
                                        },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                        <select
                            name="category_id"
                            className="h-9 rounded-lg border text-sm focus:ring-1 focus:ring-[#FF9D50] focus:outline-none"
                            defaultValue={filters.category_id}
                            onChange={(e) =>
                                router.get(
                                    '/stocks',
                                    {
                                        ...filters,
                                        category_id:
                                            e.target.value || undefined,
                                    },
                                    { preserveState: true, replace: true },
                                )
                            }
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <select
                            name="status"
                            className="h-9 rounded-lg border text-sm focus:ring-1 focus:ring-[#FF9D50] focus:outline-none"
                            defaultValue={filters.status}
                            onChange={(e) =>
                                router.get(
                                    '/stocks',
                                    {
                                        ...filters,
                                        status: e.target.value || undefined,
                                    },
                                    { preserveState: true, replace: true },
                                )
                            }
                        >
                            <option value="">Semua Status</option>
                            <option value="available">Tersedia</option>
                            <option value="low">Stok Menipis</option>
                            <option value="out">Habis</option>
                        </select>
                    </div>
                </div>

                {/* Stock Table */}
                <div className="bg-card overflow-hidden rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-medium uppercase">
                            <tr>
                                <th className="px-4 py-3">Produk</th>
                                <th className="px-4 py-3">Kategori</th>
                                <th className="px-4 py-3 text-right">
                                    Harga Beli
                                </th>
                                <th className="px-4 py-3 text-right">
                                    Harga Jual
                                </th>
                                <th className="px-4 py-3 text-center">Stok</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-muted-foreground py-10 text-center text-xs italic"
                                    >
                                        Produk tidak ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((p) => {
                                    const status = getStatus(
                                        p.stock,
                                        p.min_stock,
                                    );
                                    return (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold">
                                                        {p.name}
                                                    </span>
                                                    <span className="text-muted-foreground font-mono text-[10px]">
                                                        {p.sku}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {p.category?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs">
                                                {formatPrice(p.buy_price)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs">
                                                {formatPrice(p.sell_price)}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono text-xs font-bold">
                                                {p.stock}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${status.color}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            openEditModal(p)
                                                        }
                                                        className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 transition hover:bg-slate-100"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(p)
                                                        }
                                                        className="rounded border border-red-200 bg-white px-2 py-1 text-[10px] font-bold text-red-600 transition hover:bg-red-50"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal (shared for create / edit / stock in / stock out) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#1a1a2e] shadow-2xl">
                        <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-700/50 bg-[#16213e]/80 p-4">
                            <h3 className="text-lg font-bold text-white">
                                {activeTab === 'stock'
                                    ? editingProduct
                                        ? 'Edit Produk'
                                        : 'Tambah Produk'
                                    : activeTab === 'in'
                                      ? 'Tambah Stok'
                                      : 'Kurangi Stok'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-sm text-slate-400 transition hover:text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                activeTab === 'in'
                                    ? handleStockIn
                                    : activeTab === 'out'
                                      ? handleStockOut
                                      : handleSubmit
                            }
                            className="flex flex-col gap-4 p-6"
                        >
                            {activeTab !== 'in' && activeTab !== 'out' && (
                                <>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-400">
                                            Kategori
                                        </label>
                                        <select
                                            name="category_id"
                                            value={data.category_id}
                                            onChange={(e) =>
                                                setData(
                                                    'category_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                        >
                                            {categories.map((c) => (
                                                <option
                                                    key={c.id}
                                                    value={String(c.id)}
                                                >
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-400">
                                            Nama Produk
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-400">
                                                SKU
                                            </label>
                                            <input
                                                type="text"
                                                value={data.sku}
                                                onChange={(e) =>
                                                    setData(
                                                        'sku',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-400">
                                                Barcode
                                            </label>
                                            <input
                                                type="text"
                                                value={data.barcode}
                                                onChange={(e) =>
                                                    setData(
                                                        'barcode',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-400">
                                                Harga Beli
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.buy_price}
                                                onChange={(e) =>
                                                    setData(
                                                        'buy_price',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-400">
                                                Harga Jual
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.sell_price}
                                                onChange={(e) =>
                                                    setData(
                                                        'sell_price',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-400">
                                                Stok
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.stock}
                                                onChange={(e) =>
                                                    setData(
                                                        'stock',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-400">
                                                Min Stok Alert
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.min_stock}
                                                onChange={(e) =>
                                                    setData(
                                                        'min_stock',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-400">
                                            Satuan
                                        </label>
                                        <input
                                            type="text"
                                            value={data.unit}
                                            onChange={(e) =>
                                                setData('unit', e.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {(activeTab === 'in' || activeTab === 'out') && (
                                <>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-400">
                                            Produk
                                        </label>
                                        <select
                                            name="product_id"
                                            value={
                                                activeTab === 'in'
                                                    ? stockInForm.data
                                                          .product_id
                                                    : stockOutForm.data
                                                          .product_id
                                            }
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (activeTab === 'in')
                                                    stockInForm.setData(
                                                        'product_id',
                                                        val,
                                                    );
                                                else
                                                    stockOutForm.setData(
                                                        'product_id',
                                                        val,
                                                    );
                                                const selected =
                                                    products.data.find(
                                                        (p) =>
                                                            String(p.id) ===
                                                            val,
                                                    );
                                                if (selected) {
                                                    if (activeTab === 'in') {
                                                        stockInForm.setData(
                                                            'buy_price',
                                                            String(
                                                                selected.buy_price,
                                                            ),
                                                        );
                                                        stockInForm.setData(
                                                            'sell_price',
                                                            String(
                                                                selected.sell_price,
                                                            ),
                                                        );
                                                    }
                                                }
                                            }}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                            required
                                        >
                                            <option value="">
                                                Pilih Produk...
                                            </option>
                                            {products.data.map((p) => (
                                                <option
                                                    key={p.id}
                                                    value={String(p.id)}
                                                >
                                                    {p.name} (Stok: {p.stock})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-400">
                                            Jumlah
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={
                                                activeTab === 'in'
                                                    ? stockInForm.data.quantity
                                                    : stockOutForm.data.quantity
                                            }
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                if (activeTab === 'in')
                                                    stockInForm.setData(
                                                        'quantity',
                                                        v,
                                                    );
                                                else
                                                    stockOutForm.setData(
                                                        'quantity',
                                                        v,
                                                    );
                                            }}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                            required
                                        />
                                    </div>
                                    {activeTab === 'in' && (
                                        <>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-400">
                                                    Harga Beli
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        stockInForm.data
                                                            .buy_price
                                                    }
                                                    onChange={(e) =>
                                                        stockInForm.setData(
                                                            'buy_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-400">
                                                    Harga Jual
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        stockInForm.data
                                                            .sell_price
                                                    }
                                                    onChange={(e) =>
                                                        stockInForm.setData(
                                                            'sell_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-400">
                                                    Catatan
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        stockInForm.data
                                                            .description
                                                    }
                                                    onChange={(e) =>
                                                        stockInForm.setData(
                                                            'description',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                                    placeholder="Opsional"
                                                />
                                            </div>
                                        </>
                                    )}
                                    {activeTab === 'out' && (
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-400">
                                                Alasan
                                            </label>
                                            <input
                                                type="text"
                                                value={stockOutForm.data.reason}
                                                onChange={(e) =>
                                                    stockOutForm.setData(
                                                        'reason',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:ring-2 focus:ring-[#FF9D50]/50"
                                                placeholder="Contoh: Barang rusak"
                                                required
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="mt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg border border-slate-600 px-5 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-[#FF9D50] px-5 py-2.5 text-xs font-bold text-white transition hover:shadow-lg hover:shadow-[#FF9D50]/40 disabled:opacity-50"
                                >
                                    {activeTab === 'in'
                                        ? 'Simpan Stok Masuk'
                                        : activeTab === 'out'
                                          ? 'Simpan Koreksi'
                                          : editingProduct
                                            ? 'Perbarui'
                                            : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

StocksIndex.layout = {
    breadcrumbs: [{ title: 'Stok', href: '/stocks' }],
};
