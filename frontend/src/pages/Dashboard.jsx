import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, AlertTriangle, Wallet } from 'lucide-react';
import api from '../utils/api';
import { fc, fd } from '../utils/format';
import { StatCard } from '../components/ui';

const COLORS = ['#ff9f43', '#28c76f', '#00cfe8', '#7367f0', '#ea5455'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full animate-spin mx-auto mb-3" style={{ border: '3px solid #e5e7eb', borderTopColor: '#ff9f43' }} />
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  const paymentData = Object.entries(data.paymentBreakdown || {}).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Sales Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Today's Revenue</p>
          <p className="text-2xl font-black text-primary">{fc(data.todayRevenue)}</p>
          <p className="text-xs text-emerald-600 font-bold">{data.todayOrders} orders today</p>
        </div>
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={DollarSign} label="Total Revenue" value={fc(data.totalRevenue)} change="12.5% this month" changeType="up" color="primary" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={data.totalOrders} change={`${data.todayOrders} today`} changeType="up" color="success" />
        <StatCard icon={Users} label="Customers" value={data.totalCustomers} color="info" />
        <StatCard icon={Package} label="Products" value={data.totalProducts} change={`${data.lowStockItems} low stock`} changeType={data.lowStockItems > 0 ? 'down' : 'up'} color={data.lowStockItems > 0 ? 'danger' : 'success'} />
      </div>

      {/* Stat Cards Row 2 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={TrendingUp} label="Net Profit" value={fc(data.netProfit)} color="success" />
        <StatCard icon={TrendingDown} label="Total Expenses" value={fc(data.totalExpenses)} color="danger" />
        <StatCard icon={Wallet} label="Gross Profit" value={fc(data.totalProfit)} color="purple" />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={data.lowStockItems} changeType="down" color="warning" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Revenue Chart */}
        <div className="card col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-black text-gray-800">Revenue Overview</h3>
            <span className="text-xs text-gray-400">Last 12 months</span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.monthly} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => fc(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', fontSize: 13 }} />
                <Bar dataKey="revenue" fill="#ff9f43" radius={[6, 6, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-black text-gray-800">Payment Methods</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={v => fc(v)} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {paymentData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-xs font-bold text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-xs font-black text-gray-800">{fc(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-black text-gray-800">Top Selling Products</h3>
          </div>
          <div className="p-5 space-y-4">
            {data.topProducts.map((p, i) => (
              <div key={p.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: COLORS[i] }}>{i+1}</span>
                    {p.name}
                  </span>
                  <span className="text-sm font-black text-gray-800">{fc(p.revenue)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((p.revenue / data.topProducts[0].revenue) * 100)}%`, background: COLORS[i] }} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{p.qty} units sold</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-black text-gray-800">Recent Sales</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentSales.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/10 to-orange-100 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                  {s.customerName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{s.customerName}</p>
                  <p className="text-xs text-gray-400">{s.invoiceNo} · {fd(s.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-800">{fc(s.total)}</p>
                  <span className={`badge text-[10px] ${s.status === 'paid' ? 'badge-success' : s.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
