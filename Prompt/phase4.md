PHASE 4 — TRANSACTION DETAIL & RECEIPT

STATUS PROJECT:
POS-Kasir Laravel sudah melewati Phase 1, Phase 2.1, Phase 2.2, dan Phase 3 dengan status PASS.

Tech Stack:

- Laravel 13.17
- PHP 8.5
- React 19
- InertiaJS 3
- TypeScript
- TailwindCSS 4
- MySQL
- Eloquent
- Vite

==================================================
GOAL PHASE 4
==================================================

Implementasikan fitur:

1. Detail transaksi
2. Tampilan struk transaksi
3. Cetak struk
4. Reprint/cetak ulang struk dari riwayat transaksi
5. Authorization transaksi berdasarkan role
6. Pastikan transaksi lama tetap dapat dibuka walaupun data produk berubah atau produk sudah soft-delete.

JANGAN melakukan rewrite terhadap POS yang sudah berjalan.

Gunakan arsitektur dan business logic existing.

==================================================
FITUR YANG TIDAK BOLEH DITAMBAHKAN
==================================================

JANGAN membuat fitur:

- Barcode
- Shift Kasir
- Customer
- Loyalty Point
- Promo
- Discount feature baru
- Multi Outlet
- Supplier
- Purchase Order

Fokus hanya pada Transaction Detail & Receipt.

==================================================
ATURAN WAJIB: PRESERVE EXISTING DATA
==================================================

INI SANGAT PENTING.

JANGAN PERNAH menjalankan:

- migrate:fresh
- migrate:refresh
- db:wipe
- database reset
- TRUNCATE
- DROP TABLE
- DELETE seluruh data
- mengganti database existing
- menghapus users
- menghapus products
- menghapus categories
- menghapus sales
- menghapus sale_items
- menghapus stock_movements

JANGAN mengubah data production/existing hanya untuk kebutuhan testing.

Testing harus menggunakan database testing yang terpisah apabila membutuhkan destructive test.

Data existing WAJIB dipertahankan:

- users
- products
- categories
- sales
- sale_items
- stock_movements
- settings
- seluruh histori transaksi

Jika menemukan risiko kehilangan data:
STOP implementasi dan laporkan terlebih dahulu.

==================================================

1. INSPECT ACTUAL DATABASE TERLEBIH DAHULU
   \==================================================

Sebelum mengubah kode, cek schema database AKTUAL.

Jangan hanya mengandalkan laporan schema.

Pastikan field aktual:

SALES:

- id
- transaction_number
- cashier_id
- payment_method
- subtotal
- discount
- tax
- grand_total
- paid_amount
- change_amount
- created_at
- updated_at
- status jika memang sudah ada

SALE_ITEMS:

- id
- sale_id
- product_id
- quantity
- price
- buy_price jika sudah ada
- subtotal
- field snapshot lain jika memang sudah tersedia

Perhatikan:

Phase 2.1 sebelumnya sudah menambahkan snapshot buy_price pada sale_items.

Jadi jangan membuat migration buy_price kedua jika field tersebut memang sudah ada.

================================================== 2. AUDIT SOURCE CODE TERKAIT
==================================================

Periksa:

- Sale.php
- SaleItem.php
- CheckoutService.php
- SaleController.php
- PosController.php
- routes/web.php
- halaman transaction history
- halaman POS
- migration sales
- migration sale_items

Trace alur:

POS
→ checkout
→ CheckoutService
→ sales
→ sale_items
→ stock_movements
→ transaction history

Pastikan implementasi Phase 4 menggunakan data yang benar-benar disimpan oleh checkout.

Jangan mengarang field baru hanya karena dibutuhkan UI.

================================================== 3. TRANSACTION DETAIL
==================================================

Tambahkan halaman:

/sales/{sale}

atau route setara yang mengikuti struktur existing.

Halaman detail harus menampilkan:

INFORMASI TRANSAKSI:

- Nomor transaksi
- Tanggal dan waktu
- Kasir
- Metode pembayaran

ITEM:

- Nama produk
- Harga jual saat transaksi
- Quantity
- Subtotal

RINGKASAN:

- Subtotal
- Discount jika memang digunakan existing
- Tax jika memang digunakan existing
- Grand Total
- Paid Amount
- Change Amount

