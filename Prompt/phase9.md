# PROJECT POS-Kasir

# PHASE 9 — ACCOUNT MANAGEMENT, ADMIN DASHBOARD REDESIGN & SALES TREND ANALYTICS

### STATUS

Phase 1 — PASS

Phase 2 — PASS

Phase 3 — PASS

Phase 4 — PASS

Phase 5 — PASS

Phase 6 — PASS

Phase 7 — PASS

Phase 8 — PASS / PRODUCTION READY

Phase 9 — NOT STARTED

==================================================

# IMPORTANT PRECONDITION

Phase 9 adalah fase pengembangan fitur setelah:

```text
SECURITY HARDENING
+
PERFORMANCE
+
PRODUCTION READINESS
```

Phase 1–8 telah menjadi fondasi aplikasi.

Jangan menganggap Phase 9 sebagai kesempatan untuk melakukan rewrite architecture.

Jangan mengulang implementasi:

```text
Phase 1 — Authentication / Authorization
Phase 2 — Inventory Integrity
Phase 3 — Checkout / Transactions
Phase 4 — Receipt / Printing
Phase 5 — Reports / Analytics
Phase 6 — Store Settings
Phase 7 — Audit Logs
Phase 8 — Security / Performance / Production Readiness
```

kecuali audit menemukan bug yang benar-benar membutuhkan perubahan.

Phase 9 harus:

```text
ADD FEATURE
+
IMPROVE UX
+
PRESERVE SECURITY
+
PRESERVE DATA
+
PRESERVE BUSINESS LOGIC
```

Bukan:

```text
REBUILD APPLICATION
```

==================================================

# A. TUJUAN PHASE 9

Tujuan utama Phase 9 adalah meningkatkan:

```text
ACCOUNT MANAGEMENT
+
USER ONBOARDING
+
ADMIN OPERATIONS
+
DASHBOARD UX
+
SALES TREND VISUALIZATION
```

Phase 9 memiliki fokus utama:

1. Public user registration.
2. Registration menghasilkan akun dengan role yang aman.
3. User hasil registration diarahkan ke proses Admin sesuai existing business flow.
4. Admin dapat membuat akun Cashier.
5. Cashier memiliki email dan password untuk login.
6. Login menggunakan email + password secara konsisten.
7. Admin dapat mengelola akun Cashier.
8. Authorization Admin/Cashier tetap ketat.
9. Admin Dashboard didesain ulang agar lebih informatif.
10. Accounting Dashboard menampilkan trend omzet harian yang benar-benar dapat dibaca.
11. Grafik omzet tidak hanya menunjukkan total, tetapi menunjukkan naik/turun antarhari.
12. Seluruh data grafik berasal dari database.
13. Tidak boleh menggunakan dummy/static data.
14. Existing POS behavior tetap dipertahankan.

Fokus:

```text
ACCOUNT MANAGEMENT

+

ADMIN EXPERIENCE

+

CASHIER MANAGEMENT

+

DASHBOARD UX

+

DAILY SALES TREND

+

REGRESSION SAFETY
```

==================================================

# B. PRINCIPLE UTAMA

Jangan melakukan rewrite besar.

Jangan mengganti Laravel authentication architecture jika existing masih dapat digunakan.

Jangan mengganti database.

Jangan mengganti inventory source of truth.

Jangan mengganti CheckoutService.

Jangan mengganti stock movement architecture.

Jangan mengganti AuditLogService.

Jangan menghapus authorization existing.

Jangan mengubah historical transaction.

Jangan mengubah historical buy_price.

Jangan mengubah stock history.

Jangan menggunakan dummy data untuk dashboard.

Semua perubahan harus:

```text
targeted
minimal
backward-compatible
secure
testable
non-destructive
```

Jika existing implementation sudah benar:

```text
KEEP IT
```

Jika perlu perubahan:

```text
AUDIT
→ DESIGN
→ IMPLEMENT
→ TEST
→ REGRESSION
→ VERIFY
```

