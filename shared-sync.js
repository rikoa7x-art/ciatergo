/**
 * CiaterGo Shared Sync Bus
 * Menghubungkan komunikasi real-time antar tab/layar (Pelanggan, Driver, Merchant, Admin)
 * Menggunakan BroadcastChannel API dan localStorage.
 */

const SYNC_CHANNEL_NAME = 'ciatergo_bus';
const syncBus = ('BroadcastChannel' in window) ? new BroadcastChannel(SYNC_CHANNEL_NAME) : null;

// Initial state helpers
const STORAGE_KEYS = {
  ORDERS: 'ciatergo_orders_db',
  DRIVERS: 'ciatergo_drivers_db',
  MERCHANTS: 'ciatergo_merchants_db',
  CHATS: 'ciatergo_chats_db',
  USER: 'ciatergo_current_user'
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
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!data) {
    const defaultOrders = [
      {
        id: 'CTG-9102',
        service: 'FOOD',
        serviceName: 'CiaterFood',
        merchantId: 'resto-1',
        merchantName: 'Warung Nasi Liwet Bu Tini',
        merchantLocation: 'Jl. Raya Ciater No. 45',
        customerName: 'Asep Gunawan',
        customerPhone: '+62 821-1988-7766',
        customerLocation: 'Desa Palasari RT 02/03, Ciater',
        pickupCoords: [-6.7350, 107.6580],
        dropCoords: [-6.7412, 107.6534],
        driverName: 'Dadang Sudrajat',
        driverPhone: '+62 821-4455-6677',
        driverVehicle: 'Honda Vario 125 (T 4521 ZK)',
        items: [
          { name: 'Paket Liwet Komplit Ayam Bakar', qty: 1, price: 28000, note: 'Sambal dipisah ya bu' },
          { name: 'Es Teh Manis Melati', qty: 1, price: 5000, note: 'Manis sedang' }
        ],
        subtotal: 33000,
        deliveryFee: 6000,
        serviceFee: 1000,
        discount: 0,
        total: 40000,
        paymentMethod: 'COD',
        status: 'DRIVER_ON_WAY',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        timeDisplay: '15 mnt lalu'
      },
      {
        id: 'CTG-8911',
        service: 'RIDE',
        serviceName: 'CiaterRide',
        customerName: 'Hendra Setiawan',
        customerPhone: '+62 812-3344-5566',
        pickupLocation: 'Pemandian Air Panas Sari Ater',
        dropLocation: 'Terminal Jalancagak Subang',
        pickupCoords: [-6.7412, 107.6534],
        dropCoords: [-6.6852, 107.6835],
        vehicleType: 'BIKE',
        driverName: 'Ujang Berkah',
        driverPhone: '+62 812-7788-9900',
        total: 10000,
        paymentMethod: 'CiaterPay',
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
  orders.unshift(order);
  saveOrders(orders);
  broadcastEvent(SYNC_EVENTS.ORDER_CREATED, order);
  return order;
}

function updateOrderStatus(orderId, newStatus, extraData = {}) {
  const orders = getStoredOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].status = newStatus;
    Object.assign(orders[index], extraData);
    saveOrders(orders);
    broadcastEvent('STATUS_UPDATED', { orderId, status: newStatus, order: orders[index], ...extraData });
    return orders[index];
  }
  return null;
}

// IN-APP CHAT HELPERS
function getChatMessages(orderId) {
  const allChats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '{}');
  return allChats[orderId] || [
    {
      id: 'msg-1',
      sender: 'Dadang Sudrajat (Driver)',
      role: 'driver',
      text: 'Halo kak, pesanan sudah saya ambil dan segera meluncur ya!',
      time: 'Baru saja'
    }
  ];
}

function sendChatMessage(orderId, sender, role, text) {
  const allChats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '{}');
  if (!allChats[orderId]) {
    allChats[orderId] = getChatMessages(orderId);
  }
  const newMsg = {
    id: 'msg-' + Date.now(),
    sender,
    role,
    text,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };
  allChats[orderId].push(newMsg);
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(allChats));
  broadcastEvent(SYNC_EVENTS.CHAT_MESSAGE, { orderId, message: newMsg });
  return newMsg;
}

function broadcastEvent(type, payload) {
  if (syncBus) {
    syncBus.postMessage({ type, payload, timestamp: Date.now() });
  }
  // Trigger local storage event for older browser tabs
  localStorage.setItem('ciatergo_last_event', JSON.stringify({ type, payload, timestamp: Date.now() }));
}

function listenSyncEvents(callback) {
  if (syncBus) {
    syncBus.onmessage = (event) => {
      if (event.data && event.data.type) {
        callback(event.data.type, event.data.payload);
      }
    };
  }
  window.addEventListener('storage', (e) => {
    if (e.key === 'ciatergo_last_event' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        callback(data.type, data.payload);
      } catch (err) {}
    }
  });
}

// Export to global scope
window.CiaterSync = {
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
