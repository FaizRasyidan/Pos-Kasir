# PHASE 2.1 — DATA INTEGRITY, STOCK MOVEMENT & ROLE ACCESS

## ROLE

Bertindak sebagai:

- Senior Laravel Developer
- Senior Backend Engineer
- Database Engineer
- Security Engineer
- Software Architect
- Code Reviewer

Kita sedang melanjutkan pengembangan aplikasi POS/Kasir Laravel yang sudah berjalan.

Pada Phase sebelumnya telah dilakukan audit dan implementasi beberapa perbaikan.

Namun setelah testing, ditemukan bahwa:

1. `sell_price`, `buy_price`, dan `stock_movements` belum terintegrasi dengan baik.
2. Pembagian akses Admin dan Kasir belum sesuai kebutuhan bisnis.
3. Admin masih dapat mengakses POS, padahal POS hanya boleh digunakan oleh Kasir.
4. Belum ada menu khusus untuk melihat histori `stock_movements`.

Phase ini bertujuan memperbaiki ketiga hal tersebut secara aman tanpa melakukan rewrite sistem.

---

# 1. KONDISI BISNIS YANG HARUS MENJADI ACUAN

Aplikasi ini memiliki dua role utama:

```text
ADMIN
KASIR
```

## ADMIN

Admin bertugas:

- memantau sistem
- mengevaluasi penjualan
- melihat laporan
- melihat transaksi
- mengelola produk
- mengelola kategori
- menambah stok
- mengurangi/koreksi stok
- melihat histori stock movement

### ADMIN TIDAK BOLEH:

- mengakses halaman POS
- menggunakan cart POS
- melakukan checkout
- membuat transaksi penjualan melalui endpoint POS

---

# 2. KASIR

Kasir bertugas menjalankan operasional penjualan.

Kasir boleh:

- mengakses POS
- memilih produk
- memasukkan produk ke cart
- melakukan pembayaran
- menggunakan Cash
- menggunakan QRIS
- melakukan checkout
- melihat transaksi sesuai kewenangan yang sudah ditentukan

Kasir tidak boleh:

- mengelola produk
- mengubah harga beli
- mengubah harga jual
- menambah/mengurangi stok secara manual
- mengelola kategori
- mengelola user
- mengakses pengaturan admin
- mengakses laporan admin jika memang route tersebut bersifat admin-only

---

# 3. ATURAN PALING PENTING

Jangan melakukan rewrite.

Pertahankan:

- Laravel 13.17
- React 19
- InertiaJS 3
- TailwindCSS 4
- TypeScript
- existing authentication
- existing POS
- existing cart
- existing checkout
- existing products
- existing categories
- existing sales
- existing sale_items
- existing stock_movements
- existing reports

Gunakan:

> EXTEND, DON'T REWRITE.

Jangan membuat sistem POS baru.

Jangan mengganti framework.

Jangan mengubah arsitektur menjadi framework lain.

---

# 4. AUDIT KONDISI PHASE SEBELUMNYA TERLEBIH DAHULU

Sebelum mengubah kode apa pun, periksa implementasi aktual Phase sebelumnya.

Cari:

- migration sale_items
- migration stock_movements
- Product model
- SaleItem model
- StockMovement model
- CheckoutService
- PosController
- ProductController
- SaleController
- ReportController
- routes
- middleware
- policy/gate jika ada
- React POS
- React Product Management
- React Report
- React navigation/sidebar

Periksa terutama:

```text
buy_price
sell_price / selling_price
price
subtotal
stock
stock_movements
```

Jangan berasumsi nama field.

Gunakan nama field yang benar-benar ditemukan di source code.

---

# 5. PERBAIKI INTEGRASI BUY PRICE & SELLING PRICE

Tujuan:

Setiap transaksi harus memiliki snapshot harga pada saat transaksi.

Struktur konsep:

```text
PRODUCT
--------------------
buy_price
selling_price
stock
```

Ketika transaksi terjadi:

