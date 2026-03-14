import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600 tracking-tight">MoveCare</Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <a href="#for-doctors" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">For Doctors</a>
            <a href="#for-patients" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">For Patients</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">How it Works</a>
            <Link to="/chatbot" className="text-slate-600 hover:text-primary-600 font-medium transition-colors flex items-center">
              <Bot className="w-4 h-4 mr-1.5" />
              AI Assistant
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Login</Link>
            <Link to="/login?tab=register" className="px-4 py-2 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
