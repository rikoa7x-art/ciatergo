/**
 * ⚡ OTW keun Shared Sync Bus & Supabase Bridge
 * Menghubungkan komunikasi real-time antar layar dan lintas perangkat:
 * 1. Supabase Cloud Database (PostgreSQL) + Realtime WebSocket (Jika terhubung)
 * 2. BroadcastChannel API + localStorage (Fallback / Pengujian Lokal Offline)
 */

const SYNC_CHANNEL_NAME = 'otwkeun_bus';
const syncBus = ('BroadcastChannel' in window) ? new BroadcastChannel(SYNC_CHANNEL_NAME) : null;

// Initial state keys
const STORAGE_KEYS = {
  ORDERS: 'otwkeun_orders_db',
  DRIVERS: 'otwkeun_drivers_db',
  MERCHANTS: 'otwkeun_merchants_db',
  CHATS: 'otwkeun_chats_db',
  USER: 'otwkeun_current_user'
};

// Event Types
const SYNC_EVENTS = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_ACCEPTED_MERCHANT: 'ORDER_ACCEPTED_MERCHANT',
  ORDER_COOKING: 'ORDER_COOKING',
  ORDER_READY_FOR_PICKUP: 'ORDER_READY_FOR_PICKUP',
  ORDER_ACCEPTED_DRIVER: 'ORDER_ACCEPTED_DRIVER',
  ORDER_DRIVER_ARRIVED_PICKUP: 'ORDER_DRIVER_ARRIVED_PICKUP',
  ORDER_DRIVER_PICKED_UP: 'ORDER_DRIVER_PICKED_UP',
  ORDER_DRIVER_ON_WAY: 'ORDER_DRIVER_ON_WAY',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  DRIVER_STATUS_CHANGE: 'DRIVER_STATUS_CHANGE',
  MERCHANT_STATUS_CHANGE: 'MERCHANT_STATUS_CHANGE',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  DRIVER_GPS_MOVE: 'DRIVER_GPS_MOVE'
};

// Known Real Coordinates in Kecamatan Ciater & Sekitarnya
const CIATER_LOCATIONS = {
  SARI_ATER: { name: 'Sari Ater Hot Spring Resort', lat: -6.7412, lng: 107.6534 },
  CIATER_HIGHLAND: { name: 'Ciater Highland Resort', lat: -6.7265, lng: 107.6651 },
  CISAAT: { name: 'Desa Wisata Cisaat Ciater', lat: -6.7198, lng: 107.6780 },
  PALASARI: { name: 'Desa Palasari Ciater', lat: -6.7350, lng: 107.6580 },
  JALANCAGAK: { name: 'Terminal / Bundaran Jalancagak', lat: -6.6852, lng: 107.6835 },
  KEBUN_TEH: { name: 'Kebun Teh & Tangkuban Parahu Ciater', lat: -6.7490, lng: 107.6420 }
};

