/**
 * ⚡ OTW keun — Supabase Backend & Realtime Configuration
 * Modul ini menghubungkan seluruh aplikasi (Pelanggan, Driver, Warung, Admin)
 * ke database PostgreSQL dan Realtime WebSocket Supabase.
 */

// Default configuration (Bisa diisi dengan project Supabase Anda atau diubah via Admin Panel)
const DEFAULT_SUPABASE_CONFIG = {
  URL: '', // Contoh: 'https://xyzcompany.supabase.co'
  ANON_KEY: '' // Contoh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};

const SUPABASE_STORAGE_KEYS = {
  URL: 'otwkeun_supabase_url',
  ANON_KEY: 'otwkeun_supabase_anon_key'
};

function getSavedSupabaseConfig() {
  const url = localStorage.getItem(SUPABASE_STORAGE_KEYS.URL) || DEFAULT_SUPABASE_CONFIG.URL;
  const anonKey = localStorage.getItem(SUPABASE_STORAGE_KEYS.ANON_KEY) || DEFAULT_SUPABASE_CONFIG.ANON_KEY;
  return { url: url.trim(), anonKey: anonKey.trim() };
}

function saveSupabaseConfig(url, anonKey) {
  if (url) localStorage.setItem(SUPABASE_STORAGE_KEYS.URL, url.trim());
  if (anonKey) localStorage.setItem(SUPABASE_STORAGE_KEYS.ANON_KEY, anonKey.trim());
  initSupabaseClient();
}

let supabaseClient = null;
let realtimeChannel = null;

function initSupabaseClient() {
  const { url, anonKey } = getSavedSupabaseConfig();
  if (url && anonKey && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(url, anonKey);
      console.log('⚡ [OTW keun] Supabase Client Initialized Successfully:', url);
      setupSupabaseRealtime();
      return supabaseClient;
    } catch (e) {
      console.warn('⚠️ [OTW keun] Supabase Client Init Error:', e);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
  return null;
}

function isSupabaseConnected() {
  return supabaseClient !== null;
}

// Convert app order object format to DB table schema
function orderToDbFormat(o) {
  return {
    id: o.id,
    service: o.service || 'FOOD',
    service_name: o.serviceName || (o.service === 'FOOD' ? 'OTWFood' : (o.service === 'RIDE' ? 'OTWRide' : 'OTWKirim')),
    title: o.title || o.merchantName || 'Pesanan OTW keun',
    food_order_desc: o.foodOrderDesc || null,
    food_area: o.foodArea || null,
    food_category: o.foodCategory || null,
    customer_name: o.customerName || 'Pelanggan Ciater',
    customer_phone: o.customerPhone || '+62 821-1988-7766',
    customer_location: o.customerLocation || o.dropLocation || 'Kecamatan Ciater',
    pickup_location: o.pickupLocation || o.foodArea || 'Kecamatan Ciater',
    drop_location: o.dropLocation || o.customerLocation || 'Kecamatan Ciater',
    pickup_coords: Array.isArray(o.pickupCoords) ? o.pickupCoords : [-6.7350, 107.6580],
    drop_coords: Array.isArray(o.dropCoords) ? o.dropCoords : [-6.7412, 107.6534],
    target_driver: o.targetDriver || 'nova',
    driver_name: o.driverName || null,
    driver_phone: o.driverPhone || null,
    driver_phone_display: o.driverPhoneDisplay || o.driverPhone || null,
    driver_vehicle: o.driverVehicle || null,
    driver_rating: o.driverRating || '4.95',
    driver_avatar: o.driverAvatar || '🛵',
    items: Array.isArray(o.items) ? o.items : [{ name: o.items || 'Pesanan', qty: 1 }],
    items_summary: o.itemsSummary || null,
    subtotal: Number(o.subtotal) || 0,
    delivery_fee: Number(o.deliveryFee) || 9000,
    service_fee: Number(o.serviceFee) || 1000,
    discount: Number(o.discount) || 0,
    total: Number(o.total) || 0,
    payment_method: o.paymentMethod || 'COD',
    status: o.status || 'PENDING',
    status_color: o.statusColor || 'amber',
    time_display: o.timeDisplay || 'Baru saja',
    updated_at: new Date().toISOString()
  };
}

// Convert DB row to app order object format
function dbToOrderFormat(row) {
  return {
    id: row.id,
    service: row.service,
    serviceName: row.service_name,
    title: row.title,
    foodOrderDesc: row.food_order_desc,
    foodArea: row.food_area,
    foodCategory: row.food_category,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerLocation: row.customer_location,
    pickupLocation: row.pickup_location,
    dropLocation: row.drop_location,
    pickupCoords: row.pickup_coords,
    dropCoords: row.drop_coords,
    targetDriver: row.target_driver,
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    driverPhoneDisplay: row.driver_phone_display,
    driverVehicle: row.driver_vehicle,
    driverRating: row.driver_rating,
    driverAvatar: row.driver_avatar,
    items: row.items,
    itemsSummary: row.items_summary,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    serviceFee: Number(row.service_fee),
    discount: Number(row.discount),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    status: row.status,
    statusColor: row.status_color,
    timeDisplay: row.time_display,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ASYNC DATABASE OPERATIONS
async function sbFetchOrders() {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(dbToOrderFormat);
  } catch (err) {
    console.warn('[Supabase] Fetch Orders Error:', err.message);
    return null;
  }
}

async function sbInsertOrder(order) {
  if (!supabaseClient) return null;
  try {
    const dbPayload = orderToDbFormat(order);
    const { data, error } = await supabaseClient
      .from('orders')
      .insert([dbPayload])
      .select();
    if (error) throw error;
    return data && data[0] ? dbToOrderFormat(data[0]) : order;
  } catch (err) {
    console.warn('[Supabase] Insert Order Error:', err.message);
    return null;
  }
}

async function sbUpdateOrderStatus(orderId, newStatus, extraData = {}) {
  if (!supabaseClient) return null;
  try {
    const updatePayload = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    if (extraData.driverName) updatePayload.driver_name = extraData.driverName;
    if (extraData.driverPhone) updatePayload.driver_phone = extraData.driverPhone;
    if (extraData.driverVehicle) updatePayload.driver_vehicle = extraData.driverVehicle;

    const { data, error } = await supabaseClient
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select();
    if (error) throw error;
    return data && data[0] ? dbToOrderFormat(data[0]) : null;
  } catch (err) {
    console.warn('[Supabase] Update Order Error:', err.message);
    return null;
  }
}

async function sbFetchChats(orderId) {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from('chats')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase] Fetch Chats Error:', err.message);
    return null;
  }
}

async function sbInsertChat(orderId, sender, role, text) {
  if (!supabaseClient) return null;
  try {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const chatRecord = {
      order_id: orderId,
      sender: sender,
      role: role,
      text: text,
      time: timeStr
    };
    const { data, error } = await supabaseClient
      .from('chats')
      .insert([chatRecord])
      .select();
    if (error) throw error;
    return data && data[0] ? data[0] : chatRecord;
  } catch (err) {
    console.warn('[Supabase] Insert Chat Error:', err.message);
    return null;
  }
}

// REALTIME SUBSCRIPTION SYSTEM
const realtimeListeners = [];

function onSupabaseEvent(callback) {
  realtimeListeners.push(callback);
}

function setupSupabaseRealtime() {
  if (!supabaseClient) return;

  if (realtimeChannel) {
    supabaseClient.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabaseClient.channel('otwkeun_global_channel')
    // 1. Listen to Postgres table changes on 'orders'
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        console.log('⚡ [Supabase Realtime] Order Change:', payload.eventType, payload.new);
        const orderObj = payload.new ? dbToOrderFormat(payload.new) : null;
        realtimeListeners.forEach(cb => cb('ORDER_CHANGE', {
          eventType: payload.eventType,
          order: orderObj,
          raw: payload
        }));
      }
    )
    // 2. Listen to Postgres table changes on 'chats'
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chats' },
      (payload) => {
        console.log('⚡ [Supabase Realtime] Chat Message:', payload.new);
        realtimeListeners.forEach(cb => cb('CHAT_MESSAGE', {
          orderId: payload.new.order_id,
          message: payload.new
        }));
      }
    )
    // 3. Listen to Realtime Broadcasts (Driver Live GPS)
    .on(
      'broadcast',
      { event: 'DRIVER_GPS_MOVE' },
      (eventPayload) => {
        realtimeListeners.forEach(cb => cb('DRIVER_GPS_MOVE', eventPayload.payload));
      }
    )
    .subscribe((status) => {
      console.log('⚡ [Supabase Realtime] Channel Subscription Status:', status);
    });
}

function sbBroadcastDriverGPS(orderId, coords) {
  if (realtimeChannel && isSupabaseConnected()) {
    realtimeChannel.send({
      type: 'broadcast',
      event: 'DRIVER_GPS_MOVE',
      payload: { orderId, coords, timestamp: Date.now() }
    });
  }
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initSupabaseClient();
  });
}

// Export Supabase helper module
window.OtwSupabase = {
  getSavedConfig: getSavedSupabaseConfig,
  saveConfig: saveSupabaseConfig,
  init: initSupabaseClient,
  isConnected: isSupabaseConnected,
  fetchOrders: sbFetchOrders,
  insertOrder: sbInsertOrder,
  updateOrderStatus: sbUpdateOrderStatus,
  fetchChats: sbFetchChats,
  insertChat: sbInsertChat,
  broadcastDriverGPS: sbBroadcastDriverGPS,
  onEvent: onSupabaseEvent
};
