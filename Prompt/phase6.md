PROJECT POS-Kasir

STATUS:

- Phase 1 PASS
- Phase 2 PASS
- Phase 3 PASS
- Phase 4 PASS
- Phase 5 PASS

NEXT:
PHASE 6 — STORE SETTINGS & SYSTEM CONFIGURATION

GOAL:
Membangun sistem Store Settings & System Configuration yang terpusat untuk mengelola identitas toko, informasi receipt, dan konfigurasi operasional sederhana.

Phase 6 harus memperluas sistem existing tanpa mengubah alur transaksi utama, tanpa mengganggu historical transaction data, dan tanpa merusak authorization serta analytics dari Phase 1–5.

==================================================
SCOPE PHASE 6
=============

Fitur utama:

1. Store Identity

    - Nama toko
    - Tagline/deskripsi singkat
    - Alamat toko
    - Nomor telepon
    - Email toko (optional)
    - Logo toko (optional)

2. Receipt Settings

    - Header receipt
    - Footer receipt
    - Informasi kontak toko pada receipt
    - Logo toko jika tersedia

3. Operational Settings

    - Currency/display configuration
    - Pengaturan sederhana yang memang sudah relevan dengan sistem existing
    - Pertahankan default existing jika configuration belum diatur

4. Admin Settings Page

    - Halaman pengaturan toko
    - Form edit settings
    - Validation
    - Success feedback
    - Error feedback
    - Responsive UI

5. Authorization

    - Admin dapat mengakses dan mengubah settings.
    - Cashier tidak boleh mengakses atau mengubah settings.
    - Authorization harus tetap dilakukan di backend, bukan hanya menyembunyikan menu.

==================================================
IMPORTANT PRINCIPLE
===================

Sebelum implementasi, audit terlebih dahulu apakah sistem existing sudah memiliki mekanisme settings/configuration.

Jangan langsung membuat migration.

Jika sudah ada settings/configuration mechanism:

- gunakan kembali
- jangan membuat sistem duplicate

Jika belum ada:

- gunakan desain sederhana dan extensible
- perubahan database harus additive dan non-destructive

Jangan overengineering.

==================================================
DATA / EXISTING SYSTEM
======================

Gunakan existing system:

- users
- products
- categories
- sales
- sale_items
- stock_movements
- existing authorization
- existing checkout
- existing receipt
- existing reports

Jangan mengubah business logic transaksi hanya untuk membuat settings.

Store settings harus menjadi configuration layer, bukan transaction layer.

==================================================
DATABASE
========

Audit terlebih dahulu apakah sudah ada:

- settings table
- configuration table
- store profile
- receipt configuration

Jika belum tersedia dan memang diperlukan, gunakan desain sederhana seperti:

settings

- id
- key
- value
- type (jika benar-benar diperlukan)
- timestamps

Contoh key:

store_name
store_tagline
store_address
store_phone
store_email
store_logo
receipt_header
receipt_footer
currency_symbol

Namun jangan membuat migration sebelum audit selesai.

Tidak boleh:

- mengubah sales schema
- mengubah sale_items schema
- mengubah products schema tanpa alasan yang benar-benar diperlukan
- mengubah stock_movements
- menghapus data existing

==================================================
RECEIPT
=======

Integrasikan store settings dengan receipt existing.

Contoh:

STORE NAME
Address
Phone

---

Transaction
Product
Qty
Price
Subtotal
--------

Footer

Settings hanya boleh memengaruhi informasi/configuration pada receipt.

Jangan mengubah:

- subtotal calculation
- grand total
- payment amount
- change
- sale items
- stock decrement
- transaction number
- historical transaction values

Jika settings kosong:

- receipt tetap harus dapat digunakan
- gunakan fallback yang aman
- tidak boleh muncul undefined/null error

==================================================
LOGO
====

Logo bersifat optional.

Jika diimplementasikan:

- gunakan Laravel storage
- validasi MIME/type
- validasi ukuran file
- jangan menyimpan binary file langsung di database
- jangan menerima executable file
- gunakan fallback jika logo tidak tersedia

Jika implementasi logo membutuhkan perubahan terlalu besar:

- boleh dibuat optional/future improvement
- jangan mengorbankan stabilitas sistem

==================================================
SETTINGS ACCESS
===============

Gunakan architecture yang sederhana dan maintainable.

Boleh menggunakan:

- Settings model
- SettingsService
- helper
- cache Laravel sederhana

Pilih pendekatan yang paling sesuai dengan existing architecture.

Jangan membuat abstraction berlebihan.

Pastikan settings tidak menyebabkan:

- query berulang pada setiap component
- N+1 query
- duplicate implementation

Database tetap menjadi source of truth.

==================================================
AUTHORIZATION
=============

Admin:

- dapat membuka Settings
- dapat mengubah Settings

Cashier:

- tidak dapat membuka Settings
- tidak dapat mengubah Settings
- harus mendapat backend authorization denial/403

Jangan hanya menyembunyikan menu.

Gunakan middleware/authorization existing dari Phase 1 jika memungkinkan.

Jangan membuat role baru.

==================================================
DEFAULT & FALLBACK
==================

Aplikasi harus tetap berjalan walaupun settings belum pernah dikonfigurasi.

Pastikan:

- dashboard tetap berjalan
- POS tetap berjalan
- checkout tetap berjalan
- reports tetap berjalan
- transaction history tetap berjalan
- receipt tetap berjalan

Jangan menyebabkan:

- undefined key
- null access error
- missing configuration exception
- broken receipt

==================================================
SECURITY
========

Pastikan:

- backend authorization
- request validation
- CSRF protection mengikuti Laravel
- output escaping
- safe file validation jika logo digunakan
- configuration tidak dapat digunakan untuk menyimpan arbitrary sensitive secrets
- jangan menyimpan password/API key/payment credential sebagai store settings

==================================================
PERFORMANCE
===========

Settings harus diambil secara efisien.

Hindari:

- query settings di setiap component
- query settings di dalam loop
- query per receipt item
- duplicate database access

Gunakan shared data/service/cache jika memang diperlukan.

Jangan menambahkan Redis atau external caching hanya untuk Phase 6.

==================================================
DATA PRESERVATION
=================

Changing store settings TIDAK boleh mengubah:

- sales
- sale_items
- products
- stock_movements
- users

Changing store settings juga tidak boleh mengubah historical:

- omzet
- profit
- quantity
- stock movement
- transaction total

Historical transaction harus tetap immutable.

==================================================
TESTING
=======

Tambahkan test Phase 6 minimal untuk:

1. Admin dapat mengakses Settings.
2. Cashier tidak dapat mengakses Settings.
3. Cashier tidak dapat mengubah Settings.
4. Admin dapat mengubah store name.
5. Admin dapat mengubah address/contact.
6. Receipt header/footer dapat dikonfigurasi.
7. Receipt menggunakan store settings.
8. Receipt tetap bekerja jika settings kosong/default.
9. Update settings menggunakan nilai terbaru.
10. Updating settings tidak mengubah sales.
11. Updating settings tidak mengubah sale_items.
12. Updating settings tidak mengubah products.
13. Updating settings tidak mengubah stock_movements.
14. Checkout tetap berjalan.
15. Dashboard tetap berjalan.
16. Reports tetap berjalan.
17. Transaction history tetap berjalan.
18. Receipt/reprint tetap berjalan.
19. Phase 1–5 regression tests tetap PASS.
20. Tidak terjadi N+1 query akibat settings.

Jangan melemahkan assertion hanya agar test PASS.

Jika test gagal:

- cari root cause
- perbaiki implementation/test fixture
- jalankan kembali test
- jangan menghapus business assertion

==================================================
DO NOT ADD
==========

