PROJECT POS-Kasir

STATUS:

- Phase 1 PASS
- Phase 2 PASS
- Phase 3 PASS
- Phase 4 PASS
- Phase 5 PASS
- Phase 6 PASS

NEXT:
PHASE 7 — AUDIT LOG & OPERATIONAL MONITORING

GOAL:
Membangun sistem Audit Log & Operational Monitoring yang mencatat aktivitas penting pengguna dan perubahan data kritis pada POS-Kasir.

Tujuan utama Phase 7:

- mengetahui siapa yang melakukan suatu tindakan
- mengetahui tindakan apa yang dilakukan
- mengetahui kapan tindakan dilakukan
- mengetahui data/entitas yang terdampak
- menyimpan konteks perubahan penting jika diperlukan
- menyediakan halaman monitoring aktivitas untuk Admin
- membantu investigasi apabila terjadi kesalahan operasional
- menjaga traceability tanpa mengubah business logic transaksi yang sudah stabil

Phase 7 harus menjadi lapisan monitoring/audit di atas sistem existing.

Jangan melakukan rewrite terhadap POS, checkout, inventory, reports, receipt, atau settings yang sudah PASS.

==================================================
SCOPE PHASE 7
=============

Fitur utama:

1. Audit Log

    - Mencatat aktivitas penting user.
    - Mencatat user yang melakukan aktivitas.
    - Mencatat action.
    - Mencatat entity/model yang terdampak.
    - Mencatat entity ID jika tersedia.
    - Mencatat timestamp.
    - Mencatat informasi perubahan jika relevan.

2. Operational Monitoring

    - Admin dapat melihat aktivitas operasional penting.
    - Menampilkan aktivitas terbaru.
    - Menampilkan user/cashier yang melakukan aktivitas.
    - Menampilkan jenis aktivitas.
    - Menampilkan waktu aktivitas.
    - Menampilkan entity/data yang terdampak.
    - Menyediakan filter sederhana jika sesuai kebutuhan.

3. Audit Log Detail

    - Admin dapat melihat detail aktivitas.
    - Jika ada perubahan data, tampilkan before/after secara aman.
    - Jangan menampilkan sensitive information.

4. Authorization

    - Audit log dan monitoring hanya dapat diakses Admin.
    - Cashier tidak dapat melihat audit log.
    - Cashier tidak dapat memanipulasi audit log.
    - Authorization harus ditegakkan di backend.

==================================================
AUDITABLE ACTIVITIES
====================

Audit aktivitas yang memiliki nilai operasional.

Minimal pertimbangkan:

AUTHENTICATION:

- Login berhasil
- Login gagal jika mekanisme existing dapat mencatatnya dengan aman
- Logout

USER / ACCESS:

- User dibuat
- User diubah
- User dinonaktifkan jika fitur existing mendukung
- Perubahan role/akses

PRODUCT:

- Product dibuat
- Product diubah
- Product di-soft-delete
- Product dipulihkan jika restore tersedia
- Perubahan harga beli
- Perubahan harga jual
- Perubahan stock melalui master product

CATEGORY:

- Category dibuat
- Category diubah
- Category dihapus/soft-delete jika existing mendukung

INVENTORY:

- Stock adjustment
- Stock opening
- Aktivitas stock penting lainnya yang sudah ada

TRANSACTION:

- Checkout berhasil
- Transaksi dibuat
- Payment method transaksi jika relevan
- Aktivitas transaksi penting yang memang sudah ada

STORE SETTINGS:

- Store settings dibuat/diubah
- Perubahan configuration penting

REPORTING:

- Akses reports jika memang dibutuhkan untuk operational monitoring

Jangan mencatat setiap query/database read secara otomatis.

==================================================
AUDIT ACTION NAMING
===================

Gunakan action name yang konsisten.

Contoh:

login
logout
login_failed

create
update
delete
restore

stock_adjustment
stock_opening

checkout
transaction_created

settings_updated

Jika action lebih spesifik diperlukan, gunakan naming yang konsisten.

Jangan membuat action name berbeda-beda untuk hal yang sama.

==================================================
AUDIT LOG DATA
==============

Jika belum ada audit log table, gunakan desain sederhana dan extensible.

Minimal:

audit_logs

- id
- user_id nullable
- action
- auditable_type nullable
- auditable_id nullable
- old_values nullable
- new_values nullable
- description/message nullable
- ip_address nullable
- user_agent nullable
- created_at
- updated_at jika memang diperlukan

Tidak semua field harus digunakan jika existing architecture memiliki pendekatan yang lebih baik.

Sebelum membuat migration:

- audit schema existing terlebih dahulu
- pastikan tidak ada audit log mechanism yang sudah tersedia
- gunakan migration additive only
- jangan mengubah tabel transaksi existing secara destruktif

