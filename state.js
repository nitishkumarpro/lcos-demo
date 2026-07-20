// =============================================================================
// LOCAL COMMERCE OS – SHARED STATE ENGINE & BUSINESS LOGIC CORE
// Version: 2.0.0 (Enterprise Edition)
// Description: The central nervous system of the Local Commerce OS.
// Handles cross-tab synchronization, complex business logic, AI simulations,
// financial ledger management, and real-time analytics calculations.
// =============================================================================

'use strict';

// -----------------------------------------------------------------------------
// 1. CORE INFRASTRUCTURE: BROADCAST CHANNEL & EVENT BUS
// -----------------------------------------------------------------------------
const CHANNEL_NAME = 'lcos-ecosystem-v2';
const channel = new BroadcastChannel(CHANNEL_NAME);

// Advanced Pub/Sub Event Bus for intra-tab and inter-tab communication
class EventBus {
    constructor() {
        this.listeners = {};
    }
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
        // Broadcast to other tabs
        channel.postMessage({ type: event, payload: data, timestamp: Date.now() });
    }
}
const eventBus = new EventBus();

// Listen for cross-tab events
channel.onmessage = (event) => {
    const { type, payload } = event.data;
    if (type === 'STATE_SYNC') {
        state = payload;
        if (typeof window.updateUI === 'function') window.updateUI(state);
    } else {
        eventBus.emit(type, payload);
    }
};

