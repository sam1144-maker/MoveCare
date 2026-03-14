import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, Activity, AlertCircle, Eye, EyeOff, HeartPulse, Shield, Bell } from 'lucide-react';

type Role = 'patient' | 'doctor' | 'admin';
type Tab = 'login' | 'register';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialTab = (searchParams.get('tab') as Tab) || 'login';
  const initialRole = (searchParams.get('role') as Role) || 'patient';

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [activeRole, setActiveRole] = useState<Role>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setActiveRole(initialRole);
  }, [initialTab, initialRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      if (activeTab === 'register') {
        const response = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, password, role: activeRole }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');

        localStorage.setItem('movecare_token', data.token);
        localStorage.setItem('movecare_refresh_token', data.refreshToken);
        localStorage.setItem('movecare_role', data.user.role);
        navigate('/dashboard');
      } else {
        const response = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');

        localStorage.setItem('movecare_token', data.token);
        localStorage.setItem('movecare_refresh_token', data.refreshToken);
        localStorage.setItem('movecare_role', data.user.role);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('http://localhost:5001/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google Authentication Failed');

      localStorage.setItem('movecare_token', data.token);
      localStorage.setItem('movecare_refresh_token', data.refreshToken);
      localStorage.setItem('movecare_role', data.user.role);
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Google network error');
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = () => {
    const next = activeTab === 'login' ? 'register' : 'login';
    setActiveTab(next);
    setAuthError(null);
    navigate(`/login?tab=${next}&role=${activeRole}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex w-full">

      {/* ──── LEFT PANEL ──── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-slate-950 flex-col justify-between p-10 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />
        <div className="absolute top-16 right-16 w-48 h-48 bg-emerald-400 rounded-full blur-[100px] opacity-10 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <Link to="/" className="text-xl font-extrabold text-white tracking-tight">MoveCare</Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 my-auto py-8">
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
            {activeRole === 'patient' && 'Your health,\nmonitored 24/7.'}
            {activeRole === 'doctor' && 'Your patients,\nalways in sight.'}
            {activeRole === 'admin' && 'The platform,\nunder control.'}
          </h2>
          <p className="text-slate-400 text-base mb-10 max-w-sm leading-relaxed">
            {activeRole === 'patient' && 'Real-time vitals, AI chatbot, WhatsApp alerts to your caregiver — all from one dashboard.'}
            {activeRole === 'doctor' && 'Live patient grid, AI-powered records, escalation alerts — everything you need for remote care.'}
            {activeRole === 'admin' && 'Manage users, monitor platform health, and ensure compliance across the system.'}
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {activeRole === 'patient' && [
              { icon: HeartPulse, text: 'Live vitals — HR, SpO₂, temperature' },
              { icon: Bell, text: 'WhatsApp alerts to your caregiver' },
              { icon: Shield, text: 'AI-powered health records & chatbot' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                {f.text}
              </div>
            ))}
            {activeRole === 'doctor' && [
              { icon: Activity, text: 'Real-time patient monitoring grid' },
              { icon: Bell, text: 'Automated escalation chain' },
              { icon: Shield, text: 'View all patient records & trends' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                {f.text}
              </div>
            ))}
            {activeRole === 'admin' && [
              { icon: User, text: 'User role management' },
              { icon: Activity, text: 'Platform-wide analytics' },
              { icon: Shield, text: 'Compliance oversight' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs text-slate-600">
          © {new Date().getFullYear()} MoveCare. All rights reserved.
        </div>
      </div>

      {/* ──── RIGHT PANEL ──── */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center bg-white relative">

        {/* Mobile header */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-5 flex items-center gap-2 z-10">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-white" />
          </div>
          <Link to="/" className="text-lg font-extrabold text-slate-900 tracking-tight">MoveCare</Link>
        </div>

        <div className="w-full max-w-[420px] mx-auto px-6 py-24 lg:py-12">

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'login' ? 'Enter your credentials to continue.' : 'Fill in the details to get started.'}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            {(['patient', 'doctor', 'admin'] as Role[]).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                  activeRole === role
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {role === 'doctor' ? 'Doctor' : role}
              </button>
            ))}
          </div>

          {/* Error */}
          {authError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 flex items-center text-sm font-medium mb-5">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="Full Name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  placeholder="Enter Email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  placeholder="Enter Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : activeTab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-slate-400 font-medium">or</span>
            </div>
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setAuthError('Google login popup closed or failed')}
              useOneTap
              theme="outline"
              shape="pill"
              text={activeTab === 'login' ? 'signin_with' : 'signup_with'}
            />
          </div>

          {/* Switch */}
          <p className="text-center text-sm text-slate-500 mt-8">
            {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={switchTab} className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              {activeTab === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