Jika field tertentu memang tidak digunakan oleh CheckoutService,
jangan membuat business logic baru hanya untuk menampilkan field tersebut.

================================================== 4. HISTORICAL DATA SAFETY
==================================================

Detail transaksi HARUS tetap dapat dibuka meskipun:

- harga produk sekarang berubah
- harga beli produk sekarang berubah
- stock berubah
- produk sudah soft deleted

Untuk histori:

Harga transaksi harus menggunakan snapshot pada sale_items.

Profit/historical calculation tidak boleh membaca harga produk master saat ini.

Jika product sudah soft deleted, transaksi lama tetap harus dapat ditampilkan.

Jangan menghapus histori transaksi hanya karena product dihapus/soft-delete.

================================================== 5. RECEIPT
==================================================

Buat tampilan struk yang sederhana, profesional, dan cocok untuk toko.

Struk minimal berisi:

[NAMA TOKO]
[ALAMAT TOKO]

Nomor Transaksi
Tanggal/Waktu
Kasir
--------------------------------

Produk
Qty x Harga
Subtotal
--------------------------------

Subtotal
TOTAL
Bayar
Kembali
--------------------------------

Metode Pembayaran

Terima kasih karena telah berbelanja di [NAMA TOKO]

Nama toko harus mengambil dari existing settings jika memang settings sudah digunakan.

JIKA settings belum digunakan secara nyata:

- jangan membuat sistem settings besar baru
- gunakan fallback nama toko yang aman
- laporkan bahwa konfigurasi nama toko belum tersedia

================================================== 6. PRINT RECEIPT
==================================================

Tambahkan tombol:

"Cetak Struk"

Gunakan pendekatan browser print yang sederhana dan stabil.

Target utama:

- printer thermal 58mm/80mm
- browser print
- layout print-friendly

Gunakan CSS @media print jika sesuai dengan struktur frontend existing.

Saat print:

- sembunyikan sidebar
- sembunyikan navigation
- sembunyikan tombol
- tampilkan hanya receipt
- ukuran receipt sesuai kebutuhan thermal printer

Jangan menambahkan library printer yang kompleks jika tidak diperlukan.

================================================== 7. REPRINT
==================================================

Pada halaman Riwayat Transaksi:

Tambahkan action:

"Detail"

dan/atau:

"Cetak Struk"

User harus dapat membuka transaksi lama kemudian mencetak ulang struk.

Reprint harus membaca data transaksi existing.

Jangan membuat transaksi baru.

Jangan mengubah:

- stock
- omzet
- profit
- sale_items
- stock_movements

Reprint hanyalah READ operation.

================================================== 8. AUTHORIZATION
==================================================

Ikuti authorization Phase 2 yang sudah berjalan.

ADMIN:

- dapat melihat transaksi sesuai authorization existing
- dapat melihat detail transaksi
- dapat mencetak ulang struk

CASHIER:

- hanya dapat melihat transaksi yang memang diizinkan oleh sistem existing
- tidak boleh mengakses transaksi cashier lain jika policy existing memang membatasi transaksi miliknya

JANGAN membuka IDOR.

Contoh:

GET /sales/15

tidak boleh otomatis berarti user bebas melihat transaksi ID 15.

Authorization harus dilakukan server-side.

Jangan hanya menyembunyikan tombol di frontend.

================================================== 9. QUERY & PERFORMANCE
==================================================

Hindari N+1 query.

Gunakan eager loading yang diperlukan.

Contoh relasi:

- sale.cashier
- sale.items
- sale.items.product

Tetapi jangan eager load data yang tidak dibutuhkan.

Pastikan halaman detail menggunakan query yang efisien.

Jangan menggunakan:

Sale::all()

untuk kebutuhan detail satu transaksi.

Gunakan lookup berdasarkan ID dengan authorization.

================================================== 10. SOFT-DELETED PRODUCT
==================================================

Perhatikan bahwa products sekarang menggunakan SoftDeletes.

Jika sale_items.product sudah soft deleted:

detail transaksi tetap harus menampilkan item.

Jangan sampai:

$product->name

menjadi null hanya karena product sudah soft deleted.

Jika relasi existing membutuhkan withTrashed(), gunakan hanya pada konteks histori transaksi.

Jangan mengubah perilaku global Product relationship jika tidak diperlukan.