// -----------------------------------------------------------------------------
// 2. MASSIVE MOCK DATABASE & DEFAULT STATE
// -----------------------------------------------------------------------------
const defaultState = {
    version: '2.0.0',
    lastUpdated: Date.now(),

    // --- Orders & OMS ---
    orders: [],
    currentOrderId: null,
    riderAssigned: null,
    historicalOrders: [
        { id: 'ORD8812', product: 'Weekly Grocery Basket', price: 1250, status: 'delivered', time: 'Yesterday, 10:00 AM', customer: 'Rahul Sharma', address: 'HSR Layout', paymentMethod: 'UPI', rating: 5 },
        { id: 'ORD8813', product: 'Medicines', price: 450, status: 'delivered', time: 'Yesterday, 02:30 PM', customer: 'Priya Patel', address: 'Indiranagar', paymentMethod: 'Card', rating: 4 },
        { id: 'ORD8814', product: 'Gourmet Coffee Beans', price: 890, status: 'cancelled', time: '2 days ago', customer: 'Amit Singh', address: 'Koramangala', paymentMethod: 'COD', rating: null },
    ],

    // --- Global Statistics & Analytics ---
    stats: {
        totalOrders: 1452,
        revenue: 485600,
        liveOrders: 0,
        cancelledOrders: 42,
        returnedOrders: 12,
        averageDeliveryTime: 22,
        customerSatisfaction: 4.8,
        activeUsers: 12450,
        conversionRate: 4.2,
        cartAbandonmentRate: 68.5,
    },

    // --- Inventory & Catalog ---
    inventory: {
        'Amul Gold Milk': 45, 'Brown Bread': 30, 'Organic Eggs': 60, 'Greek Yogurt': 20,
        'Banana (6 pcs)': 50, 'Tomato (1 kg)': 40, 'Amul Butter': 25, 'Paneer (200g)': 15,
        'Coca Cola (750ml)': 100, 'Lays Chips': 80, 'Dettol Handwash': 35, 'Surf Excel (1kg)': 22,
        'Basmati Rice (5kg)': 12, 'Toor Dal (1kg)': 28, 'Sunflower Oil (1L)': 18, 'Green Tea': 40,
        'Dark Chocolate': 35, 'Almonds (250g)': 15, 'Hand Sanitizer': 60, 'Face Masks (50pcs)': 25
    },
    catalog: [
        { id: 'P001', name: 'Amul Gold Milk', category: 'Dairy', price: 65, mrp: 70, stock: 45, image: '🥛', rating: 4.8, reviews: 1240 },
        { id: 'P002', name: 'Brown Bread', category: 'Bakery', price: 45, mrp: 50, stock: 30, image: '🍞', rating: 4.5, reviews: 890 },
        { id: 'P003', name: 'Organic Eggs', category: 'Dairy', price: 80, mrp: 90, stock: 60, image: '🥚', rating: 4.9, reviews: 2100 },
        { id: 'P004', name: 'Greek Yogurt', category: 'Dairy', price: 55, mrp: 65, stock: 20, image: '🍶', rating: 4.7, reviews: 540 },
        { id: 'P005', name: 'Banana (6 pcs)', category: 'Fruits', price: 30, mrp: 35, stock: 50, image: '🍌', rating: 4.6, reviews: 3200 },
        { id: 'P006', name: 'Tomato (1 kg)', category: 'Vegetables', price: 40, mrp: 50, stock: 40, image: '🍅', rating: 4.4, reviews: 1800 },
    ],

    // --- Financial Ledger & Wallets ---
    wallet: {
        customerBalance: 240,
        riderBalance: 450,
        vendorBalance: 12500,
        platformEscrow: 4500,
        transactions: [
            { id: 'TXN001', type: 'credit', amount: 50, desc: 'Cashback on order #ORD001', time: '10:23 AM', entity: 'customer' },
            { id: 'TXN002', type: 'debit', amount: 65, desc: 'Order #ORD001 payment', time: '10:23 AM', entity: 'customer' },
            { id: 'TXN003', type: 'credit', amount: 55, desc: 'Payout for order #ORD8812', time: 'Yesterday', entity: 'vendor' },
            { id: 'TXN004', type: 'credit', amount: 45, desc: 'Delivery earnings #ORD8812', time: 'Yesterday', entity: 'rider' },
            { id: 'TXN005', type: 'credit', amount: 10, desc: 'Platform commission #ORD8812', time: 'Yesterday', entity: 'platform' },
        ],
        payouts: [
            { id: 'PO001', vendor: 'QuickMart', amount: 12500, status: 'processing', date: 'Today' },
            { id: 'PO002', vendor: 'Fresh Bites', amount: 8400, status: 'completed', date: 'Yesterday' },
        ]
    },

    // --- Notifications & Activity Feed ---
    notifications: [
        { id: 'NOT1', message: 'New order received!', role: 'vendor', time: '10:22 AM', read: false, type: 'order' },
        { id: 'NOT2', message: 'Your order is being prepared', role: 'customer', time: '10:24 AM', read: false, type: 'status' },
        { id: 'NOT3', message: 'Surge pricing activated in Zone 4', role: 'admin', time: '10:15 AM', read: true, type: 'system' },
    ],
    activityFeed: [
        { id: 'ACT1', icon: '🛒', text: 'New order #ORD9921 placed by Nitish Kumar', time: 'Just now', color: '#dbeafe' },
        { id: 'ACT2', icon: '✅', text: 'Order #ORD8812 delivered successfully', time: '5 mins ago', color: '#dcfce7' },
        { id: 'ACT3', icon: '🚨', text: 'Fraud Alert: Blocked suspicious login', time: '12 mins ago', color: '#fee2e2' },
    ],

    // --- Vendor & Rider Data ---
    vendorOrders: [],
    vendors: [
        { id: 'V001', name: 'QuickMart', owner: 'Rahul Sharma', category: 'Grocery', rating: 4.8, orders30d: 1240, revenue30d: 345000, status: 'active' },
        { id: 'V002', name: 'Fresh Bites', owner: 'Priya Patel', category: 'Healthy Food', rating: 4.6, orders30d: 850, revenue30d: 210000, status: 'active' },
        { id: 'V003', name: 'MediPlus', owner: 'Dr. Arjun Singh', category: 'Pharmacy', rating: 4.9, orders30d: 420, revenue30d: 125000, status: 'active' },
    ],
    riders: [
        { id: 'RID-9876', name: 'Rahul S.', status: 'online', rating: 4.9, deliveries: 1240, earnings: 45000, acceptanceRate: 98 },
        { id: 'RID-9877', name: 'Arjun Singh', status: 'online', rating: 4.8, deliveries: 980, earnings: 38000, acceptanceRate: 95 },
        { id: 'RID-9878', name: 'Priya Sharma', status: 'offline', rating: 4.7, deliveries: 1100, earnings: 41000, acceptanceRate: 92 },
    ],
    riderPerformance: {
        acceptanceRate: 98, cancellationRate: 2, rating: 4.9, speed: 'Fast', experienceLevel: 'Gold'
    },

    // --- Admin & Platform Metrics ---
    adminMetrics: {
        gmv: 245000, profit: 32000, activeCustomers: 12450, activeVendors: 142, activeRiders: 42,
        liveDeliveries: 0, averageDeliveryTime: 24, cancellationRate: 3.2, customerSatisfaction: 4.8,
        cac: 120, ltv: 4500, roas: 3.4, churnRate: 4.1
    },

    // --- Marketing, Coupons & Campaigns ---
    coupons: [
        { code: 'FREEDEL', discount: 'Free Delivery', minOrder: 0, type: 'fixed', value: 0, usageLimit: 1000, used: 450 },
        { code: 'SAVE10', discount: '10% off', minOrder: 199, type: 'percentage', value: 10, usageLimit: 500, used: 120 },
        { code: 'FLAT50', discount: 'Flat ₹50 off', minOrder: 299, type: 'fixed', value: 50, usageLimit: 200, used: 198 },
    ],
    campaigns: [
        { id: 'CAMP01', name: 'Flash Sale – Up to 50% off', status: 'active', reach: 12400, conversions: 450, roi: 3.2 },
        { id: 'CAMP02', name: 'Weekly Essentials', status: 'active', reach: 8900, conversions: 210, roi: 2.8 },
        { id: 'CAMP03', name: 'New User Welcome Kit', status: 'paused', reach: 5000, conversions: 800, roi: 1.5 },
    ],

    // --- Logistics & Infrastructure ---
    darkStores: [
        { id: 'DS-001', name: 'DS - Koramangala', address: '12th Cross, Bangalore', manager: 'Amit Verma', riders: 12, ordersToday: 340, status: 'operational', lat: 12.9352, lng: 77.6245 },
        { id: 'DS-002', name: 'DS - Indiranagar', address: '100 Feet Road, Bangalore', manager: 'Sneha Reddy', riders: 8, ordersToday: 210, status: 'operational', lat: 12.9784, lng: 77.6408 },
        { id: 'DS-003', name: 'DS - HSR Layout', address: '27th Main, Bangalore', manager: 'Vikram Joshi', riders: 0, ordersToday: 0, status: 'maintenance', lat: 12.9116, lng: 77.6389 },
    ],
    zones: [
        { id: 'Z1', name: 'Koramangala', surgeMultiplier: 1.0, demandIndex: 85, supplyIndex: 90 },
        { id: 'Z2', name: 'Indiranagar', surgeMultiplier: 1.2, demandIndex: 95, supplyIndex: 60 },
        { id: 'Z3', name: 'HSR Layout', surgeMultiplier: 1.0, demandIndex: 70, supplyIndex: 80 },
    ],

    // --- AI & Machine Learning Simulators ---
    aiModels: {
        demandForecast: { confidence: 92, prediction: 'Milk & Bread spike expected tomorrow at 8 AM', action: 'auto_restock_triggered' },
        fraudDetection: { blockedAttempts: 14, savedAmount: 4200, lastAlert: 'Coupon stacking abuse blocked' },
        routeOptimization: { batchesCreated: 14, timeSaved: 45, fuelSaved: 2.5 },
        dynamicPricing: { activeZones: 1, revenueLift: 150 }
    },
    
    // --- System Settings & Feature Flags ---
    settings: {
        platformCommission: 15, // percentage
        deliveryFeeBase: 25,
        deliveryFeePerKm: 10,
        freeDeliveryThreshold: 199,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        featureFlags: {
            aiRecommendations: true,
            voiceSearch: true,
            darkMode: false,
            cryptoPayments: false,
            subscriptionModel: true
        }
    }
};