==================================================

# C. DATA PRESERVATION

DILARANG:

```text
migrate:fresh
migrate:refresh
db:wipe
TRUNCATE
DROP
database reset
```

Jangan menghapus:

```text
sales
sale_items
products
categories
users
stock_movements
settings
audit_logs
```

Jangan mengubah:

```text
historical transaction
historical buy_price
historical stock movement
historical audit logs
```

Jika perubahan database diperlukan:

```text
additive
non-destructive
backward-compatible
```

Jika tabel `users` existing perlu diperluas:

```text
ADD ONLY
```

Jangan menghapus column existing hanya karena architecture Phase 9 berbeda.

==================================================

# D. STEP 9.1 — PRE-FLIGHT AUDIT PHASE 1–8

Sebelum melakukan perubahan:

Audit terlebih dahulu.

Buat matrix:

```text
Phase | Requirement | Status | Evidence
```

Verifikasi:

### Phase 1

```text
authentication
authorization
Admin
Cashier
backend protection
403 behavior
route middleware
```

### Phase 2

```text
stock integrity
stock movement
stock_before
stock_after
buy_price snapshot
transaction
lockForUpdate
```

### Phase 3

```text
checkout
payment
transaction
server-side calculation
```

### Phase 4

```text
receipt
printing
reprint
historical transaction
```

### Phase 5

```text
reports
dashboard
sales analytics
profit
date filtering
product analytics
```

### Phase 6

```text
Store Settings
settings persistence
receipt integration
```

### Phase 7

```text
audit_logs
AuditLogService
sanitization
immutability
monitoring
authorization
```

### Phase 8

```text
security
validation
CSRF
mass assignment
N+1
pagination
production configuration
dependency audit
build
regression
```

Jangan mulai implementasi jika ditemukan regression kritis pada Phase 1–8.

==================================================

# E. STEP 9.2 — PUBLIC REGISTRATION

Implementasikan atau sempurnakan public registration.

Public user harus dapat melakukan:

```text
Registration
↓
Account creation
↓
Login
```

Minimal field:

```text
name
email
password
password_confirmation
```

Pastikan backend melakukan validation.

Validation minimal:

```text
name required
email required
email valid
email unique
password required
password confirmation matches
password securely hashed
```

Jangan menyimpan password plaintext.

Jangan menggunakan:

```text
md5
sha1
plaintext password
```

Gunakan Laravel password hashing mechanism yang existing/standard.

==================================================

# F. STEP 9.3 — REGISTRATION ROLE SECURITY

Public registration TIDAK BOLEH memungkinkan user menentukan role secara bebas.

Jangan menerima:

```text
role=admin
role=cashier
role=superadmin
```

dari public request.

Jangan:

```php
$request->all()
```

langsung digunakan untuk membuat User.

Pastikan role ditentukan oleh backend berdasarkan business rule.

Public registration tidak boleh digunakan untuk privilege escalation.

Test:

```text
Public User → cannot create Admin
Public User → cannot create Cashier
Public User → cannot modify role through request
```

Jika registration memang dimaksudkan untuk menghasilkan Admin sesuai business flow aplikasi:

```text
registration
→ controlled Admin account creation
```

pastikan role tersebut diberikan oleh server-side logic, bukan input user.

==================================================

# G. STEP 9.4 — ADMIN CREATED CASHIER ACCOUNT

Admin harus dapat membuat akun Cashier.

Flow:

```text
Admin Login
↓
User / Cashier Management
↓
Create Cashier
↓
Name
Email
Password
Password Confirmation
↓
Backend Validation
↓
Cashier Account Created
```

Cashier harus mempunyai:

```text
name
email
password
cashier role
```

Pastikan email unique.

Pastikan password di-hash.

Admin boleh membuat Cashier.

Cashier tidak boleh membuat Cashier.

Public user tidak boleh membuat Cashier.

Expected authorization:

```text
Admin → Create Cashier → ALLOWED

Cashier → Create Cashier → 403

Public User → Create Cashier → DENIED
```

