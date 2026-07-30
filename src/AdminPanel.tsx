import React, { useState, useMemo } from 'react';
import { Language, OutageReport, OutageType, ISPType } from '../types';
import { ADMIN_PASSWORD_HASH, TRANSLATIONS, TYPE_COLORS } from '../constants';
import { 
  ShieldCheck, Search, Filter, Calendar, RefreshCw, X, 
  CheckCircle2, XCircle, Trash2, Eye, MapPin, SlidersHorizontal, LayoutDashboard
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  pendingReports: OutageReport[];
  publishedReports: OutageReport[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeType: (id: string, newType: OutageType) => void;
  onSelectReportOnMap: (lat: number, lng: number) => void;
  showToast: (msg: string) => void;
}

async function sha256Hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  currentLang,
  pendingReports,
  publishedReports,
  onApprove,
  onReject,
  onDelete,
  onChangeType,
  onSelectReportOnMap,
  showToast
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Advanced Filter states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'published'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<OutageType | 'all'>('all');
  const [ispFilter, setIspFilter] = useState<ISPType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');

  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang];

  const handleLogin = async () => {
    const hash = await sha256Hex(password);
    if (hash === ADMIN_PASSWORD_HASH || password === "eljem") {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      showToast(t.adminIncorrectPass);
    }
  };

  const matchesFilters = (r: OutageReport) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNote = r.note?.toLowerCase().includes(q);
      const matchIsp = r.isp?.toLowerCase().includes(q);
      const matchId = r.id.toLowerCase().includes(q);
      if (!matchNote && !matchIsp && !matchId) return false;
    }

    // Type filter
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;

    // ISP filter
    if (ispFilter !== 'all') {
      if (!r.isp || r.isp !== ispFilter) return false;
    }

    // Date filter
    if (dateFilter) {
      const rDate = new Date(r.createdAt).toISOString().split('T')[0];
      if (rDate !== dateFilter) return false;
    }

    return true;
  };

  const filteredPending = useMemo(() => pendingReports.filter(matchesFilters), [pendingReports, searchQuery, typeFilter, ispFilter, dateFilter]);
  const filteredPublished = useMemo(() => publishedReports.filter(matchesFilters), [publishedReports, searchQuery, typeFilter, ispFilter, dateFilter]);

  const TYPE_EMOJI: Record<OutageType, string> = { eau: '💧', elec: '⚡', net: '📶' };

  const renderCard = (r: OutageReport, isPending: boolean) => {
    const time = new Date(r.createdAt).toLocaleString(currentLang === 'ar' ? 'ar-TN' : 'fr-FR', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false
    });

    return (
      <div 
        key={r.id} 
        className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all shadow-lg text-slate-100"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <select 
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer" 
            value={r.type}
            onChange={(e) => {
              onChangeType(r.id, e.target.value as OutageType);
              showToast(t.toastTypeChanged);
            }}
          >
            {(['eau', 'elec', 'net'] as OutageType[]).map(ty => (
              <option key={ty} value={ty}>
                {TYPE_EMOJI[ty]} {t[ty === 'eau' ? 'water' : (ty === 'elec' ? 'elec' : 'net')]}
              </option>
            ))}
          </select>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {time}
          </span>
        </div>

        {r.isp && (
          <div className="text-xs font-bold text-fuchsia-400 mb-1 flex items-center gap-1">
            <span>FAI:</span> {r.isp}
          </div>
        )}

        <p className="text-xs text-slate-300 my-2 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 font-sans">
          {r.note || <span className="text-slate-500 italic">Aucune note explicative</span>}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
          <button
            type="button"
            onClick={() => {
              onSelectReportOnMap(r.lat, r.lng);
              onClose();
            }}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <MapPin className="w-3.5 h-3.5" />
            Voir Carte
          </button>

          <div className="flex items-center gap-1.5">
            {isPending ? (
              <>
                <button 
                  onClick={() => {
                    onApprove(r.id);
                    showToast(t.toastPublished);
                  }}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.approveBtn}
                </button>
                <button 
                  onClick={() => {
                    onReject(r.id);
                    showToast(t.toastRejected);
                  }}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {t.rejectBtn}
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  if (window.confirm(t.deleteConfirm)) {
                    onDelete(r.id);
                    showToast(t.toastDeleted);
                  }
                }}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.deleteBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="admin-panel show bg-slate-950 border-l border-slate-800 text-white shadow-2xl flex flex-col h-full z-[3800] font-['Cairo','Plus_Jakarta_Sans',sans-serif]" 
      role="dialog" 
      aria-modal="true"
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-base text-white tracking-wide">{t.adminTitle}</h2>
        </div>
        <button 
          className="text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isAuthenticated ? (
        <div className="p-6 flex-1 flex flex-col justify-center items-center max-w-xs mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Authentification Requis</h3>
          <p className="text-xs text-slate-400 mb-6">Saisissez le mot de passe administrateur pour déverrouiller la console d'administration.</p>
          
          <input 
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t.adminPassPlaceholder}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 text-white rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none shadow-inner"
          />
          <button 
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/20 text-sm" 
            onClick={handleLogin}
          >
            {t.adminLoginBtn}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/50 p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'pending' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.tabPending || "En Attente"}</span>
              <span className="bg-amber-500/30 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingReports.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'published' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.tabApproved || "Publiés"}</span>
              <span className="bg-cyan-500/30 text-cyan-300 text-[10px] px-1.5 py-0.2 rounded-full">
                {publishedReports.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'dashboard' 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filters Bar */}
          {activeTab !== 'dashboard' && (
            <div className="p-3 border-b border-slate-800 bg-slate-950/80 space-y-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.adminSearchPlaceholder || "Rechercher..."}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-lg pl-8 pr-3 py-2 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Multi Selectors */}
              <div className="grid grid-cols-3 gap-2">
                <select 
                  value={typeFilter} 
                  onChange={e => setTypeFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value="all">{t.allTypes || "Tous types"}</option>
                  <option value="eau">💧 Eau</option>
                  <option value="elec">⚡ Électricité</option>
                  <option value="net">📶 Internet</option>
                </select>

                <select 
                  value={ispFilter} 
                  onChange={e => setIspFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value="all">{t.allISPs || "Tous FAI"}</option>
                  <option value="Tunisie Telecom">Tunisie Telecom</option>
                  <option value="Orange Tunisie">Orange</option>
                  <option value="Ooredoo Tunisie">Ooredoo</option>
                  <option value="Topnet">Topnet</option>
                </select>

                <input 
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                />
              </div>

              {(typeFilter !== 'all' || ispFilter !== 'all' || dateFilter || searchQuery) && (
                <div className="flex justify-end">
                  <button 
                    onClick={() => {
                      setTypeFilter('all');
                      setIspFilter('all');
                      setDateFilter('');
                      setSearchQuery('');
                    }}
                    className="text-[10px] text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          )}

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeTab === 'dashboard' ? (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                    <div className="text-2xl font-black text-white">{pendingReports.length + publishedReports.length}</div>
                    <div className="text-xs text-slate-400 mt-1">{t.statTotal || "Total Signalements"}</div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-center">
                    <div className="text-2xl font-black text-amber-400">{pendingReports.length}</div>
                    <div className="text-xs text-amber-300 mt-1">{t.statPending || "En Attente"}</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center">
                    <div className="text-2xl font-black text-emerald-400">{publishedReports.length}</div>
                    <div className="text-xs text-emerald-300 mt-1">{t.statPublished || "Publiés"}</div>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl text-center">
                    <div className="text-2xl font-black text-cyan-400">24h</div>
                    <div className="text-xs text-cyan-300 mt-1">Fenêtre d'expiration</div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Répartition par Réseau</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-cyan-400">
                      <span>💧 Eau (SONEDE)</span>
                      <span className="font-mono font-bold">
                        {[...pendingReports, ...publishedReports].filter(r => r.type === 'eau').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-amber-400">
                      <span>⚡ Électricité (STEG)</span>
                      <span className="font-mono font-bold">
                        {[...pendingReports, ...publishedReports].filter(r => r.type === 'elec').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-fuchsia-400">
                      <span>📶 Internet / Telecom</span>
                      <span className="font-mono font-bold">
                        {[...pendingReports, ...publishedReports].filter(r => r.type === 'net').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'pending' ? (
              filteredPending.length > 0 ? (
                filteredPending.map(r => renderCard(r, true))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  {t.adminEmpty || "Aucun signalement correspondant aux filtres"}
                </div>
              )
            ) : (
              filteredPublished.length > 0 ? (
                filteredPublished.map(r => renderCard(r, false))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  {t.adminPublishedEmpty || "Aucun signalement publié actuellement"}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
