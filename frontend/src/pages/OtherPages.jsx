import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../utils/api';
import { fc, fd } from '../utils/format';
import { Modal, PageHeader, Table, FormField, StatCard } from '../components/ui';

// ══════════════════════════════════════════════════════════════════════════════
// PURCHASES PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ supplierId: '', notes: '' });
  const [items, setItems] = useState([{ productId: '', name: '', qty: 1, cost: 0 }]);

  const load = async () => {
    setLoading(true);
    const [pRes, sRes, prRes] = await Promise.all([api.get('/purchases'), api.get('/suppliers'), api.get('/products')]);
    setPurchases(pRes.data.data); setSuppliers(sRes.data.data); setProducts(prRes.data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const addItem = () => setItems(p => [...p, { productId: '', name: '', qty: 1, cost: 0 }]);
  const removeItem = i => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i, k, v) => setItems(p => p.map((item, idx) => {
    if (idx !== i) return item;
    if (k === 'productId') {
      const prod = products.find(p => p.id === v);
      return { ...item, productId: v, name: prod?.name || '', cost: prod?.cost || 0 };
    }
    return { ...item, [k]: v };
  }));

  const total = items.reduce((s, i) => s + (Number(i.qty) * Number(i.cost)), 0);

  const handleSave = async () => {
    const sup = suppliers.find(s => s.id === form.supplierId);
    if (!sup) { toast.error('Select a supplier'); return; }
    const validItems = items.filter(i => i.productId && i.qty > 0);
    if (!validItems.length) { toast.error('Add at least one item'); return; }
    setSaving(true);
    try {
      await api.post('/purchases', { supplierId: form.supplierId, supplierName: sup.name, items: validItems.map(i => ({ ...i, qty: Number(i.qty), cost: Number(i.cost), total: Number(i.qty) * Number(i.cost) })), total, notes: form.notes });
      toast.success('Purchase order created! Stock updated.'); setModal(false); load();
    } catch { toast.error('Error'); } finally { setSaving(false); }
  };

  const columns = [
    { key: 'poNumber', label: 'PO Number', render: v => <span className="font-black text-primary">{v}</span> },
    { key: 'supplierName', label: 'Supplier', render: v => <span className="font-bold">{v}</span> },
    { key: 'items', label: 'Items', render: v => <span className="badge badge-info">{v?.length || 0} items</span> },
    { key: 'total', label: 'Total', render: v => <span className="font-black text-gray-800">{fc(v)}</span> },
    { key: 'date', label: 'Date', render: v => fd(v) },
    { key: 'status', label: 'Status', render: () => <span className="badge badge-success">Received</span> },
  ];

  return (
    <div>
      <PageHeader title="Purchase Orders" subtitle="Manage supplier purchases & stock replenishment"
        action={<button onClick={() => { setForm({ supplierId: '', notes: '' }); setItems([{ productId: '', name: '', qty: 1, cost: 0 }]); setModal(true); }} className="btn btn-primary"><Plus size={15} /> New Purchase</button>} />
      <div className="card">
        <Table columns={columns} data={purchases} loading={loading} emptyMsg="No purchase orders yet. Create your first one!" />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New Purchase Order" size="xl"
        footer={<>
          <span className="mr-auto font-black text-gray-700">Total: {fc(total)}</span>
          <button onClick={() => setModal(false)} className="btn btn-outline">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Create PO'}</button>
        </>}>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <FormField label="Supplier *">
            <select className="form-input" value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Notes"><input className="form-input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" /></FormField>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h4 className="font-black text-gray-700">Items</h4>
          <button onClick={addItem} className="btn btn-outline btn-sm"><Plus size={13} /> Add Item</button>
        </div>

        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-end">
            <div className="col-span-2">
              <select className="form-input text-sm" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <input type="number" className="form-input text-sm" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} min={1} />
            <input type="number" className="form-input text-sm" placeholder="Cost Rs." value={item.cost} onChange={e => updateItem(i, 'cost', e.target.value)} />
            <button onClick={() => removeItem(i)} className="btn btn-danger btn-sm h-9">Remove</button>
          </div>
        ))}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LOW STOCK PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function LowStock() {
  const [data, setData] = useState({ low: [], out: [], totalValue: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/reports/stock').then(r => { setData(r.data); setLoading(false); }); }, []);

  return (
    <div>
      <PageHeader title="Low Stock Alert" subtitle="Products that need restocking" />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={data.low.length} color="warning" />
        <StatCard icon={AlertTriangle} label="Out of Stock" value={data.out.length} color="danger" />
        <StatCard icon={AlertTriangle} label="Inventory Value" value={fc(data.totalValue)} color="info" />
      </div>

      {data.out.length > 0 && (
        <div className="card mb-4">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-red-50 rounded-t-2xl">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="font-black text-red-600">Out of Stock ({data.out.length})</h3>
          </div>
          <Table loading={loading} data={data.out} columns={[
            { key: 'name', label: 'Product', render: v => <span className="font-bold text-red-600">{v}</span> },
            { key: 'sku', label: 'SKU', render: v => <code className="bg-gray-100 px-2 py-0.5 rounded-lg text-xs">{v}</code> },
            { key: 'category', label: 'Category' },
            { key: 'stock', label: 'Stock', render: () => <span className="badge badge-danger">0</span> },
            { key: 'minStock', label: 'Min Required', render: (v, r) => `${v} ${r.unit}` },
            { key: 'id', label: '', render: () => <button onClick={() => window.location.hash = '#purchases'} className="btn btn-primary btn-sm">Reorder Now</button> },
          ]} />
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-orange-50 rounded-t-2xl">
          <AlertTriangle size={16} className="text-orange-500" />
          <h3 className="font-black text-orange-600">Low Stock Items ({data.low.length})</h3>
        </div>
        <Table loading={loading} data={data.low} emptyMsg="✅ All products are well stocked!" columns={[
          { key: 'name', label: 'Product', render: v => <span className="font-bold">{v}</span> },
          { key: 'sku', label: 'SKU', render: v => <code className="bg-gray-100 px-2 py-0.5 rounded-lg text-xs">{v}</code> },
          { key: 'category', label: 'Category' },
          { key: 'stock', label: 'Current Stock', render: (v, r) => <span className="badge badge-warning">{v} {r.unit}</span> },
          { key: 'minStock', label: 'Min Stock', render: (v, r) => `${v} ${r.unit}` },
          { key: 'price', label: 'Price', render: v => fc(v) },
          { key: 'id', label: '', render: () => <button className="btn btn-outline btn-sm">Create PO</button> },
        ]} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORTS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [from, setFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
  const [to, setTo] = useState(now.toISOString().split('T')[0]);

  const load = async () => {
    setLoading(true);
    const r = await api.get('/reports/sales', { params: { from, to } });
    setReport(r.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Sales Report" subtitle="Analyze your sales performance" />

      <div className="card p-4 mb-5 flex items-center gap-3">
        <span className="text-sm font-bold text-gray-600">Date Range:</span>
        <input type="date" className="form-input w-40" value={from} onChange={e => setFrom(e.target.value)} />
        <span className="text-gray-400">to</span>
        <input type="date" className="form-input w-40" value={to} onChange={e => setTo(e.target.value)} />
        <button onClick={load} className="btn btn-primary"><BarChart2 size={15} /> Generate</button>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-5">
            <StatCard icon={BarChart2} label="Total Sales" value={report.totalSales} color="primary" />
            <StatCard icon={BarChart2} label="Revenue" value={fc(report.totalRevenue)} color="success" />
            <StatCard icon={BarChart2} label="Tax Collected" value={fc(report.totalTax)} color="warning" />
            <StatCard icon={BarChart2} label="Discounts Given" value={fc(report.totalDiscount)} color="danger" />
          </div>
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-black text-gray-800">Sales Details ({report.data.length} records)</h3>
            </div>
            <Table data={report.data} loading={loading} columns={[
              { key: 'invoiceNo', label: 'Invoice', render: v => <span className="font-black text-primary">{v}</span> },
              { key: 'customerName', label: 'Customer' },
              { key: 'date', label: 'Date', render: v => fd(v) },
              { key: 'total', label: 'Total', render: v => <span className="font-black">{fc(v)}</span> },
              { key: 'tax', label: 'Tax', render: v => fc(v) },
              { key: 'discount', label: 'Discount', render: v => fc(v) },
              { key: 'paymentMethod', label: 'Payment', render: v => <span className="badge badge-info capitalize">{v}</span> },
              { key: 'status', label: 'Status', render: v => <span className={`badge ${v === 'paid' ? 'badge-success' : v === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{v}</span> },
            ]} />
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFIT & LOSS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function ProfitLoss() {
  const [data, setData] = useState(null);
  const now = new Date();
  const [from, setFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
  const [to, setTo] = useState(now.toISOString().split('T')[0]);

  const load = async () => {
    const r = await api.get('/reports/profit-loss', { params: { from, to } });
    setData(r.data);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Profit & Loss" subtitle="Financial summary" />
      <div className="card p-4 mb-5 flex items-center gap-3">
        <input type="date" className="form-input w-40" value={from} onChange={e => setFrom(e.target.value)} />
        <span className="text-gray-400">to</span>
        <input type="date" className="form-input w-40" value={to} onChange={e => setTo(e.target.value)} />
        <button onClick={load} className="btn btn-primary">Generate</button>
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-5">
          <div className="card p-6">
            <h3 className="font-black text-gray-800 mb-5">Income Statement</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Revenue', value: data.revenue, color: 'text-emerald-600' },
                { label: 'Cost of Goods Sold (COGS)', value: -data.cogs, color: 'text-red-500' },
                { label: 'Gross Profit', value: data.grossProfit, color: 'text-primary', bold: true, separator: true },
                { label: 'Other Income', value: data.totalIncome, color: 'text-emerald-600' },
                { label: 'Total Expenses', value: -data.totalExpenses, color: 'text-red-500' },
              ].map(row => (
                <div key={row.label}>
                  {row.separator && <hr className="border-gray-200 mb-4" />}
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${row.bold ? 'font-black text-gray-800' : 'text-gray-600'}`}>{row.label}</span>
                    <span className={`font-black ${row.color}`}>{row.value < 0 ? '-' : ''}{fc(Math.abs(row.value))}</span>
                  </div>
                </div>
              ))}
              <hr className="border-gray-300 border-2" />
              <div className="flex justify-between items-center">
                <span className="font-black text-gray-800 text-lg">Net Profit</span>
                <span className={`font-black text-2xl ${data.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fc(data.netProfit)}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-black text-gray-800 mb-5">Summary</h3>
            <div className="space-y-4">
              {[
                { label: 'Revenue', value: data.revenue, pct: 100, color: 'bg-primary' },
                { label: 'COGS', value: data.cogs, pct: Math.round((data.cogs / data.revenue) * 100) || 0, color: 'bg-red-400' },
                { label: 'Gross Profit', value: data.grossProfit, pct: Math.round((data.grossProfit / data.revenue) * 100) || 0, color: 'bg-emerald-400' },
                { label: 'Expenses', value: data.totalExpenses, pct: Math.round((data.totalExpenses / data.revenue) * 100) || 0, color: 'bg-orange-400' },
                { label: 'Net Profit', value: data.netProfit, pct: Math.round((data.netProfit / data.revenue) * 100) || 0, color: data.netProfit >= 0 ? 'bg-emerald-600' : 'bg-red-600' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-gray-700">{row.label}</span>
                    <span className="font-black text-gray-800">{fc(row.value)} <span className="text-gray-400 font-normal text-xs">({row.pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${Math.min(100, Math.abs(row.pct))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STOCK REPORT PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function StockReport() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/reports/stock').then(r => setData(r.data)); }, []);

  return (
    <div>
      <PageHeader title="Stock Report" subtitle="Complete inventory analysis" />
      {data && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <StatCard icon={BarChart2} label="Total Products" value={data.totalProducts} color="primary" />
            <StatCard icon={AlertTriangle} label="Low Stock" value={data.low.length} color="warning" />
            <StatCard icon={BarChart2} label="Inventory Value" value={fc(data.totalValue)} color="success" />
          </div>
          <div className="card">
            <Table data={data.data || []} columns={[
              { key: 'name', label: 'Product', render: v => <span className="font-bold">{v}</span> },
              { key: 'sku', label: 'SKU', render: v => <code className="bg-gray-100 px-2 py-0.5 rounded-lg text-xs">{v}</code> },
              { key: 'category', label: 'Category' },
              { key: 'stock', label: 'Current Stock', render: (v, r) => <span className={`badge ${v <= 0 ? 'badge-danger' : v <= r.minStock ? 'badge-warning' : 'badge-success'}`}>{v} {r.unit}</span> },
              { key: 'cost', label: 'Cost Price', render: v => fc(v) },
              { key: 'price', label: 'Sale Price', render: v => fc(v) },
              { key: 'stock', label: 'Stock Value', render: (v, r) => <span className="font-black text-gray-800">{fc(v * r.cost)}</span> },
            ]} />
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORIES PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');

  const load = async () => { const r = await api.get('/categories'); setCategories(r.data); };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newCat.trim()) return;
    await api.post('/categories', { name: newCat.trim() });
    toast.success('Category added!'); setNewCat(''); load();
  };
  const handleDelete = async name => {
    await api.delete(`/categories/${name}`);
    toast.success('Deleted'); load();
  };

  return (
    <div>
      <PageHeader title="Categories" subtitle="Manage product categories" />
      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-black text-gray-800 mb-4">Add New Category</h3>
          <div className="flex gap-3">
            <input className="form-input flex-1" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category name..." onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <button onClick={handleAdd} className="btn btn-primary"><Plus size={15} /> Add</button>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-black text-gray-800 mb-4">Existing Categories ({categories.length})</h3>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-700">{c}</span>
                <button onClick={() => handleDelete(c)} className="btn btn-danger btn-sm w-7 h-7 p-0 flex items-center justify-center"><Plus size={12} className="rotate-45" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