```text
SALE_ITEM
--------------------
product_id
product_name
buy_price
selling_price / price
quantity
subtotal
```

Harga pada `sale_items` harus merupakan snapshot.

## Contoh

Saat transaksi:

```text
Harga beli  = 8.000
Harga jual  = 10.000
Qty         = 2
```

Sale item harus menyimpan:

```text
buy_price  = 8.000
price      = 10.000
quantity   = 2
subtotal   = 20.000
```

Kemudian jika product berubah:

```text
buy_price  = 9.000
price      = 12.000
```

transaksi lama tetap:

```text
buy_price = 8.000
price = 10.000
```

---

# 6. PERBAIKI PROFIT CALCULATION

Pastikan ReportController / query laporan TIDAK lagi menggunakan:

```text
sale_item → product → buy_price
```

untuk menghitung profit transaksi lama.

Gunakan snapshot:

```text
sale_items.buy_price
```

dan:

```text
sale_items.price
```

Formula:

```text
Profit =
(sale_items.price - sale_items.buy_price)
× quantity
```

Jika nama field aktual berbeda, gunakan field yang sesuai dengan database existing.

Pastikan tidak ada N+1 query pada laporan profit.

Gunakan query/database aggregation jika memungkinkan.

Jangan mengubah hasil laporan omzet yang saat ini sudah benar.

---

# 7. STOCK MOVEMENT HARUS MENJADI HISTORI PERUBAHAN STOK

Existing `stock_movements` harus digunakan sebagai sumber histori perubahan stok.

Jangan membuat tabel inventory baru jika tidak diperlukan.

Audit terlebih dahulu struktur `stock_movements` yang sekarang.

Tujuan akhirnya adalah setiap perubahan stok memiliki informasi yang cukup untuk menjawab:

> Kapan stok berubah?
> Produk apa?
> Perubahan karena apa?
> Berapa jumlahnya?
> Berapa stok sebelum perubahan?
> Berapa stok setelah perubahan?
> Berapa harga beli saat stok masuk?
> Berapa harga jual saat stok masuk?
> Siapa yang melakukan perubahan?

---

# 8. STOCK MOVEMENT UNTUK STOK MASUK

Ketika ADMIN menambahkan stok produk, sistem harus membuat stock movement.

Contoh:

Produk:

```text
Kopi
```

Sebelum:

```text
Stock = 10
```

Admin menambahkan:

```text
Stock masuk = 20
Harga beli = Rp8.000
Harga jual = Rp12.000
```

Maka:

```text
stock_before = 10
quantity = 20
stock_after = 30
```

dan histori mencatat:

```text
type = stock_in
buy_price = 8000
selling_price = 12000
quantity = 20
```

Jika field aktual menggunakan nama lain, sesuaikan dengan schema existing.

---

# 9. STOCK MOVEMENT UNTUK PENJUALAN

Ketika checkout berhasil:

```text
Sale
    ↓
SaleItem
    ↓
Stock berkurang
    ↓
StockMovement
```

Stock movement harus mencatat bahwa perubahan terjadi karena penjualan.

Contoh:

```text
stock_before = 30
quantity = -2
stock_after = 28
type = sale
```

Jika sistem existing menggunakan quantity positif dengan movement type untuk membedakan masuk/keluar, pertahankan pola tersebut.

Jangan mengubah pola existing tanpa alasan kuat.

---

# 10. HARGA PADA STOCK MOVEMENT

Untuk movement yang berkaitan dengan **stok masuk**, simpan snapshot:

```text
buy_price
selling_price
```

Tujuannya agar admin dapat mengetahui:

> "Pada tanggal tersebut saya memasukkan 20 unit produk dengan harga beli berapa dan harga jual berapa?"

Untuk movement akibat penjualan, jangan membuat harga beli/jual menjadi sumber utama perhitungan profit.

Sumber profit tetap:

```text
sale_items
```

Stock movement adalah histori perubahan stok.

