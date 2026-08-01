import React from 'react';
import { Language } from './types';
import { Map as MapIcon, FileText, Plus, Bell, User } from 'lucide-react';

interface MobileNavProps {
  currentLang: Language;
  pendingCount: number;
  onOpenWizard: () => void;
  onOpenReports: () => void;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentLang,
  pendingCount,
  onOpenWizard,
  onOpenReports,
  onOpenNotifications,
  onOpenAccount
}) => {
  const isAr = currentLang === 'ar';

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[1300] bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-xl px-4 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] flex items-center justify-between font-['Cairo','Plus_Jakarta_Sans',sans-serif]"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <button className="flex flex-col items-center gap-1 text-rose-400 flex-1">
        <MapIcon className="w-5 h-5" />
        <span className="text-[10px] font-bold">{isAr ? 'الخريطة' : 'Carte'}</span>
      </button>

      <button onClick={onOpenReports} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white flex-1">
        <FileText className="w-5 h-5" />
        <span className="text-[10px] font-bold">{isAr ? 'التقارير' : 'Rapports'}</span>
      </button>

      <button
        onClick={onOpenWizard}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/40 -mt-6 border-4 border-slate-950"
      >
        <Plus className="w-6 h-6" />
      </button>

      <button onClick={onOpenNotifications} className="relative flex flex-col items-center gap-1 text-slate-400 hover:text-white flex-1">
        <Bell className="w-5 h-5" />
        {pendingCount > 0 && (
          <span className="absolute -top-1 right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
            {pendingCount}
          </span>
        )}
        <span className="text-[10px] font-bold">{isAr ? 'التنبيهات' : 'Notifications'}</span>
      </button>

      <button onClick={onOpenAccount} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white flex-1">
        <User className="w-5 h-5" />
        <span className="text-[10px] font-bold">{isAr ? 'الحساب' : 'Compte'}</span>
      </button>
    </nav>
  );
};
