
import React, { useState } from 'react';
import { Button } from './Button';
import { loginUser, registerUser } from '../services/authService';
import { Language, translations } from '../translations';
import { COUNTRIES } from '../constants';

interface GlobalAuthProps {
  onLogin: (userName: string, countryCode: string | undefined, rememberMe: boolean, isAdmin: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

type AuthTab = 'CLIENT' | 'ADMIN';
type AuthView = 'LOGIN' | 'SIGNUP';

const ADMIN_PASSWORD = 'Ndertimi2024';

// Helper to check password strength
const checkPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
  if (pass.length === 0) return { score: 0, label: '', color: 'bg-slate-700' };
  if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  
  const hasNumber = /\d/.test(pass);
  const hasSpecial = /[!@#$%^&*]/.test(pass);
  
  if (pass.length >= 8 && hasNumber && hasSpecial) return { score: 3, label: 'Strong', color: 'bg-green-500' };
  if (pass.length >= 6 && (hasNumber || hasSpecial)) return { score: 2, label: 'Good', color: 'bg-yellow-500' };
  
  return { score: 1, label: 'Fair', color: 'bg-orange-500' };
};

export const GlobalAuth: React.FC<GlobalAuthProps> = ({ onLogin, language, setLanguage }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('CLIENT');
  const [view, setView] = useState<AuthView>('LOGIN');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Form State
  const [mobile, setMobile] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default to Albania
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  // Admin Form State
  const [adminPassword, setAdminPassword] = useState('');

  // Translation Helper
  const text = translations[language];

  // Derived strength for visual feedback
  const strength = checkPasswordStrength(password);

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setView('LOGIN'); // Reset to login view when switching tabs
    setError('');
    setPassword('');
    setAdminPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const fullMobile = `${selectedCountry.dial_code}${mobile.trim()}`;
      
      const user = await loginUser(fullMobile, password);
      const countryToUse = user.countryCode || selectedCountry.code;
      
      onLogin(user.name, countryToUse, rememberMe, false);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
        if (adminPassword === ADMIN_PASSWORD) {
            onLogin('Administrator', 'AL', rememberMe, true);
        } else {
            setError('Invalid Admin Access Key');
            setIsLoading(false);
        }
    }, 600);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
    }

    if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
    }

    setIsLoading(true);

    try {
        const fullMobile = `${selectedCountry.dial_code}${mobile.trim()}`;

        await registerUser(fullMobile, password, name, selectedCountry.code);
        alert('Account created successfully! Please sign in.');
        setView('LOGIN');
        setPassword(''); 
        setConfirmPassword('');
    } catch (err: any) {
        setError(err.message || 'Registration failed');
    } finally {
        setIsLoading(false);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = COUNTRIES.find(c => c.code === e.target.value);
    if (country) setSelectedCountry(country);
  };

  return (
    <div className="min-h-screen w-full flex bg-brand-dark">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-brand-dark/90 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop" 
          alt="Construction Site" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-20 p-12 flex flex-col justify-between h-full text-white">
          <div>
            <div className="w-16 h-16 bg-white rounded flex items-center justify-center shadow-lg mb-6">
                <span className="font-display font-bold text-brand-blue text-3xl">N</span>
            </div>
            <h1 className="text-5xl font-display font-bold leading-tight mb-4 text-white">
              {text.appName} <br/>
              <span className="text-brand-blue">{text.welcomeTitle}</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              {text.welcomeSubtitle} 
              <br/>{text.secureRealtime}
            </p>
          </div>
          <div>
             <div className="glass-panel inline-block px-4 py-2 rounded-lg border border-brand-blue/30">
                <p className="text-xs text-brand-blue uppercase tracking-widest mb-1">{text.supportContact}</p>
                <p className="text-white font-mono text-sm">projekti@ndertimi.org</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 bg-brand-dark relative">
        
        {/* Language Toggle */}
        <div className="absolute top-6 right-6 flex items-center gap-2 z-30">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider hidden sm:inline">{text.selectLanguage}:</span>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button 
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'en' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:text-white'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLanguage('sq')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'sq' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:text-white'}`}
                >
                    SQ
                </button>
            </div>
        </div>

        <div className="w-full max-w-md space-y-8 mt-12 md:mt-0">
          
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
             <div className="w-10 h-10 bg-white rounded flex items-center justify-center shadow-lg">
                <span className="font-display font-bold text-brand-blue text-2xl">N</span>
            </div>
            <span className="font-display font-bold text-white text-2xl">{text.appName}</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="p-8">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-display font-bold text-white mb-2">
                        {activeTab === 'CLIENT' 
                            ? (view === 'LOGIN' ? text.loginTitle : text.signupTitle)
                            : text.adminTitle}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {activeTab === 'CLIENT'
                            ? (view === 'LOGIN' ? text.loginDesc : text.signupDesc)
                            : text.adminDesc}
                    </p>
                  </div>

                  {activeTab === 'CLIENT' && view === 'LOGIN' && (
                    <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in zoom-in duration-300">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{text.mobileLabel}</label>
                            <div className="flex gap-2">
                                <div className="relative w-[80px] shrink-0">
                                    <select 
                                        value={selectedCountry.code}
                                        onChange={handleCountryChange}
                                        className="w-full h-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-3 text-white appearance-none focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue text-sm cursor-pointer truncate pr-4"
                                    >
                                        {COUNTRIES.map(country => (
                                            <option key={country.code} value={country.code}>
                                                {country.flag} {country.dial_code}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none text-slate-500 bg-slate-950">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                <input 
                                    type="tel" 
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all font-mono"
                                    placeholder="Mobile Number"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{text.passwordLabel}</label>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-blue focus:ring-brand-blue focus:ring-offset-0 accent-brand-blue cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer hover:text-slate-300 select-none">
                                {text.rememberMe}
                            </label>
                        </div>

                        {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}

                        <Button type="submit" className="w-full !text-base !py-3" isLoading={isLoading}>
                            {text.signInBtn}
                        </Button>

                        <div className="text-center pt-2 border-t border-slate-800/50 mt-4">
                            <p className="text-slate-400 text-sm">
                                {text.firstTime}{' '}
                                <button type="button" onClick={() => setView('SIGNUP')} className="text-brand-blue font-medium hover:text-brand-blue/80 transition-colors">
                                    {text.createAccount}
                                </button>
                            </p>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button 
                                type="button"
                                onClick={() => switchTab('ADMIN')}
                                className="text-slate-800 text-[10px] opacity-30 hover:opacity-100 hover:text-slate-500 transition-all uppercase tracking-widest font-bold"
                            >
                                Admin
                            </button>
                        </div>
                    </form>
                  )}

                  {activeTab === 'CLIENT' && view === 'SIGNUP' && (
                    <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in zoom-in duration-300">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{text.nameLabel}</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                                placeholder="Name Surname"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{text.mobileLabel}</label>
                            <div className="flex gap-2">
                                <div className="relative w-[80px] shrink-0">
                                    <select 
                                        value={selectedCountry.code}
                                        onChange={handleCountryChange}
                                        className="w-full h-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-3 text-white appearance-none focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue text-sm cursor-pointer truncate pr-4"
                                    >
                                        {COUNTRIES.map(country => (
                                            <option key={country.code} value={country.code}>
                                                {country.flag} {country.dial_code}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none text-slate-500 bg-slate-950">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                <input 
                                    type="tel" 
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all font-mono"
                                    placeholder="Mobile Number"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{text.passwordLabel}</label>
                                <input 
                                    type="password" 
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error && e.target.value.length >= 6) setError('');
                                    }}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                                    placeholder="••••••"
                                />
                                {/* Password Strength Visual */}
                                <div className="mt-2 flex gap-1 h-1">
                                    <div className={`flex-1 rounded-full ${strength.score > 0 ? strength.color : 'bg-slate-800'} transition-colors`}></div>
                                    <div className={`flex-1 rounded-full ${strength.score > 1 ? strength.color : 'bg-slate-800'} transition-colors`}></div>
                                    <div className={`flex-1 rounded-full ${strength.score > 2 ? strength.color : 'bg-slate-800'} transition-colors`}></div>
                                </div>
                                <p className={`text-[10px] text-right mt-1 font-medium ${strength.score === 1 ? 'text-red-400' : strength.score === 2 ? 'text-yellow-400' : strength.score === 3 ? 'text-green-400' : 'text-slate-500'}`}>
                                    {strength.label || 'Strength'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{text.confirmPwLabel}</label>
                                <input 
                                    type="password" 
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                                    placeholder="••••••"
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}

                        <Button type="submit" className="w-full !text-base !py-3" isLoading={isLoading}>
                            {text.registerBtn}
                        </Button>

                        <div className="text-center pt-2 border-t border-slate-800/50 mt-4">
                            <p className="text-slate-400 text-sm">
                                {text.alreadyAccount}{' '}
                                <button type="button" onClick={() => setView('LOGIN')} className="text-brand-blue font-medium hover:text-brand-blue/80 transition-colors">
                                    {text.signInBtn}
                                </button>
                            </p>
                        </div>
                    </form>
                  )}

                  {activeTab === 'ADMIN' && (
                    <form onSubmit={handleAdminLogin} className="space-y-5 animate-in fade-in zoom-in duration-300">
                        <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-lg p-4">
                            <p className="text-brand-blue text-xs font-medium flex items-start gap-2">
                                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                {text.restrictedArea}
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{text.adminKeyLabel}</label>
                            <input 
                                type="password" 
                                required
                                autoFocus
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all text-center tracking-widest font-mono text-lg"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="rememberAdmin"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-blue focus:ring-brand-blue focus:ring-offset-0 accent-brand-blue cursor-pointer"
                            />
                            <label htmlFor="rememberAdmin" className="text-sm text-slate-400 cursor-pointer hover:text-slate-300 select-none">
                                {text.keepLoggedIn}
                            </label>
                        </div>

                        {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}

                        <Button type="submit" className="w-full !text-base !py-3" isLoading={isLoading}>
                            {text.accessBtn}
                        </Button>

                        <div className="mt-6 text-center">
                            <button 
                                type="button"
                                onClick={() => switchTab('CLIENT')}
                                className="text-slate-500 text-sm hover:text-white transition-colors"
                            >
                                ← {text.backToLogin}
                            </button>
                        </div>
                    </form>
                  )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
