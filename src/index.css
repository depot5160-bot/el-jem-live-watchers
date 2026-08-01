import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Globe, Map as MapIcon, Satellite, Compass, Sparkles } from 'lucide-react';
import { OutageReport, OutageType, Language } from './types';
import { EL_JEM_CENTER, EL_JEM_SECTORS, EL_JEM_LANDMARKS, LOGOS_IMAGES, TRANSLATIONS, TYPE_COLORS, getReportCompanyLogo } from './constants';

interface MapComponentProps {
  approvedReports: OutageReport[];
  pendingReports: OutageReport[];
  showPending: boolean;
  activeFilter: OutageType | null;
  activeSector?: string;
  currentLang: Language;
  isPickingManual: boolean;
  mapMode?: 'satellite' | 'street';
  onMapModeChange?: (mode: 'satellite' | 'street') => void;
  onCenterChange?: (lat: number, lng: number) => void;
  onSignalRestoration: (reportId: string) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  approvedReports,
  pendingReports,
  showPending,
  activeFilter,
  activeSector = 'all',
  currentLang,
  isPickingManual,
  mapMode: controlledMapMode,
  onMapModeChange,
  onCenterChange,
  onSignalRestoration
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const approvedLayerRef = useRef<L.LayerGroup | null>(null);
  const pendingLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLabelsRef = useRef<L.TileLayer | null>(null);

  const [localMapMode, setLocalMapMode] = useState<'satellite' | 'street'>('satellite');
  const mapMode = controlledMapMode ?? localMapMode;

  const setMapMode = (mode: 'satellite' | 'street') => {
    if (onMapModeChange) {
      onMapModeChange(mode);
    }
    setLocalMapMode(mode);
  };

  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevSectorRef = useRef<string>(activeSector);

  const isAr = currentLang === 'ar';

