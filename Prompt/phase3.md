# PHASE 3 — DASHBOARD ADMIN & ANALYTICS

## ROLE

Bertindak sebagai:

- Senior Full Stack Laravel Developer
- Senior Backend Engineer
- Database Engineer
- UI/UX Designer
- Data/Analytics Engineer
- Security Engineer
- Code Reviewer

Kita melanjutkan pengembangan aplikasi POS setelah:

- PHASE 2
- PHASE 2.1
- PHASE 2.2

seluruhnya berhasil dengan status PASS.

---

# 1. KONDISI SISTEM SAAT INI

Sistem memiliki dua role:

```text
ADMIN
KASIR
```

## ADMIN

Digunakan untuk:

- monitoring
- evaluasi
- manajemen produk
- manajemen stok
- melihat transaksi
- laporan
- stock movement

Admin TIDAK BOLEH:

```text
/pos
POST /pos/checkout
```

## KASIR

Digunakan untuk:

- POS
- checkout
- penjualan
- riwayat transaksi sesuai kewenangan

Jangan mengubah aturan authorization yang sudah PASS.

---

# 2. FITUR YANG SUDAH BERJALAN

Pertahankan seluruh fitur berikut:

- Product Management
- Category Management
- Stock Management
- Stock In
- Stock Adjustment Out
- Stock Movement
- POS
- Cash Payment
- QRIS Payment
- Checkout
- Sales
- Sale Items
- Profit Calculation
- Sales Reports
- Transaction History
- Authentication
- Admin/Kasir Authorization

Jangan rewrite.

Gunakan prinsip:

> EXTEND, DON'T REWRITE.

---

# 3. TUJUAN PHASE 3

Meningkatkan Dashboard Admin menjadi pusat monitoring kondisi toko.

Dashboard harus membantu Admin menjawab:

> Bagaimana kondisi penjualan toko hari ini?

> Berapa omzet hari ini?

> Berapa keuntungan hari ini?

> Berapa transaksi hari ini?

> Bagaimana performa penjualan beberapa hari terakhir?

> Produk apa yang stoknya menipis?

> Produk apa yang sudah habis?

> Produk apa yang paling banyak terjual?

> Apa transaksi terbaru?

> Apa aktivitas stok terbaru?

---

# 4. SCOPE

Fokus hanya pada:

## DASHBOARD ADMIN

Jangan membuat:

- Barcode
- Shift Kasir
- Customer
- Loyalty Point
- Promo
- Diskon
- Multi Outlet
- Supplier
- Purchase Order

Jangan membuat fitur di luar dashboard.

---

# 5. DASHBOARD ADMIN

Dashboard Admin minimal memiliki:

## A. Omzet Hari Ini

Gunakan data `sales`.

Konsep:

```text
Omzet Hari Ini
=
SUM(grand_total)
```

hanya dari transaksi yang valid sesuai business logic existing.

Jangan membuat formula omzet baru yang berbeda dengan ReportController.

---

# 6. KEUNTUNGAN HARI INI

Gunakan snapshot pada `sale_items`.

Formula:

```text
Profit =
(price - buy_price) × quantity
```

Gunakan:

```text
sale_items.price
sale_items.buy_price
sale_items.quantity
```

JANGAN menggunakan:

```text
products.buy_price
```

untuk histori transaksi.

Pastikan transaksi lama tidak berubah ketika harga master produk berubah.

Gunakan query aggregation jika memungkinkan.

Jangan membuat loop N+1.

---

# 7. TOTAL TRANSAKSI HARI INI

Tampilkan jumlah transaksi hari ini.

Gunakan query yang konsisten dengan ReportController.

Jika terdapat status transaksi:

gunakan status valid sesuai business logic existing.

Jangan menghitung transaksi yang seharusnya tidak dianggap sebagai penjualan.

---

# 8. RATA-RATA TRANSAKSI

Tambahkan:

```text
Average Transaction
```

Formula:

```text
Total Omzet / Total Transaksi
```

Jika transaksi = 0:

jangan menghasilkan error atau division by zero.

Tampilkan:

```text
Rp0
```

---

# 9. PERBANDINGAN HARI INI VS KEMARIN

Jika tidak menyebabkan query berlebihan, tambahkan indikator:

```text
Omzet hari ini
vs
Omzet kemarin
```

Contoh:

```text
Rp500.000
↑ 12,5%
```

atau:

```text
Rp500.000
↓ 8,2%
```

Gunakan data yang sama dengan laporan.

Jika kemarin = 0, tangani secara aman dan jangan menghasilkan:

```text
NaN
Infinity
```

---

# 10. GRAFIK PENJUALAN

Tambahkan grafik sederhana:

```text
Penjualan 7 Hari Terakhir
```

Data:

```text
Tanggal
Omzet
```

Contoh:

```text
08 Sep   Rp200.000
09 Sep   Rp350.000
10 Sep   Rp275.000
11 Sep   Rp410.000
12 Sep   Rp300.000
13 Sep   Rp500.000
```

Gunakan library chart yang sudah tersedia di project jika ada.

