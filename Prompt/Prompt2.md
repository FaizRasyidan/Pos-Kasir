# AUDIT DATABASE & TRANSACTION BUSINESS LOGIC — READ ONLY

## ROLE

Bertindak sebagai:

- Senior Full Stack Laravel Developer
- Software Architect
- Database Architect
- Backend Engineer
- Code Reviewer

Saya sedang mengembangkan aplikasi **POS/Kasir berbasis Laravel** yang sudah memiliki fitur dan kode yang berjalan.

Pada tahap ini saya **TIDAK ingin kamu mengubah kode apa pun**.

Tugasmu hanya melakukan **deep audit terhadap database, model, service, controller, dan alur transaksi** untuk mengetahui kondisi sistem yang sebenarnya sebelum kita menentukan migration atau pengembangan berikutnya.

---

# 1. KONDISI SISTEM SAAT INI

Berdasarkan audit awal, aplikasi menggunakan:

- Laravel 13.17
- PHP 8.5
- React 19
- InertiaJS 3.0
- TailwindCSS 4
- TypeScript
- Vite
- MySQL
- Eloquent ORM

Tabel yang teridentifikasi:

- users
- categories
- products
- sales
- sale_items
- stock_movements
- settings
- passkeys
- cache
- jobs

Model yang teridentifikasi:

- User
- Category
- Product
- Sale
- SaleItem
- StockMovement
- Setting

Service yang teridentifikasi:

- CheckoutService

Controller yang teridentifikasi:

- DashboardController
- PosController
- ProductController
- CategoryController
- SaleController
- ReportController

---

# 2. ATURAN PALING PENTING

## JANGAN MENGUBAH APA PUN

Selama audit:

- Jangan membuat migration
- Jangan mengubah migration
- Jangan mengubah database
- Jangan mengubah model
- Jangan mengubah controller
- Jangan mengubah service
- Jangan mengubah route
- Jangan mengubah React component
- Jangan mengubah UI
- Jangan melakukan refactoring
- Jangan melakukan auto-fix
- Jangan menjalankan command yang memodifikasi data
- Jangan menghapus file
- Jangan membuat fitur baru

Gunakan mode:

**READ ONLY / AUDIT ONLY**

Jika menemukan masalah, cukup laporkan.

Jangan langsung memperbaikinya.

---

# 3. AUDIT DATABASE SECARA DETAIL

Periksa seluruh migration yang berkaitan dengan POS.

Untuk setiap tabel berikut:

- users
- categories
- products
- sales
- sale_items
- stock_movements
- settings

identifikasi:

1. Nama kolom
2. Tipe data
3. Nullable / NOT NULL
4. Default value
5. Primary key
6. Foreign key
7. Unique constraint
8. Index
9. Enum/status yang digunakan
10. onDelete / onUpdate
11. timestamps
12. Soft delete jika ada

Buat tabel audit seperti:

| Table | Column | Type | Nullable | Default | Key/Index | Foreign Key | Keterangan |
| ----- | ------ | ---- | -------- | ------- | --------- | ----------- | ---------- |

Jangan menyimpulkan berdasarkan asumsi.

Gunakan kondisi yang benar-benar ditemukan di source code.

---

# 4. AUDIT RELASI DATABASE

Periksa relasi antara:

### User → Sale

Pastikan bagaimana:

- cashier_id
- user_id
- role

digunakan.

### Category → Product

Pastikan:

- foreign key
- relationship Eloquent
- behavior ketika kategori dihapus

### Sale → SaleItem

Pastikan:

- foreign key
- cascade behavior
- hubungan header-detail transaksi

### Product → SaleItem

Pastikan hubungan produk dengan transaksi.

### Product → StockMovement

Pastikan bagaimana histori perubahan stok disimpan.

Laporkan apakah terdapat potensi:

- orphan record
- foreign key inconsistency
- data transaksi kehilangan referensi produk
- penghapusan produk yang merusak histori transaksi

---

# 5. AUDIT STRUKTUR SALES

Periksa tabel `sales` secara sangat detail.

Cari dan jelaskan:

- transaction_number
- cashier_id
- payment_method
- payment_amount
- change
- subtotal
- grand_total
- status
- created_at
- updated_at
- kolom lain yang berkaitan dengan transaksi

Untuk setiap field jelaskan:

> Apakah field tersebut benar-benar digunakan oleh sistem atau hanya tersedia tetapi belum digunakan?

