import React, { useEffect, useState } from 'react';
import { Project, WeeklyUpdate } from '../types';
import { generateProgressReport } from '../services/geminiService';

interface AIInsightProps {
  project: Project;
  update: WeeklyUpdate;
}

export const AIInsight: React.FC<AIInsightProps> = ({ project, update }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const text = await generateProgressReport(project, update);
        if (isMounted) setReport(text);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
    };
  }, [project, update]);

  return (
    <div className="glass-panel rounded-xl p-6 border-l-4 border-l-amber-500 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Executive Summary</h3>
        </div>

        {loading ? (
            <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
        ) : (
            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                {report.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2 last:mb-0">{line}</p>
                ))}
            </div>
        )}

        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
    </div>
  );
};