-- ==============================================================================
-- ⚡ OTW keun (Ciater Super App) — Supabase PostgreSQL Schema & Realtime Setup
-- ==============================================================================
-- Petunjuk:
-- 1. Buka dashboard Supabase (https://supabase.com/dashboard)
-- 2. Pilih Project Anda -> Masuk ke menu "SQL Editor"
-- 3. Tempelkan (paste) seluruh isi skrip ini lalu klik "Run"
-- ==============================================================================

-- 1. TABEL: ORDERS (Transaksi Semua Layanan)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    service TEXT NOT NULL DEFAULT 'FOOD', -- 'FOOD', 'RIDE', 'KIRIM'
    service_name TEXT DEFAULT 'OTWFood',
    title TEXT,
    food_order_desc TEXT,
    food_area TEXT,
    food_category TEXT,
    customer_name TEXT NOT NULL DEFAULT 'Pelanggan Ciater',
    customer_phone TEXT DEFAULT '+62 821-1988-7766',
    customer_location TEXT,
    pickup_location TEXT,
    drop_location TEXT,
    pickup_coords JSONB DEFAULT '[-6.7350, 107.6580]'::jsonb,
    drop_coords JSONB DEFAULT '[-6.7412, 107.6534]'::jsonb,
    target_driver TEXT DEFAULT 'nova',
    driver_name TEXT,
    driver_phone TEXT,
    driver_phone_display TEXT,
    driver_vehicle TEXT,
    driver_rating TEXT DEFAULT '4.95',
    driver_avatar TEXT DEFAULT '🛵',
    items JSONB DEFAULT '[]'::jsonb,
    items_summary TEXT,
    subtotal NUMERIC DEFAULT 0,
    delivery_fee NUMERIC DEFAULT 9000,
    service_fee NUMERIC DEFAULT 1000,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'COD',
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COOKING, READY, DRIVER_ASSIGNED, DRIVER_ARRIVED_PICKUP, DRIVER_ON_WAY, COMPLETED, CANCELLED
    status_color TEXT DEFAULT 'amber',
    time_display TEXT DEFAULT 'Baru saja',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Jakarta', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Jakarta', NOW())
);

-- 2. TABEL: CHATS (In-App Chat Realtime Pelanggan & Driver)
CREATE TABLE IF NOT EXISTS public.chats (
    id TEXT PRIMARY KEY DEFAULT ('msg-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || FLOOR(RANDOM() * 1000)::TEXT),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer', -- 'customer', 'driver', 'merchant', 'admin'
    text TEXT NOT NULL,
    time TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Jakarta', NOW())
);

-- 3. TABEL: MERCHANTS (Mitra Warung / Resto Dapur)
CREATE TABLE IF NOT EXISTS public.merchants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'sunda',
    emoji TEXT DEFAULT '🥘',
    rating NUMERIC DEFAULT 4.9,
    reviews INTEGER DEFAULT 100,
    address TEXT,
    phone TEXT,
    is_open BOOLEAN DEFAULT TRUE,
    commission_rate NUMERIC DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Jakarta', NOW())
);

-- 4. TABEL: MENUS (Daftar Menu Warung)
CREATE TABLE IF NOT EXISTS public.menus (
    id TEXT PRIMARY KEY,
    merchant_id TEXT REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    emoji TEXT DEFAULT '🥘',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Jakarta', NOW())
);

-- 5. TABEL: DRIVER_LOCATIONS (Live GPS Tracking Driver)
CREATE TABLE IF NOT EXISTS public.driver_locations (
    username TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    vehicle TEXT,
    lat NUMERIC NOT NULL DEFAULT -6.7360,
    lng NUMERIC NOT NULL DEFAULT 107.6570,
    status TEXT DEFAULT 'ONLINE', -- 'ONLINE', 'OFFLINE'
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Jakarta', NOW())
);

-- ==============================================================================
-- KEAMANAN: ROW LEVEL SECURITY (RLS) & POLICIES (Publik untuk Demo PWA)
-- ==============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada (idempotent)
DROP POLICY IF EXISTS "Public full access on orders" ON public.orders;
DROP POLICY IF EXISTS "Public full access on chats" ON public.chats;
DROP POLICY IF EXISTS "Public full access on merchants" ON public.merchants;
DROP POLICY IF EXISTS "Public full access on menus" ON public.menus;
DROP POLICY IF EXISTS "Public full access on driver_locations" ON public.driver_locations;

