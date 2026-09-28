import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { FolderTree, Plus, Trash2, Edit2 } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    products_count?: number;
}

interface Props {
    categories: Category[];
}

export default function CategoriesIndex({ categories = [] }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );

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
        name: '',
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setData({ name: cat.name });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/categories', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            destroy(`/categories/${id}`);
        }
    };

    return (
        <>
            <Head title="Kategori Produk" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            Kategori Produk
                        </h1>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            Kelola kategori untuk pengelompokan produk toko
                            Anda.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" /> Tambah Kategori
                    </button>
                </div>

                <div className="bg-card overflow-hidden rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-medium uppercase">
                            <tr>
                                <th className="px-4 py-3">Nama Kategori</th>
                                <th className="px-4 py-3">Slug</th>
                                <th className="px-4 py-3 text-center">
                                    Jumlah Produk
                                </th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="text-muted-foreground py-8 text-center text-xs"
                                    >
                                        Belum ada kategori.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr
                                        key={cat.id}
                                        className="hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {cat.name}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                                            {cat.slug}
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium">
                                            {cat.products_count ?? 0}
                                        </td>
                                        <td className="space-x-2 px-4 py-3 text-right">
                                            <button
                                                onClick={() =>
                                                    openEditModal(cat)
                                                }
                                                className="hover:text-primary p-1"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(cat.id)
                                                }
                                                className="hover:text-destructive p-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card w-full max-w-sm overflow-hidden rounded-xl border p-4 shadow-lg">
                        <h3 className="mb-4 text-base font-semibold">
                            {editingCategory
                                ? 'Edit Kategori'
                                : 'Tambah Kategori'}
                        </h3>
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="bg-background focus:ring-primary w-full rounded-lg border p-2 text-sm focus:ring-2"
                                    placeholder="E.g. Makanan & Minuman"
                                />
                                {errors.name && (
                                    <div className="text-destructive mt-1 text-xs">
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg border px-3 py-1.5 text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs"
                                >
                                    {processing ? 'Saving...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [{ title: 'Kategori Produk', href: '/categories' }],
};