Jangan menambahkan dependency baru jika tidak diperlukan.

Jika belum ada chart library:

gunakan solusi paling sederhana yang konsisten dengan stack existing.

---

# 11. STOK MENIPIS

Dashboard Admin harus menampilkan daftar:

```text
Stok Menipis
```

Gunakan threshold yang sudah tersedia jika ada.

Jika belum ada threshold khusus:

gunakan definisi sederhana yang konsisten dengan halaman `/stocks`.

Jangan membuat sistem konfigurasi threshold yang kompleks pada phase ini.

Contoh:

```text
Produk        Stok
Kopi          3
Teh           2
Gula          4
```

---

# 12. PRODUK HABIS

Tampilkan produk dengan:

```text
stock = 0
```

Contoh:

```text
Produk Habis

Kopi Arabica
Teh Hijau
Susu
```

Produk soft deleted tidak boleh muncul sebagai produk aktif.

---

# 13. PRODUK TERLARIS

Tambahkan:

```text
Produk Terlaris
```

Gunakan `sale_items.quantity`.

Hitung berdasarkan periode:

```text
7 hari terakhir
```

atau periode yang paling konsisten dengan dashboard.

Minimal tampilkan:

```text
Produk
Jumlah Terjual
```

Contoh:

```text
Kopi       32
Teh        25
Gula       18
```

Jangan menggunakan `products.stock` untuk menentukan produk terlaris.

---

# 14. TRANSAKSI TERBARU

Tambahkan bagian:

```text
Transaksi Terbaru
```

Tampilkan beberapa transaksi terakhir.

Minimal:

```text
No. Transaksi
Waktu
Kasir
Metode Pembayaran
Total
```

Gunakan pagination hanya jika diperlukan.

Untuk dashboard cukup tampilkan jumlah terbatas, misalnya 5 transaksi terbaru.

Jangan mengambil seluruh data transaksi.

---

# 15. STOCK MOVEMENT TERBARU

Tambahkan:

```text
Aktivitas Stok Terbaru
```

Tampilkan beberapa movement terakhir.

Minimal:

```text
Tanggal
Produk
Aktivitas
Jumlah
User
```

Contoh:

```text
13 Sep
Kopi
Purchase
+20
Admin

13 Sep
Teh
Sale
-2
Kasir
```

Gunakan `stock_movements`.

Jangan mengambil seluruh histori.

---

# 16. ADMIN ONLY

Dashboard analytics ini hanya untuk Admin.

Pastikan:

```text
Admin → Dashboard Admin → ALLOWED
Kasir → Dashboard Analytics Admin → DENIED
```

Namun jika `/dashboard` saat ini digunakan oleh Kasir untuk monitoring stok aktif dan memang sudah dibutuhkan, jangan merusak akses tersebut.

Dalam kondisi tersebut:

buat dashboard yang menyesuaikan role atau pertahankan dashboard kasir existing.

Jangan menghapus fungsi monitoring kasir yang sudah ada tanpa alasan.

---

# 17. DATA CONSISTENCY

Sangat penting:

Dashboard tidak boleh memiliki formula berbeda dengan Reports.

Gunakan source of truth yang sama.

## OMZET

```text
sales.grand_total
```

## PROFIT

```text
sale_items.price
-
sale_items.buy_price
```

dikali:

```text
quantity
```

## TRANSAKSI

```text
sales
```

## PRODUK TERLARIS

```text
sale_items.quantity
```

## STOK

```text
products.stock
```

## STOCK MOVEMENT

```text
stock_movements
```

---

# 18. PERFORMANCE

Dashboard dipanggil sangat sering.

Jangan menggunakan:

```text
Model::all()
```

untuk menghitung dashboard.

Hindari:

```text
foreach sale
    foreach sale_item
```

untuk data yang dapat dihitung menggunakan SQL aggregation.

Gunakan:

- SUM
- COUNT
- AVG
- GROUP BY
- ORDER BY
- LIMIT

sesuai kebutuhan.

Hindari N+1 query.

---

# 19. QUERY EFFICIENCY

Target:

Dashboard tidak melakukan query yang tidak diperlukan.

Untuk:

### Omzet

Gunakan aggregation.

### Profit

Gunakan aggregation.

### Transaction Count

Gunakan COUNT.

### Average Transaction

Gunakan AVG atau pembagian aggregate yang sesuai.

### Top Products

Gunakan GROUP BY.

### Recent Transactions

Gunakan LIMIT.

### Recent Stock Movements

Gunakan LIMIT.

---

# 20. UI/UX

Pertahankan desain visual existing.

Gunakan:

- card
- spacing
- typography
- border
- icon
- table
- badge

yang sudah digunakan aplikasi.

Jangan membuat dashboard seperti template admin baru yang berbeda dari sistem existing.

Gunakan bahasa Indonesia.

Contoh:

```text
Omzet Hari Ini
Keuntungan Hari Ini
Total Transaksi
Rata-rata Transaksi
Penjualan 7 Hari
Stok Menipis
Produk Habis
Produk Terlaris
Transaksi Terbaru
Aktivitas Stok Terbaru
```