---

# 11. STOCK BEFORE / AFTER

Jika belum ada, tambahkan:

```text
stock_before
stock_after
```

Tujuannya agar histori mudah diaudit.

Contoh:

```text
13 Sep
Produk A
Stock Before : 50
Stock In     : +20
Stock After  : 70
```

Kemudian:

```text
13 Sep
Produk A
Sale
Stock Before : 70
Stock Out    : -3
Stock After  : 67
```

---

# 12. USER YANG MELAKUKAN STOCK MOVEMENT

Jika belum ada:

```text
user_id
```

pada stock movement, tambahkan relasi ke user.

Tujuannya untuk mengetahui:

```text
Siapa yang melakukan perubahan stok?
```

Contoh:

```text
Admin
13 September 2026
Menambahkan 20 Kopi
```

Namun jangan menyimpan data user secara redundant.

Gunakan foreign key ke `users`.

---

# 13. STOCK MOVEMENT TYPE

Audit terlebih dahulu type yang sudah tersedia.

Minimal konsep yang perlu dapat dibedakan:

```text
stock_in
sale
adjustment_in
adjustment_out
```

Namun:

JANGAN langsung membuat enum baru jika sistem existing menggunakan string.

Gunakan pendekatan yang paling kompatibel dengan database existing.

Jika fitur adjustment belum ada, jangan membuat UI adjustment kompleks pada phase ini.

Yang penting:

- stok masuk
- stok keluar karena penjualan
- perubahan stok yang sudah existing

tetap dapat dibedakan.

---

# 14. MENU STOCK MOVEMENT

Tambahkan menu baru:

```text
Stock Movement
```

Menu ini berada di area:

```text
Produk & Inventory
```

Contoh struktur:

```text
Produk & Inventory
├── Produk
├── Kategori
├── Stok
└── Riwayat Stok
```

Nama menu boleh:

```text
Riwayat Stok
```

atau:

```text
Stock Movement
```

Pilih nama yang paling konsisten dengan UI existing.

---

# 15. HALAMAN STOCK MOVEMENT

Buat halaman yang konsisten dengan desain aplikasi sekarang.

Jangan membuat desain yang berbeda jauh.

Halaman harus menampilkan minimal:

| Tanggal | Produk | Tipe | Harga Beli | Harga Jual | Jumlah | Stok Sebelum | Stok Sesudah | User |
| ------- | ------ | ---- | ---------: | ---------: | -----: | -----------: | -----------: | ---- |

Contoh:

```text
13 Sep 2026
Kopi
Stock In
Rp8.000
Rp12.000
+20
10
30
Admin
```

---

# 16. FILTER STOCK MOVEMENT

Tambahkan filter yang sederhana dan berguna:

### Filter tanggal

```text
Dari
Sampai
```

### Filter produk

```text
Semua Produk
```

### Filter tipe

```text
Semua
Stock In
Sale
Adjustment
```

Jika adjustment belum tersedia, jangan tampilkan opsi palsu.

### Search

Jika mudah diterapkan:

```text
Cari produk...
```

---

# 17. PAGINATION

Jangan menggunakan:

```php
StockMovement::all()
```

untuk halaman histori.

Gunakan pagination.

Contoh konsep:

```text
latest()
paginate(15/20/25)
```

sesuaikan dengan pola existing.

Ini penting karena histori stock movement dapat berkembang sangat besar.

---

# 18. ADMIN TIDAK BOLEH MASUK POS

Ini adalah requirement utama.

Admin harus:

```text
/pos
```

→ ditolak.

Admin juga tidak boleh memanggil:

```text
POST /pos/checkout
```

secara langsung.

Jangan hanya menyembunyikan menu POS.

Authorization harus berada di server.

---

# 19. KASIR WAJIB BOLEH MASUK POS

Kasir harus tetap dapat:

```text
/pos
```

dan:

```text
POST /pos/checkout
```

Pastikan setelah perubahan authorization:

- product search tetap bekerja
- category filter tetap bekerja
- cart tetap bekerja
- Cash tetap bekerja
- QRIS tetap bekerja
- checkout tetap bekerja
- stock tetap berkurang
- sale tetap dibuat
- sale_item tetap dibuat
- stock movement tetap dibuat

---

# 20. NAVIGATION

Sesuaikan sidebar/navigation berdasarkan role.

### ADMIN

Tampilkan menu seperti:

```text
Dashboard

Penjualan
├── Riwayat Transaksi

Produk & Inventory
├── Produk
├── Kategori
├── Stok
└── Riwayat Stok

Laporan
├── Penjualan
├── Keuntungan
└── Produk Terlaris
```

Jika menu yang belum tersedia jangan dibuat hanya sebagai placeholder.

### KASIR

Tampilkan:

```text
POS
Riwayat Transaksi
```

Jika dashboard memang digunakan oleh kasir, pertahankan sesuai existing.

Kasir tidak perlu melihat menu:

```text
Produk
Kategori
Stok Management
Laporan Admin
User
Settings
Stock Movement Management
```

Tetapi jika ada menu yang memang sudah secara bisnis diperlukan oleh kasir, jangan menghapus tanpa alasan.

---

# 21. ADMIN = MONITORING & MANAGEMENT

Jadikan role Admin sesuai konsep bisnis berikut:

```text
ADMIN
=
Monitoring
+
Evaluation
+
Product Management
+
Stock Management
+
Reporting
```

Bukan operator kasir.

Sedangkan:

```text
KASIR
=
Sales Operation
+
Checkout
```

---

# 22. DATABASE MIGRATION

Jika audit menemukan bahwa migration memang diperlukan, buat migration secara aman.

Kemungkinan field yang dibutuhkan:

### sale_items

```text
buy_price
```

Jika belum ada.

### products

```text
deleted_at
```

Jika soft delete belum diterapkan.

### stock_movements

Kemungkinan:

```text
stock_before
stock_after
user_id
buy_price
selling_price
```

Namun:

JANGAN menambahkan kolom hanya berdasarkan prompt ini.

Periksa schema aktual terlebih dahulu.

Gunakan migration existing sebagai source of truth.

---

# 23. DATA LAMA

Ini sangat penting.

Jangan merusak transaksi lama.

Sebelum migration:

- periksa apakah sale_items lama sudah memiliki data
- periksa apakah stock_movements lama sudah memiliki data
- periksa apakah field baru nullable/default diperlukan untuk data lama

Jika migration membutuhkan backfill:

Jangan langsung mengarang nilai historis.

Laporkan terlebih dahulu bagaimana data lama harus ditangani.

---

# 24. SOFT DELETE

Jika `products.deleted_at` sudah dibuat pada Phase sebelumnya, pastikan:

- Product model menggunakan SoftDeletes
- produk yang dihapus tidak muncul pada POS
- produk lama tetap dapat direferensikan oleh histori transaksi
- sale_items lama tidak rusak
- stock_movements lama tidak rusak

Jangan menghapus data transaksi lama.

---

# 25. TEST WAJIB

Setelah implementasi, lakukan testing.

## TEST A — ADMIN

Login Admin.

Harus:

```text
Dashboard       ✅
Products        ✅
Categories      ✅
Stock           ✅
Stock Movement  ✅
Sales History   ✅
Reports         ✅
POS             ❌
Checkout        ❌
```

---

## TEST B — KASIR

Login Kasir.

Harus:

```text
POS             ✅
Checkout        ✅
Cash            ✅
QRIS            ✅
Sales History   sesuai authorization
Products        ❌
Categories      ❌
Stock Management ❌
Reports Admin   ❌
Stock Movement Management ❌
```

---

# 26. TEST STOCK IN

Contoh:

Initial:

```text
Stock = 10
```

Admin menambahkan:

```text
20
```

Expected:

```text
Product.stock = 30
```

dan stock movement:

