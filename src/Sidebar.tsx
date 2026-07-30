import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { EL_JEM_CENTER } from '../constants';
import { Logo } from './Logo';
import {
  Map as MapIcon, AlertTriangle, FileText, Bell, MapPin,
  BarChart3, Settings, Heart, Cloud, CloudRain, Sun
} from 'lucide-react';

interface SidebarProps {
  currentLang: Language;
  pendingCount: number;
  onOpenWizard: () => void;
  onOpenReports: () => void;
  onOpenNotifications: () => void;
  onOpenSectors: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

interface WeatherState {
  temp: number | null;
  code: number | null;
}

// Open-Meteo is a free, keyless weather API — safe to call directly from the client.
function useElJemWeather(): WeatherState {
  const [weather, setWeather] = useState<WeatherState>({ temp: null, code: null });

  useEffect(() => {
    let cancelled = false;
    const [lat, lng] = EL_JEM_CENTER;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        const temp = data?.current?.temperature_2m;
        const code = data?.current?.weather_code;
        if (typeof temp === 'number') setWeather({ temp: Math.round(temp), code: code ?? null });
      })
      .catch(() => { /* silent fail, widget just shows placeholder */ });
    return () => { cancelled = true; };
  }, []);

  return weather;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentLang,
  pendingCount,
  onOpenWizard,
  onOpenReports,
  onOpenNotifications,
  onOpenSectors,
  onOpenStats,
  onOpenSettings
}) => {
  const isAr = currentLang === 'ar';
  const weather = useElJemWeather();

  const navItems = [
    { key: 'map', icon: MapIcon, label: isAr ? 'الخريطة' : 'Carte', active: true, onClick: undefined },
    { key: 'report', icon: AlertTriangle, label: isAr ? 'إبلاغ عن مشكلة' : 'Signaler un problème', onClick: onOpenWizard },
    { key: 'reports', icon: FileText, label: isAr ? 'التقارير' : 'Rapports', onClick: onOpenReports },
    { key: 'notifications', icon: Bell, label: isAr ? 'التنبيهات' : 'Notifications', onClick: onOpenNotifications, badge: pendingCount },
    { key: 'sectors', icon: MapPin, label: isAr ? 'الأحياء' : 'Quartiers', onClick: onOpenSectors },
    { key: 'stats', icon: BarChart3, label: isAr ? 'الإحصائيات' : 'Statistiques', onClick: onOpenStats },
    { key: 'settings', icon: Settings, label: isAr ? 'الإعدادات' : 'Paramètres', onClick: onOpenSettings }
  ];

  const WeatherIcon = weather.code === null
    ? Sun
    : weather.code >= 51
      ? CloudRain
      : weather.code >= 1 && weather.code <= 3
        ? Cloud
        : Sun;

  return (
    <aside
      className="hidden lg:flex flex-col justify-between w-[220px] shrink-0 h-full bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl z-[1200] py-5 px-3 font-['Cairo','Plus_Jakarta_Sans',sans-serif]"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col gap-6">
        {/* Brand */}
        <div className="px-2">
          <Logo size="sm" showText={true} />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left rtl:text-right ${
                item.active
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-[0_0_16px_rgba(255,51,102,0.15)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <item.icon className={`w-4.5 h-4.5 shrink-0 ${item.active ? 'text-rose-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {!!item.badge && item.badge > 0 && (
                <span className="ms-auto min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        {/* Brand status card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="leading-tight">
              <div className="text-xs font-black text-white">El Jem Live</div>
              <div className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Watchers</div>
            </div>
          </div>
        </div>

        {/* Thank you card */}
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-3 flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-rose-400 shrink-0" fill="currentColor" />
          <span className="text-[11px] font-bold text-rose-200 leading-snug">
            {isAr ? 'شكراً لمساهمتك في جعل المدينة أفضل' : "Merci pour votre contribution citoyenne"}
          </span>
        </div>

        {/* Weather widget */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
          <WeatherIcon className="w-6 h-6 text-amber-300 shrink-0" />
          <div className="leading-tight">
            <div className="text-lg font-black text-white">
              {weather.temp !== null ? `${weather.temp}°` : '--°'}
            </div>
            <div className="text-[10px] font-bold text-slate-400">
              {isAr ? 'الجم، تونس' : 'El Jem, Tunisie'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
