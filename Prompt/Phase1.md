# PHASE 1 — IMPLEMENTASI AUTHORIZATION ADMIN & KASIR

## ROLE

Bertindak sebagai Senior Laravel Developer dan Security Engineer.

Kita akan mulai melakukan implementasi berdasarkan hasil audit database & transaction business logic sebelumnya.

## TUJUAN

Memperbaiki masalah authorization antara:

- Admin/Owner
- Kasir

Saat ini kolom `users.role` sudah tersedia, tetapi belum digunakan secara konsisten untuk membatasi akses.

Hasil audit menemukan bahwa kasir saat ini berpotensi mengakses:

- Product management
- Category management
- Delete product
- Laporan
- Pengaturan
- Data transaksi user lain
- Endpoint yang seharusnya hanya untuk admin

Ini harus diperbaiki.

---

# ATURAN UTAMA

## 1. JANGAN REWRITE SISTEM

Pertahankan:

- Laravel 13.17
- React 19
- InertiaJS 3
- TailwindCSS 4
- TypeScript
- Existing POS
- Existing checkout
- Existing cart
- Existing product management
- Existing category management
- Existing sales
- Existing reports
- Existing stock_movements
- Existing authentication

Gunakan prinsip:

> EXTEND, DON'T REWRITE.

---

# 2. JANGAN MENGUBAH DATABASE

Untuk phase ini:

- Jangan membuat migration.
- Jangan mengubah struktur tabel.
- Jangan menghapus kolom.
- Jangan mengubah data.
- Jangan membuat tabel baru.

Gunakan `users.role` yang sudah ada.

---

# 3. AUDIT IMPLEMENTASI SEBELUM MENGUBAH

Periksa terlebih dahulu:

- `User` model
- `users` migration
- middleware
- routes
- controllers
- policies
- gates
- authentication
- route groups
- React/Inertia navigation
- seluruh penggunaan `role`
- seluruh penggunaan `is_active`

Pastikan nilai role aktual yang digunakan database.

Jangan berasumsi.

Jika role aktual adalah:

```text
admin
cashier
```

gunakan nilai tersebut.

Jika berbeda, ikuti nilai yang benar-benar ditemukan di source code.

---

# 4. DEFINISI HAK AKSES

Gunakan prinsip berikut.

## ADMIN / OWNER

Admin dapat:

### Dashboard

- Melihat dashboard

### POS

- Mengakses POS jika memang sudah tersedia untuk admin

### Produk

- Melihat produk
- Menambah produk
- Mengubah produk
- Menghapus/nonaktifkan produk

### Kategori

- Melihat kategori
- Menambah kategori
- Mengubah kategori
- Menghapus kategori

### Transaksi

- Melihat seluruh transaksi
- Melihat detail transaksi

### Laporan

- Melihat laporan penjualan
- Melihat laporan keuntungan

### User

- Mengelola user jika fitur tersebut memang sudah tersedia

### Settings

- Mengakses settings jika route/fiturnya memang tersedia

---

# 5. KASIR

Kasir hanya mendapatkan akses yang memang dibutuhkan untuk operasional kasir.

### BOLEH

- Dashboard jika memang diperlukan
- POS
- Melakukan checkout
- Melihat transaksi yang memang menjadi kewenangannya
- Melihat detail transaksi yang menjadi kewenangannya

### TIDAK BOLEH

Kasir tidak boleh:

- Menambah produk
- Mengubah produk
- Menghapus produk
- Mengubah harga beli
- Mengubah harga jual
- Mengubah stok secara manual
- Mengelola kategori
- Melihat seluruh laporan keuangan jika memang merupakan data admin
- Mengelola user
- Mengubah role
- Mengakses settings admin

Jangan membuat fitur baru untuk menggantikan fungsi tersebut.

---

# 6. IMPLEMENTASI AUTHORIZATION

Gunakan mekanisme Laravel yang paling sesuai dengan struktur project saat ini.

Prioritaskan:

- Middleware
- Policy
- Gate

Hindari pengecekan role yang tersebar secara sembarangan di banyak controller jika dapat dibuat terpusat.

Contoh konsep:

```text
Admin
    ↓
Admin Middleware
    ↓
Admin Routes

Kasir
    ↓
Cashier Middleware
    ↓
POS Routes
```

Tetapi sesuaikan dengan arsitektur project yang sebenarnya.

---

# 7. SECURITY HARUS DITERAPKAN DI SERVER

Jangan hanya menyembunyikan menu dari React.

Contoh:

JANGAN hanya melakukan:

```text
Jika admin → tampilkan menu Product
Jika kasir → sembunyikan menu Product
```

Karena kasir masih bisa mencoba:

```text
/products
/products/create
/products/123/edit
/products/123
```

Authorization harus tetap dilakukan pada:

- route
- middleware
- controller/policy

Frontend hanya sebagai UI restriction tambahan.

---

# 8. SALE IDOR

Audit sebelumnya menemukan:

```text
SaleController::show
```

berpotensi memungkinkan kasir melihat transaksi user lain melalui ID/URL.

Perbaiki authorization tersebut.

Aturan:

### Admin

Boleh melihat seluruh transaksi.

### Kasir

Hanya boleh melihat transaksi yang memang menjadi kewenangannya berdasarkan struktur data yang sudah ada.

Jangan membuat ownership model baru.

Gunakan `cashier_id` yang sudah ada jika memang itu mekanisme existing.

---

# 9. PRODUCT DELETE

Untuk phase ini:

Jangan mengimplementasikan soft delete terlebih dahulu.

Tetapi pastikan authorization sudah membuat:

```text
Kasir → TIDAK BOLEH DELETE PRODUCT
Admin → MASIH BISA menggunakan endpoint existing
```

Soft delete akan kita kerjakan pada phase berikutnya setelah dependency database diverifikasi.

---

# 10. JANGAN MENGUBAH BUSINESS LOGIC CHECKOUT

Jangan mengubah:

- CheckoutService
- perhitungan harga
- perhitungan subtotal
- perhitungan grand total
- stock locking
- stock decrement
- stock movement

kecuali perubahan benar-benar diperlukan agar authorization bekerja.

---

# 11. UPDATE NAVIGATION UI

Setelah server-side authorization aman, sesuaikan navigation/sidebar/menu React agar:

### Admin

Melihat menu admin yang relevan.

### Kasir

Hanya melihat menu yang relevan untuk kasir.

Tetapi ingat:

> UI hiding bukan pengganti authorization server-side.

---

# 12. TEST SECURITY

Setelah implementasi, lakukan pengujian.

## Test 1

Login sebagai admin.

Pastikan admin dapat:

- membuka produk
- membuka kategori
- melihat transaksi
- melihat laporan

## Test 2

Login sebagai kasir.

Pastikan kasir dapat:

- membuka POS
- melakukan checkout
- melihat transaksi yang menjadi kewenangannya

## Test 3

Sebagai kasir, coba akses langsung URL admin.

Contoh:

```text
/products
/categories
/reports
```

dan endpoint terkait.

Harus ditolak sesuai mekanisme authorization.

## Test 4

Sebagai kasir, coba mengakses transaksi milik kasir lain menggunakan URL/ID.

Harus ditolak.

## Test 5

Pastikan checkout kasir tetap berjalan normal.

---

# 13. JANGAN MERUSAK EXISTING FEATURE

Setelah perubahan:

Pastikan fitur berikut tetap bekerja:

- Login
- Authentication
- POS
- Search product
- Category filter
- Cart
- Cash payment
- QRIS payment
- Checkout
- Stock decrement
- Transaction creation
- Sales history
- Reports untuk role yang berhak

---

# 14. OUTPUT

Sebelum melakukan perubahan, jelaskan:

```text
1. File yang akan diubah
2. Mengapa file tersebut perlu diubah
3. Mekanisme authorization yang akan digunakan
4. Route yang akan dibatasi
5. Controller/policy yang akan terkena dampak
```

Setelah itu implementasikan.

Setelah implementasi selesai, berikan:

## IMPLEMENTATION REPORT

### Files Changed

Daftar file yang diubah.

### Authorization Rules

Jelaskan hak akses Admin dan Kasir.

### Security Fixes

Jelaskan vulnerability yang diperbaiki.

### Tests

Tampilkan hasil test.

### Existing Features

Pastikan fitur existing tetap berjalan.

### Remaining Issues

Jelaskan masalah yang belum diperbaiki dan jangan memperbaikinya pada phase ini.

---

# 15. FITUR YANG DILARANG

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

Jangan melakukan scope expansion.

---

# FINAL RULE

Implementasikan **hanya Phase 1 Authorization & Role-Based Access Control**.

Jangan melakukan migration.

Jangan memperbaiki profit.

Jangan mengubah stock movement.

Jangan membuat transaction status.

Jangan mengubah payment enum.

Jangan membuat fitur baru.

Setelah selesai, berhenti dan berikan implementation report.
