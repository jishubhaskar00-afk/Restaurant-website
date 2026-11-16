/**
 * JA Restaurant - Full Stack App Bridge
 * Dual Mode: Seamlessly talks to Node/Express backend at /api/
 * or falls back to robust LocalStorage data store when opened as static file.
 */

const AppBridge = (() => {
    const STORAGE_KEY_AUTH = 'ja_user_session';
    const STORAGE_KEY_FAVS = 'ja_user_favs';
    const STORAGE_KEY_ORDERS = 'ja_orders_local';
    const STORAGE_KEY_USERS = 'ja_registered_users';

    let isApiConnected = null;

    // Default registered users seed for offline / static mode
    const DEFAULT_REGISTERED_USERS = [
        {
            id: "user_admin",
            name: "Manager Jishu",
            email: "admin@jarestaurant.com",
            phone: "9876543210",
            address: "JA Central Branch Office, Park Street",
            role: "admin",
            passwordHash: "admin123",
            verified: true,
            createdAt: "2026-11-13T10:38:24.644Z"
        },
        {
            id: "user_demo",
            name: "Debika Mondal",
            email: "debika@example.com",
            phone: "9876543211",
            address: "Flat 4B, Green Park Enclave, Kolkata",
            role: "customer",
            passwordHash: "demo123",
            verified: true,
            createdAt: "2026-11-13T10:38:24.644Z"
        },
        {
            id: "user_jishu",
            name: "Jishu Bhaskar",
            email: "jishubhaskar328@gmail.com",
            phone: "9907044676",
            address: "Jangipur, Murshidabad, 742213",
            role: "customer",
            passwordHash: "jishu@060924",
            verified: true,
            createdAt: "2026-11-13T10:38:24.644Z"
        }
    ];

    // Initialize registered users in local storage if not present
    function getRegisteredUsers() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_USERS);
            if (!raw) {
                localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_REGISTERED_USERS));
                return DEFAULT_REGISTERED_USERS;
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_REGISTERED_USERS));
                return DEFAULT_REGISTERED_USERS;
            }
            return parsed;
        } catch (e) {
            return DEFAULT_REGISTERED_USERS;
        }
    }

    function saveRegisteredUser(user) {
        const users = getRegisteredUsers();
        const existingIdx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (existingIdx >= 0) {
            users[existingIdx] = { ...users[existingIdx], ...user };
        } else {
            users.push(user);
        }
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        return user;
    }

    // Check backend connectivity
    async function checkBackend() {
        if (window.location.protocol === 'file:') {
            isApiConnected = false;
            return false;
        }
        try {
            const res = await fetch('/api/restaurants', { signal: AbortSignal.timeout(1800) });
            isApiConnected = res.ok;
        } catch (e) {
            isApiConnected = false;
        }
        return isApiConnected;
    }

    // Default restaurants
    const DEFAULT_RESTAURANTS = [
        {
            id: 1,
            name: "JA Restaurant - Flagship Bistro",
            location: "Downtown Central, Main Street",
            area: "Central City, Park Street, Salt Lake",
            cuisine: "Multi-Cuisine & Fast Food",
            rating: 4.9,
            reviewsCount: 328,
            operatingHours: "10:00 AM - 11:30 PM",
            deliveryRadius: "8 km",
            deliveryTime: "25-35 min",
            contactPhone: "+91 98765 43210",
            email: "info@jarestaurant.com",
            image: "images/bg.png",
            featured: true
        },
        {
            id: 2,
            name: "JA Royal Pizzeria & Italian",
            location: "North Avenue, City Mall Sector 5",
            area: "North Avenue, Salt Lake Sector 5, New Town",
            cuisine: "Italian & Fast Food",
            rating: 4.8,
            reviewsCount: 215,
            operatingHours: "11:00 AM - 11:00 PM",
            deliveryRadius: "6 km",
            deliveryTime: "20-30 min",
            contactPhone: "+91 98765 43211",
            email: "pizzeria@jarestaurant.com",
            image: "images/2.jpg",
            featured: false
        },
        {
            id: 3,
            name: "JA Spice Biryani & Mughlai Kitchen",
            location: "East Park Road, Heritage Corner",
            area: "East Park, Ballygunge, Gariahat",
            cuisine: "Biryani & Mughlai",
            rating: 4.9,
            reviewsCount: 412,
            operatingHours: "12:00 PM - 12:00 AM",
            deliveryRadius: "10 km",
            deliveryTime: "30-45 min",
            contactPhone: "+91 98765 43212",
            email: "biryani@jarestaurant.com",
            image: "images/6.jpg",
            featured: true
        },
        {
            id: 4,
            name: "JA Asian Wok & Momo Bar",
            location: "West Square, Metro Plaza",
            area: "West Square, Alipore, Behala",
            cuisine: "Pan-Asian & Dim Sum",
            rating: 4.7,
            reviewsCount: 189,
            operatingHours: "11:30 AM - 10:30 PM",
            deliveryRadius: "7 km",
            deliveryTime: "20-35 min",
            contactPhone: "+91 98765 43213",
            email: "asianwok@jarestaurant.com",
            image: "images/7.jpg",
            featured: false
        }
    ];

    // Auth helpers
    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_AUTH)) || null;
        } catch (e) {
            return null;
        }
    }

    function setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem(STORAGE_KEY_AUTH);
        } else {
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
        }
        dispatchAuthChange(user);
    }

    function dispatchAuthChange(user) {
        window.dispatchEvent(new CustomEvent('ja_auth_changed', { detail: { user } }));
    }

    // High level login method: checks backend API, falls back to local registered users
    async function loginUser(email, password) {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        if (!cleanEmail) {
            return { success: false, message: "Please enter your email address." };
        }
        if (!cleanPass) {
            return { success: false, message: "Please enter your password." };
        }

        // Try backend API first
        if (window.location.protocol.startsWith('http')) {
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: cleanEmail, password: cleanPass })
                });
                const data = await res.json();
                if (data.success && data.user) {
                    setCurrentUser(data.user);
                    // Also mirror into local store
                    saveRegisteredUser({ ...data.user, passwordHash: cleanPass });
                    return { success: true, message: data.message || "Login successful!", user: data.user };
                }
                return {
                    success: false,
                    notRegistered: !!data.notRegistered,
                    message: data.message || "Invalid credentials."
                };
            } catch (err) {
                // If network/server unreachable, proceed to local check
            }
        }

        // Local check for offline/file:// mode
        const localUsers = getRegisteredUsers();
        const found = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
        if (!found) {
            return {
                success: false,
                notRegistered: true,
                message: "No account found with this email. You are not registered yet. Please click Create Account below to register before accessing the website."
            };
        }

        if (found.passwordHash !== cleanPass) {
            return {
                success: false,
                message: "Incorrect password. Please verify your password and try again."
            };
        }

        const safeUser = {
            id: found.id,
            name: found.name,
            email: found.email,
            phone: found.phone || '',
            address: found.address || '',
            role: found.role || 'customer'
        };
        setCurrentUser(safeUser);
        return { success: true, message: "Login successful!", user: safeUser };
    }

    // High level register method
    async function registerUser(userData) {
        const { name, email, phone, address, password } = userData;
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        if (!cleanEmail || !cleanPass) {
            return { success: false, message: "Email and password are required." };
        }

        // Try backend API
        if (window.location.protocol.startsWith('http')) {
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: cleanEmail,
                        phone: (phone || '').trim(),
                        address: (address || '').trim(),
                        password: cleanPass
                    })
                });
                const data = await res.json();
                if (data.success && data.user) {
                    setCurrentUser(data.user);
                    saveRegisteredUser({ ...data.user, passwordHash: cleanPass });
                    return { success: true, message: data.message || "Registration successful!", user: data.user };
                }
                return { success: false, message: data.message || "Registration failed." };
            } catch (err) {
                // Fallback to local
            }
        }

        // Local registration fallback
        const localUsers = getRegisteredUsers();
        const exists = localUsers.some(u => u.email.toLowerCase() === cleanEmail);
        if (exists) {
            return { success: false, message: "An account with this email already exists. Please log in." };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name: name ? name.trim() : cleanEmail.split('@')[0],
            email: cleanEmail,
            phone: (phone || '').trim(),
            address: (address || '').trim(),
            role: 'customer',
            passwordHash: cleanPass,
            verified: true,
            createdAt: new Date().toISOString()
        };

        saveRegisteredUser(newUser);
        const safeUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            address: newUser.address,
            role: newUser.role
        };
        setCurrentUser(safeUser);
        return { success: true, message: "Account created successfully! Welcome to JA Restaurant.", user: safeUser };
    }

    // Require authentication gate: redirects unauthenticated visitors to login.html
    function requireAuth() {
        const user = getCurrentUser();
        if (!user) {
            const current = encodeURIComponent(window.location.pathname.split('/').pop() || 'index.html');
            window.location.replace(`login.html?redirect=${current}`);
            return false;
        }
        return true;
    }

    // Logout helper
    function logout() {
        setCurrentUser(null);
        window.location.href = "login.html?action=logout";
    }

    // Favorites
    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVS)) || [];
        } catch (e) {
            return [];
        }
    }

    function toggleFavorite(id) {
        let favs = getFavorites();
        const numId = parseInt(id, 10);
        if (favs.includes(numId)) {
            favs = favs.filter(x => x !== numId);
        } else {
            favs.push(numId);
        }
        localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favs));
        window.dispatchEvent(new CustomEvent('ja_favs_changed', { detail: { favs } }));
        return favs.includes(numId);
    }

    function isFavorite(id) {
        return getFavorites().includes(parseInt(id, 10));
    }

    // Orders in LocalStorage fallback
    function getLocalOrders() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveLocalOrder(order) {
        const list = getLocalOrders();
        list.unshift(order);
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(list));
        return order;
    }

    // Seed local registered users on script load
    getRegisteredUsers();

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.log('PWA ServiceWorker registration skipped:', err);
            });
        });
    }

    return {
        checkBackend,
        isApiConnected: () => isApiConnected,
        getCurrentUser,
        setCurrentUser,
        getRegisteredUsers,
        loginUser,
        registerUser,
        requireAuth,
        logout,
        getFavorites,
        toggleFavorite,
        isFavorite,
        getLocalOrders,
        saveLocalOrder,
        DEFAULT_RESTAURANTS
    };
})();

window.AppBridge = AppBridge;
