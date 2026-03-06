import { X, ChevronUp, ChevronDown } from 'lucide-react';

// ── MODAL ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-[modalIn_0.25s_ease]`}
        style={{ animation: 'modalIn 0.25s ease' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-800">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, change, changeType = 'up', color = 'primary' }) {
  const colors = {
    primary: 'bg-orange-50 text-primary',
    success: 'bg-emerald-50 text-emerald-600',
    danger: 'bg-red-50 text-red-500',
    info: 'bg-cyan-50 text-cyan-600',
    purple: 'bg-violet-50 text-violet-600',
    warning: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="stat-card">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-800">{value}</p>
        <p className="text-xs font-bold text-gray-400 mt-0.5">{label}</p>
        {change && (
          <p className={`text-xs font-bold mt-1 flex items-center gap-0.5 ${changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            {changeType === 'up' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {change}
          </p>
        )}
      </div>
    </div>
  );
}

// ── PAGE HEADER ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-xl font-black text-gray-800">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── SEARCH BAR ────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
      <svg className="text-gray-400 w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      <input className="bg-transparent border-none outline-none text-sm w-full" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

// ── TABLE ─────────────────────────────────────────────────────────────────────
export function Table({ columns, data, loading, emptyMsg = 'No data found' }) {
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin" style={{ border: '3px solid #e5e7eb', borderTopColor: '#ff9f43' }} />
    </div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-100">
            {columns.map(col => <th key={col.key} className="table-header">{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">{emptyMsg}</td></tr>
          ) : data.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-gray-50/50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="table-cell">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── FORM ROW ──────────────────────────────────────────────────────────────────
export function FormRow({ children, cols = 2 }) {
  return <div className={`grid grid-cols-${cols} gap-4 mb-4`}>{children}</div>;
}
export function FormField({ label, children }) {
  return <div><label className="block text-xs font-black text-gray-700 mb-1.5">{label}</label>{children}</div>;
}

// ── CONFIRM DIALOG ────────────────────────────────────────────────────────────
export function Confirm({ open, onClose, onConfirm, title, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="font-black text-gray-800 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn btn-outline btn-sm">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-danger btn-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
export function Empty({ icon, message, action }) {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">{icon}</p>
      <p className="text-gray-400 font-semibold text-sm mb-4">{message}</p>
      {action}
    </div>
  );
}