// -----------------------------------------------------------------------------
// 3. STATE PERSISTENCE & HYDRATION
// -----------------------------------------------------------------------------
let state = JSON.parse(localStorage.getItem('lcos_state'));
if (!state) {
    state = JSON.parse(JSON.stringify(defaultState)); // Deep clone
    localStorage.setItem('lcos_state', JSON.stringify(state));
}

function saveState() {
    state.lastUpdated = Date.now();
    localStorage.setItem('lcos_state', JSON.stringify(state));
    channel.postMessage({ type: 'STATE_SYNC', payload: state });
    eventBus.emit('stateUpdated', state);
}

// -----------------------------------------------------------------------------
// 4. CORE BUSINESS LOGIC: ORDER MANAGEMENT SYSTEM (OMS)
// -----------------------------------------------------------------------------

/**
 * Places a new order and initiates the lifecycle simulation.
 */
function placeOrder(productName, price) {
    const orderId = 'ORD' + Date.now().toString().slice(-5);
    const order = {
        id: orderId,
        product: productName,
        price: price,
        status: 'placed',
        time: new Date().toLocaleTimeString(),
        customer: 'Nitish Kumar',
        address: 'Home, 12th Cross',
        paymentMethod: 'UPI',
        deliverySlot: 'Express (30 min)',
        riderTip: 10,
        vendor: 'QuickMart',
        zone: 'Koramangala'
    };

    state.currentOrderId = orderId;
    state.orders.push(order);
    state.vendorOrders.push({ ...order });
    state.stats.totalOrders++;
    state.stats.revenue += price;
    state.stats.liveOrders++;
    state.adminMetrics.gmv += price;
    state.adminMetrics.liveDeliveries++;

    // Reduce inventory
    if (state.inventory.hasOwnProperty(productName)) {
        state.inventory[productName] = Math.max(0, state.inventory[productName] - 1);
    }

    // Financial Ledger
    state.wallet.transactions.unshift({
        id: 'TXN' + Date.now(),
        type: 'debit',
        amount: price,
        desc: `Payment for order #${orderId}`,
        time: new Date().toLocaleTimeString(),
        entity: 'customer'
    });
    state.wallet.customerBalance = Math.max(0, state.wallet.customerBalance - price);

    // Notifications & Activity
    state.notifications.unshift({
        id: 'NOT' + Date.now(),
        message: `New order #${orderId} for ${productName}`,
        role: 'vendor',
        time: new Date().toLocaleTimeString(),
        read: false,
        type: 'order'
    });
    state.activityFeed.unshift({
        id: 'ACT' + Date.now(),
        icon: '🛒',
        text: `New order #${orderId} placed by ${order.customer}`,
        time: 'Just now',
        color: '#dbeafe'
    });

    saveState();
    return order;
}

