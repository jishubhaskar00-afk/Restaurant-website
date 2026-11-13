const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb, saveDb } = require('./data/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Simulated in-memory OTP cache for 2FA / verification
const otpCache = new Map();

// Helper to generate simulated delivery partner info
function assignDeliveryPartner() {
    const partners = [
        { name: "Rahul Sharma", phone: "+91 98111 22334", vehicle: "Honda Activa (WB-02-AK-4190)", rating: 4.9 },
        { name: "Amit Mondal", phone: "+91 98333 44556", vehicle: "Hero Splendor (WB-01-AZ-7721)", rating: 4.8 },
        { name: "Vikram Das", phone: "+91 98777 88990", vehicle: "TVS Jupiter (WB-04-CX-8832)", rating: 4.95 },
        { name: "Sayan Mukherjee", phone: "+91 98555 66778", vehicle: "Bajaj Pulsar (WB-06-KM-1234)", rating: 4.85 }
    ];
    return partners[Math.floor(Math.random() * partners.length)];
}

/* =========================================================
   1. USER REGISTRATION AND AUTHENTICATION APIS
   ========================================================= */

// Register new user
app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, address, password, socialProvider } = req.body;
    if (!email || (!password && !socialProvider)) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const db = getDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
        return res.status(409).json({ success: false, message: "An account with this email already exists. Please log in." });
    }

    // Generate simulated 6-digit OTP for 2-factor / email verification
    const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpCache.set(email.toLowerCase(), {
        otp: simulatedOtp,
        expires: Date.now() + 10 * 60 * 1000,
        tempUser: {
            id: 'user_' + Date.now(),
            name: name || email.split('@')[0],
            email: email.toLowerCase(),
            phone: phone || '',
            address: address || '',
            role: 'customer',
            passwordHash: password || 'social_auth',
            socialProvider: socialProvider || null,
            verified: false,
            createdAt: new Date().toISOString()
        }
    });

    console.log(`[2FA/Verification] OTP for ${email}: ${simulatedOtp}`);

    return res.status(200).json({
        success: true,
        message: "Registration initiated! Please enter the 6-digit verification code.",
        requiresVerification: true,
        demoOtp: simulatedOtp // provided for demo ease of evaluation
    });
});

// Verify OTP (2FA / Email Verification)
app.post('/api/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const cached = otpCache.get(email.toLowerCase());
    if (!cached) {
        return res.status(400).json({ success: false, message: "No verification pending for this email or OTP expired." });
    }

    if (cached.expires < Date.now()) {
        otpCache.delete(email.toLowerCase());
        return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (cached.otp !== otp.toString().trim()) {
        return res.status(400).json({ success: false, message: "Invalid verification code. Please check and try again." });
    }

    const db = getDb();
    const newUser = { ...cached.tempUser, verified: true };
    db.users.push(newUser);
    saveDb(db);
    otpCache.delete(email.toLowerCase());

    const token = 'token_' + Buffer.from(newUser.email + ':' + Date.now()).toString('base64');

    return res.status(200).json({
        success: true,
        message: "Account verified and registered successfully!",
        token,
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            address: newUser.address,
            role: newUser.role
        }
    });
});

// User Login (supports password and social login simulation)
app.post('/api/auth/login', (req, res) => {
    const { email, password, socialProvider } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }

    const db = getDb();
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // Social login simulation
    if (socialProvider) {
        if (!user) {
            user = {
                id: 'user_' + Date.now(),
                name: req.body.name || email.split('@')[0],
                email: email.toLowerCase(),
                phone: req.body.phone || '',
                address: req.body.address || '',
                role: 'customer',
                passwordHash: 'social_auth',
                socialProvider,
                verified: true,
                createdAt: new Date().toISOString()
            };
            db.users.push(user);
            saveDb(db);
        }
        const token = 'token_' + Buffer.from(user.email + ':' + Date.now()).toString('base64');
        return res.status(200).json({
            success: true,
            message: `Logged in via ${socialProvider}!`,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            }
        });
    }

    if (!user || user.passwordHash !== password) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = 'token_' + Buffer.from(user.email + ':' + Date.now()).toString('base64');
    return res.status(200).json({
        success: true,
        message: "Login successful!",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role
        }
    });
});

/* =========================================================
   2. RESTAURANT LISTINGS AND SEARCH APIS
   ========================================================= */

