# PHASE 2 — DATA INTEGRITY, INVENTORY & PROFIT FOUNDATION

## 1. ROLE & OBJECTIVE

Anda bertindak sebagai **Senior Laravel Backend Engineer + Database Engineer** yang bertanggung jawab melanjutkan pengembangan aplikasi POS Laravel yang telah menyelesaikan **Phase 1 — Authorization & Security**.

Tujuan Phase 2 adalah memperbaiki **data integrity, histori transaksi, inventory audit trail, dan fondasi perhitungan profit** tanpa merusak fitur yang sudah berjalan pada Phase 1.

Phase 2 mencakup 3 fokus utama:

1. **Snapshot harga beli (`buy_price`) pada `sale_items`**
2. **Soft delete produk**
3. **Audit trail `stock_movements` dengan `stock_before` dan `stock_after`**

---

# 2. ABSOLUTE RULE — JANGAN MERUSAK PHASE 1

Fitur dan security yang telah selesai pada Phase 1 adalah **baseline yang wajib dipertahankan**.

JANGAN menghapus, melemahkan, bypass, atau mengganti mekanisme authorization yang sudah ada.

Phase 1 mencakup:

### Admin

- Full access ke POS
- Checkout
- Seluruh riwayat transaksi
- CRUD Produk
- CRUD Kategori
- Accounting / Reports

### Kasir

- POS
- Checkout
- Riwayat transaksi miliknya sendiri

### Kasir TIDAK BOLEH:

- Mengakses `/products`
- Mengakses `/categories`
- Mengakses `/reports`
- Mengakses transaksi kasir lain
- Melakukan privilege escalation melalui URL/direct request

Authorization harus tetap ditegakkan di **backend**, bukan hanya frontend.

Pertahankan:

- `EnsureUserIsAdmin`
- Authorization pada `SaleController`
- Role data pada Inertia props
- Role-based sidebar
- Existing authorization tests
- Existing authentication system
- Existing checkout authorization/business logic

Jika perubahan Phase 2 membutuhkan modifikasi file Phase 1, lakukan seminimal mungkin dan jangan mengurangi security.

---

# 3. CURRENT SYSTEM BASELINE

Phase 1 telah dinyatakan berhasil dengan kondisi:

- AuthorizationTest: **4 passed / 9 assertions**
- CheckoutServiceTest: **2 passed / 9 assertions**
- Frontend build: **npm run build berhasil**
- Login berjalan
- POS berjalan
- Cart berjalan
- Cash payment berjalan
- QRIS payment berjalan
- Checkout berjalan
- Stock decrement berjalan
- Transaction history berjalan

Jangan menganggap laporan tersebut sebagai pengganti pemeriksaan kode.

**WAJIB memeriksa implementasi aktual sebelum melakukan perubahan.**

---

# 4. PHASE 2 OBJECTIVES

## OBJECTIVE A — BUY PRICE SNAPSHOT

Saat transaksi dibuat, `sale_items.buy_price` harus menyimpan harga beli produk **pada saat transaksi terjadi**.

Contoh:

Product:

```text
Product A
buy_price = 10000
sell_price = 15000
```

Customer membeli Product A.

Sale Item harus menyimpan:

```text
quantity = 2
sell_price = 15000
buy_price = 10000
```

Kemudian admin mengubah harga beli Product A:

```text
buy_price = 12000
```

Histori transaksi lama **TIDAK BOLEH berubah**.

Sale Item lama tetap:

```text
buy_price = 10000
```

Transaksi baru menggunakan:

```text
buy_price = 12000
```

### Business rule

`products.buy_price` = current/master purchase price.

`sale_items.buy_price` = historical snapshot purchase price.

JANGAN mengambil harga beli dari tabel `products` ketika menghitung histori profit jika `sale_items.buy_price` sudah tersedia.

---

# 5. OBJECTIVE B — SOFT DELETE PRODUCTS

Implementasikan soft delete pada Product.

Tujuan:

Produk yang sudah pernah digunakan dalam transaksi tidak boleh menyebabkan histori transaksi rusak ketika produk "dihapus".

