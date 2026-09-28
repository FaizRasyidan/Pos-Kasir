import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertCircle,
    Banknote,
    Check,
    Minus,
    Plus,
    Printer,
    QrCode,
    Search,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { StoreSettings } from '@/pages/sales/show';

interface Category {
    id: number;
    name: string;
    products_count?: number;
}

interface Product {
    id: number;
    category_id: number;
    name: string;
    sku: string;
    barcode?: string;
    image_url?: string | null;
    sell_price: number;
    stock: number;
    unit: string;
    category?: Category;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface ReceiptItem {
    name: string;
    sku: string;
    quantity: number;
    price: number;
    unit: string;
}

interface ReceiptData {
    transactionNumber: string;
    cashierName: string;
    storeName: string;
    storeTagline?: string;
    storeAddress: string;
    storePhone: string;
    storeEmail: string;
    receiptHeader: string;
    receiptFooter: string;
    date: string;
    time: string;
    paymentMethod: string;
    paidAmount: number;
    changeAmount: number;
    subtotal: number;
    discount: number;
    tax: number;
    grandTotal: number;
    items: ReceiptItem[];
}

interface Props {
    products: Product[];
    categories: Category[];
    storeSettings: StoreSettings;
    allProductsCount?: number;
    filters: {
        search?: string;
        category_id?: string;
    };
    flash?: {
        sale?: any;
        storeSettings?: StoreSettings;
        success?: string;
        error?: string;
    };
}

type PaymentMethod = 'cash' | 'qris';

const idr = (val: number) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

function buildReceipt(sale: any, s: StoreSettings): ReceiptData {
    return {
        transactionNumber: sale.transaction_number,
        cashierName: sale.cashier?.name || 'Kasir',
        storeName: s.store_name,
        storeTagline: s.store_tagline,
        storeAddress: s.store_address,
        storePhone: s.store_phone,
        storeEmail: s.store_email,
        receiptHeader: s.receipt_header,
        receiptFooter: s.receipt_footer,
        date: new Date(sale.created_at || Date.now()).toLocaleDateString('id-ID'),
        time: new Date(sale.created_at || Date.now()).toLocaleTimeString('id-ID'),
        paymentMethod: sale.payment_method,
        paidAmount: parseFloat(sale.paid_amount || 0),
        changeAmount: parseFloat(sale.change_amount || 0),
        subtotal: parseFloat(sale.subtotal || 0),
        discount: parseFloat(sale.discount || 0),
        tax: parseFloat(sale.tax || 0),
        grandTotal: parseFloat(sale.grand_total || 0),
        items: (sale.items || []).map((item: any) => ({
            name: item.product?.name || 'Item',
            sku: item.product?.sku || '-',
            quantity: item.quantity,
            price: parseFloat(item.price || 0),
            unit: item.product?.unit || 'pcs',
        })),
    };
}

const QUICK_CASH = [10_000, 20_000, 50_000, 100_000];

export default function PosIndex({
    products = [],
    categories = [],
    allProductsCount = 0,
    storeSettings,
    filters = {},
    flash = {},
}: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [payment, setPayment] = useState<PaymentMethod>('cash');
    const [paidAmount, setPaidAmount] = useState('');
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (flash?.sale) {
            setReceipt(buildReceipt(flash.sale, flash.storeSettings ?? storeSettings));
            setReceiptOpen(true);
        }
    }, [flash, storeSettings]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                searchRef.current?.focus();
            } else if (e.key === 'F4' && cart.length > 0 && !checkoutOpen && !receiptOpen) {
                e.preventDefault();
                setCheckoutError(null);
                setCheckoutOpen(true);
            } else if (e.key === 'Escape') {
                setCheckoutOpen(false);
                setReceiptOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [cart.length, checkoutOpen, receiptOpen]);

    const query = (next: { search: string; category_id: string }) => {
        router.get('/pos', next, { preserveState: true, preserveScroll: true, replace: true });
    };

    const onSearch = (val: string) => {
        setSearch(val);
        query({ search: val, category_id: selectedCategory });
    };

    const onCategory = (id: string) => {
        const next = selectedCategory === id ? '' : id;
        setSelectedCategory(next);
        query({ search, category_id: next });
    };

    const cartQty = useMemo(() => cart.reduce((n, i) => n + i.quantity, 0), [cart]);
    const cartMap = useMemo(() => new Map(cart.map((i) => [i.product.id, i.quantity])), [cart]);

    const addToCart = (product: Product) => {
        if (product.stock <= 0) return;
        setCart((prev) => {
            const idx = prev.findIndex((i) => i.product.id === product.id);
            if (idx > -1) {
                if (prev[idx].quantity >= product.stock) return prev;
                const next = [...prev];
                next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
                return next;
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const stepQty = (id: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((i) => {
                    if (i.product.id !== id) return i;
                    const next = i.quantity + delta;
                    if (next > i.product.stock) return i;
                    return next <= 0 ? null : { ...i, quantity: next };
                })
                .filter((i): i is CartItem => i !== null),
        );
    };

    const removeLine = (id: number) => setCart((prev) => prev.filter((i) => i.product.id !== id));

    const subtotal = cart.reduce((n, i) => n + i.product.sell_price * i.quantity, 0);
    const grandTotal = Math.max(0, subtotal - discount + tax);
    const paid = parseFloat(paidAmount) || 0;
    const change = Math.max(0, paid - grandTotal);
    const cashShort = payment === 'cash' && paid < grandTotal;

    const checkout = (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0 || processing) return;
        if (cashShort) return;
        setProcessing(true);
        setCheckoutError(null);
        router.post(
            '/pos/checkout',
            {
                payment_method: payment,
                paid_amount: payment === 'cash' ? paid : grandTotal,
                discount,
                tax,
                items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
            },
            {
                onSuccess: (page: any) => {
                    const sale = page?.props?.flash?.sale ?? null;
                    if (sale) {
                        setReceipt(buildReceipt(sale, page?.props?.flash?.storeSettings ?? storeSettings));
                        setReceiptOpen(true);
                    }
                    setCheckoutOpen(false);
                    setCart([]);
                    setPaidAmount('');
                    setDiscount(0);
                    setTax(0);
                },
                onError: (errors) => {
                    setCheckoutError(
                        (errors as Record<string, string>)?.error ||
                            'Pembayaran gagal. Periksa stok lalu coba lagi.',
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title="Point of Sale" />

            <div className="flex h-full min-h-0 flex-col bg-zinc-100 md:flex-row dark:bg-zinc-950">
                {/* Produk */}
                <section className="flex min-h-0 flex-1 flex-col" aria-label="Daftar produk">
                    <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2.5 sm:px-4 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-zinc-400" />
                            <input
                                ref={searchRef}
                                value={search}
                                onChange={(e) => onSearch(e.target.value)}
                                placeholder="Cari nama, SKU, atau scan barcode…"
                                inputMode="search"
                                enterKeyHint="search"
                                aria-label="Cari produk"
                                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pr-16 pl-10 text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:bg-zinc-900"
                            />
                            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-400 sm:block dark:border-zinc-700 dark:bg-zinc-900">
                                F2
                            </kbd>
                        </div>
                        <span className="hidden shrink-0 rounded-lg bg-zinc-100 px-2.5 py-2 text-xs font-semibold tabular-nums text-zinc-600 lg:block dark:bg-zinc-800 dark:text-zinc-300">
                            {products.length}/{allProductsCount}
                        </span>
                    </div>

                    <div
                        className="flex shrink-0 gap-1.5 overflow-x-auto px-3 py-2.5 overscroll-contain sm:px-4"
                        role="tablist"
                        aria-label="Filter kategori"
                    >
                        <FilterChip
                            active={selectedCategory === ''}
                            label="Semua"
                            count={allProductsCount}
                            onClick={() => onCategory('')}
                        />
                        {categories.map((c) => (
                            <FilterChip
                                key={c.id}
                                active={selectedCategory === String(c.id)}
                                label={c.name}
                                count={c.products_count ?? 0}
                                onClick={() => onCategory(String(c.id))}
                            />
                        ))}
                    </div>

                    <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-2.5 overflow-y-auto overscroll-contain px-3 pt-1 pb-4 sm:grid-cols-3 sm:px-4 xl:grid-cols-4">
                        {products.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center py-16 text-center">
                                <AlertCircle className="mb-2 size-9 text-zinc-300 dark:text-zinc-700" />
                                <p className="text-sm font-medium text-zinc-500">Produk tidak ditemukan</p>
                                <p className="mt-0.5 text-xs text-zinc-400">
                                    Coba kata kunci atau kategori lain.
                                </p>
                            </div>
                        ) : (
                            products.map((p) => {
                                const out = p.stock <= 0;
                                const low = !out && p.stock <= 5;
                                const inCart = cartMap.get(p.id) ?? 0;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        disabled={out}
                                        onClick={() => addToCart(p)}
                                        aria-label={`Tambah ${p.name} ke keranjang`}
                                        className="pressable hoverable relative flex min-h-[132px] flex-col justify-between rounded-xl border border-zinc-200 bg-white p-3 text-left disabled:cursor-not-allowed disabled:opacity-55 dark:border-zinc-800 dark:bg-zinc-900"
                                    >
                                        {inCart > 0 && (
                                            <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold tabular-nums text-white dark:bg-white dark:text-zinc-900">
                                                {inCart}
                                            </span>
                                        )}
                                        <span className="min-w-0">
                                            {p.image_url ? (
                                                <img
                                                    src={p.image_url}
                                                    alt=""
                                                    loading="lazy"
                                                    className="mb-2 h-16 w-full rounded-lg object-cover"
                                                />
                                            ) : null}
                                            <span className="block truncate font-mono text-[10px] tracking-wide text-zinc-400">
                                                {p.sku}
                                            </span>
                                            <span className="mt-0.5 line-clamp-2 block min-h-[2.5rem] text-[13.5px] leading-5 font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
                                                {p.name}
                                            </span>
                                        </span>
                                        <span className="mt-2 flex items-end justify-between gap-1.5">
                                            <span className="text-[15px] font-semibold tracking-tight tabular-nums">
                                                {idr(p.sell_price)}
                                            </span>
                                            <span
                                                className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                                                    out
                                                        ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                                                        : low
                                                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                                                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                                }`}
                                            >
                                                {out ? 'Habis' : `×${p.stock}`}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Keranjang */}
                <aside
                    className="flex max-h-[46%] min-h-0 shrink-0 flex-col border-t border-zinc-200 bg-white md:max-h-none md:w-[360px] md:border-t-0 md:border-l lg:w-[400px] dark:border-zinc-800 dark:bg-zinc-900"
                    aria-label="Keranjang belanja"
                >
                    <div className="flex shrink-0 items-center justify-between px-4 py-3">
                        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
                            <ShoppingCart className="size-4.5 text-zinc-500" />
                            Keranjang
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                {cartQty}
                            </span>
                        </h2>
                        <button
                            type="button"
                            onClick={() => setCart([])}
                            disabled={cart.length === 0}
                            className="pressable rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-400 disabled:opacity-40"
                        >
                            Kosongkan
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 pb-2">
                        {cart.length === 0 ? (
                            <div className="flex h-full min-h-24 flex-col items-center justify-center py-6 text-center">
                                <ShoppingCart className="mb-2 size-8 text-zinc-200 dark:text-zinc-800" />
                                <p className="text-[13px] font-medium text-zinc-500">Keranjang kosong</p>
                                <p className="text-xs text-zinc-400">Ketuk produk untuk menambah.</p>
                            </div>
                        ) : (
                            cart.map((i) => (
                                <div
                                    key={i.product.id}
                                    className="rounded-xl border border-zinc-200 p-2.5 dark:border-zinc-800"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="min-w-0 flex-1 truncate text-[13.5px] font-medium tracking-tight">
                                            {i.product.name}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => removeLine(i.product.id)}
                                            aria-label={`Hapus ${i.product.name}`}
                                            className="pressable rounded-md p-1.5 text-zinc-400"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                    <p className="mt-0.5 text-xs tabular-nums text-zinc-500">
                                        {idr(i.product.sell_price)} /{i.product.unit}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <StepButton label="Kurangi" onClick={() => stepQty(i.product.id, -1)}>
                                                <Minus className="size-4" />
                                            </StepButton>
                                            <span className="w-8 text-center text-sm font-semibold tabular-nums">
                                                {i.quantity}
                                            </span>
                                            <StepButton label="Tambah" onClick={() => stepQty(i.product.id, 1)}>
                                                <Plus className="size-4" />
                                            </StepButton>
                                        </div>
                                        <p className="text-sm font-semibold tracking-tight tabular-nums">
                                            {idr(i.product.sell_price * i.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="shrink-0 border-t border-zinc-200 px-4 pt-3 pb-3 dark:border-zinc-800">
                        <div className="flex gap-2">
                            <label className="min-w-0 flex-1">
                                <span className="mb-1 block text-[11px] font-medium text-zinc-500">
                                    Diskon (Rp)
                                </span>
                                <input
                                    type="number"
                                    min={0}
                                    value={discount || ''}
                                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                                    placeholder="0"
                                    inputMode="numeric"
                                    className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 text-sm tabular-nums outline-none focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:focus:bg-zinc-900"
                                />
                            </label>
                            <label className="min-w-0 flex-1">
                                <span className="mb-1 block text-[11px] font-medium text-zinc-500">
                                    Pajak (Rp)
                                </span>
                                <input
                                    type="number"
                                    min={0}
                                    value={tax || ''}
                                    onChange={(e) => setTax(Math.max(0, Number(e.target.value) || 0))}
                                    placeholder="0"
                                    inputMode="numeric"
                                    className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 text-sm tabular-nums outline-none focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:focus:bg-zinc-900"
                                />
                            </label>
                        </div>
                        <div className="mt-2.5 flex items-baseline justify-between">
                            <span className="text-[13px] text-zinc-500">Total</span>
                            <span className="text-xl font-semibold tracking-tight tabular-nums">
                                {idr(grandTotal)}
                            </span>
                        </div>
                        <button
                            type="button"
                            disabled={cart.length === 0}
                            onClick={() => {
                                setCheckoutError(null);
                                setPayment('cash');
                                setPaidAmount(String(grandTotal));
                                setCheckoutOpen(true);
                            }}
                            className="pressable mt-2.5 h-12 w-full rounded-xl bg-zinc-900 text-[15px] font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"
                        >
                            Bayar · {idr(grandTotal)}
                        </button>
                        <p className="mt-1.5 hidden text-center font-mono text-[10px] text-zinc-400 md:block">
                            F4 bayar · F2 cari · ESC tutup
                        </p>
                    </div>
                </aside>
            </div>

            {/* Pembayaran */}
            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent className="rounded-2xl sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold tracking-tight">
                            Pembayaran
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={checkout} className="space-y-4">
                        <div className="rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total tagihan</p>
                            <p className="text-[26px] leading-8 font-semibold tracking-tight tabular-nums">
                                {idr(grandTotal)}
                            </p>
                            <p className="mt-0.5 text-xs tabular-nums text-zinc-500">
                                {cartQty} item · subtotal {idr(subtotal)}
                                {discount > 0 && ` · diskon −${idr(discount)}`}
                                {tax > 0 && ` · pajak +${idr(tax)}`}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Metode pembayaran">
                            <PayOption
                                active={payment === 'cash'}
                                onClick={() => {
                                    setPayment('cash');
                                    setPaidAmount(String(grandTotal));
                                }}
                                icon={<Banknote className="size-4" />}
                                label="Tunai"
                            />
                            <PayOption
                                active={payment === 'qris'}
                                onClick={() => setPayment('qris')}
                                icon={<QrCode className="size-4" />}
                                label="QRIS"
                            />
                        </div>

                        {payment === 'cash' ? (
                            <div>
                                <label
                                    htmlFor="paid-amount"
                                    className="mb-1.5 block text-xs font-medium text-zinc-500"
                                >
                                    Jumlah bayar
                                </label>
                                <input
                                    id="paid-amount"
                                    type="number"
                                    min={0}
                                    required
                                    autoFocus
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(e.target.value)}
                                    inputMode="numeric"
                                    placeholder="cth. 50000"
                                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-lg font-semibold tabular-nums outline-none focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:focus:bg-zinc-900"
                                />
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    <QuickCash label="Uang pas" onClick={() => setPaidAmount(String(grandTotal))} />
                                    {QUICK_CASH.filter((n) => n > grandTotal)
                                        .slice(0, 3)
                                        .map((n) => (
                                            <QuickCash
                                                key={n}
                                                label={n.toLocaleString('id-ID')}
                                                onClick={() => setPaidAmount(String(n))}
                                            />
                                        ))}
                                </div>
                                <p className="mt-2.5 flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">Kembalian</span>
                                    <span
                                        className={`font-semibold tabular-nums ${cashShort ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                    >
                                        {cashShort
                                            ? `Kurang ${idr(grandTotal - paid)}`
                                            : idr(change)}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <p className="rounded-xl border border-dashed border-zinc-300 px-3.5 py-3 text-[13px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                                Pelanggan membayar {idr(grandTotal)} via QRIS. Tunjukkan kode QR,
                                selesaikan setelah dana masuk.
                            </p>
                        )}

                        {checkoutError && (
                            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                {checkoutError}
                            </p>
                        )}

                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setCheckoutOpen(false)}
                                className="pressable h-11 rounded-xl border border-zinc-200 px-4 text-sm font-medium dark:border-zinc-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing || cart.length === 0 || cashShort}
                                className="pressable inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"
                            >
                                {processing ? (
                                    'Memproses…'
                                ) : (
                                    <>
                                        <Check className="size-4" />
                                        Selesaikan · {idr(grandTotal)}
                                    </>
                                )}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Struk */}
            <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
                <DialogContent className="rounded-2xl sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <Check className="size-3.5" strokeWidth={3} />
                            </span>
                            Transaksi berhasil
                        </DialogTitle>
                    </DialogHeader>
                    {receipt && (
                        <div className="max-h-[55vh] overflow-y-auto overscroll-contain rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
                            <div className="text-center">
                                <p className="font-sans text-sm font-bold tracking-tight uppercase">
                                    {receipt.storeName}
                                </p>
                                {receipt.storeTagline && <p className="mt-0.5 italic">{receipt.storeTagline}</p>}
                                {receipt.storeAddress && <p className="mt-1">{receipt.storeAddress}</p>}
                                {receipt.storePhone && <p>{receipt.storePhone}</p>}
                                {receipt.receiptHeader && <p className="mt-1">{receipt.receiptHeader}</p>}
                                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-left">
                                    <span>{receipt.date}</span>
                                    <span className="text-right">{receipt.time}</span>
                                    <span className="truncate">Kasir: {receipt.cashierName}</span>
                                    <span className="truncate text-right">No: {receipt.transactionNumber}</span>
                                </div>
                            </div>
                            <hr className="my-2 border-dashed border-zinc-300 dark:border-zinc-700" />
                            <div className="space-y-1">
                                {receipt.items.map((item, idx) => (
                                    <div key={idx}>
                                        <p className="font-sans font-medium">
                                            {item.name} ×{item.quantity}
                                        </p>
                                        <p className="flex justify-between tabular-nums">
                                            <span>
                                                {idr(item.price)}/{item.unit}
                                            </span>
                                            <span>{idr(item.price * item.quantity)}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <hr className="my-2 border-dashed border-zinc-300 dark:border-zinc-700" />
                            <div className="space-y-0.5 tabular-nums">
                                <p className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{idr(receipt.subtotal)}</span>
                                </p>
                                {receipt.discount > 0 && (
                                    <p className="flex justify-between">
                                        <span>Diskon</span>
                                        <span>−{idr(receipt.discount)}</span>
                                    </p>
                                )}
                                {receipt.tax > 0 && (
                                    <p className="flex justify-between">
                                        <span>Pajak</span>
                                        <span>+{idr(receipt.tax)}</span>
                                    </p>
                                )}
                                <p className="flex justify-between font-sans text-sm font-bold">
                                    <span>Total</span>
                                    <span>{idr(receipt.grandTotal)}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>{receipt.paymentMethod.toUpperCase()}</span>
                                    <span>{idr(receipt.paidAmount)}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Kembali</span>
                                    <span>{idr(receipt.changeAmount)}</span>
                                </p>
                            </div>
                            <div className="mt-3 border-t border-dashed border-zinc-300 pt-2 text-center dark:border-zinc-700">
                                <p className="font-sans font-semibold">
                                    {receipt.receiptFooter || 'Terima kasih atas kunjungan Anda'}
                                </p>
                                <p>Barang yang sudah dibeli tidak dapat ditukar.</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="pressable inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
                        >
                            <Printer className="size-4" />
                            Cetak struk
                        </button>
                        <button
                            type="button"
                            onClick={() => setReceiptOpen(false)}
                            className="pressable h-11 rounded-xl border border-zinc-200 px-4 text-sm font-medium dark:border-zinc-700"
                        >
                            Tutup
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function FilterChip({
    active,
    label,
    count,
    onClick,
}: {
    active: boolean;
    label: string;
    count: number;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={`pressable inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium whitespace-nowrap ${
                active
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                    : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
            }`}
        >
            {label}
            <span
                className={`rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                    active ? 'bg-white/20 dark:bg-zinc-900/10' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
            >
                {count}
            </span>
        </button>
    );
}

function StepButton({
    children,
    label,
    onClick,
}: {
    children: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="pressable flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
            {children}
        </button>
    );
}

function PayOption({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={active}
            onClick={onClick}
            className={`pressable inline-flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold ${
                active
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                    : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

function QuickCash({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="pressable rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold tabular-nums text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
        >
            {label}
        </button>
    );
}
