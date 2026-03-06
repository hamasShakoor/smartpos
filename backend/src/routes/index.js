const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, uuid } = require('../database');
const { auth, SECRET } = require('../middleware/auth');
const router = express.Router();

// ── AUTH ──────────────────────────────────────────────────────────────────────
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.get('/auth/me', auth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
router.get('/dashboard', auth, (req, res) => {
  const paid = db.sales.filter(s => s.status === 'paid');
  const totalRevenue = paid.reduce((s, x) => s + x.total, 0);
  const totalCost = paid.reduce((s, x) => s + x.items.reduce((a, i) => {
    const p = db.products.find(p => p.id === i.productId);
    return a + (p?.cost || 0) * i.qty;
  }, 0), 0);
  const today = new Date().toDateString();
  const todaySales = paid.filter(s => new Date(s.date).toDateString() === today);
  const todayRevenue = todaySales.reduce((s, x) => s + x.total, 0);
  const totalExpenses = db.expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = db.income.reduce((s, i) => s + i.amount, 0);
  const lowStock = db.products.filter(p => p.stock <= p.minStock).length;

  // Monthly revenue last 12 months
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const m = d.getMonth(); const y = d.getFullYear();
    const ms = paid.filter(s => { const sd = new Date(s.date); return sd.getMonth() === m && sd.getFullYear() === y; });
    monthly.push({ month: d.toLocaleString('default', { month: 'short' }), year: y, revenue: ms.reduce((s, x) => s + x.total, 0), orders: ms.length });
  }

  // Top products
  const pMap = {};
  paid.forEach(s => s.items.forEach(i => {
    if (!pMap[i.productId]) pMap[i.productId] = { name: i.name, qty: 0, revenue: 0 };
    pMap[i.productId].qty += i.qty;
    pMap[i.productId].revenue += i.total;
  }));
  const topProducts = Object.values(pMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Payment method breakdown
  const paymentBreakdown = { cash: 0, card: 0, online: 0 };
  paid.forEach(s => { paymentBreakdown[s.paymentMethod] = (paymentBreakdown[s.paymentMethod] || 0) + s.total; });

  res.json({
    totalRevenue, todayRevenue, totalProfit: totalRevenue - totalCost,
    totalOrders: db.sales.length, todayOrders: todaySales.length,
    totalCustomers: db.customers.length, totalProducts: db.products.length,
    lowStockItems: lowStock, totalExpenses, totalIncome,
    netProfit: totalRevenue - totalCost - totalExpenses,
    monthly, topProducts, paymentBreakdown,
    recentSales: db.sales.slice(-6).reverse()
  });
});

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
router.get('/products', auth, (req, res) => {
  let list = [...db.products];
  const { search, category, status } = req.query;
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
  if (category) list = list.filter(p => p.category === category);
  if (status) list = list.filter(p => p.status === status);
  res.json({ data: list, total: list.length });
});

router.get('/products/:id', auth, (req, res) => {
  const p = db.products.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

router.post('/products', auth, (req, res) => {
  const p = { id: uuid(), ...req.body, status: req.body.status || 'active', createdAt: new Date().toISOString() };
  db.products.push(p);
  res.status(201).json(p);
});

router.put('/products/:id', auth, (req, res) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  db.products[idx] = { ...db.products[idx], ...req.body };
  res.json(db.products[idx]);
});

router.delete('/products/:id', auth, (req, res) => {
  db.products = db.products.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

// ── CATEGORIES ────────────────────────────────────────────────────────────────
router.get('/categories', auth, (req, res) => res.json(db.categories));
router.post('/categories', auth, (req, res) => {
  if (!db.categories.includes(req.body.name)) db.categories.push(req.body.name);
  res.json(db.categories);
});
router.delete('/categories/:name', auth, (req, res) => {
  db.categories = db.categories.filter(c => c !== req.params.name);
  res.json(db.categories);
});

// ── CUSTOMERS ─────────────────────────────────────────────────────────────────
router.get('/customers', auth, (req, res) => {
  let list = [...db.customers];
  const { search } = req.query;
  if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  res.json({ data: list, total: list.length });
});
router.post('/customers', auth, (req, res) => {
  const c = { id: uuid(), ...req.body, totalOrders: 0, totalSpent: 0, status: 'active', createdAt: new Date().toISOString() };
  db.customers.push(c);
  res.status(201).json(c);
});
router.put('/customers/:id', auth, (req, res) => {
  const idx = db.customers.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  db.customers[idx] = { ...db.customers[idx], ...req.body };
  res.json(db.customers[idx]);
});
router.delete('/customers/:id', auth, (req, res) => {
  db.customers = db.customers.filter(c => c.id !== req.params.id);
  res.json({ success: true });
});

// ── SUPPLIERS ─────────────────────────────────────────────────────────────────
router.get('/suppliers', auth, (req, res) => {
  let list = [...db.suppliers];
  const { search } = req.query;
  if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  res.json({ data: list, total: list.length });
});
router.post('/suppliers', auth, (req, res) => {
  const s = { id: uuid(), ...req.body, totalPurchases: 0, status: 'active', createdAt: new Date().toISOString() };
  db.suppliers.push(s);
  res.status(201).json(s);
});
router.put('/suppliers/:id', auth, (req, res) => {
  const idx = db.suppliers.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  db.suppliers[idx] = { ...db.suppliers[idx], ...req.body };
  res.json(db.suppliers[idx]);
});
router.delete('/suppliers/:id', auth, (req, res) => {
  db.suppliers = db.suppliers.filter(s => s.id !== req.params.id);
  res.json({ success: true });
});

// ── SALES ─────────────────────────────────────────────────────────────────────
router.get('/sales', auth, (req, res) => {
  let list = [...db.sales];
  const { status, from, to, search } = req.query;
  if (status) list = list.filter(s => s.status === status);
  if (from) list = list.filter(s => new Date(s.date) >= new Date(from));
  if (to) list = list.filter(s => new Date(s.date) <= new Date(to + 'T23:59:59'));
  if (search) list = list.filter(s => s.invoiceNo.toLowerCase().includes(search.toLowerCase()) || s.customerName.toLowerCase().includes(search.toLowerCase()));
  res.json({ data: list.reverse(), total: list.length });
});

router.post('/sales', auth, (req, res) => {
  const sale = { id: uuid(), invoiceNo: `INV-${String(db.invoiceCounter).padStart(5, '0')}`, ...req.body, date: new Date().toISOString() };
  db.invoiceCounter++;
  db.sales.push(sale);
  // Update stock
  sale.items.forEach(item => {
    const p = db.products.find(p => p.id === item.productId);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });
  // Update customer
  const cust = db.customers.find(c => c.id === sale.customerId);
  if (cust && sale.status === 'paid') { cust.totalOrders++; cust.totalSpent += sale.total; }
  res.status(201).json(sale);
});

router.put('/sales/:id', auth, (req, res) => {
  const idx = db.sales.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  db.sales[idx] = { ...db.sales[idx], ...req.body };
  res.json(db.sales[idx]);
});

router.delete('/sales/:id', auth, (req, res) => {
  db.sales = db.sales.filter(s => s.id !== req.params.id);
  res.json({ success: true });
});

// ── PURCHASES ─────────────────────────────────────────────────────────────────
router.get('/purchases', auth, (req, res) => {
  res.json({ data: [...db.purchases].reverse(), total: db.purchases.length });
});
router.post('/purchases', auth, (req, res) => {
  const p = { id: uuid(), poNumber: `PO-${String(db.purchaseCounter).padStart(5, '0')}`, ...req.body, date: new Date().toISOString() };
  db.purchaseCounter++;
  db.purchases.push(p);
  // Update stock
  p.items?.forEach(item => {
    const prod = db.products.find(pr => pr.id === item.productId);
    if (prod) prod.stock += item.qty;
  });
  // Update supplier
  const sup = db.suppliers.find(s => s.id === p.supplierId);
  if (sup) sup.totalPurchases += p.total;
  res.status(201).json(p);
});
router.put('/purchases/:id', auth, (req, res) => {
  const idx = db.purchases.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  db.purchases[idx] = { ...db.purchases[idx], ...req.body };
  res.json(db.purchases[idx]);
});

// ── EXPENSES ──────────────────────────────────────────────────────────────────
router.get('/expenses', auth, (req, res) => res.json({ data: [...db.expenses].reverse(), total: db.expenses.length }));
router.post('/expenses', auth, (req, res) => {
  const e = { id: uuid(), ...req.body, date: new Date().toISOString() };
  db.expenses.push(e);
  res.status(201).json(e);
});
router.put('/expenses/:id', auth, (req, res) => {
  const idx = db.expenses.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  db.expenses[idx] = { ...db.expenses[idx], ...req.body };
  res.json(db.expenses[idx]);
});
router.delete('/expenses/:id', auth, (req, res) => {
  db.expenses = db.expenses.filter(e => e.id !== req.params.id);
  res.json({ success: true });
});

// ── INCOME ────────────────────────────────────────────────────────────────────
router.get('/income', auth, (req, res) => res.json({ data: [...db.income].reverse(), total: db.income.length }));
router.post('/income', auth, (req, res) => {
  const i = { id: uuid(), ...req.body, date: new Date().toISOString() };
  db.income.push(i);
  res.status(201).json(i);
});
router.delete('/income/:id', auth, (req, res) => {
  db.income = db.income.filter(i => i.id !== req.params.id);
  res.json({ success: true });
});

// ── ACCOUNTS ──────────────────────────────────────────────────────────────────
router.get('/accounts', auth, (req, res) => res.json({ data: db.accounts, total: db.accounts.length }));
router.post('/accounts', auth, (req, res) => {
  const a = { id: uuid(), ...req.body };
  db.accounts.push(a);
  res.status(201).json(a);
});
router.put('/accounts/:id', auth, (req, res) => {
  const idx = db.accounts.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  db.accounts[idx] = { ...db.accounts[idx], ...req.body };
  res.json(db.accounts[idx]);
});
router.delete('/accounts/:id', auth, (req, res) => {
  db.accounts = db.accounts.filter(a => a.id !== req.params.id);
  res.json({ success: true });
});

// ── REPORTS ───────────────────────────────────────────────────────────────────
router.get('/reports/sales', auth, (req, res) => {
  const { from, to } = req.query;
  let list = [...db.sales];
  if (from) list = list.filter(s => new Date(s.date) >= new Date(from));
  if (to) list = list.filter(s => new Date(s.date) <= new Date(to + 'T23:59:59'));
  const paid = list.filter(s => s.status === 'paid');
  res.json({
    totalSales: paid.length, totalRevenue: paid.reduce((s, x) => s + x.total, 0),
    totalTax: paid.reduce((s, x) => s + x.tax, 0), totalDiscount: paid.reduce((s, x) => s + x.discount, 0),
    data: list.reverse()
  });
});

router.get('/reports/profit-loss', auth, (req, res) => {
  const { from, to } = req.query;
  let sales = db.sales.filter(s => s.status === 'paid');
  if (from) sales = sales.filter(s => new Date(s.date) >= new Date(from));
  if (to) sales = sales.filter(s => new Date(s.date) <= new Date(to + 'T23:59:59'));
  const revenue = sales.reduce((s, x) => s + x.total, 0);
  const cogs = sales.reduce((s, x) => s + x.items.reduce((a, i) => {
    const p = db.products.find(p => p.id === i.productId);
    return a + (p?.cost || 0) * i.qty;
  }, 0), 0);
  const totalExpenses = db.expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = db.income.reduce((s, i) => s + i.amount, 0);
  res.json({ revenue, cogs, grossProfit: revenue - cogs, totalExpenses, totalIncome, netProfit: revenue - cogs - totalExpenses + totalIncome });
});

router.get('/reports/stock', auth, (req, res) => {
  const low = db.products.filter(p => p.stock <= p.minStock);
  const out = db.products.filter(p => p.stock === 0);
  const totalValue = db.products.reduce((s, p) => s + p.stock * p.cost, 0);
  res.json({ low, out, totalValue, totalProducts: db.products.length, data: db.products });
});

module.exports = router;
