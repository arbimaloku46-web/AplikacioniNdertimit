import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-10" }) => (
  <div className="bg-[#f0f8ff] px-3 py-1.5 rounded-2xl shadow-sm inline-flex items-center justify-center">
    <svg 
      viewBox="0 0 400 120" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
    <text 
      x="0" 
      y="70" 
      fontFamily="Inter, system-ui, sans-serif" 
      fontSize="80" 
      fontWeight="900" 
      fill="#0f294d"
      letterSpacing="-0.02em"
    >
      Ndërtimi
    </text>
    <text 
      x="0" 
      y="110" 
      fontFamily="Inter, system-ui, sans-serif" 
      fontSize="35" 
      fontWeight="700" 
      fill="#8bcbee"
    >
      Shiko Progresin
    </text>
  </svg>
  </div>
);