Periksa juga:

### Transaction Number

- Bagaimana nomor transaksi dibuat?
- Apakah unik?
- Apakah memiliki unique index?
- Apakah ada kemungkinan duplicate?
- Apakah generation dilakukan server-side?
- Apakah ada risiko race condition?

---

# 6. AUDIT SALE_ITEMS

Periksa tabel `sale_items`.

Pastikan apakah setiap item transaksi menyimpan snapshot:

- product_id
- product_name
- purchase_price / buy_price
- selling_price / price
- quantity
- subtotal

Hal yang sangat penting:

## PRICE SNAPSHOT

Pastikan apakah harga beli dan harga jual pada saat transaksi disimpan ke `sale_items`.

Contoh:

Produk hari ini:

Harga beli = Rp8.000
Harga jual = Rp10.000

Kemudian beberapa hari kemudian harga produk berubah:

Harga beli = Rp9.000
Harga jual = Rp12.000

Histori transaksi lama **harus tetap menghitung keuntungan berdasarkan harga ketika transaksi terjadi**, bukan harga produk saat ini.

Audit apakah sistem saat ini sudah menjamin hal tersebut.

Jika belum, jelaskan risiko dan rekomendasi.

---

# 7. AUDIT ALUR CHECKOUT

Trace checkout dari awal sampai akhir.

Mulai dari:

React POS
↓
request checkout
↓
route
↓
controller
↓
CheckoutService
↓
database transaction
↓
Sale
↓
SaleItem
↓
StockMovement
↓
response

Jelaskan alurnya berdasarkan kode sebenarnya.

Buat flow:

```text
User memilih produk
        ↓
Cart
        ↓
Checkout Request
        ↓
Server Validation
        ↓
Database Transaction
        ↓
Validasi stok
        ↓
Hitung total
        ↓
Create Sale
        ↓
Create SaleItem
        ↓
Kurangi Stock
        ↓
Create StockMovement
        ↓
Commit
```

Jika alur aktual berbeda, tampilkan alur aktualnya.

---

# 8. AUDIT TOTAL TRANSAKSI

Periksa bagaimana sistem menghitung:

- subtotal
- grand_total
- payment_amount
- change

Pastikan:

### SERVER TIDAK MEMERCAYAI TOTAL DARI FRONTEND

Periksa apakah server:

- mengambil harga produk dari database
- memvalidasi quantity
- menghitung subtotal sendiri
- menghitung grand_total sendiri
- menghitung kembalian sendiri

Jika frontend mengirim total harga, periksa apakah nilai tersebut digunakan langsung atau dihitung ulang oleh server.

Laporkan potensi manipulasi harga dari browser.

---

# 9. AUDIT STOCK

Periksa mekanisme:

```php
$product->decrement('stock', $qty);
```

atau mekanisme lain yang digunakan.

Periksa:

- apakah stok divalidasi sebelum checkout
- apakah quantity tidak boleh <= 0
- apakah stok tidak boleh menjadi negatif
- apakah stok dikurangi di dalam DB transaction
- apakah terdapat race condition
- apakah menggunakan lockForUpdate()
- apakah dua kasir dapat menjual stok yang sama secara bersamaan

Contoh kasus:

Stok produk = 1

Kasir A membeli = 1
Kasir B membeli = 1

Audit apakah sistem dapat menghasilkan:

Stock = -1

atau transaksi ganda.

Jelaskan solusi yang paling aman tanpa mengubah kode sekarang.

---

# 10. AUDIT STOCK_MOVEMENTS

Periksa tabel dan kode `stock_movements`.

Cari tahu:

- tipe movement yang tersedia
- quantity
- stock_before
- stock_after
- reference/sale_id
- product_id
- user_id jika ada
- reason jika ada
- created_at

Pastikan setiap penjualan memiliki histori perubahan stok.

Audit apakah:

```text
Sale
+
SaleItem
+
StockMovement
```

selalu konsisten.

Contoh:

Jika transaksi gagal/rollback:

- apakah sale ikut rollback?
- sale_item ikut rollback?
- stock decrement ikut rollback?
- stock movement ikut rollback?

---

# 11. AUDIT PEMBATALAN TRANSAKSI

Cari apakah sistem sudah memiliki:

- status transaksi
- cancelled
- refunded
- void
- return

atau mekanisme lain.

