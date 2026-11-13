const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

const INITIAL_DATA = {
    restaurants: [
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
    ],
    menu: [
        {
            id: 1,
            restaurantId: 1,
            name: "Burger",
            price: 85,
            cat: "snack",
            veg: false,
            img: "images/1.jpg",
            desc: "Juicy handcrafted patty on a toasted bun with melted cheese, crisp lettuce, tomato, onion and chef's special secret sauce.",
            rating: 4.8,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Regular", price: 0 }, { name: "Double Patty Large", price: 40 }],
                spiceLevels: ["Mild", "Medium", "Extra Spicy"],
                addons: [{ name: "Extra Melted Cheese", price: 25 }, { name: "French Fries Combo", price: 45 }]
            }
        },
        {
            id: 2,
            restaurantId: 2,
            name: "Cheese Pizza",
            price: 249,
            cat: "main",
            veg: true,
            img: "images/2.jpg",
            desc: "Hand-stretched authentic crust loaded with 100% mozzarella cheese, rich herb tomato concasse and fragrant basil.",
            rating: 4.9,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Medium (8-inch)", price: 0 }, { name: "Large (11-inch)", price: 90 }],
                spiceLevels: ["Classic Italian", "Spicy Herbs"],
                addons: [{ name: "Cheese Burst Crust", price: 50 }, { name: "Extra Toppings (Mushroom & Olives)", price: 35 }]
            }
        },
        {
            id: 3,
            restaurantId: 4,
            name: "Vegetable Chow Mein",
            price: 110,
            cat: "main",
            veg: true,
            img: "images/3.jpg",
            desc: "Wok-tossed noodles with bell peppers, cabbage, spring onion and light soya glaze with smoky wok aroma.",
            rating: 4.6,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Standard Portion", price: 0 }, { name: "Jumbo Family Portion", price: 60 }],
                spiceLevels: ["Mild", "Spicy Schezwan"],
                addons: [{ name: "Extra Veggies", price: 20 }, { name: "Crispy Fried Garlic", price: 15 }]
            }
        },
        {
            id: 4,
            restaurantId: 1,
            name: "BBQ Chicken Drumsticks",
            price: 199,
            cat: "starter",
            veg: false,
            img: "images/4.jpg",
            desc: "Tender drumsticks slow-roasted and coated in sticky sweet smoky barbecue glaze, served with garlic mayo.",
            rating: 4.9,
            in_stock: true,
            customizations: {
                sizes: [{ name: "4 Pieces", price: 0 }, { name: "8 Pieces Sharing Pack", price: 160 }],
                spiceLevels: ["Smoky Sweet", "Fiery Hot BBQ"],
                addons: [{ name: "Extra Ranch Dip", price: 25 }, { name: "Buttered Bread Roll", price: 20 }]
            }
        },
        {
            id: 5,
            restaurantId: 1,
            name: "Chicken Vegetable Soup",
            price: 90,
            cat: "starter",
            veg: false,
            img: "images/5.jpg",
            desc: "Warm comforting bowl of tender shredded chicken, diced farm vegetables, herbs and a delicately seasoned clear broth.",
            rating: 4.7,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Regular Bowl (300ml)", price: 0 }, { name: "Large Bowl (500ml)", price: 35 }],
                spiceLevels: ["Gentle Pepper", "Spicy Pepper Kick"],
                addons: [{ name: "Crispy Croutons", price: 15 }, { name: "Garlic Toast (2 pcs)", price: 25 }]
            }
        },
        {
            id: 6,
            restaurantId: 3,
            name: "Chicken Biryani",
            price: 180,
            cat: "main",
            veg: false,
            img: "images/6.jpg",
            desc: "Royal long-grain aged basmati rice cooked on dum with succulent marinated chicken, saffron, fried onions, served with cooling mint raita.",
            rating: 5.0,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Single Special (1 pc Chicken + 1 Egg + 1 Aloo)", price: 0 }, { name: "Royal Handi (2 pcs Chicken + 2 Eggs)", price: 80 }],
                spiceLevels: ["Traditional Kolkata Style", "Spicy Hyderabadi Style"],
                addons: [{ name: "Extra Raita", price: 20 }, { name: "Firni Dessert Cup", price: 40 }]
            }
        },
        {
            id: 7,
            restaurantId: 4,
            name: "Momos",
            price: 70,
            cat: "snack",
            veg: true,
            img: "images/7.jpg",
            desc: "Handcrafted soft steamed dumplings filled with spiced fresh vegetables and herbs, served with fiery red chili dip and clear broth.",
            rating: 4.8,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Steamed (6 pcs)", price: 0 }, { name: "Fried / Pan-Tossed (6 pcs)", price: 20 }],
                spiceLevels: ["Mild Garlic Dip", "Super Fiery Chili Dip"],
                addons: [{ name: "Cheese Dip", price: 25 }, { name: "Extra Momo Soup", price: 15 }]
            }
        },
        {
            id: 8,
            restaurantId: 1,
            name: "Aloo Paratha",
            price: 60,
            cat: "main",
            veg: true,
            img: "images/8.jpg",
            desc: "Traditional North Indian wheat flatbread generously stuffed with spiced herb potatoes, served hot with cultured butter and pickle.",
            rating: 4.7,
            in_stock: true,
            customizations: {
                sizes: [{ name: "1 Large Paratha", price: 0 }, { name: "Twin Paratha Combo with Curd", price: 45 }],
                spiceLevels: ["Mild Green Chili", "Spicy Amritsari"],
                addons: [{ name: "Extra Amul Butter Cube", price: 15 }, { name: "Sweet Lassi (200ml)", price: 35 }]
            }
        },
        {
            id: 9,
            restaurantId: 3,
            name: "Butter Chicken",
            price: 220,
            cat: "main",
            veg: false,
            img: "images/9.jpg",
            desc: "Charcoal grilled chicken tikka simmered in a silky smooth tomato, cashew and butter gravy with kasuri methi.",
            rating: 4.9,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Half Plate (3 pcs)", price: 0 }, { name: "Full Plate (6 pcs)", price: 140 }],
                spiceLevels: ["Mild Creamy", "Medium Spiced"],
                addons: [{ name: "Butter Naan (1 pc)", price: 35 }, { name: "Garlic Naan (1 pc)", price: 45 }]
            }
        },
        {
            id: 10,
            restaurantId: 1,
            name: "Crispy Chicken Fries",
            price: 165,
            cat: "snack",
            veg: false,
            img: "images/10.jpg",
            desc: "Crunchy crumb-coated chicken strips fried until golden, seasoned with peri-peri dust and served with salted crinkle fries.",
            rating: 4.8,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Regular Box", price: 0 }, { name: "Family Bucket", price: 95 }],
                spiceLevels: ["Classic Salted", "Peri-Peri", "Ghost Pepper Hot"],
                addons: [{ name: "Cheesy Dip", price: 25 }, { name: "Chilled Beverage Can", price: 35 }]
            }
        },
        {
            id: 11,
            restaurantId: 1,
            name: "Spicy Chicken Curry",
            price: 170,
            cat: "main",
            veg: false,
            img: "images/11.jpg",
            desc: "Homestyle village chicken cooked in rich onion, ginger-garlic and whole garam masala gravy with tender baby potatoes.",
            rating: 4.7,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Standard Bowl (4 pcs)", price: 0 }, { name: "Family Bowl (8 pcs)", price: 120 }],
                spiceLevels: ["Medium Spicy", "Desi Fiery Hot"],
                addons: [{ name: "Steamed Rice", price: 40 }, { name: "Tawa Roti (3 pcs)", price: 25 }]
            }
        },
        {
            id: 12,
            restaurantId: 1,
            name: "Milkshakes",
            price: 120,
            cat: "drink",
            veg: true,
            img: "images/12.jpg",
            desc: "Thick premium chilled milkshake crafted with whole dairy cream and rich gelato. Available in Belgian Chocolate, Alphonso Mango, Strawberry and Vanilla.",
            rating: 4.9,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Regular (350ml)", price: 0 }, { name: "Large (500ml)", price: 40 }],
                spiceLevels: ["Regular Sweet", "Low Sugar"],
                addons: [{ name: "Whipped Cream & Choco Chips", price: 25 }, { name: "Vanilla Ice Cream Scoop", price: 30 }]
            }
        },
        {
            id: 13,
            restaurantId: 1,
            name: "Chicken Lollipop",
            price: 140,
            cat: "starter",
            veg: false,
            img: "images/13.jpg",
            desc: "Crispy Indo-Chinese chicken wingettes marinated with ginger, garlic and chilies, deep-fried and served with hot Szechuan dip.",
            rating: 4.8,
            in_stock: true,
            customizations: {
                sizes: [{ name: "5 Pieces Dry", price: 0 }, { name: "5 Pieces Tossed in Szechuan Gravy", price: 25 }],
                spiceLevels: ["Mild Hot", "Fiery Red"],
                addons: [{ name: "Extra Schezwan Sauce", price: 20 }]
            }
        },
        {
            id: 14,
            restaurantId: 4,
            name: "Mixed Fried Rice",
            price: 190,
            cat: "main",
            veg: false,
            img: "images/14.jpg",
            desc: "Aromatic jasmine rice wok-tossed with fresh prawns, diced chicken, scrambled eggs, carrots and baby corn.",
            rating: 4.8,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Full Plate", price: 0 }, { name: "Jumbo Sharing Plate", price: 90 }],
                spiceLevels: ["Classic Chinese", "Spicy Singapore Style"],
                addons: [{ name: "Chilli Chicken Gravy (2 pcs)", price: 65 }]
            }
        },
        {
            id: 15,
            restaurantId: 1,
            name: "Crispy Fried Fish",
            price: 260,
            cat: "main",
            veg: false,
            img: "images/15.jpg",
            desc: "Fresh Kolkata Bhetki fillet coated in herbed panko breadcrumbs, fried crisp and served with mustard kasundi and fresh onion rings.",
            rating: 4.9,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Single Fillet (200g)", price: 0 }, { name: "Double Fillet Platter (400g)", price: 180 }],
                spiceLevels: ["Classic Herb Salt", "Spicy Bengali Masala"],
                addons: [{ name: "Tartar Sauce & Fries", price: 40 }]
            }
        },
        {
            id: 16,
            restaurantId: 1,
            name: "Grilled Sandwich",
            price: 120,
            cat: "snack",
            veg: true,
            img: "images/16.jpg",
            desc: "Triple-layered buttered jumbo bread loaded with spiced cottage cheese/chicken, bell peppers, melted mozzarella and mint mayo.",
            rating: 4.7,
            in_stock: true,
            customizations: {
                sizes: [{ name: "Standard 2 Wedges", price: 0 }, { name: "Club 4 Wedges with Fries", price: 50 }],
                spiceLevels: ["Mild Mint", "Spicy Herb"],
                addons: [{ name: "Extra Mozzarella Slice", price: 20 }]
            }
        }
    ],
    users: [
        {
            id: "user_admin",
            name: "Manager Jishu",
            email: "admin@jarestaurant.com",
            phone: "9876543210",
            address: "JA Central Branch Office, Park Street",
            role: "admin",
            passwordHash: "admin123",
            verified: true,
            createdAt: new Date().toISOString()
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
            createdAt: new Date().toISOString()
        }
    ],
    orders: [
        {
            id: "ORD-9281",
            userId: "user_demo",
            customerName: "Debika Mondal",
            phone: "9876543211",
            email: "debika@example.com",
            address: "Flat 4B, Green Park Enclave, Kolkata",
            orderType: "delivery",
            timeSlot: "Delivered",
            instructions: "Ring doorbell twice",
            paymentMethod: "UPI (Google Pay)",
            paymentStatus: "Paid",
            items: [
                { id: 6, name: "Chicken Biryani", price: 180, qty: 2, total: 360, size: "Single Special", spice: "Traditional" },
                { id: 12, name: "Milkshakes", price: 120, qty: 1, total: 120, size: "Regular", spice: "Regular Sweet" }
            ],
            subtotal: 480,
            discount: 50,
            coupon: "WELCOME50",
            tax: 21.5,
            deliveryFee: 0,
            grandTotal: 451.5,
            status: "Delivered",
            deliveryPartner: {
                name: "Rahul Sharma",
                phone: "+91 98111 22334",
                vehicle: "Honda Activa (WB-02-AK-4190)",
                rating: 4.9
            },
            createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
            estimatedDelivery: "Delivered"
        },
        {
            id: "ORD-9304",
            userId: "user_demo",
            customerName: "Debika Mondal",
            phone: "9876543211",
            email: "debika@example.com",
            address: "Flat 4B, Green Park Enclave, Kolkata",
            orderType: "delivery",
            timeSlot: "ASAP (25-35 min)",
            instructions: "Leave at security desk if unavailable",
            paymentMethod: "Credit Card (Visa ending in 4242)",
            paymentStatus: "Paid",
            items: [
                { id: 2, name: "Cheese Pizza", price: 249, qty: 1, total: 249, size: "Medium", spice: "Classic Italian" },
                { id: 7, name: "Momos", price: 70, qty: 2, total: 140, size: "Steamed", spice: "Super Fiery Chili Dip" }
            ],
            subtotal: 389,
            discount: 0,
            coupon: "",
            tax: 19.45,
            deliveryFee: 30,
            grandTotal: 438.45,
            status: "Out for Delivery",
            deliveryPartner: {
                name: "Amit Mondal",
                phone: "+91 98333 44556",
                vehicle: "Hero Splendor (WB-01-AZ-7721)",
                rating: 4.8
            },
            createdAt: new Date(Date.now() - 1200000).toISOString(),
            estimatedDelivery: "15 mins"
        }
    ],
    coupons: [
        { code: "WELCOME50", type: "percent", value: 50, maxDiscount: 100, minOrder: 199 },
        { code: "TASTY20", type: "percent", value: 20, maxDiscount: 150, minOrder: 299 },
        { code: "FLAT50", type: "flat", value: 50, maxDiscount: 50, minOrder: 300 },
        { code: "FREESHIP", type: "shipping", value: 30, maxDiscount: 30, minOrder: 150 }
    ],
    reviews: [
        {
            id: 1,
            author: "Debika Mondal",
            rating: 5,
            comment: "JA Restaurant is now my go-to spot. The Chicken Biryani was fragrant and perfectly spiced, and the Butter Chicken was rich and creamy. Hot and fast delivery!",
            restaurant: "JA Restaurant - Flagship Bistro",
            date: "2026-11-10"
        },
        {
            id: 2,
            author: "Madhumita Banerjee",
            rating: 5,
            comment: "I ordered the Cheese Pizza and Momos, and both were fantastic. The cheese pull was amazing, and the red chutney with the momos had just the right heat.",
            restaurant: "JA Royal Pizzeria & Italian",
            date: "2026-11-11"
        },
        {
            id: 3,
            author: "Sumit Mondal",
            rating: 4.5,
            comment: "Really enjoyed the BBQ Chicken Drumsticks. Tender, sticky, and full of smoky flavor. Vegetable Chow Mein was light and flavorful.",
            restaurant: "JA Restaurant - Flagship Bistro",
            date: "2026-11-12"
        }
    ]
};

function ensureDirSync(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function getDb() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            ensureDirSync(DB_PATH);
            fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
            return INITIAL_DATA;
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading database:", err);
        return INITIAL_DATA;
    }
}

function saveDb(data) {
    try {
        ensureDirSync(DB_PATH);
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (err) {
        console.error("Error saving database:", err);
        return false;
    }
}

module.exports = {
    getDb,
    saveDb,
    INITIAL_DATA
};
