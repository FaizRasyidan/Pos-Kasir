PROJECT: POS-Kasir

Konteks:
Phase 5 (Advanced Sales & Product Analytics) sebelumnya telah diimplementasikan.

Namun pada proses testing ditemukan masalah penting:

- Automated test untuk profit berdasarkan periode/tanggal gagal.
- Profit yang diharapkan tidak muncul dan menghasilkan 0.
- Setelah itu test direncanakan untuk dilemahkan menjadi hanya memeriksa HTTP 200 dan JSON keys.
- Jangan lakukan pendekatan tersebut.

STATUS SAAT INI:
Phase 5 BELUM boleh dinyatakan PASS.

TUJUAN:
Lakukan recovery dan final verification terhadap Phase 5 tanpa mengulang implementasi dari awal.

ATURAN PENTING:

1. Jangan menghapus atau melemahkan business assertion pada test hanya agar test PASS.
2. Jangan mengganti test nilai profit menjadi sekadar assertStatus(200) atau assertJsonStructure().
3. Temukan root cause sebenarnya dari test profit = 0.
4. Jangan rewrite seluruh ReportController/frontend jika tidak diperlukan.
5. Jangan melakukan migration destruktif.
6. Jangan migrate:fresh.
7. Jangan migrate:refresh.
8. Jangan db:wipe.
9. Jangan TRUNCATE.
10. Jangan menghapus sales, sale_items, products, users, atau data existing.
11. Jangan mengubah schema database kecuali benar-benar diperlukan dan additive/non-destructive.
12. Pertahankan seluruh fitur Phase 1–4.

==================================================
STEP 1 — AUDIT TEST YANG GAGAL
==============================

Inspect:

- tests/Feature/Phase5Test.php
- ReportController
- routes/web.php
- Report model/query logic jika ada
- Sale/SaleItem/Product/User models
- reports/index.tsx
- DashboardController jika terkait
- schema/migrations yang relevan

Temukan mengapa test profit menghasilkan 0.

Jangan berasumsi.

Tentukan secara eksplisit:

- tanggal Sale yang sebenarnya tersimpan
- tanggal yang digunakan filter report
- timezone yang digunakan
- apakah created_at diubah oleh Eloquent
- apakah data test benar-benar masuk periode yang diuji
- apakah sale_items memiliki buy_price yang benar
- apakah query report menggunakan sale_items.buy_price
- apakah ada filter status/authorization/date yang menyebabkan data tidak masuk
- apakah aggregation SQL menghitung data tersebut

==================================================
STEP 2 — PERBAIKI ROOT CAUSE
============================

Perbaiki penyebab sebenarnya.

Jika masalah hanya pada test fixture/tanggal:

- perbaiki fixture secara deterministic.
- Jangan melemahkan assertion.

Jika masalah ada pada ReportController:

- perbaiki query dengan perubahan minimal.
- Jangan mengubah behavior yang sudah benar.

Pastikan test dapat membuat transaksi pada tanggal tertentu secara deterministik.

==================================================
STEP 3 — BUSINESS ASSERTION WAJIB
=================================

Buat/pulihkan test yang benar-benar memverifikasi angka.

Test minimal:

Scenario:

- buy_price snapshot = 50.000
- sell price = 70.000
- quantity = 2

Expected:

Profit = (70.000 - 50.000) × 2
= 40.000

Test harus benar-benar assert nilai 40.000.

Kemudian ubah master product buy_price menjadi 60.000.

Run report kembali.

Expected historical profit tetap:

40.000

Bukan:

20.000

Bukan:

0

dan bukan sekadar HTTP 200.

==================================================
STEP 4 — VERIFY PHASE 5 REQUIREMENTS
====================================

Buat requirement matrix:

1. Total Omzet
2. Total Profit
3. Total Transactions
4. Average Transaction Value
5. Total Items Sold
6. Sales Trend harian
7. Top Selling Products
8. Most Profitable Products
9. Category Performance
10. Date Filter:

- Today
- Yesterday
- Last 7 Days
- Last 30 Days
- Custom Range

11. Cashier Performance
12. Soft-deleted product handling
13. Historical buy_price
14. Dashboard vs Reports consistency
15. Admin authorization
16. Cashier denial
17. SQL aggregation
18. No N+1
19. Data preservation
20. Regression Phase 1–4

Untuk setiap requirement berikan:
PASS / FAIL / MISSING / NOT APPLICABLE

Jangan mengklaim PASS tanpa bukti.

==================================================
STEP 5 — CATEGORY PERFORMANCE
=============================

Pastikan Category Performance benar-benar tersedia jika memang diwajibkan oleh Phase 5.

Minimal:

- category
- quantity
- omzet
- profit

Gunakan aggregation SQL.

Pastikan soft-deleted products tidak menyebabkan historical report hilang.

Jika fitur ini ternyata sudah ada, verifikasi source code dan test-nya.
Jika belum ada, implementasikan dengan perubahan minimal.

==================================================
STEP 6 — DATE FILTER
====================

Pastikan filter berikut benar-benar berfungsi:

- today
- yesterday
- last 7 days
- last 30 days
- custom range

Semua KPI dan analytics harus menggunakan periode yang sama.

Jangan sampai:

- KPI memakai periode A
- Top Products memakai periode B
- Profit memakai periode C.

Tambahkan automated test untuk minimal beberapa representative date ranges.

==================================================
STEP 7 — NO N+1
===============

Verifikasi source code dan query behavior.

Pastikan:

- tidak mengambil seluruh sale_items lalu menghitung di PHP
- tidak melakukan query per product
- tidak melakukan query per tanggal
- tidak melakukan query per category
- tidak melakukan query per cashier

Gunakan:
SUM
COUNT
AVG
GROUP BY
ORDER BY
LIMIT

di database.

==================================================
STEP 8 — AUTHORIZATION
======================

Pastikan:

- Admin dapat mengakses reports/analytics.
- Cashier mendapat 403/authorization denial.
- Cashier tidak dapat memperoleh analytics dengan manipulasi URL/request.
- Endpoint analytics tambahan juga terlindungi jika ada.

==================================================
STEP 9 — DASHBOARD CONSISTENCY
==============================

Gunakan periode yang sama dan bandingkan:

Dashboard:

- omzet
- profit
- transactions

Reports:

- omzet
- profit
- transactions

Pastikan nilainya identik.

Jika berbeda, temukan root cause sebelum menyatakan PASS.

==================================================
STEP 10 — TESTING
=================

Jalankan:

php artisan test

Jangan hanya menjalankan Phase5Test jika regression test tersedia.

Pastikan business assertions tetap aktif.

Kemudian:

npm run build

Catat:

- jumlah test passed
- jumlah test failed
- jumlah assertions
- build result

Jika ada failure:
JANGAN menghapus atau melemahkan assertion.

Perbaiki root cause.

==================================================
STEP 11 — FINAL REPORT
======================

Berikan laporan:

A. Status
B. Root Cause Test Failure
C. Fix Applied
D. Requirement Matrix
E. Database Changes
F. Backend Changes
G. Frontend Changes
H. Query & Performance
I. Authorization
J. Testing
K. Regression Phase 1–4
L. Data Preservation
M. Remaining Issues

PENTING:

Jangan menulis:

"PASS karena build berhasil."

Jangan menulis:

"PASS karena endpoint status 200."

Phase 5 hanya boleh dinyatakan PASS jika business logic analytics benar-benar terbukti melalui automated test dan verifikasi source code.

Jika masih ada requirement yang belum terbukti, tulis PARTIAL atau FAIL.