-- Buat policy baru dengan akses penuh
CREATE POLICY "Public full access on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on chats" ON public.chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on merchants" ON public.merchants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on menus" ON public.menus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on driver_locations" ON public.driver_locations FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- REPLICA IDENTITY (Agar payload realtime mengirimkan data lengkap saat update)
-- ==============================================================================
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER TABLE public.merchants REPLICA IDENTITY FULL;
ALTER TABLE public.menus REPLICA IDENTITY FULL;
ALTER TABLE public.driver_locations REPLICA IDENTITY FULL;

-- ==============================================================================
-- PUBLIKASI REALTIME (Supabase Realtime WebSocket)
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders, public.chats, public.merchants, public.menus, public.driver_locations;

-- ==============================================================================
-- SEED INITIAL DATA (Data Awal Warung & Driver)
-- ==============================================================================

INSERT INTO public.merchants (id, name, category, emoji, rating, reviews, address, phone, is_open)
VALUES 
('resto-1', 'Warung Nasi Liwet Bu Tini', 'sunda', '🥘', 4.9, 240, 'Jl. Raya Ciater No. 45, Palasari', '+62 813-8822-9900', true),
('resto-2', 'Sate Maranggi Sari Ater Mang Ocid', 'sunda', '🍢', 4.8, 189, 'Sari Ater Hot Spring, Ciater', '+62 812-9911-2233', true),
('resto-3', 'Bakso Rudal Urat Pak Kumis Ciater', 'bakso', '🍜', 4.7, 310, 'Pasar Ciater No. 12', '+62 857-1122-3344', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.driver_locations (username, name, phone, vehicle, lat, lng, status)
VALUES
('nova', 'Nova Pratama', '0896-3053-7250', 'Honda Beat Street (T 3819 ZB)', -6.7360, 107.6570, 'ONLINE'),
('leo', 'Leo Firmansyah', '0877-0069-2352', 'Yamaha NMAX 155 (T 5920 AB)', -6.7350, 107.6580, 'ONLINE')
ON CONFLICT (username) DO UPDATE 
SET lat = EXCLUDED.lat, lng = EXCLUDED.lng, status = EXCLUDED.status;

-- Seed Sample Orders
INSERT INTO public.orders (
    id, service, service_name, title, food_order_desc, food_area, customer_name, customer_phone, 
    customer_location, pickup_location, drop_location, target_driver, driver_name, driver_phone, 
    driver_phone_display, driver_vehicle, subtotal, delivery_fee, service_fee, total, payment_method, status, time_display
)
VALUES 
(
    'OTW-9102', 'FOOD', 'OTWFood', 'Paket Liwet Komplit Ayam Bakar', '1x Paket Liwet Komplit Ayam Bakar, 1x Es Teh Manis', 
    'Area Sari Ater & Palasari', 'Asep Gunawan', '+62 821-1988-7766', 'Desa Palasari RT 02/03, Ciater', 
    'Warung Nasi Liwet Bu Tini', 'Desa Palasari RT 02/03, Ciater', 'nova', 'Nova Pratama', '089630537250', 
    '0896-3053-7250', 'Honda Beat Street (T 3819 ZB)', 33000, 9000, 1000, 43000, 'COD', 'DRIVER_ON_WAY', '15 mnt lalu'
),
(
    'OTW-8911', 'RIDE', 'OTWRide', 'OTWRide ke Sari Ater', NULL, NULL, 'Hendra Setiawan', '+62 812-3344-5566', 
    'Terminal Jalancagak Subang', 'Pemandian Air Panas Sari Ater', 'Terminal Jalancagak Subang', 'leo', 'Leo Firmansyah', 
    '087700692352', '0877-0069-2352', 'Yamaha NMAX 155 (T 5920 AB)', 10000, 0, 1000, 11000, 'QRIS', 'COMPLETED', '1 jam lalu'
)
ON CONFLICT (id) DO NOTHING;
