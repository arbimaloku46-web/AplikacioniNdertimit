import React from 'react';

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/90 border border-white/5 shadow-2xl shadow-black/40 rounded-2xl p-3 shadow-xl backdrop-blur-md">
        <p className="text-white font-extrabold tracking-tight text-sm mb-1">Week {label}</p>
        <p className="text-brand-blue font-medium text-xs mb-2">Completion: {data.stats?.completion || 0}%</p>
        {data.summary && (
          <p className="text-slate-500 text-xs max-w-[200px] line-clamp-2">
            {data.summary}
          </p>
        )}
      </div>
    );
  }
  return null;
};
