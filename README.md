# ⚡ OTW keun — Hyperlocal Super App Suite (Web & PWA)

Aplikasi web berbasis mobile-first & Progressive Web App (PWA) lengkap untuk layanan **Pesan Antar Makanan (OTWFood)**, **Ojek Online (OTWRide)**, dan **Pengantaran Barang & Dokumen (OTWKirim)** di wilayah **Kecamatan Ciater, Kabupaten Subang dan Sekitarnya** *(Sari Ater, Palasari, Cisaat, Jalancagak, Sagalaherang, Cisalak)*.

![OTW keun App Suite](https://img.shields.io/badge/OTW%20keun-PWA%20Ready-16a34a?style=for-the-badge&logo=pwa)
![Realtime Sync](https://img.shields.io/badge/Sync-BroadcastChannel-blue?style=for-the-badge)
![Maps](https://img.shields.io/badge/Maps-Leaflet%20OSM-emerald?style=for-the-badge)

---

## 🌟 Satu Aplikasi Tunggal Berbasis Role Login

Aplikasi ini disatukan menjadi **1 aplikasi web & PWA tunggal (`index.html`)**, di mana tampilan dan pengalaman pengguna disesuaikan secara otomatis berdasarkan pilihan login:

### 👤 1. Mode Pelanggan (Masuk sebagai Pelanggan)
- Masuk menggunakan Nomor WhatsApp / HP + OTP (simulasi `123456`).
- **Fitur Utama**:
  - Pemesanan makanan (*OTWFood*), ojek (*OTWRide*), dan kurir paket (*OTWKirim*).
  - Peta live tracking GPS posisi motor driver di peta (*Leaflet OSM*).
  - In-App Chat langsung dengan driver yang bertugas.
  - Pembayaran COD & QRIS.

### 🏍️ 2. Mode Mitra Driver (Masuk sebagai Mitra Driver)
- Masuk menggunakan Akun Driver terdaftar (**Nova Pratama `#DRV-001`** / **Leo Firmansyah `#DRV-002`**, Password `12345`).
- **Fitur Utama**:
  - Tombol status kerja Online / Offline.
  - Radar order masuk otomatis dengan **audio chime synthesizer** & hitung mundur 20 detik.
  - Navigasi rute 3 langkah (*Cari Warung / Titik Jemput ➔ Konfirmasi Ambil ➔ Antar ke Alamat Pelanggan*).
  - Live broadcast koordinat GPS driver ke pelanggan.
  - In-App Chat langsung dengan pelanggan pemesan.
  - Dompet saldo penghasilan driver dan simulasi pencairan dana (*withdraw*).

---

### 🏪 3. Portal Pendukung
- **Mitra Warung / Dapur (`merchant.html`)**: Manajemen antrean dapur (*Kitchen Display System*) & katalog menu.
- **Admin Console (`admin.html`)**: Monitoring seluruh pesanan live, manajemen tarif, kelola driver/warung, & konfigurasi Supabase.

---

## 📁 Struktur Berkas

```
berangkat/
├── index.html              # 📱 Satu Aplikasi Tunggal (Role: Pelanggan & Mitra Driver)
├── merchant.html           # 🏪 Portal Dapur / Warung Kuliner
├── admin.html              # ⚙️ Console Admin & Central Dispatcher
├── manifest.json           # 📱 Progressive Web App (PWA) Manifest
├── icon.svg                # 🖼️ Ikon Aplikasi Utama
├── supabase_schema.sql     # 🗄️ SQL Schema PostgreSQL & Realtime
├── supabase-config.js      # ☁️ Supabase JS Client & Cloud Methods
├── shared-sync.js          # ⚡ Sync Bus (Supabase + BroadcastChannel)
├── sw.js                   # 🚀 Service Worker Offline-First Cache
├── server.js               # 🌐 Local Node.js Testing Server
├── package.json            # 📦 Project Config
└── README.md               # 📖 Dokumentasi Proyek
```

---

## 🗄️ Panduan Setup Supabase Backend (5 Menit)

Aplikasi **OTW keun** dapat bekerja secara **offline/lokal** dan juga terhubung ke **Supabase Cloud** untuk sinkronisasi multi-perangkat real-time:

### 1. Buat Proyek Supabase
1. Buka [supabase.com](https://supabase.com) dan buat proyek baru (contoh nama: `ciatergo-backend`).
2. Pilih wilayah terdekat (misal: *Singapore / Southeast Asia*).

### 2. Eksekusi SQL Schema
1. Di Dashboard Supabase, buka menu **SQL Editor** (ikon terminal).
2. Salin seluruh isi berkas [`supabase_schema.sql`](supabase_schema.sql) dan tempel ke SQL Editor.
3. Klik tombol **Run**. Tabel `orders`, `chats`, `merchants`, `menus`, dan `driver_locations` beserta RLS dan Realtime Publication akan langsung aktif.

### 3. Masukkan Kredensial ke Aplikasi
Ada 2 cara mudah memasukkan kredensial Supabase:
- **Cara A (Melalui Panel Admin)**:
  Buka `admin.html` ➔ Klik menu **Pengaturan** ➔ Gulir ke bagian **Integrasi Supabase Cloud Backend** ➔ Masukkan **Project URL** dan **Anon Key** ➔ Klik **Simpan Pengaturan**.
- **Cara B (Langsung di `supabase-config.js`)**:
  Buka berkas `supabase-config.js` dan isi variabel default:
  ```javascript
  const DEFAULT_SUPABASE_URL = 'https://your-project-id.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'your-anon-key-here';
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

## 🌐 Cara Deploy ke Vercel

Aplikasi ini sudah dikonfigurasi dengan `vercel.json` dan siap dideploy ke Vercel secara gratis dalam hitungan detik.

### Cara 1: Menggunakan Vercel Dashboard (Rekomendasi)
1. Buka [vercel.com](https://vercel.com) dan login (dengan akun GitHub).
2. Klik tombol **"Add New..."** ➔ **"Project"**.
3. Pilih repository GitHub: **`rikoa7x-art/ciatergo`** (atau nama repository Anda).
4. Klik **"Deploy"** (Semua pengaturan otomatis terdeteksi).
5. Selesai! Web app Anda akan langsung live dengan HTTPS gratis dan domain seperti `https://ciatergo.vercel.app`.

### Cara 2: Menggunakan Vercel CLI (Lewat Terminal)
1. Login ke Vercel di terminal:
   ```bash
   npx vercel login
   ```
2. Jalankan perintah deploy:
   ```bash
   npx vercel --prod
   ```

---

## 🌐 Deploy ke GitHub Pages (Alternatif)

Aplikasi ini 100% Client-Side static web app, sehingga dapat di-host langsung di GitHub Pages secara gratis dengan dukungan HTTPS:

1. Push seluruh repositori ke GitHub:
   ```bash
   git push -u origin main
   ```
2. Buka repository di GitHub: **Settings** ➔ **Pages**
3. Di bagian **Build and deployment**, pilih **Source**: **`Deploy from a branch`** (Branch: **`main`**, Folder: **`/ (root)`**) atau gunakan **`GitHub Actions`**.
4. Aplikasi akan live dan dapat diakses dari mana saja.
