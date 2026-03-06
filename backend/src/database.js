const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');

// ─── SEEDED DATABASE ───────────────────────────────────────────────────────────
const db = {
  users: [
    { id: '1', name: 'Admin User', email: 'admin@smartpos.com', password: bcrypt.hashSync('admin123', 8), role: 'admin', status: 'active', createdAt: new Date().toISOString() }
  ],
  products: [
    { id: '1', name: 'Laptop Pro 15"', sku: 'LAP-001', category: 'Electronics', price: 85000, cost: 65000, stock: 45, minStock: 10, unit: 'Pcs', brand: 'TechBrand', barcode: '8901001', status: 'active', createdAt: new Date().toISOString() },
    { id: '2', name: 'Wireless Mouse', sku: 'MOU-002', category: 'Electronics', price: 2500, cost: 1500, stock: 120, minStock: 20, unit: 'Pcs', brand: 'Logitech', barcode: '8901002', status: 'active', createdAt: new Date().toISOString() },
    { id: '3', name: 'USB-C Hub 7-Port', sku: 'HUB-003', category: 'Accessories', price: 4500, cost: 3000, stock: 8, minStock: 15, unit: 'Pcs', brand: 'Anker', barcode: '8901003', status: 'active', createdAt: new Date().toISOString() },
    { id: '4', name: 'Mechanical Keyboard', sku: 'KEY-004', category: 'Electronics', price: 12000, cost: 8000, stock: 30, minStock: 5, unit: 'Pcs', brand: 'Corsair', barcode: '8901004', status: 'active', createdAt: new Date().toISOString() },
    { id: '5', name: 'Monitor 27" FHD', sku: 'MON-005', category: 'Electronics', price: 35000, cost: 25000, stock: 15, minStock: 3, unit: 'Pcs', brand: 'Samsung', barcode: '8901005', status: 'active', createdAt: new Date().toISOString() },
    { id: '6', name: 'Headphones Pro', sku: 'HDP-006', category: 'Audio', price: 8500, cost: 5500, stock: 60, minStock: 10, unit: 'Pcs', brand: 'Sony', barcode: '8901006', status: 'active', createdAt: new Date().toISOString() },
    { id: '7', name: 'Phone Stand', sku: 'PST-007', category: 'Accessories', price: 800, cost: 400, stock: 3, minStock: 10, unit: 'Pcs', brand: 'Generic', barcode: '8901007', status: 'active', createdAt: new Date().toISOString() },
    { id: '8', name: 'Webcam HD 1080p', sku: 'WEB-008', category: 'Electronics', price: 6500, cost: 4000, stock: 5, minStock: 10, unit: 'Pcs', brand: 'Logitech', barcode: '8901008', status: 'active', createdAt: new Date().toISOString() },
    { id: '9', name: 'Desk Lamp LED', sku: 'LMP-009', category: 'Accessories', price: 3200, cost: 2000, stock: 40, minStock: 8, unit: 'Pcs', brand: 'Philips', barcode: '8901009', status: 'active', createdAt: new Date().toISOString() },
    { id: '10', name: 'External SSD 1TB', sku: 'SSD-010', category: 'Electronics', price: 18000, cost: 13000, stock: 22, minStock: 5, unit: 'Pcs', brand: 'Samsung', barcode: '8901010', status: 'active', createdAt: new Date().toISOString() },
  ],
  customers: [
    { id: '1', name: 'Ahmed Khan', email: 'ahmed@example.com', phone: '0300-1234567', address: 'Karachi, Pakistan', totalOrders: 12, totalSpent: 125000, status: 'active', createdAt: '2024-01-15' },
    { id: '2', name: 'Sara Ali', email: 'sara@example.com', phone: '0311-9876543', address: 'Lahore, Pakistan', totalOrders: 5, totalSpent: 48000, status: 'active', createdAt: '2024-02-20' },
    { id: '3', name: 'Bilal Hassan', email: 'bilal@example.com', phone: '0321-5551234', address: 'Islamabad, Pakistan', totalOrders: 8, totalSpent: 89000, status: 'active', createdAt: '2024-03-10' },
    { id: '4', name: 'Fatima Noor', email: 'fatima@example.com', phone: '0333-7778888', address: 'Faisalabad, Pakistan', totalOrders: 3, totalSpent: 22000, status: 'active', createdAt: '2024-04-05' },
    { id: '5', name: 'Usman Tariq', email: 'usman@example.com', phone: '0345-1112222', address: 'Multan, Pakistan', totalOrders: 20, totalSpent: 250000, status: 'active', createdAt: '2024-01-01' },
  ],
  suppliers: [
    { id: '1', name: 'TechSupply Co.', email: 'supply@tech.com', phone: '021-35001234', address: 'Karachi', contact: 'Raza Ahmed', totalPurchases: 450000, status: 'active' },
    { id: '2', name: 'Global Electronics', email: 'info@globalelec.com', phone: '042-35667890', address: 'Lahore', contact: 'Nadeem Bhai', totalPurchases: 320000, status: 'active' },
    { id: '3', name: 'Prime Distributors', email: 'prime@dist.pk', phone: '051-2890234', address: 'Islamabad', contact: 'Kamran Mirza', totalPurchases: 180000, status: 'active' },
  ],
  categories: ['Electronics', 'Accessories', 'Audio', 'Furniture', 'Stationery', 'Food & Beverage'],
  sales: [],
  purchases: [],
  expenses: [
    { id: '1', title: 'Office Rent', category: 'Rent', amount: 50000, notes: 'Monthly rent', date: new Date().toISOString() },
    { id: '2', title: 'Electricity Bill', category: 'Utilities', amount: 8500, notes: '', date: new Date().toISOString() },
    { id: '3', title: 'Staff Salary', category: 'Salary', amount: 120000, notes: '3 employees', date: new Date().toISOString() },
  ],
  income: [
    { id: '1', title: 'Online Sales', category: 'Sales', amount: 150000, notes: '', date: new Date().toISOString() },
    { id: '2', title: 'Service Charges', category: 'Service', amount: 25000, notes: '', date: new Date().toISOString() },
  ],
  accounts: [
    { id: '1', name: 'Main Cash Account', type: 'cash', balance: 250000, currency: 'PKR' },
    { id: '2', name: 'HBL Business Account', type: 'bank', balance: 850000, currency: 'PKR' },
    { id: '3', name: 'Meezan Bank', type: 'bank', balance: 320000, currency: 'PKR' },
  ],
  invoiceCounter: 1,
  purchaseCounter: 1,
};