/**
 * Advances the current order to a new status.
 */
function advanceOrder(newStatus) {
    const order = state.orders.find(o => o.id === state.currentOrderId);
    if (!order) return;
    
    const oldStatus = order.status;
    order.status = newStatus;

    const vendorOrder = state.vendorOrders.find(o => o.id === state.currentOrderId);
    if (vendorOrder) vendorOrder.status = newStatus;

    // Status-specific logic
    switch (newStatus) {
        case 'accepted':
            addNotification(`Order #${order.id} accepted by vendor.`, 'customer', 'status');
            break;
        case 'preparing':
            addNotification(`Order #${order.id} is being prepared.`, 'customer', 'status');
            break;
        case 'packed':
            addNotification(`Order #${order.id} packed and ready for pickup.`, 'vendor', 'status');
            break;
        case 'assigned':
            state.riderAssigned = state.currentOrderId;
            addNotification(`Rider assigned for order #${order.id}.`, 'customer', 'status');
            addNotification(`New delivery request for order #${order.id}.`, 'rider', 'delivery');
            break;
        case 'delivered':
            state.stats.liveOrders = Math.max(0, state.stats.liveOrders - 1);
            state.adminMetrics.liveDeliveries = Math.max(0, state.adminMetrics.liveDeliveries - 1);
            state.riderAssigned = null;
            
            // Financial Settlement
            const commission = order.price * (state.settings.platformCommission / 100);
            const vendorPayout = order.price - commission;
            const riderPayout = 45 + (order.riderTip || 0); // Base + tip
            
            state.wallet.vendorBalance += vendorPayout;
            state.wallet.riderBalance += riderPayout;
            state.wallet.platformEscrow += commission;
            
            state.wallet.transactions.unshift(
                { id: 'TXN' + Date.now() + 'V', type: 'credit', amount: vendorPayout, desc: `Payout for #${order.id}`, time: new Date().toLocaleTimeString(), entity: 'vendor' },
                { id: 'TXN' + Date.now() + 'R', type: 'credit', amount: riderPayout, desc: `Earnings for #${order.id}`, time: new Date().toLocaleTimeString(), entity: 'rider' },
                { id: 'TXN' + Date.now() + 'P', type: 'credit', amount: commission, desc: `Commission for #${order.id}`, time: new Date().toLocaleTimeString(), entity: 'platform' }
            );

            addNotification(`Order #${order.id} delivered successfully!`, 'customer', 'success');
            state.activityFeed.unshift({ id: 'ACT' + Date.now(), icon: '✅', text: `Order #${order.id} delivered successfully`, time: 'Just now', color: '#dcfce7' });
            break;
        case 'cancelled':
            state.stats.cancelledOrders++;
            state.stats.liveOrders = Math.max(0, state.stats.liveOrders - 1);
            state.adminMetrics.liveDeliveries = Math.max(0, state.adminMetrics.liveDeliveries - 1);
            state.riderAssigned = null;
            
            // Restock & Refund
            if (state.inventory.hasOwnProperty(order.product)) state.inventory[order.product]++;
            state.wallet.customerBalance += order.price;
            state.wallet.transactions.unshift({ id: 'TXN' + Date.now(), type: 'credit', amount: order.price, desc: `Refund for cancelled #${order.id}`, time: new Date().toLocaleTimeString(), entity: 'customer' });
            
            addNotification(`Order #${order.id} was cancelled.`, 'vendor', 'error');
            break;
    }

    saveState();
}

