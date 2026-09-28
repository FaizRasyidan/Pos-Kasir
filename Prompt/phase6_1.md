# PROJECT POS-Kasir

## PHASE 6 RECOVERY — STORE SETTINGS & SYSTEM CONFIGURATION

### STATUS

- Phase 1 — PASS
- Phase 2 — PASS
- Phase 3 — PASS
- Phase 4 — PASS
- Phase 5 — PASS

### CURRENT TASK

**PHASE 6 RECOVERY — STORE SETTINGS & SYSTEM CONFIGURATION**

---

## A. TUJUAN

Implementasikan kembali **Store Settings & System Configuration** agar benar-benar dapat digunakan melalui website.

Namun, setelah dilakukan evaluasi UI, **Appearance tidak diperlukan untuk aplikasi POS-Kasir** dan justru membuat tampilan website kurang relevan.

Oleh karena itu:

> **Store Settings harus menggunakan/menggantikan halaman Settings/Appearance yang sudah ada.**

JANGAN membuat menu "Store Settings" baru jika sudah terdapat menu "Settings".

Struktur yang diinginkan:

```text
Settings
└── Store Settings
```

dan **Appearance dihapus dari tampilan Settings**.

Tujuan akhirnya adalah menjadikan halaman Settings sebagai pusat konfigurasi toko.

---

# B. ATURAN UTAMA

1. Jangan membuat menu Store Settings terpisah apabila menu Settings sudah tersedia.
2. Gunakan halaman Settings existing sebagai halaman Store Settings.
3. Hapus Appearance dari UI Settings karena tidak diperlukan.
4. Jangan membuat sistem Appearance baru.
5. Jangan membuat sistem settings duplicate.
6. Gunakan tabel `settings` existing jika tersedia.
7. Jangan menghapus data existing.
8. Jangan menggunakan:

    - `migrate:fresh`
    - `migrate:refresh`
    - `db:wipe`
    - `TRUNCATE`
    - `DROP`
    - database reset

9. Jangan menghapus:

    - sales
    - sale_items
    - products
    - users
    - stock_movements

10. Jangan mengubah alur checkout.
11. Jangan mengubah perhitungan transaksi.
12. Jangan membuat role baru.
13. Pertahankan authorization Phase 1.
14. Pertahankan seluruh fitur Phase 1–5.
15. Jangan menyatakan PASS hanya karena `npm run build` berhasil.

---

# C. STEP 1 — AUDIT SETTINGS & APPEARANCE EXISTING

Sebelum melakukan perubahan, audit:

### Backend

Periksa:

- `routes/web.php`
- Settings route
- Settings controller
- Appearance controller jika ada
- `Setting` model
- middleware authorization

### Frontend

Cari:

- halaman Settings
- halaman Appearance
- sidebar
- navigation
- layout
- route frontend
- komponen Settings
- komponen Appearance

Identifikasi dengan jelas:

1. Apa yang sekarang ditampilkan ketika Admin membuka Settings?
2. Apakah Appearance benar-benar digunakan?
3. Apakah Appearance hanya komponen UI/theme?
4. Apakah Settings sudah memiliki route?
5. Apakah `resources/js/pages/settings/store.tsx` sudah digunakan?
6. Apakah terdapat route yang mengarah ke halaman tersebut?

Jangan menghapus kode Appearance sebelum memastikan dependency-nya.

---

# D. STEP 2 — RESTRUCTURE SETTINGS

Gunakan:

```text
Settings
```

sebagai menu utama.

Jangan membuat:

```text
Store Settings
Appearance
```

sebagai dua menu terpisah.

Yang diinginkan:

```text
Settings
```

dan isi halaman tersebut adalah:

```text
Store Settings
```

Appearance tidak lagi ditampilkan.

---

# E. STEP 3 — STORE SETTINGS UI

Halaman Settings harus memiliki tampilan:

## Settings

### Store Settings

Deskripsi:

> Kelola informasi toko, informasi kontak, dan tampilan struk transaksi.

---

### 1. Identitas Toko

Field:

- Nama Toko
- Tagline

Contoh:

```text
Nama Toko
[ TOKO POS-KASIR ]

Tagline
[ Solusi Kasir & Penjualan ]
```

---

### 2. Informasi Kontak

Field:

- Alamat
- Nomor Telepon
- Email

Contoh:

```text
Alamat
[ ................................ ]

Nomor Telepon
[ ................................ ]

Email
[ ................................ ]
```

---

### 3. Pengaturan Struk

Field:

- Header Struk
- Footer Struk

Contoh:

```text
Header Struk
[ ................................ ]

Footer Struk
[ Terima Kasih Telah Berbelanja! ]
```

---

### 4. Pengaturan Operasional

Hanya tampilkan konfigurasi yang benar-benar digunakan aplikasi.

JANGAN membuat setting dummy.

