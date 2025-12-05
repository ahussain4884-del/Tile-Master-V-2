import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, ShieldCheck, CheckCircle, KeyRound, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const ForgotPasswordPage: React.FC = () => {
  const { users } = useStore();
  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState('');
  const [method, setMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Simulated backend verification
  const handleVerifyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === identity || u.mobile === identity || u.username === identity);
    if (user) {
      setError('');
      setStep(2);
    } else {
      setError('Account not found with these details.');
    }
  };

  const handleSendCode = () => {
     // Simulate sending code
     setSuccessMsg(`Simulation: Verification code sent to your ${method === 'EMAIL' ? 'Email' : 'Phone'}.`);
     
     // In a real app, this would call an API. Here we mock the delay.
     setTimeout(() => {
        alert(`[DEMO] Your verification code is: 123456`);
        setStep(3);
        setSuccessMsg('');
     }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
     e.preventDefault();
     if (otp === '123456') { // Mock OTP
        setStep(4);
     } else {
        setError('Invalid code. Try 123456');
     }
  };

  const handleResetPassword = (e: React.FormEvent) => {
     e.preventDefault();
     if (newPassword.length < 8) { setError('Password must be at least 8 chars'); return; }
     if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
     
     // Logic to update password in store would go here (exposed via context in real app)
     // For demo, we just show success
     setStep(5);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
       <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4">
          
          {step < 5 && (
             <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 text-sm font-medium transition-colors">
                <ArrowLeft size={16} /> Back to Login
             </Link>
          )}

          {/* Progress Bar */}
          {step < 5 && (
            <div className="flex gap-2 mb-8">
               {[1,2,3,4].map(s => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
               ))}
            </div>
          )}

          {step === 1 && (
             <form onSubmit={handleVerifyIdentity} className="space-y-6">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Forgot Password?</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your username, email, or mobile number to search for your account.</p>
                </div>
                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex gap-2 items-center"><AlertTriangle size={16}/> {error}</div>}
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Identity</label>
                   <input 
                     className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                     placeholder="Username / Email / Mobile"
                     value={identity}
                     onChange={e => setIdentity(e.target.value)}
                     required
                   />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Find Account</button>
             </form>
          )}

          {step === 2 && (
             <div className="space-y-6">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Select Method</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">Where should we send the reset code?</p>
                </div>
                {successMsg && <div className="text-green-600 bg-green-50 p-3 rounded-lg text-sm">{successMsg}</div>}
                <div className="space-y-3">
                   <button onClick={() => { setMethod('EMAIL'); handleSendCode(); }} className="w-full p-4 border rounded-xl flex items-center gap-4 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all group text-left">
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-white"><Mail size={24} /></div>
                      <div>
                         <div className="font-bold text-slate-800 dark:text-white">Send via Email</div>
                         <div className="text-xs text-slate-500">To registered email address</div>
                      </div>
                   </button>
                   <button onClick={() => { setMethod('PHONE'); handleSendCode(); }} className="w-full p-4 border rounded-xl flex items-center gap-4 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all group text-left">
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-white"><Phone size={24} /></div>
                      <div>
                         <div className="font-bold text-slate-800 dark:text-white">Send via SMS/WhatsApp</div>
                         <div className="text-xs text-slate-500">To registered mobile number</div>
                      </div>
                   </button>
                </div>
             </div>
          )}

          {step === 3 && (
             <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Enter Code</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">We sent a 6-digit code to your {method === 'EMAIL' ? 'email' : 'phone'}.</p>
                </div>
                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex gap-2 items-center"><AlertTriangle size={16}/> {error}</div>}
                <div className="text-center bg-yellow-50 text-yellow-700 p-2 rounded text-xs mb-4">
                   Demo Mode: Use code <strong>123456</strong>
                </div>
                <div>
                   <input 
                     className="w-full p-4 text-center text-2xl tracking-[1em] font-mono border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                     placeholder="000000"
                     maxLength={6}
                     value={otp}
                     onChange={e => setOtp(e.target.value)}
                   />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Verify Code</button>
                <p className="text-center text-sm text-slate-500">Didn't receive it? <button type="button" onClick={handleSendCode} className="text-indigo-600 font-bold">Resend</button></p>
             </form>
          )}

          {step === 4 && (
             <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Reset Password</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">Create a strong password for your account.</p>
                </div>
                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex gap-2 items-center"><AlertTriangle size={16}/> {error}</div>}
                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                      <input type="password" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:text-white" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                      <input type="password" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:text-white" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                   </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-2">
                   <ShieldCheck size={20} className="text-blue-600 shrink-0" />
                   <p className="text-xs text-blue-700 dark:text-blue-300">Use at least 8 characters, one uppercase, one number, and one symbol.</p>
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Update Password</button>
             </form>
          )}

          {step === 5 && (
             <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                   <CheckCircle size={40} />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Password Reset!</h2>
                   <p className="text-slate-500 dark:text-slate-400">Your password has been updated successfully. You can now login with your new credentials.</p>
                </div>
                <Link to="/login" className="block w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Back to Login</Link>
             </div>
          )}
       </div>
    </div>
  );
};

export default ForgotPasswordPage;