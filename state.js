// state.js - shared across all tabs via BroadcastChannel
const CHANNEL_NAME = 'lcos-ecosystem';

const defaultState = {
  orders: [],
  vendorOrders: [],
  currentOrderId: null,
  riderAssigned: null,
  stats: { totalOrders: 0, revenue: 0, liveOrders: 0 }
};

let state = JSON.parse(localStorage.getItem('lcos_state')) || defaultState;

const channel = new BroadcastChannel(CHANNEL_NAME);

function broadcast() {
  localStorage.setItem('lcos_state', JSON.stringify(state));
  channel.postMessage(state);
}

channel.onmessage = (e) => {
  state = e.data;
  // global update callback can be set by each page
  if (window.onStateUpdate) window.onStateUpdate(state);
};

// helper functions
function placeOrder(product = 'Amul Gold Milk', price = 65) {
  const order = {
    id: 'ORD' + Date.now().toString().slice(-5),
    product,
    price,
    status: 'placed',
    time: new Date().toLocaleTimeString()
  };
  state.currentOrderId = order.id;
  state.orders.push(order);
  state.vendorOrders.push({...order});
  state.stats.totalOrders++;
  state.stats.revenue += price;
  state.stats.liveOrders++;
  broadcast();
  return order;
}

function advanceOrder(newStatus) {
  const order = state.orders.find(o => o.id === state.currentOrderId);
  if (!order) return;
  order.status = newStatus;
  const vOrder = state.vendorOrders.find(o => o.id === state.currentOrderId);
  if (vOrder) vOrder.status = newStatus;
  broadcast();
}

function simulateFullLifecycle() {
  if (!state.currentOrderId) return;
  const chain = ['accepted', 'preparing', 'packed'];
  let delay = 1500;
  chain.forEach((status, i) => {
    setTimeout(() => advanceOrder(status), delay * (i+1));
  });
  setTimeout(() => {
    state.riderAssigned = state.currentOrderId;
    broadcast();
    setTimeout(() => {
      advanceOrder('assigned');
      setTimeout(() => {
        advanceOrder('delivered');
        state.riderAssigned = null;
        state.stats.liveOrders = Math.max(0, state.stats.liveOrders - 1);
        broadcast();
      }, 3000);
    }, 2000);
  }, delay * 4);
}

// expose to global
window.state = state;
window.placeOrder = placeOrder;
window.advanceOrder = advanceOrder;
window.simulateFullLifecycle = simulateFullLifecycle;