==================================================

# H. STEP 9.5 — CASHIER MANAGEMENT

Admin harus dapat mengelola akun Cashier sesuai kebutuhan existing architecture.

Minimal:

```text
View Cashier
Create Cashier
Edit Cashier
Reset / Update Password
Deactivate / Delete according to existing user strategy
```

Namun:

Jangan menghapus user secara destructive jika user tersebut sudah memiliki historical transactions.

Jika user memiliki historical sales:

```text
PRESERVE HISTORICAL USER RELATION
```

Gunakan existing soft-delete/deactivation strategy jika tersedia.

Jangan mengubah historical transaction hanya karena akun Cashier dinonaktifkan.

Historical transaction tetap harus menunjukkan cashier yang melakukan transaksi.

==================================================

# I. STEP 9.6 — LOGIN USING EMAIL + PASSWORD

Standardize authentication agar login menggunakan:

```text
email
+
password
```

Audit existing login flow.

Pastikan:

```text
Admin → email + password → login

Cashier → email + password → login
```

Jangan membuat:

```text
Admin login menggunakan username
Cashier login menggunakan email
```

jika tujuan Phase 9 adalah standardisasi email authentication.

Gunakan existing Laravel authentication mechanism apabila memungkinkan.

Jangan membuat authentication system baru.

Test:

```text
valid email + valid password → PASS

invalid email → reject

invalid password → reject

inactive/deactivated account → reject

empty email → validation error

empty password → validation error
```

==================================================

# J. STEP 9.7 — AUTHORIZATION AFTER LOGIN

Setelah login:

```text
Admin
↓
Admin Dashboard
```

dan:

```text
Cashier
↓
Cashier Dashboard / POS
```

sesuai existing application flow.

Cashier tetap tidak boleh mengakses:

```text
Store Settings
Audit Logs
Admin User Management
Admin-only configuration
```

melalui URL langsung.

Jangan hanya menyembunyikan menu.

Backend authorization wajib tetap berlaku.

Expected:

```text
Admin → Admin resources → ALLOWED

Cashier → Admin resources → 403
```

==================================================

# K. STEP 9.8 — AUDIT LOG INTEGRATION FOR ACCOUNT MANAGEMENT

Account-related state changes harus mengikuti AuditLogService Phase 7.

Perhatikan:

```text
Admin creates Cashier
Admin updates Cashier
Admin changes Cashier status
Admin changes Cashier password
```

Audit log harus:

```text
centralized
sanitized
immutable
```

Jangan menyimpan:

```text
password
password_hash
session credential
token
secret
```

ke audit log.

Contoh event yang boleh dicatat:

```text
cashier.created
cashier.updated
cashier.deactivated
cashier.password_updated
```

Gunakan architecture AuditLogService existing.

Jangan membuat sistem audit kedua.

==================================================

# L. STEP 9.9 — ADMIN DASHBOARD REDESIGN

Redesign Admin Dashboard.

Tujuan utama:

```text
INFORMATION DENSITY
+
READABILITY
+
ACTIONABILITY
```

Dashboard harus membantu Admin memahami kondisi toko dengan cepat.

Jangan hanya membuat dashboard terlihat lebih modern.

Informasi harus memiliki fungsi.

Minimal pertimbangkan:

```text
Today's Revenue
Today's Transactions
Products
Low Stock
Cashier Activity
Sales Trend
Recent Transactions
```

Gunakan data database actual.

Jangan menggunakan:

```text
dummy numbers
random numbers
hardcoded chart values
```

==================================================

# M. STEP 9.10 — DASHBOARD INFORMATION HIERARCHY

Susun dashboard dengan hierarchy yang jelas.

Prioritas:

```text
1. Revenue
2. Transactions
3. Sales Trend
4. Stock Status
5. Cashier / Operational Activity
6. Recent Transactions
```

Pastikan Admin dapat memahami:

