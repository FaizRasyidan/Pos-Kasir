PHASE 9 RECOVERY — CORRECTION REGISTRATION ROLE & ADMIN COMMAND CENTER
STATUS

Phase 9 sebelumnya dilaporkan:

PASS — 83/83 tests passed, 330 assertions

Namun setelah dilakukan audit terhadap requirement asli Phase 9, ditemukan ketidaksesuaian requirement penting pada sistem registration.

Selain itu, perlu dilakukan verifikasi ulang terhadap desain Admin Dashboard, karena Dashboard Admin tidak boleh menjadi duplikasi dari menu Accounting yang sudah ada.

JANGAN MENGULANG PHASE 9 DARI AWAL.

Lakukan targeted recovery/correction hanya pada bagian yang memang tidak sesuai.

TEMUAN UTAMA YANG WAJIB DIPERBAIKI

Laporan Phase 9 sebelumnya menyatakan:

Public registration aman, role otomatis cashier.

INI TIDAK SESUAI REQUIREMENT.

Requirement yang benar adalah:

PUBLIC REGISTRATION
↓
ADMIN
↓
ADMIN CREATE CASHIER
↓
CASHIER
↓
CASHIER LOGIN
↓
POS

Dengan demikian:

Public Registration

Harus otomatis:

role = admin
Admin membuat akun kasir

Harus otomatis:

role = cashier

User tidak boleh memilih role secara bebas dari frontend.

STEP 1 — AUDIT IMPLEMENTASI REGISTRATION SAAT INI

Sebelum mengubah kode, audit:

registration route
registration controller/action
Fortify registration flow
User model
users migration/schema
role field
validation
password hashing
existing registration test
authorization middleware
existing Phase 1–8 behavior

Cari secara konkret di source code bagaimana role saat registration ditentukan.

Jangan mengandalkan laporan Phase 9 sebelumnya.

STEP 2 — PERBAIKI PUBLIC REGISTRATION

Requirement final:

Ketika user mendaftar melalui halaman:

/register

maka:

New User
↓
role = admin
Contoh

User mengisi:

Name : Budi
Email : budi@gmail.com
Password : ********

Maka database harus menghasilkan:

name = Budi
email = budi@gmail.com
role = admin
SECURITY REQUIREMENT

Role tidak boleh berasal dari pilihan frontend.

Jangan membuat:

Role:
[Admin]
[Cashier]

di public registration.

Jangan mempercayai:

role=admin

dari request client.

Backend harus menentukan:

Public Registration → admin

secara server-side.

STEP 3 — ADMIN CREATE CASHIER

Pastikan fitur User Management yang sudah dibuat pada Phase 9 tetap berfungsi.

Flow:

Admin
↓
Manajemen Pengguna
↓
Tambah Kasir
↓
Nama
Email
Password
Konfirmasi Password
↓
role = cashier

Admin tidak perlu memilih role ketika membuat kasir.

Backend menentukan:

Admin Create Cashier → cashier
STEP 4 — CASHIER LOGIN

Pastikan akun yang dibuat Admin dapat digunakan untuk login.

Flow:

Admin creates cashier
↓
Cashier account created
↓
Cashier email + password
↓
Login
↓
Cashier authenticated
↓
Cashier POS

Password harus tetap menggunakan hashing Laravel yang sudah digunakan project.

Jangan menyimpan password plaintext.

STEP 5 — PRIVILEGE ESCALATION PROTECTION

Pastikan Cashier tidak dapat:

Create Admin
Create Cashier
Change own role
Change another user's role
Access User Management
Access Admin-only pages

Semua harus dicegah di backend.

Jangan hanya menyembunyikan menu dari sidebar.

Jika Cashier mencoba mengakses endpoint secara langsung:

HTTP 403 Forbidden

sesuai authorization system yang sudah ada.

STEP 6 — ACCOUNT STATUS

Jika sistem user saat ini sudah memiliki mekanisme:

is_active

atau status akun, gunakan mekanisme tersebut.

Jangan membuat sistem status kedua.

Jika memang belum ada dan diperlukan untuk User Management, audit terlebih dahulu apakah penambahan status benar-benar dibutuhkan.

Tujuannya:

Admin
↓
Deactivate Cashier
↓
Cashier tidak dapat login

tetapi:

historical sales
audit logs

tetap aman.

Jangan menghapus user hanya untuk menonaktifkan akun.

