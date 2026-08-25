# 🛵 CiaterGo — Hyperlocal Super App Suite (Web & PWA)

Aplikasi web berbasis mobile-first & Progressive Web App (PWA) lengkap untuk layanan **Pengiriman Makanan (CiaterFood)**, **Ojek Online (CiaterRide)**, dan **Pengantaran Barang & Dokumen (CiaterKirim)** di wilayah **Kecamatan Ciater, Kabupaten Subang dan Sekitarnya** *(Sari Ater, Palasari, Cisaat, Jalancagak, Sagalaherang, Cisalak)*.

![CiaterGo App Suite](https://img.shields.io/badge/CiaterGo-PWA%20Ready-16a34a?style=for-the-badge&logo=pwa)
![Realtime Sync](https://img.shields.io/badge/Sync-BroadcastChannel-blue?style=for-the-badge)
![Maps](https://img.shields.io/badge/Maps-Leaflet%20OSM-emerald?style=for-the-badge)

---

## 🌟 Fitur Utama

- **👤 1. Aplikasi Pelanggan (`index.html`)**:
  - PWA Installable ke homescreen HP Android & iOS.
  - Pesan Makanan (*CiaterFood*) dari warung nasi liwet, sate maranggi, kedai kopi, & oleh-oleh nanas khas Subang.
  - Ojek & Mobil (*CiaterRide*) dengan tarif zonasi per-km lokal Ciater.
  - Kirim Paket & Dokumen (*CiaterKirim*) antar desa & villa.
  - **Peta Interaktif Real-Time (Leaflet OSM)** berpusat di Ciater dengan live driver movement GPS tracking.
  - **In-App Chat Real-Time** dengan Driver partner dilengkapi quick reply chips.
  - Voucher & Promo system (`CIATERKULINER`, `RIDEHEMAT`, `GRATISONGKIR`).
  - Dompet digital CiaterPay + COD (Bayar di Tempat) + QRIS.

- **🏍️ 2. Aplikasi Mitra Driver (`driver.html`)**:
  - Tombol toggle Online/Offline instan.
  - Radar order masuk otomatis dengan **audio chime synthesizer** Web Audio API dan hitung mundur 20 detik.
  - Navigasi rute 3 langkah (*Menuju Warung ➔ Konfirmasi Ambil ➔ Menuju Alamat Antar*).
  - Peta Leaflet navigasi GPS aktif.
  - In-App Chat langsung dengan pelanggan.
  - Dompet penghasilan harian/mingguan dan simulasi penarikan instan (*withdrawal*).

- **🏪 3. Aplikasi Mitra Warung / Resto (`merchant.html`)**:
  - Antrean dapur (*Kitchen Display System*) dengan 3 tab: *Pesanan Baru, Sedang Dimasak, Siap Diambil*.
  - Notifikasi audio lonceng dapur saat ada pesanan makanan baru.
  - Buka / Tutup toko instan.
  - Manajemen ketersediaan menu (*Tersedia / Habis*).
  - Ringkasan omzet & riwayat penjualan.

- **⚙️ 4. Console Admin & Dispatcher (`admin.html`)**:
  - Monitoring transaksi live dengan pencarian instan.
  - Ringkasan KPI (Total Order, GMV, Driver Online, Warung Buka).
  - Modal detail transaksi & integrasi struk WhatsApp.
  - Manajemen verifikasi mitra pengemudi & merchant.
  - Konfigurasi tarif per kilometer & zona wilayah Ciater.

- **⚡ 5. Real-Time Event Bus (`shared-sync.js`)**:
  - Menghubungkan seluruh tab dan perangkat tanpa backend yang rumit via `BroadcastChannel` dan `localStorage`.

---

## 📁 Struktur Berkas

```
berangkat/
├── index.html         # 👤 Aplikasi Web Pelanggan (PWA & Live Map Tracking)
├── driver.html        # 🏍️ Aplikasi Web Mitra Pengemudi & Kurir
├── merchant.html      # 🏪 Aplikasi Web Mitra Warung / Dapur Resto
├── admin.html         # ⚙️ Console Admin & Central Dispatcher
├── shared-sync.js     # ⚡ Real-time State & Cross-Role Event Bus
├── manifest.json      # 📱 Progressive Web App (PWA) Manifest
├── sw.js              # 🚀 Service Worker (Cache Offline & Performa Instan)
├── server.js          # 🌐 Local Node.js Testing Server
├── package.json       # 📦 Project Configuration
└── README.md          # 📖 Dokumentasi Proyek
```

---

## 🚀 Cara Menjalankan Secara Lokal

### Menggunakan Node.js
1. Pastikan Node.js terpasang di komputer Anda.
2. Buka Terminal / PowerShell di folder ini dan jalankan:
   ```bash
   node server.js
   # atau
   npm start
   ```
3. Terminal akan menampilkan URL lokal dan IP Wi-Fi untuk dibuka langsung di browser HP:
   - Pelanggan: `http://localhost:3000`
   - Driver: `http://localhost:3000/driver.html`
   - Warung: `http://localhost:3000/merchant.html`
   - Admin: `http://localhost:3000/admin.html`

---

## 🌐 Cara Deploy ke GitHub Pages (Gratis & Online HTTPS)

Aplikasi ini dibuat murni menggunakan standar web modern (HTML5, Tailwind CSS, Leaflet JS, Web Audio API, PWA Service Worker) sehingga **100% siap dihosting gratis di GitHub Pages**:

1. Buat repository baru di [GitHub](https://github.com/new), beri nama misalnya `ciatergo` atau `ciater-delivery`.
2. Jalankan perintah berikut di terminal:
   ```bash
   git add .
   git commit -m "feat: initial commit for CiaterGo delivery app suite"
   git branch -M main
   git remote add origin https://github.com/<USERNAME-ANDA>/<NAMA-REPO>.git
   git push -u origin main
   ```
3. Buka halaman Repository di GitHub ➔ Masuk ke **Settings** ➔ **Pages**.
4. Pada bagian **Build and deployment** / **Source**:
   - Pilih Branch: **`main`**
   - Folder: **`/ (root)`**
   - Klik **Save**.
5. Tunggu sekitar 1 menit. Aplikasi Anda akan langsung aktif secara publik dan ber-HTTPS di:
   ```
   https://<USERNAME-ANDA>.github.io/<NAMA-REPO>/
   ```
6. Buka link tersebut di smartphone Android/iPhone Anda dan pilih **"Add to Home Screen"** untuk menginstalnya sebagai aplikasi!

---

## 📄 Lisensi

Proyek ini dibuat untuk mendukung digitalisasi UMKM dan transportasi lokal di wilayah Kecamatan Ciater, Kabupaten Subang, Jawa Barat.
