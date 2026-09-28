# PROJECT: MODERN POINT OF SALE (POS) SYSTEM

## 1. ROLE

Bertindak sebagai **Senior Full Stack Laravel Developer, Software Architect, UI/UX Designer, Database Designer, dan Code Reviewer**.

Saya ingin membangun sebuah aplikasi **Point of Sale (POS)** berbasis Laravel yang digunakan oleh sebuah toko untuk mengelola transaksi penjualan, produk, stok, laporan penjualan, dan operasional toko.

Jangan langsung membuat seluruh aplikasi sekaligus.

Gunakan pendekatan:

**Analyze → Plan → Design → Implement → Test → Review**

Sebelum menulis kode, pahami kebutuhan dan buat rancangan sistem terlebih dahulu.

---

# 2. TUJUAN APLIKASI

Aplikasi ini dibuat untuk membantu toko dalam mengelola proses penjualan secara digital.

Tujuan utamanya:

1. Mempermudah kasir melakukan transaksi.
2. Mempermudah toko mengelola produk.
3. Menghitung total transaksi secara otomatis.
4. Mengurangi kesalahan perhitungan transaksi.
5. Menghasilkan struk pembelian.
6. Mencatat seluruh transaksi.
7. Menampilkan rekap penjualan harian.
8. Menampilkan total omzet.
9. Mengelola stok produk.
10. Mengetahui keuntungan berdasarkan harga beli dan harga jual.
11. Membantu pemilik toko memantau kondisi bisnis.

Aplikasi harus terasa seperti aplikasi POS modern yang benar-benar dapat digunakan di toko, bukan sekadar CRUD sederhana.

---

# 3. TECH STACK

Gunakan:

- Laravel sebagai framework backend utama.
- PHP sesuai versi yang kompatibel dengan versi Laravel yang digunakan.
- MySQL sebagai database.
- Blade atau frontend stack yang paling sesuai dengan project.
- Tailwind CSS jika sesuai dengan kebutuhan UI.
- JavaScript untuk interaksi frontend.
- Laravel Eloquent ORM.
- Laravel Migrations.
- Laravel Validation.
- Laravel Authentication.
- Laravel Policies/Gates untuk authorization.

Sebelum implementasi, periksa versi Laravel dan dependency yang tersedia di project.

Jangan mengganti framework atau menambahkan dependency besar tanpa alasan yang jelas.

---

# 4. KONSEP USER

Minimal terdapat dua role:

## Admin / Owner

Memiliki akses untuk:

- Dashboard
- Produk
- Kategori
- Stok
- Transaksi
- Laporan penjualan
- Laporan keuntungan
- Manajemen user
- Pengaturan toko

## Kasir

Memiliki akses untuk:

- Membuat transaksi
- Mencari produk
- Menambahkan produk ke keranjang
- Mengubah quantity
- Menghapus produk dari keranjang
- Melakukan pembayaran
- Mencetak/menghasilkan struk
- Melihat transaksi yang dibuatnya

Kasir tidak boleh mengakses fitur administrasi yang tidak diperlukan.

Authorization harus dilakukan di backend, bukan hanya menyembunyikan menu di frontend.

---

# 5. FITUR UTAMA

## A. Dashboard

Dashboard harus memberikan informasi penting secara cepat.

Tampilkan:

- Penjualan hari ini
- Omzet hari ini
- Jumlah transaksi hari ini
- Produk terjual hari ini
- Estimasi keuntungan hari ini
- Produk dengan stok menipis
- Produk terlaris
- Ringkasan penjualan beberapa hari terakhir

Gunakan card, chart, dan visualisasi data yang mudah dipahami.

Dashboard harus menjadi pusat informasi owner.

---

# 6. POINT OF SALE / KASIR

Ini adalah fitur utama aplikasi.

Kasir dapat:

- Mencari produk
- Memilih produk
- Menambahkan produk ke keranjang
- Mengubah quantity
- Menghapus item
- Melihat subtotal
- Melihat total transaksi
- Memasukkan diskon jika memiliki hak akses
- Memilih metode pembayaran
- Memasukkan jumlah uang yang dibayar
- Menghitung kembalian otomatis
- Menyelesaikan transaksi
- Mencetak atau menampilkan struk

