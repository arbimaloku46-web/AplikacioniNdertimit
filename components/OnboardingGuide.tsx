import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingGuideProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isVisible, onDismiss }) => {
  const [step, setStep] = useState(1);

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
        }
      });

      const currentId = step === 1 ? 'splat-viewer' : step === 2 ? 'media-gallery' : 'project-timeline';
      const el = document.getElementById(currentId);
      
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.boxShadow = '0 0 0 4px rgba(34, 100, 171, 0.8), 0 0 40px rgba(34, 100, 171, 0.4)';
        el.style.transition = 'all 0.3s ease-in-out';
        el.style.zIndex = '101';
        el.style.position = 'relative';
        el.style.borderRadius = '1.5rem';
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
        }
      });
    }
  }, [step, isVisible]);

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
        className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm pointer-events-auto" onClick={onDismiss} />

        <div className="pointer-events-auto relative z-10 w-full max-w-sm px-4">
          <motion.div
            key={step}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900 border border-brand-blue shadow-2xl shadow-brand-blue/20 p-6 rounded-3xl relative"
          >
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white text-lg font-bold shadow-[0_0_20px_rgba(34,100,171,0.6)]">
              <div className="absolute inset-0 rounded-full border-2 border-brand-blue animate-ping opacity-50" />
              {step}
            </div>

            {step === 1 && (
              <>
                <h3 className="text-xl font-bold text-white mb-2">Interactive Site View</h3>
                <p className="text-slate-400 text-sm mb-6">Explore the project site in 3D or 360-degree tours. Drag to look around and zoom in to see details.</p>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-xl font-bold text-white mb-2">Media Gallery</h3>
                <p className="text-slate-400 text-sm mb-6">View high-resolution photos and videos of the latest progress. Click any item to expand it.</p>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-xl font-bold text-white mb-2">Project Timeline</h3>
                <p className="text-slate-400 text-sm mb-6">Navigate through past updates using the timeline at the bottom to see how the project has evolved over time.</p>
              </>
            )}

            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Step {step} of 3</span>
              <button 
                onClick={nextStep} 
                className="bg-brand-blue hover:bg-brand-blue/80 text-white font-bold py-2.5 px-6 rounded-xl transition-all hover:scale-105 active:scale-95"
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
