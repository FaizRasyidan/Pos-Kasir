PHASE 5 — ADVANCED SALES & PRODUCT ANALYTICS

PROJECT:
POS-Kasir

STATUS:
Phase 1 PASS
Phase 2.1 PASS
Phase 2.2 PASS
Phase 3 PASS
Phase 4 PASS

Phase 4 telah menyelesaikan:

- Transaction Detail
- Receipt
- Reprint Receipt
- Authorization
- Historical transaction safety
- Soft-deleted product support

==================================================
GOAL PHASE 5
==================================================

Tingkatkan modul Reports menjadi Advanced Sales & Product Analytics.

Tujuan utama:

1. Analisis omzet
2. Analisis keuntungan
3. Analisis jumlah transaksi
4. Analisis produk terlaris
5. Analisis produk paling menghasilkan keuntungan
6. Tren penjualan berdasarkan periode
7. Ringkasan performa produk
8. Filter laporan yang lebih berguna
9. Export laporan jika dapat dilakukan tanpa kompleksitas berlebihan

Gunakan DATA EXISTING.

Jangan membuat sistem transaksi baru.

==================================================
FITUR YANG TIDAK BOLEH DITAMBAHKAN
==================================================

JANGAN membuat:

- Barcode
- Shift Kasir
- Customer
- Loyalty Point
- Promo
- Discount feature baru
- Multi Outlet
- Supplier
- Purchase Order
- Transaction Cancellation
- Refund
- Return System

Jangan memasukkan fitur di atas ke dalam Phase 5.

==================================================
DATA SOURCE
==================================================

Gunakan:

sales
sale_items
products
categories
users
stock_movements

Gunakan snapshot histori yang sudah tersedia.

Untuk profit:

profit item harus berdasarkan:

(price - buy_price) * quantity

Gunakan sale_items.buy_price jika field tersebut sudah tersedia.

JANGAN mengambil historical buy_price dari products.buy_price.

Harga master product dapat berubah sewaktu-waktu.

Historical report harus tetap konsisten.

==================================================

1. REPORT DASHBOARD
   \==================================================

Perbaiki halaman Reports existing tanpa merusak tampilan/fungsi yang sudah ada.

Minimal tampilkan:

- Total Omzet
- Total Profit
- Total Transaksi
- Rata-rata Nilai Transaksi
- Total Item Terjual

Gunakan periode yang dipilih user.

Default:

7 hari terakhir

Jika existing report sudah memiliki default periode lain,
pertahankan behavior existing kecuali ada alasan kuat.

================================================== 2. SALES TREND
==================================================

Tambahkan grafik penjualan berdasarkan tanggal.

Minimal:

- Omzet per hari
- Profit per hari
- Jumlah transaksi per hari

Gunakan GROUP BY tanggal.

Jangan melakukan query satu kali per tanggal.

Hindari N+1.

Gunakan SQL aggregation.

Jika periode panjang dipilih, grafik harus tetap readable.

================================================== 3. TOP SELLING PRODUCTS
==================================================

Tambahkan section:

"Produk Terlaris"

Ranking berdasarkan:

SUM(sale_items.quantity)

Minimal tampilkan:

- Ranking
- Produk
- Kategori
- Quantity terjual
- Omzet
- Profit

Default:

Top 10

Jangan mengambil semua produk lalu menghitung ranking menggunakan PHP jika database dapat melakukan aggregation.

Gunakan:

SUM()
GROUP BY
ORDER BY
LIMIT

================================================== 4. MOST PROFITABLE PRODUCTS
==================================================

Tambahkan section:

"Produk dengan Keuntungan Terbesar"

Ranking berdasarkan:

SUM(
(sale_items.price - sale_items.buy_price) * sale_items.quantity
)

Minimal:

- Produk
- Quantity
- Omzet
- Profit

Default:

Top 10.

Historical profit harus menggunakan snapshot buy_price.

================================================== 5. CATEGORY PERFORMANCE
==================================================

Jika relasi category tersedia dengan aman,
tambahkan:

"Performa Kategori"

Tampilkan:

- Kategori
- Quantity terjual
- Omzet
- Profit

Gunakan aggregation.

Jangan membuat tabel kategori baru.

Jika category product sudah soft-deleted atau relasi tidak tersedia,
gunakan pendekatan yang aman tanpa merusak historical report.

================================================== 6. DATE FILTER
==================================================

Report harus mendukung:

- Hari ini
- Kemarin
- 7 hari terakhir
- 30 hari terakhir
- Custom date range

Jika date filter existing sudah tersedia,
pertahankan dan tingkatkan tanpa menghilangkan behavior lama.

Gunakan server-side filtering.

Jangan hanya melakukan filter data di frontend.

================================================== 7. CASHIER PERFORMANCE
==================================================

Jika authorization dan kebutuhan existing memungkinkan,
tambahkan ringkasan:

"Performa Kasir"

Minimal:

- Nama kasir
- Jumlah transaksi
- Omzet
- Rata-rata transaksi

Gunakan data sales.cashier_id.

Admin dapat melihat data sesuai authorization.

Jangan memberikan akses data kasir kepada cashier lain.

Cashier tidak boleh mendapatkan akses ke admin analytics hanya karena endpoint report tersedia.

================================================== 8. LOW STOCK CROSS-CHECK
==================================================

Jika masih relevan dengan halaman Reports,
boleh tambahkan ringkasan:

- Produk stok menipis
- Produk habis

Gunakan threshold existing.

JANGAN membuat threshold baru jika project sudah memiliki threshold.

Pastikan threshold sama dengan halaman Stocks dan Dashboard.

================================================== 9. EXPORT REPORT
==================================================

Evaluasi apakah export report dapat ditambahkan dengan pendekatan sederhana.

Jika implementasi existing memungkinkan:

Tambahkan:

"Export Excel"

atau

"Export CSV"

Prioritas:

CSV jika Excel membutuhkan dependency besar.

Export minimal berisi:

- Tanggal
- Nomor transaksi
- Kasir
- Produk
- Quantity
- Harga jual
- Harga beli snapshot
- Subtotal
- Profit

Jangan membuat library besar jika tidak diperlukan.

Jika export membutuhkan perubahan arsitektur besar:
JANGAN dipaksakan.

Laporkan sebagai optional/future improvement.

================================================== 10. PERFORMANCE
==================================================

WAJIB memperhatikan performa.

Jangan:

- mengambil seluruh sales ke PHP
- mengambil seluruh sale_items ke PHP
- melakukan loop query per product
- melakukan query per tanggal
- N+1 relationship

Gunakan database aggregation:

SUM
COUNT
AVG
GROUP BY
ORDER BY
LIMIT

Gunakan eager loading hanya jika memang dibutuhkan.

Untuk laporan ranking produk,
utamakan SQL aggregation.

================================================== 11. HISTORICAL DATA
==================================================

Historical report harus tetap konsisten.

Contoh:

Produk A:

Saat transaksi:
buy_price = 50.000
selling price = 70.000

Kemudian master product berubah:

buy_price = 60.000

Profit transaksi lama HARUS tetap:

20.000

Jangan menggunakan products.buy_price untuk menghitung ulang histori.

================================================== 12. SOFT DELETED PRODUCTS
==================================================

Products menggunakan SoftDeletes.

Historical sales tidak boleh hilang karena product soft-deleted.

Pastikan:

- laporan transaksi lama tetap muncul
- top products tidak error
- profit tetap dapat dihitung
- detail transaksi tetap dapat dibuka

Jika nama product tidak tersedia karena soft-delete,
gunakan fallback yang aman.

Jangan menghapus sale_items.

================================================== 13. REPORT CONSISTENCY
==================================================

Angka pada:

Dashboard
Reports
Transaction Detail

harus konsisten.

Contoh:

Jika Dashboard menampilkan omzet hari ini:

Rp X

maka Reports dengan periode "Hari Ini"
harus menghasilkan angka yang sama.

Jika terdapat perbedaan:
telusuri source query terlebih dahulu.

Jangan membuat dua definisi omzet/profit yang berbeda.

