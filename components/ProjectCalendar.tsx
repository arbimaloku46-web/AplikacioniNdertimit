import React, { useState, useMemo } from 'react';
import { WeeklyUpdate } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface ProjectCalendarProps {
  updates: WeeklyUpdate[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export const ProjectCalendar: React.FC<ProjectCalendarProps> = ({ updates, activeIndex, onSelect }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (updates[activeIndex]?.date) {
      return new Date(updates[activeIndex].date);
    }
    return new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map dates to updates
  const updatesByDate = useMemo(() => {
    const map = new Map<string, { update: WeeklyUpdate; index: number }>();
    updates.forEach((update, idx) => {
      // Assuming update.date is YYYY-MM-DD or full ISO
      const dateStr = update.date.split('T')[0];
      map.set(dateStr, { update, index: idx });
    });
    return map;
  }, [updates]);

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-white font-display font-bold text-lg md:text-xl">
          {monthNames[month]} {year}
        </h4>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {/* Day Headers */}
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 py-2">
            {day}
          </div>
        ))}

        {/* Empty Cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}

        {/* Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNumber = i + 1;
          const d = String(dayNumber).padStart(2, '0');
          const m = String(month + 1).padStart(2, '0');
          const dateStr = `${year}-${m}-${d}`;
          const updateData = updatesByDate.get(dateStr);
          
          const hasUpdate = !!updateData;
          const isActive = updateData?.index === activeIndex;

          return (
            <div 
              key={dayNumber} 
              className={`aspect-square relative rounded-xl border flex flex-col items-center justify-center p-1 md:p-2 transition-all ${
                hasUpdate 
                  ? 'cursor-pointer hover:-translate-y-1' 
                  : 'opacity-30 cursor-not-allowed bg-slate-900/50 border-white/5'
              } ${
                isActive
                  ? 'bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/20 scale-105 z-10'
                  : hasUpdate 
                    ? 'bg-slate-800 border-white/10 hover:border-brand-blue/50' 
                    : ''
              }`}
              onClick={() => {
                if (hasUpdate) {
                  onSelect(updateData.index);
                }
              }}
            >
              <span className={`text-sm md:text-base font-medium ${isActive ? 'text-white' : hasUpdate ? 'text-slate-200' : 'text-slate-600'}`}>
                {dayNumber}
              </span>
              
              {hasUpdate && (
                <div className="absolute bottom-1 md:bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center">
                   {updateData.update.status === 'draft' && (
                     <div className="absolute -top-6 bg-amber-500 text-white text-[8px] font-bold uppercase tracking-widest px-1 py-0.5 rounded shadow-lg whitespace-nowrap">
                       Draft
                     </div>
                   )}
                   <CheckCircle2 className={`w-3 h-3 md:w-4 md:h-4 ${isActive ? 'text-white' : 'text-brand-blue'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