Jika currency/format mata uang sudah memiliki mekanisme existing, gunakan mekanisme tersebut.

Jika belum benar-benar digunakan oleh aplikasi, jangan membuat field palsu hanya untuk memenuhi UI.

---

### Tombol

```text
[ Simpan Pengaturan ]
```

Setelah berhasil:

```text
Pengaturan toko berhasil disimpan.
```

---

# F. STEP 4 — HAPUS APPEARANCE DARI UI

Appearance tidak lagi digunakan sebagai bagian dari Settings.

Lakukan secara aman:

1. Hapus Appearance dari sidebar/navigation.
2. Hapus Appearance dari Settings page.
3. Jangan menghapus kode yang ternyata masih digunakan oleh layout utama.
4. Jika Appearance memiliki route khusus yang tidak lagi diperlukan, audit dependency terlebih dahulu.
5. Jangan melakukan penghapusan file secara agresif.
6. Pastikan setelah perubahan tidak ada:

    - broken import
    - broken route
    - blank page
    - TypeScript error
    - frontend runtime error

Tujuan:

```text
Settings
    ↓
Store Settings
```

BUKAN:

```text
Settings
    ├── Appearance
    └── Store Settings
```

---

# G. STEP 5 — DATABASE

Audit tabel:

```text
settings
```

Jika sudah ada, gunakan.

Jangan membuat duplicate table.

Minimal key:

```text
store_name
store_tagline
store_address
store_phone
store_email
receipt_header
receipt_footer
```

Gunakan safe defaults.

Jangan menggunakan alamat palsu seperti:

```text
Jl. Raya Perdagangan No. 123
```

jika itu bukan alamat toko sebenarnya.

Gunakan:

```text
Alamat toko belum diatur
```

atau nilai kosong/null.

---

# H. STEP 6 — BACKEND

Pastikan Settings Controller dapat:

### GET

```text
/settings
```

### UPDATE

```text
/settings
```

atau endpoint existing yang sesuai dengan arsitektur project.

Gunakan:

```text
EnsureUserIsAdmin
```

Admin:

```text
GET /settings → 200
UPDATE /settings → berhasil
```

Cashier:

```text
GET /settings → 403
UPDATE /settings → 403
```

Jangan hanya menyembunyikan menu.

---

# I. STEP 7 — FRONTEND ROUTING

Pastikan halaman Settings benar-benar dirender.

Jika menggunakan Inertia:

```text
route
→ controller
→ Inertia render
→ resources/js/pages/settings/...
```

Jangan membuat file frontend yang tidak pernah dipanggil.

Verifikasi secara nyata:

```text
Login Admin
↓
Klik Settings
↓
Halaman Settings terbuka
↓
Store Settings terlihat
```

---

# J. STEP 8 — SIDEBAR

Sidebar Admin harus menampilkan:

```text
Settings
```

atau:

```text
⚙ Settings
```

Jangan menambahkan menu baru:

```text
Store Settings
```

jika Settings sudah tersedia.

Appearance harus tidak lagi tampil.

Cashier tidak boleh mendapatkan akses Settings jika memang Settings adalah konfigurasi Admin.

---

# K. STEP 9 — SAVE & PERSISTENCE

Test:

```text
Admin
↓
Settings
↓
Store Settings
↓
ubah Store Name
↓
Save
↓
Database update
↓
Refresh browser
↓
nilai tetap tersimpan
```

Jika refresh mengembalikan nilai lama, berarti implementasi belum selesai.

---

# L. STEP 10 — RECEIPT INTEGRATION

Store Settings harus digunakan pada receipt.

Minimal:

```text
store_name
store_tagline
store_address
store_phone
store_email
receipt_header
receipt_footer
```

Contoh:

```text
TOKO POS-KASIR
Solusi Kasir & Penjualan
Jl. ...
Telp. ...

-----------------------------
Produk
...
-----------------------------

Terima Kasih Telah Berbelanja!
```

Jangan mengubah:

- subtotal
- grand_total
- paid_amount
- change_amount
- payment_method
- sale_items
- stock
- transaction_number

Settings hanya mengubah informasi/tampilan toko.

---

# M. STEP 11 — SAFE FALLBACK

Jika value settings kosong:

```text
store_name
→ TOKO POS-KASIR
```

```text
store_address
→ Alamat toko belum diatur
```

```text
receipt_footer
→ Terima Kasih Telah Berbelanja!
```

Jangan menggunakan data palsu yang terlihat seperti data toko sebenarnya.

---

# N. STEP 12 — AUTHORIZATION

Test backend:

### Admin

```text
GET /settings
→ 200
```

```text
UPDATE /settings
→ success
```

### Cashier

```text
GET /settings
→ 403
```

```text
UPDATE /settings
→ 403
```

Gunakan authorization existing.

Jangan membuat role/permission system baru.

---

# O. STEP 13 — AUTOMATED TEST

Pastikan:

```text
tests/Feature/Phase6Test.php
```

