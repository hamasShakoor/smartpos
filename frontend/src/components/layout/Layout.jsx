import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Truck, Receipt,
  BarChart3, AlertTriangle, CreditCard, TrendingUp, TrendingDown,
  LogOut, Menu, Bell, Search, ChevronRight, Wallet, Settings, BookOpen
} from 'lucide-react';

const navSections = [
  { label: 'Main', items: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pos', icon: ShoppingCart, label: 'POS Terminal', badge: 'Live' },
  ]},
  { label: 'Inventory', items: [
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/categories', icon: BookOpen, label: 'Categories' },
    { to: '/low-stock', icon: AlertTriangle, label: 'Low Stock' },
  ]},
  { label: 'Sales', items: [
    { to: '/sales', icon: Receipt, label: 'Sales Orders' },
    { to: '/customers', icon: Users, label: 'Customers' },
  ]},
  { label: 'Purchases', items: [
    { to: '/purchases', icon: Truck, label: 'Purchases' },
    { to: '/suppliers', icon: Wallet, label: 'Suppliers' },
  ]},
  { label: 'Accounts', items: [
    { to: '/accounts', icon: CreditCard, label: 'Bank Accounts' },
    { to: '/income', icon: TrendingUp, label: 'Income' },
    { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
  ]},
  { label: 'Reports', items: [
    { to: '/reports', icon: BarChart3, label: 'Sales Report' },
    { to: '/reports/profit-loss', icon: TrendingUp, label: 'Profit & Loss' },
    { to: '/reports/stock', icon: Package, label: 'Stock Report' },
  ]},
];

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* SIDEBAR */}
      <aside className={`${collapsed ? 'w-[68px]' : 'w-64'} bg-sidebar flex-shrink-0 flex flex-col transition-all duration-300 overflow-y-auto`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 min-h-[64px]">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0">🛒</div>
          {!collapsed && <span className="text-white font-black text-lg whitespace-nowrap">Smart<span className="text-primary">POS</span></span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2">
          {navSections.map(section => (
            <div key={section.label} className="mb-2">
              {!collapsed && <p className="text-white/25 text-[10px] font-black uppercase tracking-widest px-2 py-2">{section.label}</p>}
              {section.items.map(item => {
                const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
                return (
                  <Link key={item.to} to={item.to}
                    className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''} mb-0.5`}
                    title={collapsed ? item.label : ''}>
                    <item.icon size={16} className="flex-shrink-0" />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && item.badge && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/5 p-3">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-black truncate">{user?.name}</p>
                <p className="text-white/40 text-[10px]">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors" title="Logout">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center text-white/40 hover:text-red-400 transition-colors py-1" title="Logout">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center gap-3 px-5 flex-shrink-0 shadow-sm z-10">
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search size={14} className="text-gray-400" />
            <input className="bg-transparent border-none outline-none text-sm text-gray-600 w-full placeholder-gray-400" placeholder="Search..." />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-xl border border-gray-200 hover:border-primary hover:text-primary text-gray-500 transition-all">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 cursor-pointer hover:border-primary transition-all">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-black text-xs">
                {user?.name?.[0] || 'A'}
              </div>
              <div>
                <p className="text-xs font-black text-gray-800 leading-none">{user?.name}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