STEP 7 — AUDIT LOG

Pertahankan integrasi AuditLogService dari Phase 7.

Pastikan aktivitas user management tetap tercatat.

Minimal:

create_user
update_user
deactivate_user
role_changed
password_updated

Gunakan naming convention yang sudah digunakan project jika berbeda.

SENSITIVE DATA

Audit Log TIDAK BOLEH menyimpan:

password
password_confirmation
password_hash
token
API key
secret
authentication credential

Pastikan sanitization existing Phase 7 tidak rusak.

STEP 8 — AUDIT ADMIN DASHBOARD

Sekarang audit bagian Dashboard.

Ini sangat penting.

Pada aplikasi saat ini sudah terdapat menu:

Accounting

yang telah memiliki data analytics seperti:

Omzet
Keuntungan
Total transaksi
Rata-rata transaksi
Tren penjualan
Produk terlaris
dan analytics lainnya.
JANGAN MEMBUAT ADMIN DASHBOARD MENJADI DUPLIKASI ACCOUNTING.

Jangan menghasilkan:

Dashboard
├── Revenue
├── Profit
├── Sales Trend
├── Top Products
└── Cashier Performance

Accounting
├── Revenue
├── Profit
├── Sales Trend
├── Top Products
└── Cashier Performance

Ini tidak diinginkan.

KONSEP FINAL ADMIN DASHBOARD

Admin Dashboard harus menjadi:

STORE COMMAND CENTER

Fungsinya:

Monitoring kondisi operasional toko dan memberikan tindakan cepat kepada Admin.

Sedangkan:

Accounting = Detailed Business Analytics

STEP 9 — ADMIN DASHBOARD STRUCTURE

Gunakan struktur berikut sebagai guideline.

1. Today's Snapshot

Boleh menampilkan beberapa angka penting sebagai snapshot, tetapi jangan membuat analytics lengkap.

Contoh:

TODAY'S SNAPSHOT

Revenue
Rp 4.250.000

Transactions
128

Items Sold
384

Active Cashiers
3

Tambahkan:

[View Accounting →]

yang mengarah ke menu Accounting.

Tujuannya adalah:

Dashboard memberi gambaran cepat.

Bukan menggantikan Accounting.

2. STORE HEALTH

Buat komponen:

STORE HEALTH

yang menggambarkan kondisi operasional toko.

Contoh:

Inventory
🟢 Healthy

Users
🟢 Healthy

System
🟢 Operational

Gunakan data aktual dari sistem.

Jangan menggunakan dummy data.

3. NEEDS ATTENTION

Ini harus menjadi salah satu komponen utama Dashboard.

Contoh:

NEEDS ATTENTION

⚠ 7 produk stok menipis
[Review Inventory]

⚠ 1 akun kasir nonaktif
[Manage Users]

⚠ 3 aktivitas penting terbaru
[View Activity]

Dashboard harus membantu Admin mengetahui:

Apa yang perlu saya lakukan sekarang?

4. RECENT ACTIVITY

Gunakan Audit Log Phase 7.

Contoh:

RECENT ACTIVITY

● Transaction completed
POS-20260915-001
10:42

● Product updated
Indomie Goreng
10:35

● Cashier account created
Andi
10:21

● Stock adjusted
Aqua 600ml
10:15

Tampilkan hanya aktivitas penting/recent.

Jangan menampilkan seluruh Audit Log.

Tambahkan:

[View All Activity →]

menuju /audit-logs.

5. QUICK ACTIONS

Dashboard harus menjadi starting point Admin.

Contoh:

QUICK ACTIONS

[ + Add Product ]

[ + Add Cashier ]

[ 📦 Inventory ]

[ 📊 Accounting ]

[ ⚙ Store Settings ]

[ 🔐 Audit Logs ]

Semua action harus mengikuti authorization.

6. STORE INSIGHT

Buat komponen sederhana:

STORE INSIGHT

Tujuannya bukan membuat analytics baru.

Tujuannya memberikan interpretasi kondisi toko.

Contoh:

💡 Store Insight

Toko beroperasi normal hari ini.

Namun terdapat 7 produk yang berada pada
batas minimum stok dan perlu diperiksa.

Atau:

💡 Store Insight

Terdapat 3 kasir aktif dan seluruh akun kasir
saat ini dapat digunakan.

Gunakan rule/aggregation sederhana berdasarkan data aktual.