==================================================
BEFORE / AFTER DATA
===================

Jika mencatat perubahan data:

Contoh:

Product:

before:
buy_price = 50000
sell_price = 70000

after:
buy_price = 55000
sell_price = 75000

Audit log harus dapat menunjukkan perubahan tersebut.

Namun jangan menyimpan sensitive data seperti:

- password
- password hash
- authentication token
- API key
- payment credential
- secret key
- session credential

Jika entity memiliki field sensitive:

- exclude field tersebut dari old_values/new_values.

==================================================
TRANSACTION AUDIT
=================

Checkout yang berhasil boleh menghasilkan audit event.

Namun jangan menyimpan seluruh payload transaksi sebagai audit log jika tidak diperlukan.

Gunakan reference ke transaksi:

- sale ID
- transaction number
- cashier/user
- payment method jika relevan
- timestamp

Jangan menduplikasi seluruh sale_items ke audit_logs.

Sale dan sale_items tetap menjadi source of truth transaksi.

==================================================
INVENTORY AUDIT
===============

Stock changes harus dapat ditelusuri.

Gunakan existing stock_movements sebagai source of truth inventory.

Audit log digunakan untuk mencatat:

- siapa yang melakukan adjustment
- jenis adjustment
- waktu
- product yang terdampak
- reference ke stock movement jika tersedia

Jangan membuat sistem inventory kedua.

Jangan menggantikan stock_movements dengan audit_logs.

==================================================
STORE SETTINGS AUDIT
====================

Integrasikan dengan Phase 6.

Ketika Admin mengubah:

- store_name
- store_address
- store_phone
- receipt_header
- receipt_footer
- configuration lainnya

catat:

- user
- action
- waktu
- before
- after

Contoh:

Admin:
store_name
"TOKO POS-KASIR"
→
"Faiz Store"

Audit log:

settings_updated

before:
"TOKO POS-KASIR"

after:
"Faiz Store"

Jangan mencatat data yang tidak berubah.

==================================================
OPERATIONAL MONITORING
======================

Buat halaman Admin untuk monitoring aktivitas.

Contoh route:

/audit-logs

atau route yang paling sesuai dengan existing architecture.

UI minimal:

- Activity
- User
- Action
- Entity
- Date/time
- Description

Tambahkan:

- pagination
- filter action
- filter user
- filter date jika memang sederhana
- search jika diperlukan

Jangan membuat dashboard monitoring yang terlalu kompleks.

Prioritas adalah:

Readable
Useful
Fast
Secure

==================================================
AUDIT LOG DETAIL
================

Admin dapat membuka detail audit event.

Minimal:

- actor/user
- action
- timestamp
- entity
- entity ID
- description
- old values
- new values
- IP address jika disimpan

Old/new values harus ditampilkan dengan format yang mudah dibaca.

Jika tidak ada perubahan value:

- jangan tampilkan section before/after secara misleading.

==================================================
AUTHORIZATION
=============

Admin:

- dapat melihat audit logs
- dapat melihat audit detail

Cashier:

- tidak dapat melihat audit logs
- tidak dapat melihat audit detail
- tidak dapat menghapus audit logs
- tidak dapat mengubah audit logs

Authorization harus backend enforced.

Jangan hanya menyembunyikan menu.

Gunakan existing EnsureUserIsAdmin jika sesuai.

Jangan membuat role baru.

==================================================
AUDIT LOG IMMUTABILITY
======================

Audit log adalah historical record.

Jangan menyediakan fitur:

- edit audit log
- update audit log
- delete audit log

melalui UI Admin.

Jika retention/deletion diperlukan di masa depan:

- harus menjadi kebijakan khusus
- jangan implementasikan destructive cleanup pada Phase 7.

Audit log harus append-oriented.

==================================================
SECURITY
========

Pastikan:

- password tidak pernah dicatat
- password hash tidak pernah dicatat
- token tidak pernah dicatat
- API key tidak pernah dicatat
- payment credentials tidak pernah dicatat
- sensitive request payload tidak dicatat secara otomatis
- old_values/new_values disanitasi
- authorization backend
- CSRF protection mengikuti Laravel
- output escaping
- IP/User-Agent ditangani secara aman

Jangan membuat audit logger yang secara otomatis menyimpan seluruh request body.

==================================================
PERFORMANCE
===========

Audit logging tidak boleh memperlambat transaksi secara signifikan.

Hindari:

- query audit di dalam loop
- query per item transaksi
- menyimpan satu audit record untuk setiap sale item
- membaca seluruh audit logs ke PHP
- loading seluruh history sekaligus

Gunakan:

- database insert
- pagination
- indexed columns yang memang diperlukan
- eager loading untuk actor/user jika diperlukan
- filtering di database