```text
berapa omzet hari ini
berapa transaksi hari ini
apakah penjualan naik atau turun
bagaimana kondisi stok
apa transaksi terbaru
```

dengan cepat.

Jangan membuat terlalu banyak card yang tidak memberikan informasi penting.

==================================================

# N. STEP 9.11 — ACCOUNTING DAILY SALES TREND

Accounting Dashboard harus memiliki grafik omzet harian.

Masalah existing:

Grafik sebelumnya belum cukup menunjukkan apakah penjualan:

```text
NAIK
```

atau:

```text
TURUN
```

dari hari ke hari.

Phase 9 harus memperbaiki hal tersebut.

Gunakan:

```text
LINE CHART
```

dengan:

```text
1 POINT = 1 DAY
```

Contoh data:

```text
8 Sep  → Rp18.000
9 Sep  → Rp22.000
10 Sep → Rp19.000
11 Sep → Rp25.000
12 Sep → Rp28.000
13 Sep → Rp24.000
14 Sep → Rp36.000
```

Grafik harus menunjukkan bentuk:

```text
18k
  \
   22k
    \
     19k
       \
        25k
          \
           28k
             \
              24k
                \
                 36k
```

Tujuannya agar Admin dapat langsung melihat:

```text
trend naik
trend turun
fluktuasi
hari dengan omzet tertinggi
hari dengan omzet terendah
```

Jangan membuat grafik yang hanya menunjukkan:

```text
total omzet periode
```

tanpa distribusi harian.

==================================================

# O. STEP 9.12 — DAILY SALES AGGREGATION

Data grafik harus berasal dari database.

Gunakan aggregation database-side.

Konsep:

```text
sales
↓
filter date range
↓
GROUP BY date
↓
SUM revenue
↓
ORDER BY date ASC
↓
chart
```

Jangan:

```text
load all transactions
↓
calculate everything in JavaScript
```

jika database dapat melakukan aggregation.

Gunakan:

```text
SUM
GROUP BY
ORDER BY
```

sesuai database/application architecture existing.

==================================================

# P. STEP 9.13 — DAILY TREND DATE FILTER

Grafik harus mengikuti date range yang digunakan.

Contoh:

```text
Today
This Week
This Month
Custom Range
```

Jika user memilih:

```text
1 Sep – 14 Sep
```

maka chart menampilkan:

```text
1 Sep
2 Sep
3 Sep
...
14 Sep
```

Jika suatu hari tidak memiliki transaksi:

```text
hari tersebut tetap dapat ditampilkan
```

dengan omzet:

```text
Rp0
```

apabila sesuai dengan behavior/filter existing.

Jangan membuat hari kosong hilang tanpa alasan karena dapat membuat trend visual menjadi menyesatkan.

==================================================

# Q. STEP 9.14 — DAY-OVER-DAY INDICATOR

Selain line chart, tampilkan informasi perubahan jika memungkinkan secara konsisten dengan existing UI.

Contoh:

```text
Today's Revenue
Rp36.000

vs Yesterday
+50%
```

Jika:

```text
today < yesterday
```

maka:

```text
-%
```

Jika:

```text
today = yesterday
```

maka:

```text
0%
```

Formula:

```text
((today - yesterday) / yesterday) × 100
```

Edge case:

Jika yesterday = 0:

Jangan menghasilkan:

```text
Infinity
NaN
division by zero
```

Gunakan representation yang aman seperti:

```text
No previous sales
```

atau behavior yang sesuai dengan existing UI.

==================================================

# R. STEP 9.15 — CHART UX

Chart harus mudah dibaca.

Minimal:

```text
X-axis  → Date
Y-axis  → Revenue
Line    → Daily Revenue
Point   → Daily Revenue
Tooltip → Exact Date + Revenue
```

Contoh tooltip:

```text
14 September 2026
Omzet: Rp36.000
```

Jangan menampilkan:

```text
1
2
3
4
```

sebagai label tanggal apabila tanggal sebenarnya tersedia.