Gunakan mekanisme Laravel yang sesuai, misalnya:

```php
SoftDeletes
```

dan:

```php
deleted_at
```

### Expected behavior

Ketika admin menghapus produk:

- Produk tidak hilang secara permanen dari database.
- `deleted_at` terisi.
- Histori transaksi lama tetap dapat diakses.
- Sale items lama tetap valid.
- Relasi transaction → sale items tidak rusak.

Default query produk harus tetap hanya menampilkan produk aktif.

Gunakan:

```php
Product::query()
```

dengan behavior SoftDeletes Laravel.

Jangan menggunakan hard delete untuk product melalui flow normal aplikasi.

---

# 6. OBJECTIVE C — STOCK MOVEMENT AUDIT TRAIL

Setiap perubahan stok yang relevan harus memiliki informasi:

```text
stock_before
quantity
stock_after
```

Contoh:

Stock awal:

```text
100
```

Barang terjual:

```text
10
```

Maka stock movement harus mencatat:

```text
stock_before = 100
quantity = -10
stock_after = 90
```

Untuk stock masuk:

```text
stock_before = 90
quantity = +20
stock_after = 110
```

Tujuannya agar setiap perubahan stok dapat diaudit dan direkonstruksi.

---

# 7. MANDATORY FIRST STEP — AUDIT EXISTING CODE

SEBELUM mengubah kode:

1. Periksa struktur folder Laravel.
2. Periksa `composer.json`.
3. Periksa `.env.example` jika relevan.
4. Periksa migration database.
5. Periksa model:

    - Product
    - Sale
    - SaleItem
    - StockMovement
    - User
    - Category

6. Periksa relationship antar model.
7. Periksa controller terkait:

    - ProductController
    - SaleController
    - Checkout-related controller
    - Stock-related controller

8. Periksa service:

    - CheckoutService
    - Inventory/Stock service jika tersedia

9. Periksa migration `sale_items`.
10. Periksa migration `stock_movements`.
11. Periksa seluruh test yang berhubungan dengan:

- checkout
- product
- stock
- sale
- authorization

12. Cari semua penggunaan:

- `buy_price`
- `sell_price`
- `stock`
- `stock_movements`
- `sale_items`
- `Product::delete()`
- `->delete()`

13. Identifikasi seluruh titik yang melakukan perubahan stok.

**JANGAN langsung membuat migration baru sebelum memahami schema yang sudah ada.**

---

# 8. DATABASE INSPECTION

Buat laporan singkat sebelum implementasi:

### Products

Identifikasi:

- primary key
- `buy_price`
- `sell_price`
- stock field
- foreign keys
- timestamps
- existing deleted_at jika ada

### Sale Items

Identifikasi:

- sale_id
- product_id
- quantity
- price/sell_price
- buy_price jika sudah ada
- subtotal
- timestamps
- foreign keys

### Stock Movements

Identifikasi:

- product_id
- quantity
- type/reason
- reference
- timestamps
- existing stock fields

### Sales

Identifikasi:

- cashier_id
- total
- payment method
- transaction status
- timestamps

Jangan mengasumsikan nama kolom. Gunakan schema aktual project.

---

# 9. MIGRATION REQUIREMENTS

Buat migration hanya jika diperlukan berdasarkan schema aktual.

## A. sale_items

Jika `buy_price` belum tersedia:

Tambahkan:

```text
buy_price
```

dengan tipe yang konsisten dengan `products.buy_price`.

Pertimbangkan penggunaan decimal yang sesuai dengan schema existing.

JANGAN menggunakan floating point untuk nilai uang jika project menggunakan decimal.

### Existing records

Migration harus aman terhadap transaksi lama.

Jika terdapat existing `sale_items` sebelum kolom `buy_price` ditambahkan:

- jangan membuat histori lama rusak
- jangan sembarang mengisi nilai
- evaluasi apakah data historis dapat di-backfill secara valid
- jika product masih tersedia dan hubungan product valid, gunakan data yang dapat dipertanggungjawabkan
- jika historical value tidak dapat diketahui secara akurat, JANGAN mengklaim data tersebut akurat