Untuk operational monitoring:

Jangan mengambil seluruh audit log kemudian memfilter di PHP.

==================================================
DATABASE INDEXING
=================

Jika membuat audit_logs table, pertimbangkan index pada field yang memang digunakan untuk filtering:

- user_id
- action
- auditable_type + auditable_id
- created_at

Jangan menambahkan index berlebihan.

Jika migration diperlukan:

- additive
- non-destructive
- explain alasan index.

==================================================
ERROR HANDLING
==============

Audit logging tidak boleh menyebabkan data transaksi menjadi rusak.

Jika audit logging gagal, tentukan behavior yang aman berdasarkan criticality.

Untuk event non-critical:

- jangan sampai UI crash hanya karena audit record gagal.

Namun untuk event yang sangat penting, pertimbangkan konsistensi transaction + audit record.

Jangan mengubah transaksi menjadi partially committed hanya karena audit layer.

Gunakan database transaction jika memang diperlukan dan sesuai existing transaction architecture.

==================================================
IMPLEMENTATION ARCHITECTURE
===========================

Audit logging sebaiknya memiliki satu mekanisme terpusat.

Contoh:

AuditLog model
AuditLogService

atau architecture Laravel yang sesuai.

Jangan membuat:

ProductController:
custom audit code

CategoryController:
custom audit code

SettingController:
custom audit code

SaleController:
custom audit code

dengan format berbeda-beda.

Gunakan mekanisme terpusat jika memungkinkan.

Namun jangan overengineering.

==================================================
DO NOT ADD
==========

Phase 7 TIDAK mencakup:

- advanced SIEM
- external log management platform
- real-time websocket monitoring
- server infrastructure monitoring
- CPU/RAM monitoring
- application performance monitoring platform
- distributed tracing
- error monitoring SaaS
- alerting platform
- email alert engine
- SMS/WhatsApp alert
- multi-outlet audit aggregation
- customer behavior analytics
- advanced BI
- fraud detection AI
- anomaly detection AI
- accounting audit system
- compliance certification system

Phase 7 fokus pada:

AUDIT LOG + BASIC OPERATIONAL MONITORING.

==================================================
DATA PRESERVATION
=================

Audit implementation tidak boleh mengubah historical transaction data.

Jangan mengubah:

- sales
- sale_items
- products
- stock_movements
- users

hanya untuk membuat audit log.

Audit log menjadi data tambahan.

Historical transaction tetap menjadi source of truth.

Jangan:

- migrate:fresh
- migrate:refresh
- db:wipe
- TRUNCATE
- DROP
- reset
- delete existing transaction data

Test destructive behavior hanya boleh pada test database.

==================================================
REGRESSION PHASE 1–6
====================

Pastikan Phase 7 tidak merusak:

PHASE 1:

- Admin/cashier authorization
- protected routes
- role restrictions

PHASE 2:

- stock integrity
- buy_price snapshot
- soft-deleted product
- stock movements

PHASE 3:

- checkout
- payment
- transaction creation

PHASE 4:

- transaction detail
- receipt
- reprint receipt
- historical transaction safety

PHASE 5:

- reports
- analytics
- historical profit
- product analytics
- cashier performance

PHASE 6:

- store settings
- receipt settings
- settings authorization
- settings persistence

==================================================
TESTING
=======

Tambahkan test Phase 7 minimal untuk:

A. AUTHORIZATION

1. Admin dapat mengakses audit logs.
2. Cashier tidak dapat mengakses audit logs.
3. Cashier tidak dapat mengakses audit detail.
4. Cashier tidak dapat mengubah audit logs.
5. Admin tidak memiliki endpoint untuk mengubah/menghapus audit logs.

B. AUDIT CREATION

6. Login/activity penting dapat menghasilkan audit event jika diimplementasikan.
7. Product creation menghasilkan audit log.
8. Product update menghasilkan audit log.
9. Product deletion/soft-delete menghasilkan audit log.
10. Stock adjustment menghasilkan audit log.
11. Checkout menghasilkan audit event.
12. Store settings update menghasilkan audit log.

C. AUDIT CONTENT

13. Actor/user tercatat.
14. Action tercatat.
15. Entity tercatat jika tersedia.
16. Timestamp tercatat.
17. Before/after tercatat untuk perubahan yang relevan.
18. Sensitive fields tidak tercatat.

D. OPERATIONAL MONITORING

19. Admin dapat melihat daftar audit logs.
20. Pagination/filter berjalan.
21. Audit detail dapat dibuka.
22. Filtering dilakukan di database, bukan full dataset ke PHP.

E. IMMUTABILITY

23. Audit log tidak dapat diedit.
24. Audit log tidak dapat dihapus melalui UI/API normal.

F. REGRESSION