Gunakan format tanggal yang mudah dipahami user Indonesia.

==================================================

# S. STEP 9.16 — ACCOUNTING DATA CONSISTENCY

Pastikan omzet pada dashboard menggunakan source of truth transaksi existing.

Jangan menghitung omzet berdasarkan:

```text
frontend cart
product price current
temporary session data
dummy data
```

Gunakan transaction/sales data yang sudah menjadi source of truth.

Historical transaction harus tetap menggunakan historical data.

Jangan mengubah:

```text
sale_items.buy_price
```

hanya untuk memperbaiki grafik.

==================================================

# T. STEP 9.17 — DASHBOARD QUERY PERFORMANCE

Dashboard redesign tidak boleh menghasilkan N+1.

Audit:

```text
revenue query
transaction query
stock query
cashier activity query
recent transactions query
daily trend query
```

Gunakan aggregation untuk metric.

Gunakan eager loading hanya jika diperlukan.

Jangan menjalankan query yang sama berulang kali.

Target:

```text
few predictable queries
```

bukan:

```text
query per card
query per row
query per chart point
```

==================================================

# U. STEP 9.18 — RESPONSIVE UI

Admin Dashboard harus tetap usable pada:

```text
Desktop
Laptop
Tablet
```

Prioritas utama:

```text
Desktop / Laptop
```

karena dashboard Admin digunakan untuk operational monitoring.

Jangan mengubah layout POS Cashier secara besar-besaran jika tidak diperlukan.

Phase 9 fokus pada Admin Dashboard.

==================================================

# V. STEP 9.19 — UI PRESERVATION

Jangan merusak:

```text
navigation
sidebar
existing routes
POS interface
checkout interface
receipt
product management
settings
audit log
```

kecuali memang diperlukan oleh redesign.

Jika component existing masih reusable:

```text
REUSE IT
```

Jangan membuat duplicate component tanpa alasan.

==================================================

# W. STEP 9.20 — BACKEND VALIDATION FOR USER MANAGEMENT

Semua user-management request harus divalidasi di backend.

Audit:

```text
Create Cashier
Update Cashier
Password Update
Status Update
```

Validation:

```text
name
email
password
role
status
```

Role harus ditentukan oleh authorization/backend logic.

Jangan mempercayai:

```text
role
is_admin
is_cashier
permissions
```

dari frontend.

==================================================

# X. STEP 9.21 — MASS ASSIGNMENT USER SECURITY

Audit User model.

Jangan memperbolehkan public request mengisi:

```text
role
permissions
is_admin
is_active
email_verified_at
```

secara arbitrary.

Gunakan explicit validated assignment.

Contoh prinsip:

```text
Public Registration
→ only allowed registration fields

Admin Create Cashier
→ explicitly assign cashier role server-side
```

==================================================

# Y. STEP 9.22 — USER ACCOUNT EDGE CASES

Test:

```text
duplicate email
invalid email
empty password
short password
password mismatch
duplicate cashier
unauthorized cashier creation
unauthorized role change
inactive account login
```

Pastikan error aman dan understandable.

Jangan expose database exception kepada user.

==================================================

# Z. STEP 9.23 — TESTING ACCOUNT MANAGEMENT

Tambahkan/pertahankan test:

### Registration

[ ] Public registration works

[ ] Valid registration creates account

[ ] Invalid registration rejected

[ ] Duplicate email rejected

[ ] Password hashed

[ ] Public registration cannot escalate role

### Admin Cashier Management

[ ] Admin can create Cashier

[ ] Cashier cannot create Cashier

[ ] Public user cannot create Cashier

[ ] Duplicate cashier email rejected

[ ] Admin can update Cashier

[ ] Unauthorized update blocked

### Authentication

[ ] Admin can login with email/password

[ ] Cashier can login with email/password

[ ] Invalid password rejected

[ ] Invalid email rejected

[ ] Inactive account cannot login

### Authorization

[ ] Cashier cannot access Admin Dashboard

