// =============================================================================
// LOCAL COMMERCE OS – SHARED STATE ENGINE
// This script runs in every tab and synchronizes all roles via BroadcastChannel.
// No backend required – all state is stored in localStorage and broadcasted.
// =============================================================================

const CHANNEL_NAME = 'lcos-ecosystem-v2';
const channel = new BroadcastChannel(CHANNEL_NAME);

// -----------------------------------------------------------------------------
// Default mock data – simulates a real database
// -----------------------------------------------------------------------------
const defaultState = {
  // Orders array holds all placed orders across the ecosystem
  orders: [],

  // The ID of the currently active order (used for lifecycle simulation)
  currentOrderId: null,

  // Indicates whether a rider has been assigned to the current order
  riderAssigned: null,

  // Global statistics
  stats: {
    totalOrders: 0,
    revenue: 0,
    liveOrders: 0,
    cancelledOrders: 0,
    returnedOrders: 0,
    averageDeliveryTime: 24, // minutes
    customerSatisfaction: 4.8,
  },

  // Inventory levels for a few demo products
  inventory: {
    'Amul Gold Milk': 45,
    'Brown Bread': 30,
    'Organic Eggs': 60,
    'Greek Yogurt': 20,
    'Banana (6 pcs)': 50,
    'Tomato (1 kg)': 40,
    'Amul Butter': 25,
    'Paneer (200g)': 15,
    'Coca Cola (750ml)': 100,
    'Lays Chips': 80,
    'Dettol Handwash': 35,
    'Surf Excel (1kg)': 22,
  },

  // Wallet balances for different roles
  wallet: {
    customerBalance: 240,
    riderBalance: 450,
    vendorBalance: 12500,
    transactions: [
      { id: 'TXN001', type: 'credit', amount: 50, desc: 'Cashback on order #ORD001', time: '10:23 AM' },
      { id: 'TXN002', type: 'debit', amount: 65, desc: 'Order #ORD001 payment', time: '10:23 AM' },
    ],
  },

  // Notifications log (simulated)
  notifications: [
    { id: 'NOT1', message: 'New order received!', role: 'vendor', time: '10:22 AM', read: false },
    { id: 'NOT2', message: 'Your order is being prepared', role: 'customer', time: '10:24 AM', read: false },
  ],

  // Vendor-specific orders (same as orders but used by vendor panel)
  vendorOrders: [],

  // Rider performance mock data
  riderPerformance: {
    acceptanceRate: 98,
    cancellationRate: 2,
    rating: 4.9,
    speed: 'Fast',
    experienceLevel: 'Gold',
  },

  // Admin dashboard mock metrics
  adminMetrics: {
    gmv: 245000,
    profit: 32000,
    activeCustomers: 1240,
    activeVendors: 12,
    activeRiders: 5,
    liveDeliveries: 1,
    averageDeliveryTime: 24,
    cancellationRate: 3.2,
    customerSatisfaction: 4.8,
  },

  // Demo coupons
  coupons: [
    { code: 'FREEDEL', discount: 'Free Delivery', minOrder: 0 },
    { code: 'SAVE10', discount: '10% off', minOrder: 199 },
  ],

  // Marketing campaigns (simulated)
  campaigns: [
    { name: 'Flash Sale – Up to 50% off', active: true },
    { name: 'Weekly Essentials', active: true },
  ],

  // Dark stores / warehouses
  darkStores: [
    { id: 1, name: 'DS – Koramangala', address: '12th Cross, Bangalore', status: 'Active' },
    { id: 2, name: 'DS – Indiranagar', address: '100 Feet Road, Bangalore', status: 'Active' },
  ],
};

// -----------------------------------------------------------------------------
// Initialize state from localStorage or use default
// -----------------------------------------------------------------------------
let state = JSON.parse(localStorage.getItem('lcos_state'));
if (!state) {
  state = defaultState;
  localStorage.setItem('lcos_state', JSON.stringify(state));
}

// -----------------------------------------------------------------------------
// Save and broadcast state changes
// -----------------------------------------------------------------------------
function saveState() {
  localStorage.setItem('lcos_state', JSON.stringify(state));
  channel.postMessage(state);
}

// Listen for state updates from other tabs
channel.onmessage = (event) => {
  state = event.data;
  // Call the updateUI function if defined in the current tab
  if (typeof window.updateUI === 'function') {
    window.updateUI(state);
  }
};

// -----------------------------------------------------------------------------
// Core business logic functions
// -----------------------------------------------------------------------------

/**
 * Places a new order and initiates the lifecycle simulation.
 * @param {string} productName - The product being ordered.
 * @param {number} price - The price of the product.
 * @returns {object} The newly created order object.
 */
function placeOrder(productName, price) {
  // Generate a unique order ID
  const orderId = 'ORD' + Date.now().toString().slice(-5);

  const order = {
    id: orderId,
    product: productName,
    price: price,
    status: 'placed', // initial status
    time: new Date().toLocaleTimeString(),
    customer: 'Nitish Kumar',
    address: 'Home, 12th Cross',
    paymentMethod: 'UPI',
    deliverySlot: 'Express (30 min)',
    riderTip: 10,
  };

  // Update global state
  state.currentOrderId = orderId;
  state.orders.push(order);
  state.vendorOrders.push({ ...order }); // vendor's copy
  state.stats.totalOrders++;
  state.stats.revenue += price;
  state.stats.liveOrders++;

  // Reduce inventory if product exists
  if (state.inventory.hasOwnProperty(productName)) {
    state.inventory[productName] = Math.max(0, state.inventory[productName] - 1);
  }

  // Add a notification
  state.notifications.push({
    id: 'NOT' + Date.now(),
    message: `New order #${orderId} for ${productName}`,
    role: 'vendor',
    time: new Date().toLocaleTimeString(),
    read: false,
  });

  saveState();
  return order;
}