Jika BELUM ada:

jelaskan konsekuensinya.

Contoh:

Transaksi sudah selesai tetapi ternyata salah input.

Apakah saat ini transaksi dapat dibatalkan?

Jika tidak:

- bagaimana stok seharusnya dikembalikan?
- bagaimana omzet harus dihitung?
- bagaimana keuntungan harus dihitung?

Jangan membuat implementasinya.

---

# 12. AUDIT REPORT

Periksa `ReportController` dan query laporan.

Audit:

### Omzet

Apakah:

```text
Omzet = total transaksi selesai
```

atau terdapat transaksi lain yang ikut dihitung?

### Profit

Pastikan:

```text
Profit =
(Harga Jual Snapshot - Harga Beli Snapshot)
× Quantity
```

Periksa apakah profit menggunakan:

- harga produk saat ini
- harga pada sale_items
- grand_total
- metode lain

### Transaction Count

Pastikan jumlah transaksi dihitung dengan benar.

Periksa juga apakah transaksi cancelled/refunded, jika ada, ikut dihitung.

---

# 13. AUDIT AUTHORIZATION

Jangan hanya memeriksa authentication.

Periksa authorization.

Cari tahu:

### Admin/Owner

Apa saja yang bisa dilakukan?

### Kasir

Apa saja yang bisa dilakukan?

Audit apakah kasir dapat secara langsung melalui URL/API:

- menghapus produk
- mengubah harga
- mengubah stok
- menghapus kategori
- melihat laporan tertentu
- mengakses pengaturan
- mengakses data user
- membatalkan transaksi

Periksa:

- middleware
- policy
- gate
- role checking
- controller authorization

Identifikasi potensi:

- privilege escalation
- IDOR
- unauthorized modification

---

# 14. AUDIT SETTINGS

Periksa tabel `settings` dan model `Setting`.

Cari tahu:

- setting apa yang sudah digunakan
- apakah hanya sebagian yang digunakan
- apakah dapat digunakan untuk informasi toko
- apakah nama toko, alamat, nomor telepon, footer struk, dll. sudah didukung
- apakah ada struktur yang memungkinkan pengembangan pengaturan toko tanpa membuat tabel baru

Jangan menambah setting.

Hanya audit kondisi saat ini.

---

# 15. AUDIT DELETE PRODUCT

Ini sangat penting.

Periksa apa yang terjadi jika admin menghapus produk yang:

1. Belum pernah dijual
2. Sudah pernah dijual
3. Masih memiliki stock movement
4. Masih memiliki sale_items

Tentukan apakah sistem menggunakan:

- hard delete
- soft delete
- restrict
- cascade
- set null

Periksa apakah penghapusan produk dapat merusak histori transaksi.

---

# 16. AUDIT INDEX & PERFORMANCE

Periksa index pada:

### sales

- transaction_number
- created_at
- cashier_id
- status jika ada

### sale_items

- sale_id
- product_id

### products

- category_id
- name
- SKU/barcode jika memang ada

### stock_movements

- product_id
- sale_id
- created_at

Jangan membuat index.

Hanya identifikasi index yang sudah ada dan index yang kemungkinan diperlukan.

---

# 17. AUDIT KEAMANAN BACKEND

Cari potensi:

- Mass Assignment
- SQL Injection
- XSS
- CSRF
- IDOR
- Authorization bypass
- Manipulasi harga dari frontend
- Manipulasi total transaksi
- Manipulasi payment amount
- Manipulasi stock
- Negative quantity
- Quantity terlalu besar
- akses langsung endpoint checkout
- akses data transaksi milik user lain
- perubahan role user oleh kasir

Untuk setiap masalah berikan:

```text
Severity:
Critical / High / Medium / Low

Lokasi:
File / Method

Masalah:

Dampak:

Rekomendasi:
```

---

# 18. AUDIT BUSINESS LOGIC

Periksa apakah sistem sudah menjamin prinsip berikut:

### Principle 1

Harga transaksi lama tidak berubah ketika harga produk berubah.

### Principle 2

Histori transaksi tidak boleh hilang hanya karena produk dihapus.

### Principle 3

Stok tidak boleh negatif.

### Principle 4

Transaksi harus atomic.

Artinya:

Jika salah satu proses gagal:

```text
Sale
SaleItem
Stock
StockMovement
```

semuanya rollback.

### Principle 5

