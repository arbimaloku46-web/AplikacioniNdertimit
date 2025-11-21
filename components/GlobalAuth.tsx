import React, { useState } from 'react';
import { Button } from './Button';
import { loginUser, registerUser } from '../services/authService';

interface GlobalAuthProps {
  onLogin: (userName: string) => void;
}

type AuthView = 'LOGIN' | 'SIGNUP_STEP_1' | 'SIGNUP_STEP_2';

export const GlobalAuth: React.FC<GlobalAuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await loginUser(name, password);
      onLogin(user.name);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length < 3 || password.length < 3) {
        setError('Please enter a valid mobile number and password.');
        return;
    }
    setError('');
    setView('SIGNUP_STEP_2');
  };

  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const user = await registerUser(mobile, password, name);
        // Show success message or auto login
        onLogin(user.name);
    } catch (err: any) {
        setError(err.message || 'Registration failed');
        // If mobile exists, maybe go back
        if (err.message.includes('mobile')) {
             setTimeout(() => setView('SIGNUP_STEP_1'), 2000);
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop" 
          alt="Construction Site" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-20 p-12 flex flex-col justify-between h-full text-white">
          <div>
            <div className="w-12 h-12 bg-amber-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] mb-6">
                <span className="font-display font-bold text-black text-2xl">N</span>
            </div>
            <h1 className="text-5xl font-display font-bold leading-tight mb-4">
              Ndërtimi <br/>
              <span className="text-amber-500">Client Portal</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              Exclusive access to construction progress. 
              <br/>Secure. Real-time. Transparent.
            </p>
          </div>
          <div>
             <div className="glass-panel inline-block px-4 py-2 rounded-lg border border-white/10">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Admin Contact</p>
                <p className="text-white font-mono text-sm">arbimaloku46@gmail.com</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="lg:hidden flex items-center gap-3 mb-8">
             <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <span className="font-display font-bold text-black text-2xl">N</span>
            </div>
            <span className="font-display font-bold text-white text-2xl">NDËRTIMI</span>
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {view === 'LOGIN' && 'Welcome Back'}
              {view === 'SIGNUP_STEP_1' && 'Create Account'}
              {view === 'SIGNUP_STEP_2' && 'One Last Step'}
            </h2>
            <p className="text-slate-400">
              {view === 'LOGIN' && 'Please enter your name and password.'}
              {view === 'SIGNUP_STEP_1' && 'Enter your mobile number to start.'}
              {view === 'SIGNUP_STEP_2' && 'Please verify your full name.'}
            </p>
          </div>

          {/* --- LOGIN FORM --- */}
          {view === 'LOGIN' && (
             <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Full Name</label>
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        placeholder="e.g. Arbi Maloku"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Password</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        placeholder="••••••••"
                    />
                </div>

                {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}

                <Button type="submit" className="w-full !text-base !py-3.5" isLoading={isLoading}>
                    Sign In
                </Button>

                <div className="text-center">
                    <p className="text-slate-400 text-sm">
                        New Client?{' '}
                        <button type="button" onClick={() => {
                            setError('');
                            setView('SIGNUP_STEP_1');
                        }} className="text-amber-500 font-medium hover:text-amber-400 transition-colors">
                            Register Mobile
                        </button>
                    </p>
                </div>
             </form>
          )}

          {/* --- SIGN UP STEP 1 (Mobile + Password) --- */}
          {view === 'SIGNUP_STEP_1' && (
             <form onSubmit={handleSignupStep1} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Mobile Number</label>
                    <input 
                        type="tel" 
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                        placeholder="+355 69 XX XX XXX"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Create Password</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        placeholder="••••••••"
                    />
                </div>

                {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}

                <Button type="submit" className="w-full !text-base !py-3.5">
                    Next Step &rarr;
                </Button>

                <div className="text-center">
                    <button type="button" onClick={() => {
                        setError('');
                        setView('LOGIN');
                    }} className="text-slate-500 text-sm hover:text-white transition-colors">
                        &larr; Back to Login
                    </button>
                </div>
             </form>
          )}

           {/* --- SIGN UP STEP 2 (Name) --- */}
           {view === 'SIGNUP_STEP_2' && (
             <form onSubmit={handleSignupStep2} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 mb-4">
                    <p className="text-amber-500 text-sm">
                        Almost done! Please provide your full name so we can authorize your access.
                    </p>
                </div>
                
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Full Name</label>
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        placeholder="e.g. Arbi Maloku"
                        autoFocus
                    />
                    <p className="text-xs text-slate-600 mt-2">
                        This name will be used for future logins.
                    </p>
                </div>

                {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}

                <Button type="submit" className="w-full !text-base !py-3.5" isLoading={isLoading}>
                    Complete Registration
                </Button>

                 <div className="text-center">
                    <button type="button" onClick={() => setView('SIGNUP_STEP_1')} className="text-slate-500 text-sm hover:text-white transition-colors">
                        &larr; Back
                    </button>
                </div>
             </form>
          )}

        </div>
      </div>
    </div>
  );
};