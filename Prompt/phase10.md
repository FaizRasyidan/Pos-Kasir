PHASE 10 — Reporting Export & Business Document

Tujuannya membuat data Accounting dan laporan POS benar-benar siap digunakan untuk kebutuhan operasional/administrasi toko, tanpa mengubah perhitungan yang sudah benar.

Berikut prompt yang bisa langsung Abang berikan ke coding agent.

PHASE 10 — REPORTING EXPORT & BUSINESS DOCUMENT

Status: Phase 10
Project: Laravel POS-Kasir
Prerequisite: Phase 1–9 PASS
Goal: Menambahkan kemampuan export laporan bisnis dari sistem POS secara aman, konsisten, dan production-ready.

A. KONDISI PROJECT SAAT INI

Phase 1–9 telah selesai.

Fitur yang sudah tersedia dan HARUS DIPERTAHANKAN:

Authentication
Role Admin / Cashier
Authorization backend
POS / Checkout
Payment
Inventory
Stock Movement
Product Management
Category Management
Transaction History
Receipt
Reprint Receipt
Sales Analytics
Accounting
Store Settings
Audit Logs
Cashier Management
Admin Dashboard / Store Command Center
Security Hardening
Historical buy_price
Soft delete Product

Struktur UX:

Dashboard
→ Store Command Center

POS
→ Checkout / transaksi

Accounting
→ Business Analytics

Audit Logs
→ Operational Monitoring

Settings
→ Store Configuration

Jangan mengubah pembagian tersebut.

B. TUJUAN PHASE 10

Tambahkan kemampuan Export Business Report agar Admin dapat mengunduh data laporan yang sudah tersedia.

Export harus menggunakan data yang sama dengan Accounting, bukan membuat sistem perhitungan baru.

Target:

Accounting
    ↓
Filter tanggal
    ↓
Report Query
    ↓
Export
    ↓
CSV / Excel

Jika library Excel sudah tersedia di project, gunakan library tersebut.

Jika belum tersedia, audit terlebih dahulu dan pilih solusi yang paling sederhana dan stabil.

Jangan melakukan dependency upgrade besar-besaran hanya demi fitur ini.

C. JENIS REPORT YANG DAPAT DIEKSPOR

Prioritas:

1. Sales Summary

Berisi:

tanggal
jumlah transaksi
total item
omzet
profit
2. Daily Sales

Berisi:

tanggal
transaksi
item terjual
omzet
profit
3. Product Performance

Berisi:

produk
kategori
quantity sold
omzet
profit
4. Cashier Performance

Admin only:

kasir
jumlah transaksi
omzet
rata-rata transaksi
5. Stock Movement

Berisi:

tanggal
produk
tipe movement
quantity
stock before
stock after
actor/user
keterangan

Gunakan stock_movements sebagai source of truth inventory.

D. DATE FILTER

Export harus mengikuti filter Accounting.

Minimal:

Today
Yesterday
Last 7 Days
Last 30 Days
Custom Range

Jika Accounting sudah menggunakan parameter tertentu, gunakan parameter yang sama.

Jangan membuat mekanisme filter tanggal kedua yang berbeda.

Contoh:

Accounting:
01 Sep 2026 – 15 Sep 2026

Export:
01 Sep 2026 – 15 Sep 2026

Hasil harus konsisten.

E. HISTORICAL PROFIT

Ini sangat penting.

Profit export WAJIB menggunakan:

sale_items.buy_price

bukan:

products.buy_price

Jangan sampai perubahan harga beli produk saat ini mengubah profit transaksi lama.

Contoh:

Transaksi lama:
buy_price = Rp5.000
sell_price = Rp8.000

Harga beli produk sekarang:
Rp6.500

Export transaksi lama tetap menggunakan:

Rp5.000
F. AUTHORIZATION

Export laporan adalah fitur Admin-only.

Cashier:

403 Forbidden

Backend harus melakukan authorization.

Jangan hanya menyembunyikan tombol export dari sidebar/UI.

G. UI ACCOUNTING

Tambahkan tombol export pada Accounting tanpa merusak UI yang sudah ada.

Contoh:

Accounting

[Filter Tanggal] [Export]

Jika diperlukan:

Export
├── Sales Summary
├── Daily Sales
├── Product Performance
├── Cashier Performance
└── Stock Movement

Gunakan design system yang sudah ada.

Jangan mengubah Accounting kembali menjadi Dashboard.

H. FORMAT FILE

Prioritas:

CSV

Wajib tersedia karena sederhana dan ringan.

Excel

Opsional jika dependency/project architecture mendukung dengan aman.

PDF

Tidak wajib pada Phase 10 kecuali sudah ada infrastructure yang stabil.

Jangan membuat sistem PDF kompleks hanya demi memenuhi checklist.

I. PERFORMANCE

Jangan melakukan:

ambil semua data → PHP → loop besar → hitung semuanya

Gunakan query database untuk aggregation.

Pertahankan pola Accounting:

