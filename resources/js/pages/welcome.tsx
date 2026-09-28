import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ShoppingCart,
    Package,
    ReceiptText,
    BarChart3,
    Zap,
    Store,
    TrendingUp,
    CheckCircle2,
    Monitor,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';

type PageProps = {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
};

export default function Welcome() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    return (
        <>
            <Head title="POS Kasir Modern & Terpercaya" />

            <div className="min-h-screen bg-[#FFF9D8]/30 font-sans text-slate-800 selection:bg-[#FF9D50] selection:text-white">
                {/* Navbar */}
                <header className="sticky top-0 z-50 border-b border-[#FF9D50]/20 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black tracking-tight text-slate-900">
                                POS<span className="text-[#FF9D50]">KASIR</span>
                            </span>
                        </div>

                        <nav className="flex items-center gap-3">
                            {user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex transform items-center gap-2 rounded-xl bg-[#FF9D50] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#FF9D50]/30 transition-all hover:-translate-y-0.5 hover:bg-[#FF9D50]/90"
                                >
                                    Dashboard Kasir{' '}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex transform items-center gap-2 rounded-xl bg-[#FF9D50] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#FF9D50]/30 transition-all hover:-translate-y-0.5 hover:bg-[#FF9D50]/90"
                                    >
                                        Daftar Sekarang{' '}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl space-y-6 text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF9D50]/30 bg-[#FFF9D8] px-4 py-1.5 text-xs font-semibold text-[#FF9D50] shadow-sm">
                                Platform Operasional Toko
                            </div>

                            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                                Solusi Kasir Cepat, Kelola Toko{' '}
                                <span className="text-[#FF9D50] underline decoration-[#1DCED8] decoration-wavy decoration-2">
                                    Tanpa Ribet
                                </span>
                            </h1>

                            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
                                Tingkatkan efisiensi bisnis retail dan UMKM
                                Anda. Kelola persediaan barang, proses transaksi
                                instan, dan pantau performa penjualan secara
                                real-time.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                                <Link
                                    href={user ? dashboard() : register()}
                                    className="inline-flex transform items-center gap-2 rounded-xl bg-[#FF9D50] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-[#FF9D50]/30 transition-all hover:-translate-y-0.5 hover:bg-[#FF9D50]/90"
                                >
                                    Coba Sekarang Gratis{' '}
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <Link
                                    href="/pos"
                                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1DCED8] bg-white px-7 py-3.5 text-base font-bold text-[#1DCED8] transition-all hover:bg-[#1DCED8]/10"
                                >
                                    <ShoppingCart className="h-5 w-5 text-[#1DCED8]" />{' '}
                                    Demo Kasir POS
                                </Link>
                            </div>

                            {/* Key Highlights */}
                            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 pt-10 text-left sm:grid-cols-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#55E07E]" />{' '}
                                    Transaksi Cepat
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#55E07E]" />{' '}
                                    Struk Digital & Cetak
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#55E07E]" />{' '}
                                    Laporan Akuntansi
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#55E07E]" />{' '}
                                    Manajemen Stok
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="border-y border-slate-100 bg-white py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto mb-12 max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Fitur Lengkap Sesuai Kebutuhan Toko Anda
                            </h2>
                            <p className="mt-3 text-slate-600">
                                Dirancang khusus untuk mempermudah operasional
                                kasir dan pemilik usaha.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {/* Feature 1 */}
                            <div className="group rounded-2xl border border-slate-100 bg-[#FFF9D8]/20 p-6 transition-all hover:border-[#FF9D50]/40 hover:shadow-xl hover:shadow-[#FF9D50]/10">
                                <div className="inline-flex rounded-xl bg-[#FF9D50]/10 p-3 text-[#FF9D50] transition-all group-hover:bg-[#FF9D50] group-hover:text-white">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-slate-900">
                                    POS & Kasir Cepat
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Antarmuka kasir modern dengan pencarian
                                    produk cepat, pengelompokan kategori, dan
                                    perhitungan otomatis.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group rounded-2xl border border-slate-100 bg-[#FFF9D8]/20 p-6 transition-all hover:border-[#1DCED8]/40 hover:shadow-xl hover:shadow-[#1DCED8]/10">
                                <div className="inline-flex rounded-xl bg-[#1DCED8]/10 p-3 text-[#1DCED8] transition-all group-hover:bg-[#1DCED8] group-hover:text-white">
                                    <Package className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-slate-900">
                                    Manajemen Produk
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Input barang & kategori dalam satu halaman.
                                    Kelola katalog, kategori, harga, dan stok
                                    produk dari satu tempat.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group rounded-2xl border border-slate-100 bg-[#FFF9D8]/20 p-6 transition-all hover:border-[#55E07E]/40 hover:shadow-xl hover:shadow-[#55E07E]/10">
                                <div className="inline-flex rounded-xl bg-[#55E07E]/10 p-3 text-[#55E07E] transition-all group-hover:bg-[#55E07E] group-hover:text-white">
                                    <ReceiptText className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-slate-900">
                                    Riwayat & Struk
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Pantau histori penjualan lengkap dan cetak
                                    ulang struk transaksi secara langsung dengan
                                    format rapi.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group rounded-2xl border border-slate-100 bg-[#FFF9D8]/20 p-6 transition-all hover:border-[#FF9D50]/40 hover:shadow-xl hover:shadow-[#FF9D50]/10">
                                <div className="inline-flex rounded-xl bg-[#FF9D50]/10 p-3 text-[#FF9D50] transition-all group-hover:bg-[#FF9D50] group-hover:text-white">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-slate-900">
                                    Laporan Accounting
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Rekap omzet, keuntungan, pengeluarannya, dan
                                    visualisasi grafik tren penjualan bulanan
                                    secara akurat.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow / Advantage Section */}
                <section className="py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#1DCED8]/30 bg-[#1DCED8]/10 px-3.5 py-1 text-xs font-semibold text-[#1DCED8]">
                                    <Store className="h-4 w-4" /> Mengapa
                                    Memilih POSKasir?
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                    Didesain Khusus Untuk Kemudahan Dan
                                    Kecepatan Toko
                                </h2>
                                <p className="leading-relaxed text-slate-600">
                                    Kami memahami bahwa waktu adalah hal paling
                                    berharga saat melayani pelanggan. Setiap
                                    elemen antarmuka dirancang agar responsif
                                    dan mudah digunakan oleh siapapun tanpa
                                    perlu pelatihan rumit.
                                </p>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 shrink-0 rounded-lg bg-[#FF9D50] p-2 text-white">
                                            <Monitor className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">
                                                Tampilan Bersih & Intuitif
                                            </h4>
                                            <p className="text-sm text-slate-600">
                                                Dukungan layout modern yang
                                                meminimalkan jumlah klik saat
                                                transaksi.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 shrink-0 rounded-lg bg-[#1DCED8] p-2 text-white">
                                            <TrendingUp className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">
                                                Analisis Performa Real-Time
                                            </h4>
                                            <p className="text-sm text-slate-600">
                                                Pantau perkembangan omzet dan
                                                profit harian kapan saja secara
                                                akurat.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Display Box */}
                            <div className="relative rounded-3xl border-2 border-[#FF9D50]/20 bg-white p-8 shadow-2xl">
                                <div className="mb-6 flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-400" />
                                        <div className="h-3 w-3 rounded-full bg-amber-400" />
                                        <div className="h-3 w-3 rounded-full bg-green-400" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400">
                                        Ringkasan Sistem POS
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-xl bg-[#FFF9D8] p-4">
                                        <div>
                                            <p className="text-xs font-medium text-slate-500">
                                                Penjualan Hari Ini
                                            </p>
                                            <p className="text-xl font-black text-slate-800">
                                                Rp 2.450.000
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-[#55E07E] px-2.5 py-1 text-xs font-bold text-white">
                                            +18%
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-slate-100 p-4">
                                            <p className="text-xs font-medium text-slate-500">
                                                Total Transaksi
                                            </p>
                                            <p className="text-lg font-bold text-slate-800">
                                                42 Struk
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-100 p-4">
                                            <p className="text-xs font-medium text-slate-500">
                                                Produk Terjual
                                            </p>
                                            <p className="text-lg font-bold text-slate-800">
                                                128 Item
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF9D50] text-lg font-bold text-white">
                                            FF
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                Frisian Flag Full Cream
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Kategori: Minuman • Stok: 48
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white py-8">
                    <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500 lg:px-8">
                        <p>
                            © 2026 POSKasir. Made by : Faizrasyid.an
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}  