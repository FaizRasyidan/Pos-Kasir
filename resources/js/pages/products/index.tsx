import { Head, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ChevronLeft,
    ChevronRight,
    ImagePlus,
    Pencil,
    Plus,
    Search,
    Tag,
    Trash2,
    X,
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    category_id: number;
    name: string;
    sku: string;
    barcode?: string | null;
    image?: string | null;
    image_url?: string | null;
    buy_price: number;
    sell_price: number;
    stock: number;
    min_stock: number;
    unit: string;
    is_active: boolean;
    category?: Category;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    products: PaginatedProducts;
    categories: Category[];
    filters: {
        search?: string;
    };
}

const idr = (val: number) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

const emptyForm = (categories: Category[]) => ({
    category_id: categories?.[0]?.id ?? 1,
    name: '',
    sku: '',
    barcode: '',
    image: null as File | null,
    buy_price: '',
    sell_price: '',
    stock: '',
    min_stock: '2',
    unit: 'pcs',
});

export default function ProductsIndex({ products, categories, filters }: Props) {
    const [productOpen, setProductOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm(emptyForm(categories));
    const { data, setData, processing, errors, reset } = form;
    const categoryForm = useForm({ name: '' });

    const initials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase() || 'PR';
    };

    const openCreate = () => {
        setEditing(null);
        reset();
        form.setData(emptyForm(categories));
        setPreview(null);
        setProductOpen(true);
    };

    const openEdit = (p: Product) => {
        setEditing(p);
        form.setData({
            category_id: p.category_id,
            name: p.name,
            sku: p.sku,
            barcode: p.barcode || '',
            image: null,
            buy_price: String(p.buy_price),
            sell_price: String(p.sell_price),
            stock: String(p.stock),
            min_stock: String(p.min_stock),
            unit: p.unit || 'pcs',
        });
        setPreview(p.image_url ?? null);
        setProductOpen(true);
    };

    const autoSku = (name: string) => {
        if (editing || name.trim().length === 0) return;
        const prefix = (name.trim().substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'PRD').padEnd(3, 'X');
        const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
        setData('sku', `${prefix}-${suffix}`);
    };

    const onFile = (file: File | undefined) => {
        if (!file) return;
        setData('image', file);
        setPreview(URL.createObjectURL(file));
    };

    const clearFile = () => {
        setData('image', null);
        setPreview(editing?.image_url ?? null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const closeProduct = () => {
        setProductOpen(false);
        setEditing(null);
        setPreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const done = () => closeProduct();
        if (editing) {
            if (data.image instanceof File) {
                router.post(
                    `/products/${editing.id}`,
                    { ...data, _method: 'put' },
                    { forceFormData: true, onSuccess: done },
                );
            } else {
                const { image: _removed, ...rest } = data;
                router.put(`/products/${editing.id}`, rest, {
                    onSuccess: done,
                });
            }
        } else {
            form.post('/products', { onSuccess: done });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus produk ini? Stok dan riwayat tetap tercatat di log.')) {
            router.delete(`/products/${id}`);
        }
    };

    const from = products.total === 0 ? 0 : (products.current_page - 1) * products.per_page + 1;
    const to = Math.min(products.total, products.current_page * products.per_page);

    return (
        <>
            <Head title="Kelola Produk" />

            <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                            Produk{' '}
                            <span className="text-sm font-medium tabular-nums text-zinc-400">
                                {products.total}
                            </span>
                        </h1>
                        <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                            Kelola barang, harga, stok, dan foto produk.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setCategoryOpen(true)}
                            className="pressable inline-flex h-10 items-center gap-1.5 rounded-xl border border-zinc-200 px-3.5 text-[13px] font-medium dark:border-zinc-700"
                        >
                            <Tag className="size-4" />
                            Kategori
                        </button>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="pressable inline-flex h-10 items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 text-[13px] font-medium text-white dark:bg-white dark:text-zinc-900"
                        >
                            <Plus className="size-4" />
                            Tambah produk
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        defaultValue={filters?.search}
                        onChange={(e) =>
                            router.get(
                                '/products',
                                { search: e.target.value },
                                { preserveState: true, preserveScroll: true, replace: true },
                            )
                        }
                        placeholder="Cari nama, SKU, atau barcode…"
                        aria-label="Cari produk"
                        className="h-11 w-full rounded-xl border border-zinc-200 bg-white pr-4 pl-10 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
                    />
                </div>

                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
                        <p className="text-sm font-medium text-zinc-500">Belum ada produk</p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                            Tambah produk pertama lewat tombol di atas.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {products.data.map((p, i) => {
                            const low = p.stock <= p.min_stock;
                            return (
                                <article
                                    key={p.id}
                                    className="rise-in group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                                >
                                    <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
                                        {p.image_url ? (
                                            <img
                                                src={p.image_url}
                                                alt={p.name}
                                                loading="lazy"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-full w-full items-center justify-center text-2xl font-semibold tracking-tight text-zinc-300 dark:text-zinc-700">
                                                {initials(p.name)}
                                            </span>
                                        )}
                                        <span
                                            className={`absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                                                low
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                                                    : 'bg-zinc-900/80 text-white dark:bg-white/90 dark:text-zinc-900'
                                            }`}
                                        >
                                            {p.stock} {p.unit}
                                        </span>
                                        {!p.is_active && (
                                            <span className="absolute top-2 right-2 rounded-md bg-zinc-500/90 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                                                Nonaktif
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col p-3">
                                        <p className="truncate font-mono text-[10px] tracking-wide text-zinc-400">
                                            {p.sku}
                                            {p.category?.name ? ` · ${p.category.name}` : ''}
                                        </p>
                                        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-[13.5px] leading-5 font-medium tracking-tight">
                                            {p.name}
                                        </h3>
                                        <p className="mt-1.5 text-[15px] font-semibold tracking-tight tabular-nums">
                                            {idr(p.sell_price)}
                                        </p>
                                        <p className="text-xs tabular-nums text-zinc-400">
                                            Beli {idr(p.buy_price)}
                                        </p>
                                        <div className="mt-2.5 flex gap-1.5 border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(p)}
                                                className="pressable inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 text-xs font-medium dark:border-zinc-700"
                                            >
                                                <Pencil className="size-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(p.id)}
                                                aria-label={`Hapus ${p.name}`}
                                                className="pressable flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {products.total > products.per_page && (
                    <div className="flex items-center justify-between text-[13px] text-zinc-500">
                        <span className="tabular-nums">
                            {from}–{to} dari {products.total}
                        </span>
                        <div className="flex gap-1.5">
                            <PagerButton
                                disabled={!products.prev_page_url}
                                onClick={() => products.prev_page_url && router.get(products.prev_page_url)}
                                label="Halaman sebelumnya"
                            >
                                <ChevronLeft className="size-4" />
                            </PagerButton>
                            <PagerButton
                                disabled={!products.next_page_url}
                                onClick={() => products.next_page_url && router.get(products.next_page_url)}
                                label="Halaman berikutnya"
                            >
                                <ChevronRight className="size-4" />
                            </PagerButton>
                        </div>
                    </div>
                )}
            </div>

            {/* Produk modal */}
            <Dialog open={productOpen} onOpenChange={setProductOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold tracking-tight">
                            {editing ? 'Edit produk' : 'Tambah produk'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-3.5" encType="multipart/form-data">
                        <div>
                            <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                                Foto produk
                            </span>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => onFile(e.target.files?.[0])}
                            />
                            {preview ? (
                                <div className="relative w-fit">
                                    <img
                                        src={preview}
                                        alt="Pratinjau foto produk"
                                        className="size-24 rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        aria-label="Hapus foto"
                                        className="pressable absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="pressable flex h-24 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 text-[13px] font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                                >
                                    <ImagePlus className="size-5" />
                                    Pilih gambar · JPG/PNG/WebP ≤ 2MB
                                </button>
                            )}
                            {errors.image && <FieldError message={errors.image} />}
                        </div>

                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                            <label className="block sm:col-span-2">
                                <FieldLabel>Nama produk</FieldLabel>
                                <FieldInput
                                    value={data.name}
                                    onChange={(v) => {
                                        setData('name', v);
                                        autoSku(v);
                                    }}
                                    placeholder="cth. Kopi Gayo 250gr"
                                />
                                {errors.name && <FieldError message={errors.name} />}
                            </label>
                            <label className="block">
                                <FieldLabel>Kategori</FieldLabel>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', Number(e.target.value))}
                                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <FieldError message={errors.category_id} />}
                            </label>
                            <label className="block">
                                <FieldLabel>SKU</FieldLabel>
                                <FieldInput value={data.sku} onChange={(v) => setData('sku', v)} placeholder="KOP-001" mono />
                                {errors.sku && <FieldError message={errors.sku} />}
                            </label>
                            <label className="block">
                                <FieldLabel>Barcode (opsional)</FieldLabel>
                                <FieldInput value={data.barcode} onChange={(v) => setData('barcode', v)} mono />
                            </label>
                            <label className="block">
                                <FieldLabel>Satuan</FieldLabel>
                                <FieldInput value={data.unit} onChange={(v) => setData('unit', v)} placeholder="pcs / box / kg" />
                            </label>
                            <label className="block">
                                <FieldLabel>Harga beli (Rp)</FieldLabel>
                                <FieldInput type="number" value={data.buy_price} onChange={(v) => setData('buy_price', v)} />
                                {errors.buy_price && <FieldError message={errors.buy_price} />}
                            </label>
                            <label className="block">
                                <FieldLabel>Harga jual (Rp)</FieldLabel>
                                <FieldInput type="number" value={data.sell_price} onChange={(v) => setData('sell_price', v)} />
                                {errors.sell_price && <FieldError message={errors.sell_price} />}
                            </label>
                            <label className="block">
                                <FieldLabel>Stok</FieldLabel>
                                <FieldInput type="number" value={data.stock} onChange={(v) => setData('stock', v)} />
                                {errors.stock && <FieldError message={errors.stock} />}
                            </label>
                            <label className="block">
                                <FieldLabel>Min. stok</FieldLabel>
                                <FieldInput type="number" value={data.min_stock} onChange={(v) => setData('min_stock', v)} />
                            </label>
                        </div>

                        <DialogFooter>
                            <button
                                type="button"
                                onClick={closeProduct}
                                className="pressable h-11 rounded-xl border border-zinc-200 px-4 text-sm font-medium dark:border-zinc-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="pressable h-11 flex-1 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"
                            >
                                {processing ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Tambah produk'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Kategori modal */}
            <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
                <DialogContent className="rounded-2xl sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold tracking-tight">
                            Tambah kategori
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            categoryForm.post('/categories', {
                                onSuccess: () => {
                                    setCategoryOpen(false);
                                    categoryForm.reset();
                                },
                            });
                        }}
                        className="space-y-3.5"
                    >
                        <label className="block">
                            <FieldLabel>Nama kategori</FieldLabel>
                            <FieldInput
                                value={categoryForm.data.name}
                                onChange={(v) => categoryForm.setData('name', v)}
                                placeholder="cth. Minuman"
                                autoFocus
                            />
                            {categoryForm.errors.name && (
                                <FieldError message={categoryForm.errors.name} />
                            )}
                        </label>
                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setCategoryOpen(false)}
                                className="pressable h-11 rounded-xl border border-zinc-200 px-4 text-sm font-medium dark:border-zinc-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={categoryForm.processing}
                                className="pressable h-11 flex-1 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"
                            >
                                {categoryForm.processing ? 'Menyimpan…' : 'Simpan kategori'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [{ title: 'Produk', href: '/products' }],
};

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <span className="mb-1.5 block text-xs font-medium text-zinc-500">{children}</span>;
}

function FieldInput({
    value,
    onChange,
    placeholder,
    type = 'text',
    mono = false,
    autoFocus = false,
}: {
    value: string | number;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    mono?: boolean;
    autoFocus?: boolean;
}) {
    return (
        <input
            type={type}
            value={value}
            min={type === 'number' ? 0 : undefined}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm tabular-nums outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500 ${mono ? 'font-mono' : ''}`}
        />
    );
}

function FieldError({ message }: { message: string }) {
    return <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{message}</p>;
}

function PagerButton({
    children,
    disabled,
    onClick,
    label,
}: {
    children: React.ReactNode;
    disabled: boolean;
    onClick: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            className="pressable flex size-9 items-center justify-center rounded-lg border border-zinc-200 disabled:opacity-40 dark:border-zinc-700"
        >
            {children}
        </button>
    );
}