Flow:

**Pilih produk → Keranjang → Checkout → Pembayaran → Transaksi berhasil → Struk**

Gunakan interface yang cepat dan nyaman untuk digunakan kasir.

---

# 7. PRODUK

Admin dapat:

- Menambah produk
- Mengedit produk
- Menghapus produk
- Melihat detail produk
- Mengatur kategori
- Mengatur harga beli
- Mengatur harga jual
- Mengatur stok
- Mengatur satuan
- Mengatur SKU/kode produk
- Mengatur barcode jika diperlukan
- Mengatur status produk aktif/nonaktif

Data produk minimal:

- ID
- SKU
- Barcode
- Nama produk
- Kategori
- Harga beli
- Harga jual
- Stok
- Minimum stok
- Satuan
- Status
- Created at
- Updated at

Harga beli digunakan untuk menghitung estimasi keuntungan.

---

# 8. KATEGORI PRODUK

Admin dapat:

- Menambah kategori
- Mengedit kategori
- Menghapus kategori
- Melihat jumlah produk dalam kategori

Contoh:

- Makanan
- Minuman
- Sembako
- Alat tulis
- Elektronik
- Lainnya

Jangan membatasi sistem hanya pada contoh kategori tersebut.

---

# 9. INVENTORY / STOK

Sistem harus mampu mengelola stok.

Ketika transaksi berhasil:

**stok produk otomatis berkurang.**

Contoh:

Stok awal = 20

Terjual = 3

Stok akhir = 17

Sistem juga harus dapat mencatat perubahan stok.

Jenis perubahan:

- Stok awal
- Pembelian barang
- Penjualan
- Penyesuaian stok
- Retur
- Koreksi stok

Jika memungkinkan, gunakan konsep **stock movement / inventory history**, sehingga perubahan stok dapat dilacak.

---

# 10. TRANSAKSI

Setiap transaksi harus memiliki:

- Nomor transaksi unik
- Kasir
- Tanggal
- Waktu
- Daftar produk
- Quantity
- Harga
- Subtotal
- Diskon
- Pajak jika digunakan
- Grand total
- Jumlah pembayaran
- Kembalian
- Metode pembayaran
- Status transaksi

Contoh nomor transaksi:

POS-20260908-0001

Nomor transaksi harus unik.

---

# 11. STRUK

Setelah transaksi selesai, sistem menghasilkan struk.

Struk minimal berisi:

- Nama toko
- Alamat toko jika tersedia
- Nomor transaksi
- Tanggal
- Nama kasir
- Produk
- Quantity
- Harga
- Subtotal
- Diskon
- Total
- Pembayaran
- Kembalian
- Metode pembayaran
- Footer toko

Struk harus memiliki layout yang cocok untuk:

- Thermal printer
- Print browser
- PDF jika diperlukan

Desain struk harus sederhana dan profesional.

---

# 12. LAPORAN PENJUALAN

Admin/Owner dapat melihat:

- Penjualan hari ini
- Penjualan kemarin
- Penjualan berdasarkan tanggal
- Penjualan berdasarkan periode
- Total transaksi
- Total omzet
- Total produk terjual
- Estimasi keuntungan

Filter:

- Hari ini
- Kemarin
- Minggu ini
- Bulan ini
- Custom date range

Sediakan tabel transaksi dan ringkasan statistik.

---

# 13. LAPORAN KEUNTUNGAN

Karena produk memiliki:

**Harga Beli**

dan

**Harga Jual**

sistem dapat menghitung estimasi keuntungan.

Formula dasar:

Keuntungan per item:

Harga Jual - Harga Beli

Total keuntungan:

(Harga Jual - Harga Beli) × Quantity

Pastikan perhitungan menggunakan harga pada saat transaksi, bukan hanya harga produk saat ini.

Hal ini penting karena harga produk dapat berubah di kemudian hari.

---

# 14. METODE PEMBAYARAN

Minimal:

- Cash

Sistem harus dirancang agar mudah ditambahkan:

- QRIS
- Transfer
- Debit
- Kredit
- E-wallet
- Metode pembayaran lainnya

Gunakan desain database yang tidak membuat penambahan payment method menjadi sulit.

---

# 15. RIWAYAT TRANSAKSI

Admin dapat melihat seluruh transaksi.

Fitur:

- Search nomor transaksi
- Filter tanggal
- Filter kasir
- Filter metode pembayaran
- Melihat detail transaksi
- Mencetak ulang struk
- Membatalkan transaksi jika memiliki permission

Jangan menghapus transaksi secara sembarangan.

Gunakan status transaksi seperti:

- completed
- cancelled
- refunded

agar histori tetap dapat dilacak.

---

# 16. FITUR MODERN YANG DIREKOMENDASIKAN

Selain fitur dasar, saya ingin aplikasi terlihat modern dan profesional.

Pertimbangkan fitur berikut:

### 1. Barcode Scanner

Kasir dapat memasukkan produk menggunakan barcode scanner.

Barcode scanner USB biasanya dapat diperlakukan seperti keyboard sehingga sistem harus mendukung input barcode dengan cepat.

---

### 2. Quick Search

Kasir dapat mencari produk berdasarkan:

- Nama
- SKU
- Barcode

Search harus cepat.

---

### 3. Shortcut Keyboard

Sediakan shortcut untuk mempercepat pekerjaan kasir.

Contoh:

- F2 → Search produk
- F4 → Checkout
- ESC → Tutup modal
- Delete → Hapus item
- Enter → Konfirmasi

Sesuaikan jika terdapat konflik dengan browser atau OS.

---

### 4. Low Stock Alert

Berikan peringatan jika stok berada di bawah minimum.

Contoh:

"5 produk memiliki stok menipis."

---

### 5. Produk Terlaris

Dashboard menampilkan produk yang paling banyak terjual.

---

### 6. Grafik Penjualan

Tampilkan grafik:

- Penjualan harian
- Penjualan mingguan
- Penjualan bulanan

---

### 7. Export Laporan

Laporan dapat diekspor ke:

- Excel
- CSV
- PDF

---

### 8. Retur Barang

Tambahkan kemampuan untuk menangani:

- Retur penjualan
- Pengembalian barang
- Penyesuaian stok

Pastikan retur memengaruhi laporan dan inventory dengan benar.

---

### 9. Shift Kasir

Jika toko memiliki beberapa kasir:

Kasir dapat:

**Open Shift → Transaksi → Close Shift**

Saat close shift, sistem menampilkan:

- Modal awal
- Total transaksi
- Total cash
- Total non-cash
- Expected cash
- Actual cash
- Selisih

Ini sangat berguna untuk operasional toko.

---

### 10. Audit Log

Catat aktivitas penting:

- Login
- Logout
- Menambah produk
- Mengubah harga
- Mengubah stok
- Membatalkan transaksi
- Mengubah user
- Mengubah pengaturan

Owner dapat mengetahui siapa yang melakukan perubahan.

---

### 11. Manajemen User

Admin dapat:

- Tambah user
- Edit user
- Nonaktifkan user
- Atur role
- Reset password

---

### 12. Pengaturan Toko

Admin dapat mengatur:

- Nama toko
- Logo
- Alamat
- Nomor telepon
- Footer struk
- Format nomor transaksi
- Pajak
- Diskon
- Metode pembayaran

---

### 13. Backup Data

Jika sistem digunakan secara serius, pertimbangkan mekanisme backup database.

---

# 17. DATABASE DESIGN

Sebelum membuat migration, rancang ERD terlebih dahulu.

Minimal pertimbangkan tabel:

- users
- roles / role relation
- products
- categories
- sales / transactions
- sale_items / transaction_items
- payments
- stock_movements
- settings

Jika fitur tambahan digunakan:

- shifts
- returns
- return_items
- audit_logs
- suppliers
- purchases
- purchase_items

Jangan membuat tabel hanya karena terlihat lengkap.

Pastikan setiap tabel memiliki alasan dan relationship yang jelas.

---

# 18. TRANSACTION INTEGRITY

