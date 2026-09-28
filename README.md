# POSKASIR

### Modern Web-Based Point of Sale & Store Management System

**POSKASIR** adalah aplikasi Point of Sale (POS) berbasis web yang dirancang untuk membantu operasional toko dalam mengelola transaksi penjualan, produk, stok, laporan, pengaturan toko, serta aktivitas pengguna.

Project ini dikembangkan dengan pendekatan **incremental development** yang mengutamakan keamanan backend, integritas data, transaction safety, maintainability, dan regression testing.

---

## 📌 Project Overview

POSKASIR menyediakan dua role utama:

| Role        | Responsibility                                                                                |
| ----------- | --------------------------------------------------------------------------------------------- |
| **Admin**   | Monitoring toko, produk, kategori, stok, laporan, settings, audit logs, dan manajemen cashier |
| **Cashier** | Operasional POS, checkout, dan aktivitas transaksi                                            |

Authorization diterapkan pada **backend**, sehingga pembatasan akses tidak hanya bergantung pada tampilan frontend.

---

## ✨ Key Features

### 🛒 Point of Sale

* Product selection
* Quantity management
* Stock validation
* Server-side price calculation
* Transaction processing
* Automatic stock update
* Transaction number generation
* Receipt generation
* Transaction history
* Receipt reprint

### 📦 Inventory Management

* Product management
* Category management
* Stock In
* Stock Adjustment
* Stock movement history
* Stock before / after tracking
* Buy price & selling price
* Product soft delete
* Historical inventory consistency

### 📊 Dashboard & Analytics

Admin dapat memonitor performa toko melalui dashboard dan reporting.

Fitur analytics meliputi:

* Today's revenue
* Transaction count
* Items sold
* Average transaction value
* Top selling products
* Most profitable products
* Cashier performance
* Daily revenue trend
* Day-over-day revenue indicator
* Date-based reporting

Reporting menggunakan **database-side aggregation** untuk menjaga efisiensi query.

### ⚙️ Store Settings

Admin dapat mengelola konfigurasi toko yang digunakan oleh sistem, termasuk informasi yang ditampilkan pada receipt.

### 👥 User & Cashier Management

Admin dapat:

* Membuat akun Cashier
* Mengubah data Cashier
* Mengelola status akun
* Mengatur password Cashier
* Memantau aktivitas account management

Password disimpan menggunakan secure hashing dan perubahan account management terintegrasi dengan audit logging.

### 📝 Audit Logs

Aktivitas penting dicatat melalui centralized:

```text
AuditLogService
```

Audit log memiliki karakteristik:

* Centralized
* Sanitized
* Immutable
* Admin-only
* Database-backed

Sensitive information seperti password, token, secret, dan API key tidak dicatat secara langsung.

---

# 🔐 Security

Security merupakan salah satu fokus utama POSKASIR.

Implementasi security meliputi:

* Backend authorization
* Role-based access control
* HTTP 403 enforcement
* CSRF protection
* Backend request validation
* Mass assignment protection
* Password hashing
* Sensitive data sanitization
* Parameterized queries
* Eloquent ORM
* Secure error handling
* Session protection
* Database transactions
* Row locking
* Server-side price calculation
* Audit logging

### Example Authorization

```text
Admin
 ├── Dashboard
 ├── Products
 ├── Categories
 ├── Stocks
 ├── Reports
 ├── Store Settings
 ├── Audit Logs
 └── User Management

Cashier
 └── POS / Checkout
```

Cashier tidak dapat mengakses resource Admin hanya dengan memanipulasi URL atau request.

---

# 🧠 Transaction & Data Integrity

POSKASIR menjaga konsistensi transaksi menggunakan database transaction dan row-level locking.

Checkout mempertahankan:

```text
DB::transaction()
        +
lockForUpdate()
        +
server-side price calculation
        +
stock validation
        +
buy_price snapshot
        +
stock_before / stock_after
```

Pendekatan ini digunakan untuk mencegah masalah seperti:

* Overselling
* Race condition
* Manipulasi harga dari frontend
* Inconsistent stock
* Inconsistent transaction data

---

# 💰 Historical Transaction Consistency

Historical transaction tidak bergantung pada harga produk saat ini.

Ketika transaksi dibuat, `buy_price` disimpan sebagai snapshot pada:

```text
sale_items.buy_price
```

Sehingga perubahan harga produk di masa depan tidak mengubah histori profit transaksi sebelumnya.

Contoh:

```text
Product Buy Price
       ↓
Transaction
       ↓
sale_items.buy_price
       ↓
Historical Profit
```

bukan:

```text
Current Product Price
       ↓
Historical Transaction
```

Pendekatan ini menjaga historical accounting consistency.

---

# 📈 Sales Trend

Dashboard menyediakan visualisasi omzet harian berbasis data aktual.

Data diproses menggunakan database aggregation:

```text
Sales
  ↓
Date Filter
  ↓
GROUP BY Date
  ↓
SUM Revenue
  ↓
ORDER BY Date
  ↓
Sales Trend Chart
```

