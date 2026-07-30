import React, { useState, useEffect } from 'react';
import { Language, OutageReport } from '../types';
import { TRANSLATIONS } from '../constants';
import { ExternalLink, Info } from 'lucide-react';
import { Logo } from './Logo';

interface TickerBannerProps {
  currentLang: Language;
  counts: { eau: number; elec: number; net: number };
  visitorCount: number;
  reports?: OutageReport[];
}

export const TickerBanner: React.FC<TickerBannerProps> = ({
  currentLang,
  counts,
  visitorCount,
  reports = []
}) => {
  const t = TRANSLATIONS[currentLang];
  const [timeStr, setTimeStr] = useState('');
  const [activeBadgeMode, setActiveBadgeMode] = useState<'live' | 'info'>('live');

  const isAr = currentLang === 'ar';

  // Clock timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString(isAr ? 'ar-TN' : 'fr-FR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [currentLang, isAr]);

  // Alternate badge title every 7 seconds between "EN DIRECT" and "EL JEM INFO"
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBadgeMode(prev => prev === 'live' ? 'info' : 'live');
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Section 1: Live Outage Headlines (Fully translated depending on currentLang)
  const headlines = reports
    .filter(r => r.status === 'approved')
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6)
    .map(r => {
      const time = new Date(r.createdAt).toLocaleTimeString(isAr ? 'ar-TN' : 'fr-FR', {
        hour: '2-digit', minute: '2-digit', hour12: false
      });

      let typeLabel = '';
      if (r.type === 'eau') {
        typeLabel = isAr ? '💧 انقطاع الماء' : "💧 PANNE D'EAU";
      } else if (r.type === 'elec') {
        typeLabel = isAr ? '⚡ انقطاع الكهرباء (STEG)' : '⚡ COUPURE STEG';
      } else {
        typeLabel = isAr ? '📶 انقطاع الإنترنت' : '📶 PANNE INTERNET';
      }

      let detail = '';
      if (r.note && r.note.trim()) {
        detail = r.note.trim();
      } else if (r.isp) {
        detail = isAr ? `مزود الخدمة ${r.isp}` : `Fournisseur ${r.isp}`;
      } else {
        detail = isAr ? 'بلاغ مسجل ومؤكد' : 'Signalement localisé';
      }

      return `[${time}] ${typeLabel}: ${detail}`;
    });

  const defaultNews = isAr ? [
    `📊 مراقبة الجم: ${counts.eau} انقطاع ماء • ${counts.elec} كهرباء • ${counts.net} إنترنت`,
    `👁️ ${visitorCount} مواطن مراقب متصل الآن في الوقت الفعلي`
  ] : [
    `📊 SENSORS EL JEM: ${counts.eau} PANNES EAU • ${counts.elec} ÉLECTRICITÉ • ${counts.net} INTERNET`,
    `👁️ ${visitorCount} OBSERVATEURS CITOYENS CONNECTÉS EN TEMPS RÉEL`
  ];

  const liveNewsItems = headlines.length > 0 ? headlines : defaultNews;

  // Prominent Centered Logo Separator Component with extra spacing
  const LogoSeparator = () => (
    <span className="inline-flex items-center justify-center mx-8 sm:mx-10 shrink-0 align-middle">
      <span className="p-1.5 rounded-full bg-slate-900/90 border border-amber-400/60 shadow-md flex items-center justify-center transition-transform hover:scale-110">
        <Logo size="xs" showText={false} className="w-4 h-4" />
      </span>
    </span>
  );

  return (
    <div 
      className="tv-news-ticker-container font-['Cairo','Plus_Jakarta_Sans',sans-serif]" 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Fixed News Badge Anchor */}
      <div className={`tv-news-badge ${activeBadgeMode === 'info' ? 'info-mode-clean' : 'live-mode-clean'}`}>
        {activeBadgeMode === 'live' ? (
          <>
            <span className="tv-live-dot animate-ping" />
            <span className="tv-live-dot-solid" />
            <span className="tv-news-title font-extrabold text-xs sm:text-sm tracking-wide">
              {isAr ? '🔴 عاجل مباشر' : '🚨 EN DIRECT'}
            </span>
          </>
        ) : (
          <>
            <Info className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="tv-news-title font-extrabold text-xs sm:text-sm text-amber-200 tracking-wide">
              {isAr ? '🏛️ أخبار الجم' : '🏛️ أخبار الجم'}
            </span>
          </>
        )}
        <span className="tv-news-time font-mono text-xs hidden md:inline-block ml-1 opacity-90">
          {timeStr}
        </span>
      </div>

      {/* Marquee Track with Airy / Spacious Layout & Prominent Logo Separators */}
      <div className="tv-news-marquee-wrapper">
        <div className="tv-news-marquee-content">
          {[1, 2].map((loopIdx) => (
            <div key={loopIdx} className="tv-news-loop flex items-center gap-10 px-8">
              
              {/* === SECTION 1: LIVE OUTAGE HEADLINES === */}
              <div className="flex items-center gap-8 px-2 py-1">
                <span className="text-xs sm:text-sm font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                  <span>🔴</span>
                  <span>{isAr ? 'عاجل' : 'DIRECT'}</span>
                </span>
                
                {liveNewsItems.map((item, idx) => (
                  <React.Fragment key={`news-${idx}`}>
                    <span className="tv-news-item text-xs sm:text-sm font-extrabold text-slate-100 font-['Cairo','Plus_Jakarta_Sans',sans-serif]">
                      {item}
                    </span>
                    <LogoSeparator />
                  </React.Fragment>
                ))}
              </div>

              {/* === SECTION 2: CONCEPTION & CREDITS SEPARATED BY LOGO === */}
              <div className="flex items-center gap-8 px-2 py-1">
                {isAr ? (
                  <span className="text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-2 font-['Cairo',sans-serif]">
                    <span>تم تصميم وتطوير هذا الموقع بواسطة صفحة</span>
                    <strong className="text-amber-400 font-extrabold">أخبار الجم</strong>
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
                    <span>Ce site est conçu et réalisé par la page</span>
                    <strong className="text-amber-400 font-extrabold">أخبار الجم (Akhbar El Jem)</strong>
                  </span>
                )}

                <LogoSeparator />

                <a 
                  href="https://www.facebook.com/Eljem.info/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="tv-news-credit hover:underline flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  <span>📘 {isAr ? 'صفحة الفيسبوك' : 'Facebook'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </a>

                <LogoSeparator />

                <a 
                  href="https://www.facebook.com/Eljem.info/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="tv-news-credit hover:underline flex items-center gap-1.5 text-xs sm:text-sm font-bold text-pink-300 transition-colors hover:text-pink-200"
                >
                  <span>📷 {isAr ? 'إنستغرام' : 'Instagram'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
                </a>

                <LogoSeparator />

                <span className="text-xs sm:text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{visitorCount} {isAr ? 'مواطن متصل الآن' : 'observateurs en ligne'}</span>
                </span>

                <LogoSeparator />
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