/**
 * Simulates the full order lifecycle with timed status updates.
 */
function simulateFullLifecycle() {
    if (!state.currentOrderId) return;

    const sequence = [
        { status: 'accepted', delay: 2000 },
        { status: 'preparing', delay: 4000 },
        { status: 'packed', delay: 6000 },
    ];

    sequence.forEach((step) => {
        setTimeout(() => advanceOrder(step.status), step.delay);
    });

    setTimeout(() => {
        if (state.currentOrderId) {
            state.riderAssigned = state.currentOrderId;
            advanceOrder('assigned');
            
            setTimeout(() => {
                if (state.currentOrderId) advanceOrder('delivered');
            }, 5000);
        }
    }, 8000);
}

function riderAcceptOrder() {
    if (!state.riderAssigned) return false;
    setTimeout(() => advanceOrder('delivered'), 4000);
    return true;
}

function cancelOrder() {
    if (!state.currentOrderId) return;
    advanceOrder('cancelled');
    state.currentOrderId = null;
    saveState();
}

// -----------------------------------------------------------------------------
// 5. HELPER FUNCTIONS & UTILITIES
// -----------------------------------------------------------------------------

function addNotification(message, role, type) {
    state.notifications.unshift({
        id: 'NOT' + Date.now() + Math.random().toString(36).substr(2, 5),
        message, role, type,
        time: new Date().toLocaleTimeString(),
        read: false
    });
    if (state.notifications.length > 50) state.notifications.pop(); // Keep feed clean
}

// Financial Calculations
function calculateGMV() {
    return state.orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.price : 0), 0);
}

function calculatePlatformRevenue() {
    return state.orders.reduce((sum, o) => {
        if (o.status === 'delivered') {
            return sum + (o.price * (state.settings.platformCommission / 100));
        }
        return sum;
    }, 0);
}

// AI & Analytics Simulators
function runDemandForecast() {
    // Simulate AI predicting a spike
    state.aiModels.demandForecast.confidence = Math.floor(Math.random() * 10) + 85;
    return state.aiModels.demandForecast;
}

function detectFraud() {
    // Simulate fraud detection
    if (Math.random() > 0.8) {
        state.aiModels.fraudDetection.blockedAttempts++;
        state.aiModels.fraudDetection.savedAmount += Math.floor(Math.random() * 500) + 100;
        addNotification(`Fraud Alert: Suspicious activity blocked. Saved ₹${state.aiModels.fraudDetection.savedAmount}`, 'admin', 'security');
    }
    return state.aiModels.fraudDetection;
}

// Logistics & Routing
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function estimateETA(distanceKm) {
    const avgSpeed = 25; // km/h
    const prepTime = 10; // mins
    return Math.ceil((distanceKm / avgSpeed) * 60 + prepTime);
}

// -----------------------------------------------------------------------------
// 6. GLOBAL EXPOSURE
// -----------------------------------------------------------------------------
window.state = state;
window.eventBus = eventBus;
window.placeOrder = placeOrder;
window.advanceOrder = advanceOrder;
window.simulateFullLifecycle = simulateFullLifecycle;
window.riderAcceptOrder = riderAcceptOrder;
window.cancelOrder = cancelOrder;
window.saveState = saveState;
window.calculateGMV = calculateGMV;
window.calculatePlatformRevenue = calculatePlatformRevenue;
window.runDemandForecast = runDemandForecast;
window.detectFraud = detectFraud;
window.calculateDistance = calculateDistance;
window.estimateETA = estimateETA;

// Initialize AI background tasks
setInterval(() => {
    detectFraud();
    runDemandForecast();
}, 30000); // Run every 30 seconds

console.log('%c🚀 Local Commerce OS State Engine Initialized', 'color: #2563eb; font-weight: bold; font-size: 14px;');
console.log('%cListening on BroadcastChannel: ' + CHANNEL_NAME, 'color: #64748b;');