import React, { useState } from 'react';
import { ISPType, Language, OutageType } from './types';
import { EL_JEM_SECTORS, LOGOS_IMAGES, TRANSLATIONS } from './constants';

interface WizardModalProps {
  isOpen: boolean;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onClose: () => void;
  onSubmit: (report: { type: OutageType; isp?: ISPType | null; sector?: string; note?: string; lat: number; lng: number }) => Promise<void>;
  onStartManualPick: () => void;
  userPos: { lat: number; lng: number } | null;
  isLocationValidated: boolean;
  locStatusMessage: string;
}

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen,
  currentLang,
  onLanguageChange,
  onClose,
  onSubmit,
  onStartManualPick,
  userPos,
  isLocationValidated,
  locStatusMessage
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<OutageType | null>(null);
  const [selectedISP, setSelectedISP] = useState<ISPType | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('centre');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang];

  const triggerHaptic = (ms: number | number[] = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        // ignore if unsupported or permission blocked
      }
    }
  };

  const handleNextStep = () => {
    triggerHaptic(20);
    if (step === 1 && (!isLocationValidated || !userPos)) return;
    if (step === 2 && (!selectedType || (selectedType === 'net' && !selectedISP))) return;
    setStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    triggerHaptic(12);
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!selectedType || !userPos || !isLocationValidated || isSubmitting) return;
    triggerHaptic([30, 50, 30]);
    setIsSubmitting(true);
    await onSubmit({
      type: selectedType,
      isp: selectedISP,
      sector: selectedSector,
      note,
      lat: userPos.lat,
      lng: userPos.lng
    });
    setIsSubmitting(false);
    setNote('');
    setSelectedType(null);
    setSelectedISP(null);
    setSelectedSector('centre');
    setStep(1);
  };

  return (
    <div className="overlay show" role="dialog" aria-modal="true" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="sheet relative font-['Cairo','Plus_Jakarta_Sans',sans-serif]">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(12);
              onLanguageChange(currentLang === 'fr' ? 'ar' : 'fr');
            }}
            className="text-sm font-extrabold px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors flex items-center gap-1.5 shadow-sm"
            title="Changer de langue / تغيير اللغة"
          >
            <span>🌐</span>
            <span>{currentLang === 'fr' ? 'العربية 🇹🇳' : 'Français 🇫🇷'}</span>
          </button>

          <button 
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="text-slate-500 hover:text-slate-900 text-2xl font-black w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="step-content active pt-4">
            <h2>{t.stepLocTitle}</h2>
            <p className="sub">{t.stepLocSub}</p>

            <div className="loc-status-box">
              <span>{locStatusMessage}</span>
              <button 
                className="loc-action-btn"
                onClick={() => {
                  triggerHaptic(15);
                  onStartManualPick();
                }}
              >
                {t.locManualBtn}
              </button>
            </div>

            <div className="btn-row">
              <button className="btn btn-cancel" onClick={() => {
                triggerHaptic(10);
                onClose();
              }}>
                {t.backBtn}
              </button>
              <button 
                className={`btn btn-submit ${(!isLocationValidated || !userPos) ? 'disabled-nav' : ''}`}
                onClick={handleNextStep}
                disabled={!isLocationValidated || !userPos}
              >
                {t.nextBtn}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Outage Type & ISP */}
        {step === 2 && (
          <div className="step-content active pt-4">
            <h2>{t.stepTypeTitle}</h2>
            <p className="sub">{t.stepTypeSub}</p>

            <div className="type-grid">
              <button 
                type="button"
                className={`type-btn ${selectedType === 'eau' ? 'active' : ''}`}
                data-type="eau"
                onClick={() => {
                  triggerHaptic(15);
                  setSelectedType('eau');
                  setSelectedISP(null);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z"/>
                </svg>
                <span>{t.water}</span>
              </button>

              <button 
                type="button"
                className={`type-btn ${selectedType === 'elec' ? 'active' : ''}`}
                data-type="elec"
                onClick={() => {
                  triggerHaptic(15);
                  setSelectedType('elec');
                  setSelectedISP(null);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>
                </svg>
                <span>{t.elec}</span>
              </button>

              <button 
                type="button"
                className={`type-btn ${selectedType === 'net' ? 'active' : ''}`}
                data-type="net"
                onClick={() => {
                  triggerHaptic(15);
                  setSelectedType('net');
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>
                </svg>
                <span>{t.net}</span>
              </button>
            </div>

            {selectedType === 'net' && (
              <div className="mb-4">
                <p className="text-xs font-bold mb-2 text-stone-800">{t.ispLabel}</p>
                <div className="isp-grid">
                  <button 
                    type="button" 
                    className={`isp-btn ${selectedISP === 'Tunisie Telecom' ? 'active' : ''}`}
                    onClick={() => {
                      triggerHaptic(15);
                      setSelectedISP('Tunisie Telecom');
                    }}
                  >
                    <span className="isp-logo"><img src={LOGOS_IMAGES.tt} alt="TT" /></span>
                    <span>Tunisie Telecom</span>
                  </button>

                  <button 
                    type="button" 
                    className={`isp-btn ${selectedISP === 'Orange Tunisie' ? 'active' : ''}`}
                    onClick={() => {
                      triggerHaptic(15);
                      setSelectedISP('Orange Tunisie');
                    }}
                  >
                    <span className="isp-logo"><img src={LOGOS_IMAGES.orange} alt="Orange" /></span>
                    <span>Orange Tunisie</span>
                  </button>

                  <button 
                    type="button" 
                    className={`isp-btn ${selectedISP === 'Ooredoo Tunisie' ? 'active' : ''}`}
                    onClick={() => {
                      triggerHaptic(15);
                      setSelectedISP('Ooredoo Tunisie');
                    }}
                  >
                    <span className="isp-logo"><img src={LOGOS_IMAGES.ooredoo} alt="Ooredoo" /></span>
                    <span>Ooredoo Tunisie</span>
                  </button>

                  <button 
                    type="button" 
                    className={`isp-btn ${selectedISP === 'Bee / Topnet / GNet' ? 'active' : ''}`}
                    onClick={() => {
                      triggerHaptic(15);
                      setSelectedISP('Bee / Topnet / GNet');
                    }}
                  >
                    <span className="isp-logo"><img src={LOGOS_IMAGES.topnet} alt="Topnet" /></span>
                    <span>Bee / Topnet / GNet</span>
                  </button>
                </div>
              </div>
            )}

            <div className="btn-row">
              <button className="btn btn-cancel" onClick={handleBackStep}>
                {t.backBtn}
              </button>
              <button 
                className="btn btn-submit"
                onClick={handleNextStep}
                disabled={!selectedType || (selectedType === 'net' && !selectedISP)}
              >
                {t.nextBtn}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details & Submit */}
        {step === 3 && (
          <div className="step-content active pt-4">
            <h2>{t.stepDetailsTitle}</h2>
            <p className="sub">{t.stepDetailsSub}</p>

            {/* Neighborhood / Sector selection */}
            <div className="mb-3 text-left rtl:text-right">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                📍 {t.sectorLabel || "Secteur / Quartier :"}
              </label>
              <select
                value={selectedSector}
                onChange={e => setSelectedSector(e.target.value)}
                className="w-full bg-stone-100 border border-stone-300 rounded-lg p-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-['Cairo','Plus_Jakarta_Sans',sans-serif]"
              >
                {EL_JEM_SECTORS.filter(s => s.id !== 'all').map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {currentLang === 'ar' ? sec.ar : sec.fr}
                  </option>
                ))}
              </select>
            </div>

            <textarea 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={t.notePlaceholder}
              maxLength={180}
            />

            <div className="btn-row">
              <button className="btn btn-cancel" onClick={handleBackStep}>
                {t.backBtn}
              </button>
              <button 
                className="btn btn-submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? t.submitSending : t.submitBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
