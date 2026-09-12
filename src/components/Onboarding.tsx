/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS, LanguageCode } from '../types';
import { speakAnnouncement } from '../utils';
import { Globe, ArrowRight, Volume2, ShieldCheck, Music, Mic, Settings, Battery, Eye, Bell, Check, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import bellIcon from '../assets/images/app_icon_final_1789055983250.jpg';

interface OnboardingProps {
  onComplete: (lang: LanguageCode) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [lang, setLang] = useState<LanguageCode>('it');
  const [step, setStep] = useState<number>(-1);
  const [clickedSettings, setClickedSettings] = useState<Record<string, boolean>>({});
  const [mockToast, setMockToast] = useState<string | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);
  const [permStatus, setPermStatus] = useState<{
    notifications?: boolean;
    battery?: boolean;
    exactAlarms?: boolean;
    overlay?: boolean;
  }>({});

  // Query real-time permission status from native Android bridge
  const checkPermissions = useCallback(() => {
    const android = (window as any).Android;
    if (android && typeof android.getPermissionsStatus === 'function') {
      try {
        const raw = android.getPermissionsStatus();
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setPermStatus(parsed);
        }
      } catch (e) {
        console.error("Error reading permission status:", e);
      }
    }
  }, []);

  useEffect(() => {
    checkPermissions();
    const handleFocus = () => checkPermissions();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    const interval = setInterval(checkPermissions, 1500);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [checkPermissions]);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (mockToast) {
      const timer = setTimeout(() => {
        setMockToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [mockToast]);

  const t = TRANSLATIONS[lang];

  // Quick 1-tap setup orchestrator
  const handleQuickSetup = () => {
    const android = (window as any).Android;
    if (!android) {
      setPermStatus({
        battery: true,
        notifications: true,
        exactAlarms: true,
        overlay: true
      });
      setMockToast(
        lang === 'it'
          ? "Simulatore Web: tutte le autorizzazioni sono state contrassegnate come attive!"
          : "Web Simulator: all permissions marked active!"
      );
      return;
    }

    // 1. Direct battery prompt (system dialog 1-tap)
    if (!permStatus.battery) {
      if (typeof android.requestBatteryOptimizationDirect === 'function') {
        android.requestBatteryOptimizationDirect();
      } else if (typeof android.openBatteryOptimizationSettings === 'function') {
        android.openBatteryOptimizationSettings();
      }
      return;
    }

    // 2. Direct push notification prompt (Android 13+ system dialog 1-tap)
    if (!permStatus.notifications) {
      if (typeof android.requestNotificationPermission === 'function') {
        android.requestNotificationPermission();
      } else if (typeof android.openNotificationSettings === 'function') {
        android.openNotificationSettings();
      }
      return;
    }

    // 3. Exact alarms settings
    if (!permStatus.exactAlarms) {
      if (typeof android.openExactAlarmSettings === 'function') {
        android.openExactAlarmSettings();
      }
      return;
    }

    // 4. Lock screen / Fullscreen overlay
    if (!permStatus.overlay) {
      if (typeof android.openFullScreenIntentSettings === 'function') {
        android.openFullScreenIntentSettings();
      } else if (typeof android.openOverlaySettings === 'function') {
        android.openOverlaySettings();
      }
      return;
    }
  };

  const renderPermissionButton = (
    id: string,
    colorTheme: 'blue' | 'amber' | 'purple' | 'emerald' | 'rose',
    onClickAction: () => void,
    itText: string,
    enText: string,
    webExplanationIt: string,
    webExplanationEn: string,
    isActuallyGranted: boolean = false
  ) => {
    const isClicked = clickedSettings[id];
    const btnLabel = lang === 'it' ? itText : enText;
    const subLabel = lang === 'it' ? '(Tocca qui per applicare)' : '(Tap here to apply)';

    if (isActuallyGranted) {
      return (
        <div className="w-full mt-2">
          <button
            type="button"
            onClick={() => {
              const android = (window as any).Android;
              if (android) {
                onClickAction();
              } else {
                setMockToast(
                  lang === 'it'
                    ? "Questa autorizzazione è già concessa e attiva sul tuo dispositivo!"
                    : "This permission is already granted and active on your device!"
                );
              }
            }}
            className="w-full relative flex items-center justify-between py-2 px-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 font-extrabold text-xs transition-all hover:bg-emerald-100 active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span className="font-extrabold text-emerald-900 text-xs">
                {lang === 'it' ? '✓ Già Attivo sul Telefono' : '✓ Already Active'}
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 underline font-bold">
              {lang === 'it' ? 'Riapri' : 'Reopen'}
            </span>
          </button>
        </div>
      );
    }
    
    const themeStyles = {
      blue: {
        bg: 'bg-[#2563EB]',
        hover: 'hover:bg-[#1D4ED8]',
        pulse: 'animate-pulse-blue',
        text: 'text-white',
        border: 'border-[#2563EB]',
        activeGlow: 'shadow-[0_4px_12px_rgba(37,99,235,0.25)]',
      },
      amber: {
        bg: 'bg-[#D97706]',
        hover: 'hover:bg-[#B45309]',
        pulse: 'animate-pulse-amber',
        text: 'text-white',
        border: 'border-[#D97706]',
        activeGlow: 'shadow-[0_4px_12px_rgba(217,119,6,0.25)]',
      },
      purple: {
        bg: 'bg-[#9333EA]',
        hover: 'hover:bg-[#7E22CE]',
        pulse: 'animate-pulse-purple',
        text: 'text-white',
        border: 'border-[#9333EA]',
        activeGlow: 'shadow-[0_4px_12px_rgba(147,51,234,0.25)]',
      },
      emerald: {
        bg: 'bg-[#059669]',
        hover: 'hover:bg-[#047857]',
        pulse: 'animate-pulse-emerald',
        text: 'text-white',
        border: 'border-[#059669]',
        activeGlow: 'shadow-[0_4px_12px_rgba(5,150,105,0.25)]',
      },
      rose: {
        bg: 'bg-[#E11D48]',
        hover: 'hover:bg-[#BE123C]',
        pulse: 'animate-pulse-rose',
        text: 'text-white',
        border: 'border-[#E11D48]',
        activeGlow: 'shadow-[0_4px_12px_rgba(225,29,72,0.25)]',
      },
    }[colorTheme];

    const handleClick = () => {
      setClickedSettings(prev => ({ ...prev, [id]: true }));
      const android = (window as any).Android;
      if (android) {
        onClickAction();
      } else {
        setMockToast(lang === 'it' ? webExplanationIt : webExplanationEn);
      }
    };

    return (
      <div className="w-full mt-2">
        <button
          type="button"
          onClick={handleClick}
          className={`w-full relative flex flex-col items-center justify-center py-2.5 px-4 rounded-xl border font-extrabold text-center transition-all duration-300 active:scale-95 ${
            isClicked
              ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] shadow-sm'
              : `${themeStyles.bg} ${themeStyles.hover} ${themeStyles.text} ${themeStyles.border} ${themeStyles.pulse} ${themeStyles.activeGlow}`
          }`}
        >
          {isClicked && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white shadow-sm">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </span>
          )}
          
          <div className="flex items-center justify-center gap-1.5">
            {!isClicked && <span className="animate-bounce mr-0.5 text-sm">👉</span>}
            <span className={`text-xs tracking-wider uppercase font-extrabold ${isClicked ? 'pl-6 font-bold text-[#065F46]' : ''}`}>
              {isClicked 
                ? (lang === 'it' ? '✓ Configurazione Avviata' : '✓ Configuration Opened')
                : btnLabel
              }
            </span>
          </div>
          
          <span className={`text-[10px] font-medium mt-0.5 opacity-90 ${isClicked ? 'text-[#047857] pl-6' : 'text-white/90'}`}>
            {isClicked 
              ? (lang === 'it' ? '(Tocca di nuovo per riaprire)' : '(Tap again to reopen)')
              : subLabel
            }
          </span>
        </button>
      </div>
    );
  };

  // Vocalize step summary for senior acoustic reassurance (DISABLED)
  const speakCurrentStepInfo = (language: LanguageCode, currentStep: number) => {
    // Disabled as per user request: "la voce si senta solo per avvisare di prendere la medicina"
  };

  const handleLanguageSelect = (selectedLang: LanguageCode) => {
    setLang(selectedLang);
    speakCurrentStepInfo(selectedLang, 0);
  };

  const nextStep = () => {
    if (step < 3) {
      const nextS = step + 1;
      setStep(nextS);
      speakCurrentStepInfo(lang, nextS);
    } else {
      speakAnnouncement(lang === 'it' ? "Installazione completata! Benvenuto in Ricorda con Voce." : "Setup complete! Welcome to Ricorda con Voce.", lang, 0.85);
      onComplete(lang);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      const prevS = step - 1;
      setStep(prevS);
      speakCurrentStepInfo(lang, prevS);
    }
  };

  return (
    <div id="onboarding-root" className="fixed inset-0 bg-[#F0F4F8] z-50 flex flex-col font-sans text-[#1E293B] overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto p-5 sm:p-8 md:p-10 flex flex-col gap-6 pb-36">
          {/* Upper header section */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-base shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
                RCV
              </div>
              <span className="font-sans font-extrabold text-xl tracking-tight text-[#1E3A8A]">Ricorda con Voce</span>
            </div>
            <div className="flex items-center gap-2 bg-[#EFF6FF] py-1 px-3 rounded-full text-xs font-semibold text-[#1E40AF] border border-[#DBEAFE]">
              <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{lang.toUpperCase()}</span>
            </div>
          </header>

          {/* Main card illustration / text */}
          <main className="w-full">
            <AnimatePresence mode="wait">
              {step === -1 && (
                <motion.div
                  key="step-privacy"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                    <ShieldCheck className="w-10 h-10" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#1E3A8A]">
                      Informativa Privacy e Note di Utilizzo
                    </h2>
                    
                    <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm text-left max-h-[35vh] overflow-y-auto space-y-4 font-medium text-sm text-[#475569]">
                      <div>
                        <h3 className="font-extrabold text-[#1E293B] mb-1">📌 Note Generali</h3>
                        <p className="leading-relaxed">{t.medicalDisclaimer}</p>
                      </div>
                      <div className="h-px bg-slate-100 w-full" />
                      <div>
                        <h3 className="font-extrabold text-[#1E293B] mb-1">🛡️ Privacy Policy</h3>
                        <p className="leading-relaxed">{t.privacyText}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center"
                >
                  {/* Language Selector Box */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
                    <label className="block text-xs font-bold tracking-wider text-[#64748B] uppercase">{t.selectLanguage}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['it', 'en', 'es', 'fr', 'de'] as LanguageCode[]).map((l) => (
                        <button
                          id={`lang-btn-${l}`}
                          key={l}
                          onClick={() => handleLanguageSelect(l)}
                          className={`py-3 px-4 rounded-xl font-bold border-2 text-sm transition-all ${
                            lang === l
                              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md scale-102'
                              : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1E293B] border-[#E2E8F0]'
                          }`}
                        >
                          {l === 'it' && '🇮🇹 Italiano'}
                          {l === 'en' && '🇺🇸 English'}
                          {l === 'es' && '🇪🇸 Español'}
                          {l === 'fr' && '🇫🇷 Français'}
                          {l === 'de' && '🇩🇪 Deutsch'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* App logo illustration wrapper */}
                  <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-white shadow-md border border-[#E2E8F0] flex items-center justify-center p-2">
                    {!imgError ? (
                      <img
                        src={bellIcon}
                        alt="Ricorda con Voce Logo"
                        className="w-full h-full object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex flex-col items-center justify-center text-white shadow-inner p-3">
                        <Bell className="w-12 h-12 mb-1 drop-shadow-md animate-bounce" />
                        <span className="font-extrabold text-xs tracking-tight text-center">Ricorda con Voce</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#1E3A8A]">
                      {t.welcome}
                    </h1>
                    <p className="text-sm text-[#475569] leading-relaxed font-medium">
                      {t.welcomeDescription}
                    </p>

                    <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-left">
                      <p className="text-xs text-rose-700 font-bold leading-relaxed">
                        {t.medicalDisclaimer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] border border-[#DBEAFE]">
                    <Volume2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#1E3A8A]">
                      {t.stepVoiceTitle}
                    </h2>
                    <p className="text-sm text-[#475569] leading-relaxed font-medium">
                      {t.stepVoiceDesc}
                    </p>
                  </div>

                  <button
                    id="listen-test-btn"
                    onClick={() => speakCurrentStepInfo(lang, 1)}
                    className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] font-bold text-xs border border-[#DBEAFE] transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{t.testVoiceBtn}</span>
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] border border-[#DBEAFE]">
                    <Mic className="w-10 h-10" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#1E3A8A]">
                      {t.voiceStudioTitle}
                    </h2>
                    <p className="text-sm text-[#475569] leading-relaxed font-medium">
                      {t.voiceStudioSubtitle}
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 3 && (() => {
                const isBatteryGranted = !!permStatus.battery;
                const isNotificationsGranted = !!permStatus.notifications;
                const isExactAlarmsGranted = !!permStatus.exactAlarms;
                const isOverlayGranted = !!permStatus.overlay;
                const grantedCount = [isBatteryGranted, isNotificationsGranted, isExactAlarmsGranted, isOverlayGranted].filter(Boolean).length;
                const allGranted = grantedCount === 4;

                return (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3.5 text-left"
                  >
                    <div className="text-center space-y-1.5 mb-2">
                      <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 shadow-xs">
                        <Settings className="w-7 h-7 animate-spin-slow" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[#1E3A8A]">
                        {lang === 'it' 
                          ? 'Configurazione Guidata Android' 
                          : lang === 'es'
                          ? 'Configuración Guiada de Android'
                          : lang === 'fr'
                          ? 'Configuration Guidée Android'
                          : 'Guided Android Configuration'}
                      </h2>
                      <p className="text-xs text-[#64748B] font-medium leading-relaxed max-w-sm mx-auto">
                        {lang === 'it'
                          ? "Per far suonare e parlare i promemoria all'orario esatto (anche a schermo spento), bastano pochissimi secondi."
                          : "To make voice alarms sound and speak exactly on time (even when locked), it only takes a few seconds."}
                      </p>
                    </div>

                    {/* QUICK 1-TAP ACTION CARD */}
                    {allGranted ? (
                      <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <h3 className="font-black text-xs text-emerald-950 flex items-center gap-1.5">
                            {lang === 'it' ? '🎉 Configurazione Completata al 100%!' : '🎉 100% Configured!'}
                          </h3>
                          <p className="text-[11px] text-emerald-800 font-medium leading-tight">
                            {lang === 'it'
                              ? "Tutte le autorizzazioni sono attive. L'app suonerà sempre in perfetto orario!"
                              : "All permissions are active. Your alarms will always trigger on time!"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-gradient-to-br from-blue-50 via-indigo-50 to-amber-50 rounded-2xl border-2 border-blue-300 shadow-sm space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400 text-amber-950 font-black shadow-xs">
                              <Zap className="w-4 h-4 fill-amber-950 text-amber-950" />
                            </span>
                            <div>
                              <h3 className="font-extrabold text-xs text-slate-900 leading-tight">
                                {lang === 'it' ? 'Configura con 1 Tocco' : '1-Tap Quick Setup'}
                              </h3>
                              <p className="text-[10px] text-slate-600 font-medium">
                                {lang === 'it' ? 'Apre subito la richiesta del telefono a schermo' : 'Directly opens the system prompt'}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200 shrink-0">
                            {grantedCount} / 4 {lang === 'it' ? 'attivi' : 'active'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                            style={{ width: `${(grantedCount / 4) * 100}%` }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleQuickSetup}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                        >
                          <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                          <span>
                            {lang === 'it'
                              ? (!isBatteryGranted
                                  ? '⚡ 1 Tocco: Consenti Batteria Senza Limiti'
                                  : !isNotificationsGranted
                                  ? '🔔 1 Tocco: Consenti Notifiche'
                                  : !isExactAlarmsGranted
                                  ? '⏰ 1 Tocco: Attiva Sveglie Precise'
                                  : '📱 1 Tocco: Consenti Schermo Intero')
                              : '⚡ 1-Tap: Apply Next Permission'}
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="space-y-2.5 max-h-[36vh] overflow-y-auto pr-1">
                      {/* Item 1: Batteria senza restrizioni (Direct native 1-tap dialog) */}
                      <div className={`p-3 rounded-xl border transition-all ${
                        isBatteryGranted 
                          ? 'bg-emerald-50/50 border-emerald-200 shadow-xs' 
                          : 'bg-white border-[#E2E8F0] shadow-sm'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-2.5 flex-1">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs font-black ${
                              isBatteryGranted 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                : 'bg-amber-50 text-amber-600 border-amber-200'
                            }`}>
                              {isBatteryGranted ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                            </div>
                            <div className="space-y-0.5 flex-1">
                              <h3 className="font-extrabold text-xs text-[#1E293B] flex items-center gap-1.5">
                                <Battery className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                {lang === 'it' ? 'Batteria Senza Restrizioni' : 'Disable Battery Optimization'}
                              </h3>
                              <p className="text-[11px] text-[#475569] leading-tight">
                                {lang === 'it' 
                                  ? "Impedisce al telefono di 'addormentare' l'app quando è in standby."
                                  : "Prevents Android from putting the app to sleep in standby."}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 flex items-center gap-1 ${
                            isBatteryGranted 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isBatteryGranted ? (
                              <><Check className="w-3 h-3 stroke-[3]" /> {lang === 'it' ? 'Attivo' : 'Active'}</>
                            ) : (
                              lang === 'it' ? 'Da Attivare' : 'To Activate'
                            )}
                          </span>
                        </div>
                        {renderPermissionButton(
                          'battery_optimization',
                          'amber',
                          () => {
                            const android = (window as any).Android;
                            if (android) {
                              if (typeof android.requestBatteryOptimizationDirect === 'function') {
                                android.requestBatteryOptimizationDirect();
                              } else if (typeof android.openBatteryOptimizationSettings === 'function') {
                                android.openBatteryOptimizationSettings();
                              }
                            }
                          },
                          '⚡ Consenti a 1 Tocco (Senza Limiti)',
                          '⚡ 1-Tap: Allow Unrestricted Battery',
                          'Questo pulsante attiva direttamente il prompt di sistema di Android per consentire a Ricorda con Voce di rimanere sempre attiva.',
                          'This button directly triggers Android system dialog to keep Ricorda con Voce unrestricted.',
                          isBatteryGranted
                        )}
                      </div>

                      {/* Item 2: Notifiche di sistema (Direct native prompt) */}
                      <div className={`p-3 rounded-xl border transition-all ${
                        isNotificationsGranted 
                          ? 'bg-emerald-50/50 border-emerald-200 shadow-xs' 
                          : 'bg-white border-[#E2E8F0] shadow-sm'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-2.5 flex-1">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs font-black ${
                              isNotificationsGranted 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}>
                              {isNotificationsGranted ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                            </div>
                            <div className="space-y-0.5 flex-1">
                              <h3 className="font-extrabold text-xs text-[#1E293B] flex items-center gap-1.5">
                                <Bell className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                {lang === 'it' ? 'Consenti Notifiche' : 'Allow Notifications'}
                              </h3>
                              <p className="text-[11px] text-[#475569] leading-tight">
                                {lang === 'it'
                                  ? "Consente gli avvisi sonori e le schede promemoria a comparsa."
                                  : "Enables audio alerts and visual reminder banners."}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 flex items-center gap-1 ${
                            isNotificationsGranted 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isNotificationsGranted ? (
                              <><Check className="w-3 h-3 stroke-[3]" /> {lang === 'it' ? 'Attivo' : 'Active'}</>
                            ) : (
                              lang === 'it' ? 'Da Attivare' : 'To Activate'
                            )}
                          </span>
                        </div>
                        {renderPermissionButton(
                          'notifications_permission',
                          'emerald',
                          () => {
                            const android = (window as any).Android;
                            if (android) {
                              if (typeof android.requestNotificationPermission === 'function') {
                                android.requestNotificationPermission();
                              } else if (typeof android.openNotificationSettings === 'function') {
                                android.openNotificationSettings();
                              }
                            }
                          },
                          '🔔 Consenti Notifiche',
                          '🔔 Allow Notifications',
                          'Questo pulsante richiede il permesso di notifica di Android.',
                          'This button requests standard Android notification access.',
                          isNotificationsGranted
                        )}
                      </div>

                      {/* Item 3: Sveglie Precise */}
                      <div className={`p-3 rounded-xl border transition-all ${
                        isExactAlarmsGranted 
                          ? 'bg-emerald-50/50 border-emerald-200 shadow-xs' 
                          : 'bg-white border-[#E2E8F0] shadow-sm'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-2.5 flex-1">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs font-black ${
                              isExactAlarmsGranted 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                : 'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                              {isExactAlarmsGranted ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                            </div>
                            <div className="space-y-0.5 flex-1">
                              <h3 className="font-extrabold text-xs text-[#1E293B] flex items-center gap-1.5">
                                <Bell className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                {lang === 'it' ? 'Sveglie e Promemoria Precisi' : 'Precise Alarms & Reminders'}
                              </h3>
                              <p className="text-[11px] text-[#475569] leading-tight">
                                {lang === 'it'
                                  ? "Garantisce che l'allarme scatti al minuto esatto impostato."
                                  : "Ensures alarms fire at the exact minute scheduled."}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 flex items-center gap-1 ${
                            isExactAlarmsGranted 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isExactAlarmsGranted ? (
                              <><Check className="w-3 h-3 stroke-[3]" /> {lang === 'it' ? 'Attivo' : 'Active'}</>
                            ) : (
                              lang === 'it' ? 'Da Attivare' : 'To Activate'
                            )}
                          </span>
                        </div>
                        {renderPermissionButton(
                          'precise_alarms',
                          'blue',
                          () => {
                            const android = (window as any).Android;
                            if (android && typeof android.openExactAlarmSettings === 'function') {
                              android.openExactAlarmSettings();
                            }
                          },
                          '⏰ Attiva Sveglie Precise',
                          '⏰ Enable Precise Alarms',
                          'Apre la sezione "Sveglie e promemoria" di Android per garantire precisione temporale assoluta.',
                          'Opens the Android Alarms & Reminders menu for high precision.',
                          isExactAlarmsGranted
                        )}
                      </div>

                      {/* Item 4: Schermo Intero / Sopra altre app (Oppo, Xiaomi, Realme, Samsung) */}
                      <div className={`p-3 rounded-xl border transition-all ${
                        isOverlayGranted 
                          ? 'bg-emerald-50/50 border-emerald-200 shadow-xs' 
                          : 'bg-white border-[#E2E8F0] shadow-sm'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-2.5 flex-1">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs font-black ${
                              isOverlayGranted 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                : 'bg-purple-50 text-purple-600 border-purple-200'
                            }`}>
                              {isOverlayGranted ? <Check className="w-4 h-4 stroke-[3]" /> : '4'}
                            </div>
                            <div className="space-y-0.5 flex-1">
                              <h3 className="font-extrabold text-xs text-[#1E293B] flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                {lang === 'it' ? 'Schermo Intero a Telefono Bloccato' : 'Full Screen on Lock Screen'}
                              </h3>
                              <p className="text-[11px] text-[#475569] leading-tight">
                                {lang === 'it'
                                  ? "Consente all'allarme di apparire a tutto schermo quando il display è spento o bloccato (essenziale per Oppo, Xiaomi, Realme)."
                                  : "Allows alarms to pop up full-screen over the lock screen (essential on Oppo, Xiaomi, Realme)."}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 flex items-center gap-1 ${
                            isOverlayGranted 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isOverlayGranted ? (
                              <><Check className="w-3 h-3 stroke-[3]" /> {lang === 'it' ? 'Attivo' : 'Active'}</>
                            ) : (
                              lang === 'it' ? 'Da Attivare' : 'To Activate'
                            )}
                          </span>
                        </div>
                        {renderPermissionButton(
                          'oppo_fullscreen',
                          'purple',
                          () => {
                            const android = (window as any).Android;
                            if (android && typeof android.openFullScreenIntentSettings === 'function') {
                              android.openFullScreenIntentSettings();
                            } else if (android && typeof android.openOverlaySettings === 'function') {
                              android.openOverlaySettings();
                            }
                          },
                          '📱 Consenti a Schermo Intero',
                          '📱 Allow Full Screen Alarm',
                          'Apre la sezione delle notifiche a schermo intero o sovrapposizione su altre app.',
                          'Opens full-screen / display over other apps settings.',
                          isOverlayGranted
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Toast Notification for Web Testing */}
      <AnimatePresence>
        {mockToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 bg-[#1F2937] text-white p-4 rounded-2xl shadow-xl z-50 border border-slate-700 flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
              i
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-extrabold text-[10px] tracking-wider text-slate-300 uppercase">
                {lang === 'it' ? 'Simulatore Android' : 'Android Simulator'}
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {mockToast}
              </p>
            </div>
            <button
              onClick={() => setMockToast(null)}
              className="text-slate-400 hover:text-white font-extrabold text-sm px-1.5 py-0.5 rounded hover:bg-slate-800 transition-all"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom Footer */}
      {step >= -1 && (
        <footer className="w-full bg-[#F0F4F8] border-t border-[#E2E8F0] p-4 sm:p-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-10">
          <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
            {/* Progress Dots */}
            {step >= 0 && (
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step === idx ? 'w-6 bg-[#2563EB]' : 'w-2 bg-[#E2E8F0]'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  id="back-step-btn"
                  onClick={prevStep}
                  className="w-1/3 py-3.5 px-3 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#475569] font-bold text-center transition-all border border-[#E2E8F0] text-sm sm:text-base shadow-sm"
                >
                  {t.buttonBack}
                </button>
              )}

              {step === -1 ? (
                <button
                  id="accept-privacy-btn"
                  onClick={nextStep}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black flex items-center justify-center gap-2 shadow-md transition-all text-base sm:text-lg"
                >
                  <span>Accetto / I Accept</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  id="next-step-btn"
                  onClick={nextStep}
                  className={`${step > 0 ? 'w-2/3' : 'w-full'} py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black flex items-center justify-center gap-2 shadow-md transition-all text-base sm:text-lg`}
                >
                  <span>{step === 3 ? t.buttonFinish : t.buttonNext}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
