/**
 * JA Restaurant - Full Stack App Bridge
 * Dual Mode: Seamlessly talks to Node/Express backend at /api/
 * or falls back to robust LocalStorage data store when opened as static file.
 */

const AppBridge = (() => {
    const STORAGE_KEY_AUTH = 'ja_user_session';
    const STORAGE_KEY_FAVS = 'ja_user_favs';
    const STORAGE_KEY_ORDERS = 'ja_orders_local';

    let isApiConnected = null;

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
        getFavorites,
        toggleFavorite,
        isFavorite,
        getLocalOrders,
        saveLocalOrder,
        DEFAULT_RESTAURANTS
    };
})();

window.AppBridge = AppBridge;
