
import React, { useState } from 'react';
import { Button } from './Button';
import { loginUser, registerUser, loginWithGoogle } from '../services/authService';
import { Language, translations } from '../translations';
import { User } from '../types';

interface GlobalAuthProps {
  onLogin: (user: User, isAdmin: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'ADMIN';

const ADMIN_PASSWORD = 'Ndertimi2024';

export const GlobalAuth: React.FC<GlobalAuthProps> = ({ onLogin, language, setLanguage }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    identifier: '', // Email or Phone
    password: '',
    confirmPassword: ''
  });

  // Admin Form State
  const [adminPassword, setAdminPassword] = useState('');

  // Translation Helper
  const text = translations[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (mode === 'LOGIN') {
            const user = await loginUser(formData.identifier, formData.password);
            onLogin(user, false);
        } else {
            // Validation
            if (!formData.fullName || !formData.username || !formData.identifier || !formData.password || !formData.confirmPassword) {
                throw new Error("All fields are required");
            }
            if (formData.password !== formData.confirmPassword) {
                throw new Error(text.passwordMismatch);
            }
            const user = await registerUser(formData);
            onLogin(user, false);
        }
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
        const user = await loginWithGoogle();
        onLogin(user, false);
    } catch (err: any) {
        setError('Google Sign In failed');
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
            // Create a mock admin user for the session
            const adminUser: User = {
                uid: 'admin-master',
                name: 'Administrator',
                username: 'admin',
                email: 'admin@ndertimi.org',
                photoURL: null,
                isAdmin: true
            };
            onLogin(adminUser, true);
        } else {
            setError('Invalid Admin Access Key');
            setIsLoading(false);
        }
    }, 800);
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
                        {mode === 'LOGIN' ? text.loginTitle : mode === 'REGISTER' ? text.signupTitle : text.adminTitle}
                    </h2>
                    {mode === 'ADMIN' && <p className="text-slate-400 text-sm">{text.adminDesc}</p>}
                  </div>

                  {(mode === 'LOGIN' || mode === 'REGISTER') && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                        {/* Google Sign In Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full bg-white text-slate-900 hover:bg-slate-100 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            {text.googleSignIn}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-700"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-bold uppercase">OR</span>
                            <div className="flex-grow border-t border-slate-700"></div>
                        </div>

                        <form onSubmit={handleClientSubmit} className="space-y-4">
                            
                            {/* Fields for Register Only */}
                            {mode === 'REGISTER' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{text.fullNameLabel}</label>
                                        <input 
                                            name="fullName"
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                                            placeholder="Name Surname"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{text.usernameLabel}</label>
                                        <input 
                                            name="username"
                                            type="text"
                                            required
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                                            placeholder="username"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Common Fields */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{text.identifierLabel}</label>
                                <input 
                                    name="identifier"
                                    type="text"
                                    required
                                    value={formData.identifier}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                                    placeholder="+355 69... or email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{text.passwordLabel}</label>
                                <input 
                                    name="password"
                                    type="password" 
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            {mode === 'REGISTER' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{text.confirmPasswordLabel}</label>
                                    <input 
                                        name="confirmPassword"
                                        type="password" 
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}

                            {error && <div className="text-red-400 text-center text-sm bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}

                            <Button type="submit" className="w-full !text-base !py-3" isLoading={isLoading}>
                                {mode === 'LOGIN' ? text.signInBtn : text.registerBtn}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                             <p className="text-sm text-slate-400">
                                {mode === 'LOGIN' ? text.firstTime : text.alreadyAccount}{' '}
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                                        setError('');
                                        setFormData({ fullName: '', username: '', identifier: '', password: '', confirmPassword: '' });
                                    }}
                                    className="text-brand-blue font-bold hover:text-white transition-colors"
                                >
                                    {mode === 'LOGIN' ? text.signUpLink : text.signInLink}
                                </button>
                             </p>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-800 flex justify-center">
                            <button 
                                type="button"
                                onClick={() => {
                                    setMode('ADMIN');
                                    setError('');
                                }}
                                className="text-slate-600 text-xs hover:text-white transition-colors uppercase tracking-widest font-bold flex items-center gap-2"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                {text.adminPortal}
                            </button>
                        </div>
                    </div>
                  )}

                  {mode === 'ADMIN' && (
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

                        {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}

                        <Button type="submit" className="w-full !text-base !py-3" isLoading={isLoading}>
                            {text.accessBtn}
                        </Button>

                        <div className="mt-6 text-center">
                            <button 
                                type="button"
                                onClick={() => {
                                    setMode('LOGIN');
                                    setError('');
                                }}
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
