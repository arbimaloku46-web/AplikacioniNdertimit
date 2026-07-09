import React, { useState, useEffect } from 'react';
import { Button } from './Button';

import { Logo } from './Logo';

interface NavbarProps {
  onNavigate: (view: 'HOME' | 'CONTACT') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      isScrolled 
        ? 'bg-slate-950/90 backdrop-blur-md border-white/10 py-4' 
        : 'bg-transparent border-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onNavigate('HOME')}
        >
          <Logo className="h-10" />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => onNavigate('HOME')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</button>
          <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Services</button>
          <button onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Projects</button>
          <Button variant="outline" className="!py-2 !px-4 !text-xs" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
            Contact Us
          </Button>
        </div>

        {/* Mobile Menu Button (Simple implementation) */}
        <button className="md:hidden text-white">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
    </nav>
  );
};