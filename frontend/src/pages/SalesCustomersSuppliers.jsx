import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { fc, fd } from '../utils/format';
import { Modal, PageHeader, SearchBar, Table, FormField, Confirm } from '../components/ui';

// ══════════════════════════════════════════════════════════════════════════════
// SALES PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/sales', { params: { search, status, from, to } });
    setSales(res.data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [search, status, from, to]);

  const updateStatus = async (id, newStatus) => {
    await api.put(`/sales/${id}`, { status: newStatus });
    toast.success('Status updated!');
    load();
  };

  const totals = {
    revenue: sales.filter(s => s.status === 'paid').reduce((s, x) => s + x.total, 0),
    paid: sales.filter(s => s.status === 'paid').length,
    pending: sales.filter(s => s.status === 'pending').length,
    cancelled: sales.filter(s => s.status === 'cancelled').length,
  };

  const columns = [
    { key: 'invoiceNo', label: 'Invoice', render: v => <span className="font-black text-primary">{v}</span> },
    { key: 'customerName', label: 'Customer', render: v => <span className="font-bold">{v}</span> },
    { key: 'date', label: 'Date', render: v => fd(v) },
    { key: 'items', label: 'Items', render: v => <span className="badge badge-info">{v?.length || 0} items</span> },
    { key: 'subtotal', label: 'Subtotal', render: v => fc(v) },
    { key: 'total', label: 'Total', render: v => <span className="font-black text-gray-800">{fc(v)}</span> },
    { key: 'paymentMethod', label: 'Payment', render: v => <span className="badge badge-info capitalize">{v}</span> },
    { key: 'status', label: 'Status', render: (v, row) => (
      <select value={v} onChange={e => updateStatus(row.id, e.target.value)}
        className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer outline-none
          ${v === 'paid' ? 'bg-emerald-100 text-emerald-700' : v === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-600'}`}>
        <option value="paid">Paid</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option>
      </select>
    )},
    { key: 'id', label: '', render: (v, row) => (
      <button onClick={() => setDetail(row)} className="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center"><Eye size={13} /></button>
    )},
  ];

  return (
    <div>
      <PageHeader title="Sales Orders" subtitle="Track all your sales transactions"
        action={<button onClick={load} className="btn btn-outline"><RefreshCw size={14} /> Refresh</button>} />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Revenue', value: fc(totals.revenue), color: 'text-primary' },
          { label: 'Paid Orders', value: totals.paid, color: 'text-emerald-600' },
          { label: 'Pending', value: totals.pending, color: 'text-orange-500' },
          { label: 'Cancelled', value: totals.cancelled, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="card px-5 py-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
          <div className="w-56"><SearchBar value={search} onChange={setSearch} placeholder="Search invoice..." /></div>
          <select className="form-input w-36" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option>
          </select>
          <input type="date" className="form-input w-36" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" className="form-input w-36" value={to} onChange={e => setTo(e.target.value)} />
          <span className="ml-auto text-xs text-gray-400 font-bold">{sales.length} records</span>
        </div>
        <Table columns={columns} data={sales} loading={loading} emptyMsg="No sales found" />
      </div>

      {/* Sale Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Invoice: ${detail?.invoiceNo}`} size="lg">
        {detail && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-xl text-sm">
              <div><p className="text-gray-400 text-xs">Customer</p><p className="font-black">{detail.customerName}</p></div>
              <div><p className="text-gray-400 text-xs">Date</p><p className="font-black">{fd(detail.date)}</p></div>
              <div><p className="text-gray-400 text-xs">Payment</p><p className="font-black capitalize">{detail.paymentMethod}</p></div>
              <div><p className="text-gray-400 text-xs">Status</p><span className={`badge ${detail.status === 'paid' ? 'badge-success' : detail.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{detail.status}</span></div>
            </div>
            <table className="w-full text-sm mb-4">
              <thead><tr className="bg-gray-50"><th className="p-3 text-left font-black text-gray-600">Item</th><th className="p-3 text-right font-black text-gray-600">Qty</th><th className="p-3 text-right font-black text-gray-600">Price</th><th className="p-3 text-right font-black text-gray-600">Total</th></tr></thead>
              <tbody>{detail.items?.map((i, idx) => <tr key={idx} className="border-b border-gray-50"><td className="p-3">{i.name}</td><td className="p-3 text-right">{i.qty}</td><td className="p-3 text-right">{fc(i.price)}</td><td className="p-3 text-right font-bold">{fc(i.total)}</td></tr>)}</tbody>
            </table>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{fc(detail.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax (17%)</span><span>{fc(detail.tax)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>-{fc(detail.discount)}</span></div>
              <div className="flex justify-between text-lg font-black border-t border-gray-200 pt-2 mt-2"><span>Total</span><span className="text-primary">{fc(detail.total)}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const emptyCust = { name: '', email: '', phone: '', address: '', status: 'active' };
export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCust);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = async () => { setLoading(true); const r = await api.get('/customers', { params: { search } }); setCustomers(r.data.data); setLoading(false); };
  useEffect(() => { load(); }, [search]);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(emptyCust); setModal(true); };
  const openEdit = p => { setEditing(p); setForm({ ...p }); setModal(true); };
  const handleSave = async () => {
    if (!form.name) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      if (editing) { await api.put(`/customers/${editing.id}`, form); toast.success('Customer updated!'); }
      else { await api.post('/customers', form); toast.success('Customer added!'); }
      setModal(false); load();
    } catch { toast.error('Error saving'); } finally { setSaving(false); }
  };
  const handleDelete = async id => { await api.delete(`/customers/${id}`); toast.success('Deleted'); load(); };

  const columns = [
    { key: 'name', label: 'Name', render: (v, r) => <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center font-black text-primary text-sm">{v[0]}</div><div><p className="font-bold text-gray-800">{v}</p><p className="text-xs text-gray-400">{r.email}</p></div></div> },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'totalOrders', label: 'Orders', render: v => <span className="badge badge-info">{v}</span> },
    { key: 'totalSpent', label: 'Total Spent', render: v => <span className="font-black text-emerald-600">{fc(v)}</span> },
    { key: 'status', label: 'Status', render: v => <span className={`badge ${v === 'active' ? 'badge-success' : 'badge-danger'}`}>{v}</span> },
    { key: 'id', label: 'Actions', render: (v, r) => <div className="flex gap-2"><button onClick={() => openEdit(r)} className="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center"><Edit2 size={13} /></button><button onClick={() => setConfirm(r.id)} className="btn btn-danger btn-sm w-8 h-8 p-0 flex items-center justify-center"><Trash2 size={13} /></button></div> },
  ];

  return (
    <div>
      <PageHeader title="Customers" subtitle="Manage your customers" action={<button onClick={openAdd} className="btn btn-primary"><Plus size={15} /> Add Customer</button>} />
      <div className="card">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-64"><SearchBar value={search} onChange={setSearch} placeholder="Search customers..." /></div>
          <span className="ml-auto text-xs text-gray-400 font-bold">{customers.length} customers</span>
        </div>
        <Table columns={columns} data={customers} loading={loading} emptyMsg="No customers found" />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Customer' : 'Add Customer'}
        footer={<><button onClick={() => setModal(false)} className="btn btn-outline">Cancel</button><button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name *"><input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} /></FormField>
          <FormField label="Email"><input type="email" className="form-input" value={form.email} onChange={e => f('email', e.target.value)} /></FormField>
          <FormField label="Phone"><input className="form-input" value={form.phone} onChange={e => f('phone', e.target.value)} /></FormField>
          <FormField label="Status"><select className="form-input" value={form.status} onChange={e => f('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></FormField>
          <div className="col-span-2"><FormField label="Address"><input className="form-input" value={form.address} onChange={e => f('address', e.target.value)} /></FormField></div>
        </div>
      </Modal>
      <Confirm open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => handleDelete(confirm)} title="Delete Customer" message="Are you sure you want to delete this customer?" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SUPPLIERS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const emptySup = { name: '', email: '', phone: '', address: '', contact: '' };
export function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySup);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = async () => { setLoading(true); const r = await api.get('/suppliers', { params: { search } }); setSuppliers(r.data.data); setLoading(false); };
  useEffect(() => { load(); }, [search]);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(emptySup); setModal(true); };
  const openEdit = p => { setEditing(p); setForm({ ...p }); setModal(true); };
  const handleSave = async () => {
    if (!form.name) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      if (editing) { await api.put(`/suppliers/${editing.id}`, form); toast.success('Supplier updated!'); }
      else { await api.post('/suppliers', form); toast.success('Supplier added!'); }
      setModal(false); load();
    } catch { toast.error('Error saving'); } finally { setSaving(false); }
  };
  const handleDelete = async id => { await api.delete(`/suppliers/${id}`); toast.success('Deleted'); load(); };

  const columns = [
    { key: 'name', label: 'Company', render: (v, r) => <div><p className="font-bold text-gray-800">{v}</p><p className="text-xs text-gray-400">{r.email}</p></div> },
    { key: 'contact', label: 'Contact Person' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'totalPurchases', label: 'Total Purchases', render: v => <span className="font-black text-cyan-600">{fc(v)}</span> },
    { key: 'status', label: 'Status', render: v => <span className="badge badge-success">{v}</span> },
    { key: 'id', label: 'Actions', render: (v, r) => <div className="flex gap-2"><button onClick={() => openEdit(r)} className="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center"><Edit2 size={13} /></button><button onClick={() => setConfirm(r.id)} className="btn btn-danger btn-sm w-8 h-8 p-0 flex items-center justify-center"><Trash2 size={13} /></button></div> },
  ];

  return (
    <div>
      <PageHeader title="Suppliers" subtitle="Manage your suppliers" action={<button onClick={openAdd} className="btn btn-primary"><Plus size={15} /> Add Supplier</button>} />
      <div className="card">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-64"><SearchBar value={search} onChange={setSearch} placeholder="Search suppliers..." /></div>
        </div>
        <Table columns={columns} data={suppliers} loading={loading} emptyMsg="No suppliers found" />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}
        footer={<><button onClick={() => setModal(false)} className="btn btn-outline">Cancel</button><button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Company Name *"><input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} /></FormField>
          <FormField label="Contact Person"><input className="form-input" value={form.contact} onChange={e => f('contact', e.target.value)} /></FormField>
          <FormField label="Email"><input type="email" className="form-input" value={form.email} onChange={e => f('email', e.target.value)} /></FormField>
          <FormField label="Phone"><input className="form-input" value={form.phone} onChange={e => f('phone', e.target.value)} /></FormField>
          <div className="col-span-2"><FormField label="Address"><input className="form-input" value={form.address} onChange={e => f('address', e.target.value)} /></FormField></div>
        </div>
      </Modal>
      <Confirm open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => handleDelete(confirm)} title="Delete Supplier" message="Are you sure?" />
    </div>
  );
}