JANGAN
menggunakan dummy insight
menggunakan API AI eksternal
membuat sistem AI baru
menambahkan dependency besar hanya untuk insight

AI tidak diperlukan untuk Phase 9.

STEP 10 — ACCOUNTING TETAP SEBAGAI ANALYTICS CENTER

Jangan menghapus atau merusak fitur Accounting.

Pembagian fungsi harus menjadi:

Menu Fungsi
Dashboard Monitor kondisi toko
POS Transaksi & checkout
Accounting Analisis bisnis
Products Manajemen produk
Users Manajemen pengguna
Settings Konfigurasi toko
Audit Logs Riwayat aktivitas
Prinsip:
Dashboard
→ "Apa yang sedang terjadi?"

Accounting
→ "Bagaimana performa bisnis saya?"

POS
→ "Bagaimana melakukan transaksi?"

Users
→ "Siapa yang menggunakan sistem?"

Audit Logs
→ "Apa yang telah dilakukan?"
STEP 11 — SALES TREND ACCOUNTING

Pertahankan perbaikan grafik Accounting yang sudah dibuat.

Requirement:

Tren omzet harus berdasarkan data harian.

Contoh:

8 Sep Rp18.000
9 Sep Rp22.000 ↗
10 Sep Rp19.000 ↘
11 Sep Rp25.000 ↗
12 Sep Rp28.000 ↗
13 Sep Rp24.000 ↘
14 Sep Rp36.000 ↗

Grafik harus membuat Admin dapat melihat:

kenaikan
penurunan
fluktuasi

dengan jelas.

Pertahankan:

database-side aggregation
daily data points
day-over-day indicator
no dummy data

Jangan mengganti grafik kembali ke desain lama yang sulit membaca tren.

STEP 12 — PERFORMANCE

Pastikan Dashboard baru tidak menimbulkan N+1.

Gunakan database aggregation jika diperlukan:

COUNT
SUM
AVG
GROUP BY
ORDER BY
LIMIT

Jangan:

Model::all()

kemudian menghitung semuanya di PHP.

Jangan membuat:

Dashboard
↓
query every product
↓
query every cashier
↓
query every audit log
↓
query every date

Audit query yang digunakan Dashboard.

STEP 13 — DATA CONSISTENCY

Dashboard harus menggunakan data aktual.

Pastikan:

Dashboard
Accounting
Sales History
Inventory
Audit Logs

tidak memiliki perhitungan yang saling bertentangan.

Khusus profit historical:

(price - sale_items.buy_price) * quantity

Tetap gunakan:

sale_items.buy_price

bukan:

products.buy_price

untuk historical transaction.

STEP 14 — UPDATE AUTOMATED TEST

Jangan hanya menjalankan test lama.

Tambahkan atau update test untuk memastikan requirement sebenarnya.

Registration

WAJIB:

Public registration
↓
User created
↓
role === admin
Admin creates cashier

WAJIB:

Admin
↓
Create Cashier
↓
role === cashier
Cashier login

WAJIB:

Cashier credentials
↓
Login success
Privilege escalation

WAJIB:

Cashier → create user = 403
Cashier → change role = 403
Cashier → user management = 403
Audit

Pastikan:

User creation
User update
User status change

tercatat.

Password tidak boleh masuk audit log.

STEP 15 — DASHBOARD TEST

Test minimal:

Admin
Admin → Dashboard = 200
Dashboard data

Pastikan:

Today's Snapshot menggunakan data aktual
Store Health menggunakan data aktual
Needs Attention menggunakan data aktual
Recent Activity menggunakan Audit Log
Quick Actions memiliki route yang benar
Store Insight tidak menggunakan dummy data
Accounting

Pastikan Accounting tetap berfungsi.

Sales Trend

Pastikan data harian tetap benar.

STEP 16 — BROWSER VERIFICATION

WAJIB lakukan verifikasi aktual jika environment memungkinkan.

Test 1 — Registration

Buka:

/register

Daftar akun baru.

Verifikasi:

role = admin
Test 2 — Admin Login

Login menggunakan akun tersebut.

Pastikan masuk sebagai Admin.

Test 3 — User Management

Buka:

Manajemen Pengguna

Buat:

Nama: Test Cashier
Email: test-cashier@example.com
Password: ********

Pastikan account dibuat sebagai:

cashier
Test 4 — Cashier Login

