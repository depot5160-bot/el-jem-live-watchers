import React from 'react';
import { Language } from '../types';
import { Logo } from './Logo';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface InstallModalProps {
  currentLang: Language;
  onClose: () => void;
  deferredPrompt: any;
  onInstallClick: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  currentLang,
  onClose,
  deferredPrompt,
  onInstallClick
}) => {
  const isAr = currentLang === 'ar';

  return (
    <div 
      className="fixed inset-0 z-[5500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-['Cairo','Plus_Jakarta_Sans',sans-serif]" 
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Identity */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 mb-3 shadow-xl">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            El Jem Live Watchers
          </h2>
          <p className="text-amber-400 text-sm font-extrabold mt-1">
            {isAr ? '🏛️ Veille Citoyenne Participative • المراقبة المواطنية التشاركية' : '🏛️ Veille Citoyenne Participative'}
          </p>
        </div>

        {/* Action Button if PWA prompt is ready */}
        {deferredPrompt ? (
          <button
            onClick={onInstallClick}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-lg shadow-lg shadow-rose-500/30 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 mb-6"
          >
            <Download className="w-6 h-6 animate-bounce" />
            <span>{isAr ? 'تثبيت التطبيق الآن' : 'Installer l\'Application Directement'}</span>
          </button>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 mb-6 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isAr 
                ? 'التطبيق جاهز للتثبيت على هاتفك أو حاسوبك' 
                : 'L\'application est prête pour l\'installation sur votre appareil'}
            </span>
          </div>
        )}

        {/* Installation Instructions */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            {isAr ? 'تعليمات التثبيت السريع:' : 'Instructions d\'installation rapide:'}
          </h3>

          {/* Android / Chrome */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl shrink-0 mt-0.5">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-100">
                {isAr ? 'Android / متصفح Chrome' : 'Android / Chrome'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isAr 
                  ? 'اضغط على زر القائمة (⋮) أعلى المتصفح ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".'
                  : 'Appuyez sur le menu (⋮) en haut puis sélectionnez "Installer l\'application" ou "Ajouter à l\'écran d\'accueil".'}
              </p>
            </div>
          </div>

          {/* iOS / Safari */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 mt-0.5">
              <Share className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-100">
                {isAr ? 'iPhone / iPad (Safari)' : 'iPhone / iPad (Safari)'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isAr 
                  ? 'اضغط على زر المشاركة (Share ⎋) أسفل الشاشة ثم اختر "إضافة إلى الشاشة الرئيسية ➕".'
                  : 'Appuyez sur le bouton Partager (⎋) en bas de Safari puis sélectionnez "Sur l\'écran d\'accueil ➕".'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isAr ? 'إغلاق النافذة' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};