Proses checkout harus aman.

Ketika transaksi dilakukan:

1. Validasi produk.
2. Validasi stok.
3. Hitung total di server.
4. Simpan transaksi.
5. Simpan item transaksi.
6. Simpan payment.
7. Kurangi stok.
8. Catat stock movement.
9. Commit transaction.

Gunakan database transaction Laravel.

Jika salah satu proses gagal:

**rollback seluruh transaksi.**

Jangan sampai:

- transaksi tercatat tetapi stok tidak berkurang
- stok berkurang tetapi transaksi gagal
- payment tercatat tetapi transaction gagal

---

# 19. SECURITY

Pastikan sistem terlindungi dari:

- SQL Injection
- XSS
- CSRF
- IDOR
- Unauthorized access
- Privilege escalation
- Mass assignment
- Manipulasi harga melalui frontend
- Manipulasi total transaksi
- Manipulasi stok

Harga dan total transaksi harus dihitung/divalidasi di server.

Jangan mempercayai:

- harga dari browser
- total dari browser
- role dari browser
- stok dari browser

Frontend hanya digunakan sebagai interface.

---

# 20. UI/UX

Desain aplikasi:

**Modern + Clean + Professional + Fast**

Gunakan dashboard layout dengan:

- Sidebar
- Top navigation
- Cards
- Tables
- Modal
- Toast notification
- Confirmation dialog
- Loading state
- Empty state
- Error state

POS screen harus berbeda dari halaman admin biasa.

Halaman kasir harus fokus pada:

**Produk + Keranjang + Pembayaran**

Minimalkan klik yang tidak diperlukan.

Responsive untuk:

- Desktop
- Laptop
- Tablet

Prioritaskan desktop/tablet karena POS biasanya digunakan pada perangkat tersebut.

---

# 21. ERROR HANDLING

Gunakan error handling yang jelas.

User harus mendapatkan pesan seperti:

"Stok produk tidak mencukupi."

bukan:

"SQLSTATE[23000]..."

Detail teknis tetap dicatat pada log.

Jangan menampilkan informasi sensitif kepada user.

---

# 22. ARCHITECTURE

Gunakan struktur Laravel yang maintainable.

Hindari menaruh seluruh logic bisnis di Controller.

Pisahkan logic jika memang diperlukan.

Pertimbangkan:

- Form Request
- Service
- Repository jika benar-benar diperlukan
- Policy
- Resource
- Model
- Event/Listener jika relevan

Namun:

**Jangan overengineering.**

Untuk aplikasi sederhana, gunakan architecture yang sederhana.

---

# 23. DEVELOPMENT WORKFLOW

Kerjakan project dengan tahapan:

## Phase 1 — Analysis

Analisis requirement.

Buat:

- Feature list
- User roles
- User flow
- Business rules
- Assumptions

## Phase 2 — Architecture

Buat:

- Architecture
- Database design
- ERD
- Relationship
- Folder structure

## Phase 3 — Foundation

Implementasikan:

- Laravel setup
- Authentication
- Authorization
- Layout
- User management

## Phase 4 — Master Data

Implementasikan:

- Categories
- Products
- Inventory

## Phase 5 — POS

Implementasikan:

- Product search
- Cart
- Checkout
- Payment
- Transaction
- Stock reduction

## Phase 6 — Receipt

Implementasikan:

- Receipt
- Print
- PDF jika diperlukan

## Phase 7 — Reports

Implementasikan:

- Daily sales
- Monthly sales
- Revenue
- Profit
- Best selling products

## Phase 8 — Advanced Features

Implementasikan sesuai prioritas:

- Barcode
- Shift
- Returns
- Audit log
- Supplier
- Purchase
- Export
- Backup

## Phase 9 — Testing

Test:

- Authentication
- Authorization
- Product
- Stock
- Checkout
- Payment
- Receipt
- Reports
- Returns
- Edge cases

## Phase 10 — Optimization

Review:

- Database queries
- Performance
- Security
- UX
- Code quality

---

# 24. IMPORTANT DEVELOPMENT RULES

Jangan langsung membuat semua fitur sekaligus.

