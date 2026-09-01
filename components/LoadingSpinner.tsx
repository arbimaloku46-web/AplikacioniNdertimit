import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...', fullScreen = false }) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 z-[999] bg-brand-dark flex flex-col items-center justify-center p-8" 
    : "flex flex-col items-center justify-center py-24 w-full h-full";

  return (
    <div className={containerClass}>
      <div className="relative flex flex-col items-center justify-center">
        {fullScreen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-16"
            >
                <Logo className="h-16" />
            </motion.div>
        )}
        
        <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Outer spinning ring - Brand Blue */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-white/5 border-t-brand-blue/80 border-r-brand-blue/30 shadow-[0_0_20px_rgba(34,100,171,0.2)]"
            />
            {/* Inner counter-spinning ring - Emerald (matching active states) */}
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-white/5 border-b-emerald-400/50 border-l-emerald-400/20"
            />
            {/* Center pulsing core */}
            <motion.div 
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-3 h-3 bg-brand-blue rounded-full shadow-[0_0_15px_rgba(34,100,171,0.8)]"
            />
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-10 text-[10px] text-slate-400 font-extrabold tracking-[0.2em] uppercase"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};