// Initial Seed Data
function getStoredOrders() {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS) || localStorage.getItem('gasskeun_orders_db');
  if (!data) {
    const defaultOrders = [
      {
        id: 'OTW-9102',
        service: 'FOOD',
        serviceName: 'OTWFood',
        merchantId: 'resto-1',
        merchantName: 'Warung Nasi Liwet Bu Tini',
        merchantLocation: 'Jl. Raya Ciater No. 45',
        customerName: 'Asep Gunawan',
        customerPhone: '+62 821-1988-7766',
        customerLocation: 'Desa Palasari RT 02/03, Ciater',
        pickupCoords: [-6.7350, 107.6580],
        dropCoords: [-6.7412, 107.6534],
        targetDriver: 'nova',
        driverName: 'Nova Pratama',
        driverPhone: '089630537250',
        driverPhoneDisplay: '0896-3053-7250',
        driverVehicle: 'Honda Beat Street (T 3819 ZB)',
        items: [
          { name: 'Paket Liwet Komplit Ayam Bakar', qty: 1, price: 28000, note: 'Sambal dipisah ya bu' },
          { name: 'Es Teh Manis Melati', qty: 1, price: 5000, note: 'Manis sedang' }
        ],
        subtotal: 33000,
        deliveryFee: 9000,
        serviceFee: 1000,
        discount: 0,
        total: 43000,
        paymentMethod: 'COD',
        status: 'DRIVER_ON_WAY',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        timeDisplay: '15 mnt lalu'
      },
      {
        id: 'OTW-8911',
        service: 'RIDE',
        serviceName: 'OTWRide',
        customerName: 'Hendra Setiawan',
        customerPhone: '+62 812-3344-5566',
        pickupLocation: 'Pemandian Air Panas Sari Ater',
        dropLocation: 'Terminal Jalancagak Subang',
        pickupCoords: [-6.7412, 107.6534],
        dropCoords: [-6.6852, 107.6835],
        vehicleType: 'BIKE',
        targetDriver: 'leo',
        driverName: 'Leo Firmansyah',
        driverPhone: '087700692352',
        driverPhoneDisplay: '0877-0069-2352',
        driverVehicle: 'Yamaha NMAX 155 (T 5920 AB)',
        total: 10000,
        paymentMethod: 'QRIS',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        timeDisplay: '1 jam lalu'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(defaultOrders));
    return defaultOrders;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function addOrder(order) {
  const orders = getStoredOrders();
  const existingIdx = orders.findIndex(o => o.id === order.id);
  if (existingIdx === -1) {
    orders.unshift(order);
  } else {
    orders[existingIdx] = order;
  }
  saveOrders(orders);

  // Broadcast locally
  broadcastEvent(SYNC_EVENTS.ORDER_CREATED, order);

  // Sync to Supabase Cloud Database
  if (window.OtwSupabase && window.OtwSupabase.isConnected()) {
    window.OtwSupabase.insertOrder(order).catch(err => console.log('Supabase sync order err:', err));
  }

  return order;
}

function updateOrderStatus(orderId, newStatus, extraData = {}) {
  const orders = getStoredOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].status = newStatus;
    Object.assign(orders[index], extraData);
    saveOrders(orders);
    const payload = { orderId, status: newStatus, order: orders[index], ...extraData };
    broadcastEvent('STATUS_UPDATED', payload);

    if (newStatus === 'COOKING') broadcastEvent(SYNC_EVENTS.ORDER_COOKING, payload);
    if (newStatus === 'READY') broadcastEvent(SYNC_EVENTS.ORDER_READY_FOR_PICKUP, payload);
    if (newStatus === 'DRIVER_ASSIGNED' || newStatus === 'ACCEPTED') broadcastEvent(SYNC_EVENTS.ORDER_ACCEPTED_DRIVER, payload);
    if (newStatus === 'DRIVER_ARRIVED_PICKUP') broadcastEvent(SYNC_EVENTS.ORDER_DRIVER_ARRIVED_PICKUP, payload);
    if (newStatus === 'DRIVER_ON_WAY' || newStatus === 'DRIVER_PICKED_UP') broadcastEvent(SYNC_EVENTS.ORDER_DRIVER_ON_WAY, payload);
    if (newStatus === 'COMPLETED' || newStatus === 'SELESAI') broadcastEvent(SYNC_EVENTS.ORDER_DELIVERED, payload);

    // Sync to Supabase Cloud Database
    if (window.OtwSupabase && window.OtwSupabase.isConnected()) {
      window.OtwSupabase.updateOrderStatus(orderId, newStatus, extraData).catch(err => console.log('Supabase update err:', err));
    }

    return orders[index];
  }
  return null;
}

// IN-APP CHAT HELPERS
function getChatMessages(orderId) {
  const allChats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '{}');
  return allChats[orderId] || [];
}

function sendChatMessage(orderId, sender, role, text) {
  const allChats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '{}');
  if (!allChats[orderId]) {
    allChats[orderId] = getChatMessages(orderId);
  }
  const newMsg = {
    id: 'msg-' + Date.now(),
    orderId,
    sender,
    role,
    text,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };
  allChats[orderId].push(newMsg);
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(allChats));

  // Local Broadcast
  broadcastEvent(SYNC_EVENTS.CHAT_MESSAGE, { orderId, message: newMsg });

  // Supabase Cloud Insert
  if (window.OtwSupabase && window.OtwSupabase.isConnected()) {
    window.OtwSupabase.insertChat(orderId, sender, role, text).catch(err => console.log('Supabase chat sync err:', err));
  }

  return newMsg;
}

