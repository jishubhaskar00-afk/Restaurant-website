# JA Restaurant - Online Food Ordering & Restaurant Management System
### ARDENT Industrial Internships 2024 (NEAT Cell - AICTE Approved)
**Author & Developer:** JISHU BHASKAR  
**Technology Stack:** Node.js, Express.js, JavaScript (ES6+), HTML5, CSS3, JSON Database, PWA (Service Worker)

---

## 📌 Project Overview
This project is an end-to-end, full-stack **Online Food Ordering Platform and Restaurant Management System** built strictly in accordance with the **ARDENT Industrial Internships 2024 (NEAT / AICTE)** project requirements.

The application serves both **customers** (browsing menus, customizing dishes, cart management, coupons, checkout, mock payments, live order tracking, order history, ratings, and favorites) and **restaurant owners/managers** (real-time orders management, dynamic menu catalog, price updates, instant stock availability toggles, and operational analytics).

---

## 🚀 Key Features Mapped to PDF Requirements

### 1. User Registration and Authentication
- **User Registration**: Customers can register accounts with name, email, mobile phone, and delivery address.
- **Social Media Login**: One-click registration/login simulation with Google and Facebook.
- **Secure Authentication & 2FA**:
  - Two-factor authentication (2FA) / verification code modal during sign-up to protect accounts.
  - Secure credential login with profile management and session persistence.
  - Real-time profile state displayed in navigation with order history quick link and logout.

### 2. Restaurant Listings and Menus
- **Searchable Restaurant Directory**:
  - Search and filter outlets by location, cuisine type (*Multi-Cuisine, Italian, Biryani/Mughlai, Pan-Asian*), and ratings.
  - Restaurant profiles display operating hours, delivery radius/time, contact number, and address.
- **Interactive Menu Presentation**:
  - Organized by categories: *Starters, Mains, Snacks, Drinks, Favorites, Veg Only*.
  - Detailed food cards with high-definition photos, price, veg/non-veg tags, description, and star ratings.
  - Real-time synchronization with manager updates.

### 3. Ordering Process & Customization
- **Dish Customization Modal**:
  - **Portion Size**: Select between Regular or Large portions.
  - **Spice Level**: Customize spice level (*Mild, Medium, Extra Spicy*).
  - **Add-on Toppings & Sides**: Extra cheese, combo fries, ranch dips, extra sauce.
  - Real-time price calculation within the customization dialog.
- **Live Stock Availability**: Real-time *In Stock* and *Sold Out* badges preventing unavailable orders.
- **Cart Management**:
  - Quantity controls (`+` / `−`), individual item deletion, and cart clear.
  - **Promo / Coupon Engine**: Supports promotional codes:
    - `WELCOME50`: 50% discount up to ₹100
    - `TASTY20`: 20% discount up to ₹150
    - `FLAT50`: Flat ₹50 off on orders above ₹300
  - Itemized bill breakdown: Subtotal, Promo Discount, Delivery Fee (Free on orders ≥ ₹500), Taxes (5% GST), and Grand Total.

### 4. Streamlined Checkout and Payments
- **Flexible Order Type**: Instant switch between **Home Delivery** and **Store Pickup / Takeaway**.
- **Delivery Details**: Collects full address, landmark, delivery instructions (*e.g., "Ring doorbell", "Leave at front desk"*), and preferred delivery time slots (*Instant ASAP, Evening, Dinner, Tomorrow*).
- **Multiple Payment Options**:
  1. Cash on Delivery (COD) / Pay on Pickup
  2. UPI / Digital Wallets (Google Pay, PhonePe, Paytm, QR scan)
  3. Credit / Debit Cards (with interactive mock card validator)
  4. Online Payment Gateway simulation (PayPal / Stripe)

### 5. Order Management & Live Tracking
- **Real-Time Visual Order Tracking**:
  - Animated 4-step progress stepper:
    `Order Placed & Confirmed` ➔ `Preparing in Kitchen` ➔ `Out for Delivery` ➔ `Delivered`.
  - Delivery partner card displaying rider name (*e.g., Rahul Sharma*), vehicle number, star rating, and direct phone link.
  - Estimated delivery countdown timer.
  - Includes a step simulation button for evaluation and demo testing.