```text
type = stock_in
quantity = 20
stock_before = 10
stock_after = 30
buy_price = harga beli saat masuk
selling_price = harga jual saat masuk
user_id = admin
```

---

# 27. TEST SALE

Stock:

```text
30
```

Kasir menjual:

```text
2
```

Expected:

```text
Product.stock = 28
```

Stock movement:

```text
type = sale
stock_before = 30
stock_after = 28
quantity = 2
```

dan sale_item memiliki snapshot:

```text
buy_price
price
quantity
subtotal
```

---

# 28. TEST PERUBAHAN HARGA

Transaksi pertama:

```text
Buy = 8.000
Sell = 10.000
```

Kemudian ubah product:

```text
Buy = 9.000
Sell = 12.000
```

Laporan transaksi lama harus tetap:

```text
Buy = 8.000
Sell = 10.000
```

Profit tidak boleh berubah.

---

# 29. TEST STOCK MOVEMENT HISTORY

Pastikan histori menampilkan:

```text
Tanggal
Produk
Type
Buy Price
Selling Price
Quantity
Stock Before
Stock After
User
```

dan urut:

```text
latest first
```

---

# 30. TEST SECURITY

Sebagai Admin coba akses:

```text
/pos
```

Expected:

```text
403 / redirect sesuai mekanisme aplikasi
```

Kemudian coba langsung:

```text
POST /pos/checkout
```

Expected:

```text DENIED

```

Sebagai Kasir coba:

```text
/products/create
/products/{id}/edit
/categories
/reports
```

Expected:

```text DENIED

```

sesuai authorization yang diterapkan.

---

# 31. JANGAN MENAMBAHKAN FITUR BERIKUT

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
- Customer Management

Jangan memperluas scope.

---

# 32. OUTPUT SEBELUM IMPLEMENTASI

Sebelum mengubah kode, tampilkan:

## IMPLEMENTATION PLAN

1. Masalah yang ditemukan
2. File yang akan diubah
3. Migration yang diperlukan
4. Field yang ditambahkan
5. Route yang diubah
6. Middleware/policy yang digunakan
7. Controller/service yang diubah
8. React component yang diubah
9. Risiko terhadap data lama
10. Cara testing

Setelah plan ditampilkan, lanjutkan implementasi.

---

# 33. OUTPUT SETELAH IMPLEMENTASI

Berikan:

# PHASE 2.1 IMPLEMENTATION REPORT

## A. Status

PASS / PARTIAL / FAILED

## B. Database Changes

| Table | Change | Migration | Status |
| ----- | ------ | --------- | ------ |

## C. Authorization Changes

### Admin

Daftar akses.

### Kasir

Daftar akses.

## D. Stock Movement

Jelaskan:

- stock in
- sale
- stock before
- stock after
- buy price
- selling price
- user

## E. Profit Calculation

Jelaskan sumber:

```text
sale_items.buy_price
sale_items.price
```

dan pastikan bukan lagi:

```text
product.buy_price
```

untuk histori.

## F. Files Changed

Daftar seluruh file.

## G. Tests

Tampilkan hasil setiap test.

## H. Existing Features

Pastikan:

- POS kasir tetap berjalan
- checkout tetap berjalan
- Cash tetap berjalan
- QRIS tetap berjalan
- stock tetap berjalan
- transaksi tetap berjalan
- laporan tetap berjalan

## I. Remaining Issues

Hanya laporkan masalah yang belum diperbaiki.

Jangan otomatis melanjutkan ke phase berikutnya.

---

# FINAL RULE

Kerjakan hanya scope Phase 2.1 ini.

Jangan melakukan rewrite.

Jangan menghapus data.

Jangan mengubah data transaksi lama secara sembarangan.

Jangan membuat fitur di luar scope.

Jangan membuat Admin dapat menggunakan POS.

POS DAN CHECKOUT HANYA UNTUK KASIR.

Setelah selesai, berhenti dan berikan implementation report.