Omzet harus berdasarkan transaksi valid.

### Principle 6

Profit harus berdasarkan harga beli dan jual saat transaksi.

### Principle 7

Kasir tidak boleh mengakses fungsi admin.

### Principle 8

Frontend tidak boleh menjadi sumber kebenaran untuk harga dan total.

Audit apakah semua prinsip tersebut sudah terpenuhi.

---

# 19. FITUR YANG TIDAK BOLEH DIUSULKAN

Jangan memasukkan fitur berikut ke rekomendasi:

- Barcode
- Shift Kasir
- Customer
- Loyalty Point
- Promo
- Diskon
- Multi Outlet

Fokus hanya pada kebutuhan POS yang sudah ada.

---

# 20. OUTPUT AUDIT

Setelah selesai, jangan mengubah kode.

Berikan laporan dengan struktur berikut:

# DATABASE & TRANSACTION BUSINESS LOGIC AUDIT

## A. Executive Summary

Berikan ringkasan kondisi sistem saat ini.

Contoh:

```text
STATUS SISTEM:
GOOD / NEEDS IMPROVEMENT / HIGH RISK
```

---

## B. Database Schema Audit

Tampilkan tabel:

| Table | Kondisi | Masalah | Severity | Perlu Migration? |
| ----- | ------- | ------- | -------- | ---------------- |

---

## C. Transaction Flow Audit

Tampilkan flow checkout aktual.

---

## D. Transaction Integrity

| Area               | Status | Temuan | Risiko |
| ------------------ | ------ | ------ | ------ |
| Transaction Number |        |        |        |
| Price Snapshot     |        |        |        |
| Total Calculation  |        |        |        |
| Payment            |        |        |        |
| Stock              |        |        |        |
| Stock Movement     |        |        |        |
| Rollback           |        |        |        |
| Profit             |        |        |        |

Gunakan:

✅ Aman
⚠️ Perlu diperbaiki
❌ Bermasalah

---

## E. Security Audit

| Area | Status | Risiko | Rekomendasi |
| ---- | ------ | ------ | ----------- |

---

## F. Authorization Audit

Jelaskan dengan jelas:

### Admin

- ...

### Kasir

- ...

---

## G. Reporting Audit

Periksa:

- omzet
- profit
- transaksi
- produk terlaris
- filter tanggal
- transaksi cancelled/refunded

---

## H. Performance Audit

Identifikasi query yang berpotensi bermasalah ketika data mencapai:

- 1.000 produk
- 10.000 transaksi
- 100.000 sale_items
- 1.000.000 stock_movements

---

# 21. PRIORITY MATRIX

Buat prioritas:

### P0 — Critical

Harus diperbaiki sebelum production.

### P1 — High

Harus diperbaiki sebelum fitur besar berikutnya.

### P2 — Medium

Penting tetapi tidak menghambat operasi utama.

### P3 — Low

Improvement / enhancement.

Format:

| Priority | Masalah | Dampak | Solusi | Migration? |
| -------- | ------- | ------ | ------ | ---------- |

---

# 22. SAFE MIGRATION PLAN

Setelah audit selesai, buat rekomendasi migration **SAJA**.

Jangan membuat migration file.

Pisahkan menjadi:

### Migration yang benar-benar diperlukan

dan

### Migration yang belum diperlukan

Untuk setiap migration jelaskan:

- tabel
- kolom
- alasan
- dampak terhadap data lama
- risiko
- apakah backward compatible
- urutan migration

---

# 23. ATURAN TERAKHIR

Saya ingin sistem ini dikembangkan secara bertahap.

Jangan melakukan:

> "Rewrite the system"

Jangan menyarankan mengganti framework.

Jangan menyarankan membuat ulang POS.

Pertahankan:

- Laravel
- React
- Inertia
- Tailwind
- struktur existing
- POS interface
- cart
- checkout
- Cash
- QRIS
- product management
- category management
- sales
- reports
- stock_movements
- authentication

Jika sesuatu sudah benar, **jangan diubah hanya demi refactoring**.

Prinsip utama:

> EXTEND, DON'T REWRITE.

> FIX ONLY WHAT NEEDS TO BE FIXED.

> PRESERVE EXISTING DATA AND FUNCTIONALITY.

Setelah audit selesai, berhenti.

Jangan melakukan implementasi apa pun sampai saya memberikan instruksi berikutnya.
