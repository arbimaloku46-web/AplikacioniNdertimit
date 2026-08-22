import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingGuideProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isVisible, onDismiss }) => {
  const [step, setStep] = useState(1);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      position: 'fixed',
      opacity: 0
  });

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      setStep(1);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      // Clean up previous
      ['splat-viewer', 'media-gallery', 'project-timeline'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.style.boxShadow = '';
          el.style.transition = '';
          el.style.zIndex = '';
          el.style.position = '';
          el.style.borderRadius = '';
          el.style.background = '';
        }
      });

      const currentId = step === 1 ? 'splat-viewer' : step === 2 ? 'media-gallery' : 'project-timeline';
      const el = document.getElementById(currentId);
      
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Make the feature much more visible
        el.style.boxShadow = '0 0 0 6px rgba(34, 100, 171, 1), 0 0 100px 20px rgba(34, 100, 171, 0.6)';
        el.style.transition = 'all 0.4s ease-out';
        el.style.zIndex = '101';
        el.style.position = 'relative';
        el.style.borderRadius = '1.5rem';
        el.style.background = 'rgba(15, 23, 42, 1)'; // ensure background is solid so it stands out against the dark overlay
      }
    } else {
      ['splat-viewer', 'media-gallery', 'project-timeline'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.style.boxShadow = '';
          el.style.transition = '';
          el.style.zIndex = '';
          el.style.position = '';
          el.style.borderRadius = '';
          el.style.background = '';
        }
      });
    }
  }, [step, isVisible]);

  useEffect(() => {
    let rafId: number;
    
    const updatePosition = () => {
      if (!isVisible) return;
      const currentId = step === 1 ? 'splat-viewer' : step === 2 ? 'media-gallery' : 'project-timeline';
      const el = document.getElementById(currentId);
      
      if (!el) {
        rafId = requestAnimationFrame(updatePosition);
        return;
      }
      
      const rect = el.getBoundingClientRect();
      const tooltipWidth = 280; // smaller tooltip
      const tooltipHeight = 180;
      
      let top = rect.top + rect.height / 2 - tooltipHeight / 2;
      let left = rect.right + 40;
      
      // If it doesn't fit on the right, try left
      if (left + tooltipWidth > window.innerWidth - 20) {
          left = rect.left - tooltipWidth - 40;
          // If it doesn't fit on the left, put it below
          if (left < 20) {
              left = Math.max(20, (window.innerWidth - tooltipWidth) / 2);
              top = rect.bottom + 40;
              
              // If it doesn't fit below, put it above
              if (top + tooltipHeight > window.innerHeight - 20) {
                   top = rect.top - tooltipHeight - 40;
                   if (top < 20) {
                       // center screen
                       top = (window.innerHeight - tooltipHeight) / 2;
                   }
              }
          }
      }
      
      setTooltipStyle({
          top: `${Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20))}px`,
          left: `${left}px`,
          width: `${tooltipWidth}px`,
          position: 'fixed',
          opacity: 1
      });
      
      rafId = requestAnimationFrame(updatePosition);
    };
    
    if (isVisible) {
        rafId = requestAnimationFrame(updatePosition);
    }
    
    return () => {
        if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isVisible, step]);

  if (!isVisible) return null;

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onDismiss();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] pointer-events-none"
      >
        <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md pointer-events-auto" onClick={onDismiss} />

        <div className="pointer-events-auto relative z-10" style={tooltipStyle}>
          <motion.div
            key={step}
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900/90 backdrop-blur-2xl border border-brand-blue shadow-2xl shadow-brand-blue/20 p-5 rounded-2xl relative"
          >
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-sm font-extrabold tracking-tight shadow-[0_0_20px_rgba(34,100,171,0.8)]">
              <div className="absolute inset-0 rounded-full border-2 border-brand-blue animate-ping opacity-70" />
              {step}
            </div>

            {step === 1 && (
              <>
                <h3 className="text-base font-extrabold tracking-tight text-white mb-1.5">Interactive Site View</h3>
                <p className="text-slate-500 text-xs mb-5 leading-relaxed">Explore the project site in 3D or 360-degree tours. Drag to look around and zoom in to see details.</p>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-base font-extrabold tracking-tight text-white mb-1.5">Media Gallery</h3>
                <p className="text-slate-500 text-xs mb-5 leading-relaxed">View high-resolution photos and videos of the latest progress. Click any item to expand it.</p>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-base font-extrabold tracking-tight text-white mb-1.5">Project Timeline</h3>
                <p className="text-slate-500 text-xs mb-5 leading-relaxed">Navigate through past updates using the timeline at the bottom to see how the project has evolved over time.</p>
              </>
            )}

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
              <span className="text-[10px] text-slate-500 font-extrabold tracking-tight uppercase tracking-widest">Step {step} of 3</span>
              <button 
                onClick={nextStep} 
                className="bg-brand-blue hover:bg-blue-600 hover:scale-[1.02] active:scale-95 text-white text-xs font-extrabold tracking-tight py-2 px-5 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                {step === 3 ? 'Got it' : 'Next'}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