- **Order History & Reordering**:
  - Persistent order history drawer with date, items, cost, and status.
  - One-click **Reorder** button to instantly reload past meals into the cart.
- **Ratings & Reviews**:
  - Interactive star rating selector (1 to 5 stars) and review feedback submission.
- **Favorites**: Heart toggle on all dishes with quick "Favorites" filter.

### 6. Restaurant Management Interface (Dashboard)
Located at `/dashboard.html` for restaurant owners and managers:
- **Operational Analytics Cards**: Live gross revenue, total orders count, active kitchen orders, and catalog items.
- **Live Orders Manager**: View incoming customer orders, itemized customizations, payment method, and update order status (*Confirmed ➔ Preparing ➔ Out for Delivery ➔ Delivered ➔ Cancelled*).
- **Menu & Inventory Catalog**:
  - **Inline Price Editor**: Adjust dish prices instantly with real-time database update.
  - **Instant Stock Toggle**: Switch items between *In Stock* (available) and *Out of Stock* (sold out) in 1 click.
  - **Add New Menu Item**: Form to add dishes with name, category, price, veg/non-veg tag, image, and description.

### 7. Delivery Integration
- Partner allocation simulation (*Hero Splendor, Honda Activa, TVS Jupiter*), contact phone number, and dynamic delivery fee calculation based on order value.

### 8. Progressive Web App (PWA) & Offline Support
- `manifest.json`: Web application manifest for standalone app installation.
- `sw.js`: Service Worker caching static assets for fast offline performance.

### 9. Automated Testing
- Unit and integration tests covering:
  - Restaurant directory fetching
  - Menu listing and category filtering
  - Cart calculation (subtotal, discount, GST tax, delivery fee)
  - Order creation and status tracking
  - Menu item availability toggling
  - Manager analytics calculation

---

## 💻 Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), FontAwesome Icons, Responsive Grid & Flexbox, PWA Service Worker.
- **Backend**: Node.js, Express.js.
- **Database**: Persistent JSON database (`data/db.json`) with automatic fallback to client-side localStorage in standalone static mode.
- **Testing**: Node.js built-in test runner (`node --test`).

---

## 🛠️ How to Run the Project

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
The server will start on `http://localhost:3000`.

### 3. Open in Browser
- **Homepage & Outlets:** [http://localhost:3000/index.html](http://localhost:3000/index.html)
- **Order Online & Customization:** [http://localhost:3000/order.html](http://localhost:3000/order.html)
- **Restaurant Manager Dashboard:** [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html)

### 4. Run Automated Tests
```bash
npm test
```
All test suites will execute and validate the core APIs.

---

## 🔑 Demo Credentials
- **Manager / Admin Account:**
  - Email: `admin@jarestaurant.com`
  - Password: `admin123`
- **Customer Demo Account:**
  - Email: `debika@example.com`
  - Password: `demo123`

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/restaurants` | List restaurants (filterable by location, cuisine, min rating) |
| `GET` | `/api/restaurants/:id` | Get details and menu for specific restaurant |
| `GET` | `/api/menu` | List menu items (filterable by category, veg, stock) |
| `POST` | `/api/menu` | Add a new menu item |
| `PUT` | `/api/menu/:id` | Update item details or price |
| `PATCH` | `/api/menu/:id/availability` | Toggle item in_stock status |
| `DELETE`| `/api/menu/:id` | Remove menu item |
| `POST` | `/api/orders/calculate` | Validate coupon and compute totals |
| `POST` | `/api/orders` | Place a new customer order |
| `GET` | `/api/orders` | Get all orders (manager dashboard) |
| `GET` | `/api/orders/:id` | Track single order status and rider info |
| `PATCH` | `/api/orders/:id/status` | Advance order status |
| `GET` | `/api/orders/user/:userId` | Get order history for customer |
| `POST` | `/api/auth/register` | Register customer with 2FA OTP |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP code |
| `POST` | `/api/auth/login` | Login with credentials or social auth |
| `GET` | `/api/admin/analytics` | Operational performance metrics |
| `GET` | `/api/reviews` | View customer ratings and feedback |
| `POST` | `/api/reviews` | Post customer rating and review |

---

*Designed and developed by Jishu Bhaskar for the ARDENT Industrial Internship 2024.*