/**
 * Advances the current order to a new status.
 * @param {string} newStatus - The new status ('accepted','preparing','packed','assigned','delivered','cancelled').
 */
function advanceOrder(newStatus) {
  const order = state.orders.find(o => o.id === state.currentOrderId);
  if (!order) return;
  order.status = newStatus;

  // Also update vendor's copy
  const vendorOrder = state.vendorOrders.find(o => o.id === state.currentOrderId);
  if (vendorOrder) vendorOrder.status = newStatus;

  // Add notification for certain statuses
  if (newStatus === 'accepted') {
    state.notifications.push({
      id: 'NOT' + Date.now(),
      message: `Order #${order.id} accepted by vendor.`,
      role: 'customer',
      time: new Date().toLocaleTimeString(),
      read: false,
    });
  } else if (newStatus === 'preparing') {
    state.notifications.push({
      id: 'NOT' + Date.now(),
      message: `Order #${order.id} is being prepared.`,
      role: 'customer',
      time: new Date().toLocaleTimeString(),
      read: false,
    });
  } else if (newStatus === 'packed') {
    // Once packed, assign a rider after a short delay (handled in lifecycle simulation)
    state.notifications.push({
      id: 'NOT' + Date.now(),
      message: `Order #${order.id} packed and ready for pickup.`,
      role: 'vendor',
      time: new Date().toLocaleTimeString(),
      read: false,
    });
  } else if (newStatus === 'assigned') {
    state.riderAssigned = state.currentOrderId;
    state.notifications.push({
      id: 'NOT' + Date.now(),
      message: `Rider assigned for order #${order.id}.`,
      role: 'customer',
      time: new Date().toLocaleTimeString(),
      read: false,
    });
    state.notifications.push({
      id: 'NOT' + Date.now(),
      message: `New delivery request for order #${order.id}.`,
      role: 'rider',
      time: new Date().toLocaleTimeString(),
      read: false,
    });
  } else if (newStatus === 'delivered') {
    state.stats.liveOrders = Math.max(0, state.stats.liveOrders - 1);
    state.riderAssigned = null;
    state.notifications.push({
      id: 'NOT' + Date.now(),
      message: `Order #${order.id} delivered successfully!`,
      role: 'customer',
      time: new Date().toLocaleTimeString(),
      read: false,
    });
  } else if (newStatus === 'cancelled') {
    state.stats.cancelledOrders++;
    state.stats.liveOrders = Math.max(0, state.stats.liveOrders - 1);
    state.riderAssigned = null;
    // Restock inventory if cancelled (simplified)
    if (state.inventory.hasOwnProperty(order.product)) {
      state.inventory[order.product]++;
    }
    state.notifications.push({
      id: 'NOT' + Date.now(),
      message: `Order #${order.id} was cancelled.`,
      role: 'vendor',
      time: new Date().toLocaleTimeString(),
      read: false,
    });
  }

  saveState();
}

/**
 * Simulates the full order lifecycle with timed status updates.
 * This is called automatically when a customer places an order.
 */
function simulateFullLifecycle() {
  if (!state.currentOrderId) return;

  // Sequence of statuses and their delays
  const sequence = [
    { status: 'accepted', delay: 2000 },
    { status: 'preparing', delay: 4000 },
    { status: 'packed', delay: 6000 },
    // special handling for rider assignment
  ];

  // Execute the sequence
  sequence.forEach((step, index) => {
    setTimeout(() => {
      advanceOrder(step.status);
    }, step.delay);
  });

  // After packing, assign rider and then complete delivery
  setTimeout(() => {
    if (state.currentOrderId) {
      // Rider assigned automatically (simulate rider accepting after 2 sec)
      state.riderAssigned = state.currentOrderId;
      advanceOrder('assigned'); // this will set status to 'assigned'
      saveState();

      // After rider picks up, deliver after some time
      setTimeout(() => {
        if (state.currentOrderId) {
          advanceOrder('delivered');
        }
      }, 5000);
    }
  }, 8000);
}

/**
 * Allows the rider to manually accept an assigned order.
 */
function riderAcceptOrder() {
  if (!state.riderAssigned) return false;
  // In our simulation, once rider accepts, we move directly to 'delivered' after a delay
  setTimeout(() => {
    advanceOrder('delivered');
  }, 4000);
  return true;
}

/**
 * Cancels the current order (simulated from customer or vendor).
 */
function cancelOrder() {
  if (!state.currentOrderId) return;
  advanceOrder('cancelled');
  state.currentOrderId = null; // clear current order so lifecycle stops
  saveState();
}

// -----------------------------------------------------------------------------
// Expose functions and state to the global scope so all pages can access them
// -----------------------------------------------------------------------------
window.state = state;
window.placeOrder = placeOrder;
window.advanceOrder = advanceOrder;
window.simulateFullLifecycle = simulateFullLifecycle;
window.riderAcceptOrder = riderAcceptOrder;
window.cancelOrder = cancelOrder;
window.saveState = saveState;