import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { fc, fd } from '../utils/format';
import { Modal, PageHeader, SearchBar, Table, FormField, FormRow, Confirm } from '../components/ui';

const UNITS = ['Pcs', 'Kg', 'Ltr', 'Box', 'Pack', 'Set', 'Dozen'];

const emptyForm = { name: '', sku: '', category: '', brand: '', price: '', cost: '', stock: '', minStock: 10, unit: 'Pcs', barcode: '', status: 'active' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      api.get('/products', { params: { search, category: catFilter } }),
      api.get('/categories')
    ]);
    setProducts(pRes.data.data);
    setCategories(cRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, catFilter]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p }); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.price) { toast.error('Name, SKU and Price required'); return; }
    setSaving(true);
    try {
      if (editing) { await api.put(`/products/${editing.id}`, form); toast.success('Product updated!'); }
      else { await api.post('/products', form); toast.success('Product added!'); }
      setModal(false); load();
    } catch { toast.error('Error saving product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/products/${id}`);
    toast.success('Product deleted');
    load();
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const columns = [
    { key: 'name', label: 'Product', render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center"><Package size={18} className="text-primary" /></div>
        <div><p className="font-bold text-gray-800">{row.name}</p><p className="text-xs text-gray-400">{row.barcode}</p></div>
      </div>
    )},
    { key: 'sku', label: 'SKU', render: v => <code className="bg-gray-100 px-2 py-0.5 rounded-lg text-xs font-bold">{v}</code> },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Sale Price', render: v => <span className="font-black text-gray-800">{fc(v)}</span> },
    { key: 'cost', label: 'Cost Price', render: v => <span className="text-gray-500">{fc(v)}</span> },
    { key: 'stock', label: 'Stock', render: (v, row) => (
      <span className={`badge ${v <= 0 ? 'badge-danger' : v <= row.minStock ? 'badge-warning' : 'badge-success'}`}>{v} {row.unit}</span>
    )},
    { key: 'status', label: 'Status', render: v => <span className={`badge ${v === 'active' ? 'badge-success' : 'badge-danger'}`}>{v}</span> },
    { key: 'id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(row)} className="btn btn-outline btn-sm btn-icon w-8 h-8 p-0 flex items-center justify-center"><Edit2 size={13} /></button>
        <button onClick={() => setConfirm(row.id)} className="btn btn-danger btn-sm btn-icon w-8 h-8 p-0 flex items-center justify-center"><Trash2 size={13} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your product inventory"
        action={<button onClick={openAdd} className="btn btn-primary"><Plus size={15} /> Add Product</button>} />

      <div className="card">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
          <div className="w-64"><SearchBar value={search} onChange={setSearch} placeholder="Search products..." /></div>
          <select className="form-input w-auto" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-input w-auto">
            <option>All Status</option><option>active</option><option>inactive</option>
          </select>
          <span className="ml-auto text-xs text-gray-400 font-bold">{products.length} products</span>
        </div>
        <Table columns={columns} data={products} loading={loading} emptyMsg="No products found" />
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add New Product'} size="lg"
        footer={<>
          <button onClick={() => setModal(false)} className="btn btn-outline">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Product'}</button>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Product Name *">
            <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="Enter product name" />
          </FormField>
          <FormField label="SKU *">
            <input className="form-input" value={form.sku} onChange={e => f('sku', e.target.value)} placeholder="SKU-001" />
          </FormField>
          <FormField label="Category">
            <select className="form-input" value={form.category} onChange={e => f('category', e.target.value)}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Brand">
            <input className="form-input" value={form.brand} onChange={e => f('brand', e.target.value)} placeholder="Brand name" />
          </FormField>
          <FormField label="Sale Price (Rs.) *">
            <input type="number" className="form-input" value={form.price} onChange={e => f('price', e.target.value)} placeholder="0" />
          </FormField>
          <FormField label="Cost Price (Rs.)">
            <input type="number" className="form-input" value={form.cost} onChange={e => f('cost', e.target.value)} placeholder="0" />
          </FormField>
          <FormField label="Stock Quantity">
            <input type="number" className="form-input" value={form.stock} onChange={e => f('stock', e.target.value)} placeholder="0" />
          </FormField>
          <FormField label="Min Stock Alert">
            <input type="number" className="form-input" value={form.minStock} onChange={e => f('minStock', e.target.value)} placeholder="10" />
          </FormField>
          <FormField label="Unit">
            <select className="form-input" value={form.unit} onChange={e => f('unit', e.target.value)}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </FormField>
          <FormField label="Barcode">
            <input className="form-input" value={form.barcode} onChange={e => f('barcode', e.target.value)} placeholder="Barcode number" />
          </FormField>
          <FormField label="Status">
            <select className="form-input" value={form.status} onChange={e => f('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        </div>
      </Modal>

      <Confirm open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => handleDelete(confirm)} title="Delete Product" message="Are you sure? This cannot be undone." />
    </div>
  );
}