[ ] Cashier cannot access Settings

[ ] Cashier cannot access Audit Logs

[ ] Cashier cannot access User Management

==================================================

# AA. STEP 9.24 — TESTING SALES TREND

Test daily aggregation.

Contoh dataset:

```text
8 Sep  → 18000
9 Sep  → 22000
10 Sep → 19000
11 Sep → 25000
12 Sep → 28000
13 Sep → 24000
14 Sep → 36000
```

Expected:

```text
8 Sep  → 18000
9 Sep  → 22000
10 Sep → 19000
11 Sep → 25000
12 Sep → 28000
13 Sep → 24000
14 Sep → 36000
```

Pastikan:

```text
ordered by date ASC
```

dan tidak berubah menjadi:

```text
unordered
```

Test:

```text
single day
multiple days
zero sales day
date range
empty date range
large date range
```

==================================================

# AB. STEP 9.25 — DAY-OVER-DAY TESTING

Test:

```text
Yesterday = 18.000
Today = 22.000
```

Expected:

```text
+22.22%
```

Test:

```text
Yesterday = 22.000
Today = 19.000
```

Expected:

```text
negative trend
```

Test:

```text
Yesterday = 19.000
Today = 19.000
```

Expected:

```text
0%
```

Test:

```text
Yesterday = 0
Today > 0
```

Expected:

```text
safe non-division-by-zero result
```

==================================================

# AC. STEP 9.26 — AUDIT LOG TESTING

Pastikan account-management action tercatat.

Minimal:

```text
Cashier Created
Cashier Updated
Cashier Status Changed
```

Sensitive values:

```text
password
password_hash
token
secret
```

tidak boleh muncul.

Audit log tetap:

```text
immutable
sanitized
centralized
```

==================================================

# AD. STEP 9.27 — FULL REGRESSION TEST

Setelah implementation:

Jalankan:

```bash
php artisan test
```

Pastikan:

```text
Phase 1 — PASS
Phase 2 — PASS
Phase 3 — PASS
Phase 4 — PASS
Phase 5 — PASS
Phase 6 — PASS
Phase 7 — PASS
Phase 8 — PASS
Phase 9 — PASS
```

Jika existing test gagal:

```text
DO NOT DELETE TEST
DO NOT WEAKEN ASSERTION
DO NOT SKIP TEST
```

Cari root cause.

==================================================

# AE. STEP 9.28 — FRONTEND BUILD

Jalankan:

```bash
npm run build
```

Pastikan:

```text
build succeeds
no missing import
no unresolved module
no TypeScript error
no broken route
no obvious runtime error
```

Pastikan chart library existing atau library yang digunakan tidak merusak existing build.

Jangan melakukan dependency upgrade besar hanya untuk chart apabila library existing sudah cukup.

==================================================

# AF. STEP 9.29 — PRODUCTION SAFETY

Pastikan Phase 9 tidak merusak security Phase 8.

Verifikasi:

```text
CSRF
authorization
mass assignment
backend validation
password hashing
session
error handling
sensitive data sanitization
```

Tetap aktif.

Jangan membuat endpoint public baru yang memungkinkan:

```text
privilege escalation
user enumeration
unauthorized account creation
unauthorized role assignment
```

==================================================

# AG. STEP 9.30 — DATA PRESERVATION VERIFICATION

Sebelum final:

Verify:

```text
sales count
sale_items count
products count
categories count
stock_movements count
settings
audit_logs
existing users
```

User count boleh bertambah apabila:

```text
new Admin
new Cashier
```

dibuat melalui valid flow.

Namun existing user:

```text
must not be deleted
```

tanpa explicit business requirement.

Historical transaction:

```text
MUST REMAIN UNCHANGED
```

==================================================

# AH. STEP 9.31 — FINAL PRODUCTION READINESS CHECK

## Account

[ ] Public Registration works

[ ] Registration validation works

[ ] Password hashing secure

[ ] Public registration cannot privilege escalate

[ ] Admin can create Cashier