Logout.

Login menggunakan:

test-cashier@example.com
password

Pastikan berhasil login sebagai Cashier.

Test 5 — Cashier Restriction

Coba akses Admin-only route secara langsung.

Pastikan:

403 Forbidden
Test 6 — Admin Dashboard

Login sebagai Admin.

Verifikasi:

Dashboard tidak terlihat seperti halaman POS
Dashboard tidak menduplikasi Accounting
Today's Snapshot muncul
Store Health muncul
Needs Attention muncul
Recent Activity muncul
Quick Actions berfungsi
Store Insight muncul
UI responsive
tidak ada dummy data
Test 7 — Accounting

Buka Accounting.

Pastikan grafik tren omzet:

daily points +
visible upward/downward movement +
day-over-day comparison

tetap berfungsi.

STEP 17 — REGRESSION

WAJIB:

php artisan test

dan:

npm run build

Jika tersedia:

php artisan route:list

audit kembali route:

registration
users
dashboard
accounting
audit-logs
STEP 18 — DATA PRESERVATION

ABSOLUTELY FORBIDDEN:

php artisan migrate:fresh
php artisan migrate:refresh
php artisan db:wipe

Dilarang:

DROP TABLE
TRUNCATE
DELETE existing sales
DELETE existing sale_items
DELETE existing products
DELETE existing users
DELETE audit_logs

Jangan reset database.

Jangan menghapus transaksi lama.

Jangan menghapus audit log lama.

Jika migration benar-benar diperlukan:

hanya additive dan non-destructive.

STEP 19 — FINAL REPORT

Jangan hanya mengatakan:

Phase 9 PASS.

Berikan laporan:

A. Status

PASS / PARTIAL / FAIL

B. Registration Role

Buktikan public registration menghasilkan:

role = admin
C. Cashier Management

Buktikan Admin dapat membuat Cashier.

D. Cashier Login

Buktikan Cashier dapat login menggunakan credential yang dibuat Admin.

E. Authorization

Admin vs Cashier.

F. Audit Log

User management events.

G. Dashboard Redesign

Jelaskan desain baru.

H. Dashboard vs Accounting

Jelaskan bagaimana Dashboard tidak menduplikasi Accounting.

I. Accounting Trend

Jelaskan daily trend + day-over-day.

J. Performance

Jelaskan query/aggregation/N+1.

K. Testing

Jumlah test + assertion.

L. Browser Verification

Berikan hasil aktual.

M. Build

Hasil npm run build.

N. Regression Phase 1–8

Berikan hasil.

O. Data Preservation

Konfirmasi data existing tetap aman.

P. Requirement Matrix

Gunakan:

Requirement Status Evidence
Public Registration → Admin
Admin Create Cashier
Cashier Login
Password Security
Privilege Escalation Protection
User Management
User Audit Log
Admin Dashboard
Dashboard ≠ Accounting
Store Health
Needs Attention
Recent Activity
Quick Actions
Store Insight
Accounting Daily Trend
Day-over-Day Indicator
Performance / No N+1
Regression
Data Preservation
DEFINITION OF DONE

Phase 9 Recovery hanya boleh dinyatakan PASS apabila seluruh flow berikut benar-benar terbukti:

PUBLIC REGISTER
↓
ADMIN
↓
MANAGE USERS
↓
CREATE CASHIER
↓
CASHIER
↓
LOGIN
↓
POS

dan Admin Dashboard:

STORE COMMAND CENTER

Today's Snapshot
↓
Store Health
↓
Needs Attention
↓
Recent Activity
↓
Quick Actions
↓
Store Insight

sementara:

ACCOUNTING
↓
DETAILED BUSINESS ANALYTICS
PRINSIP TERAKHIR

Jangan mengubah fitur Phase 1–8 yang sudah benar.

Jangan mengulang implementasi yang sudah PASS.

Jangan melemahkan test hanya agar PASS.

Jangan mengklaim browser verification jika hanya membaca source code.

Jangan mengklaim Phase 9 PASS apabila public registration masih menghasilkan Cashier.

Fokus recovery:

1. Public Registration → Admin
2. Admin → Create Cashier
3. Cashier → Login & POS
4. Authorization & Audit Security
5. Dashboard sebagai Store Command Center, bukan Accounting kedua
6. Accounting tetap menjadi pusat analytics dengan tren omzet harian yang jelas.
