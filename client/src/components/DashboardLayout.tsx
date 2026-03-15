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
    localStorage.removeItem('movecare_role');
    navigate('/');
  };

  const navLinks = NAV_BY_ROLE[role] || NAV_BY_ROLE.patient;
  const roleLabel = ROLE_LABEL[role] || 'Patient';

  return (
    <div className="flex h-screen bg-green-50/50 overflow-hidden">
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-green-200 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 shadow-xl lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200 transition-transform group-hover:scale-105">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">MoveCare</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-green-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Badge */}
          <div className="px-6 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {roleLabel} Portal
            </div>
          </div>

          <div className="mx-6 border-t border-green-100" />

          {/* Nav Links */}
          <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-green-200' 
                      : 'text-gray-600 hover:bg-green-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-green-100">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-500 rounded-xl 
                hover:bg-green-50 hover:text-green-700 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-green-200/50 lg:hidden sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">MoveCare</span>
            </div>
            <div className="w-9" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-green-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}