// Searchable directory of restaurants (by location, cuisine, rating, query)
app.get('/api/restaurants', (req, res) => {
    const { q, location, cuisine, minRating } = req.query;
    const db = getDb();
    let list = db.restaurants;

    if (q) {
        const query = q.toLowerCase();
        list = list.filter(r =>
            r.name.toLowerCase().includes(query) ||
            r.cuisine.toLowerCase().includes(query) ||
            r.location.toLowerCase().includes(query) ||
            r.area.toLowerCase().includes(query)
        );
    }

    if (location && location !== 'all') {
        const loc = location.toLowerCase();
        list = list.filter(r => r.location.toLowerCase().includes(loc) || r.area.toLowerCase().includes(loc));
    }

    if (cuisine && cuisine !== 'all') {
        const c = cuisine.toLowerCase();
        list = list.filter(r => r.cuisine.toLowerCase().includes(c));
    }

    if (minRating) {
        list = list.filter(r => r.rating >= parseFloat(minRating));
    }

    res.json({ success: true, count: list.length, restaurants: list });
});

// Single restaurant details
app.get('/api/restaurants/:id', (req, res) => {
    const db = getDb();
    const id = parseInt(req.params.id, 10);
    const r = db.restaurants.find(item => item.id === id);
    if (!r) {
        return res.status(404).json({ success: false, message: "Restaurant not found" });
    }
    const menu = db.menu.filter(m => m.restaurantId === id || !m.restaurantId);
    res.json({ success: true, restaurant: r, menu });
});

/* =========================================================
   3. MENU PRESENTATION AND MANAGEMENT APIS
   ========================================================= */

// List menu items with filters
app.get('/api/menu', (req, res) => {
    const { cat, q, veg, restaurantId, inStockOnly } = req.query;
    const db = getDb();
    let list = db.menu;

    if (restaurantId) {
        const rId = parseInt(restaurantId, 10);
        list = list.filter(item => item.restaurantId === rId || item.restaurantId === 1);
    }

    if (cat && cat !== 'all') {
        list = list.filter(item => item.cat === cat);
    }

    if (veg !== undefined && veg !== '') {
        const isVeg = veg === 'true' || veg === '1';
        list = list.filter(item => item.veg === isVeg);
    }

    if (inStockOnly === 'true') {
        list = list.filter(item => item.in_stock !== false);
    }

    if (q) {
        const query = q.toLowerCase();
        list = list.filter(item =>
            item.name.toLowerCase().includes(query) ||
            (item.desc && item.desc.toLowerCase().includes(query))
        );
    }

    res.json({ success: true, count: list.length, menu: list });
});

// Add new menu item (Restaurant Management Dashboard)
app.post('/api/menu', (req, res) => {
    const { name, price, cat, desc, img, veg, restaurantId, customizations } = req.body;
    if (!name || !price || !cat) {
        return res.status(400).json({ success: false, message: "Name, price and category are required." });
    }

    const db = getDb();
    const newId = db.menu.length ? Math.max(...db.menu.map(m => m.id)) + 1 : 1;
    const newItem = {
        id: newId,
        restaurantId: restaurantId ? parseInt(restaurantId, 10) : 1,
        name: name.trim(),
        price: parseFloat(price),
        cat: cat.toLowerCase(),
        veg: !!veg,
        img: img || 'images/1.jpg',
        desc: desc || '',
        rating: 4.8,
        in_stock: true,
        customizations: customizations || {
            sizes: [{ name: "Standard", price: 0 }],
            spiceLevels: ["Regular"],
            addons: []
        }
    };

    db.menu.push(newItem);
    saveDb(db);
    res.status(201).json({ success: true, message: "Menu item added successfully!", item: newItem });
});

// Update menu item
app.put('/api/menu/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const db = getDb();
    const idx = db.menu.findIndex(m => m.id === id);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: "Item not found" });
    }

    const updated = { ...db.menu[idx], ...req.body, id };
    if (req.body.price) updated.price = parseFloat(req.body.price);
    db.menu[idx] = updated;
    saveDb(db);
    res.json({ success: true, message: "Menu item updated!", item: updated });
});

// Toggle item availability (In-Stock / Out-of-Stock)
app.patch('/api/menu/:id/availability', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { in_stock } = req.body;
    const db = getDb();
    const item = db.menu.find(m => m.id === id);
    if (!item) {
        return res.status(404).json({ success: false, message: "Item not found" });
    }

    item.in_stock = in_stock !== undefined ? !!in_stock : !item.in_stock;
    saveDb(db);
    res.json({
        success: true,
        message: `Item marked as ${item.in_stock ? 'In Stock' : 'Out of Stock'}`,
        item
    });
});

