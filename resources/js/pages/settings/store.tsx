import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';

// Define route function if not available globally
const route = (window as any).route || ((name: string) => name);

interface SettingProps {
    settings: Record<string, string>;
}

export default function StoreSettings({ settings }: SettingProps) {
    const { props } = usePage<any>();
    const flash = props.flash as { success?: string };

    const { data, setData, post, processing, errors, reset } = useForm({
        store_name: settings.store_name || 'TOKO POS-KASIR',
        store_tagline: settings.store_tagline || '',
        store_address: settings.store_address || '',
        store_phone: settings.store_phone || '',
        store_email: settings.store_email || '',
        receipt_header: settings.receipt_header || '',
        receipt_footer:
            settings.receipt_footer || 'Terima Kasih Telah Berbelanja!',
    });

    useEffect(() => {
        if (flash?.success) {
            alert(flash.success);
        }
    }, [flash]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted with data:', data);
        post('/settings/store', {
            onSuccess: () => {
                console.log('Settings saved successfully');
            },
            onError: (errors) => {
                console.error('Error saving settings:', errors);
            },
        });
    };

    return (
        <>
            <Head title="Pengaturan Toko" />

            <div className="mx-auto max-w-3xl p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Pengaturan Toko</h1>
                    <p className="text-muted-foreground mt-2">
                        Kelola informasi toko, informasi kontak, dan tampilan
                        struk transaksi.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Identitas Toko */}
                    <div className="bg-card rounded-xl border p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Identitas Toko
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">
                                    Nama Toko *
                                </label>
                                <input
                                    type="text"
                                    value={data.store_name}
                                    onChange={(e) =>
                                        setData('store_name', e.target.value)
                                    }
                                    className="rounded-lg border p-2"
                                    required
                                />
                                {errors.store_name && (
                                    <span className="text-xs text-red-500">
                                        {errors.store_name}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">
                                    Tagline
                                </label>
                                <input
                                    type="text"
                                    value={data.store_tagline}
                                    onChange={(e) =>
                                        setData('store_tagline', e.target.value)
                                    }
                                    className="rounded-lg border p-2"
                                    placeholder="Solusi Kasir & Penjualan"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Informasi Kontak */}
                    <div className="bg-card rounded-xl border p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Informasi Kontak
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">
                                    Alamat
                                </label>
                                <textarea
                                    value={data.store_address}
                                    onChange={(e) =>
                                        setData('store_address', e.target.value)
                                    }
                                    className="rounded-lg border p-2"
                                    rows={3}
                                    placeholder="Alamat toko belum diatur"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Nomor Telepon
                                    </label>
                                    <input
                                        type="text"
                                        value={data.store_phone}
                                        onChange={(e) =>
                                            setData(
                                                'store_phone',
                                                e.target.value,
                                            )
                                        }
                                        className="rounded-lg border p-2"
                                        placeholder="08123456789"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.store_email}
                                        onChange={(e) =>
                                            setData(
                                                'store_email',
                                                e.target.value,
                                            )
                                        }
                                        className="rounded-lg border p-2"
                                        placeholder="toko@example.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pengaturan Struk */}
                    <div className="bg-card rounded-xl border p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Pengaturan Struk
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">
                                    Header Struk
                                </label>
                                <textarea
                                    value={data.receipt_header}
                                    onChange={(e) =>
                                        setData(
                                            'receipt_header',
                                            e.target.value,
                                        )
                                    }
                                    className="rounded-lg border p-2"
                                    rows={2}
                                    placeholder="Informasi tambahan di atas struk (opsional)"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">
                                    Footer Struk
                                </label>
                                <textarea
                                    value={data.receipt_footer}
                                    onChange={(e) =>
                                        setData(
                                            'receipt_footer',
                                            e.target.value,
                                        )
                                    }
                                    className="rounded-lg border p-2"
                                    rows={2}
                                    placeholder="Terima Kasih Telah Berbelanja!"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tombol Simpan */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-[#FF9D50] px-6 py-2 text-white hover:opacity-90 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

StoreSettings.layout = {
    breadcrumbs: [{ title: 'Pengaturan Toko', href: '/settings/store' }],
};
