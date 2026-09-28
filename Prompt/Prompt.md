Saya memiliki project POS yang sudah berjalan menggunakan Laravel.

JANGAN langsung mengubah kode.

Saya ingin kamu melakukan AUDIT terhadap project existing terlebih dahulu.

Tujuan:
Saya ingin mengembangkan POS ini menjadi sistem yang lebih profesional tanpa merusak fitur yang sudah berjalan.

FITUR YANG SUDAH ADA:

1. Dashboard / POS
2. Product management
3. Category management
4. Transaction history
5. Sales & profit report
6. Cash payment
7. QRIS payment
8. Product search
9. Shopping cart
10. Checkout

FITUR YANG TIDAK BOLEH DITAMBAHKAN:

- Barcode
- Shift kasir
- Customer
- Loyalty point
- Promo/diskon
- Multi outlet

ATURAN PENTING:

Jangan rewrite project.

Jangan mengganti framework.

Jangan mengganti database.

Jangan menghapus fitur existing.

Jangan mengubah behavior fitur existing tanpa alasan.

Sebelum melakukan perubahan, inspect seluruh struktur project yang relevan.

Periksa:

- Laravel version
- PHP version
- package/dependency
- routes
- models
- controllers
- migrations
- database schema
- views
- JavaScript
- authentication
- authorization
- transaction flow
- product flow
- payment flow
- report calculation

Cari dan identifikasi model/tabel/controller yang berhubungan dengan:

- users
- products
- categories
- transactions/orders
- transaction items
- payments
- stock
- reports

Kemudian buat AUDIT REPORT.

Output:

1. Struktur project existing
2. Daftar tabel database existing
3. Relationship antar tabel
4. Daftar model
5. Daftar controller
6. Daftar route
7. Alur POS dari memilih produk sampai pembayaran
8. Alur penyimpanan transaksi
9. Alur perubahan stok
10. Cara perhitungan omzet
11. Cara perhitungan keuntungan
12. Fitur yang sudah aman dan tidak perlu diubah
13. Fitur yang perlu diperbaiki
14. Risiko perubahan terhadap project existing
15. Rekomendasi migration yang diperlukan
16. Rekomendasi tabel baru
17. Rekomendasi kolom baru
18. Roadmap implementasi berdasarkan prioritas

Jangan membuat migration atau mengubah file apa pun pada tahap ini.

Setelah audit selesai, tunggu instruksi berikutnya.
