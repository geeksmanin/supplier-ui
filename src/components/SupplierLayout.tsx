import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, LogOut, User, Home, Package, Menu, X } from 'lucide-react';
import { useMediaQuery } from '@geeksman/core-ui';

export const SupplierLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('Supplier User');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setUserName(u.display_name || u.first_name || 'Supplier User');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <Home size={18} />,
    },
    {
      id: 'products',
      label: 'Products Catalogue',
      path: '/products',
      icon: <Package size={18} />,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <div
        className={`${
          isDesktop
            ? sidebarOpen ? 'w-64' : 'w-20'
            : sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static inset-y-0 left-0 z-30 bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between`}
      >
        <div>
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-2">
              <img src="/geeksman-side-logo.png" alt="Geeksman Logo" className="h-8 object-contain" />
              {sidebarOpen && <span className="font-extrabold text-sm tracking-wider text-blue-400">SUPPLIER</span>}
            </div>
            {!isDesktop && (
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    if (!isDesktop) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          {sidebarOpen && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-200">{userName}</p>
                <p className="text-xs text-slate-500 truncate">Supplier Representative</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-bold text-slate-200 hidden sm:block">Supplier Management Center</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">Supplier Portal Online</span>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
};
