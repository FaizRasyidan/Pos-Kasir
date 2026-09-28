import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { Users, Plus, Edit2, ShieldAlert } from 'lucide-react';

interface Cashier {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    cashiers: {
        data: Cashier[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
    };
    flash?: {
        success?: string;
    };
}

export default function CashiersIndex({ cashiers, flash }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingCashier(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (c: Cashier) => {
        setEditingCashier(c);
        setData({
            name: c.name,
            email: c.email,
            password: '',
            password_confirmation: '',
            is_active: c.is_active,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCashier) {
            put(`/users/cashiers/${editingCashier.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/users/cashiers', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <>
            <Head title="Kelola Kasir" />

            <div className="flex flex-col gap-6 p-6">
                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Kelola Kasir</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            Kelola akun dan akses kasir toko.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" /> Tambah Kasir
                    </button>
                </div>

                <div className="bg-card overflow-hidden rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-medium uppercase">
                            <tr>
                                <th className="px-4 py-3">Nama</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Dibuat</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {cashiers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-muted-foreground py-12 text-center text-xs">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Users className="h-8 w-8 text-zinc-400" />
                                            <p className="font-medium">Belum ada akun kasir.</p>
                                            <p className="text-[11px] text-zinc-500">Buat akun kasir pertama untuk mulai menggunakan POS.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                cashiers.data.map((c) => (
                                    <tr key={c.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{c.name}</td>
                                        <td className="text-muted-foreground px-4 py-3 font-mono text-xs">{c.email}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                    c.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                                                }`}
                                            >
                                                {c.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 text-xs">
                                            {new Date(c.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openEditModal(c)}
                                                className="hover:text-primary inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs font-medium"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" /> Edit
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
                    <div className="bg-card w-full max-w-md overflow-hidden rounded-xl border p-6 shadow-lg">
                        <h3 className="mb-4 text-base font-semibold">
                            {editingCashier ? 'Edit Akun Kasir' : 'Tambah Akun Kasir'}
                        </h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs font-medium">Nama</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="bg-background focus:ring-primary w-full rounded-lg border p-2 text-sm focus:ring-2"
                                    placeholder="Nama lengkap kasir"
                                />
                                {errors.name && <div className="text-destructive mt-1 text-xs">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs font-medium">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="bg-background focus:ring-primary w-full rounded-lg border p-2 text-sm focus:ring-2"
                                    placeholder="kasir@tokopos.com"
                                />
                                {errors.email && <div className="text-destructive mt-1 text-xs">{errors.email}</div>}
                            </div>

                            {editingCashier && (
                                <div>
                                    <label className="text-muted-foreground mb-1 block text-xs font-medium">Status Akun</label>
                                    <select
                                        value={data.is_active ? '1' : '0'}
                                        onChange={(e) => setData('is_active', e.target.value === '1')}
                                        className="bg-background focus:ring-primary w-full rounded-lg border p-2 text-sm focus:ring-2"
                                    >
                                        <option value="1">Aktif</option>
                                        <option value="0">Nonaktif</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                                    {editingCashier ? 'Password Baru (Opsional)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    {...(!editingCashier ? { required: true } : {})}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="bg-background focus:ring-primary w-full rounded-lg border p-2 text-sm focus:ring-2"
                                    placeholder="••••••••"
                                />
                                {errors.password && <div className="text-destructive mt-1 text-xs">{errors.password}</div>}
                            </div>

                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs font-medium">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    {...(!editingCashier && data.password ? { required: true } : {})}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="bg-background focus:ring-primary w-full rounded-lg border p-2 text-sm focus:ring-2"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
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
                                    className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

CashiersIndex.layout = {
    breadcrumbs: [{ title: 'Kelola Kasir', href: '/users/cashiers' }],
};