// Generate demo sales
const statuses = ['paid','paid','paid','pending','cancelled'];
const methods = ['cash','card','online'];
for (let i = 0; i < 65; i++) {
  const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 60));
  const numItems = Math.floor(Math.random() * 3) + 1;
  const items = [];
  let sub = 0;
  for (let j = 0; j < numItems; j++) {
    const p = db.products[Math.floor(Math.random() * db.products.length)];
    const q = Math.floor(Math.random() * 3) + 1;
    items.push({ productId: p.id, name: p.name, qty: q, price: p.price, total: p.price * q });
    sub += p.price * q;
  }
  const disc = Math.floor(Math.random() * 1000);
  const tax = Math.round(sub * 0.17);
  const cust = db.customers[Math.floor(Math.random() * db.customers.length)];
  const status = statuses[Math.floor(Math.random() * 5)];
  db.sales.push({
    id: uuid(), invoiceNo: `INV-${String(db.invoiceCounter).padStart(5, '0')}`,
    customerId: cust.id, customerName: cust.name,
    items, subtotal: sub, discount: disc, tax, total: Math.max(0, sub + tax - disc),
    paymentMethod: methods[Math.floor(Math.random() * 3)], status, date: d.toISOString()
  });
  db.invoiceCounter++;
}

module.exports = { db, uuid };