================================================== 14. TRANSACTION VALIDITY
==================================================

Periksa status transaksi yang tersedia pada sales.

Jika terdapat status transaksi:

Gunakan status yang benar untuk menentukan transaksi yang dihitung.

Jangan mengarang status baru.

Jangan mengubah status existing.

Jika semua transaksi existing memang selalu valid
dan tidak ada status yang digunakan,
pertahankan behavior existing.

================================================== 15. AUTHORIZATION
==================================================

ADMIN:

Boleh:

- melihat Reports
- melihat analytics
- melihat performa produk
- melihat performa kategori
- melihat performa kasir

CASHIER:

Jangan membuka admin analytics jika authorization existing memang melarangnya.

Jangan hanya menyembunyikan menu frontend.

Authorization harus server-side.

================================================== 16. UI/UX
==================================================

Gunakan UI existing.

Jangan redesign seluruh aplikasi.

Gunakan:

- Card
- Table
- Chart
- Filter
- Badge

Tampilkan informasi dengan hierarki yang jelas.

Prioritaskan:

1. KPI
2. Sales trend
3. Top products
4. Profit products
5. Category performance
6. Cashier performance

Responsive desktop.

================================================== 17. DATABASE
==================================================

Prioritas:

NO MIGRATION.

Gunakan schema existing.

Jika index tambahan benar-benar dibutuhkan untuk performance,
jangan langsung membuat migration.

Evaluasi terlebih dahulu.

Jika migration diperlukan:

- additive
- non-destructive
- jelaskan alasannya
- jangan menghapus data
- jangan mengubah historical records

================================================== 18. TESTING
==================================================

Buat/extend tests untuk:

1. Admin dapat mengakses Reports.
2. Cashier tidak dapat mengakses admin analytics.
3. Total omzet benar.
4. Total profit benar.
5. Total transaksi benar.
6. Average transaction benar.
7. Total item terjual benar.
8. Top products benar.
9. Most profitable products benar.
10. Category performance benar jika digunakan.
11. Cashier performance benar jika digunakan.
12. Date filter benar.
13. Historical buy_price digunakan.
14. Perubahan product.buy_price tidak mengubah historical profit.
15. Soft-deleted product tidak merusak report.
16. Tidak terjadi N+1 pada query utama.
17. Existing checkout tetap PASS.
18. Existing dashboard tetap PASS.
19. Existing transaction history tetap PASS.
20. Existing receipt tetap PASS.

================================================== 19. DATA PRESERVATION
==================================================

WAJIB:

JANGAN menjalankan:

- migrate:fresh
- migrate:refresh
- db:wipe
- TRUNCATE
- DROP
- database reset
- delete existing sales
- delete existing sale_items
- delete products
- delete users
- overwrite existing database

Testing destructive harus menggunakan testing database terpisah.

Jika ada risiko kehilangan data:

STOP.

Laporkan risiko terlebih dahulu.

================================================== 20. FINAL VERIFICATION
==================================================

Setelah selesai:

- npm run build
- jalankan feature tests
- jalankan regression tests
- cek authorization
- cek report numbers
- cek historical profit
- cek soft-deleted products
- cek dashboard/report consistency

================================================== 21. IMPLEMENTATION REPORT
==================================================

Berikan:

A. Status
PASS / FAIL

B. Database Changes

C. Backend Changes

D. Frontend Changes

E. Reports Added

F. Query & Performance

G. Authorization

H. Testing

- test passed
- test failed
- assertions

I. Regression Check

J. Data Preservation

K. Remaining Issues

Jika tidak ada:

None

==================================================
FINAL PRINCIPLE
==================================================

Phase 5 adalah peningkatan ANALYTICS,
bukan penambahan sistem transaksi baru.

Jangan membuat fitur cancellation.
Jangan membuat refund.
Jangan membuat return.

Jangan rewrite POS.

Gunakan existing database.

Gunakan existing CheckoutService.

Gunakan snapshot harga histori.

Jaga authorization.

Jaga performance.

Jaga seluruh data existing.

Jangan overengineering.
