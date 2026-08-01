import React from 'react';
import { Language, OutageType } from './types';
import { EL_JEM_SECTORS } from './constants';
import { X, MapPin, Globe, Download, MessageCircle, Search } from 'lucide-react';

export type SidePanelMode = 'sectors' | 'stats' | 'settings' | null;

interface SidePanelProps {
  mode: SidePanelMode;
  onClose: () => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeSector: string;
  onSectorChange: (sectorId: string) => void;
  counts: { eau: number; elec: number; net: number };
  onOpenAudit: () => void;
  onOpenInstall: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  mode,
  onClose,
  currentLang,
  onLanguageChange,
  activeSector,
  onSectorChange,
  counts,
  onOpenAudit,
  onOpenInstall
}) => {
  if (!mode) return null;
  const isAr = currentLang === 'ar';

  const titles: Record<Exclude<SidePanelMode, null>, string> = {
    sectors: isAr ? '📍 الأحياء' : '📍 Quartiers',
    stats: isAr ? '📊 الإحصائيات' : '📊 Statistiques',
    settings: isAr ? '⚙️ الإعدادات' : '⚙️ Paramètres'
  };

  return (
    <div
      className="fixed inset-0 z-[4200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-['Cairo','Plus_Jakarta_Sans',sans-serif]"
      onClick={onClose}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        className="bg-slate-950 border border-slate-800 text-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-base font-black">{titles[mode]}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {mode === 'sectors' && (
            <div className="space-y-1.5">
              {EL_JEM_SECTORS.map(sector => {
                const isSelected = activeSector === sector.id;
                return (
                  <button
                    key={sector.id}
                    onClick={() => { onSectorChange(sector.id); onClose(); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      isSelected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{isAr ? sector.ar : sector.fr}</span>
                  </button>
                );
              })}
            </div>
          )}

          {mode === 'stats' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl text-center">
                <div className="text-2xl font-black text-cyan-400">{counts.eau}</div>
                <div className="text-xs text-cyan-300 mt-1">💧 {isAr ? 'ماء' : 'Eau'}</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-center">
                <div className="text-2xl font-black text-amber-400">{counts.elec}</div>
                <div className="text-xs text-amber-300 mt-1">⚡ {isAr ? 'كهرباء' : 'Électricité'}</div>
              </div>
              <div className="bg-fuchsia-500/10 border border-fuchsia-500/30 p-4 rounded-xl text-center col-span-2">
                <div className="text-2xl font-black text-fuchsia-400">{counts.net}</div>
                <div className="text-xs text-fuchsia-300 mt-1">📶 {isAr ? 'إنترنت' : 'Internet'}</div>
              </div>
            </div>
          )}

          {mode === 'settings' && (
            <div className="space-y-2.5">
              <button
                onClick={() => onLanguageChange(currentLang === 'fr' ? 'ar' : 'fr')}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-bold"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                {currentLang === 'fr' ? 'العربية 🇹🇳' : 'Français 🇫🇷'}
              </button>
              <button
                onClick={onOpenInstall}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-bold"
              >
                <Download className="w-4 h-4 text-rose-400" />
                {isAr ? 'تثبيت التطبيق' : "Installer l'application"}
              </button>
              <button
                onClick={onOpenAudit}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-bold"
              >
                <Search className="w-4 h-4 text-amber-400" />
                {isAr ? 'التدقيق التقني' : 'Diagnostic Technique'}
              </button>
              <a
                href="https://www.facebook.com/Eljem.info/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-bold"
              >
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                Messenger
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
