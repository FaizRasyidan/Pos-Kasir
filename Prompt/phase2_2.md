# PHASE 2.2 — STOCK MANAGEMENT ADMIN

## ROLE

Bertindak sebagai:

- Senior Laravel Developer
- Senior Backend Engineer
- Database Engineer
- UI/UX Engineer
- Security Engineer
- Code Reviewer

Kita melanjutkan pengembangan POS setelah PHASE 2.1 berhasil dengan status PASS.

PHASE 2.1 telah memperbaiki:

- Role Admin dan Kasir
- Snapshot buy_price pada sale_items
- Stock movement
- stock_before
- stock_after
- user_id
- buy_price pada stock movement
- selling_price pada stock movement
- Authorization POS
- Profit calculation

Sekarang fokus hanya pada:

# STOCK MANAGEMENT UNTUK ADMIN

---

# 1. TUJUAN

Admin harus memiliki cara yang jelas untuk:

1. Melihat stok saat ini
2. Menambahkan stok
3. Mengurangi/koreksi stok jika diperlukan
4. Melihat histori seluruh perubahan stok

Semua perubahan stok manual harus tercatat pada:

```text
stock_movements
```

Jangan membuat tabel inventory baru jika tidak diperlukan.

---

# 2. ROLE

## ADMIN

Admin boleh:

- Melihat stok
- Menambah stok
- Melakukan koreksi stok
- Melihat stock movement
- Mengelola harga beli
- Mengelola harga jual
- Mengelola produk

## KASIR

Kasir:

- Tidak boleh mengubah stok secara manual
- Tidak boleh mengubah harga beli
- Tidak boleh mengubah harga jual
- Tidak boleh melakukan stock adjustment
- Tidak boleh mengelola stock movement

Kasir hanya mengurangi stok melalui proses checkout POS yang sudah ada.

---

# 3. JANGAN REWRITE

Pertahankan:

- Laravel 13.17
- React 19
- InertiaJS 3
- TailwindCSS 4
- TypeScript
- Existing Product Management
- Existing POS
- Existing CheckoutService
- Existing Sales
- Existing SaleItems
- Existing StockMovement
- Existing Authorization

Gunakan:

> EXTEND, DON'T REWRITE.

---

# 4. AUDIT KODE TERLEBIH DAHULU

Sebelum implementasi, periksa:

- Product model
- ProductController
- StockMovement model
- StockMovementController
- migrations
- routes
- existing product page
- existing stock UI jika ada
- middleware/policy
- validation
- authorization

Gunakan schema aktual sebagai source of truth.

Jangan mengarang nama field.

---

# 5. STOCK PAGE

Buat/sempurnakan halaman:

```text
Stok
```

Halaman harus menampilkan minimal:

| Produk | Kategori | Harga Beli | Harga Jual | Stok | Status   |
| ------ | -------- | ---------: | ---------: | ---: | -------- |
| Kopi   | Minuman  |    Rp8.000 |   Rp12.000 |   50 | Tersedia |

Status stok dapat berupa:

```text
Tersedia
Stok Menipis
Habis
```

Gunakan threshold yang sudah ada jika tersedia.

Jika threshold belum ada, jangan membuat sistem threshold kompleks pada phase ini.

---

# 6. TAMBAH STOK

Admin harus dapat melakukan:

```text
Tambah Stok
```

Form minimal:

```text
Produk
Jumlah Stok Masuk
Harga Beli
Harga Jual
Catatan (jika struktur existing mendukung)
```

Contoh:

```text
Produk       : Kopi
Jumlah Masuk : 30
Harga Beli   : Rp8.000
Harga Jual   : Rp12.000
```

---

# 7. PROSES TAMBAH STOK

Ketika Admin menyimpan:

Misalnya:

```text
stock sebelumnya = 20
quantity masuk   = 30
```

maka:

```text
stock baru = 50
```

Secara atomic:

```text
Database Transaction
        ↓
Lock Product
        ↓
Ambil stock sekarang
        ↓
Validasi quantity
        ↓
Update stock
        ↓
Update harga jika memang merupakan bagian dari proses stok masuk
        ↓
Create StockMovement
        ↓
Commit
```

Gunakan `lockForUpdate()` jika sesuai dengan pola existing CheckoutService.

Jangan melakukan update stock tanpa protection terhadap concurrent update.

---

# 8. STOCK MOVEMENT STOCK IN

Pastikan hasilnya:

```text
type = stock_in
```

atau gunakan type existing yang memang merepresentasikan stok masuk.

Data minimal:

```text
product_id
user_id
quantity
stock_before
stock_after
buy_price
selling_price
created_at
```

Gunakan field existing.

---

# 9. HARGA BELI DAN HARGA JUAL

Ketika Admin memasukkan stok baru:

Contoh:

Produk lama:

```text
buy_price = 8.000
selling_price = 12.000
stock = 20
```