Grafik menampilkan perubahan omzet dari hari ke hari dan dilengkapi indikator **day-over-day**.

Tidak menggunakan dummy atau random data untuk analytics.

---

# 🏗️ Technology Stack

## Backend

* **Laravel 13.17**
* **PHP 8.5**
* Laravel Fortify
* Eloquent ORM
* MySQL

## Frontend

* **React 19**
* **Inertia.js 3**
* **TypeScript**
* **Tailwind CSS 4**
* **Vite**
* Wayfinder

## Development & Testing

* Laravel Testing / PHPUnit
* Composer
* npm
* Git

---

# 🧩 Architecture

Project menggunakan pendekatan Laravel + React + Inertia.

Struktur utama:

```text
POSKASIR
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Requests/
│   │
│   ├── Models/
│   └── Services/
│
├── database/
│   └── migrations/
│
├── resources/
│   └── js/
│       ├── components/
│       ├── layouts/
│       └── pages/
│
├── routes/
│   └── web.php
│
├── tests/
│   ├── Feature/
│   └── Unit/
│
└── ...
```

Business-critical logic dipertahankan pada backend agar frontend tidak menjadi security boundary.

---

# 🔄 Development Phases

Project dikembangkan secara bertahap.

| Phase       | Scope                                     | Status |
| ----------- | ----------------------------------------- | ------ |
| **Phase 1** | Authentication & Authorization            | ✅ PASS |
| **Phase 2** | Stock Integrity & Concurrency             | ✅ PASS |
| **Phase 3** | Checkout & Transactions                   | ✅ PASS |
| **Phase 4** | Receipt & Transaction Management          | ✅ PASS |
| **Phase 5** | Reports & Dashboard Analytics             | ✅ PASS |
| **Phase 6** | Store Settings                            | ✅ PASS |
| **Phase 7** | Audit Logs                                | ✅ PASS |
| **Phase 8** | Security Hardening & Production Readiness | ✅ PASS |
| **Phase 9** | Account Management & Sales Analytics      | ✅ PASS |

---

# 🧪 Testing & Quality Assurance

POSKASIR menggunakan automated testing untuk menjaga regression safety.

### Current Test Result

```text
83 / 83 Tests Passed
330 Assertions
```

### Frontend Build

```bash
npm run build
```

Result:

```text
PASS
```

Test coverage mencakup area penting seperti:

```text
Authentication
Authorization
Inventory
Checkout
Transactions
Receipt
Reports
Store Settings
Audit Logs
User Management
Sales Analytics
```

Setiap pengembangan baru harus mempertahankan regression test dari phase sebelumnya.

---

# 🔒 Production Readiness

Phase 8 difokuskan pada security hardening dan production readiness.

Audit dilakukan terhadap:

* Authentication
* Authorization
* CSRF
* Mass assignment
* Backend validation
* Sensitive data protection
* SQL/query security
* N+1 queries
* Pagination
* Database performance
* Checkout concurrency
* Error handling
* Audit logging
* Production configuration
* Dependency security
* Frontend build
* Regression testing

Current status:

```text
PRODUCTION READY
```

berdasarkan hasil hardening dan verification pada Phase 8.

---

# 🗄️ Data Preservation

POSKASIR dikembangkan dengan prinsip **non-destructive development**.

Data existing tidak dihapus untuk menyelesaikan masalah development.

Data yang dipertahankan meliputi:

```text
Users
Products
Categories
Sales
Sale Items
Stock Movements
Settings
Audit Logs
```

Tidak menggunakan pendekatan destructive seperti:

```bash
php artisan migrate:fresh
php artisan migrate:refresh
```

pada existing database.

Migration baru harus bersifat:

```text
Additive
Non-destructive
Backward-compatible
```

---

# ⚡ Performance Approach

Performance optimization dilakukan secara targeted.

Pendekatan yang digunakan:

* Database-side aggregation
* Pagination
* Eager loading ketika diperlukan
* N+1 query audit
* Indexed filtering
* Efficient database queries
* Transaction locking
* Server-side calculations

Untuk reporting, sistem memanfaatkan:

```sql
SUM()
COUNT()
AVG()
GROUP BY
ORDER BY
LIMIT
```

sehingga tidak perlu memuat seluruh dataset ke memory aplikasi.

Prinsip utama:

> Optimize based on actual query requirements, not by adding unnecessary infrastructure.

---

# 🚀 Getting Started

## Requirements

Pastikan environment telah memiliki:

```text
PHP 8.5+
Composer
Node.js
npm
MySQL
```

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd POSKASIR
```

### 2. Install Backend Dependencies

```bash
composer install
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Configure Environment

Copy:

```text
.env.example
```

menjadi:

```text
.env
```

Kemudian konfigurasi database:

```env
APP_NAME=POSKASIR
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pos_kasir
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Generate Application Key

Untuk installation baru:

```bash
php artisan key:generate
```

### 6. Run Migration

Untuk database baru:

```bash
php artisan migrate
```

> **Warning:** Jangan menjalankan `migrate:fresh` pada database existing yang berisi data penting.

### 7. Start Laravel

```bash
php artisan serve
```

### 8. Start Frontend Development Server

```bash
npm run dev
```

---

# 🧪 Run Tests

```bash
php artisan test
```

Current baseline:

```text
83/83 Tests Passed
330 Assertions
```

---

# 🏭 Production Build

```bash
npm run build
```

Untuk production:

```env
APP_ENV=production
APP_DEBUG=false
```

Pastikan credential production tidak dimasukkan ke repository.

---

# 📌 Development Guidelines

Setiap perubahan pada project mengikuti workflow:

```text
AUDIT
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
TEST
  ↓
REGRESSION
  ↓
BUILD
  ↓
VERIFY
```

Bukan:

```text
CHANGE
  ↓
ASSUME
  ↓
PASS
```

Prinsip pengembangan:

* Jangan rewrite tanpa kebutuhan.
* Jangan mengubah framework tanpa alasan.
* Jangan mengubah database architecture tanpa kebutuhan.
* Jangan melemahkan security untuk mempermudah development.
* Jangan menghapus test untuk membuat test suite PASS.
* Jangan menghapus existing data.
* Jangan mengubah historical transaction secara sembarangan.
* Jangan menambahkan infrastructure yang tidak memberikan manfaat nyata.

---

# 🎯 Project Goals

POSKASIR dibangun dengan tujuan menghasilkan sistem POS yang:

```text
Secure
   +
Reliable
   +
Maintainable
   +
Performant
   +
Tested
   +
Production Ready
```

dengan tetap mempertahankan:

```text
Data Integrity
Historical Consistency
Authorization
Checkout Safety
Inventory Safety
Auditability
```

---

# 🛣️ Roadmap

### Completed

* [x] Authentication & Authorization
* [x] Admin / Cashier Role
* [x] Product Management
* [x] Category Management
* [x] Inventory Management
* [x] Stock Movement
* [x] POS Checkout
* [x] Transaction Management
* [x] Receipt & Reprint
* [x] Reports
* [x] Dashboard Analytics
* [x] Store Settings
* [x] Audit Logs
* [x] Security Hardening
* [x] Production Readiness
* [x] Cashier Account Management
* [x] Daily Sales Trend
* [x] Day-over-Day Revenue Indicator

### Future Development

Future features will be evaluated based on actual business requirements and will follow the same principles of:

```text
Security
Data Integrity
Backward Compatibility
Maintainability
Testability
```

---

# 📊 Project Health

| Area               | Status  |
| ------------------ | ------- |
| Authentication     | ✅ PASS  |
| Authorization      | ✅ PASS  |
| Inventory          | ✅ PASS  |
| Checkout           | ✅ PASS  |
| Transactions       | ✅ PASS  |
| Receipt            | ✅ PASS  |
| Reports            | ✅ PASS  |
| Store Settings     | ✅ PASS  |
| Audit Logs         | ✅ PASS  |
| Security Hardening | ✅ PASS  |
| Cashier Management | ✅ PASS  |
| Sales Analytics    | ✅ PASS  |
| Automated Tests    | ✅ 83/83 |
| Assertions         | ✅ 330   |
| Frontend Build     | ✅ PASS  |
| Data Preservation  | ✅ PASS  |

---

# 👨‍💻 Development Focus

Project ini juga menjadi bagian dari portfolio pengembangan aplikasi web dengan fokus pada:

* Full Stack Web Development
* Laravel
* React
* TypeScript
* RESTful / backend architecture
* Database design
* Authentication & Authorization
* Transaction processing
* Inventory management
* SQL optimization
* Automated testing
* Security hardening
* Production readiness

---

# 📄 License

This project is developed for portfolio, learning, and software development purposes.

License can be adjusted according to the repository's distribution requirements.

---

## ⭐ Project Status

```text
╔══════════════════════════════════════════╗
║               POSKASIR                  ║
║    Point of Sale & Store Management     ║
╠══════════════════════════════════════════╣
║ Phase 1 — Authentication        PASS    ║
║ Phase 2 — Inventory             PASS    ║
║ Phase 3 — Checkout              PASS    ║
║ Phase 4 — Receipt               PASS    ║
║ Phase 5 — Analytics             PASS    ║
║ Phase 6 — Store Settings        PASS    ║
║ Phase 7 — Audit Logs            PASS    ║
║ Phase 8 — Security Hardening    PASS    ║
║ Phase 9 — Account & Analytics    PASS    ║
╠══════════════════════════════════════════╣
║ Tests:      83/83 PASS                   ║
║ Assertions: 330                         ║
║ Build:      PASS                        ║
║ Data:       PRESERVED                   ║
╚══════════════════════════════════════════╝
```

**POSKASIR — Production-ready foundation for modern store operations.**
