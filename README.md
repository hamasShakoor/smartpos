# 🛒 SmartPOS – Full Stack Point of Sale System

React + Tailwind CSS Frontend | Node.js + Express Backend

---

## 📁 Project Structure

```
smartpos/
├── backend/
│   ├── src/
│   │   ├── server.js          ← Express server
│   │   ├── database.js        ← In-memory database with demo data
│   │   ├── routes/index.js    ← All API routes
│   │   └── middleware/auth.js ← JWT Authentication
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx            ← Router + Routes
    │   ├── main.jsx           ← Entry point
    │   ├── index.css          ← Tailwind + Custom styles
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── components/
    │   │   ├── layout/Layout.jsx   ← Sidebar + Header
    │   │   └── ui/index.jsx        ← Reusable UI components
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx       ← Charts & stats
    │   │   ├── Products.jsx        ← CRUD
    │   │   ├── POS.jsx             ← POS Terminal
    │   │   ├── SalesCustomersSuppliers.jsx
    │   │   ├── Accounts.jsx        ← Bank accounts, expenses, income
    │   │   └── OtherPages.jsx      ← Purchases, reports, etc.
    │   └── utils/
    │       ├── api.js             ← Axios + JWT interceptor
    │       └── format.js          ← Currency & date formatters
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Setup & Run (3 Simple Steps)

### Step 1 — Install Node.js
Download from: https://nodejs.org (v18 or higher)

### Step 2 — Setup Backend
```bash
cd smartpos/backend
npm install
npm start
```
✅ Backend runs at: **http://localhost:5000**

### Step 3 — Setup Frontend (new terminal)
```bash
cd smartpos/frontend
npm install
npm run dev
```
✅ Frontend runs at: **http://localhost:3000**

### Open in browser
👉 **http://localhost:3000**

---

## 🔐 Login
| Field | Value |
|-------|-------|
| Email | admin@smartpos.com |
| Password | admin123 |

---

## ✅ All Features

### 📊 Dashboard
- Revenue bar chart (12 months)
- Payment method pie chart
- Key metrics: Revenue, Orders, Profit, Expenses
- Top 5 selling products with progress bars
- Recent sales list

### 🛒 POS Terminal
- Product grid with category filter & search
- Add to cart with click
- Qty +/- controls in cart
- Customer selection (walk-in or existing)
- Cash / Card / Online payment
- 17% GST auto-calculation
- Custom discount field
- Receipt printing on checkout

### 📦 Products
- Full CRUD (Add/Edit/Delete)
- Search by name/SKU
- Filter by category & status
- Stock level badges (green/yellow/red)
- Min stock alert threshold

### 📋 Sales Orders
- View all sales with filters
- Filter by status, date range, search
- Change order status inline
- View detailed invoice
- Summary stats (paid/pending/cancelled)

### 👥 Customers
- Full CRUD
- Search by name/email/phone
- Total orders & spending tracker

### 🏪 Suppliers
- Full CRUD
- Total purchases tracking

### 🚚 Purchases
- Create Purchase Orders (PO)
- Auto stock update on PO creation
- Multi-item purchase form

### 💳 Bank Accounts
- Multiple accounts (cash, bank, mobile)
- Balance tracking
- Add/Edit/Delete accounts

### 💰 Income
- Record income entries
- Category-wise tracking

### 🧾 Expenses
- Record business expenses
- Category-wise tracking
- Monthly breakdown

### 📊 Reports
- **Sales Report** — date range filter, full details
- **Profit & Loss** — Revenue, COGS, Gross Profit, Net Profit
- **Stock Report** — inventory value, low/out of stock

### ⚠️ Low Stock Alert
- Separate out-of-stock section
- Clickable reorder button

### 📁 Categories
- Add/Delete product categories

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Auth | JWT (jsonwebtoken) |
| Password | bcryptjs |
| IDs | uuid |
| Data Store | In-Memory (demo data pre-loaded) |

---

## 💡 Notes
- **Data resets** when backend restarts (in-memory DB)
- For production: replace with **MongoDB** or **PostgreSQL**
- JWT tokens expire in **24 hours**
- Demo includes **65 pre-generated sales** with real data