  const triggerHaptic = (ms = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch { /* ignore */ }
    }
  };

  function escapeHtml(s: string) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // Icon Generator with Restored & Top 5 Indicator support.
  // Design final: carré fond translucide + flou, bordure fine unique (pas de halo colore),
  // triangle colore uniquement quand il n'y a pas de logo, clignotement applique
  // directement sur le contour du marqueur pour les "5 derniers signalements"
  // (jamais un anneau ou un point separe).
  function makeIcon(type: OutageType, isPending = false, logoUrl: string | null = null, isTop5 = false, restored = false) {
    const whiteIconSvg = type === 'eau'
      ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z"/></svg>`
      : type === 'elec'
      ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>`
      : type === 'sonore'
      ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`
      : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>`;

    const top5SquareClass = isTop5 ? 'top5-blink-square' : '';
    const top5TriangleClass = isTop5 ? 'top5-blink-triangle' : '';

    if (restored) {
      return L.divIcon({
        className: '',
        html: `
          <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
            <div class="${top5SquareClass}" style="width:38px; height:38px; border-radius:8px; background:rgba(15,23,42,0.35); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); border:1px solid rgba(51, 65, 85, 0.7); display:flex; align-items:center; justify-content:center; overflow:hidden; padding:4px;">
              ${logoUrl ? `<img src="${logoUrl}" style="width:100%;height:100%;object-fit:contain;display:block;" alt="">` : `<span style="font-size:16px;">✅</span>`}
            </div>
            <div style="position:absolute; bottom:-2px; right:-2px; background:#10B981; color:#FFF; font-size:11px; font-weight:900; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #FFF;">✓</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
        tooltipAnchor: [0, -20]
      });
    }

    if (logoUrl) {
      const animClass = isPending ? 'pending-marker-anim' : '';

      return L.divIcon({
        className: '',
        html: `<div style="position:relative;width:38px;height:38px;">
          <div class="${animClass} ${top5SquareClass}" style="width:38px;height:38px;border-radius:8px;background:rgba(15,23,42,0.35);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:1px solid rgba(51,65,85,0.7);display:flex;align-items:center;justify-content:center;overflow:hidden;padding:4px;">
            <img src="${logoUrl}" style="width:100%;height:100%;object-fit:contain;display:block;" alt="">
          </div>
        </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -19],
        tooltipAnchor: [0, -19]
      });
    }

    // Pas de logo: forme triangle avec bordures CSS, seule couleur du type restante
    const animClass = isPending ? 'pending-marker-anim' : '';

    return L.divIcon({
      className: '',
      html: `
        <div class="${animClass} ${top5TriangleClass}" style="position:relative; width:30px; height:26px; display:flex; align-items:center; justify-content:center;">
          <div style="width:0; height:0; border-left:15px solid transparent; border-right:15px solid transparent; border-bottom:26px solid ${TYPE_COLORS[type]}; position:absolute; top:0; left:0;"></div>
          <div style="position:absolute; top:7px; left:50%; transform:translateX(-50%); display:flex; align-items:center; justify-content:center;">
            ${whiteIconSvg}
          </div>
        </div>
      `,
      iconSize: [30, 26],
      iconAnchor: [15, 13],
      popupAnchor: [0, -13],
      tooltipAnchor: [0, -13]
    });
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 20
    }).setView(EL_JEM_CENTER, 15);

    // 1. High Definition Satellite Imagery (Esri World Imagery HD)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
      maxNativeZoom: 19
    });
    satelliteLayerRef.current = satelliteLayer;

    // 2. High Contrast Boundaries & Labels Overlay
    const satelliteLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
      maxNativeZoom: 19,
      pane: 'overlayPane'
    });
    satelliteLabelsRef.current = satelliteLabels;

    // 3. High Reliability Street Map (OpenStreetMap Standard)
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '© OpenStreetMap contributors'
    });
    streetLayerRef.current = streetLayer;

    // Add default layers based on initial mapMode
    satelliteLayer.addTo(map);
    satelliteLabels.addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    approvedLayerRef.current = L.layerGroup().addTo(map);
    pendingLayerRef.current = L.layerGroup();

    // Landmarks Reference Layer
    const landmarksGroup = L.layerGroup().addTo(map);
    landmarksLayerRef.current = landmarksGroup;

    // Populate key landmarks / references on map without overloading
    EL_JEM_LANDMARKS.forEach(lm => {
      const landmarkIcon = L.divIcon({
        className: 'tactical-landmark-container',
        html: `
          <div class="tactical-landmark-badge">
            <span class="tactical-landmark-icon">${lm.icon}</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        tooltipAnchor: [0, -16],
        popupAnchor: [0, -16]
      });

      const lmMarker = L.marker([lm.lat, lm.lng], { icon: landmarkIcon });

      const lmTooltip = `
        <div class="tactical-landmark-tooltip">
          <div class="font-bold text-amber-300 text-xs">${escapeHtml(lm.nameFr)}</div>
          <div class="text-[11px] text-amber-100 font-['Cairo']" dir="rtl">${escapeHtml(lm.nameAr)}</div>
        </div>
      `;

      lmMarker.bindTooltip(lmTooltip, {
        className: 'dark-tactical-tooltip landmark-tooltip',
        direction: 'top',
        opacity: 0.95
      });

      lmMarker.addTo(landmarksGroup);
    });

    mapRef.current = map;

    // Attach global click delegate for popup restoration button
    (window as any).triggerSignalRestoration = (id: string) => {
      onSignalRestoration(id);
    };

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onSignalRestoration]);

  // Dynamic Tile Layer Switcher Effect
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !satelliteLayerRef.current || !satelliteLabelsRef.current || !streetLayerRef.current) return;

    if (mapMode === 'satellite') {
      if (map.hasLayer(streetLayerRef.current)) {
        map.removeLayer(streetLayerRef.current);
      }
      if (!map.hasLayer(satelliteLayerRef.current)) {
        satelliteLayerRef.current.addTo(map);
      }
      if (!map.hasLayer(satelliteLabelsRef.current)) {
        satelliteLabelsRef.current.addTo(map);
      }
    } else {
      if (map.hasLayer(satelliteLayerRef.current)) {
        map.removeLayer(satelliteLayerRef.current);
      }
      if (map.hasLayer(satelliteLabelsRef.current)) {
        map.removeLayer(satelliteLabelsRef.current);
      }
      if (!map.hasLayer(streetLayerRef.current)) {
        streetLayerRef.current.addTo(map);
      }
    }
  }, [mapMode]);

  // Center change handler during manual pick
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMove = () => {
      if (isPickingManual && onCenterChange) {
        const c = map.getCenter();
        onCenterChange(c.lat, c.lng);
      }
    };

    map.on('move', handleMove);
    map.on('moveend', handleMove);

    return () => {
      map.off('move', handleMove);
      map.off('moveend', handleMove);
    };
  }, [isPickingManual, onCenterChange]);

  // Smooth Dynamic flyTo & transition animation when sector changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (prevSectorRef.current !== activeSector) {
      prevSectorRef.current = activeSector;
      const sectorObj = EL_JEM_SECTORS.find(s => s.id === activeSector);

      if (sectorObj) {
        setIsTransitioning(true);
        map.flyTo(sectorObj.center, sectorObj.zoom, {
          animate: true,
          duration: 1.4,
          easeLinearity: 0.25
        });

        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, 1300);

        return () => clearTimeout(timer);
      }
    }
  }, [activeSector]);

  // Update Markers when reports or active filter changes
  useEffect(() => {
    if (!mapRef.current || !approvedLayerRef.current || !pendingLayerRef.current) return;

    const map = mapRef.current;
    const appLayer = approvedLayerRef.current;
    const pendLayer = pendingLayerRef.current;

    appLayer.clearLayers();
    pendLayer.clearLayers();

    if (showPending) {
      if (!map.hasLayer(pendLayer)) pendLayer.addTo(map);
    } else {
      if (map.hasLayer(pendLayer)) map.removeLayer(pendLayer);
    }

    const allReports = [...approvedReports, ...pendingReports].sort((a, b) => b.createdAt - a.createdAt);
    const top5Ids = new Set(allReports.slice(0, 5).map(r => r.id));

    const filteredApproved = activeFilter
      ? approvedReports.filter(r => r.type === activeFilter)
      : approvedReports;

    const filteredPending = activeFilter
      ? pendingReports.filter(r => r.type === activeFilter)
      : pendingReports;

    const t = TRANSLATIONS[currentLang];

    filteredApproved.forEach(r => {
      const logoUrl = getReportCompanyLogo(r);
      const isTop5 = top5Ids.has(r.id);
      const isRestored = Boolean(r.restored);

      const marker = L.marker([r.lat, r.lng], {
        icon: makeIcon(r.type, false, logoUrl, isTop5, isRestored)
      });

      // Strict 24-hour time formatting
      const time24 = new Date(r.createdAt).toLocaleString(currentLang === 'ar' ? 'ar-TN' : 'fr-FR', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false
      });
      const timeOnly24 = new Date(r.createdAt).toLocaleTimeString(currentLang === 'ar' ? 'ar-TN' : 'fr-FR', {
        hour: '2-digit', minute: '2-digit', hour12: false
      });

      const typeKey = r.type === 'eau' ? 'popupWater' : (r.type === 'elec' ? 'popupElec' : (r.type === 'net' ? 'popupNet' : 'popupSonore'));

      // Sector lookup
      const secObj = EL_JEM_SECTORS.find(s => s.id === r.sector);
      const sectorName = secObj ? (currentLang === 'ar' ? secObj.ar : secObj.fr) : null;

      const logoHtml = `<div class="tactical-popup-logo"><img src="${logoUrl}" alt="Logo"></div>`;

      let content = `<div class="tactical-popup-card">`;
      content += `<div class="tactical-popup-header">` + logoHtml + `<div class="tactical-popup-title" style="color:${isRestored ? '#10B981' : TYPE_COLORS[r.type]}">${t[typeKey]}</div></div>`;

      if (isRestored) {
        const restoredTime24 = r.restoredAt ? new Date(r.restoredAt).toLocaleTimeString(currentLang === 'ar' ? 'ar-TN' : 'fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
        content += `<div class="tactical-badge-restored">✓ ${t.restoredBadge} ${restoredTime24 ? `(${restoredTime24})` : ''}</div>`;
      } else if (isTop5) {
        content += `<div class="tactical-badge-top5">🚨 5 DERNIERS SIGNALEMENTS</div>`;
      }

      if (sectorName) content += `<div class="tactical-sector-badge">📍 ${escapeHtml(sectorName)}</div>`;
      if (r.isp) content += `<div class="tactical-isp-tag">Société: ${escapeHtml(r.isp)}</div>`;
      if (r.note) content += `<div class="tactical-popup-note">${escapeHtml(r.note)}</div>`;
      content += `<div class="tactical-popup-time">🕒 ${t.signalTime.replace('{time}', time24)}</div>`;

      if (!isRestored) {
        content += `
          <div class="tactical-popup-action">
            <button
              onclick="window.triggerSignalRestoration('${r.id}')"
              class="tactical-restore-btn"
            >
              ${t.markRestoredBtn}
            </button>
          </div>
        `;
      }
      content += `</div>`;

      // Custom Dark Tactical Tooltip for quick hover preview
      const tooltipContent = `
        <div class="tactical-tooltip-inner">
          <span class="tactical-tooltip-dot" style="background:${isRestored ? '#10B981' : TYPE_COLORS[r.type]}"></span>
          <span class="font-bold">${t[typeKey]}</span>
          ${sectorName ? `<span class="opacity-80"> • ${escapeHtml(sectorName)}</span>` : ''}
          <span class="tactical-tooltip-time">${timeOnly24}</span>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        className: 'dark-tactical-tooltip',
        direction: 'top',
        opacity: 1
      });

      marker.bindPopup(content, {
        className: 'dark-tactical-popup',
        closeButton: true,
        autoPan: true
      });

      marker.addTo(appLayer);
    });

    filteredPending.forEach(r => {
      const logoUrl = getReportCompanyLogo(r);
      const isTop5 = top5Ids.has(r.id);
      const isRestored = Boolean(r.restored);

      const marker = L.marker([r.lat, r.lng], {
        icon: makeIcon(r.type, true, logoUrl, isTop5, isRestored)
      });

      const time24 = new Date(r.createdAt).toLocaleString(currentLang === 'ar' ? 'ar-TN' : 'fr-FR', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false
      });
      const timeOnly24 = new Date(r.createdAt).toLocaleTimeString(currentLang === 'ar' ? 'ar-TN' : 'fr-FR', {
        hour: '2-digit', minute: '2-digit', hour12: false
      });

      const typeKey = r.type === 'eau' ? 'popupWater' : (r.type === 'elec' ? 'popupElec' : (r.type === 'net' ? 'popupNet' : 'popupSonore'));

      const secObj = EL_JEM_SECTORS.find(s => s.id === r.sector);
      const sectorName = secObj ? (currentLang === 'ar' ? secObj.ar : secObj.fr) : null;

      const logoHtml = `<div class="tactical-popup-logo"><img src="${logoUrl}" alt="Logo"></div>`;

      let content = `<div class="tactical-popup-card">`;
      content += `<div class="tactical-popup-header">` + logoHtml + `<div class="tactical-popup-title" style="color:${TYPE_COLORS[r.type]}">${t[typeKey]}</div></div>`;
      content += `<div class="tactical-pending-tag">${t.popupPending}</div>`;

      if (isTop5) content += `<div class="tactical-badge-top5">🚨 5 DERNIERS SIGNALEMENTS</div>`;
      if (sectorName) content += `<div class="tactical-sector-badge">📍 ${escapeHtml(sectorName)}</div>`;
      if (r.isp) content += `<div class="tactical-isp-tag">Société: ${escapeHtml(r.isp)}</div>`;
      if (r.note) content += `<div class="tactical-popup-note">${escapeHtml(r.note)}</div>`;
      content += `<div class="tactical-popup-time">🕒 ${t.signalTime.replace('{time}', time24)}</div>`;
      content += `</div>`;

      const tooltipContent = `
        <div class="tactical-tooltip-inner">
          <span class="tactical-tooltip-dot" style="background:${TYPE_COLORS[r.type]}"></span>
          <span class="font-bold">${t[typeKey]} (${t.popupPending})</span>
          <span class="tactical-tooltip-time">${timeOnly24}</span>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        className: 'dark-tactical-tooltip',
        direction: 'top',
        opacity: 1
      });

      marker.bindPopup(content, {
        className: 'dark-tactical-popup',
        closeButton: true,
        autoPan: true
      });

      marker.addTo(pendLayer);
    });
  }, [approvedReports, pendingReports, showPending, activeFilter, currentLang]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div id="map" ref={mapContainerRef} className="w-full h-full" />
      <div className={`map-sector-zoom-overlay ${isTransitioning ? 'active' : ''}`} />

      {/* Satellite / Street Map Layer Switcher Floating Widget (Bottom Right) */}
      <div
        className="absolute bottom-20 right-4 sm:bottom-6 sm:right-16 z-[400] flex items-center p-1 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl gap-1"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setMapMode('satellite');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mapMode === 'satellite'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
          }`}
          title={isAr ? 'قمر صناعي' : 'Satellite'}
        >
          <Satellite className={`w-3.5 h-3.5 shrink-0 ${mapMode === 'satellite' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>{isAr ? 'قمر صناعي' : 'Satellite'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setMapMode('street');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mapMode === 'street'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
          }`}
          title={isAr ? 'خريطة الشوارع' : 'Carte & Rues'}
        >
          <MapIcon className={`w-3.5 h-3.5 shrink-0 ${mapMode === 'street' ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>{isAr ? 'خريطة الشوارع' : 'Carte & Rues'}</span>
        </button>
      </div>
    </div>
  );
};