[ ] Cashier cannot create Cashier

[ ] Admin can manage Cashier

[ ] Email unique

[ ] Email/password login works

## Authorization

[ ] Admin access preserved

[ ] Cashier access preserved

[ ] Admin-only routes protected

[ ] User Management protected

[ ] Settings protected

[ ] Audit Logs protected

## Dashboard

[ ] Admin Dashboard redesigned

[ ] Dashboard data comes from DB

[ ] No dummy data

[ ] Revenue visible

[ ] Transaction count visible

[ ] Stock status visible

[ ] Recent transactions visible

[ ] Cashier activity available where appropriate

## Sales Trend

[ ] Daily revenue chart implemented

[ ] One point represents one day

[ ] Date ordered ascending

[ ] Actual database aggregation

[ ] Date filter works

[ ] Zero-sales day handled

[ ] Tooltip shows exact date

[ ] Tooltip shows exact revenue

[ ] Trend visually shows rise/fall

[ ] Day-over-day indicator works

[ ] Division by zero handled

## Security

[ ] CSRF remains active

[ ] Backend validation active

[ ] Mass assignment protected

[ ] Role assignment server-side

[ ] Password never logged

[ ] Sensitive data sanitized

[ ] Authorization preserved

## Performance

[ ] No obvious N+1

[ ] Daily aggregation database-side

[ ] Dashboard queries reasonable

[ ] No query per chart point

[ ] Existing performance preserved

## Regression

[ ] Phase 1 PASS

[ ] Phase 2 PASS

[ ] Phase 3 PASS

[ ] Phase 4 PASS

[ ] Phase 5 PASS

[ ] Phase 6 PASS

[ ] Phase 7 PASS

[ ] Phase 8 PASS

[ ] Phase 9 PASS

[ ] npm run build PASS

[ ] php artisan test PASS

==================================================

# AI. FINAL REPORT

Gunakan format:

## A. Status

## B. Phase 1–8 Pre-flight Audit

## C. Registration Implementation

## D. Authentication Changes

## E. Cashier Account Management

## F. Authorization Audit

## G. Mass Assignment Audit

## H. Backend Validation

## I. Audit Log Integration

## J. Admin Dashboard Redesign

## K. Daily Sales Trend

## L. Accounting Aggregation

## M. Day-over-Day Indicator

## N. Dashboard Performance

## O. UI / UX Changes

## P. Security Verification

## Q. Test Results

## R. Regression Results

## S. Frontend Build

## T. Data Preservation

## U. Production Readiness

## V. Requirement Matrix

## W. Remaining Issues

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

Jangan gunakan PASS tanpa evidence.

==================================================

# FINAL ACCEPTANCE CRITERIA

Phase 9 hanya dapat dianggap PASS apabila:

[ ] Phase 1 tetap PASS

[ ] Phase 2 tetap PASS

[ ] Phase 3 tetap PASS

[ ] Phase 4 tetap PASS

[ ] Phase 5 tetap PASS

[ ] Phase 6 tetap PASS

[ ] Phase 7 tetap PASS

[ ] Phase 8 tetap PASS

[ ] Public Registration implemented

[ ] Registration validation secure

[ ] Password securely hashed

[ ] Public registration cannot manipulate role

[ ] Admin can create Cashier

[ ] Cashier cannot create Cashier

[ ] Admin can manage Cashier

[ ] Email/password login works

[ ] Admin authentication works

[ ] Cashier authentication works

[ ] Authorization remains secure

[ ] Admin-only routes remain protected

[ ] Account changes integrated with AuditLogService

[ ] Sensitive account information sanitized

[ ] Admin Dashboard redesigned

[ ] Dashboard uses actual database data

[ ] No dummy dashboard data

[ ] Revenue metric available

[ ] Transaction metric available

[ ] Daily sales trend implemented

[ ] Daily revenue aggregated from database

[ ] One chart point represents one day

[ ] Date range filtering works

[ ] Zero-sales dates handled

