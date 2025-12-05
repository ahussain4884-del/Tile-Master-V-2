import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, invoiceSettings } = useStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for effect
    setTimeout(async () => {
       const result = await login(username, password);
       if (result.success) {
          // Explicitly navigate to dashboard to prevent "hanging" UI
          navigate('/'); 
       } else {
          setError(result.message || 'Login failed');
          setLoading(false);
       }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
       <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500">
          
          {/* Left Side - Branding */}
          <div className="md:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 p-12 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1631631480669-535cc43f2327?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] opacity-10 bg-cover bg-center"></div>
             <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/20">
                   <span className="text-3xl font-bold text-white">T</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{invoiceSettings.shopName || 'TileMaster POS'}</h1>
                <p className="text-slate-400 text-lg">Premium Inventory & Sales Management</p>
             </div>
             <div className="relative z-10 mt-12">
                <div className="flex items-center gap-3 text-slate-300 text-sm mb-2">
                   <ShieldCheck size={16} className="text-emerald-400" /> Secure & Encrypted
                </div>
                <p className="text-slate-500 text-xs">v2.5.0 • Powered By Aftab Hussain</p>
             </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="md:w-1/2 p-12 flex flex-col justify-center">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back</h2>
                <p className="text-slate-500 dark:text-slate-400">Please sign in to your account</p>
             </div>

             {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-300 text-sm animate-in slide-in-from-top-2">
                   <AlertCircle size={18} /> {error}
                </div>
             )}

             <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username or Email</label>
                   <div className="relative">
                      <User className="absolute left-3 top-3 text-slate-400" size={20} />
                      <input 
                        type="text" 
                        className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
                        placeholder="Enter your username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                      <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">Forgot Password?</Link>
                   </div>
                   <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        className="w-full pl-10 pr-10 p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                         {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   {loading ? 'Signing in...' : 'Sign In'}
                   {!loading && <ArrowRight size={20} />}
                </button>
             </form>

             <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 text-center">
                <p className="text-xs text-slate-400">
                   Default Logins: <strong>admin / admin123</strong> • <strong>manager / manager123</strong>
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default LoginPage;