memverifikasi minimal:

1. Admin dapat membuka Settings.
2. Cashier tidak dapat membuka Settings.
3. Admin dapat mengubah Store Settings.
4. Data settings tersimpan.
5. Data settings tetap setelah reload.
6. Store Settings digunakan pada receipt.
7. Safe fallback bekerja.
8. Checkout tetap bekerja.
9. Receipt tetap bekerja.
10. Phase 1 authorization tetap bekerja.

Jangan melemahkan business assertion hanya agar test PASS.

---

# P. STEP 14 — BROWSER VERIFICATION

WAJIB melakukan verifikasi melalui website jika environment memungkinkan.

### Admin

1. Login sebagai Admin.
2. Buka sidebar.
3. Pastikan terdapat `Settings`.
4. Klik Settings.
5. Pastikan halaman Store Settings tampil.
6. Pastikan Appearance sudah tidak tampil.
7. Pastikan form Store Settings tampil.
8. Ubah Nama Toko.
9. Klik Simpan.
10. Pastikan success message.
11. Refresh halaman.
12. Pastikan perubahan tetap ada.
13. Buka receipt.
14. Pastikan perubahan Store Settings muncul pada receipt.

### Cashier

1. Login sebagai Cashier.
2. Pastikan Settings tidak tersedia.
3. Akses `/settings` secara langsung.
4. Pastikan mendapatkan HTTP 403.

Jika browser verification tidak dapat dilakukan, nyatakan secara eksplisit:

```text
Browser verification tidak dapat dilakukan pada environment ini.
```

Jangan mengklaim UI PASS hanya berdasarkan source code.

---

# Q. STEP 15 — REGRESSION

Pastikan tidak merusak:

### Phase 1

- authorization
- admin/cashier restriction

### Phase 2

- buy_price snapshot
- stock_before
- stock_after
- soft delete
- stock integrity

### Phase 3

- checkout
- payment
- transaction creation

### Phase 4

- transaction detail
- receipt
- reprint receipt
- historical product

### Phase 5

- dashboard KPI
- sales trend
- top selling
- most profitable
- category performance
- cashier performance
- date filters
- historical profit
- report authorization

---

# R. STEP 16 — BUILD

Jalankan:

```bash
npm run build
```

Kemudian:

```bash
php artisan test
```

Pastikan tidak ada:

- TypeScript error
- missing import
- broken route
- runtime error
- test failure

---

# S. DATA PRESERVATION

WAJIB:

Jangan melakukan:

```text
migrate:fresh
migrate:refresh
db:wipe
TRUNCATE
DROP
reset
```

Jangan menghapus data transaksi.

Jangan menghapus product.

Jangan menghapus user.

Jangan mengubah historical transaction.

---

# T. FINAL REPORT

Berikan laporan:

### A. Status

### B. Initial Audit

### C. Appearance Audit

### D. Settings Architecture

### E. Database

### F. Backend

### G. Frontend

### H. Sidebar / Navigation

### I. Routing

### J. Store Settings UI

### K. Save & Persistence

### L. Receipt Integration

### M. Authorization

### N. Browser/UI Verification

### O. Testing

### P. Regression Phase 1–5

### Q. Data Preservation

### R. Build Result

### S. Requirement Matrix

### T. Remaining Issues

Requirement Matrix:

```text
Requirement | Status | Evidence
```

Status hanya:

```text
PASS
PARTIAL
FAIL
NOT APPLICABLE
```

---

# FINAL ACCEPTANCE CRITERIA

Phase 6 Recovery hanya PASS jika:

[ ] Settings existing berhasil digunakan
[ ] Appearance tidak lagi ditampilkan
[ ] Tidak ada duplicate Settings
[ ] Admin melihat menu Settings
[ ] Settings dapat dibuka
[ ] Store Settings tampil
[ ] Form Store Settings tampil
[ ] Admin dapat mengubah data
[ ] Data tersimpan ke database
[ ] Data tetap setelah refresh
[ ] Receipt menggunakan Store Settings
[ ] Safe fallback tersedia
[ ] Cashier mendapatkan 403
[ ] Tidak ada sensitive data
[ ] Tidak ada perubahan destruktif
[ ] Checkout tetap bekerja
[ ] Receipt tetap bekerja
[ ] Phase 1–5 regression PASS
[ ] Automated test PASS
[ ] npm run build PASS
[ ] Browser/UI verification PASS

## PRINSIP AKHIR

Jangan membuat Store Settings sebagai fitur tambahan yang berdiri sendiri.

Gunakan:

```text
SETTINGS
   ↓
STORE SETTINGS
```

dan gantikan fungsi Appearance yang tidak diperlukan.

Hasil akhir harus membuat halaman Settings benar-benar relevan untuk aplikasi POS-Kasir, sederhana, profesional, dan terintegrasi dengan konfigurasi toko serta receipt.
