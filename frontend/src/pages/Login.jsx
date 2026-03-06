import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: 'admin@smartpos.com', password: 'admin123' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) { navigate('/'); toast.success('Welcome back!'); }
    else toast.error(res.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-[#252540] to-sidebar flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-orange-200">🛒</div>
          <h1 className="text-2xl font-black text-gray-800">SmartPOS</h1>
          <p className="text-gray-400 text-sm mt-1">Point of Sale Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="form-input" placeholder="admin@smartpos.com" required />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="form-input" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="btn btn-primary w-full justify-center py-3 text-base mt-2 rounded-xl">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🔐 Sign In'}
          </button>
        </form>

        <div className="mt-5 p-3 bg-orange-50 rounded-xl text-center">
          <p className="text-xs text-orange-700 font-bold">Demo Credentials</p>
          <p className="text-xs text-orange-600 mt-1">admin@smartpos.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
