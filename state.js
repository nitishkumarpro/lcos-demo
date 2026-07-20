// state.js – cross‑tab reactive store
const CH = new BroadcastChannel('lcos');

const defaultState = {
  orders: [],
  currentOrderId: null,
  riderAssigned: null,
  stats: { totalOrders: 0, revenue: 0, liveOrders: 0 },
  inventory: { 'milk': 45, 'bread': 30, 'eggs': 60 },
  wallet: { balance: 240, transactions: [] },
  notifications: [],
};

let state = JSON.parse(localStorage.getItem('lcos_state')) || defaultState;

function save() {
  localStorage.setItem('lcos_state', JSON.stringify(state));
  CH.postMessage(state);
}

CH.onmessage = (e) => {
  state = e.data;
  if (window.updateUI) window.updateUI(state);
};

function placeOrder(product, price) {
  const order = {
    id: 'ORD' + Date.now().toString().slice(-5),
    product,
    price,
    status: 'placed',
    time: new Date().toLocaleTimeString()
  };
  state.currentOrderId = order.id;
  state.orders.push(order);
  state.stats.totalOrders++;
  state.stats.revenue += price;
  state.stats.liveOrders++;
  // reduce inventory
  if (product.includes('Milk')) state.inventory.milk--;
  else if (product.includes('Bread')) state.inventory.bread--;
  save();
  return order;
}

function advanceOrder(status) {
  const order = state.orders.find(o => o.id === state.currentOrderId);
  if (!order) return;
  order.status = status;
  save();
}

function simulateLifecycle() {
  if (!state.currentOrderId) return;
  setTimeout(() => advanceOrder('accepted'), 2000);
  setTimeout(() => advanceOrder('preparing'), 3500);
  setTimeout(() => advanceOrder('packed'), 5000);
  setTimeout(() => {
    state.riderAssigned = state.currentOrderId;
    save();
    setTimeout(() => advanceOrder('assigned'), 1500);
    setTimeout(() => {
      advanceOrder('delivered');
      state.riderAssigned = null;
      state.stats.liveOrders = Math.max(0, state.stats.liveOrders - 1);
      save();
    }, 6000);
  }, 6500);
}