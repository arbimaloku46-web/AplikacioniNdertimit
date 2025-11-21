import React, { useState } from 'react';
import { Project } from '../types';
import { Button } from './Button';

interface LoginScreenProps {
  targetProject: Project;
  onLogin: () => void;
  onCancel: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ targetProject, onLogin, onCancel }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === targetProject.accessCode) {
      onLogin();
    } else {
      setError('Invalid access code. Please check your invitation.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl border-t border-white/10 animate-in fade-in zoom-in duration-300">
        <button 
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-white mb-2">Restricted Access</h1>
          <p className="text-slate-400 text-sm">
            Enter client code for <br/>
            <span className="text-amber-500 font-medium">{targetProject.name}</span>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              id="code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-center text-lg tracking-widest"
              placeholder="••••"
              maxLength={8}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full text-lg">
            Verify Access
          </Button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
                Demo Code: <span className="font-mono text-slate-400">1111</span>
            </p>
        </div>
      </div>
    </div>
  );
};