Dokumentasikan keputusan tersebut.

---

## B. products

Jika belum ada:

```text
deleted_at
```

Tambahkan SoftDeletes.

Pastikan migration tidak menghapus data existing.

---

## C. stock_movements

Jika belum ada:

```text
stock_before
stock_after
```

Tambahkan kedua field.

Tentukan nullable/non-nullable berdasarkan existing historical records.

Jangan membuat migration gagal pada database yang sudah berisi data lama.

---

# 10. MODEL CHANGES

## Product

Jika belum ada:

```php
use Illuminate\Database\Eloquent\SoftDeletes;
```

dan:

```php
use SoftDeletes;
```

Pastikan relationship tetap berfungsi.

Jangan menghapus Product dari database secara permanen melalui normal admin flow.

---

## SaleItem

Tambahkan `buy_price` ke:

```php
$fillable
```

atau gunakan mekanisme assignment yang sesuai dengan project.

Pastikan `buy_price` menggunakan cast uang/decimal yang konsisten dengan existing code.

SaleItem harus menyimpan snapshot, bukan dynamic reference.

---

## StockMovement

Tambahkan:

```text
stock_before
stock_after
```

ke model apabila diperlukan.

Gunakan casts yang sesuai.

---

# 11. CHECKOUT LOGIC

Ini bagian yang paling penting.

Cari flow checkout aktual.

Saat checkout:

1. Ambil product.
2. Validasi stock.
3. Ambil current `buy_price`.
4. Ambil current selling price.
5. Buat Sale.
6. Buat SaleItem.
7. Simpan snapshot:

```text
sale_items.buy_price = products.buy_price
```

8. Kurangi stock.
9. Catat StockMovement.
10. Pastikan seluruh proses berada dalam database transaction.

Expected logic:

```text
Product current buy_price
        ↓
Checkout
        ↓
SaleItem.buy_price snapshot
        ↓
Stock decrement
        ↓
StockMovement(before, quantity, after)
```

JANGAN menghitung profit histori dengan:

```text
sale_item.product.buy_price
```

Gunakan:

```text
sale_item.buy_price
```

---

# 12. STOCK MOVEMENT LOGIC

Setiap stock change harus mengikuti pola:

```php
$stockBefore = $product->stock;

$stockAfter = $stockBefore + $quantity;
```

Kemudian simpan:

```text
stock_before = $stockBefore
quantity     = $quantity
stock_after  = $stockAfter
```

Untuk penjualan:

```text
quantity < 0
```

Untuk stock addition:

```text
quantity > 0
```

Tetapi ikuti convention yang sudah digunakan project jika berbeda.

**Jangan mengubah convention existing secara sembarangan.**

Yang paling penting adalah:

```text
stock_after = stock_before + quantity
```

dan nilai tersebut harus konsisten dengan stock Product setelah operasi.

---

# 13. CONCURRENCY & DATA INTEGRITY

Perhatikan kemungkinan dua transaksi terjadi secara bersamaan.

Jika existing application sudah menggunakan:

```php
DB::transaction()
```

pertahankan.

Jika diperlukan, gunakan row locking secara tepat, misalnya:

```php
lockForUpdate()
```

pada product ketika melakukan stock-sensitive checkout.

Tujuannya mencegah:

- overselling
- stock race condition
- stock_before yang salah
- stock_after yang tidak konsisten

Jangan menambahkan locking secara berlebihan tanpa alasan.

---

# 14. SERVICE LAYER

Jika project memiliki `CheckoutService`, prioritaskan business logic di service tersebut daripada memindahkannya ke controller.

Controller sebaiknya tetap tipis.

Business logic terkait:

- snapshot buy_price
- stock decrement
- stock movement
- transaction handling

harus berada pada service/business layer yang sesuai dengan arsitektur existing.

JANGAN membuat arsitektur baru jika project sudah memiliki pola yang konsisten.

