/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS, LanguageCode } from '../types';
import { speakAnnouncement } from '../utils';
import { Globe, ArrowRight, Volume2, ShieldCheck, Music, Mic, Settings, Battery, Eye, Bell, Check } from 'lucide-react';
import bellIcon from '../assets/images/app_icon_bell_final_1787580544023.jpg';

interface OnboardingProps {
  onComplete: (lang: LanguageCode) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [lang, setLang] = useState<LanguageCode>('it');
  const [step, setStep] = useState<number>(-1);
  const [clickedSettings, setClickedSettings] = useState<Record<string, boolean>>({});
  const [mockToast, setMockToast] = useState<string | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);

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

  const renderPermissionButton = (
    id: string,
    colorTheme: 'blue' | 'amber' | 'purple' | 'emerald' | 'rose',
    onClickAction: () => void,
    itText: string,
    enText: string,
    webExplanationIt: string,
    webExplanationEn: string
  ) => {
    const isClicked = clickedSettings[id];
    const btnLabel = lang === 'it' ? itText : enText;
    const subLabel = lang === 'it' ? '(Tocca qui per aprire le impostazioni)' : '(Tap here to open settings)';
    
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

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 text-left"
                >
                  <div className="text-center space-y-2 mb-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                      <Settings className="w-8 h-8 animate-spin-slow" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[#1E3A8A]">
                      {lang === 'it' 
                        ? 'Configurazione Android Necessaria' 
                        : lang === 'es'
                        ? 'Configuración de Android Necesaria'
                        : lang === 'fr'
                        ? 'Configuration Android Nécessaire'
                        : 'Android Configuration Required'}
                    </h2>
                    <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                      {lang === 'it'
                        ? "Per garantire che l'allarme vocale suoni con precisione all'orario impostato, anche da telefono bloccato o app chiusa, configura ora queste impostazioni:"
                        : "To ensure the voice alarm sounds exactly at the scheduled time, even when your phone is locked or the app is closed, please configure these settings now:"}
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-1">
                    {/* ATTENTION BANNER FOR OPPO, REALME, XIAOMI */}
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 shadow-sm space-y-2">
                      <p className="text-[11px] sm:text-xs text-rose-800 font-bold leading-relaxed">
                        {lang === 'it' ? (
                          <>
                            ⚠️ <strong className="font-black text-rose-950">IMPORTANTE (Oppo, Realme, Xiaomi):</strong> Se l'allarme vocale non compare o non suona a schermo spento, devi assolutamente impostare su <strong className="text-rose-900 font-black">"Consentito"</strong> l'opzione <strong className="text-rose-900 font-black">"Invia notifiche a schermo intero"</strong> e <strong className="text-rose-900 font-black">"Consenti notifiche"</strong> nelle impostazioni del telefono.
                          </>
                        ) : (
                          <>
                            ⚠️ <strong className="font-black text-rose-950">IMPORTANT (Oppo, Realme, Xiaomi):</strong> If the voice alarm doesn't pop up or ring when the screen is off, you must set <strong className="text-rose-900 font-black">"Send full screen notifications"</strong> and <strong className="text-rose-900 font-black">"Allow notifications"</strong> to <strong className="text-rose-900 font-black">"Allowed"</strong> in your phone settings.
                          </>
                        )}
                      </p>
                      {renderPermissionButton(
                        'oppo_fullscreen',
                        'rose',
                        () => {
                          const android = (window as any).Android;
                          if (android && typeof android.openFullScreenIntentSettings === 'function') {
                            android.openFullScreenIntentSettings();
                          } else if (android && typeof android.openNotificationSettings === 'function') {
                            android.openNotificationSettings();
                          }
                        },
                        'Apri Notifiche Schermo Intero',
                        'Open Full Screen Notifications',
                        'Questo pulsante aprirà direttamente la pagina di configurazione delle notifiche a tutto schermo (FullScreen Intent) per consentire all\'allarme vocale di mostrarsi anche a telefono bloccato.',
                        'This button will open the Full Screen notification settings directly on your device, allowing the voice alarm to prompt even when your phone is locked.'
                      )}
                    </div>

                    {/* Item 1 */}
                    <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col gap-2">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 border border-blue-100 text-xs font-extrabold">
                          1
                        </div>
                        <div className="space-y-1 flex-1">
                          <h3 className="font-extrabold text-xs sm:text-sm text-[#1E293B] flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-blue-500 shrink-0" />
                            {lang === 'it' ? 'Sveglie Precise (Alarms & Reminders)' : 'Precise Alarms & Reminders'}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-[#475569] leading-relaxed">
                            {lang === 'it' ? (
                              <>
                                Vai in <strong className="text-blue-600 font-bold">Impostazioni del Telefono &rarr; App &rarr; Accesso speciale alle app &rarr; Sveglie e promemoria</strong>. Cerca <strong className="text-blue-600 font-bold">Ricorda con Voce</strong> e assicurati che la spunta sia <strong className="text-emerald-600 font-bold">ATTIVA</strong>.
                              </>
                            ) : (
                              <>
                                Go to <strong className="text-blue-600 font-bold">Settings &rarr; Apps &rarr; Special App Access &rarr; Alarms & Reminders</strong>. Find <strong className="text-blue-600 font-bold">Ricorda con Voce</strong> and make sure it is <strong className="text-emerald-600 font-bold">ENABLED</strong>.
                              </>
                            )}
                          </p>
                        </div>
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
                        'Configura Sveglie Precise',
                        'Configure Precise Alarms',
                        'Questo pulsante aprirà la sezione speciale "Sveglie e promemoria" di Android per garantire l\'assoluta precisione temporale dell\'allarme vocale per i tuoi promemoria.',
                        'This button will open the Android "Alarms & Reminders" special access page to guarantee high-precision scheduling for your vocal alarms.'
                      )}
                    </div>
 
                    {/* Item 2 */}
                    <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col gap-2">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 border border-amber-100 text-xs font-extrabold">
                          2
                        </div>
                        <div className="space-y-1 flex-1">
                          <h3 className="font-extrabold text-xs sm:text-sm text-[#1E293B] flex items-center gap-1.5">
                            <Battery className="w-4 h-4 text-amber-500 shrink-0" />
                            {lang === 'it' ? 'Escludi dall\'Ottimizzazione Batteria' : 'Disable Battery Optimization'}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-[#475569] leading-relaxed">
                            {lang === 'it' ? (
                              <>
                                Vai in <strong className="text-amber-600 font-bold">Impostazioni del Telefono &rarr; App &rarr; Ricorda con Voce &rarr; Batteria</strong>. Imposta su <strong className="text-amber-600 font-bold">"Senza restrizioni"</strong>. Questo impedirà ad Android di chiudere l'app in background o standby.
                              </>
                            ) : (
                              <>
                                Go to <strong className="text-amber-600 font-bold">Settings &rarr; Apps &rarr; Ricorda con Voce &rarr; Battery</strong>. Set to <strong className="text-amber-600 font-bold">"Unrestricted"</strong>. This prevents Android from killing the app in background or standby.
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {renderPermissionButton(
                        'battery_optimization',
                        'amber',
                        () => {
                          const android = (window as any).Android;
                          if (android && typeof android.openBatteryOptimizationSettings === 'function') {
                            android.openBatteryOptimizationSettings();
                          }
                        },
                        'Escludi Ottimizzazione Batteria',
                        'Disable Battery Optimization',
                        'Questo pulsante aprirà la schermata di ottimizzazione della batteria di Android per consentire a Ricorda con Voce di funzionare stabilmente senza essere chiusa dal sistema operativo.',
                        'This button will open the Android battery optimization controls, letting you set Ricorda con Voce to "Unrestricted" so that background reminders never fail.'
                      )}
                    </div>
 
                    {/* Item 3 */}
                    <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col gap-2">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 shrink-0 border border-purple-100 text-xs font-extrabold">
                          3
                        </div>
                        <div className="space-y-1 flex-1">
                          <h3 className="font-extrabold text-xs sm:text-sm text-[#1E293B] flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-purple-500 shrink-0" />
                            {lang === 'it' ? 'Mostra sopra altre app / Schermata di Blocco' : 'Display Over Other Apps / Lock Screen'}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-[#475569] leading-relaxed">
                            {lang === 'it' ? (
                              <>
                                Per far sì che l'allarme a tutto schermo (con i comandi vocali) appaia anche a telefono bloccato, attiva il permesso <strong className="text-purple-600 font-bold">"Mostra sopra altre app"</strong> o <strong className="text-purple-600 font-bold">"Visualizza sulla schermata di blocco"</strong>.
                              </>
                            ) : (
                              <>
                                To let the full-screen voice alarm appear even when locked, enable <strong className="text-purple-600 font-bold">"Display over other apps"</strong> or <strong className="text-purple-600 font-bold">"Show on lock screen"</strong>.
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {renderPermissionButton(
                        'overlay_permission',
                        'purple',
                        () => {
                          const android = (window as any).Android;
                          if (android && typeof android.openOverlaySettings === 'function') {
                            android.openOverlaySettings();
                          }
                        },
                        'Consenti Sopra Altre App',
                        'Allow Display Over Other Apps',
                        'Questo pulsante aprirà la schermata dei permessi speciali per "Visualizzare sopra altre app", essenziale per mostrare la schermata dell\'allarme vocale anche a telefono bloccato.',
                        'This button will open the Android system menu for "Display over other apps", which is essential for rendering full-screen alerts when the phone is locked.'
                      )}
                    </div>
 
                    {/* Item 4 */}
                    <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col gap-2">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-100 text-xs font-extrabold">
                          4
                        </div>
                        <div className="space-y-1 flex-1">
                          <h3 className="font-extrabold text-xs sm:text-sm text-[#1E293B] flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                            {lang === 'it' ? 'Consenti Notifiche' : 'Allow Notifications'}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-[#475569] leading-relaxed">
                            {lang === 'it' ? (
                              <>
                                Al primo avvio, assicurati di <strong className="text-emerald-600 font-bold">accettare la richiesta di invio delle notifiche</strong> per essere avvisato tempestivamente.
                              </>
                            ) : (
                              <>
                                Upon first launch, ensure you <strong className="text-emerald-600 font-bold">accept the push notification prompt</strong> to receive timely reminder alerts.
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {renderPermissionButton(
                        'notifications_permission',
                        'emerald',
                        () => {
                          const android = (window as any).Android;
                          if (android && typeof android.openNotificationSettings === 'function') {
                            android.openNotificationSettings();
                          }
                        },
                        'Attiva Notifiche di Sistema',
                        'Enable System Notifications',
                        'Questo pulsante aprirà le impostazioni delle notifiche di sistema di Android per assicurarti che Ricorda con Voce possa inviarti gli allarmi quotidiani.',
                        'This button will open the standard Android Notification settings for Ricorda con Voce, ensuring the system registers and fires audio notifications correctly.'
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
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