Setiap tahap harus dapat berjalan sebelum lanjut ke tahap berikutnya.

Sebelum coding:

**jelaskan rancangan terlebih dahulu.**

Jika terdapat requirement yang ambigu:

- gunakan asumsi yang masuk akal
- sebutkan asumsi
- lanjutkan pekerjaan

Jangan terus-menerus meminta konfirmasi untuk hal kecil.

---

# 25. OUTPUT PADA AWAL PROJECT

Untuk tahap pertama, JANGAN langsung membuat seluruh kode.

Berikan terlebih dahulu:

### A. Analisis kebutuhan

### B. Daftar fitur

Pisahkan menjadi:

- MVP
- Recommended
- Advanced

### C. User roles

### D. User flow

### E. Business rules

### F. Database / ERD

### G. Struktur folder Laravel

### H. Architecture

### I. Roadmap development

### J. Risiko dan potensi masalah

### K. Rekomendasi fitur tambahan

Setelah rancangan disetujui, implementasikan secara bertahap.

---

# 26. DEFINITION OF DONE

Sebuah fitur dianggap selesai apabila:

- Berfungsi sesuai requirement.
- Validation berjalan.
- Authorization berjalan.
- Tidak menghasilkan error.
- Tidak merusak fitur lain.
- Database relationship benar.
- UI dapat digunakan.
- Edge case diperhatikan.
- Security diperhatikan.
- Kode mudah dipelihara.

---

# 27. IMPORTANT BUSINESS RULES

Beberapa aturan bisnis harus dijaga:

1. Stok berkurang hanya ketika transaksi berhasil.
2. Transaksi yang gagal tidak boleh mengurangi stok.
3. Total transaksi dihitung ulang di server.
4. Harga transaksi harus disimpan pada transaction item.
5. Perubahan harga produk tidak boleh mengubah histori transaksi lama.
6. Nomor transaksi harus unik.
7. Transaksi yang dibatalkan tetap tersimpan sebagai histori.
8. User hanya dapat melakukan aktivitas sesuai role.
9. Semua perubahan stok penting harus dapat dilacak.
10. Perhitungan keuntungan menggunakan harga beli dan harga jual pada saat transaksi.
11. Checkout harus menggunakan database transaction.
12. Jangan menghapus histori transaksi secara permanen kecuali benar-benar diperlukan dan memiliki authorization khusus.

---

# 28. PRIORITAS FITUR

Gunakan prioritas:

### MVP — WAJIB

- Login
- Role
- Dashboard
- Produk
- Kategori
- Stok
- POS
- Cart
- Checkout
- Cash payment
- Transaction
- Receipt
- Daily sales report
- Revenue calculation
- Basic profit calculation

### PROFESSIONAL — DIREKOMENDASIKAN

- Barcode
- Multiple payment methods
- Low stock alert
- Best selling products
- Sales chart
- Advanced reports
- Export Excel/CSV/PDF
- User management
- Shift kasir
- Audit log
- Store settings
- Return/refund

### ADVANCED

- Supplier
- Purchase order
- Stock purchasing
- Automatic stock receiving
- Customer management
- Loyalty system
- Discount/promotion engine
- QRIS/payment gateway
- Multi-outlet
- Multi-warehouse
- Cloud backup
- Offline POS/PWA
- Advanced analytics

Jangan implementasikan fitur Advanced sebelum core POS stabil.

---

# FINAL INSTRUCTION

Saya ingin aplikasi ini dikembangkan seperti software production-ready.

Jangan memperlakukan project sebagai tutorial CRUD sederhana.

Pikirkan sistem dari sudut pandang:

**Developer + Kasir + Owner + Business**

Ketika membuat keputusan teknis, prioritaskan:

**Security → Correctness → Maintainability → Performance → UX**

Dan selalu gunakan workflow:

**Understand → Plan → Implement → Test → Review**

Pada respons pertama, jangan langsung menghasilkan seluruh source code.

Mulailah dengan **analisis kebutuhan, rekomendasi fitur, arsitektur, ERD/database design, user flow, dan roadmap implementasi** untuk aplikasi POS ini.