SUM
COUNT
AVG
GROUP BY
ORDER BY
WHERE
WHERE BETWEEN

Export juga harus mempertimbangkan dataset besar.

Jangan melakukan N+1.

Untuk relasi yang diperlukan gunakan eager loading.

J. AUDIT LOG

Export merupakan aktivitas Admin yang dapat dianggap sebagai operational action.

Jika sistem audit saat ini sudah mendukung event/action yang sesuai, catat:

report_export

Minimal:

actor
report type
tanggal/filter
timestamp

Jangan menyimpan seluruh isi report ke audit log.

Jangan menyimpan password, token, credential, atau secret.

K. DATA PRESERVATION

ABSOLUTELY NO destructive database operation.

DILARANG:

php artisan migrate:fresh
php artisan migrate:refresh
php artisan db:wipe
TRUNCATE
DROP TABLE
DELETE seluruh data

Jangan menghapus:

users
products
categories
sales
sale_items
stock_movements
settings
audit_logs

Migration tidak diperlukan secara default.

Jika ternyata benar-benar diperlukan, harus additive dan dijelaskan terlebih dahulu.

L. ACCOUNTING CONSISTENCY

Ini acceptance criterion penting.

Jika Accounting menunjukkan:

Omzet: Rp100.000
Profit: Rp35.000
Transaksi: 10

maka report export dengan filter yang sama harus menghasilkan angka yang konsisten.

Jangan membuat:

Accounting Query A
Export Query B

yang menghasilkan angka berbeda.

Jika memungkinkan, gunakan service/query builder bersama agar source of truth perhitungan tetap satu.

M. TESTING

Buat/extend Feature Test untuk:

Authorization
Admin dapat export.
Cashier mendapat 403.
Date Filter
today
yesterday
last 7 days
custom range
Data Accuracy
total omzet benar
jumlah transaksi benar
quantity benar
profit benar
historical buy_price digunakan
Historical Consistency

Ubah products.buy_price.

Pastikan hasil export transaksi lama tidak berubah.

Stock

Pastikan Stock Movement menggunakan:

stock_before
stock_after

yang sudah tersedia.

Audit

Pastikan export tercatat jika audit integration memang digunakan.

Regression

Pastikan:

checkout
inventory
transaction history
receipt
dashboard
accounting
audit logs
settings
user management

tetap bekerja.

N. N+1 / PERFORMANCE VERIFICATION

Audit query export.

Pastikan tidak ada pola:

foreach products
    query sales

atau:

foreach sales
    query cashier

Gunakan query aggregation/eager loading yang sesuai.

Jangan mengklaim "no N+1" tanpa memeriksa implementation.

O. BUILD & TEST

Wajib jalankan:

php artisan test

Kemudian:

npm run build

Jika menambahkan dependency:

composer audit
npm audit

Jangan melakukan major dependency upgrade tanpa alasan kuat.

P. BROWSER VERIFICATION

Karena Phase 9 menunjukkan pentingnya verifikasi UI, Phase 10 wajib melakukan browser verification jika environment memungkinkan.

Sebagai Admin:

Buka Accounting.
Pilih filter tanggal.
Klik Export.
Pastikan file berhasil dibuat.
Pastikan nama file masuk akal.
Pastikan isi file sesuai filter.
Bandingkan angka utama dengan Accounting.

Sebagai Cashier:

Coba akses endpoint export langsung.
Pastikan:
403 Forbidden
Q. FINAL ACCEPTANCE CRITERIA

Phase 10 hanya dapat dinyatakan PASS jika:

[ ] Admin dapat export report
[ ] Cashier mendapat 403
[ ] Filter tanggal bekerja
[ ] CSV berhasil
[ ] Data export konsisten dengan Accounting
[ ] Historical buy_price benar
[ ] Product buy_price saat ini tidak mengubah histori
[ ] Stock movement menggunakan source of truth yang benar
[ ] Tidak ada N+1
[ ] Audit export sesuai architecture
[ ] Dashboard tidak berubah
[ ] Accounting tidak rusak
[ ] POS tidak rusak
[ ] Inventory tidak rusak
[ ] Audit Log tidak rusak
[ ] Settings tidak rusak
[ ] Full test PASS
[ ] npm build PASS
[ ] Tidak ada destructive database operation
R. FINAL REPORT

Agent wajib memberikan laporan aktual:

A. Phase 10 Status
B. Existing Reporting Audit
C. Export Architecture
D. Sales Summary Export
E. Daily Sales Export
F. Product Performance Export
G. Cashier Performance Export
H. Stock Movement Export
I. Date Filter
J. Historical Buy Price
K. Authorization
L. Audit Log
M. Performance / N+1
N. Browser Verification
O. Tests
P. Build
Q. Data Preservation
R. Phase 1–9 Regression
S. Files Changed
T. Final PASS/PARTIAL/FAIL

Jangan memberikan angka target. Gunakan output command yang benar-benar dijalankan.