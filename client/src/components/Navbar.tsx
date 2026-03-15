import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="absolute top-0 z-50 w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <Link to="/" className="text-2xl font-extrabold text-slate-900 tracking-tight">MoveCare</Link>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/login" className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors">Login</Link>
            <Link to="/login?tab=register" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:from-emerald-700 hover:to-green-700 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