---

# 21. RESPONSIVE

Pastikan dashboard tetap nyaman pada:

- Desktop
- Laptop
- Tablet

Tidak perlu membuat mobile-first redesign besar.

Pertahankan struktur responsive existing.

---

# 22. SOFT DELETE

Pastikan produk dengan:

```text
deleted_at IS NOT NULL
```

tidak muncul dalam:

- stok aktif
- produk terlaris
- daftar produk habis
- daftar stok menipis

kecuali memang dibutuhkan untuk histori.

---

# 23. TRANSACTION STATUS

Jika `sales.status` sudah tersedia:

gunakan status tersebut secara konsisten.

Jangan membuat status baru.

Jangan mengubah status transaksi lama.

Jika status belum benar-benar digunakan pada sistem existing, jangan memaksakan perubahan business logic pada phase ini.

---

# 24. SECURITY

Pastikan Dashboard Admin tidak dapat diakses Kasir jika dashboard tersebut berisi data keuangan/admin.

Jangan hanya menyembunyikan menu.

Authorization harus server-side.

---

# 25. TEST CASE

Wajib membuat atau memperbarui automated test.

## Test 1

Admin dapat membuka dashboard.

## Test 2

Kasir tidak dapat mengakses dashboard admin analytics jika memang route tersebut admin-only.

## Test 3

Omzet hari ini benar.

## Test 4

Profit menggunakan:

```text
sale_items.buy_price
```

bukan:

```text
products.buy_price
```

## Test 5

Transaction count benar.

## Test 6

Average transaction tidak error ketika transaksi = 0.

## Test 7

Top products berdasarkan quantity.

## Test 8

Produk stock = 0 muncul pada produk habis.

## Test 9

Produk soft deleted tidak muncul sebagai produk aktif.

## Test 10

Recent transactions hanya mengambil data terbatas.

## Test 11

Recent stock movements hanya mengambil data terbatas.

---

# 26. REGRESSION TEST

Pastikan tidak merusak:

- Login
- Admin authorization
- Cashier authorization
- POS
- Checkout
- Cash
- QRIS
- Products
- Categories
- Stock Management
- Stock Movement
- Sales
- Sale Items
- Profit Report
- Sales Report
- Transaction History

---

# 27. JANGAN MENGUBAH CORE POS

Jangan mengubah:

```text
CheckoutService
```

kecuali benar-benar diperlukan.

Jangan mengubah:

- perhitungan checkout
- stock locking
- stock decrement
- payment
- sale creation
- sale item creation

Dashboard hanya membaca data.

---

# 28. MIGRATION

Jangan membuat migration baru jika Dashboard dapat dibuat menggunakan database existing.

Prioritas:

> READ EXISTING DATA.

Jangan menambah tabel hanya untuk Dashboard.

Jangan menambah kolom hanya untuk statistik jika data tersebut sudah tersedia.

---

# 29. OUTPUT SEBELUM IMPLEMENTASI

Sebelum coding, tampilkan:

## IMPLEMENTATION PLAN

1. File yang akan diubah
2. Controller yang digunakan
3. Query yang akan digunakan
4. React page/component yang diubah
5. Route yang digunakan
6. Authorization
7. Apakah migration diperlukan
8. Risiko terhadap existing system

Kemudian lanjutkan implementasi.

---

# 30. OUTPUT SETELAH IMPLEMENTASI

Berikan:

# PHASE 3 IMPLEMENTATION REPORT

## A. Status

PASS / PARTIAL / FAILED

## B. Dashboard Features

Jelaskan:

- omzet
- profit
- transaksi
- average transaction
- comparison
- sales chart
- low stock
- out of stock
- top products
- recent transactions
- recent stock movements

## C. Query & Performance

Jelaskan apakah menggunakan:

- aggregation
- GROUP BY
- LIMIT
- pagination
- eager loading

dan apakah ada N+1.

## D. Authorization

### Admin

Akses apa saja.

### Kasir

Akses apa saja.

## E. Database Changes

| Table | Change | Migration | Status |
| ----- | ------ | --------- | ------ |

## F. Files Changed

Daftar file.

## G. Automated Tests

Tampilkan:

```text
Passed:
Failed:
Assertions:
```

## H. Regression Test

Pastikan seluruh existing feature tetap berjalan.

## I. Remaining Issues

Jika ada, laporkan.

Jangan otomatis memperbaiki masalah di luar scope.

---

# FINAL RULE

Fokus hanya pada:

> ADMIN DASHBOARD & ANALYTICS

Jangan menambahkan:

- Barcode
- Shift Kasir
- Customer
- Loyalty Point
- Promo
- Diskon
- Multi Outlet
- Supplier
- Purchase Order

Jangan rewrite.

Jangan membuat tabel baru jika tidak diperlukan.

Jangan mengubah transaksi lama.

Jangan mengubah core checkout.

Jangan mengubah authorization yang sudah PASS.

POS DAN CHECKOUT TETAP HANYA UNTUK KASIR.

Setelah selesai, berhenti dan berikan implementation report.
