import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Language, OutageReport, OutageType } from './types';
import { TRANSLATIONS, EL_JEM_CENTER, EL_JEM_SECTORS } from './constants';
import {
  getApprovedReports,
  getPendingReports,
  getApprovedAllReports,
  getPendingAllReports,
  submitReport,
  setReportStatus,
  updateReportType,
  setReportRestored,
  removeReport,
  syncFromServer
} from './store';

import { MapComponent } from './MapComponent';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { SidePanel, SidePanelMode } from './SidePanel';
import { WizardModal } from './WizardModal';
import { AdminPanel } from './AdminPanel';
import { TickerBanner } from './TickerBanner';
import { AuditModal } from './AuditModal';
import { RecentFeedModal } from './RecentFeedModal';
import { InstallModal } from './InstallModal';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    return (localStorage.getItem('eljem_lang') as Language) || 'ar';
  });

  const [activeFilter, setActiveFilter] = useState<OutageType | null>(null);
  const [activeSector, setActiveSector] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [approvedReports, setApprovedReports] = useState<OutageReport[]>([]);
  const [pendingReports, setPendingReports] = useState<OutageReport[]>([]);
  const [publishedAllReports, setPublishedAllReports] = useState<OutageReport[]>([]);
  const [pendingAllReports, setPendingAllReports] = useState<OutageReport[]>([]);

  // Modals & Panels
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [isRecentFeedOpen, setIsRecentFeedOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const [sidePanelMode, setSidePanelMode] = useState<SidePanelMode>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Location & Manual Pick
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocationValidated, setIsLocationValidated] = useState<boolean>(false);
  const [locStatusMessage, setLocStatusMessage] = useState<string>('');

  const [isPickingManual, setIsPickingManual] = useState<boolean>(false);
  const [tempManualPos, setTempManualPos] = useState<{ lat: number; lng: number } | null>(null);
  const [pickAddressText, setPickAddressText] = useState<string>('');

  // Ticker stats
  const [visitorCount, setVisitorCount] = useState<number>(() => Math.floor(Math.random() * (150 - 25 + 1)) + 25);

  const t = TRANSLATIONS[currentLang];

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('eljem_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  }, [currentLang]);

  // Listen for PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallAppClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast(currentLang === 'ar' ? 'تم بدء تثبيت التطبيق بنجاح' : 'Installation de l\'application démarrée');
      }
      setDeferredPrompt(null);
    }
  };

  // Auto-Sync notification pill state
  const [syncPillMsg, setSyncPillMsg] = useState<string | null>(null);
  const knownReportIdsRef = useRef<Set<string>>(new Set());

  // Load and refresh reports
  const refreshData = useCallback(async () => {
    await syncFromServer();
    const approved = getApprovedReports();
    const pending = getPendingReports();
    const pubAll = getApprovedAllReports();
    const pendAll = getPendingAllReports();

    const currentAll = [...pubAll, ...pendAll];
    const currentIds = new Set(currentAll.map(r => r.id));

    if (knownReportIdsRef.current.size > 0) {
      let newCount = 0;
      currentIds.forEach(id => {
        if (!knownReportIdsRef.current.has(id)) {
          newCount++;
        }
      });

      if (newCount > 0) {
        const msg = currentLang === 'ar'
          ? `🔄 تم تزامن ${newCount} بلاغ جديد تلقائياً`
          : `🔄 ${newCount} nouveau(x) signalement(s) synchronisé(s) en direct`;

        setSyncPillMsg(msg);
        setTimeout(() => {
          setSyncPillMsg(prev => (prev === msg ? null : prev));
        }, 4000);
      }
    }

    knownReportIdsRef.current = currentIds;

    setApprovedReports(approved);
    setPendingReports(pending);
    setPublishedAllReports(pubAll);
    setPendingAllReports(pendAll);
  }, [currentLang]);

  // Smart pull sync: pauses when tab is hidden to save data, refreshes immediately on tab focus
  useEffect(() => {
    refreshData();

    let interval: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (!interval) {
        interval = setInterval(() => {
          if (!document.hidden) {
            refreshData();
          }
        }, 15000);
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        refreshData(); // Immediate fetch on focus
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);

  // Gentle Visitor Count Fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 11) - 5;
      setVisitorCount(prev => Math.min(150, Math.max(25, prev + delta)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // User Session ID (captured for IP/Device restoration verification)
  const [sessionId] = useState<string>(() => {
    let sid = localStorage.getItem('eljem_user_session_id');
    if (!sid) {
      sid = "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
      localStorage.setItem('eljem_user_session_id', sid);
    }
    return sid;
  });

  // Handle Restoration by IP / Session Author
  const handleSignalRestoration = useCallback(async (reportId: string) => {
    const all = [...publishedAllReports, ...pendingAllReports];
    const target = all.find(r => r.id === reportId);

    if (!target) return;

    const isOwner = !target.reporterSessionId || target.reporterSessionId === sessionId;

    if (isOwner) {
      setReportRestored(reportId);
      await refreshData();
      showToast(t.restoredToast);
    } else {
      showToast(t.restoredDeniedToast);
    }
  }, [publishedAllReports, pendingAllReports, sessionId, refreshData, showToast, t]);

  const secretBufferRef = useRef<string>('');
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (key.length !== 1 || !/[a-z]/.test(key)) return;

      secretBufferRef.current += key;
      const targetSeq = "eljem";

      if (!targetSeq.startsWith(secretBufferRef.current)) {
        secretBufferRef.current = key === 'e' ? 'e' : '';
      }

      if (secretBufferRef.current === targetSeq) {
        secretBufferRef.current = '';
        setIsWizardOpen(false);
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Location Auto Detection
  const initLocationDetection = useCallback(() => {
    setLocStatusMessage(t.locDetecting);
    setIsLocationValidated(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(newPos);
          setIsLocationValidated(true);
          setLocStatusMessage(t.locGPSSuccess);
        },
        async () => {
          try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              const ipPos = { lat: Number(data.latitude), lng: Number(data.longitude) };
              setUserPos(ipPos);
              setIsLocationValidated(true);
              setLocStatusMessage(t.locIPSuccess);
              return;
            }
          } catch {
            // IP Geolocation fallback failed
          }
          setLocStatusMessage(t.locFailed);
          setIsLocationValidated(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocStatusMessage(t.locFailed);
      setIsLocationValidated(false);
    }
  }, [t]);

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
    setUserPos(null);
    setIsLocationValidated(false);
    initLocationDetection();
  };

  const handleStartManualPick = () => {
    setIsWizardOpen(false);
    setIsPickingManual(true);
    const initialCenter = userPos || { lat: EL_JEM_CENTER[0], lng: EL_JEM_CENTER[1] };
    setTempManualPos(initialCenter);
    fetchPreciseAddress(initialCenter.lat, initialCenter.lng);
  };

  const fetchPreciseAddress = async (lat: number, lng: number) => {
    setPickAddressText(t.pickSearching);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': currentLang }
      });
      const data = await res.json();
      if (data && data.display_name) {
        setPickAddressText(`📍 ${data.display_name}`);
      } else {
        setPickAddressText(`📍 Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      }
    } catch {
      setPickAddressText(`📍 Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
    }
  };

  const handleCenterChange = (lat: number, lng: number) => {
    setTempManualPos({ lat, lng });
    fetchPreciseAddress(lat, lng);
  };

  const handleConfirmManualPick = () => {
    if (!tempManualPos) return;
    setUserPos(tempManualPos);
    setIsLocationValidated(true);
    setIsPickingManual(false);
    setLocStatusMessage(t.locChosen);
    setIsWizardOpen(true);
    showToast(t.locChosen);
  };

  const handleCancelManualPick = () => {
    setIsPickingManual(false);
    setIsWizardOpen(true);
  };

  const handleSubmitReport = async (reportData: { type: OutageType; isp?: any; note?: string; lat: number; lng: number }) => {
    await submitReport({
      ...reportData,
      reporterSessionId: sessionId
    });
    setIsWizardOpen(false);
    await refreshData();
    showToast(t.toastSuccess);
  };

  // Filter reports by selected Sector/Neighborhood and free-text search
  const matchesSectorAndSearch = useCallback((r: OutageReport) => {
    if (activeSector !== 'all') {
      const secObj = EL_JEM_SECTORS.find(s => s.id === activeSector);
      if (secObj) {
        const noteLower = (r.note || '').toLowerCase();
        const inSector = r.sector === activeSector
          || noteLower.includes(secObj.fr.toLowerCase())
          || noteLower.includes(secObj.ar.toLowerCase())
          || noteLower.includes(secObj.id);
        if (!inSector) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const noteLower = (r.note || '').toLowerCase();
      const secObj = EL_JEM_SECTORS.find(s => s.id === r.sector);
      const sectorMatch = secObj ? (secObj.fr.toLowerCase().includes(q) || secObj.ar.toLowerCase().includes(q)) : false;
      const ispMatch = (r.isp || '').toLowerCase().includes(q);
      if (!noteLower.includes(q) && !sectorMatch && !ispMatch) return false;
    }

    return true;
  }, [activeSector, searchQuery]);

  const displayApprovedReports = useMemo(
    () => approvedReports.filter(matchesSectorAndSearch),
    [approvedReports, matchesSectorAndSearch]
  );

  const displayPendingReports = useMemo(
    () => pendingReports.filter(matchesSectorAndSearch),
    [pendingReports, matchesSectorAndSearch]
  );

  const activeCounts = {
    eau: displayApprovedReports.filter(r => r.type === 'eau').length,
    elec: displayApprovedReports.filter(r => r.type === 'elec').length,
    net: displayApprovedReports.filter(r => r.type === 'net').length
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-stone-900 select-none font-['Plus_Jakarta_Sans','Cairo',sans-serif]">
      {/* Desktop Sidebar */}
      <Sidebar
        currentLang={currentLang}
        pendingCount={pendingAllReports.length}
        onOpenWizard={handleOpenWizard}
        onOpenReports={() => setIsRecentFeedOpen(true)}
        onOpenNotifications={() => setIsRecentFeedOpen(true)}
        onOpenSectors={() => setSidePanelMode('sectors')}
        onOpenStats={() => setSidePanelMode('stats')}
        onOpenSettings={() => setSidePanelMode('settings')}
      />

      <div className="relative flex-1 h-full overflow-hidden">
        {/* Map Background */}
        <MapComponent
          approvedReports={displayApprovedReports}
          pendingReports={displayPendingReports}
          showPending={isAdminOpen}
          activeFilter={activeFilter}
          activeSector={activeSector}
          currentLang={currentLang}
          isPickingManual={isPickingManual}
          onCenterChange={handleCenterChange}
          onSignalRestoration={handleSignalRestoration}
        />

        {/* Center Pin for Manual Picking */}
        <div id="centerPin" className={isPickingManual ? 'show' : ''}>
          <svg viewBox="0 0 24 24" width="44" height="44">
            <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z" fill="#B8420F" stroke="white" strokeWidth="1.5"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        </div>

        {/* Manual Pick Banner */}
        <div id="pickBanner" className={`pick-banner ${isPickingManual ? 'show' : ''}`}>
          <span>{t.pickPromptText}</span>
          <div className="pick-address-preview">{pickAddressText || t.pickWaitingText}</div>
          <div className="pick-banner-actions">
            <button onClick={handleConfirmManualPick}>
              {t.confirmPickBtn}
            </button>
            <button className="cancel-pick" onClick={handleCancelManualPick}>
              {t.backBtn}
            </button>
          </div>
        </div>

        {/* Redesigned Top Bar: search + icon cluster + filter pills */}
        <TopBar
          currentLang={currentLang}
          activeFilter={activeFilter}
          onFilterChange={(type) => setActiveFilter(prev => prev === type ? null : type)}
          counts={activeCounts}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          pendingCount={pendingAllReports.length}
          onOpenNotifications={() => setIsRecentFeedOpen(true)}
          onOpenAccount={() => setIsAdminOpen(true)}
        />

        {/* Floating Action Button (Signaler) - desktop only, mobile uses MobileNav's + button */}
        {!isPickingManual && (
          <div className="hidden lg:flex fixed left-1/2 -translate-x-1/2 z-[1000] bottom-14">
            <button className="fab blink" id="openWizardBtn" onClick={handleOpenWizard}>
              <span className="fab-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01"/>
                  <path d="M10.29 3.86l-8.4 14.55A1 1 0 0 0 2.75 20h18.5a1 1 0 0 0 .86-1.59l-8.4-14.55a1 1 0 0 0-1.72 0z"/>
                </svg>
                <span>{t.reportBtn}</span>
              </span>
              <span className="fab-arrow">→</span>
            </button>
          </div>
        )}

        {/* Reporting Wizard Modal */}
        <WizardModal
          isOpen={isWizardOpen}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
          onClose={() => setIsWizardOpen(false)}
          onSubmit={handleSubmitReport}
          onStartManualPick={handleStartManualPick}
          userPos={userPos}
          isLocationValidated={isLocationValidated}
          locStatusMessage={locStatusMessage}
        />

        {/* Admin Panel */}
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          currentLang={currentLang}
          pendingReports={pendingAllReports}
          publishedReports={publishedAllReports}
          onApprove={async (id) => {
            setReportStatus(id, 'approved');
            await refreshData();
          }}
          onReject={async (id) => {
            setReportStatus(id, 'rejected');
            await refreshData();
          }}
          onDelete={async (id) => {
            removeReport(id);
            await refreshData();
          }}
          onChangeType={async (id, newType) => {
            updateReportType(id, newType);
            await refreshData();
          }}
          onSelectReportOnMap={(lat, lng) => {
            // Center map if needed
          }}
          showToast={showToast}
        />

        {/* Scrolling Ticker Footer (desktop only) */}
        <div className="hidden lg:block">
          <TickerBanner
            currentLang={currentLang}
            counts={activeCounts}
            visitorCount={visitorCount}
            reports={[...publishedAllReports, ...pendingAllReports]}
          />
        </div>

        {/* Code Audit & Diagnostic Modal */}
        <AuditModal
          isOpen={isAuditOpen}
          onClose={() => setIsAuditOpen(false)}
        />

        {/* Recent 5 Reports Feed Modal */}
        <RecentFeedModal
          isOpen={isRecentFeedOpen}
          onClose={() => setIsRecentFeedOpen(false)}
          reports={[...publishedAllReports, ...pendingAllReports]}
          currentLang={currentLang}
          onSelectReport={(r) => {
            showToast(`Signalement #${r.id} sélectionné (${r.type})`);
          }}
        />

        {/* Quartiers / Statistiques / Paramètres slide-in panel */}
        <SidePanel
          mode={sidePanelMode}
          onClose={() => setSidePanelMode(null)}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
          activeSector={activeSector}
          onSectorChange={setActiveSector}
          counts={activeCounts}
          onOpenAudit={() => { setSidePanelMode(null); setIsAuditOpen(true); }}
          onOpenInstall={() => { setSidePanelMode(null); setIsInstallOpen(true); }}
        />

        {/* PWA App Download / Install Modal */}
        {isInstallOpen && (
          <InstallModal
            currentLang={currentLang}
            onClose={() => setIsInstallOpen(false)}
            deferredPrompt={deferredPrompt}
            onInstallClick={handleInstallAppClick}
          />
        )}

        {/* Discrete Background Auto-Sync Notification Pill */}
        {syncPillMsg && (
          <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[1100] animate-bounce pointer-events-none">
            <div className="bg-slate-900/95 text-cyan-300 font-bold text-xs px-4 py-2 rounded-full border border-cyan-500/40 shadow-xl shadow-cyan-950/80 backdrop-blur flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span>{syncPillMsg}</span>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="toast show" role="status" aria-live="polite">
            {toastMessage}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentLang={currentLang}
        pendingCount={pendingAllReports.length}
        onOpenWizard={handleOpenWizard}
        onOpenReports={() => setIsRecentFeedOpen(true)}
        onOpenNotifications={() => setIsRecentFeedOpen(true)}
        onOpenAccount={() => setIsAdminOpen(true)}
      />
    </div>
  );
}
