import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, Printer, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { fc } from '../utils/format';

const EMOJIS = { Electronics: '💻', Accessories: '🎧', Audio: '🔊', default: '📦' };
const TAX_RATE = 0.17;

export default function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [customer, setCustomer] = useState('');
  const [payment, setPayment] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/products', { params: { status: 'active' } }), api.get('/customers'), api.get('/categories')])
      .then(([p, c, cat]) => { setProducts(p.data.data); setCustomers(c.data.data); setCategories(cat.data); });
  }, []);

  const filtered = products.filter(p => {
    const s = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search);
    const c = !catFilter || p.category === catFilter;
    return s && c;
  });

  const addToCart = (product) => {
    if (product.stock <= 0) { toast.error('Out of stock!'); return; }
    setCart(prev => {
      const ex = prev.find(i => i.productId === product.id);
      if (ex) {
        if (ex.qty >= product.stock) { toast.error('Max stock reached!'); return prev; }
        return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1, total: product.price, stock: product.stock }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const qty = i.qty + delta;
      if (qty <= 0) return null;
      return { ...i, qty, total: qty * i.price };
    }).filter(Boolean));
  };

  const removeItem = (productId) => setCart(prev => prev.filter(i => i.productId !== productId));
  const clearCart = () => { setCart([]); setDiscount(0); };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = Math.max(0, subtotal + tax - Number(discount));
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleCheckout = async () => {
    if (!cart.length) { toast.error('Cart is empty!'); return; }
    setSaving(true);
    const sel = customers.find(c => c.id === customer);
    try {
      const res = await api.post('/sales', {
        customerId: customer || null,
        customerName: sel?.name || 'Walk-in Customer',
        items: cart,
        subtotal, tax,
        discount: Number(discount),
        total,
        paymentMethod: payment,
        status: 'paid'
      });
      toast.success(`Sale complete! ${res.data.invoiceNo}`);
      printReceipt(res.data);
      clearCart();
      setCustomer('');
    } catch { toast.error('Error processing sale'); }
    finally { setSaving(false); }
  };

  const printReceipt = (sale) => {
    const win = window.open('', '_blank', 'width=400,height=600');
    win.document.write(`<html><head><title>Receipt ${sale.invoiceNo}</title>
    <style>body{font-family:monospace;font-size:13px;padding:20px;max-width:350px}h2{text-align:center;margin:0}hr{border:1px dashed #ccc;margin:10px 0}
    .row{display:flex;justify-content:space-between;margin:4px 0}.total{font-size:16px;font-weight:900}.center{text-align:center}</style>
    </head><body>
    <h2>🛒 SmartPOS</h2>
    <p class="center">${sale.invoiceNo}</p><p class="center">${new Date().toLocaleString()}</p>
    <p class="center">Customer: ${sale.customerName}</p><hr>
    ${sale.items.map(i => `<div class="row"><span>${i.name} ×${i.qty}</span><span>${fc(i.total)}</span></div>`).join('')}
    <hr>
    <div class="row"><span>Subtotal:</span><span>${fc(sale.subtotal)}</span></div>
    <div class="row"><span>Tax (17% GST):</span><span>${fc(sale.tax)}</span></div>
    <div class="row"><span>Discount:</span><span>-${fc(sale.discount)}</span></div>
    <div class="row total"><span>TOTAL:</span><span>${fc(sale.total)}</span></div>
    <hr><p class="center">Payment: ${sale.paymentMethod.toUpperCase()}</p>
    <p class="center">Thank you for shopping!</p>
    <script>window.onload=()=>{window.print();setTimeout(window.close,500)}<\/script></body></html>`);
  };

  const payMethods = [
    { key: 'cash', label: '💵 Cash' },
    { key: 'card', label: '💳 Card' },
    { key: 'online', label: '📱 Online' },
  ];

  return (
    <div className="flex gap-4 h-[calc(100vh-112px)]">
      {/* LEFT: Products */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filters */}
        <div className="card p-3 mb-4 flex gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1">
            <Search size={14} className="text-gray-400" />
            <input className="bg-transparent border-none outline-none text-sm w-full" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product or barcode..." />
          </div>
          <select className="form-input w-40" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0}
                className={`bg-white border-2 rounded-2xl p-3 text-center transition-all cursor-pointer group
                  ${p.stock <= 0 ? 'opacity-50 cursor-not-allowed border-gray-100' : 'border-gray-100 hover:border-primary hover:shadow-lg hover:-translate-y-1'}`}>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2">
                  {EMOJIS[p.category] || EMOJIS.default}
                </div>
                <p className="font-black text-gray-800 text-xs leading-tight mb-1 line-clamp-2">{p.name}</p>
                <p className="text-primary font-black text-sm">{fc(p.price)}</p>
                <p className={`text-[10px] mt-0.5 font-bold ${p.stock <= p.minStock ? 'text-red-500' : 'text-gray-400'}`}>
                  {p.stock <= 0 ? 'Out of Stock' : `Stock: ${p.stock}`}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-[360px] flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {/* Cart Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-gray-800 flex items-center gap-2"><ShoppingCart size={16} className="text-primary" /> Cart</h3>
            <div className="flex items-center gap-2">
              <span className="badge badge-warning">{itemCount} items</span>
              {cart.length > 0 && <button onClick={clearCart} className="text-xs text-red-500 font-bold hover:underline">Clear</button>}
            </div>
          </div>
          <select className="form-input text-sm" value={customer} onChange={e => setCustomer(e.target.value)}>
            <option value="">👤 Walk-in Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart size={36} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm font-semibold">Cart is empty</p>
              <p className="text-gray-300 text-xs mt-1">Click products to add</p>
            </div>
          ) : cart.map(item => (
            <div key={item.productId} className="flex items-center gap-2 p-2 border border-gray-100 rounded-xl mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-800 truncate">{item.name}</p>
                <p className="text-[11px] text-gray-400">{fc(item.price)} × {item.qty} = <span className="font-black text-gray-700">{fc(item.total)}</span></p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.productId, -1)} className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-all"><Minus size={11} /></button>
                <span className="w-6 text-center font-black text-sm">{item.qty}</span>
                <button onClick={() => updateQty(item.productId, 1)} className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-all"><Plus size={11} /></button>
              </div>
              <button onClick={() => removeItem(item.productId)} className="w-6 h-6 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all"><Trash2 size={11} /></button>
            </div>
          ))}
        </div>

        {/* Cart Footer */}
        <div className="border-t border-gray-100 p-4">
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-bold">{fc(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Tax (17% GST)</span><span className="font-bold text-orange-500">{fc(tax)}</span></div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} min="0"
                className="w-24 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold outline-none focus:border-primary" />
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="font-black text-gray-800">Total</span>
              <span className="font-black text-xl text-primary">{fc(total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {payMethods.map(m => (
              <button key={m.key} onClick={() => setPayment(m.key)}
                className={`py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${payment === m.key ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-primary'}`}>
                {m.label}
              </button>
            ))}
          </div>

          <button onClick={handleCheckout} disabled={saving || !cart.length}
            className="btn btn-primary w-full justify-center py-3 rounded-xl font-black text-base">
            {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Printer size={16} /> Complete Sale</>}
          </button>
        </div>
      </div>
    </div>
  );
}
