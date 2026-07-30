import React from 'react';
import { OutageReport, Language } from '../types';
import { TRANSLATIONS, TYPE_COLORS, LOGOS_IMAGES } from '../constants';
import { X, Navigation, AlertTriangle, Clock, Activity } from 'lucide-react';

interface RecentFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: OutageReport[];
  currentLang: Language;
  onSelectReport: (report: OutageReport) => void;
}

export const RecentFeedModal: React.FC<RecentFeedModalProps> = ({
  isOpen,
  onClose,
  reports,
  currentLang,
  onSelectReport
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang];
  // Sort descending and get top 5
  const top5 = [...reports]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="overlay show" onClick={onClose} id="recentFeedOverlay" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <div 
        className="sheet max-w-lg w-full bg-slate-900 border border-slate-800 text-white shadow-2xl rounded-2xl overflow-hidden p-0 font-['Cairo','Plus_Jakarta_Sans',sans-serif]"
        onClick={(e) => e.stopPropagation()}
        id="recentFeedSheet"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                {t.recentTitle || "🚨 5 Derniers Signalements"}
              </h2>
              <p className="text-sm font-semibold text-slate-300">
                {t.recentSub || "Suivi en direct avec balises clignotantes"}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            id="closeRecentFeedBtn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {top5.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              {t.noRecent || "Aucun signalement enregistré"}
            </div>
          ) : (
            top5.map((r, idx) => {
              const color = TYPE_COLORS[r.type];
              const timeStr = new Date(r.createdAt).toLocaleString(currentLang === 'ar' ? 'ar-TN' : 'fr-FR', {
                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false
              });

              return (
                <div 
                  key={r.id}
                  onClick={() => {
                    onSelectReport(r);
                    onClose();
                  }}
                  className="group relative bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all cursor-pointer shadow-md"
                >
                  {/* Top Badge & Time */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                        #{idx + 1}
                      </span>
                      <span 
                        className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                        style={{ color: color, borderColor: `${color}40`, backgroundColor: `${color}15` }}
                      >
                        {r.type === 'eau' ? t.water : r.type === 'elec' ? t.elec : t.net}
                      </span>
                      {r.status === 'pending' && (
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                          {t.popupPending}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {timeStr}
                    </div>
                  </div>

                  {/* Body & Note */}
                  <div className="text-sm font-medium text-slate-200 mb-2 line-clamp-2">
                    {r.note || (r.isp ? `Coupure réseau (${r.isp})` : "Signalement de panne")}
                  </div>

                  {/* ISP or Provider badge */}
                  {r.isp && (
                    <div className="text-xs text-cyan-400 font-semibold mb-2">
                      FAI: {r.isp}
                    </div>
                  )}

                  {/* Center on Map Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <span className="flex items-center gap-1 font-medium">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                      {t.clickToCenter || "Localiser sur la carte"}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
