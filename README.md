# ⚡ OTW keun — Hyperlocal Super App Suite (Web & PWA)

Aplikasi web berbasis mobile-first & Progressive Web App (PWA) lengkap untuk layanan **Pesan Antar Makanan (OTWFood)**, **Ojek Online (OTWRide)**, dan **Pengantaran Barang & Dokumen (OTWKirim)** di wilayah **Kecamatan Ciater, Kabupaten Subang dan Sekitarnya** *(Sari Ater, Palasari, Cisaat, Jalancagak, Sagalaherang, Cisalak)*.

![OTW keun App Suite](https://img.shields.io/badge/OTW%20keun-PWA%20Ready-16a34a?style=for-the-badge&logo=pwa)
![Realtime Sync](https://img.shields.io/badge/Sync-BroadcastChannel-blue?style=for-the-badge)
![Maps](https://img.shields.io/badge/Maps-Leaflet%20OSM-emerald?style=for-the-badge)

---

## 🌟 Fitur Utama

- **👤 1. Aplikasi Pelanggan (`index.html`)**:
  - PWA Installable ke homescreen HP Android & iOS (*Add to Home Screen*).
  - Pesan Makanan (*OTWFood*) dari warung nasi liwet, sate maranggi, kedai kopi, & oleh-oleh nanas khas Subang.
  - Ojek & Mobil (*OTWRide*) dengan tarif zonasi per-km lokal.
  - Kirim Paket & Dokumen (*OTWKirim*) antar desa & villa.
  - **Peta Interaktif Real-Time (Leaflet OSM)** berpusat di Ciater dengan live driver movement GPS tracking.
  - **In-App Chat Real-Time** dengan Driver partner dilengkapi quick reply chips.
  - Voucher & Promo system (`CIATERKULINER`, `RIDEHEMAT`, `GRATISONGKIR`).
  - Dompet digital OTWPay + COD (Bayar di Tempat) + QRIS.

- **🏍️ 2. Aplikasi Mitra Driver (`driver.html`)**:
  - Tombol toggle Online/Offline instan.
  - Radar order masuk otomatis dengan **audio chime synthesizer** Web Audio API dan hitung mundur 20 detik.
  - Navigasi rute 3 langkah (*Menuju Warung ➔ Konfirmasi Ambil ➔ Menuju Alamat Antar*).
  - Peta Leaflet navigasi GPS aktif.
  - In-App Chat langsung dengan pelanggan.
  - Dompet penghasilan harian/mingguan dan simulasi penarikan instan (*withdrawal*).

- **🏪 3. Aplikasi Mitra Warung / Resto (`merchant.html`)**:
  - Antrean dapur (*Kitchen Display System*) dengan 3 tab: *Pesanan Baru, Sedang Dimasak, Siap Diambil*.
  - Notifikasi audio lonceng dapur saat ada pesanan makanan baru masuk.
  - Buka / Tutup toko instan.
  - Manajemen ketersediaan menu (*Tersedia / Habis*).
  - Ringkasan omzet & riwayat penjualan.

- **⚙️ 4. Console Admin & Dispatcher (`admin.html`)**:
  - Monitoring transaksi live dengan pencarian instan.
  - Ringkasan KPI (Total Order, GMV, Driver Online, Warung Buka).
  - Modal detail transaksi & integrasi struk WhatsApp.
  - Manajemen verifikasi mitra pengemudi & merchant.
  - Konfigurasi tarif per kilometer & zona wilayah.

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
```bash
npm start
```
Buka peramban di:
- **Pelanggan**: `http://localhost:3000`
- **Driver**: `http://localhost:3000/driver.html`
- **Warung/Resto**: `http://localhost:3000/merchant.html`
- **Admin**: `http://localhost:3000/admin.html`

Untuk menguji langsung di smartphone, pastikan laptop dan HP terhubung ke Wi-Fi yang sama, lalu buka `http://<IP-Laptop-Anda>:3000`.

---

## 🌐 Deploy ke GitHub Pages

Aplikasi ini 100% Client-Side static web app, sehingga dapat di-host langsung di GitHub Pages secara gratis dengan dukungan HTTPS:

1. Push seluruh repositori ke GitHub:
   ```bash
   git push -u origin main
   ```
2. Buka repository di GitHub: **Settings** ➔ **Pages**
3. Di bagian **Build and deployment**, pilih **Source**: **`Deploy from a branch`** (Branch: **`main`**, Folder: **`/ (root)`**) atau gunakan **`GitHub Actions`**.
4. Aplikasi akan live dan dapat diakses dari mana saja.
