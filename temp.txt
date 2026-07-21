import React, { useRef, useEffect, useState } from 'react';
import { WeeklyUpdate } from '../types';
import { CheckCircle2, Circle, Calendar as CalendarIcon, AlignLeft } from 'lucide-react';
import { ProjectCalendar } from './ProjectCalendar';

interface ProjectTimelineProps {
  updates: WeeklyUpdate[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ updates, activeIndex, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  
  // Auto-scroll to active item on mount and index change
  useEffect(() => {
    if (viewMode === 'timeline' && scrollRef.current) {
       const activeEl = scrollRef.current.children[activeIndex] as HTMLElement;
       if (activeEl) {
           const containerWidth = scrollRef.current.clientWidth;
           const elLeft = activeEl.offsetLeft;
           const elWidth = activeEl.clientWidth;
           scrollRef.current.scrollTo({
               left: elLeft - (containerWidth / 2) + (elWidth / 2),
               behavior: 'smooth'
           });
       }
    }
  }, [activeIndex, updates.length, viewMode]);

  return (
    <div id="project-timeline" className="mt-12 bg-slate-900/50 border border-white/5 rounded-3xl p-8 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <h3 className="text-xs uppercase font-extrabold tracking-tight text-brand-blue tracking-widest">Project Timeline & Milestones</h3>
        <div className="flex bg-slate-950 rounded-lg p-1">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-extrabold tracking-tight uppercase tracking-wider transition-all ${
              viewMode === 'timeline' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:text-white'
            }`}
          >
            <AlignLeft className="w-3 h-3" />
            Timeline
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-extrabold tracking-tight uppercase tracking-wider transition-all ${
              viewMode === 'calendar' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3 h-3" />
            Calendar
          </button>
        </div>
      </div>
      
      {viewMode === 'timeline' ? (
        <>
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -z-10 translate-y-[20px]" />

          <div 
             ref={scrollRef}
             className="flex items-end gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-6 md:px-0"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {updates.map((update, index) => {
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;
              

          return (
            <div 
               key={index} 
               onClick={() => onSelect(index)}
               className={`snap-center flex-shrink-0 flex flex-col items-center cursor-pointer transition-all duration-300 w-32 md:w-40 relative group ${isActive ? 'scale-110' : 'opacity-60 hover:opacity-100 hover:-translate-y-1'}`}
            >
                {/* Information Bubble */}
                <div className={`relative mb-4 w-full p-3 rounded-2xl border text-center transition-all duration-300 ease-in-out ${
                    isActive 
                       ? 'bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/20' 
                       : 'bg-slate-950 border-white/5 group-hover:border-white/20'
                }`}>
                   {update.status === 'draft' && (
                       <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[8px] font-extrabold tracking-tight uppercase tracking-widest px-1.5 py-0.5 rounded shadow-lg">
                           Draft
                       </div>
                   )}
                   <span className={`block text-[10px] font-extrabold tracking-tight uppercase tracking-wider mb-1 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                      Week {update.weekNumber}
                   </span>
                   <span className={`block text-xs font-extrabold tracking-tight truncate ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {update.title || 'Update'}
                   </span>
                   <span className={`block text-[9px] mt-1 ${isActive ? 'text-white/70' : 'text-slate-600'}`}>
                      {new Date(update.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </span>
                </div>

                {/* Node Connector */}
                <div className="relative flex items-center justify-center w-full">
                   {/* Connecting line that goes left to right */}
                   {index !== 0 && (
                      <div className={`absolute left-[-50%] right-[50%] top-1/2 h-0.5 -translate-y-1/2 -z-10 transition-all duration-300 ease-in-out ${
                         isActive || isPast ? 'bg-brand-blue' : 'bg-transparent'
                      }`} />
                   )}
                   {/* Node Icon */}
                   <div className="bg-brand-dark p-1 rounded-full z-10">
                      {isActive || isPast ? (
                         <CheckCircle2 className={`w-5 h-5 ${isActive ? 'text-brand-blue' : 'text-slate-500'}`} />
                      ) : (
                         <Circle className="w-5 h-5 text-slate-600" />
                      )}
                   </div>
                   {index !== updates.length - 1 && (
                       <div className={`absolute left-[50%] right-[-50%] top-1/2 h-0.5 -translate-y-1/2 -z-10 transition-all duration-300 ease-in-out ${
                         isPast ? 'bg-brand-blue' : 'bg-transparent'
                      }`} />
                   )}
                </div>
            </div>
          );
        })}
      </div>
      {/* CSS to hide scrollbar */}
      <style>{`
         .scrollbar-hide::-webkit-scrollbar {
             display: none;
         }
      `}</style>
      </>
      ) : (
        <ProjectCalendar updates={updates} activeIndex={activeIndex} onSelect={onSelect} />
      )}
    </div>
  );
};
