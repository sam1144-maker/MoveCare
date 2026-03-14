import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, ArrowRight, Activity, Cpu, Shield, ArrowLeft, Building2, CheckCircle2, AlertCircle, ShieldCheck, HeartPulse, 
Eye, EyeOff } from 'lucide-react';

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

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync state with URL params if they change
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
        const payload = {
          fullName,
          email,
          password,
          role: activeRole,
        };
        
        const response = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        
        localStorage.setItem('movecare_token', data.token);
        localStorage.setItem('movecare_role', data.user.role);
        
        setIsLoading(false);
        navigate('/dashboard');

      } else {
        const payload = {
          email,
          password,
        };
        
        const response = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        localStorage.setItem('movecare_token', data.token);
        localStorage.setItem('movecare_role', data.user.role);
        
        setIsLoading(false);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setIsLoading(false);
      setAuthError(err.message || 'Authentication error');
      console.error(err);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('http://localhost:5001/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google Authentication Failed');
      
      localStorage.setItem('movecare_token', data.token);
      localStorage.setItem('movecare_role', data.user.role);
      
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setAuthError(err.message || 'Google network error');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex w-full">
      
      {/* LEFT PANEL - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-between p-12 overflow-hidden overflow-y-auto">
        {/* Background Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-primary-900/40 to-slate-900 pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-600 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-secondary-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 flex items-center">
          <Link to="/" className="text-3xl font-extrabold text-white tracking-tight flex items-center">
            <Activity className="w-8 h-8 text-primary-400 mr-2" />
            MoveCare
          </Link>
        </div>

        <div className="relative z-10 my-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl max-w-lg shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              {activeRole === 'patient' ? 'Get Back to Your Best Self.' : activeRole === 'admin' ? 'Manage the Platform.' : 'Transform Remote Care.'}
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              {activeRole === 'patient' 
                ? 'Join thousands of patients who have successfully recovered using our AI-monitored remote health platform.'
                : activeRole === 'admin' 
                  ? 'Oversee the MoveCare platform, manage users, and ensure compliance.'
                  : 'Empower your practice with actionable AI insights, automated charting, and continuous patient monitoring.'}
            </p>

            {/* Feature lists based on role */}
            <ul className="space-y-4">
              {activeRole === 'patient' && (
                <>
                  <li className="flex items-center text-slate-200">
                    <ShieldCheck className="w-5 h-5 text-primary-400 mr-3" /> Secure, private messaging
                  </li>
                  <li className="flex items-center text-slate-200">
                    <Activity className="w-5 h-5 text-primary-400 mr-3" /> Daily progress tracking
                  </li>
                  <li className="flex items-center text-slate-200">
                    <HeartPulse className="w-5 h-5 text-primary-400 mr-3" /> Connect with top experts
                  </li>
                </>
              )}
              {activeRole === 'doctor' && (
                <>
                  <li className="flex items-center text-slate-200">
                    <ShieldCheck className="w-5 h-5 text-primary-400 mr-3" /> HIPAA-Compliant architecture
                  </li>
                  <li className="flex items-center text-slate-200">
                    <Activity className="w-5 h-5 text-primary-400 mr-3" /> AI anomaly detection
                  </li>
                  <li className="flex items-center text-slate-200">
                    <HeartPulse className="w-5 h-5 text-primary-400 mr-3" /> Automated patient summaries
                  </li>
                </>
              )}
              {activeRole === 'admin' && (
                <>
                  <li className="flex items-center text-slate-200">
                    <ShieldCheck className="w-5 h-5 text-primary-400 mr-3" /> Platform-wide analytics
                  </li>
                  <li className="flex items-center text-slate-200">
                    <User className="w-5 h-5 text-primary-400 mr-3" /> User role management
                  </li>
                  <li className="flex items-center text-slate-200">
                    <Eye className="w-5 h-5 text-primary-400 mr-3" /> Compliance oversight
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="relative z-10 flex space-x-6 text-slate-400 text-sm">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>

      {/* RIGHT PANEL - Forms */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center bg-slate-50 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-50 via-white to-slate-50 opacity-40 -z-10"></div>
        
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
           <Link to="/" className="text-2xl font-extrabold text-primary-600 tracking-tight flex items-center">
            <Activity className="w-6 h-6 mr-2" />
            MoveCare
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto px-6 py-24 sm:py-32 lg:p-12 relative z-10 overflow-y-auto max-h-[100vh]">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-slate-500">
              {activeTab === 'login' ? 'Please enter your details to sign in.' : 'Fill in the forms to get started.'}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setActiveRole('patient')}
              className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-lg transition-all ${
                activeRole === 'patient' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('doctor')}
              className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-lg transition-all ${
                activeRole === 'doctor' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Doctor/Specialist
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('admin')}
              className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-lg transition-all ${
                activeRole === 'admin' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Tab Form Container */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Register specific fields */}
              {activeTab === 'register' && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        required 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all bg-slate-50/50" 
                        placeholder="John Doe" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shared Fields */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all bg-slate-50/50" 
                      placeholder="you@email.com" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all bg-slate-50/50" 
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  activeTab === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setAuthError('Google login popup closed or failed')}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  text={activeTab === 'login' ? 'signin_with' : 'signup_with'}
                />
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  onClick={() => {
                    setActiveTab(activeTab === 'login' ? 'register' : 'login');
                    navigate(`/login?tab=${activeTab === 'login' ? 'register' : 'login'}&role=${activeRole}`, { replace: true });
                  }} 
                  className="font-bold text-primary-600 hover:text-primary-500 transition-colors"
                >
                  {activeTab === 'login' ? 'Register now' : 'Sign in instead'}
                </button>
              </p>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 flex items-center justify-center text-sm font-medium animate-fade-in mt-4">
                <AlertCircle className="w-4 h-4 mr-2" />
                {authError}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