function broadcastEvent(type, payload) {
  if (syncBus) {
    syncBus.postMessage({ type, payload, timestamp: Date.now() });
  }
  // Trigger storage event for cross-tab listeners
  localStorage.setItem('otwkeun_last_event', JSON.stringify({ type, payload, timestamp: Date.now() }));

  // Supabase Realtime broadcast for Driver GPS
  if (type === 'DRIVER_GPS_MOVE' && window.OtwSupabase && window.OtwSupabase.isConnected()) {
    window.OtwSupabase.broadcastDriverGPS(payload.orderId, payload.coords);
  }
}

const registeredEventListeners = [];

function listenSyncEvents(callback) {
  registeredEventListeners.push(callback);

  if (syncBus) {
    syncBus.addEventListener('message', (event) => {
      if (event.data && event.data.type) {
        callback(event.data.type, event.data.payload);
      }
    });
  }
  window.addEventListener('storage', (e) => {
    if (e.key === 'otwkeun_last_event' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        callback(data.type, data.payload);
      } catch (err) {}
    }
  });
}

// BRIDGE SUPABASE REALTIME EVENTS TO LOCAL LISTENERS
function hookSupabaseRealtimeBridge() {
  if (!window.OtwSupabase) return;

  // Listen to Supabase Realtime events
  window.OtwSupabase.onEvent((type, data) => {
    if (type === 'ORDER_CHANGE' && data.order) {
      const orders = getStoredOrders();
      const idx = orders.findIndex(o => o.id === data.order.id);
      if (idx !== -1) {
        orders[idx] = Object.assign(orders[idx], data.order);
      } else {
        orders.unshift(data.order);
      }
      saveOrders(orders);

      registeredEventListeners.forEach(cb => {
        cb('STATUS_UPDATED', { orderId: data.order.id, status: data.order.status, order: data.order });
        if (data.eventType === 'INSERT') {
          cb(SYNC_EVENTS.ORDER_CREATED, data.order);
        }
      });
    } else if (type === 'CHAT_MESSAGE' && data.message) {
      const orderId = data.orderId || data.message.order_id;
      const allChats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '{}');
      if (!allChats[orderId]) allChats[orderId] = [];
      const exists = allChats[orderId].some(m => m.id === data.message.id || (m.text === data.message.text && m.sender === data.message.sender));
      if (!exists) {
        allChats[orderId].push({
          id: data.message.id,
          sender: data.message.sender,
          role: data.message.role,
          text: data.message.text,
          time: data.message.time || 'Baru saja'
        });
        localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(allChats));
      }
      registeredEventListeners.forEach(cb => {
        cb(SYNC_EVENTS.CHAT_MESSAGE, { orderId, message: data.message });
      });
    } else if (type === 'DRIVER_GPS_MOVE' && data) {
      registeredEventListeners.forEach(cb => {
        cb('DRIVER_GPS_MOVE', data);
      });
    }
  });

  // Background fetch from Supabase if connected
  setTimeout(() => {
    if (window.OtwSupabase.isConnected()) {
      window.OtwSupabase.fetchOrders().then(cloudOrders => {
        if (cloudOrders && cloudOrders.length > 0) {
          saveOrders(cloudOrders);
          registeredEventListeners.forEach(cb => cb('STATUS_UPDATED', { refreshed: true }));
        }
      }).catch(() => {});
    }
  }, 1000);
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    hookSupabaseRealtimeBridge();
  });
}

// Export to global scope
const SyncObject = {
  getStoredOrders,
  saveOrders,
  addOrder,
  updateOrderStatus,
  getChatMessages,
  sendChatMessage,
  broadcastEvent,
  listenSyncEvents,
  CIATER_LOCATIONS,
  SYNC_EVENTS
};

window.OTWkeunSync = SyncObject;
window.OtwSync = SyncObject;
window.GasskeunSync = SyncObject; // Compatibility alias
window.CiaterSync = SyncObject; // Compatibility alias
