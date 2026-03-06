import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { fc, fd } from '../utils/format';
import { Modal, PageHeader, Table, FormField, StatCard, Confirm } from '../components/ui';

// ══════════════════════════════════════════════════════════════════════════════
// ACCOUNTS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const emptyAcc = { name: '', type: 'cash', balance: '', currency: 'PKR' };
export function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAcc);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = async () => { setLoading(true); const r = await api.get('/accounts'); setAccounts(r.data.data); setLoading(false); };
  useEffect(() => { load(); }, []);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(emptyAcc); setModal(true); };
  const openEdit = a => { setEditing(a); setForm({ ...a }); setModal(true); };
  const handleSave = async () => {
    if (!form.name) { toast.error('Account name required'); return; }
    setSaving(true);
    try {
      if (editing) { await api.put(`/accounts/${editing.id}`, { ...form, balance: Number(form.balance) }); toast.success('Account updated!'); }
      else { await api.post('/accounts', { ...form, balance: Number(form.balance) }); toast.success('Account created!'); }
      setModal(false); load();
    } catch { toast.error('Error'); } finally { setSaving(false); }
  };
  const handleDelete = async id => { await api.delete(`/accounts/${id}`); toast.success('Deleted'); load(); };

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const typeColors = { cash: 'bg-emerald-50 text-emerald-600', bank: 'bg-blue-50 text-blue-600', mobile: 'bg-violet-50 text-violet-600' };
  const typeIcons = { cash: '💵', bank: '🏦', mobile: '📱' };

  return (
    <div>
      <PageHeader title="Bank Accounts" subtitle="Manage your financial accounts"
        action={<button onClick={openAdd} className="btn btn-primary"><Plus size={15} /> Add Account</button>} />

      {/* Total Balance Card */}
      <div className="card p-6 mb-5 bg-gradient-to-br from-sidebar to-[#252540] text-white">
        <p className="text-white/60 text-sm font-bold mb-1">Total Balance</p>
        <p className="text-4xl font-black">{fc(totalBalance)}</p>
        <p className="text-white/40 text-xs mt-2">{accounts.length} accounts</p>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {loading ? (
          <div className="col-span-3 text-center py-8 text-gray-400">Loading...</div>
        ) : accounts.map(a => (
          <div key={a.id} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${typeColors[a.type] || 'bg-gray-50'}`}>
                {typeIcons[a.type] || '💰'}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(a)} className="btn btn-outline btn-sm w-7 h-7 p-0 flex items-center justify-center"><Edit2 size={12} /></button>
                <button onClick={() => setConfirm(a.id)} className="btn btn-danger btn-sm w-7 h-7 p-0 flex items-center justify-center"><Trash2 size={12} /></button>
              </div>
            </div>
            <p className="font-black text-gray-800 mb-1">{a.name}</p>
            <p className="text-xs text-gray-400 capitalize mb-3">{a.type} account · {a.currency}</p>
            <p className="text-2xl font-black text-primary">{fc(a.balance)}</p>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Account' : 'Add Account'}
        footer={<><button onClick={() => setModal(false)} className="btn btn-outline">Cancel</button><button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><FormField label="Account Name *"><input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. HBL Main Account" /></FormField></div>
          <FormField label="Account Type">
            <select className="form-input" value={form.type} onChange={e => f('type', e.target.value)}>
              <option value="cash">Cash</option><option value="bank">Bank</option><option value="mobile">Mobile Money</option>
            </select>
          </FormField>
          <FormField label="Opening Balance (Rs.)">
            <input type="number" className="form-input" value={form.balance} onChange={e => f('balance', e.target.value)} placeholder="0" />
          </FormField>
          <FormField label="Currency">
            <select className="form-input" value={form.currency} onChange={e => f('currency', e.target.value)}>
              <option value="PKR">PKR - Pakistani Rupee</option><option value="USD">USD - US Dollar</option><option value="EUR">EUR - Euro</option>
            </select>
          </FormField>
        </div>
      </Modal>
      <Confirm open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => handleDelete(confirm)} title="Delete Account" message="This will permanently delete this account." />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPENSES PAGE
// ══════════════════════════════════════════════════════════════════════════════
const emptyExp = { title: '', category: 'Utilities', amount: '', notes: '' };
const EXP_CATS = ['Utilities', 'Rent', 'Salary', 'Marketing', 'Transport', 'Maintenance', 'Equipment', 'Food', 'Other'];

export function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyExp);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = async () => { setLoading(true); const r = await api.get('/expenses'); setExpenses(r.data.data); setLoading(false); };
  useEffect(() => { load(); }, []);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = async () => {
    if (!form.title || !form.amount) { toast.error('Title and amount required'); return; }
    setSaving(true);
    try { await api.post('/expenses', { ...form, amount: Number(form.amount) }); toast.success('Expense added!'); setModal(false); load(); }
    catch { toast.error('Error'); } finally { setSaving(false); }
  };
  const handleDelete = async id => { await api.delete(`/expenses/${id}`); toast.success('Deleted'); load(); };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const now = new Date();
  const monthExp = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((s, e) => s + e.amount, 0);

  const columns = [
    { key: 'title', label: 'Title', render: v => <span className="font-bold text-gray-800">{v}</span> },
    { key: 'category', label: 'Category', render: v => <span className="badge badge-info">{v}</span> },
    { key: 'amount', label: 'Amount', render: v => <span className="font-black text-red-500">{fc(v)}</span> },
    { key: 'date', label: 'Date', render: v => fd(v) },
    { key: 'notes', label: 'Notes', render: v => <span className="text-gray-400 text-xs">{v || '-'}</span> },
    { key: 'id', label: '', render: (v) => <button onClick={() => setConfirm(v)} className="btn btn-danger btn-sm w-8 h-8 p-0 flex items-center justify-center"><Trash2 size={13} /></button> },
  ];

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Track your business expenses"
        action={<button onClick={() => { setForm(emptyExp); setModal(true); }} className="btn btn-primary"><Plus size={15} /> Add Expense</button>} />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard icon={TrendingDown} label="Total Expenses" value={fc(total)} color="danger" />
        <StatCard icon={TrendingDown} label="This Month" value={fc(monthExp)} color="warning" />
        <StatCard icon={TrendingDown} label="Total Records" value={expenses.length} color="info" />
      </div>
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-800">Expense Records</h3>
          <span className="text-xs text-gray-400 font-bold">{expenses.length} records</span>
        </div>
        <Table columns={columns} data={expenses} loading={loading} emptyMsg="No expenses recorded" />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Expense"
        footer={<><button onClick={() => setModal(false)} className="btn btn-outline">Cancel</button><button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Add Expense'}</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Title *"><input className="form-input" value={form.title} onChange={e => f('title', e.target.value)} placeholder="Expense title" /></FormField>
          <FormField label="Category">
            <select className="form-input" value={form.category} onChange={e => f('category', e.target.value)}>
              {EXP_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Amount (Rs.) *"><input type="number" className="form-input" value={form.amount} onChange={e => f('amount', e.target.value)} placeholder="0" /></FormField>
          <div className="col-span-2"><FormField label="Notes"><textarea className="form-input" rows={2} value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Optional notes..." /></FormField></div>
        </div>
      </Modal>
      <Confirm open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => handleDelete(confirm)} title="Delete Expense" message="Are you sure?" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INCOME PAGE
// ══════════════════════════════════════════════════════════════════════════════
const emptyInc = { title: '', category: 'Sales', amount: '', notes: '' };
const INC_CATS = ['Sales', 'Service', 'Commission', 'Rental', 'Investment', 'Other'];

export function Income() {
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyInc);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = async () => { setLoading(true); const r = await api.get('/income'); setIncome(r.data.data); setLoading(false); };
  useEffect(() => { load(); }, []);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = async () => {
    if (!form.title || !form.amount) { toast.error('Title and amount required'); return; }
    setSaving(true);
    try { await api.post('/income', { ...form, amount: Number(form.amount) }); toast.success('Income added!'); setModal(false); load(); }
    catch { toast.error('Error'); } finally { setSaving(false); }
  };
  const handleDelete = async id => { await api.delete(`/income/${id}`); toast.success('Deleted'); load(); };

  const total = income.reduce((s, i) => s + i.amount, 0);

  const columns = [
    { key: 'title', label: 'Title', render: v => <span className="font-bold text-gray-800">{v}</span> },
    { key: 'category', label: 'Category', render: v => <span className="badge badge-success">{v}</span> },
    { key: 'amount', label: 'Amount', render: v => <span className="font-black text-emerald-600">{fc(v)}</span> },
    { key: 'date', label: 'Date', render: v => fd(v) },
    { key: 'notes', label: 'Notes', render: v => <span className="text-gray-400 text-xs">{v || '-'}</span> },
    { key: 'id', label: '', render: v => <button onClick={() => setConfirm(v)} className="btn btn-danger btn-sm w-8 h-8 p-0 flex items-center justify-center"><Trash2 size={13} /></button> },
  ];

  return (
    <div>
      <PageHeader title="Income" subtitle="Track your income sources"
        action={<button onClick={() => { setForm(emptyInc); setModal(true); }} className="btn btn-primary"><Plus size={15} /> Add Income</button>} />
      <div className="grid grid-cols-2 gap-4 mb-5">
        <StatCard icon={TrendingUp} label="Total Income" value={fc(total)} color="success" />
        <StatCard icon={TrendingUp} label="Total Records" value={income.length} color="info" />
      </div>
      <div className="card">
        <Table columns={columns} data={income} loading={loading} emptyMsg="No income records" />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Income"
        footer={<><button onClick={() => setModal(false)} className="btn btn-outline">Cancel</button><button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Add Income'}</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Title *"><input className="form-input" value={form.title} onChange={e => f('title', e.target.value)} placeholder="Income title" /></FormField>
          <FormField label="Category">
            <select className="form-input" value={form.category} onChange={e => f('category', e.target.value)}>
              {INC_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Amount (Rs.) *"><input type="number" className="form-input" value={form.amount} onChange={e => f('amount', e.target.value)} placeholder="0" /></FormField>
          <div className="col-span-2"><FormField label="Notes"><textarea className="form-input" rows={2} value={form.notes} onChange={e => f('notes', e.target.value)} /></FormField></div>
        </div>
      </Modal>
      <Confirm open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => handleDelete(confirm)} title="Delete Income" message="Are you sure?" />
    </div>
  );
}