Ikuti pola existing project.

---

# 15. CONTROLLER

Periksa ProductController.

Pastikan:

### Delete Product

Normal delete:

```text
soft delete
```

bukan:

```text
hard delete
```

Authorization Phase 1 harus tetap berjalan.

Hanya admin yang boleh melakukan CRUD Product.

Kasir tetap harus mendapatkan:

```text
403
```

jika mencoba mengakses endpoint Product yang dilindungi.

---

# 16. ACCOUNTING / PROFIT FOUNDATION

Phase 2 belum harus membuat seluruh dashboard accounting baru kecuali fitur tersebut sudah menjadi bagian existing system.

Namun data harus siap untuk:

```text
Revenue
COGS / HPP
Gross Profit
```

Formula dasar:

```text
Revenue = sale_price × quantity
```

```text
COGS = buy_price_snapshot × quantity
```

```text
Gross Profit = Revenue - COGS
```

Contoh:

```text
sell_price = 15.000
buy_price = 10.000
quantity = 2
```

Maka:

```text
Revenue = 30.000
COGS = 20.000
Profit = 10.000
```

Jika harga beli product kemudian berubah menjadi 12.000:

**Transaksi lama tetap menghasilkan COGS 20.000.**

---

# 17. TEST REQUIREMENTS

Jangan hanya melakukan manual testing.

Tambahkan automated tests.

## Test 1 — Buy Price Snapshot

Scenario:

1. Product buy_price = 10.000
2. Checkout product
3. Verify sale_item.buy_price = 10.000
4. Update product buy_price = 12.000
5. Verify existing sale_item.buy_price tetap 10.000
6. Checkout lagi
7. Verify transaksi baru menggunakan 12.000

Expected:

```text
Old transaction = 10.000
New transaction = 12.000
```

---

## Test 2 — Soft Delete Product

Scenario:

1. Create product.
2. Create transaction menggunakan product.
3. Soft delete product.
4. Verify product memiliki `deleted_at`.
5. Verify sale tetap tersedia.
6. Verify sale_item tetap tersedia.
7. Verify histori transaksi tidak rusak.

---

## Test 3 — Product Tidak Muncul di Active Product Query

Setelah soft delete:

```php
Product::query()
```

tidak boleh mengembalikan product tersebut.

Tetapi:

```php
Product::withTrashed()
```

harus dapat menemukan product tersebut jika diperlukan.

---

## Test 4 — Stock Movement Before/After

Scenario:

```text
Initial stock = 100
Sale quantity = 10
```

Expected:

```text
stock_before = 100
quantity = -10
stock_after = 90
```

Product stock:

```text
90
```

Harus konsisten.

---

## Test 5 — Stock Addition

Scenario:

```text
Initial stock = 90
Stock addition = 20
```

Expected:

```text
stock_before = 90
quantity = +20
stock_after = 110
```

Product stock:

```text
110
```

---

## Test 6 — Stock Movement Consistency

Untuk setiap stock movement:

```text
stock_before + quantity = stock_after
```

Harus selalu true.

---

## Test 7 — Checkout Rollback

Simulasikan kegagalan di tengah checkout.

Pastikan:

- Sale rollback
- Sale items rollback
- Stock rollback
- Stock movement rollback

Tidak boleh ada partial transaction.

---

# 18. REGRESSION TEST — PHASE 1

WAJIB menjalankan kembali test Phase 1.

Minimal:

```bash
php artisan test
```

atau test suite yang sesuai project.

Pastikan:

```text
AuthorizationTest
CheckoutServiceTest
```

tetap PASS.

Acceptance minimum:

```text
AuthorizationTest = PASS
CheckoutServiceTest = PASS
Phase 2 tests = PASS
```

Jika ada test existing yang gagal setelah perubahan:

**STOP.**

Jangan menghapus atau melemahkan test hanya supaya test suite kembali hijau.

Cari root cause dan perbaiki implementasi.

---

# 19. FRONTEND REGRESSION

Setelah backend selesai:

```bash
npm run build
```

harus berhasil.

Pastikan:

- Login masih berjalan
- Admin dashboard masih berjalan
- Kasir dashboard masih berjalan
- POS masih berjalan
- Cart masih berjalan
- Checkout masih berjalan
- Cash payment masih berjalan
- QRIS payment masih berjalan
- Transaction history masih berjalan
- Admin masih dapat mengakses Product
- Kasir tetap tidak melihat menu Product
- Kasir tetap tidak dapat mengakses Product secara langsung
- Kasir tetap tidak dapat mengakses transaksi kasir lain

---

# 20. DO NOT DO

JANGAN:

1. Menghapus authorization Phase 1.
2. Menghapus automated tests Phase 1.
3. Mengganti role system tanpa alasan.
4. Mengubah database schema existing secara destructive.
5. Menghapus transaksi lama.
6. Hard delete product melalui normal flow.
7. Mengubah histori `sale_items`.
8. Menghitung historical profit menggunakan current product buy_price.
9. Menggunakan floating point untuk uang jika schema existing menggunakan decimal.
10. Mengubah payment flow tanpa kebutuhan.
11. Mengubah UI secara besar-besaran.
12. Menginstall package baru jika tidak diperlukan.
13. Mengubah migration existing yang sudah digunakan production tanpa alasan kuat.
14. Membuat duplicate service/controller/model.
15. Menghapus test yang gagal.
16. Men-disable foreign key hanya untuk membuat migration berhasil.
17. Melakukan `migrate:fresh` pada database existing sebagai solusi.
18. Melakukan hard delete terhadap data transaksi.
19. Menganggap frontend restriction sebagai security.
20. Mengubah behavior kasir/admin yang telah lolos Phase 1.

---

# 21. MIGRATION SAFETY

Migration harus:

- backward-aware
- tidak destructive
- aman terhadap existing records
- tidak menghapus transaksi
- tidak menghapus product
- tidak merusak foreign key
- dapat dijalankan pada database yang sudah memiliki data

Sebelum migration:

Periksa database/schema aktual.

Setelah migration:

Verifikasi:

```text
products
categories
sales
sale_items
stock_movements
users
```

tetap valid.

---

# 22. IMPLEMENTATION ORDER

Ikuti urutan ini:

### STEP 1

Audit database + codebase.

### STEP 2

Buat laporan singkat:

```text
CURRENT SCHEMA
CURRENT CHECKOUT FLOW
CURRENT STOCK FLOW
CURRENT PRODUCT DELETE FLOW
CURRENT TEST COVERAGE
```

### STEP 3

Implement `sale_items.buy_price` snapshot.

### STEP 4

Tambahkan test buy_price snapshot.

### STEP 5

Run test.

### STEP 6

Implement Product SoftDeletes.

### STEP 7

Tambahkan test soft delete.

### STEP 8

Run test.

### STEP 9

Implement `stock_before` dan `stock_after`.

### STEP 10

Perbaiki seluruh stock mutation flow yang relevan.

### STEP 11

Tambahkan stock movement tests.

### STEP 12

Run full test suite.

### STEP 13

Run:

```bash
npm run build
```

### STEP 14

Lakukan final regression check Phase 1.

---

# 23. ACCEPTANCE CRITERIA

Phase 2 hanya dianggap **PASSED** jika seluruh kondisi berikut terpenuhi.

## A. Buy Price

- [ ] `sale_items` menyimpan snapshot `buy_price`.
- [ ] Checkout mengambil buy_price dari product saat transaksi terjadi.
- [ ] Perubahan harga beli product tidak mengubah histori transaksi.
- [ ] Transaksi baru menggunakan harga beli terbaru.
- [ ] Profit calculation foundation menggunakan snapshot.

## B. Soft Delete

- [ ] Product menggunakan SoftDeletes.
- [ ] Product deletion tidak menghapus row secara permanen.
- [ ] `deleted_at` terisi.
- [ ] Product deleted tidak muncul pada active product list.
- [ ] Histori transaksi tetap dapat diakses.
- [ ] SaleItem tetap aman.
- [ ] Foreign key tetap valid.

