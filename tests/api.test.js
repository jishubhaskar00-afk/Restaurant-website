const test = require('node:test');
const assert = require('node:assert');
const app = require('../server.js');

let server;
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

test.before(async () => {
    return new Promise((resolve) => {
        server = app.listen(PORT, () => {
            resolve();
        });
    });
});

test.after(async () => {
    return new Promise((resolve) => {
        server.close(() => {
            resolve();
        });
    });
});

test('GET /api/restaurants should return list of restaurants', async () => {
    const res = await fetch(`${BASE_URL}/api/restaurants`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.restaurants.length > 0);
    assert.ok(data.restaurants[0].name.includes("JA Restaurant"));
});

test('GET /api/menu should return categorized menu items', async () => {
    const res = await fetch(`${BASE_URL}/api/menu`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.menu.length >= 16);
    assert.ok(data.menu.some(m => m.name === "Burger"));
    assert.ok(data.menu.some(m => m.name === "Chicken Biryani"));
});

test('POST /api/orders/calculate should calculate subtotal, discount, tax, and delivery fee', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: [
                { id: 1, price: 85, qty: 2 }
            ],
            couponCode: "WELCOME50",
            orderType: "delivery"
        })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.calculation.subtotal, 170);
    assert.ok(data.calculation.grandTotal > 0);
});

test('POST /api/orders should create a new order and assign tracking details', async () => {
    const orderPayload = {
        customerName: "Test User",
        phone: "9876543210",
        email: "test@example.com",
        address: "123 Test Street, Kolkata",
        orderType: "delivery",
        items: [{ id: 1, qty: 1 }],
        paymentMethod: "UPI"
    };

    const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.order.id.startsWith("ORD-"));
    assert.strictEqual(data.order.status, "Confirmed");
    assert.ok(data.order.deliveryPartner !== null);

    // Track order
    const trackRes = await fetch(`${BASE_URL}/api/orders/${data.order.id}`);
    assert.strictEqual(trackRes.status, 200);
    const trackData = await trackRes.json();
    assert.strictEqual(trackData.order.id, data.order.id);
});

test('PATCH /api/menu/:id/availability should toggle stock status', async () => {
    const res = await fetch(`${BASE_URL}/api/menu/1/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ in_stock: false })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.item.in_stock, false);

    // Restore to true
    await fetch(`${BASE_URL}/api/menu/1/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ in_stock: true })
    });
});

test('GET /api/admin/analytics should return operational metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/analytics`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(typeof data.analytics.totalOrders === 'number');
    assert.ok(typeof data.analytics.totalRevenue === 'number');
});