25. Checkout tetap berjalan.
26. Stock tetap benar.
27. Reports tetap berjalan.
28. Receipt tetap berjalan.
29. Store settings tetap berjalan.
30. Phase 1–6 regression tests tetap PASS.

Jangan melemahkan business assertion hanya agar test PASS.

Jika test gagal:

- cari root cause
- perbaiki implementation/test fixture
- jalankan ulang test
- jangan menghapus assertion penting.

==================================================
IMPLEMENTATION ORDER
====================

Implementasi Phase 7 dilakukan bertahap.

STEP 1 — AUDIT EXISTING LOGGING

Audit:

- existing logs
- existing audit mechanism
- migrations
- models
- controllers
- services
- middleware
- authentication flow
- checkout flow
- product/category flow
- stock movement flow
- settings flow
- routes
- existing tests

Cari apakah sudah ada:

- audit_logs table
- activity log
- event/listener
- logging service
- model observers
- Laravel events
- existing application logs

Jangan membuat duplicate logging mechanism.

Pada STEP 1:
JANGAN membuat migration atau implementasi besar terlebih dahulu.

---

STEP 2 — AUDIT LOG FOUNDATION

Setelah audit:

- buat audit_logs table jika memang belum ada
- buat model/service
- tentukan action naming
- tentukan actor relationship
- tentukan auditable entity
- tentukan sanitization
- buat backend authorization
- buat test dasar

Migration harus additive/non-destructive.

---

STEP 3 — INTEGRATION

Integrasikan audit mechanism dengan aktivitas penting:

- product
- category
- inventory
- checkout
- settings
- user/access jika sesuai existing system

Jangan mencatat setiap read/request.

Prioritaskan aktivitas yang mengubah state.

---

STEP 4 — OPERATIONAL MONITORING UI

Buat:

- audit log list
- pagination
- filter
- audit detail
- readable before/after values

Gunakan existing admin UI.

---

STEP 5 — FINAL VERIFICATION

Verifikasi:

- authorization
- audit creation
- audit content
- sensitive data protection
- immutability
- performance
- pagination/filter
- data preservation
- Phase 1–6 regression
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

- Admin dapat melihat audit logs.
- Cashier tidak dapat melihat audit logs.
- Audit event tercatat untuk aktivitas penting.
- Actor tercatat.
- Action tercatat.
- Entity/reference tercatat jika relevan.
- Timestamp tercatat.
- Before/after benar untuk perubahan data.
- Sensitive data tidak tercatat.
- Audit logs tidak dapat diedit.
- Audit logs tidak dapat dihapus melalui normal application flow.
- Monitoring menggunakan pagination.
- Filter dilakukan di database.
- Tidak ada N+1 query.
- Audit logging tidak merusak checkout.
- Audit logging tidak merusak stock.
- Audit logging tidak merusak reports.
- Audit logging tidak merusak receipt.
- Store settings tetap berjalan.
- Historical data tetap aman.
- Phase 1–6 regression PASS.
- `php artisan test` PASS.
- `npm run build` PASS.

Jangan menyatakan PASS hanya karena build berhasil.

Jangan menyatakan PASS jika audit business logic belum diverifikasi.

Jika terdapat failure:

- cari root cause
- perbaiki
- test ulang.

==================================================
FINAL REPORT FORMAT
===================

Setelah implementasi selesai, berikan laporan:

A. Status
B. Initial Audit
C. Database Changes
D. Backend Changes
E. Frontend Changes
F. Audit Events Implemented
G. Operational Monitoring
H. Authorization
I. Security & Sensitive Data Protection
J. Audit Log Immutability
K. Query & Performance
L. Testing
M. Regression Phase 1–6
N. Data Preservation
O. Build Result
P. Remaining Issues

Untuk Testing wajib tuliskan:

- test file
- jumlah test
- passed
- failed
- assertions

Untuk setiap requirement penting berikan:

PASS / PARTIAL / FAIL / NOT APPLICABLE

Jika ada failure:
JANGAN menyatakan PASS.

Jika ada requirement yang belum selesai:
tulis PARTIAL / INCOMPLETE.

==================================================
FINAL PRINCIPLE
===============

Phase 7 adalah:

AUDIT LOG & OPERATIONAL MONITORING

Fokus pada:

- traceability
- accountability
- operational visibility
- security
- historical auditability
- admin-only access
- immutable audit records
- efficient database queries
- minimal operational overhead

Gunakan existing architecture sebanyak mungkin.

Jangan rewrite sistem yang sudah PASS.

Jangan mencatat semua request secara otomatis.

Jangan menyimpan sensitive information.

Jangan membuat sistem monitoring yang terlalu kompleks.

Jangan membuat sistem kedua untuk inventory atau transactions.

Phase 7 harus menjadi fondasi yang bersih untuk:
