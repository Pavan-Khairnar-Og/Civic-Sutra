import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ListTodo, 
  Map as MapIcon, 
  Settings, 
  LogOut, 
  TrendingUp, 
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';

const GovSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'All Issues', path: '/admin/issues', icon: ListTodo }, // Adjust to match real routes later if needed
    { name: 'Map View', path: '/admin/map', icon: MapIcon },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  const toggleTheme = () => {
    const html = document.documentElement;
    const currentlyDark = html.classList.contains('dark');
    if (currentlyDark) {
      html.classList.remove('dark');
      html.removeAttribute('data-theme');
      localStorage.setItem('civicsutra_theme', 'light');
    } else {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('civicsutra_theme', 'dark');
    }
    window.dispatchEvent(new Event('themechange'));
  };

  return (
    <aside className="w-[240px] bg-[#1a2e24] flex flex-col h-full text-white/90">
      {/* Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-[#DA532D]" size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">CivicSutra</span>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-11">Government Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 bg-black/10">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase">System Theme</span>
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-[#DA532D]">
            {user?.name?.charAt(0) || 'G'}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-bold truncate">{user?.name || 'Gov Official'}</div>
            <div className="text-[10px] text-gray-500 truncate">{user?.email || 'verified_gov'}</div>
          </div>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="p-1.5 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default GovSidebar;
