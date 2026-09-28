# DATA PRESERVATION — CRITICAL RULE

INI ADALAH ATURAN WAJIB DAN TIDAK BOLEH DILANGGAR.

Database MySQL yang digunakan saat ini SUDAH BERISI DATA NYATA/AKTIF.

SEMUA DATA EXISTING WAJIB DIPERTAHANKAN.

JANGAN menghapus, mereset, truncate, mengganti, atau menghilangkan data yang sudah ada.

Data existing yang WAJIB tetap ada antara lain:

- seluruh data produk
- seluruh data kategori
- seluruh data stok produk
- seluruh akun Admin
- seluruh akun Kasir
- seluruh data user
- seluruh data transaksi/sales
- seluruh sale_items
- seluruh stock_movements
- seluruh data authentication
- seluruh data settings jika ada
- seluruh histori transaksi
- seluruh histori perubahan stok

## DILARANG KERAS

Jangan menjalankan:

- php artisan migrate:fresh
- php artisan migrate:fresh --seed
- php artisan migrate:refresh
- php artisan db:wipe
- TRUNCATE TABLE
- DROP TABLE
- DELETE FROM tanpa kondisi yang benar-benar diperlukan
- reset database
- membuat database baru
- mengganti database existing
- menghapus seluruh data untuk testing
- menjalankan seeder yang meng-overwrite data existing
- factory yang menghapus/reset data existing

Jangan menggunakan pendekatan:

> "reset database lalu buat ulang"

untuk menyelesaikan masalah development.

Gunakan pendekatan:

> "modify/extend existing database while preserving existing data."

---

# DATABASE MIGRATION SAFETY

Jika migration diperlukan:

1. Migration harus bersifat additive/non-destructive jika memungkinkan.
2. Jangan menghapus data existing.
3. Jangan drop column yang sudah berisi data tanpa alasan yang sangat kuat.
4. Jangan drop table existing.
5. Jangan mengganti primary key existing.
6. Jangan mengubah foreign key secara sembarangan.
7. Jangan mengubah tipe data dengan cara yang dapat menyebabkan data existing hilang.
8. Jangan membuat migration yang mengosongkan tabel.
9. Jangan melakukan reset database hanya agar migration berhasil.

Sebelum menjalankan migration, periksa:

- struktur tabel saat ini
- jumlah data
- existing columns
- existing indexes
- existing foreign keys
- existing constraints

Jika perubahan schema berpotensi menyebabkan kehilangan data:

> STOP dan laporkan terlebih dahulu.

Jangan mengambil keputusan sendiri untuk menghapus data.

---

# EXISTING USER ACCOUNTS — CRITICAL

Akun berikut harus tetap dapat digunakan setelah implementasi:

- akun Admin existing
- akun Kasir existing

Jangan:

- menghapus user
- menghapus password existing
- mengganti role user existing secara otomatis
- membuat ulang seluruh user
- mengganti authentication data
- mengganti credential existing

Jika perlu menambahkan role/permission:

> gunakan data user existing.

Jangan membuat user baru sebagai pengganti user existing.

---

# EXISTING PRODUCTS — CRITICAL

Semua produk yang sudah ada di database harus tetap ada.

Contoh:

Jika sebelum implementasi terdapat:

````text
Produk A
Produk B
Produk C


### Dan tambahkan ini di bagian `FINAL RULE` paling bawah prompt:

```text
# ABSOLUTE FINAL RULE

JANGAN MENGHAPUS DATA MYSQL EXISTING.

Database saat ini adalah database yang SUDAH DIGUNAKAN dan BERISI DATA.

Produk, kategori, stok, akun Admin, akun Kasir, transaksi, sale_items, dan stock_movements yang sudah ada HARUS tetap tersedia setelah implementasi.

DILARANG melakukan database reset/fresh/refresh/wipe/truncate/drop untuk menyelesaikan masalah implementasi.

Gunakan migration dan perubahan schema yang NON-DESTRUCTIVE.

Jika ada kebutuhan perubahan yang berpotensi menghapus atau mengubah data existing:

STOP → JELASKAN RISIKO → TUNGGU PERSETUJUAN.

JANGAN mengambil keputusan sendiri.

FITUR BARU HARUS MENYESUAIKAN DATABASE EXISTING, BUKAN MENGHAPUS DATABASE EXISTING.
````
