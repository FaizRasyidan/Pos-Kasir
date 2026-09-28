import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Printer } from 'lucide-react';

interface SaleItem {
    id: number;
    quantity: number;
    price: number;
    subtotal: number;
    product?: {
        name: string;
        sku: string;
    };
}

interface Sale {
    id: number;
    transaction_number: string;
    payment_method: string;
    subtotal: number;
    discount: number;
    tax: number;
    grand_total: number;
    paid_amount: number;
    change_amount: number;
    created_at: string;
    cashier?: {
        name: string;
    };
    items: SaleItem[];
}

interface StoreSettings {
    store_name: string;
    store_tagline?: string;
    store_address: string;
    store_phone: string;
    store_email: string;
    receipt_header: string;
    receipt_footer: string;
}

export type { StoreSettings };

interface Props {
    sale: Sale;
    storeSettings: StoreSettings;
}

export default function SaleShow({ sale, storeSettings }: Props) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Struk ${sale.transaction_number}`} />

            <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
                <div className="flex items-center justify-between print:hidden">
                    <Link
                        href="/sales"
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali ke Riwayat
                    </Link>
                    <button
                        onClick={handlePrint}
                        className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition hover:opacity-90"
                    >
                        <Printer className="h-4 w-4" /> Cetak Struk
                    </button>
                </div>

                {/* Struk Receipt Card */}
                <div className="bg-card flex flex-col gap-4 rounded-xl border p-6 font-mono text-sm shadow-sm">
                    <div className="border-b pb-4 text-center">
                        <h2 className="text-lg font-bold">
                            {storeSettings.store_name}
                        </h2>
                        {storeSettings.store_tagline && (
                            <p className="text-muted-foreground text-xs italic">
                                {storeSettings.store_tagline}
                            </p>
                        )}
                        {storeSettings.store_address && (
                            <p className="text-muted-foreground text-xs">
                                {storeSettings.store_address}
                            </p>
                        )}
                        {storeSettings.store_phone && (
                            <p className="text-muted-foreground text-xs">
                                {storeSettings.store_phone}
                            </p>
                        )}
                        {storeSettings.store_email && (
                            <p className="text-muted-foreground text-xs">
                                {storeSettings.store_email}
                            </p>
                        )}
                        {storeSettings.receipt_header && (
                            <p className="text-muted-foreground mt-1 text-xs">
                                {storeSettings.receipt_header}
                            </p>
                        )}
                        <p className="text-muted-foreground mt-1 text-xs">
                            No: {sale.transaction_number}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            {new Date(sale.created_at).toLocaleString('id-ID')}
                        </p>
                    </div>

                    <div className="text-muted-foreground flex justify-between border-b pb-2 text-xs">
                        <span>Kasir: {sale.cashier?.name || '-'}</span>
                        <span className="uppercase">
                            Metode: {sale.payment_method}
                        </span>
                    </div>

                    {/* Items */}
                    <div className="flex flex-col gap-2 border-b py-2">
                        {sale.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col text-xs"
                            >
                                <div className="font-medium">
                                    {item.product?.name || 'Produk Dihapus'}
                                </div>
                                <div className="text-muted-foreground flex justify-between">
                                    <span>
                                        {item.quantity} x Rp{' '}
                                        {Number(item.price).toLocaleString(
                                            'id-ID',
                                        )}
                                    </span>
                                    <span>
                                        Rp{' '}
                                        {Number(item.subtotal).toLocaleString(
                                            'id-ID',
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="flex flex-col gap-1.5 text-xs">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>
                                Rp{' '}
                                {Number(sale.subtotal).toLocaleString('id-ID')}
                            </span>
                        </div>
                        {Number(sale.discount) > 0 && (
                            <div className="text-destructive flex justify-between">
                                <span>Diskon</span>
                                <span>
                                    - Rp{' '}
                                    {Number(sale.discount).toLocaleString(
                                        'id-ID',
                                    )}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-1.5 text-sm font-bold">
                            <span>Grand Total</span>
                            <span>
                                Rp{' '}
                                {Number(sale.grand_total).toLocaleString(
                                    'id-ID',
                                )}
                            </span>
                        </div>
                        <div className="text-muted-foreground flex justify-between">
                            <span>Tunai Dibayar</span>
                            <span>
                                Rp{' '}
                                {Number(sale.paid_amount).toLocaleString(
                                    'id-ID',
                                )}
                            </span>
                        </div>
                        <div className="text-muted-foreground flex justify-between">
                            <span>Kembalian</span>
                            <span>
                                Rp{' '}
                                {Number(sale.change_amount || 0).toLocaleString(
                                    'id-ID',
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="text-muted-foreground border-t pt-4 text-center text-xs">
                        <p>
                            {storeSettings.receipt_footer ||
                                'Terima Kasih Telah Berbelanja!'}
                        </p>
                        <p className="mt-1 text-[10px]">
                            Barang yang sudah dibeli tidak dapat ditukar.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

function SaleShowLayout({ children }: { children: React.ReactNode }) {
    const { sale } = usePage().props as unknown as {
        sale: { transaction_number: string };
    };
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Riwayat Transaksi', href: '/sales' },
                { title: sale.transaction_number, href: '#' },
            ]}
        >
            {children}
        </AppLayout>
    );
}

SaleShow.layout = (page: React.ReactNode) => <SaleShowLayout>{page}</SaleShowLayout>;