[ ] Trend visually shows increase/decrease

[ ] Day-over-day calculation works

[ ] Division by zero handled

[ ] Chart tooltip provides useful information

[ ] Dashboard does not introduce obvious N+1

[ ] Existing POS UI preserved

[ ] Checkout unchanged

[ ] Inventory logic unchanged

[ ] Stock locking unchanged

[ ] Historical buy_price preserved

[ ] Historical transactions preserved

[ ] Audit log integrity preserved

[ ] Security hardening from Phase 8 preserved

[ ] Regression tests PASS

[ ] php artisan test PASS

[ ] npm run build PASS

[ ] Existing data preserved

==================================================

# HAL YANG DILARANG DALAM PHASE 9

Jangan:

```text
rewrite authentication system
replace Laravel authentication unnecessarily
replace database
rewrite CheckoutService
rewrite inventory architecture
rewrite stock movement architecture
remove lockForUpdate
remove DB transaction
change historical buy_price
modify historical transaction
delete existing users
delete existing sales
delete existing stock history
disable CSRF
trust frontend role
allow public role assignment
store plaintext password
log password
use dummy dashboard data
hardcode sales chart
calculate all report data in frontend
create query per chart point
create N+1 dashboard queries
```

Jangan menambahkan:

```text
new ERP
new accounting system
CRM
loyalty system
supplier management
multi-outlet
AI forecasting
AI fraud detection
AI recommendation
new payment gateway
refund system
return system
subscription system
```

kecuali secara eksplisit diminta pada phase berikutnya.

Phase 9 bukan pembangunan ERP baru.

==================================================

# FINAL PRINCIPLE

Phase 9 harus menghasilkan:

```text
BETTER ACCOUNT MANAGEMENT

+

BETTER ADMIN EXPERIENCE

+

SECURE CASHIER MANAGEMENT

+

CLEARER SALES TREND

+

BETTER DASHBOARD

+

PRESERVED POS INTEGRITY
```

Tanpa mengorbankan:

```text
DATA INTEGRITY

HISTORICAL CONSISTENCY

AUTHORIZATION

CHECKOUT SAFETY

INVENTORY SAFETY

AUDIT INTEGRITY

SECURITY HARDENING
```

Jika existing implementation sudah benar:

```text
KEEP IT
```

Jika ditemukan masalah:

```text
AUDIT
→ FIX
→ TEST
→ REGRESSION
→ VERIFY
```

Jangan:

```text
CHANGE
→ ASSUME
→ PASS
```

==================================================

# PHASE 9 STARTING POINT

Mulai dari:

```text
STEP 9.1
PRE-FLIGHT AUDIT PHASE 1–8

↓

STEP 9.2
PUBLIC REGISTRATION / ACCOUNT FLOW AUDIT

↓

STEP 9.3
ADMIN CASHIER MANAGEMENT

↓

STEP 9.4
EMAIL + PASSWORD AUTHENTICATION

↓

STEP 9.5
AUTHORIZATION REGRESSION

↓

STEP 9.6
ADMIN DASHBOARD REDESIGN

↓

STEP 9.7
DAILY SALES TREND

↓

STEP 9.8
DAY-OVER-DAY ANALYTICS

↓

STEP 9.9
PERFORMANCE / QUERY AUDIT

↓

STEP 9.10
SECURITY + REGRESSION TEST

↓

STEP 9.11
FINAL BUILD & VERIFICATION
```

**IMPORTANT:**

Jangan langsung mengubah code.

Pertama:

```text
INSPECT
→ AUDIT
→ MAP EXISTING ARCHITECTURE
→ IDENTIFY REQUIRED CHANGES
```

Kemudian:

```text
IMPLEMENT MINIMAL CHANGE
→ TEST
→ REGRESSION
→ VERIFY
```

Phase 9 harus menjadi **evolusi dari POS-Kasir yang sudah stabil**, bukan penggantian POS-Kasir.

**END OF PHASE 9 SPECIFICATION**