Admin membeli stok baru:

```text
quantity = 30
buy_price = 8.500
selling_price = 12.500
```

Maka sistem harus memiliki aturan yang jelas.

Untuk phase ini gunakan konsep:

> Harga pada product menjadi harga master TERKINI.

Sehingga setelah stock in:

```text
products.buy_price = 8.500
products.selling_price = 12.500
products.stock = 50
```

Sedangkan histori movement menyimpan:

```text
buy_price = 8.500
selling_price = 12.500
quantity = 30
stock_before = 20
stock_after = 50
```

Jangan mengubah `sale_items` transaksi lama.

---

# 10. PENTING — PROFIT TRANSAKSI LAMA

Setelah Admin mengubah harga beli:

```text
products.buy_price
```

transaksi lama tetap harus menggunakan:

```text
sale_items.buy_price
```

Jangan pernah melakukan update massal ke:

```text
sale_items.buy_price
```

ketika harga produk berubah.

---

# 11. KOREKSI / PENGURANGAN STOK

Admin juga perlu dapat mengoreksi stok jika ada:

- barang rusak
- stok fisik berbeda
- kesalahan input

Namun jangan membuat sistem adjustment yang kompleks.

Buat mekanisme sederhana:

```text
Kurangi Stok
```

Input:

```text
Produk
Jumlah
Alasan
```

Contoh:

```text
Produk  : Kopi
Jumlah  : 2
Alasan  : Barang rusak
```

Sebelum:

```text
50
```

Sesudah:

```text
48
```

Stock movement:

```text
type = adjustment_out
quantity = 2
stock_before = 50
stock_after = 48
user_id = admin
```

Jika sistem existing menggunakan nama type berbeda, gunakan konvensi existing.

---

# 12. JANGAN IZINKAN STOK NEGATIF

Jika:

```text
stock = 5
```

Admin mencoba:

```text
kurangi = 10
```

tolak.

Jangan menghasilkan:

```text
stock = -5
```

Validasi dilakukan server-side.

---

# 13. STOCK MOVEMENT HISTORY

Pastikan halaman:

```text
Riwayat Stok
```

menampilkan:

| Tanggal | Produk | Aktivitas | Harga Beli | Harga Jual | Jumlah | Sebelum | Sesudah | Oleh |
| ------- | ------ | --------- | ---------: | ---------: | -----: | ------: | ------: | ---- |

Gunakan pagination.

Jangan menggunakan:

```php
StockMovement::all()
```

Gunakan query paginated.

---

# 14. FILTER RIWAYAT STOK

Sediakan:

### Tanggal

```text
Dari
Sampai
```

### Produk

```text
Semua Produk
```

### Jenis

```text
Semua
Stock In
Sale
Adjustment
```

Sesuaikan dengan type yang benar-benar tersedia.

Jangan menampilkan filter yang tidak memiliki data.

---

# 15. SORTING

Default:

```text
Terbaru → Terlama
```

Gunakan:

```text
created_at DESC
```

atau mekanisme existing yang setara.

---

# 16. DETAIL STOCK MOVEMENT

Jika mudah diterapkan tanpa overengineering, setiap movement dapat memiliki detail.

Ketika Admin melihat:

```text
Stock In
```

dapat melihat:

```text
Produk
Tanggal
User
Harga Beli
Harga Jual
Jumlah
Stock Before
Stock After
```

Namun jangan membuat halaman detail terpisah jika struktur aplikasi saat ini tidak membutuhkannya.

Modal/detail drawer juga boleh jika konsisten dengan UI existing.

---

# 17. PRODUCT DELETE / SOFT DELETE

Pastikan produk yang sudah soft deleted:

- tidak muncul pada daftar stok aktif
- tidak muncul pada POS
- tidak dapat dijual
- histori stock movement tetap dapat melihat record lama
- histori transaksi tidak rusak

Jangan menghapus histori movement.

---

# 18. ADMIN TIDAK BOLEH MASUK POS

Pastikan requirement sebelumnya tetap berlaku:

```text
Admin → /pos → DENIED
Admin → POST /pos/checkout → DENIED

Kasir → /pos → ALLOWED
Kasir → POST /pos/checkout → ALLOWED
```

Jangan mengubah authorization yang sudah PASS.

---

# 19. JANGAN UBAH CHECKOUT

Checkout kasir sudah berjalan dengan baik.

Jangan mengubah:

- perhitungan total
- payment
- Cash
- QRIS
- sale creation
- sale item snapshot
- stock locking
- sale stock movement

kecuali diperlukan untuk kompatibilitas dengan stock management.

---

# 20. UI NAVIGATION

Untuk Admin:

```text
Produk & Inventory
├── Produk
├── Kategori
├── Stok
└── Riwayat Stok
```

Untuk Kasir:

```text
POS
└── Riwayat Transaksi
```

Kasir tidak perlu mendapatkan menu:

```text
Stok
Riwayat Stok
```

---

# 21. TEST CASE

Wajib melakukan test berikut.

## TEST 1 — STOCK IN

Initial:

```text
stock = 10
```

Admin memasukkan:

```text
quantity = 20
buy_price = 8.000
selling_price = 12.000
```

Expected:

```text
stock = 30
```

Movement:

```text
quantity = 20
stock_before = 10
stock_after = 30
buy_price = 8.000
selling_price = 12.000
user_id = admin
```

---

## TEST 2 — MULTIPLE STOCK IN

Initial:

```text
stock = 30
```

Stock in:

```text
10
```

Expected:

```text
stock = 40
```

Movement harus membuat record baru.

Jangan mengubah movement sebelumnya.

---

## TEST 3 — PRICE CHANGE

Initial:

```text
buy_price = 8.000
selling_price = 12.000
```

Stock in:

```text
buy_price = 8.500
selling_price = 12.500
```

Expected:

```text
Product:
buy_price = 8.500
selling_price = 12.500
```

Namun transaksi lama tetap menggunakan:

```text
sale_items.buy_price = harga lama
sale_items.price = harga lama
```

---

## TEST 4 — STOCK OUT / ADJUSTMENT

Initial:

```text
stock = 40
```

Admin mengurangi:

```text
5
```

Expected:

```text
stock = 35
```

Movement:

```text
stock_before = 40
stock_after = 35
quantity = 5
```

---

## TEST 5 — NEGATIVE STOCK

Initial:

```text
stock = 5
```

Admin mencoba:

```text
kurangi 10
```

Expected:

```text
REQUEST DENIED
stock tetap 5
```

---

## TEST 6 — CASHIER

Login sebagai Kasir.

Pastikan:

```text
Stock Management → DENIED
Stock Movement → DENIED
Product Management → DENIED
Category Management → DENIED
```

Tetapi:

```text
POS → ALLOWED
Checkout → ALLOWED
```

---

## TEST 7 — ADMIN POS

Login sebagai Admin.

Pastikan:

```text
POS → DENIED
Checkout → DENIED
```

Tetapi:

```text
Products → ALLOWED
Stock → ALLOWED
Stock Movement → ALLOWED
Reports → ALLOWED
```

---

# 22. REGRESSION TEST

Setelah implementasi, pastikan tidak merusak:

- Login
- Role authorization
- Product
- Category
- POS
- Cart
- Cash
- QRIS
- Checkout
- Stock decrement
- Sale
- SaleItem
- StockMovement
- Profit report
- Sales report
- Transaction history

---

# 23. MIGRATION

Jangan membuat migration baru jika field yang diperlukan sudah tersedia dari PHASE 2.1.

Sebelum membuat migration:

```text
AUDIT SCHEMA TERLEBIH DAHULU
```

Jika benar-benar membutuhkan migration baru, jelaskan alasannya sebelum membuatnya.

Jangan membuat tabel inventory baru.

---

# 24. OUTPUT SEBELUM IMPLEMENTASI

Tampilkan:

## IMPLEMENTATION PLAN

- File yang akan diubah
- Route yang akan ditambah/diubah
- Controller
- Model
- Migration jika diperlukan
- React page/component
- Authorization
- Validation
- Database transaction
- Risiko data lama

Setelah plan, lanjutkan implementasi.

---

# 25. OUTPUT SETELAH IMPLEMENTASI

Berikan:

# PHASE 2.2 IMPLEMENTATION REPORT

## A. Status

PASS / PARTIAL / FAILED

## B. Stock Management

Jelaskan:

- stock in
- adjustment out
- current stock
- price update

## C. Stock Movement

Jelaskan:

- stock_before
- stock_after
- quantity
- buy_price
- selling_price
- user_id
- movement type

## D. Authorization

### Admin

Daftar akses.

### Kasir

Daftar akses.

## E. Database Changes

| Table | Change | Migration | Status |
| ----- | ------ | --------- | ------ |

## F. Files Changed

Daftar file.

## G. Tests

Tampilkan seluruh test.

## H. Regression Test

Pastikan existing POS tetap berjalan.

## I. Remaining Issues

Jika ada masalah, laporkan.

Jangan otomatis masuk ke phase berikutnya.

---

# FINAL RULE

Fokus hanya pada:

> STOCK MANAGEMENT ADMIN + STOCK MOVEMENT HISTORY

Jangan membuat:

- Barcode
- Shift Kasir
- Customer
- Loyalty
- Promo
- Diskon
- Multi Outlet
- Supplier
- Purchase Order

Jangan rewrite sistem.

Jangan menghapus histori.

Jangan mengubah transaksi lama.

Jangan mengubah profit logic yang sudah benar.

Jangan membuat Admin dapat masuk POS.

POS DAN CHECKOUT HANYA UNTUK KASIR.

Setelah selesai, berhenti dan berikan implementation report.