Phase 6 TIDAK mencakup:

- multi outlet
- multi store
- supplier
- purchase order
- customer management
- loyalty
- promo/discount engine
- cashier shift
- refund
- return
- cancellation
- accounting system baru
- payment gateway baru
- inventory redesign
- role baru
- advanced permission system
- ERP integration

Jangan menambahkan fitur di luar scope tersebut.

==================================================
IMPLEMENTATION ORDER
====================

Implementasi Phase 6 dilakukan bertahap.

STEP 1 — AUDIT EXISTING CONFIGURATION

Audit:

- migration/schema
- existing settings/configuration
- models
- services
- routes
- middleware
- admin layout
- receipt implementation
- tests

Tujuan:
menentukan apakah settings mechanism sudah tersedia dan desain paling aman jika belum tersedia.

Pada STEP 1:
JANGAN melakukan migration atau implementasi besar terlebih dahulu.

---

STEP 2 — BACKEND & STORAGE

Setelah audit:

- implementasikan storage settings jika diperlukan
- model/service jika diperlukan
- validation
- admin authorization
- default/fallback
- tests backend

Pastikan tidak ada perubahan terhadap transaction data.

---

STEP 3 — SETTINGS UI

Implementasikan:

- Settings page
- Store Identity
- Receipt Settings
- Operational Settings
- validation
- success/error feedback
- responsive UI

Gunakan existing design system.

---

STEP 4 — RECEIPT INTEGRATION

Integrasikan settings dengan:

- receipt
- reprint receipt jika relevan
- store identity

Pastikan historical transaction tidak berubah.

---

STEP 5 — FINAL VERIFICATION

Verifikasi:

- authorization
- settings persistence
- receipt
- fallback
- data preservation
- no N+1
- Phase 1–5 regression
- test suite
- build

Run:

php artisan test

dan:

npm run build

==================================================
FINAL VERIFICATION
==================

Sebelum menyatakan PASS, pastikan:

- Admin dapat mengatur settings.
- Cashier tidak dapat mengakses settings.
- Settings tersimpan dengan benar.
- Receipt menggunakan settings terbaru.
- Receipt tetap aman ketika settings kosong.
- Historical transactions tidak berubah.
- Checkout tidak rusak.
- Dashboard tidak rusak.
- Reports tidak rusak.
- Analytics Phase 5 tetap konsisten.
- Tidak ada N+1.
- Tidak ada destructive database operation.
- Semua test relevan PASS.
- npm run build PASS.

Jangan menyatakan PASS hanya karena build berhasil.

==================================================
FINAL REPORT FORMAT
===================

Setelah implementasi selesai, berikan laporan:

A. Status
B. Initial Audit
C. Database Changes
D. Backend Changes
E. Frontend Changes
F. Store Settings Implemented
G. Receipt Integration
H. Authorization
I. Security
J. Query & Performance
K. Testing
L. Regression Phase 1–5
M. Data Preservation
N. Build Result
O. Remaining Issues

Untuk Testing wajib tuliskan:

- test file
- jumlah test
- passed
- failed
- assertions

Jika ada failure:
JANGAN menyatakan PASS.

Jika ada requirement belum selesai:
tulis PARTIAL / INCOMPLETE.

==================================================
FINAL PRINCIPLE
===============

Phase 6 adalah Store Settings & System Configuration.

Fokus pada:

- centralized configuration
- store identity
- receipt configuration
- simple operational settings
- admin-only management
- safe defaults
- maintainability
- backward compatibility

Gunakan existing architecture sebanyak mungkin.

Jangan rewrite sistem yang sudah PASS.

Jangan overengineering.

Jangan mengubah transaction system.

Jangan mengubah historical data.

Phase 6 harus menjadi fondasi yang bersih untuk:

Phase 7 — Audit Log & Operational Monitoring

dan

Phase 8 — Performance, Security Hardening & Production Readiness.