================================================== 11. TRANSACTION NUMBER
==================================================

Gunakan transaction_number existing:

POS-YYYYMMDD-XXXX

Jangan generate ulang transaction number ketika membuka detail atau mencetak struk.

Transaction number harus berasal dari sales.transaction_number.

================================================== 12. PAYMENT METHOD
==================================================

Gunakan payment_method yang benar-benar tersimpan.

Jangan mengarang mapping payment method baru.

Jika database existing masih memiliki legacy enum/payment method:

- tampilkan secara aman
- jangan merusak histori transaksi
- jangan mengubah data transaksi lama

Untuk QRIS:

Jangan membuat QRIS gateway atau webhook dalam Phase 4.

Fokus hanya pada menampilkan metode pembayaran yang tersimpan.

================================================== 13. DATABASE MIGRATION
==================================================

Jangan membuat migration jika fitur Phase 4 dapat dibuat menggunakan schema existing.

Migration hanya boleh dibuat jika benar-benar diperlukan.

Jika membutuhkan migration:

- jelaskan alasannya
- buat migration additive
- jangan destructive
- jangan menghapus kolom existing
- jangan mengubah histori transaksi

================================================== 14. UI/UX
==================================================

Gunakan desain yang konsisten dengan POS existing.

Gunakan TailwindCSS existing.

Jangan mengganti seluruh design system.

Detail transaksi harus mudah dibaca.

Prioritas:

- nomor transaksi jelas
- total jelas
- item jelas
- payment jelas
- tombol cetak mudah ditemukan

Responsive untuk desktop.

Tidak perlu animasi berlebihan.

================================================== 15. TESTING
==================================================

Buat/extend feature tests untuk:

1. Admin dapat membuka detail transaksi.
2. Cashier dapat membuka transaksi yang diizinkan.
3. Cashier tidak dapat IDOR membuka transaksi yang bukan miliknya.
4. Guest tidak dapat membuka detail transaksi.
5. Detail menampilkan transaction_number.
6. Detail menampilkan cashier.
7. Detail menampilkan payment method.
8. Detail menampilkan item transaksi.
9. Detail menggunakan harga snapshot transaksi.
10. Detail tetap bekerja ketika product sudah soft deleted.
11. Reprint tidak mengubah stock.
12. Reprint tidak membuat sale baru.
13. Reprint tidak membuat stock movement baru.
14. Existing checkout tetap PASS.
15. Existing authorization tetap PASS.
16. Existing dashboard/report tetap PASS.

Jalankan seluruh regression test yang relevan.

================================================== 16. REGRESSION CHECK
==================================================

Pastikan fitur existing tetap bekerja:

ADMIN:

- login
- dashboard
- products
- categories
- stocks
- stock movements
- reports

CASHIER:

- login
- POS
- checkout
- transaction history

Pastikan:

- stock tetap berkurang ketika checkout
- stock movement tetap tercatat
- buy_price snapshot tetap tersimpan
- profit dashboard tetap benar
- report tetap benar
- authorization tetap benar

================================================== 17. OUTPUT IMPLEMENTATION REPORT
==================================================

Setelah implementasi, berikan laporan:

A. Status
PASS / FAIL

B. Database Changes

- migration apa saja
- atau "No migration"

C. Backend Changes

- controller
- service
- model/policy jika ada
- routes

D. Frontend Changes

- halaman
- component
- receipt
- print CSS

E. Authorization

- Admin
- Cashier
- Guest

F. Testing

- jumlah test
- jumlah assertion
- failed test jika ada

G. Regression Test

- checkout
- stock
- reports
- dashboard
- transaction history

H. Data Preservation
Pastikan tidak ada:

- data deletion
- database reset
- destructive migration

I. Remaining Issues
Jika tidak ada:
"None"

==================================================
FINAL PRINCIPLE
==================================================

Jangan overengineering.

Jangan rewrite existing POS.

Jangan membuat fitur yang tidak diminta.

Gunakan existing architecture.

Gunakan existing CheckoutService.

Gunakan existing transaction data.

Historical transaction harus immutable dari sisi histori.

Receipt/reprint adalah READ operation.

Data existing adalah prioritas utama.

Jika ada ketidakpastian terhadap schema atau business logic:
INSPECT EXISTING CODE FIRST.
JANGAN GUESS.