## C. Stock Audit

- [ ] Stock movement menyimpan `stock_before`.
- [ ] Stock movement menyimpan `quantity`.
- [ ] Stock movement menyimpan `stock_after`.
- [ ] `stock_before + quantity = stock_after`.
- [ ] Product stock konsisten dengan stock movement terbaru.
- [ ] Stock decrement checkout tercatat.
- [ ] Stock addition tercatat jika flow tersebut tersedia.

## D. Transaction Integrity

- [ ] Checkout menggunakan DB transaction.
- [ ] Failure menyebabkan rollback.
- [ ] Tidak ada partial sale.
- [ ] Tidak ada partial stock update.
- [ ] Tidak ada orphan stock movement.

## E. Phase 1 Security

- [ ] Admin authorization tetap PASS.
- [ ] Kasir authorization tetap PASS.
- [ ] Kasir tidak dapat mengakses Product.
- [ ] Kasir tidak dapat mengakses Category.
- [ ] Kasir tidak dapat mengakses Reports.
- [ ] Kasir tidak dapat melihat transaksi kasir lain.
- [ ] HTTP 403 tetap diterapkan pada protected endpoint.

## F. Regression

- [ ] Existing tests PASS.
- [ ] New Phase 2 tests PASS.
- [ ] Full `php artisan test` PASS.
- [ ] `npm run build` PASS.
- [ ] Tidak ada regression pada Login.
- [ ] Tidak ada regression pada POS.
- [ ] Tidak ada regression pada Checkout.
- [ ] Tidak ada regression pada Payment.
- [ ] Tidak ada regression pada Stock.
- [ ] Tidak ada regression pada Transaction History.

---

# 24. REQUIRED FINAL REPORT

Setelah implementasi selesai, JANGAN hanya mengatakan "done".

Berikan laporan dengan format berikut:

## PHASE 2 IMPLEMENTATION REPORT

### A. Status

```text
PASS / NEEDS IMPROVEMENT / BLOCKED
```

### B. Database Changes

| Table           | Change             | Migration | Status |
| --------------- | ------------------ | --------- | ------ |
| sale_items      | buy_price snapshot | ...       | ...    |
| products        | soft delete        | ...       | ...    |
| stock_movements | stock_before       | ...       | ...    |
| stock_movements | stock_after        | ...       | ...    |

### C. Code Changes

Daftar file yang diubah/dibuat beserta alasan.

### D. Business Logic

Jelaskan:

- bagaimana buy_price di-snapshot
- bagaimana soft delete bekerja
- bagaimana stock_before/after dihitung
- bagaimana transaction rollback bekerja

### E. Tests

Tampilkan:

```text
Phase 1 tests:
PASS

Phase 2 tests:
PASS

Full test suite:
PASS

Frontend build:
PASS
```

Sertakan jumlah test dan assertion aktual.

### F. Security Regression

Konfirmasi:

```text
Admin authorization: PASS
Cashier authorization: PASS
Sale IDOR protection: PASS
Product protection: PASS
Category protection: PASS
Report protection: PASS
```

### G. Remaining Issues

Jika masih ada masalah, jangan menyembunyikannya.

Pisahkan:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

dan jelaskan dampaknya.

---

# 25. FINAL PRINCIPLE

Prioritas Phase 2:

```text
DATA INTEGRITY
    ↓
TRANSACTION CONSISTENCY
    ↓
INVENTORY AUDITABILITY
    ↓
PROFIT CALCULATION FOUNDATION
    ↓
REGRESSION SAFETY
```

Jangan mengejar perubahan sebanyak mungkin.

**Lebih baik melakukan perubahan sedikit tetapi benar, teruji, dan aman daripada melakukan refactor besar yang berisiko merusak Phase 1.**

Mulai dengan **audit codebase dan database terlebih dahulu**.

Jangan mengimplementasikan perubahan sebelum memahami schema dan checkout/stock flow yang sedang digunakan.