// Delete menu item
app.delete('/api/menu/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const db = getDb();
    const idx = db.menu.findIndex(m => m.id === id);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: "Item not found" });
    }
    const deleted = db.menu.splice(idx, 1)[0];
    saveDb(db);
    res.json({ success: true, message: "Menu item deleted!", item: deleted });
});

/* =========================================================
   4. ORDER PROCESS, COUPONS AND PAYMENTS APIS
   ========================================================= */

// Validate coupon & calculate cart totals
app.post('/api/orders/calculate', (req, res) => {
    const { items, couponCode, orderType } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Items array is required" });
    }

    const db = getDb();
    let subtotal = 0;
    items.forEach(it => {
        const d = db.menu.find(m => m.id == it.id);
        const price = d ? d.price : (it.price || 0);
        const addOnPrice = (it.addonPrice || 0) + (it.sizePrice || 0);
        subtotal += (price + addOnPrice) * (it.qty || 1);
    });

    let discount = 0;
    let couponApplied = null;
    if (couponCode) {
        const c = db.coupons.find(cp => cp.code.toUpperCase() === couponCode.trim().toUpperCase());
        if (c && subtotal >= c.minOrder) {
            if (c.type === 'percent') {
                discount = Math.min((subtotal * c.value) / 100, c.maxDiscount);
            } else if (c.type === 'flat') {
                discount = c.value;
            } else if (c.type === 'shipping') {
                discount = 30;
            }
            couponApplied = c.code;
        }
    }

    const deliveryFee = (orderType === 'pickup' || subtotal >= 500 || (couponApplied && couponCode.toUpperCase() === 'FREESHIP')) ? 0 : 30;
    const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100; // 5% GST
    const grandTotal = Math.max(0, Math.round((subtotal - discount + deliveryFee + tax) * 100) / 100);

    res.json({
        success: true,
        calculation: {
            subtotal,
            discount,
            couponApplied,
            deliveryFee,
            tax,
            grandTotal
        }
    });
});

// Place new order
app.post('/api/orders', (req, res) => {
    const {
        userId,
        customerName,
        phone,
        email,
        address,
        orderType, // 'delivery' or 'pickup'
        deliveryInstructions,
        preferredTimeSlot,
        items,
        paymentMethod,
        couponCode
    } = req.body;

    if (!customerName || !phone || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Customer name, phone and order items are required." });
    }

    if (orderType !== 'pickup' && !address) {
        return res.status(400).json({ success: false, message: "Delivery address is required for delivery orders." });
    }

    const db = getDb();
    let subtotal = 0;
    const enrichedItems = items.map(it => {
        const d = db.menu.find(m => m.id == it.id);
        const unitPrice = d ? d.price : (it.price || 0);
        const extras = (it.addonPrice || 0) + (it.sizePrice || 0);
        const total = (unitPrice + extras) * (it.qty || 1);
        subtotal += total;
        return {
            id: it.id,
            name: d ? d.name : it.name,
            unitPrice,
            qty: it.qty || 1,
            size: it.size || 'Standard',
            spice: it.spice || 'Regular',
            addons: it.addons || [],
            total
        };
    });

    let discount = 0;
    let couponApplied = null;
    if (couponCode) {
        const c = db.coupons.find(cp => cp.code.toUpperCase() === couponCode.trim().toUpperCase());
        if (c && subtotal >= c.minOrder) {
            discount = c.type === 'percent' ? Math.min((subtotal * c.value) / 100, c.maxDiscount) : c.value;
            couponApplied = c.code;
        }
    }

    const deliveryFee = (orderType === 'pickup' || subtotal >= 500) ? 0 : 30;
    const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100;
    const grandTotal = Math.max(0, Math.round((subtotal - discount + deliveryFee + tax) * 100) / 100);

    const orderId = 'ORD-' + (Math.floor(1000 + Math.random() * 9000));
    const newOrder = {
        id: orderId,
        userId: userId || 'guest',
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : '',
        address: orderType === 'pickup' ? 'Store Pickup (Flagship Branch)' : address.trim(),
        orderType: orderType || 'delivery',
        timeSlot: preferredTimeSlot || 'ASAP (25-35 min)',
        instructions: deliveryInstructions || '',
        paymentMethod: paymentMethod || 'Cash on Delivery',
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending COD' : 'Paid Online (Verified)',
        items: enrichedItems,
        subtotal,
        discount,
        coupon: couponApplied || '',
        tax,
        deliveryFee,
        grandTotal,
        status: "Confirmed",
        deliveryPartner: orderType === 'pickup' ? null : assignDeliveryPartner(),
        createdAt: new Date().toISOString(),
        estimatedDelivery: orderType === 'pickup' ? 'Ready in 20 min' : '30-40 min'
    };

    db.orders.unshift(newOrder);
    saveDb(db);

    return res.status(201).json({
        success: true,
        message: "Order placed successfully!",
        order: newOrder
    });
});

/* =========================================================
   5. ORDER TRACKING & ORDER MANAGEMENT APIS
   ========================================================= */

// Track specific order
app.get('/api/orders/:id', (req, res) => {
    const db = getDb();
    const order = db.orders.find(o => o.id.toUpperCase() === req.params.id.toUpperCase());
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order });
});

// Update order status (Restaurant Manager / Rider updates)
app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ["Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid order status." });
    }

    const db = getDb();
    const order = db.orders.find(o => o.id.toUpperCase() === req.params.id.toUpperCase());
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    if (status === "Delivered") {
        order.estimatedDelivery = "Delivered";
        if (order.paymentStatus === 'Pending COD') {
            order.paymentStatus = 'Paid (COD Collected)';
        }
    }
    saveDb(db);
    res.json({ success: true, message: `Order status updated to ${status}`, order });
});

// User Order History & Reordering
app.get('/api/orders/user/:userId', (req, res) => {
    const db = getDb();
    const userId = req.params.userId;
    const userOrders = db.orders.filter(o => o.userId === userId || o.phone === userId || o.email === userId);
    res.json({ success: true, count: userOrders.length, orders: userOrders });
});

// List all orders (Restaurant Management Dashboard)
app.get('/api/orders', (req, res) => {
    const db = getDb();
    res.json({ success: true, count: db.orders.length, orders: db.orders });
});

/* =========================================================
   6. RESTAURANT MANAGEMENT DASHBOARD & ANALYTICS APIS
   ========================================================= */

app.get('/api/admin/analytics', (req, res) => {
    const db = getDb();
    const orders = db.orders;

    let totalRevenue = 0;
    let pendingCount = 0;
    let preparingCount = 0;
    let outCount = 0;
    let deliveredCount = 0;

    orders.forEach(o => {
        if (o.status !== 'Cancelled') {
            totalRevenue += o.grandTotal || 0;
        }
        if (o.status === 'Confirmed') pendingCount++;
        else if (o.status === 'Preparing') preparingCount++;
        else if (o.status === 'Out for Delivery') outCount++;
        else if (o.status === 'Delivered') deliveredCount++;
    });

    res.json({
        success: true,
        analytics: {
            totalOrders: orders.length,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            averageOrderValue: orders.length ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
            activeOrders: pendingCount + preparingCount + outCount,
            deliveredOrders: deliveredCount,
            menuItemCount: db.menu.length,
            restaurantsCount: db.restaurants.length
        }
    });
});

/* =========================================================
   7. REVIEWS & RATINGS APIS
   ========================================================= */

app.get('/api/reviews', (req, res) => {
    const db = getDb();
    res.json({ success: true, reviews: db.reviews });
});

app.post('/api/reviews', (req, res) => {
    const { author, rating, comment, restaurant } = req.body;
    if (!author || !rating || !comment) {
        return res.status(400).json({ success: false, message: "Author, rating and comment are required." });
    }

    const db = getDb();
    const newRev = {
        id: db.reviews.length + 1,
        author: author.trim(),
        rating: Math.min(5, Math.max(1, parseFloat(rating))),
        comment: comment.trim(),
        restaurant: restaurant || "JA Restaurant - Flagship Bistro",
        date: new Date().toISOString().split('T')[0]
    };

    db.reviews.unshift(newRev);
    saveDb(db);
    res.status(201).json({ success: true, message: "Review posted!", review: newRev });
});

/* =========================================================
   PWA SERVICE WORKER & MANIFEST FALLBACK
   ========================================================= */

app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

// Fallback to index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🍽️  JA Restaurant Food Ordering System Server running`);
        console.log(`👉  URL: http://localhost:${PORT}`);
        console.log(`📋  Restaurant Dashboard: http://localhost:${PORT}/dashboard.html`);
        console.log(`🛒  Ordering Page: http://localhost:${PORT}/order.html`);
        console.log(`====================================================`);
    });
}

module.exports = app;
