import React, { useState } from 'react';
import { Language, OutageType } from '../types';
import { Search, Bell, User, Maximize, Minimize, Sun, LayoutGrid } from 'lucide-react';

interface TopBarProps {
  currentLang: Language;
  activeFilter: OutageType | null;
  onFilterChange: (type: OutageType) => void;
  counts: { eau: number; elec: number; net: number };
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  pendingCount: number;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentLang,
  activeFilter,
  onFilterChange,
  counts,
  searchQuery,
  onSearchQueryChange,
  pendingCount,
  onOpenNotifications,
  onOpenAccount
}) => {
  const isAr = currentLang === 'ar';
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-2.5 p-3">
        {/* Search row */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <div className="flex-1 flex items-center gap-2 bg-slate-950/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl px-4 py-2.5 shadow-2xl">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder={isAr ? 'إبحث عن موقع أو عنوان ...' : 'Rechercher un lieu ou une adresse ...'}
              className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-white placeholder:text-slate-500 min-w-0"
            />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl p-1.5 shadow-2xl">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80" title={isAr ? 'المظهر' : 'Thème'}>
              <Sun className="w-4 h-4" />
            </button>
            <button onClick={toggleFullscreen} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80" title={isAr ? 'ملء الشاشة' : 'Plein écran'}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button onClick={onOpenNotifications} className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80" title={isAr ? 'التنبيهات' : 'Notifications'}>
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <button onClick={onOpenAccount} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80" title={isAr ? 'الحساب' : 'Compte'}>
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter pills row */}
        <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-xl border border-slate-700/70 rounded-full px-3.5 py-2 shadow-xl text-xs font-black text-slate-200">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{isAr ? 'جميع الأنواع' : 'Tous les types'}</span>
          </div>

          <button
            type="button"
            onClick={() => onFilterChange('net')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 shadow-xl text-xs font-black transition-all border ${
              activeFilter === 'net'
                ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200'
                : 'bg-slate-950/90 border-slate-700/70 text-slate-200 hover:border-fuchsia-400/60'
            }`}
          >
            <span>📶</span>
            <span>{isAr ? 'إنترنت' : 'Internet'}</span>
            <span className="bg-fuchsia-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">{counts.net}</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('elec')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 shadow-xl text-xs font-black transition-all border ${
              activeFilter === 'elec'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                : 'bg-slate-950/90 border-slate-700/70 text-slate-200 hover:border-amber-400/60'
            }`}
          >
            <span>⚡</span>
            <span>{isAr ? 'كهرباء' : 'Électricité'}</span>
            <span className="bg-amber-500 text-slate-950 rounded-full px-1.5 py-0.5 text-[10px]">{counts.elec}</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('eau')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 shadow-xl text-xs font-black transition-all border ${
              activeFilter === 'eau'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-slate-950/90 border-slate-700/70 text-slate-200 hover:border-cyan-400/60'
            }`}
          >
            <span>💧</span>
            <span>{isAr ? 'ماء' : 'Eau'}</span>
            <span className="bg-cyan-500 text-slate-950 rounded-full px-1.5 py-0.5 text-[10px]">{counts.eau}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
