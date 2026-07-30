import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Globe, Map as MapIcon, Satellite, Compass, Sparkles } from 'lucide-react';
import { OutageReport, OutageType, Language } from '../types';
import { EL_JEM_CENTER, EL_JEM_SECTORS, EL_JEM_LANDMARKS, LOGOS_IMAGES, TRANSLATIONS, TYPE_COLORS } from '../constants';

interface MapComponentProps {
  approvedReports: OutageReport[];
  pendingReports: OutageReport[];
  showPending: boolean;
  activeFilter: OutageType | null;
  activeSector?: string;
  currentLang: Language;
  isPickingManual: boolean;
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

  const [mapMode, setMapMode] = useState<'satellite' | 'street'>('satellite');
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

  // Icon Generator with Restored & Top 5 Indicator support
  function makeIcon(type: OutageType, isPending = false, logoUrl: string | null = null, isTop5 = false, restored = false) {
    if (restored) {
      return L.divIcon({
        className: isTop5 ? 'beacon-top5-container' : '',
        html: `
          <div style="position:relative; width:38px; height:38px; display:flex; align-items:center; justify-content:center;">
            <div style="width:36px; height:36px; border-radius:50%; background:#0B132B; border:3px solid #10B981; box-shadow:0 0 16px #10B981; display:flex; align-items:center; justify-content:center; overflow:hidden;">
              ${logoUrl ? `<img src="${logoUrl}" style="width:22px;height:22px;object-fit:contain;" alt="">` : `<span style="font-size:16px;">✅</span>`}
            </div>
            <div style="position:absolute; bottom:-2px; right:-2px; background:#10B981; color:#FFF; font-size:10px; font-weight:900; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #FFF;">✓</div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
        tooltipAnchor: [0, -38]
      });
    }

    if (isPending) {
      return L.divIcon({
        className: isTop5 ? 'beacon-top5-container' : '',
        html: `${isTop5 ? '<div class="beacon-top5-ring"></div>' : ''}<div class="pending-marker-anim ${isTop5 ? 'beacon-top5' : ''}" style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${TYPE_COLORS[type]};transform:rotate(-45deg);border:3px solid #FFF;box-shadow:0 0 16px ${TYPE_COLORS[type]};display:flex;align-items:center;justify-content:center;"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
        tooltipAnchor: [0, -28]
      });
    }

    if (logoUrl) {
      return L.divIcon({
        className: isTop5 ? 'beacon-top5-container' : '',
        html: `${isTop5 ? '<div class="beacon-top5-ring"></div>' : ''}<div class="${isTop5 ? 'beacon-top5' : ''}" style="width:34px;height:34px;border-radius:50%;background:#0F172A;box-shadow:0 4px 16px ${TYPE_COLORS[type]};border:3px solid ${TYPE_COLORS[type]};display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;"><img src="${logoUrl}" style="width:22px;height:22px;object-fit:contain;display:block;" alt=""></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
        tooltipAnchor: [0, -34]
      });
    }

    return L.divIcon({
      className: isTop5 ? 'beacon-top5-container' : '',
      html: `${isTop5 ? '<div class="beacon-top5-ring"></div>' : ''}<div class="${isTop5 ? 'beacon-top5' : ''}" style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${TYPE_COLORS[type]};transform:rotate(-45deg);box-shadow:0 4px 16px ${TYPE_COLORS[type]};border:2px solid #FFF;"></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26],
      tooltipAnchor: [0, -26]
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
      let logoUrl: string | null = null;
      if (r.type === 'eau') logoUrl = LOGOS_IMAGES.sonded;
      else if (r.type === 'elec') logoUrl = LOGOS_IMAGES.steg;
      else if (r.type === 'net' && r.isp) {
        if (r.isp.includes('Tunisie Telecom')) logoUrl = LOGOS_IMAGES.tt;
        else if (r.isp.includes('Orange')) logoUrl = LOGOS_IMAGES.orange;
        else if (r.isp.includes('Ooredoo')) logoUrl = LOGOS_IMAGES.ooredoo;
        else logoUrl = LOGOS_IMAGES.topnet;
      }

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

      const typeKey = r.type === 'eau' ? 'popupWater' : (r.type === 'elec' ? 'popupElec' : 'popupNet');

      // Sector lookup
      const secObj = EL_JEM_SECTORS.find(s => s.id === r.sector);
      const sectorName = secObj ? (currentLang === 'ar' ? secObj.ar : secObj.fr) : null;

      let logoHtml = '';
      if (r.type === 'eau') logoHtml = `<div class="tactical-popup-logo"><img src="${LOGOS_IMAGES.sonded}" alt="SONEDE"></div>`;
      else if (r.type === 'elec') logoHtml = `<div class="tactical-popup-logo"><img src="${LOGOS_IMAGES.steg}" alt="STEG"></div>`;
      else if (r.type === 'net' && r.isp) {
        const ispKey = r.isp.includes('Tunisie Telecom') ? 'tt' : r.isp.includes('Orange') ? 'orange' : r.isp.includes('Ooredoo') ? 'ooredoo' : 'topnet';
        logoHtml = `<div class="tactical-popup-logo"><img src="${LOGOS_IMAGES[ispKey]}" alt="${escapeHtml(r.isp)}"></div>`;
      }

      let content = `<div class="tactical-popup-card">`;
      content += `<div class="tactical-popup-header">` + logoHtml + `<div class="tactical-popup-title" style="color:${isRestored ? '#10B981' : TYPE_COLORS[r.type]}">${t[typeKey]}</div></div>`;

      if (isRestored) {
        const restoredTime24 = r.restoredAt ? new Date(r.restoredAt).toLocaleTimeString(currentLang === 'ar' ? 'ar-TN' : 'fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
        content += `<div class="tactical-badge-restored">✓ ${t.restoredBadge} ${restoredTime24 ? `(${restoredTime24})` : ''}</div>`;
      } else if (isTop5) {
        content += `<div class="tactical-badge-top5">🚨 5 DERNIERS SIGNALEMENTS</div>`;
      }

      if (sectorName) content += `<div class="tactical-sector-badge">📍 ${escapeHtml(sectorName)}</div>`;
      if (r.isp) content += `<div class="tactical-isp-tag">FAI: ${escapeHtml(r.isp)}</div>`;
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
      const isTop5 = top5Ids.has(r.id);
      const isRestored = Boolean(r.restored);

      const marker = L.marker([r.lat, r.lng], { 
        icon: makeIcon(r.type, true, null, isTop5, isRestored) 
      });

      const time24 = new Date(r.createdAt).toLocaleString(currentLang === 'ar' ? 'ar-TN' : 'fr-FR', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false
      });
      const timeOnly24 = new Date(r.createdAt).toLocaleTimeString(currentLang === 'ar' ? 'ar-TN' : 'fr-FR', {
        hour: '2-digit', minute: '2-digit', hour12: false
      });

      const typeKey = r.type === 'eau' ? 'popupWater' : (r.type === 'elec' ? 'popupElec' : 'popupNet');

      const secObj = EL_JEM_SECTORS.find(s => s.id === r.sector);
      const sectorName = secObj ? (currentLang === 'ar' ? secObj.ar : secObj.fr) : null;

      let content = `<div class="tactical-popup-card">`;
      content += `<div class="tactical-popup-title" style="color:${TYPE_COLORS[r.type]}">${t[typeKey]}</div>`;
      content += `<div class="tactical-pending-tag">${t.popupPending}</div>`;

      if (isTop5) content += `<div class="tactical-badge-top5">🚨 5 DERNIERS SIGNALEMENTS</div>`;
      if (sectorName) content += `<div class="tactical-sector-badge">📍 ${escapeHtml(sectorName)}</div>`;
      if (r.isp) content += `<div class="tactical-isp-tag">FAI: ${escapeHtml(r.isp)}</div>`;
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

      {/* Satellite / Street Map Layer Switcher Premium SVG Floating Widget */}
      <div 
        className="absolute bottom-16 left-4 z-[400] flex items-center p-1.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl gap-1.5"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setMapMode('satellite');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
            mapMode === 'satellite'
              ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-rose-500/30 border border-amber-300/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
          }`}
          title={isAr ? 'عرض القمر الصناعي بدقة عالية HD' : 'Vue Satellite HD'}
        >
          <Satellite className={`w-4 h-4 shrink-0 ${mapMode === 'satellite' ? 'text-amber-200 animate-pulse' : 'text-slate-400'}`} />
          <span className="tracking-wide">{isAr ? 'قمر صناعي HD' : 'Satellite HD'}</span>
          {mapMode === 'satellite' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setMapMode('street');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
            mapMode === 'street'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
          }`}
          title={isAr ? 'عرض خريطة الشوارع والحي' : 'Carte Routière'}
        >
          <MapIcon className={`w-4 h-4 shrink-0 ${mapMode === 'street' ? 'text-cyan-200 animate-pulse' : 'text-slate-400'}`} />
          <span className="tracking-wide">{isAr ? 'خريطة الشوارع' : 'Carte'}</span>
          {mapMode === 'street' && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
};

