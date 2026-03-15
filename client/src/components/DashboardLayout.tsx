import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, LayoutDashboard, MessageSquare,
  FileText, LogOut, Activity, Users, ShieldCheck, Settings
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAV_BY_ROLE: Record<string, { name: string; path: string; icon: any }[]> = {
  patient: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Teleconsultation', path: '/teleconsultation', icon: Activity },
    // { name: 'Exercise Games', path: '/exercise-games', icon: Gamepad2 },
    { name: 'Chatbot', path: '/chatbot', icon: MessageSquare },
    { name: 'Records', path: '/records', icon: FileText },
  ],
  doctor: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Teleconsultation', path: '/teleconsultation', icon: Activity },
    { name: 'Chatbot', path: '/chatbot', icon: MessageSquare },
    { name: 'Records', path: '/records', icon: FileText },
    { name: 'Patients', path: '/patients', icon: Users },
  ],
  admin: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Teleconsultation', path: '/teleconsultation', icon: Activity },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Roles & Permissions', path: '/admin/roles', icon: ShieldCheck },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Admin',
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('movecare_role') || 'patient';

  const handleLogout = () => {
    localStorage.removeItem('movecare_token');
    localStorage.removeItem('movecare_refresh_token');
    localStorage.removeItem('movecare_role');
    navigate('/');
  };

  const navLinks = NAV_BY_ROLE[role] || NAV_BY_ROLE.patient;
  const roleLabel = ROLE_LABEL[role] || 'Patient';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-[260px] bg-slate-950 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-5">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">MoveCare</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Badge */}
          <div className="px-5 pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/5 text-slate-400 border border-white/10 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {roleLabel}
            </div>
          </div>

          <div className="mx-5 border-t border-white/5" />

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                    }
                  `}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium text-slate-600 rounded-xl
                hover:bg-white/5 hover:text-red-400 transition-all duration-200"
            >
              <LogOut className="w-[18px] h-[18px]" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 lg:hidden sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-slate-900">MoveCare</span>
            </div>
            <div className="w-9" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
