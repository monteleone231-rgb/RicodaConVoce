/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Plus, BellRing, AlarmClock, ClipboardList, CheckSquare, Award, Globe, MapPin, 
  Settings, CheckCircle, Volume2, 
  AlertTriangle, Mic, Clock, Camera, Calendar, 
  Smartphone, Bell, Sparkles, Phone, FileText, ChevronRight, ChevronDown, Coffee, Search
} from 'lucide-react';
import { IT, US, ES, FR, DE } from 'country-flag-icons/react/3x2';

import { LanguageCode, Medication, MedicationCategory, DoctorNote, TRANSLATIONS } from './types';
import { playAlarmTone, speakAnnouncement, stopSpeaking, playVoiceAudio, stopVoiceAudio, BARCODE_MOCK_DATABASE, getLocalIsoDate, isScheduledOnDate, getNextOccurrence, formatMedicationSchedule } from './utils';
import Onboarding from './components/Onboarding';
import { VoiceStudio } from './components/VoiceStudio';
import HistoryAndNotes from './components/HistoryAndNotes';
import { VoiceRecorderField } from './components/VoiceRecorderField';

export type ColorTheme = 'blue' | 'orange' | 'teal' | 'purple' | 'rose';

export const THEME_MAP = {
  blue: {
    primary: 'bg-[#2563EB]',
    primaryHover: 'hover:bg-[#1D4ED8]',
    text: 'text-[#2563EB]',
    textHover: 'hover:text-[#1E40AF]',
    textAccent: 'text-[#1E40AF]',
    bgLight: 'bg-[#EFF6FF]',
    bgLightHover: 'hover:bg-[#DBEAFE]',
    borderLight: 'border-[#DBEAFE]',
    gradientFrom: 'from-[#1E3A8A]',
    gradientTo: 'to-[#2563EB]',
    shadow: 'shadow-[0_4px_14px_rgba(37,99,235,0.15)]',
    shadowSm: 'shadow-[#2563EB]/20',
    pingBg: 'bg-[#2563EB]/10',
    pulseBg: 'bg-[#2563EB]/25',
    accentRange: 'accent-[#2563EB]',
    activeTab: 'text-[#2563EB]',
    visualizer1: 'bg-[#2563EB]/45',
    visualizer2: 'bg-[#2563EB]/70',
    visualizer3: 'bg-[#2563EB]/85',
    visualizer4: 'bg-[#2563EB]/30',
    visualizer5: 'bg-[#2563EB]',
    visualizer6: 'bg-[#2563EB]/80',
    visualizer7: 'bg-[#2563EB]/50',
  },
  orange: {
    primary: 'bg-[#F97316]',
    primaryHover: 'hover:bg-[#EA580C]',
    text: 'text-[#F97316]',
    textHover: 'hover:text-[#C2410C]',
    textAccent: 'text-[#C2410C]',
    bgLight: 'bg-[#FFF7ED]',
    bgLightHover: 'hover:bg-[#FFEDD5]',
    borderLight: 'border-[#FFEDD5]',
    gradientFrom: 'from-[#7C2D12]',
    gradientTo: 'to-[#F97316]',
    shadow: 'shadow-[0_4px_14px_rgba(249,115,22,0.15)]',
    shadowSm: 'shadow-[#F97316]/20',
    pingBg: 'bg-[#F97316]/10',
    pulseBg: 'bg-[#F97316]/25',
    accentRange: 'accent-[#F97316]',
    activeTab: 'text-[#F97316]',
    visualizer1: 'bg-[#F97316]/45',
    visualizer2: 'bg-[#F97316]/70',
    visualizer3: 'bg-[#F97316]/85',
    visualizer4: 'bg-[#F97316]/30',
    visualizer5: 'bg-[#F97316]',
    visualizer6: 'bg-[#F97316]/80',
    visualizer7: 'bg-[#F97316]/50',
  },
  teal: {
    primary: 'bg-[#0D9488]',
    primaryHover: 'hover:bg-[#0F766E]',
    text: 'text-[#0D9488]',
    textHover: 'hover:text-[#115E59]',
    textAccent: 'text-[#115E59]',
    bgLight: 'bg-[#F0FDFA]',
    bgLightHover: 'hover:bg-[#CCFBF1]',
    borderLight: 'border-[#CCFBF1]',
    gradientFrom: 'from-[#134E4A]',
    gradientTo: 'to-[#0D9488]',
    shadow: 'shadow-[0_4px_14px_rgba(13,148,136,0.15)]',
    shadowSm: 'shadow-[#0D9488]/20',
    pingBg: 'bg-[#0D9488]/10',
    pulseBg: 'bg-[#0D9488]/25',
    accentRange: 'accent-[#0D9488]',
    activeTab: 'text-[#0D9488]',
    visualizer1: 'bg-[#0D9488]/45',
    visualizer2: 'bg-[#0D9488]/70',
    visualizer3: 'bg-[#0D9488]/85',
    visualizer4: 'bg-[#0D9488]/30',
    visualizer5: 'bg-[#0D9488]',
    visualizer6: 'bg-[#0D9488]/80',
    visualizer7: 'bg-[#0D9488]/50',
  },
  purple: {
    primary: 'bg-[#8B5CF6]',
    primaryHover: 'hover:bg-[#7C3AED]',
    text: 'text-[#8B5CF6]',
    textHover: 'hover:text-[#6D28D9]',
    textAccent: 'text-[#6D28D9]',
    bgLight: 'bg-[#F5F3FF]',
    bgLightHover: 'hover:bg-[#EDE9FE]',
    borderLight: 'border-[#EDE9FE]',
    gradientFrom: 'from-[#4C1D95]',
    gradientTo: 'to-[#8B5CF6]',
    shadow: 'shadow-[0_4px_14px_rgba(139,92,246,0.15)]',
    shadowSm: 'shadow-[#8B5CF6]/20',
    pingBg: 'bg-[#8B5CF6]/10',
    pulseBg: 'bg-[#8B5CF6]/25',
    accentRange: 'accent-[#8B5CF6]',
    activeTab: 'text-[#8B5CF6]',
    visualizer1: 'bg-[#8B5CF6]/45',
    visualizer2: 'bg-[#8B5CF6]/70',
    visualizer3: 'bg-[#8B5CF6]/85',
    visualizer4: 'bg-[#8B5CF6]/30',
    visualizer5: 'bg-[#8B5CF6]',
    visualizer6: 'bg-[#8B5CF6]/80',
    visualizer7: 'bg-[#8B5CF6]/50',
  },
  rose: {
    primary: 'bg-[#F43F5E]',
    primaryHover: 'hover:bg-[#E11D48]',
    text: 'text-[#F43F5E]',
    textHover: 'hover:text-[#BE123C]',
    textAccent: 'text-[#BE123C]',
    bgLight: 'bg-[#FFF1F2]',
    bgLightHover: 'hover:bg-[#FFE4E6]',
    borderLight: 'border-[#FFE4E6]',
    gradientFrom: 'from-[#881337]',
    gradientTo: 'to-[#F43F5E]',
    shadow: 'shadow-[0_4px_14px_rgba(244,63,94,0.15)]',
    shadowSm: 'shadow-[#F43F5E]/20',
    pingBg: 'bg-[#F43F5E]/10',
    pulseBg: 'bg-[#F43F5E]/25',
    accentRange: 'accent-[#F43F5E]',
    activeTab: 'text-[#F43F5E]',
    visualizer1: 'bg-[#F43F5E]/45',
    visualizer2: 'bg-[#F43F5E]/70',
    visualizer3: 'bg-[#F43F5E]/85',
    visualizer4: 'bg-[#F43F5E]/30',
    visualizer5: 'bg-[#F43F5E]',
    visualizer6: 'bg-[#F43F5E]/80',
    visualizer7: 'bg-[#F43F5E]/50',
  }
};

export default function App() {
  // 1. Core Onboarding state
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('medivoce_onboarded') === 'true';
  });
  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem('medivoce_lang') as LanguageCode) || 'it';
  });

  const t = TRANSLATIONS[lang];

  // 2. Main Medication items database state
  const [medications, setMedications] = useState<Medication[]>(() => {
    const defaultMeds: Medication[] = [
      {
        id: '1',
        name: lang === 'it' ? "Bere un bicchiere d'acqua" : lang === 'es' ? "Beber un vaso de agua" : lang === 'fr' ? "Boire un verre d'eau" : "Drink a glass of water",
        dosage: lang === 'it' ? '250 ml d\'acqua fresca' : lang === 'es' ? '250 ml de agua fresca' : lang === 'fr' ? '250 ml d\'eau fraîche' : '250 ml fresh water',
        time: '08:30',
        notes: lang === 'it' ? 'Inizia la giornata con una buona idratazione al mattino' : lang === 'es' ? 'Empieza el día con una buena hidratación' : lang === 'fr' ? 'Commencez la journée bien hydraté' : 'Start your morning well hydrated',
        category: 'bottle',
        weeklySchedule: [1, 2, 3, 4, 5, 6, 0], // Every day
        isActive: true,
        history: {},
        audioTone: 'preset_arpeggio',
        voicePrompt: lang === 'it' 
          ? "Buongiorno! Ricordati di bere un bel bicchiere d'acqua per iniziare la giornata con energia e benessere." 
          : lang === 'es'
          ? "¡Buenos días! Recuerda beber un vaso de agua para empezar el día con energía y bienestar."
          : lang === 'fr'
          ? "Bonjour ! N'oubliez pas de boire un bon verre d'eau pour commencer la journée avec énergie."
          : "Good morning! Remember to drink a glass of water to start your day refreshed."
      },
      {
        id: '2',
        name: lang === 'it' ? 'Pausa attiva e camminata' : lang === 'es' ? 'Paseo y pausa activa' : lang === 'fr' ? 'Pause active et marche' : 'Active Break & Walk',
        dosage: lang === 'it' ? '15-20 minuti' : lang === 'es' ? '15-20 minutos' : lang === 'fr' ? '15-20 minutes' : '15-20 minutes',
        time: '13:00',
        notes: lang === 'it' ? 'Fai due passi all\'aria aperta o un po\' di stretching rilassante' : lang === 'es' ? 'Camina al aire libre o haz estiramientos suaves' : lang === 'fr' ? 'Faites quelques pas dehors ou des étirements relaxants' : 'Take a short walk outside or gentle stretching',
        category: 'other',
        weeklySchedule: [1, 3, 5], // Mon, Wed, Fri
        isActive: true,
        history: {},
        audioTone: 'preset_marimba',
        voicePrompt: lang === 'it' 
          ? "È ora di fare una pausa attiva! Alzati per fare due passi all'aria aperta o un po' di stretching." 
          : lang === 'es'
          ? "¡Es hora de una pausa activa! Levántate para caminar un poco o hacer estiramientos."
          : lang === 'fr'
          ? "C'est l'heure d'une pause active ! Levez-vous pour faire quelques pas ou vous étirer."
          : "Time for an active break! Stand up for a light walk or some relaxing stretching."
      },
      {
        id: '3',
        name: lang === 'it' ? 'Chiamare la famiglia' : lang === 'es' ? 'Llamar a la familia' : lang === 'fr' ? 'Appeler la famille' : 'Family Check-in Call',
        dosage: lang === 'it' ? 'Saluto serale' : lang === 'es' ? 'Saludo de la tarde' : lang === 'fr' ? 'Appel du soir' : 'Evening call',
        time: '20:30',
        notes: lang === 'it' ? 'Fai una telefonata affettuosa ai tuoi cari prima di cena' : lang === 'es' ? 'Haz una llamada cariñosa a tus seres queridos antes de cenar' : lang === 'fr' ? 'Passez un coup de fil affectueux à vos proches avant le dîner' : 'Give a warm call to your loved ones before dinner',
        category: 'other',
        weeklySchedule: [1, 2, 3, 4, 5, 6, 0],
        isActive: true,
        history: {},
        audioTone: 'preset_trillo',
        voicePrompt: lang === 'it' 
          ? "Buonasera! Ricordati di fare una telefonata ai tuoi cari per un saluto affettuoso." 
          : lang === 'es'
          ? "¡Buenas tardes! Recuerda llamar a tus familiares para saludarlos con cariño."
          : lang === 'fr'
          ? "Bonsoir ! Pensez à appeler votre famille pour un salut chaleureux."
          : "Good evening! Remember to call your loved ones for a friendly check-in."
      }
    ];

    const saved = localStorage.getItem('medivoce_meds');
    if (saved) {
      try {
        const parsed: Medication[] = JSON.parse(saved);
        // If old sample medicine names are still present in stored state, sanitize/migrate them
        const hasOldMedicines = parsed.some(m => 
          /Cardioaspirina|Aspirin|Sciroppo|Bronchenolo|Insulina|Tachipirina/i.test(m.name)
        );
        if (hasOldMedicines) {
          localStorage.setItem('medivoce_meds', JSON.stringify(defaultMeds));
          return defaultMeds;
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return defaultMeds;
  });

  // Doctor notes / personal activity log
  const [notes, setNotes] = useState<DoctorNote[]>(() => {
    const defaultNotes: DoctorNote[] = [
      {
        id: '101',
        date: '2026-06-09',
        text: lang === 'it' 
          ? 'Passeggiata di 20 minuti completata al parco sotto il sole piacevole.' 
          : lang === 'es'
          ? 'Caminata de 20 minutos completada en el parque bajo el sol agradable.'
          : lang === 'fr'
          ? 'Marche de 20 minutes terminée au parc sous un soleil agréable.'
          : '20-minute walk completed at the park in pleasant sunshine.',
        hasSymptom: false
      },
      {
        id: '102',
        date: '2026-06-10',
        text: lang === 'it' 
          ? 'Bevuti 2 litri d\'acqua oggi: ottima idratazione ed energia costante.' 
          : lang === 'es'
          ? 'Bebidos 2 litros de agua hoy: excelente hidratación y energía constante.'
          : lang === 'fr'
          ? '2 litres d\'eau bus aujourd\'hui : excellente hydratation et énergie constante.'
          : 'Drank 2 liters of water today: great hydration and steady energy.',
        hasSymptom: false
      }
    ];

    const saved = localStorage.getItem('medivoce_notes');
    if (saved) {
      try {
        const parsed: DoctorNote[] = JSON.parse(saved);
        const hasOldMedicalNotes = parsed.some(n => /affanno|sciroppo|pressione|fitta/i.test(n.text));
        if (hasOldMedicalNotes) {
          localStorage.setItem('medivoce_notes', JSON.stringify(defaultNotes));
          return defaultNotes;
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return defaultNotes;
  });

  // 3. Navigation View tabs
  const [activeTab, setActiveTab] = useState<'agenda' | 'history' | 'voice-studio' | 'settings'>('agenda');

  // Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Emergency Phone state
  const [emergencyPhone, setEmergencyPhone] = useState<string>(localStorage.getItem('medivoce_emergency_number') || '');

  // Form State for Adding/Editing
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [medToDeleteId, setMedToDeleteId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formDosage, setFormDosage] = useState<string>('');
  const [formTime, setFormTime] = useState<string>('08:00');
  const [formTimes, setFormTimes] = useState<string[]>(['08:00']);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formCategory, setFormCategory] = useState<MedicationCategory>('pill');
  const [formSchedule, setFormSchedule] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]); // Default daily
  const [formVoicePrompt, setFormVoicePrompt] = useState<string>('');
  const [formCustomVoiceUri, setFormCustomVoiceUri] = useState<string | undefined>(undefined);
  const [formAudioTone, setFormAudioTone] = useState<string>('preset_arpeggio');
  const [formStockEnabled, setFormStockEnabled] = useState<boolean>(false);
  const [formStockCurrent, setFormStockCurrent] = useState<number>(30);
  const [formStockMin, setFormStockMin] = useState<number>(5);
  const [formPillColor, setFormPillColor] = useState<string>('blue');
  const [formFrequencyType, setFormFrequencyType] = useState<'weekly' | 'monthly'>('weekly');
  const [formMonthlyDay, setFormMonthlyDay] = useState<number>(1);
  const [activeVoiceReminderSlot, setActiveVoiceReminderSlot] = useState<string | null>(null);
  const [medsSearchQuery, setMedsSearchQuery] = useState<string>('');

  // Barcode camera view trigger
  const [showScanner, setShowScanner] = useState<boolean>(false);

  // Settings State variables
  const [speechSpeed, setSpeechSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('medivoce_speech_speed');
    return saved ? parseFloat(saved) : 0.75;
  });
  const [speechTone, setSpeechTone] = useState<'empathetic' | 'firm'>(() => {
    return (localStorage.getItem('medivoce_speech_tone') as 'empathetic' | 'firm') || 'empathetic';
  });
  const [mobileSoundLevel, setMobileSoundLevel] = useState<'none' | 'beep' | 'continuous'>('continuous');

  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    return localStorage.getItem('medivoce_vibration') !== 'false'; // true by default
  });

  const lastCheckedMinuteRef = useRef<string>('');
  const dismissedAutoTriggersRef = useRef<{[key: string]: { dismissedAt: number, type: 'snooze' | 'dismiss' }}>({});

  const getMinutesSinceMidnight = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const get24HourTimeString = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [voiceAnnounceEnabled, setVoiceAnnounceEnabled] = useState<boolean>(() => {
    return localStorage.getItem('medivoce_voice_announce') !== 'false'; // true by default
  });
  
  const [appTheme, setAppTheme] = useState<'light' | 'dark' | 'warm'>(() => {
    return (localStorage.getItem('medivoce_theme') as 'light' | 'dark' | 'warm') || 'light';
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem('medivoce_color_theme') as ColorTheme) || 'blue';
  });

  const [alwaysOnDisplay, setAlwaysOnDisplay] = useState<boolean>(() => {
    return localStorage.getItem('medivoce_alwayson') === 'true'; // false by default
  });

  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);

  // Custom imported sounds
  const [importedSounds, setImportedSounds] = useState<{ id: string; name: string; dataUrl: string }[]>(() => {
    const saved = localStorage.getItem('medivoce_custom_sounds');
    return saved ? JSON.parse(saved) : [];
  });
  const [showImportSoundsModal, setShowImportSoundsModal] = useState<boolean>(false);
  const [deviceRingtones, setDeviceRingtones] = useState<{ title: string; uri: string }[]>([]);
  const [currentlyPlayingUri, setCurrentlyPlayingUri] = useState<string | null>(null);

  useEffect(() => {
    if (showImportSoundsModal) {
      const android = (window as any).Android;
      if (android && android.getDeviceSounds) {
        try {
          const soundsStr = android.getDeviceSounds();
          if (soundsStr) {
            const parsed = JSON.parse(soundsStr);
            if (Array.isArray(parsed)) {
              setDeviceRingtones(parsed);
            }
          }
        } catch (e) {
          console.error("Error fetching device sounds:", e);
        }
      } else {
        // Fallback for browser testing
        setDeviceRingtones([
          { title: "Breeze Chime", uri: "device_uri_breeze" },
          { title: "Dew Drop", uri: "device_uri_dew" },
          { title: "Sunrise Alarm", uri: "device_uri_sunrise" },
          { title: "Echo Echo", uri: "device_uri_echo" },
          { title: "Sweet Organ", uri: "device_uri_organ" },
          { title: "Classic Ding", uri: "device_uri_ding" }
        ]);
      }
    } else {
      // Stop device sound when modal closed
      const android = (window as any).Android;
      if (android && android.stopDeviceSound) {
        try {
          android.stopDeviceSound();
        } catch (e) {
          console.error(e);
        }
      }
      setCurrentlyPlayingUri(null);
    }
  }, [showImportSoundsModal]);

  // Interactive speaking notification modal
  const [activeVoiceReminder, setActiveVoiceReminder] = useState<Medication | null>(null);
  const [isListeningForConfirm, setIsListeningForConfirm] = useState<boolean>(false);
  const [speechConfirmError, setSpeechConfirmError] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showDevDocs, setShowDevDocs] = useState<boolean>(false);

  // Monitor speaking events and state
  useEffect(() => {
    const handleSpeechEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.speaking === 'boolean') {
        setIsSpeaking(customEvent.detail.speaking);
      }
    };

    window.addEventListener('medivoce-speech', handleSpeechEvent as any);

    const timer = setInterval(() => {
      const isNativeSpeaking = (window as any).isSpeakingNatively === true;
      if (isNativeSpeaking) {
        setIsSpeaking(true);
        return;
      }

      if ('speechSynthesis' in window) {
        const isCurrentlySpeaking = window.speechSynthesis.speaking;
        setIsSpeaking(prev => {
          if (prev !== isCurrentlySpeaking) {
            return isCurrentlySpeaking;
          }
          return prev;
        });
      }
    }, 200);

    return () => {
      window.removeEventListener('medivoce-speech', handleSpeechEvent as any);
      clearInterval(timer);
    };
  }, []);

  // Warm up Web Speech synthesis voices on mount to ensure voices are preloaded on mobile devices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  // Reset speech confirmation error whenever a new reminder is activated or dismissed
  useEffect(() => {
    setSpeechConfirmError('');
  }, [activeVoiceReminder]);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('medivoce_meds', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('medivoce_custom_sounds', JSON.stringify(importedSounds));
  }, [importedSounds]);

  useEffect(() => {
    localStorage.setItem('medivoce_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('medivoce_vibration', vibrationEnabled.toString());
  }, [vibrationEnabled]);

  useEffect(() => {
    localStorage.setItem('medivoce_voice_announce', voiceAnnounceEnabled.toString());
  }, [voiceAnnounceEnabled]);

  useEffect(() => {
    localStorage.setItem('medivoce_theme', appTheme);
  }, [appTheme]);

  useEffect(() => {
    localStorage.setItem('medivoce_color_theme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem('medivoce_alwayson', alwaysOnDisplay.toString());
  }, [alwaysOnDisplay]);

  useEffect(() => {
    localStorage.setItem('medivoce_speech_speed', speechSpeed.toString());
  }, [speechSpeed]);

  useEffect(() => {
    localStorage.setItem('medivoce_speech_tone', speechTone);
  }, [speechTone]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const android = (window as any).Android;
      if (android && typeof android.savePreferencesToNative === 'function') {
        try {
          android.savePreferencesToNative(
            lang,
            voiceAnnounceEnabled,
            speechSpeed,
            speechTone
          );
        } catch (e) {
          console.error("[MediVoce] Failed to save preferences to native:", e);
        }
      }
    }
  }, [lang, voiceAnnounceEnabled, speechSpeed, speechTone]);

  // Stop ongoing voice announcements and device sounds when the active reminder is dismissed, taken, or closed
  useEffect(() => {
    if (!activeVoiceReminder) {
      // Stop voice speech synthesis
      try {
        stopSpeaking();
      } catch (e) {
        console.warn("Failed to stop speaking on activeVoiceReminder clear:", e);
      }

      // Stop native device alarm/sound
      const android = (window as any).Android;
      if (android && typeof android.stopDeviceSound === 'function') {
        try {
          android.stopDeviceSound();
        } catch (e) {
          console.error("Failed to stop native device sound on activeVoiceReminder clear:", e);
        }
      }
    }
  }, [activeVoiceReminder]);

  const theme = THEME_MAP[colorTheme];

  // Handle Wakelock for Always On Display during notification
  useEffect(() => {
    let wakeLock: any = null;
    
    const acquireWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && alwaysOnDisplay && activeVoiceReminder) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err: any) {
        console.warn(`${err.name}, ${err.message}`);
      }
    };

    if (activeVoiceReminder && alwaysOnDisplay) {
      acquireWakeLock();
    }

    return () => {
      if (wakeLock !== null) {
        wakeLock.release().catch(console.error);
        wakeLock = null;
      }
    };
  }, [activeVoiceReminder, alwaysOnDisplay]);

  // Handle continuous periodic vibration while an active voice reminder notification is playing
  useEffect(() => {
    let intervalId: any = null;
    
    if (activeVoiceReminder && vibrationEnabled) {
      // Vibrate immediately using a highly visible pulsating pattern
      triggerDeviceVibration([800, 500, 800, 500]);
      
      // Repeat the vibration sequence every 3 seconds to keep capturing attention until dismissed
      intervalId = setInterval(() => {
        triggerDeviceVibration([800, 500, 800, 500]);
      }, 3000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Cancel any current vibration when the alert is dismissed or completed
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(0);
        } catch (e) {}
      }
    };
  }, [activeVoiceReminder, vibrationEnabled]);

  // Handle live clock tick and scheduled standby alarm checks with high-precision 24-hour minute tracking and 15-minute grace period
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const timeString = get24HourTimeString(now);
      const todayWeekdayVal = now.getDay();
      const dateStr = getLocalIsoDate(now);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Check for any medication that is due today, has not been taken,
      // and is within the 15-minute grace period (robust against background/standby suspension).
      medications.forEach(med => {
        if (med.isActive && isScheduledOnDate(med, now)) {
           const medTimes = med.times && med.times.length > 0 ? med.times : [med.time];
           
           medTimes.forEach(timeSlot => {
              const slotKey = `${dateStr}_${timeSlot}`;
              const isTaken = (med.history || {})[slotKey] === true || (medTimes.length === 1 && (med.history || {})[dateStr] === true);
              
              if (!isTaken) {
                const slotMinutes = getMinutesSinceMidnight(timeSlot);
                const diff = currentMinutes - slotMinutes;
                
                // Trigger if we are within the 15-minute grace period of the scheduled time
                if (diff >= 0 && diff <= 15) {
                  const dismissedKey = `${med.id}_${slotKey}`;
                  const dismissedInfo = dismissedAutoTriggersRef.current[dismissedKey];
                  
                  let isSnoozedOrDismissed = false;
                  if (dismissedInfo) {
                    if (dismissedInfo.type === 'dismiss') {
                      isSnoozedOrDismissed = true;
                    } else if (dismissedInfo.type === 'snooze') {
                      // Allow refiring after 5 minutes (300,000 ms) of snooze
                      const nowMs = Date.now();
                      if (nowMs - dismissedInfo.dismissedAt < 5 * 60 * 1000) {
                        isSnoozedOrDismissed = true;
                      }
                    }
                  }
                  
                  if (!isSnoozedOrDismissed && activeVoiceReminder?.id !== med.id) {
                    console.log("[MediVoce] Auto-triggering scheduled dose (grace period):", med.name, "at", timeSlot);
                    activateVoiceRemindSystem(med, timeSlot);
                  }
                }
              }
           });
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [medications, activeVoiceReminder]);

  // Synchronize all medications with the native Android AlarmManager
  useEffect(() => {
    // 1. Check if any medications are missing nativeId
    const missingNativeId = medications.some(m => !m.nativeId);
    if (missingNativeId) {
       setMedications(prev => prev.map(m => {
         if (!m.nativeId) {
           return { ...m, nativeId: Math.floor(Math.random() * 10000000) };
         }
         return m;
       }));
       return; // The state update will trigger this useEffect again with complete nativeId list
    }

    // 2. Perform native synchronization
    const android = (window as any).Android;
    if (android) {
       console.log("[MediVoce] Synchronizing medications with native AlarmManager...");
       
       // Schedule or cancel each medication alarm
       medications.forEach(med => {
         const nativeId = med.nativeId!;
         const medTimes = med.times && med.times.length > 0 ? med.times : [med.time];
         
         if (med.isActive) {
           medTimes.forEach((timeSlot, idx) => {
             const slotNativeId = nativeId + idx;
             const now = new Date();
             const target = getNextOccurrence(med, timeSlot, now);

             try {
               const prompt = med.voicePrompt || `Attenzione, è l'ora del promemoria: ${med.name}`;
               const dosage = med.dosage || '';
               const customVoice = med.customVoiceUri || '';
               android.scheduleAlarm(target.getTime(), slotNativeId, med.name, prompt, dosage, timeSlot, customVoice);
               console.log(`[MediVoce] Native scheduled slot: ${med.name} at ${timeSlot} (${slotNativeId}, customVoice=${!!customVoice})`);
             } catch (e) {
               console.error(`[MediVoce] Error scheduling slot ${med.name} at ${timeSlot}:`, e);
             }
           });
         } else {
           // Cancel active slot alarms
           for (let idx = 0; idx < 10; idx++) {
             const slotNativeId = nativeId + idx;
             try {
               android.cancelAlarm(slotNativeId);
             } catch (e) {
               // ignore
             }
           }
           console.log(`[MediVoce] Native cancelled all slots for: ${med.name}`);
         }
       });

       // 3. Save serialized alarms list to native storage (SharedPreferences) for BootReceiver persistence
       try {
         const alarmsToSave: any[] = [];
         medications.forEach(m => {
           const medTimes = m.times && m.times.length > 0 ? m.times : [m.time];
           medTimes.forEach((timeSlot, idx) => {
             alarmsToSave.push({
               nativeId: m.nativeId! + idx,
               name: m.name,
               time: timeSlot,
               dosage: m.dosage || '',
               voicePrompt: m.voicePrompt || '',
               customVoiceUri: m.customVoiceUri || '',
               isActive: m.isActive,
               frequencyType: m.frequencyType || 'weekly',
               weeklySchedule: m.weeklySchedule,
               monthlyDay: m.monthlyDay
             });
           });
         });
         android.saveAlarmsToNative?.(JSON.stringify(alarmsToSave));
         console.log("[MediVoce] Saved active alarms to native storage for BootReceiver.");
       } catch (e) {
         console.error("[MediVoce] Error saving alarms list to native storage:", e);
       }
    }
  }, [medications]);

  // Sync natively marked taken slots (e.g. from FullScreenAlertActivity) into React state
  useEffect(() => {
    const android = (window as any).Android;
    if (android && typeof android.getTakenSlotsFromNative === 'function') {
      try {
        const takenSlotsJson = android.getTakenSlotsFromNative();
        const takenSlots: string[] = JSON.parse(takenSlotsJson || "[]");
        if (takenSlots.length > 0) {
          const todayStr = getLocalIsoDate();
          setMedications(prev => {
            let changed = false;
            const updated = prev.map(med => {
              const medTimes = med.times && med.times.length > 0 ? med.times : [med.time];
              let newHistory = { ...(med.history || {}) };
              let medChanged = false;

              takenSlots.forEach(key => {
                const parts = key.split('_');
                if (parts.length >= 3) {
                  const dateStr = parts[parts.length - 1];
                  const slot = parts[parts.length - 2];
                  const name = parts.slice(0, parts.length - 2).join('_');

                  if (name === med.name && dateStr === todayStr) {
                    const slotKey = `${todayStr}_${slot}`;
                    const isSingleSlot = medTimes.length === 1;
                    if (!newHistory[slotKey] || (isSingleSlot && !newHistory[todayStr])) {
                      newHistory[slotKey] = true;
                      if (isSingleSlot) newHistory[todayStr] = true;
                      medChanged = true;
                    }
                  }
                }
              });

              if (medChanged) {
                changed = true;
                return { ...med, history: newHistory };
              }
              return med;
            });
            return changed ? updated : prev;
          });
        }
      } catch (e) {
        console.error("[MediVoce] Error syncing native taken slots:", e);
      }
    }
  }, [medications.length]);

  // Time-of-day contextual Greeting Selector
  const getContextualGreeting = () => {
    const hrs = currentTime.getHours();
    if (hrs >= 5 && hrs < 12) return t.greetingMorning;
    if (hrs >= 12 && hrs < 17) return t.greetingAfternoon;
    if (hrs >= 17 && hrs < 22) return t.greetingEvening;
    return t.greetingNight;
  };

  const handleOnboardingComplete = (selectedLang: LanguageCode) => {
    setLang(selectedLang);
    setOnboarded(true);
    localStorage.setItem('medivoce_lang', selectedLang);
    localStorage.setItem('medivoce_onboarded', 'true');
  };

  // Sound oscillator test wrapper
  const triggerAudioTest = (tone: string) => {
    playAlarmTone(tone);
  };

  // Vocalizer test in the Settings Tab
  const triggerVoiceTest = () => {
    const testPhrase = t.testVoiceSuccess;
    speakAnnouncement(testPhrase, lang, speechSpeed, speechTone);
  };

  // Adds or updates medical item
  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const validatedTimes = formTimes.filter(t => !!t.trim());
    const finalTimes = validatedTimes.length > 0 ? validatedTimes : ['08:00'];
    const finalPrimaryTime = finalTimes[0];

    if (isEditingId) {
      // Edit
      setMedications(prev => prev.map(m => {
        if (m.id === isEditingId) {
          return {
            ...m,
            name: formName,
            dosage: formDosage,
            time: finalPrimaryTime,
            times: finalTimes,
            notes: formNotes,
            category: formCategory,
            weeklySchedule: formSchedule,
            frequencyType: formFrequencyType,
            monthlyDay: formFrequencyType === 'monthly' ? formMonthlyDay : undefined,
            audioTone: formAudioTone,
            voicePrompt: formVoicePrompt || `${t.speakAlert}: ${formName}. ${formDosage}. ${formNotes}`,
            customVoiceUri: formCustomVoiceUri,
            nativeId: m.nativeId || Math.floor(Math.random() * 10000000),
            stockCurrent: formStockEnabled ? formStockCurrent : undefined,
            stockMin: formStockEnabled ? formStockMin : undefined,
            pillColor: formPillColor
          };
        }
        return m;
      }));
    } else {
      // Create
      const newM: Medication = {
        id: Date.now().toString(),
        name: formName,
        dosage: formDosage,
        time: finalPrimaryTime,
        times: finalTimes,
        notes: formNotes,
        category: formCategory,
        weeklySchedule: formSchedule,
        frequencyType: formFrequencyType,
        monthlyDay: formFrequencyType === 'monthly' ? formMonthlyDay : undefined,
        isActive: true,
        history: {},
        audioTone: formAudioTone,
        voicePrompt: formVoicePrompt || `${t.speakAlert}: ${formName}. ${formDosage}. ${formNotes}`,
        customVoiceUri: formCustomVoiceUri,
        nativeId: Math.floor(Math.random() * 10000000),
        stockCurrent: formStockEnabled ? formStockCurrent : undefined,
        stockMin: formStockEnabled ? formStockMin : undefined,
        pillColor: formPillColor
      };
      setMedications(prev => [newM, ...prev]);
    }

    // Reset Form
    setShowAddModal(false);
    setIsEditingId(null);
    setFormName('');
    setFormDosage('');
    setFormTime('08:00');
    setFormTimes(['08:00']);
    setFormNotes('');
    setFormCategory('pill');
    setFormSchedule([1, 2, 3, 4, 5, 6, 0]);
    setFormFrequencyType('weekly');
    setFormMonthlyDay(1);
    setFormVoicePrompt('');
    setFormCustomVoiceUri(undefined);
    setFormAudioTone('preset_arpeggio');
    setFormStockEnabled(false);
    setFormStockCurrent(30);
    setFormStockMin(5);
    setFormPillColor('blue');
  };

  const startEditMedication = (med: Medication) => {
    setIsEditingId(med.id);
    setFormName(med.name);
    setFormDosage(med.dosage);
    setFormTime(med.time);
    setFormTimes(med.times && med.times.length > 0 ? med.times : [med.time]);
    setFormNotes(med.notes);
    setFormCategory(med.category);
    setFormSchedule(med.weeklySchedule || [1, 2, 3, 4, 5, 6, 0]);
    setFormFrequencyType(med.frequencyType || 'weekly');
    setFormMonthlyDay(med.monthlyDay || 1);
    setFormVoicePrompt(med.voicePrompt);
    setFormCustomVoiceUri(med.customVoiceUri);
    setFormAudioTone(med.audioTone);
    setFormStockEnabled(med.stockCurrent !== undefined);
    setFormStockCurrent(med.stockCurrent !== undefined ? med.stockCurrent : 30);
    setFormStockMin(med.stockMin !== undefined ? med.stockMin : 5);
    setFormPillColor(med.pillColor || 'blue');
    setShowAddModal(true);
  };

  const deleteMedication = (id: string) => {
    const medToDelete = medications.find(m => m.id === id);
    if (medToDelete) {
      const android = (window as any).Android;
      if (android) {
        const nativeId = medToDelete.nativeId || Math.floor(Math.random() * 10000000);
        try {
          android.cancelAlarm(nativeId);
          console.log(`[MediVoce] Cancelled native alarm for ${medToDelete.name} on deletion.`);
        } catch (e) {
          console.error("Error cancelling native alarm on deletion:", e);
        }
      }
    }
    setMedications(prev => prev.filter(m => m.id !== id));
    setMedToDeleteId(null);
  };

  const handleUpdateMedicationVoice = (medId: string, customVoiceUri: string | undefined) => {
    setMedications(prev => {
      const updated = prev.map(m => {
        if (m.id === medId) {
          return {
            ...m,
            customVoiceUri: customVoiceUri || undefined
          };
        }
        return m;
      });
      localStorage.setItem('medivoce_meds', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggles the state of taken vs skipped pill for CURRENT calendar date and specific time slot
  const toggleTakenStatusForSlot = (med: Medication, timeSlot?: string | null) => {
    const todayStr = getLocalIsoDate();
    const actualSlot = timeSlot || med.times?.[0] || med.time;
    const slotKey = `${todayStr}_${actualSlot}`;

    setMedications(prev => prev.map(item => {
      if (item.id === med.id) {
        const updatedHistory = { ...(item.history || {}) };
        const medTimes = item.times && item.times.length > 0 ? item.times : [item.time];
        const isSingleSlot = medTimes.length === 1;
        const isAlreadyTaken = updatedHistory[slotKey] === true || (isSingleSlot && updatedHistory[todayStr] === true);

        let newStock = item.stockCurrent;

        if (isAlreadyTaken) {
          delete updatedHistory[slotKey];
          if (isSingleSlot) {
            delete updatedHistory[todayStr];
          }
          if (item.stockCurrent !== undefined) {
            newStock = item.stockCurrent + 1;
          }
        } else {
          updatedHistory[slotKey] = true;
          if (isSingleSlot) {
            updatedHistory[todayStr] = true;
          }
          if (item.stockCurrent !== undefined) {
            newStock = Math.max(0, item.stockCurrent - 1);
          }
          
          const android = (window as any).Android;
          if (android && typeof android.markSlotTakenInNative === 'function') {
            try {
              android.markSlotTakenInNative(med.name, actualSlot, todayStr);
            } catch (e) {
              console.error("[MediVoce] Error calling markSlotTakenInNative:", e);
            }
          }

          // Play a delightful micro sound confirming action
          playAlarmTone('preset_trillo');
          
          // Speak kind confirmation phrase for sensory reinforcement
          const confirmationSpeech = lang === 'it' 
            ? "Grazie, ho registrato che hai preso la medicina. Bravissimo!" 
            : "Thank you, I have written down that you took your medicine. Excellent job!";
          // speakAnnouncement(confirmationSpeech, lang, speechSpeed, 'empathetic');
        }
        return { ...item, history: updatedHistory, stockCurrent: newStock };
      }
      return item;
    }));
  };

  const toggleTakenStatusForToday = (med: Medication) => {
    toggleTakenStatusForSlot(med, null);
  };

  // Launches an active screen notification with continuous alarm play and speech alert
  const triggerDeviceVibration = (patternOrDuration: number | number[], force: boolean = false) => {
    if (!vibrationEnabled && !force) return;
    
    // 1. Try Native Android Bridge first
    const android = (window as any).Android;
    if (android && android.vibrate) {
      try {
        const duration = Array.isArray(patternOrDuration) 
          ? patternOrDuration.reduce((acc, curr) => acc + curr, 0)
          : patternOrDuration;
        android.vibrate(duration);
        return;
      } catch (e) {
        console.error("Error calling native vibrate", e);
      }
    }

    // 2. Fallback to HTML5 Vibration API in standard browsers
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(patternOrDuration);
      } catch (e) {
        console.error("Error calling navigator.vibrate", e);
      }
    }
  };

  const activateVoiceRemindSystem = (med: Medication, slotTime?: string | null) => {
    setActiveVoiceReminder(med);
    const actualSlot = slotTime || med.times?.[0] || med.time;
    setActiveVoiceReminderSlot(actualSlot);
    
    // Play sound notification loop
    playAlarmTone(med.audioTone);

    // Vibrate device if enabled
    triggerDeviceVibration([500, 200, 500, 200, 1000]);
    
    // Speak custom customized script with TTS or play user's recorded voice if enabled
    if (voiceAnnounceEnabled) {
      if (med.customVoiceUri) {
        setTimeout(() => {
          playVoiceAudio(med.customVoiceUri!);
        }, 60);
      } else {
        let textToSpeak = med.voicePrompt || `${t.speakAlert}: ${med.name}. ${med.dosage}. ${med.notes}`;
        // Append stock warning if stock is low
        if (med.stockCurrent !== undefined && med.stockCurrent <= (med.stockMin || 5)) {
          const stockAlertMsg = lang === 'it' 
            ? `Attenzione, la scorta di questo promemoria sta per esaurirsi. Rimangono solo ${med.stockCurrent} dosi.` 
            : `Warning, stock is running low. Only ${med.stockCurrent} doses remaining.`;
          textToSpeak = `${textToSpeak}. ${stockAlertMsg}`;
        }
        setTimeout(() => {
          speakAnnouncement(textToSpeak, lang, speechSpeed, speechTone);
        }, 50);
      }
    }
  };

  // Microphone confirm: speech recognition says "Preso" / "Si" to close alert
  const startSpeechConfirmService = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'it' ? "Funzione vocale non supportata in questo browser." : "Speech recognition utility not active in this browser.");
      return;
    }

    // 1. SILENCE DEVICE: Stop ongoing speech synthesis immediately so it doesn't overlap or interfere with the mic
    try {
      stopSpeaking();
    } catch (err) {
      console.warn("Failed to stop speech synthesis", err);
    }

    // 2. SILENCE DEVICE: Stop any active device alarm sounds from the Android interface
    const android = (window as any).Android;
    if (android && android.stopDeviceSound) {
      try {
        android.stopDeviceSound();
      } catch (err) {
        console.warn("Failed to stop native device sound", err);
      }
    }

    // Native Android mic permission check/request
    if (android && typeof android.hasRecordAudioPermission === 'function') {
      try {
        if (!android.hasRecordAudioPermission()) {
          console.log("[MediVoce] Native RECORD_AUDIO permission not granted yet. Requesting...");
          android.requestRecordAudioPermission();
          setSpeechConfirmError(
            lang === 'it' 
              ? "Consenti il permesso del microfono quando richiesto dal dispositivo, quindi riprova." 
              : "Please grant microphone permission when prompted by your device, then try again."
          );
          setIsListeningForConfirm(false);
          return;
        }
      } catch (err) {
        console.warn("Failed native permission check", err);
      }
    }

    setSpeechConfirmError('');
    setIsListeningForConfirm(true);

    const recognition = new SpeechRecognition();
    
    // Set appropriate language locale
    if (lang === 'es') {
      recognition.lang = 'es-ES';
    } else if (lang === 'fr') {
      recognition.lang = 'fr-FR';
    } else if (lang === 'it') {
      recognition.lang = 'it-IT';
    } else {
      recognition.lang = 'en-US';
    }

    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (e: any) => {
      if (!e.results || e.results.length === 0) return;
      const phrase = e.results[0][0].transcript.toLowerCase().trim();
      console.log("Captured confirm: ", phrase);
      
      // Robust multi-language confirmation vocabulary
      const isPositive = 
        phrase.includes('preso') || 
        phrase.includes('presa') || 
        phrase.includes('presi') || 
        phrase.includes('prese') || 
        phrase.includes('si') || 
        phrase.includes('sì') || 
        phrase.includes('fatto') || 
        phrase.includes('confermo') || 
        phrase.includes('conferma') || 
        phrase.includes('assunto') || 
        phrase.includes('assunta') || 
        phrase.includes('va bene') || 
        phrase.includes('vabene') || 
        phrase.includes('ho preso') || 
        phrase.includes('ho presa') || 
        phrase.includes('yes') || 
        phrase.includes('taken') || 
        phrase.includes('done') || 
        phrase.includes('confirm') || 
        phrase.includes('confirmed') || 
        phrase.includes('ok') || 
        phrase.includes('okay') || 
        phrase.includes('sí') || 
        phrase.includes('tomado') || 
        phrase.includes('tomada') || 
        phrase.includes('hecho') || 
        phrase.includes('oui') || 
        phrase.includes('pris') || 
        phrase.includes('prise') || 
        phrase.includes('fait');

      if (isPositive && activeVoiceReminder) {
        // Mark as taken
        toggleTakenStatusForSlot(activeVoiceReminder, activeVoiceReminderSlot);
        setActiveVoiceReminder(null);
      } else {
        // Did not match
        setSpeechConfirmError(
          lang === 'it' 
            ? `Hai detto: "${phrase}". Pronuncia chiaramente 'Preso' o 'Sì'.` 
            : `You said: "${phrase}". Please speak clearly 'Taken' or 'Yes'.`
        );
      }
      setIsListeningForConfirm(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech confirmation error:", event.error);
      const errType = event.error;
      
      if (errType === 'not-allowed') {
        setSpeechConfirmError(
          lang === 'it' 
            ? "Permesso microfono negato. Consenti l'accesso nelle impostazioni." 
            : "Microphone permission denied. Allow access in settings."
        );
      } else if (errType === 'no-speech') {
        setSpeechConfirmError(
          lang === 'it' 
            ? "Nessuna voce rilevata. Parla a voce più alta." 
            : "No speech detected. Please speak louder."
        );
      } else if (errType === 'network') {
        setSpeechConfirmError(
          lang === 'it' 
            ? "Errore di connessione di rete." 
            : "Network connection error."
        );
      } else {
        setSpeechConfirmError(
          lang === 'it' 
            ? "Errore microfono o non ho capito, riprova." 
            : "Microphone error or misunderstood, try again."
        );
      }
      setIsListeningForConfirm(false);
    };

    recognition.onend = () => {
      setIsListeningForConfirm(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Could not start speech recognition:", e);
      setSpeechConfirmError(
        lang === 'it' 
          ? "Impossibile attivare il microfono." 
          : "Could not activate microphone."
      );
      setIsListeningForConfirm(false);
    }
  };

  // Form auto populate callback invoked from Barcode Scanner
  const handleBarcodeDecoded = (item: any) => {
    setIsEditingId(null);
    setFormName(item.name);
    setFormDosage(item.dosage);
    setFormNotes(item.instructions);
    setFormCategory(item.category);
    
    // Open the Add/Edit form so the user can review and save
    setShowAddModal(true);
    setShowScanner(false);
  };

  // Dr symptoms notes handlers
  const handleAddDoctorNote = (text: string, isSymptom: boolean) => {
    const newNote: DoctorNote = {
      id: Date.now().toString(),
      date: getLocalIsoDate(),
      text,
      hasSymptom: isSymptom
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleDeleteDoctorNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Quick helper to determine today's weekday
  const todayWeekdayVal = currentTime.getDay();

  // Computed values for Daily Summary (Riepilogo Giornaliero)
  const todayStr = getLocalIsoDate(currentTime);
  const todayMeds = medications.filter(m => m.isActive && isScheduledOnDate(m, currentTime));

  const todayDoses: { med: Medication; timeSlot: string; isTaken: boolean }[] = [];

  todayMeds.forEach(med => {
    const medTimes = med.times && med.times.length > 0 ? med.times : [med.time];
    medTimes.forEach(timeSlot => {
      const slotKey = `${todayStr}_${timeSlot}`;
      const isTaken = (med.history || {})[slotKey] === true || (medTimes.length === 1 && (med.history || {})[todayStr] === true);
      todayDoses.push({
        med,
        timeSlot,
        isTaken
      });
    });
  });

  // Sort today's doses chronologically by timeSlot
  todayDoses.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const todayTotal = todayDoses.length;
  const todayTaken = todayDoses.filter(d => d.isTaken).length;

  // Filter and split medications for medication management tab
  const filteredMeds = medications.filter(m => 
    m.name.toLowerCase().includes(medsSearchQuery.toLowerCase()) ||
    m.dosage.toLowerCase().includes(medsSearchQuery.toLowerCase()) ||
    m.notes.toLowerCase().includes(medsSearchQuery.toLowerCase())
  );

  const activeMedsList = filteredMeds.filter(m => m.isActive);
  const inactiveMedsList = filteredMeds.filter(m => !m.isActive);
  const otherActiveMeds = medications.filter(m => m.isActive && !isScheduledOnDate(m, currentTime));

  const renderMedicationRow = (med: Medication) => {
    const medTimes = med.times && med.times.length > 0 ? med.times : [med.time];
    
    const colorMap: {[key: string]: { bg: string, text: string, border: string }} = {
      blue: { bg: 'bg-blue-50 text-blue-800', text: 'text-blue-600', border: 'border-blue-100' },
      red: { bg: 'bg-rose-50 text-rose-800', text: 'text-rose-600', border: 'border-rose-100' },
      green: { bg: 'bg-emerald-50 text-emerald-800', text: 'text-emerald-600', border: 'border-emerald-100' },
      orange: { bg: 'bg-amber-50 text-amber-800', text: 'text-amber-600', border: 'border-amber-100' },
      purple: { bg: 'bg-purple-50 text-purple-800', text: 'text-purple-600', border: 'border-purple-100' },
    };
    const colorSet = colorMap[med.pillColor || 'blue'] || colorMap.blue;

    return (
      <div 
        key={med.id} 
        className={`p-4 rounded-3xl border bg-white border-gray-200 shadow-sm text-left flex flex-col gap-3 transition-all ${
          !med.isActive ? 'opacity-70 bg-slate-50' : `border-l-4 ${
            med.pillColor === 'red' ? 'border-l-rose-500' :
            med.pillColor === 'green' ? 'border-l-emerald-500' :
            med.pillColor === 'orange' ? 'border-l-amber-500' :
            med.pillColor === 'purple' ? 'border-l-purple-500' :
            'border-l-blue-500'
          }`
        }`}
      >
        <div className="flex justify-between items-start gap-2">
          {/* Left info */}
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 border ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}>
              {med.category === 'pill' ? '📝' : med.category === 'capsule' ? '🔔' : med.category === 'liquid' ? '⏰' : med.category === 'bottle' ? '📅' : med.category === 'inhaler' ? '🗣️' : med.category === 'cream' ? '📋' : med.category === 'injection' ? '💡' : '📌'}
            </div>
            <div>
              <h5 className="font-extrabold text-slate-800 leading-tight flex items-center gap-2 flex-wrap">
                <span>{med.name}</span>
                {med.customVoiceUri && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                    🎙️ {t.recordedVoiceBadge}
                  </span>
                )}
                {med.stockCurrent !== undefined && (
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black leading-none ${
                    med.stockCurrent <= (med.stockMin || 5) 
                      ? 'bg-rose-100 text-rose-700 animate-pulse' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    📦 {med.stockCurrent} pz {med.stockCurrent <= (med.stockMin || 5) ? '⚠️' : ''}
                  </span>
                )}
              </h5>
              <p className="text-3xs text-slate-400 font-extrabold mt-0.5">{med.dosage}</p>
            </div>
          </div>

          {/* Right toggle / switch */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id={`toggle-active-btn-${med.id}`}
              onClick={() => {
                setMedications(prev => prev.map(m => m.id === med.id ? { ...m, isActive: !m.isActive } : m));
              }}
              className={`w-11 h-6 rounded-full transition-all duration-200 relative flex p-0.5 items-center ${
                med.isActive ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  med.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Times list badges */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.timesLabel}</span>
          {medTimes.map((tVal, tid) => (
            <span key={tid} className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
              <Clock className="w-2.5 h-2.5 text-slate-400" />
              <span>{tVal}</span>
            </span>
          ))}
        </div>

        {/* Action buttons (Edit/Delete) */}
        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-xs">
          <div className="text-[11px] text-[#E58045] font-extrabold flex items-center gap-1">
            <span>🔄</span>
            <span>{formatMedicationSchedule(med, lang)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id={`edit-med-manage-${med.id}`}
              onClick={() => startEditMedication(med)}
              className="py-1.5 px-3 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] font-extrabold rounded-xl transition-all flex items-center gap-1"
            >
              <span>✏️</span>
              <span>{t.editBtn}</span>
            </button>
            <button
              id={`delete-med-manage-${med.id}`}
              onClick={() => setMedToDeleteId(med.id)}
              className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold rounded-xl transition-all flex items-center gap-1"
            >
              <span>🗑️</span>
              <span>{t.deleteBtn}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="application-container" className={`min-h-screen w-full flex justify-center items-center font-sans p-0 sm:p-4 md:py-8 ${appTheme === 'dark' ? 'bg-slate-900' : appTheme === 'warm' ? 'bg-amber-100' : 'bg-[#F0F4F8]'}`}>
      
      <AnimatePresence>

        {!onboarded && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

        {/* ACCESS-SAFE MOBILE CONTAINER FRAME EMULATOR */}
        <div id="mobile-shell-emulator" className={`relative w-full max-w-full sm:max-w-sm rounded-none sm:rounded-[40px] shadow-none sm:shadow-[0_25px_60px_-15px_rgba(30,58,138,0.25)] border-0 sm:border-[10px] sm:border-[#1E293B] overflow-hidden flex flex-col h-screen sm:h-[820px] select-none ${appTheme === 'dark' ? 'bg-slate-800' : appTheme === 'warm' ? 'bg-orange-50' : 'bg-[#F8FAFC]'}`}>

        {/* Dynamic Speech Active Fullscreen overlay */}
        <AnimatePresence>
          {activeVoiceReminder && (
            <motion.div
              id="voice-reminder-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-[#1E1610] to-[#2C2115] text-amber-50 z-50 flex flex-col justify-between p-8"
            >
              <div className="text-center pt-8">
                <span className="text-amber-500 font-extrabold text-xs tracking-widest uppercase block mb-1">
                  {activeVoiceReminder.customVoiceUri ? `🎙️ ${t.recordedVoiceBadge}` : `🔊 ${t.speakAlert}`}
                </span>
                <span className="text-3xl font-black block tracking-tight truncate px-4">{activeVoiceReminder.name}</span>
                <span className="text-sm font-semibold bg-amber-900/50 py-1 px-3.5 rounded-full border border-amber-800 text-amber-300 mt-2 inline-block">
                  {activeVoiceReminder.dosage} &bull; {activeVoiceReminderSlot || activeVoiceReminder.time}
                </span>
              </div>

              {/* Heartbeat radar ripple / Sound wave animation */}
              <div className="flex flex-col items-center justify-center my-auto py-2 space-y-3 shrink-0">
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <div className={`absolute inset-0 rounded-full bg-amber-500/10 ${isSpeaking ? 'animate-ping' : ''}`} />
                  <div className="absolute inset-4 rounded-full bg-[#E58045]/20 animate-pulse" />
                  <div className="w-20 h-20 rounded-full bg-[#E58045] flex items-center justify-center text-white shadow-xl z-10">
                    <BellRing className="w-10 h-10 animate-bounce" />
                  </div>
                </div>

                {/* Animated Sound Wave Visualizer */}
                <div className="text-center w-full max-w-xs transition-all duration-300">
                  <div className="flex items-end justify-center gap-1 h-12 px-6 py-1 bg-amber-950/20 rounded-2xl border border-amber-900/10 w-fit mx-auto">
                    {['h-3', 'h-6', 'h-9', 'h-4', 'h-8', 'h-10', 'h-5', 'h-3', 'h-7', 'h-10', 'h-6', 'h-8', 'h-4', 'h-7', 'h-10', 'h-3'].map((height, i) => {
                      const delayClass = `animation-delay-${(i * 75) % 900}`;
                      return (
                        <div
                          key={i}
                          className={`w-1 rounded-full bg-amber-400 ${height} ${isSpeaking ? 'animate-soundwave' : 'scale-y-[0.2]'} ${delayClass} transition-all duration-300`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest mt-1.5 block">
                    {isSpeaking ? (lang === 'it' ? 'Assistente parla...' : 'Assistant speaking...') : (lang === 'it' ? 'In attesa...' : 'Waiting...')}
                  </span>
                </div>
              </div>

              {/* Spoken content and interactive confirmation buttons */}
              <div className="space-y-4 text-center pb-8">
                <div className="text-base leading-relaxed text-amber-100/90 font-medium bg-[#1E1610]/80 p-4 rounded-2xl border border-amber-950">
                  {activeVoiceReminder.customVoiceUri ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.recordedVoiceBadge}</span>
                      </div>
                      <p className="text-sm font-semibold text-amber-100 italic">
                        "{activeVoiceReminder.voicePrompt || activeVoiceReminder.name}"
                      </p>
                      <button
                        type="button"
                        onClick={() => playVoiceAudio(activeVoiceReminder.customVoiceUri!)}
                        className="py-1.5 px-3.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{lang === 'it' ? "Riascolta Voce Reale" : "Replay Real Voice"}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="italic">"{activeVoiceReminder.voicePrompt}"</div>
                  )}
                </div>

                <div className="text-xs text-amber-500/80 font-semibold uppercase tracking-wide">
                  {isListeningForConfirm 
                    ? (lang === 'it' ? "🎙️ Ascolto attivo... Pronuncia 'Preso' o 'Sì'" : "🎙️ Listening... Say 'Yes' or 'Taken'") 
                    : (lang === 'it' ? "Dì 'Preso' o usa i controlli sotto" : "Say 'Taken' or use buttons below")}
                </div>

                {speechConfirmError && (
                  <div className="text-xs text-rose-400 font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/30 max-w-xs mx-auto animate-pulse">
                    ⚠️ {speechConfirmError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {/* Speech Trigger mic button */}
                  <button
                    id="trigger-alert-mic-confirm"
                    onClick={startSpeechConfirmService}
                    className={`py-4 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      isListeningForConfirm 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    <span>{isListeningForConfirm ? "Ascoltando..." : "Conferma con Voce"}</span>
                  </button>

                  <button
                    id="manual-confirm-alert"
                    onClick={() => {
                      // Stop speaking and alarms immediately
                      try {
                        stopSpeaking();
                      } catch (e) {}
                      const android = (window as any).Android;
                      if (android && typeof android.stopDeviceSound === 'function') {
                        try {
                          android.stopDeviceSound();
                        } catch (e) {}
                      }
                      toggleTakenStatusForSlot(activeVoiceReminder, activeVoiceReminderSlot);
                      setActiveVoiceReminder(null);
                    }}
                    className="py-4 px-5 rounded-2xl bg-[#D5601B] hover:bg-[#B74C10] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{t.takenBtn}</span>
                  </button>
                </div>

                <button
                  id="rimanda-alert-btn"
                  onClick={() => {
                    // Stop speaking and alarms immediately
                    try {
                      stopSpeaking();
                    } catch (e) {}
                    const android = (window as any).Android;
                    if (android && typeof android.stopDeviceSound === 'function') {
                      try {
                        android.stopDeviceSound();
                      } catch (e) {}
                    }
                    if (activeVoiceReminder) {
                      const todayStr = getLocalIsoDate();
                      const actualSlot = activeVoiceReminderSlot || activeVoiceReminder.times?.[0] || activeVoiceReminder.time;
                      const slotKey = `${todayStr}_${actualSlot}`;
                      const dismissedKey = `${activeVoiceReminder.id}_${slotKey}`;
                      dismissedAutoTriggersRef.current[dismissedKey] = {
                        dismissedAt: Date.now(),
                        type: 'snooze'
                      };
                    }
                    setActiveVoiceReminder(null);
                  }}
                  className="text-xs text-gray-400 hover:text-white font-bold transition-colors pt-2 block mx-auto underline"
                >
                  {lang === 'it' ? "Rimanda silenziosamente" : "Snooze silently"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* MAIN BODY SCROLL VIEW - padded below notch, above nav bar */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-6">
          
          {/* QUICK CHANGER LANGUAGE SELECTOR BAR REMOVED */}

          {/* TAB CONTENTS CONTAINER CHASSIS */}
          <div className="space-y-6">
            
              {/* TAB AGENDA (MED LIST) */}
            {activeTab === 'agenda' && (
              <div className="space-y-4 animate-fade-in">
                
                 {/* TOP ACCESSIBLE BANNER - GREETING & CLOCK */}
                 <div className={`flex justify-between items-center bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} text-white px-4 py-5 rounded-[28px] ${theme.shadow}`}>
                   <div className="space-y-1 text-left">
                     <span className="text-3xs font-black uppercase tracking-widest text-white/80">
                       {currentTime.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                     </span>
                     <h2 className="text-xl font-bold tracking-tight">{getContextualGreeting()}!</h2>
                     <span className="text-xs font-semibold text-white/90 block leading-tight">
                       {lang === 'it' ? "Promemoria vocali attivi" : "Vocal reminders armed"}
                     </span>
                   </div>
                   
                   <div className="text-right flex flex-col items-end">
                     <Clock className="w-6 h-6 text-white/90 mb-1 animate-[pulse_2.2s_infinite]" />
                     <span className="font-mono text-lg font-black text-white">
                       {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                   </div>
                 </div>

                {/* DAILY SUMMARY CARD */}
                 <div className="mb-6 flex flex-col gap-3 text-left">
                   <div className="flex justify-between items-center">
                     <h3 className="text-sm font-extrabold text-[#1E293B] tracking-tight">{t.dailySummaryTitle}</h3>
                     <span className={`text-xs font-black ${theme.text}`}>
                       {todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 0}%
                     </span>
                   </div>
                   <div className="w-full bg-[#F1F5F9] rounded-full h-2.5 overflow-hidden">
                     <div 
                       className={`${theme.primary} h-2.5 rounded-full transition-all duration-1000 ease-in-out`} 
                       style={{ width: `${todayTotal > 0 ? (todayTaken / todayTotal) * 100 : 0}%` }}
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4 mt-1">
                     <div className="flex flex-col">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{t.dailySummaryTaken}</span>
                       <span className="text-xl font-black text-emerald-600 leading-tight">{todayTaken}</span>
                     </div>
                     <div className="flex flex-col text-right">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{t.dailySummaryRemaining}</span>
                       <span className="text-xl font-black text-amber-500 leading-tight">{todayTotal - todayTaken}</span>
                     </div>
                   </div>
                 </div>
 
                 {/* Agenda main title bar */}
                 <div className="flex justify-between items-center">
                   <div className="text-left">
                     <h3 className="text-lg font-extrabold text-[#1E3A8A] tracking-tight">{t.todayMedsTitle}</h3>
                     <div className="text-3xs text-[#64748B] font-bold uppercase tracking-wider">{t.todayMedsSubtitle}</div>
                   </div>
                   
                   <button
                     id="app-add-med-btn"
                     onClick={() => {
                       setIsEditingId(null);
                       setFormName('');
                       setFormDosage('');
                       setFormTime('08:00');
                       setFormTimes(['08:00']);
                       setFormNotes('');
                       setFormCategory('pill');
                       setFormSchedule([1, 2, 3, 4, 5, 6, 0]);
                       setFormVoicePrompt('');
                       setFormAudioTone('preset_arpeggio');
                       setShowAddModal(true);
                     }}
                     className={`py-2 px-3 rounded-xl ${theme.primary} ${theme.primaryHover} text-white font-extrabold text-xs flex items-center gap-1 ${theme.shadow} transition-all`}
                   >
                     <Plus className="w-3.5 h-3.5" />
                     <span>{t.addMedication}</span>
                   </button>
                 </div>

                 {/* Medications listings */}
                 {todayTotal === 0 ? (
                   <div className="mb-6 p-8 border-2 border-dashed border-gray-200 text-center space-y-3">
                     <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                     <div className="text-gray-500 text-sm font-medium">{t.noMedsToday}</div>
                   </div>
                 ) : (
                   <div className="space-y-3.5">
                     {todayDoses.map((dose, idx) => {
                       const { med, timeSlot, isTaken } = dose;
                       return (
                         <div 
                           id={`med-row-${med.id}-${timeSlot}`}
                           key={`${med.id}-${timeSlot}`}
                           className={`p-4 rounded-3xl border transition-all space-y-3 relative text-left ${
                             isTaken 
                               ? 'bg-emerald-50/45 border-[#A7F3D0] shadow-sm' 
                               : `bg-white border-gray-200 hover:border-gray-300 border-l-4 ${
                                   med.pillColor === 'red' ? 'border-l-rose-500' :
                                   med.pillColor === 'green' ? 'border-l-emerald-500' :
                                   med.pillColor === 'orange' ? 'border-l-amber-500' :
                                   med.pillColor === 'purple' ? 'border-l-purple-500' :
                                   'border-l-blue-500'
                                 }`
                           }`}
                         >
                           <div className="flex justify-between items-start gap-3">
                             {/* Medicine icon & title block */}
                             <div className="flex items-start gap-3 flex-1 min-w-0">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 ${
                                 isTaken 
                                   ? 'bg-emerald-100 text-emerald-800' 
                                   : med.pillColor === 'red' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                     med.pillColor === 'green' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                     med.pillColor === 'orange' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                     med.pillColor === 'purple' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                     'bg-blue-50 text-blue-600 border border-blue-100'
                               }`}>
                                 {med.category === 'pill' ? '📝' : med.category === 'capsule' ? '🔔' : med.category === 'liquid' ? '⏰' : med.category === 'bottle' ? '📅' : med.category === 'inhaler' ? '🗣️' : med.category === 'cream' ? '📋' : med.category === 'injection' ? '💡' : '📌'}
                               </div>
                               <div className="min-w-0 flex-1">
                                 <h4 className="font-extrabold text-base text-[#1E293B] leading-snug tracking-tight break-words flex items-center gap-1.5 flex-wrap">
                                   <span>{med.name}</span>
                                   {med.customVoiceUri && (
                                     <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                                       🎙️ {t.recordedVoiceBadge}
                                     </span>
                                   )}
                                 </h4>
                                 <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                   <Clock className="w-3.5 h-3.5 text-gray-400" />
                                   <span className={`font-bold ${
                                     isTaken 
                                       ? 'text-emerald-600' 
                                       : med.pillColor === 'red' ? 'text-rose-600' :
                                         med.pillColor === 'green' ? 'text-emerald-600' :
                                         med.pillColor === 'orange' ? 'text-amber-600' :
                                         med.pillColor === 'purple' ? 'text-purple-600' :
                                         'text-blue-600'
                                   }`}>{timeSlot}</span>
                                   <span>&bull;</span>
                                   <span className="font-semibold text-gray-500">{med.dosage}</span>
                                 </div>
                               </div>
                             </div>
                             {/* Options popup edit/del */}
                             <div className="flex gap-2 shrink-0 items-center">
                               <button
                                 id={`edit-med-btn-${med.id}`}
                                 onClick={() => startEditMedication(med)}
                                 className="p-1.5 hover:bg-gray-100 rounded-xl transition-all text-2xl cursor-pointer"
                                 title={lang === 'it' ? "Modifica" : "Edit"}
                               >
                                 ✏️
                               </button>
                               <button
                                 id={`delete-med-btn-${med.id}`}
                                 onClick={() => setMedToDeleteId(med.id)}
                                 className="p-1.5 hover:bg-rose-50 rounded-xl transition-all text-2xl cursor-pointer"
                                 title={lang === 'it' ? "Elimina" : "Delete"}
                               >
                                 🗑️
                               </button>
                             </div>
                           </div>

                           {/* Medicine custom inst */}
                           {med.notes && (
                             <div className="text-xs text-gray-500 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] leading-relaxed font-semibold">
                               {med.notes}
                             </div>
                           )}

                           {/* Interactive control buttons */}
                           <div className="flex items-center gap-2 border-t border-[#E2E8F0] pt-3">
                             {/* Trigger Voice test / voice dispatch alert */}
                             <button
                               id={`say-alert-btn-${med.id}-${timeSlot}`}
                               onClick={() => activateVoiceRemindSystem(med, timeSlot)}
                               className={`py-2.5 px-3.5 rounded-xl ${theme.bgLight} ${theme.bgLightHover} border ${theme.borderLight} ${theme.text} ${theme.textHover} font-bold text-xs flex items-center gap-1.5 transition-all shrink-0`}
                               title="Avvia avviso vocale"
                             >
                               <Volume2 className="w-4 h-4" />
                               <span>{lang === 'it' ? "Ascolta Voce" : "Speaker"}</span>
                             </button>

                             {/* Big Tick Confirm check */}
                             <button
                               id={`confirm-toggle-btn-${med.id}-${timeSlot}`}
                               onClick={() => toggleTakenStatusForSlot(med, timeSlot)}
                               className={`py-2 px-3 rounded-xl font-extrabold text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                                 isTaken 
                                   ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' 
                                   : `${theme.primary} ${theme.primaryHover} text-white shadow-sm`
                               }`}
                             >
                               <CheckCircle className="w-3.5 h-3.5" />
                               <span>{isTaken ? t.takenBtn : t.pendingBtn}</span>
                             </button>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 )}

                 {/* Other Active Reminders section */}
                 {otherActiveMeds.length > 0 && (
                   <div className="mt-8 pt-6 border-t border-slate-200/80 space-y-4">
                     <div className="text-left pl-1">
                       <h4 className="text-base font-extrabold text-[#1E3A8A] tracking-tight">
                         {lang === 'it' ? "Altri Promemoria Attivi" :
                          lang === 'es' ? "Otros Recordatorios Activos" :
                          lang === 'fr' ? "Autres Rappels Actifs" :
                          lang === 'de' ? "Andere aktive Erinnerungen" :
                          "Other Active Reminders"}
                       </h4>
                       <p className="text-3xs text-[#64748B] font-bold uppercase tracking-wider">
                         {lang === 'it' ? "Promemoria attivi programmati per altri giorni" :
                          lang === 'es' ? "Recordatorios activos programados para otros días" :
                          lang === 'fr' ? "Rappels actifs prévus pour d'autres jours" :
                          lang === 'de' ? "Aktive Erinnerungen, die für andere Tage geplant sind" :
                          "Active reminders scheduled for other days"}
                       </p>
                     </div>
                     <div className="grid grid-cols-1 gap-3">
                       {otherActiveMeds.map((med) => {
                         const medTimes = med.times && med.times.length > 0 ? med.times : [med.time];
                         return (
                           <div 
                             id={`other-med-${med.id}`}
                             key={med.id}
                             className="p-4 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col gap-2 text-left hover:border-[#CBD5E1] transition-all"
                           >
                             <div className="flex justify-between items-start gap-2">
                               <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-lg shrink-0">
                                   {med.category === 'pill' ? '📝' : med.category === 'capsule' ? '🔔' : med.category === 'liquid' ? '⏰' : med.category === 'bottle' ? '📅' : med.category === 'inhaler' ? '🗣️' : med.category === 'cream' ? '📋' : med.category === 'injection' ? '💡' : '📌'}
                                 </div>
                                 <div>
                                   <h5 className="font-extrabold text-slate-700 text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                                     <span>{med.name}</span>
                                     {med.customVoiceUri && (
                                       <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                                         🎙️ {t.recordedVoiceBadge}
                                       </span>
                                     )}
                                   </h5>
                                   <p className="text-3xs text-slate-500 font-bold mt-0.5">{med.dosage}</p>
                                 </div>
                               </div>
                               <div className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-[#E58045] border border-amber-100 rounded-lg shrink-0">
                                 {formatMedicationSchedule(med, lang)}
                                </div>
                             </div>
                             <div className="flex flex-wrap gap-1.5 items-center mt-1 pt-2 border-t border-[#E2E8F0] text-3xs text-slate-400 font-bold">
                               <span className="uppercase">{lang === 'it' ? "Orari:" : "Times:"}</span>
                               {medTimes.map((time, tIdx) => (
                                 <span key={tIdx} className="inline-flex items-center gap-1 font-extrabold text-slate-600 px-1.5 py-0.5 bg-slate-100 rounded">
                                   <Clock className="w-2.5 h-2.5 text-slate-400" />
                                   {time}
                                 </span>
                               ))}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}



                {/* Inline History Adherence and Symptoms Notes inside the Daily Agenda View */}
                <div className="pt-6 border-t border-slate-200/80 space-y-5">
                  <div className="text-left pl-1">
                    <h3 className="text-lg font-extrabold text-[#1E3A8A] tracking-tight">
                      {t.historyAndNotesHeader}
                    </h3>
                    <p className="text-3xs text-[#64748B] font-bold uppercase tracking-wider">
                      {t.historyAndNotesSub}
                    </p>
                  </div>
                  <HistoryAndNotes 
                    lang={lang} 
                    medications={medications}
                    notes={notes}
                    onAddNote={handleAddDoctorNote}
                    onDeleteNote={handleDeleteDoctorNote}
                  />
                </div>

              </div>
            )}

            {/* TAB GESTIONE FARMACI (FORMERLY STORICO TAB BUT RENDERED BEAUTIFULLY) */}
            {activeTab === 'history' && (
              <div className="space-y-6 animate-fade-in text-wrap pb-12">
                {/* Gestione Farmaci Header */}
                <div className="bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-3">
                  <div className="text-left">
                    <h3 className="text-xl font-extrabold text-[#1E3A8A] leading-tight break-words">
                      {t.medicationManagementHeader}
                    </h3>
                    <p className="text-3xs text-[#64748B] font-bold uppercase tracking-wider mt-1 leading-snug break-words">
                      {t.medicationManagementSub}
                    </p>
                  </div>
                  <div className="flex justify-end items-center pt-0.5">
                    <button
                      id="med-tab-add-btn"
                      onClick={() => {
                        setIsEditingId(null);
                        setFormName('');
                        setFormDosage('');
                        setFormTime('08:00');
                        setFormTimes(['08:00']);
                        setFormNotes('');
                        setFormCategory('pill');
                        setFormSchedule([1, 2, 3, 4, 5, 6, 0]);
                        setFormVoicePrompt('');
                        setFormAudioTone('preset_arpeggio');
                        setShowAddModal(true);
                      }}
                      className={`py-2 px-3.5 rounded-xl ${theme.primary} ${theme.primaryHover} text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.addBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={medsSearchQuery}
                    placeholder={t.searchMedPlaceholder}
                    className="w-full bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    onChange={(e) => setMedsSearchQuery(e.target.value)}
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>

                {/* Active Group */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#1E3A8A] uppercase tracking-widest pl-1 text-left">
                    {`${t.activeMedsLabel} (${activeMedsList.length})`}
                  </h4>
                  {activeMedsList.length === 0 ? (
                    <div className="bg-white/50 border border-dashed border-gray-200 rounded-3xl p-6 text-center text-xs text-gray-400 italic">
                      {t.noActiveMeds}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeMedsList.map(med => renderMedicationRow(med))}
                    </div>
                  )}
                </div>

                {/* Inactive Group */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 text-left">
                    {`${t.inactiveMedsLabel} (${inactiveMedsList.length})`}
                  </h4>
                  {inactiveMedsList.length === 0 ? (
                    <div className="bg-white/50 border border-dashed border-gray-200 rounded-3xl p-6 text-center text-xs text-gray-400 italic">
                      {t.noInactiveMeds}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inactiveMedsList.map(med => renderMedicationRow(med))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* TAB VOICE STUDIO */}
            {activeTab === 'voice-studio' && (
              <VoiceStudio
                lang={lang}
                medications={medications}
                onUpdateMedicationVoice={handleUpdateMedicationVoice}
                themeColorClass={theme.primary}
                themeTextClass={theme.text}
              />
            )}
            {/* TAB SETTINGS & VOICE CALIBRATION */}
            {activeTab === 'settings' && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-white px-4 py-5 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className={`w-5 h-5 ${theme.text}`} />
                    <h3 className="text-xl font-extrabold text-[#1E3A8A]">{t.selectLanguage}</h3>
                  </div>
                  <div className="flex items-center justify-between gap-4 mt-2 relative">
                    <label className="text-sm font-bold text-slate-600 hidden">Lingua / Language</label>
                    <div className="relative w-full">
                      <button
                        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                        className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] shadow-sm flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                           {lang === 'it' && <><div className="w-6 shrink-0"><IT /></div><span className="font-extrabold text-[#1E293B]">Italiano</span></>}
                           {lang === 'en' && <><div className="w-6 shrink-0"><US /></div><span className="font-extrabold text-[#1E293B]">English</span></>}
                           {lang === 'es' && <><div className="w-6 shrink-0"><ES /></div><span className="font-extrabold text-[#1E293B]">Español</span></>}
                           {lang === 'fr' && <><div className="w-6 shrink-0"><FR /></div><span className="font-extrabold text-[#1E293B]">Français</span></>}
                           {lang === 'de' && <><div className="w-6 shrink-0"><DE /></div><span className="font-extrabold text-[#1E293B]">Deutsch</span></>}
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {langDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#E2E8F0] rounded-xl shadow-lg z-50 overflow-hidden"
                          >
                            {(['it', 'en', 'es', 'fr', 'de'] as LanguageCode[]).map((ln) => (
                              <button
                                key={ln}
                                onClick={() => {
                                  setLang(ln);
                                  localStorage.setItem('medivoce_lang', ln);
                                  setLangDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                                  lang === ln ? theme.bgLight : ''
                                }`}
                              >
                                {ln === 'it' && <><div className="w-6 shrink-0"><IT /></div><span className="font-bold text-slate-700">Italiano</span></>}
                                {ln === 'en' && <><div className="w-6 shrink-0"><US /></div><span className="font-bold text-slate-700">English</span></>}
                                {ln === 'es' && <><div className="w-6 shrink-0"><ES /></div><span className="font-bold text-slate-700">Español</span></>}
                                {ln === 'fr' && <><div className="w-6 shrink-0"><FR /></div><span className="font-bold text-slate-700">Français</span></>}
                                {ln === 'de' && <><div className="w-6 shrink-0"><DE /></div><span className="font-bold text-slate-700">Deutsch</span></>}
                                {lang === ln && <CheckCircle className={`w-5 h-5 ${theme.text} ml-auto`} />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                     {/* IMPOSTAZIONI VOCE E TONO */}
                <div className="bg-white px-4 py-5 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings className={`w-5 h-5 ${theme.text}`} />
                    <h3 className="text-xl font-extrabold text-[#1E3A8A]">{t.testVoiceSettings}</h3>
                  </div>
                  
                  {/* Range Speed Controller */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span>{t.voiceSpeed}</span>
                      <span className={theme.text}>{speechSpeed}x</span>
                    </div>
                    <input
                      id="speed-range-field"
                      type="range"
                      min="0.5"
                      max="1.2"
                      step="0.05"
                      value={speechSpeed}
                      onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${theme.accentRange}`}
                    />
                  </div>

                  {/* Character Tone Selector */}
                  <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      {lang === 'it' ? 'Stile della Voce' : 'Voice Style'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="tone-option-empathetic"
                        type="button"
                        onClick={() => {
                          setSpeechTone('empathetic');
                          speakAnnouncement(t.toneEmpatheticActive, lang, speechSpeed, 'empathetic');
                        }}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          speechTone === 'empathetic' 
                            ? `${theme.bgLight} ${theme.borderLight} ${theme.textHover} shadow-sm` 
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {t.toneEmpathetic}
                      </button>
                      
                      <button
                        id="tone-option-firm"
                        type="button"
                        onClick={() => {
                          setSpeechTone('firm');
                          speakAnnouncement(t.toneFirmActive, lang, speechSpeed, 'firm');
                        }}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          speechTone === 'firm' 
                            ? `${theme.bgLight} ${theme.borderLight} ${theme.textHover} shadow-sm` 
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {t.toneFirm}
                      </button>
                    </div>
                  </div>

                  {/* Voice Test voice trigger */}
                  <button
                    id="trigger-settings-voice-test"
                    onClick={triggerVoiceTest}
                    className={`w-full py-4 px-5 bg-white hover:bg-slate-50 active:bg-slate-100 ${theme.text} font-extrabold text-sm rounded-xl border-2 border-slate-200 hover:border-slate-300 active:border-slate-400 shadow-sm transition-all flex justify-center items-center gap-2.5 active:scale-[0.97] cursor-pointer`}
                  >
                    <Volume2 className="w-5 h-5 shrink-0" />
                    <span>{t.testVoiceBtn}</span>
                  </button>

                  {/* Voice Tutorial Trigger */}
                  <button
                    id="trigger-settings-voice-tutorial"
                    onClick={() => {
                      speakAnnouncement(t.voiceTutorialText, lang, speechSpeed, speechTone);
                    }}
                    className={`w-full py-4 px-5 bg-white hover:bg-slate-50 active:bg-slate-100 ${theme.text} font-extrabold text-sm rounded-xl border-2 border-slate-200 hover:border-slate-300 active:border-slate-400 shadow-sm transition-all flex justify-center items-center gap-2.5 mt-3 active:scale-[0.97] cursor-pointer`}
                  >
                    <Sparkles className="w-5 h-5 shrink-0" />
                    <span>{t.listenTutorialBtn}</span>
                  </button>

                  {/* Dynamic Voice Soundwave Indicator */}
                  <div className={`mt-4 p-3.5 rounded-2xl border transition-all duration-300 ${
                    isSpeaking 
                      ? `${theme.bgLight} ${theme.borderLight} scale-100 shadow-xs` 
                      : 'bg-white border-gray-150 scale-95 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-end justify-center gap-0.5 h-6 w-20 shrink-0">
                        {['h-2', 'h-4', 'h-6', 'h-3', 'h-5', 'h-6', 'h-2', 'h-4'].map((height, i) => {
                          const delayClass = `animation-delay-${(i * 100) % 900}`;
                          return (
                            <div
                              key={i}
                              className={`w-1 rounded-full ${isSpeaking ? `${theme.bg} animate-soundwave` : 'bg-slate-300 scale-y-[0.3]'} ${height} ${delayClass} transition-all duration-300`}
                            />
                          );
                        })}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className={`text-xs font-black leading-tight ${isSpeaking ? theme.text : 'text-gray-500'}`}>
                          {isSpeaking 
                            ? (lang === 'de' ? "Sprachausgabe aktiv" : lang === 'es' ? "Reproducción de voz activa" : lang === 'fr' ? "Lecture vocale active" : lang === 'it' ? "Riproduzione Vocale Attiva" : "Vocal Synthesis Active")
                            : (lang === 'de' ? "Sprach-Feedback inaktiv" : lang === 'es' ? "Retroalimentación vocal inactiva" : lang === 'fr' ? "Retour vocal inactif" : lang === 'it' ? "Feedback Vocale Inattivo" : "Vocal Feedback Inactive")
                          }
                        </p>
                        <p className="text-[10px] font-bold text-gray-450 leading-normal mt-0.5">
                          {isSpeaking 
                            ? (lang === 'de' ? "Die Stimme spricht..." : lang === 'es' ? "La voz está hablando..." : lang === 'fr' ? "La voix parle..." : lang === 'it' ? "L'assistente sta parlando..." : "The voice is speaking...")
                            : (lang === 'de' ? "Sprachtest starten zum Anhören" : lang === 'es' ? "Inicie una prueba de voz para escuchar" : lang === 'fr' ? "Lancez un test vocal pour écouter" : lang === 'it' ? "Avvia un test vocale per ascoltare" : "Play a voice test to hear")
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>



                {/* VISUAL & DEVICE PREFERENCES */}
                <div className={`p-4 py-5 rounded-3xl border shadow-sm text-left space-y-4 overflow-hidden mb-6 ${appTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#E2E8F0]'}`}>
                  <h3 className={`text-xl font-extrabold ${appTheme === 'dark' ? 'text-white' : 'text-[#1E3A8A]'}`}>{t.devicePreferences}</h3>
                  
                  {/* Theme Accent Color Swatches (TEMA) */}
                  <div className="space-y-2">
                    <span className={`text-sm font-bold block ${appTheme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                      {t.themeColorSetting}
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      <button
                        id="theme-accent-blue"
                        onClick={() => setColorTheme('blue')}
                        className={`py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          colorTheme === 'blue'
                            ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-[#2563EB] block border-2 border-white shadow-sm" />
                        <span className="text-[10px] tracking-tight">{lang === 'it' ? 'Blu' : 'Blue'}</span>
                      </button>
                      
                      <button
                        id="theme-accent-orange"
                        onClick={() => setColorTheme('orange')}
                        className={`py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          colorTheme === 'orange'
                            ? 'bg-[#FFF7ED] border-[#FFEDD5] text-[#C2410C] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-[#F97316] block border-2 border-white shadow-sm" />
                        <span className="text-[10px] tracking-tight">{lang === 'it' ? 'Arancio' : 'Orange'}</span>
                      </button>

                      <button
                        id="theme-accent-teal"
                        onClick={() => setColorTheme('teal')}
                        className={`py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          colorTheme === 'teal'
                            ? 'bg-[#F0FDFA] border-[#CCFBF1] text-[#115E59] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-[#0D9488] block border-2 border-white shadow-sm" />
                        <span className="text-[10px] tracking-tight">{lang === 'it' ? 'Verde' : 'Teal'}</span>
                      </button>

                      <button
                        id="theme-accent-purple"
                        onClick={() => setColorTheme('purple')}
                        className={`py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          colorTheme === 'purple'
                            ? 'bg-[#F5F3FF] border-[#EDE9FE] text-[#6D28D9] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-[#8B5CF6] block border-2 border-white shadow-sm" />
                        <span className="text-[10px] tracking-tight">{lang === 'it' ? 'Viola' : 'Purple'}</span>
                      </button>

                      <button
                        id="theme-accent-rose"
                        onClick={() => setColorTheme('rose')}
                        className={`py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          colorTheme === 'rose'
                            ? 'bg-[#FFF1F2] border-[#FFE4E6] text-[#BE123C] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-[#F43F5E] block border-2 border-white shadow-sm" />
                        <span className="text-[10px] tracking-tight">{lang === 'it' ? 'Rosa' : 'Rose'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Theme Background Style Buttons Selector (SFONDO) */}
                  <div className="space-y-2">
                    <span className={`text-sm font-bold block ${appTheme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                      {t.themeBgSetting}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        id="theme-bg-light"
                        onClick={() => setAppTheme('light')}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 ${
                          appTheme === 'light'
                            ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF] shadow-sm font-extrabold'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        ☀️ {t.defaultTheme}
                      </button>
                      <button
                        id="theme-bg-dark"
                        onClick={() => setAppTheme('dark')}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 ${
                          appTheme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white shadow-sm font-extrabold'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        🌙 {t.darkTheme}
                      </button>
                      <button
                        id="theme-bg-warm"
                        onClick={() => setAppTheme('warm')}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 ${
                          appTheme === 'warm'
                            ? 'bg-amber-100 border-amber-200 text-amber-900 shadow-sm font-extrabold'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        🍑 {t.warmTheme}
                      </button>
                    </div>
                  </div>

                  {/* Vibration Toggle */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between gap-3 w-full">
                      <span className={`text-sm font-bold flex-1 min-w-0 pr-2 break-words [overflow-wrap:anywhere] [hyphens:auto] leading-snug ${appTheme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                        {t.vibrationSetting}
                      </span>
                      <div className="flex items-center gap-2.5 shrink-0 flex-shrink-0">
                        <button 
                          id="toggle-vibration"
                          type="button"
                          onClick={() => {
                            const nextState = !vibrationEnabled;
                            setVibrationEnabled(nextState);
                            if (nextState) {
                              // Trigger short tactile feedback when enabled
                              setTimeout(() => {
                                triggerDeviceVibration(150, true);
                              }, 50);
                            }
                          }}
                          className={`relative inline-flex h-5.5 w-10 shrink-0 flex-shrink-0 min-w-[40px] items-center rounded-full transition-colors cursor-pointer focus:outline-none ${vibrationEnabled ? theme.primary : 'bg-[#333]'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${vibrationEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Always On Display Toggle */}
                  <div className="flex items-center justify-between gap-3 pt-2 w-full border-t border-[#F1F5F9]">
                    <span className={`text-sm font-bold flex-1 min-w-0 pr-2 break-words [overflow-wrap:anywhere] [hyphens:auto] leading-snug ${appTheme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                      {t.alwaysOnSetting}
                    </span>
                    <div className="flex items-center gap-2.5 shrink-0 flex-shrink-0">
                      <button 
                        id="toggle-always-on"
                        type="button"
                        onClick={() => setAlwaysOnDisplay(!alwaysOnDisplay)}
                        className={`relative inline-flex h-5.5 w-10 shrink-0 flex-shrink-0 min-w-[40px] items-center rounded-full transition-colors cursor-pointer focus:outline-none ${alwaysOnDisplay ? theme.primary : 'bg-[#333]'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${alwaysOnDisplay ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Voice Announcements Toggle */}
                  <div className="flex items-center justify-between gap-3 pt-2 w-full border-t border-[#F1F5F9]">
                    <span className={`text-sm font-bold flex-1 min-w-0 pr-2 break-words [overflow-wrap:anywhere] [hyphens:auto] leading-snug ${appTheme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                      {t.voiceAnnounceSetting}
                    </span>
                    <div className="flex items-center gap-2.5 shrink-0 flex-shrink-0">
                      <button 
                        id="toggle-voice-announcements"
                        type="button"
                        onClick={() => setVoiceAnnounceEnabled(!voiceAnnounceEnabled)}
                        className={`relative inline-flex h-5.5 w-10 shrink-0 flex-shrink-0 min-w-[40px] items-center rounded-full transition-colors cursor-pointer focus:outline-none ${voiceAnnounceEnabled ? theme.primary : 'bg-[#333]'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${voiceAnnounceEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* EMERGENCY CONTACT SECTION */}
                <div className="mb-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-extrabold text-[#FF5A33]">
                      {t.emergencyTitle}
                    </h3>
                  </div>
                  <div className={`text-sm font-medium mb-3 ${appTheme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                    {t.emergencySub}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => {
                         const val = e.target.value;
                         setEmergencyPhone(val);
                         localStorage.setItem('medivoce_emergency_number', val);
                      }}
                      placeholder="+39 333 1234567"
                      className="bg-white border border-gray-200 text-slate-700 font-bold focus:outline-none focus:border-accent w-full p-3 rounded-xl"
                    />

                    {emergencyPhone && (
                      <a 
                        href={`tel:${emergencyPhone}`}
                        className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all block cursor-pointer text-center"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{t.callNow}</span>
                      </a>
                    )}
                  </div>
                </div>



                {/* DONATION BLOCK */}
                <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200 text-left space-y-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xl font-extrabold text-amber-700">
                      {t.supportDevTitle}
                    </h3>
                  </div>
                  <div className="text-sm text-amber-800/80 font-semibold leading-relaxed">
                    {t.supportDevText}
                  </div>
                  <button
                    onClick={() => {
                      // Open developer's Buy Me a Coffee page
                      window.open('https://www.buymeacoffee.com/monteleoneq', '_blank');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{t.donateBtn}</span>
                  </button>
                </div>

                {/* PRIVACY POLICY BLOCK */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-left space-y-2">
                  <h4 className="text-sm font-extrabold text-slate-700">{t.privacyPolicy}</h4>
                  <div className="text-xs text-slate-500 font-medium leading-relaxed">
                    {t.privacyText}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* GLOBAL SPEECH ANIMATED SOUNDWAVE FLOATING BAR */}
        <AnimatePresence>
          {isSpeaking && !activeVoiceReminder && (
            <motion.div
              id="global-speech-feedback-bar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className={`absolute bottom-[86px] inset-x-4 h-12 rounded-2xl shadow-lg border flex items-center justify-between px-4 z-40 bg-white/95 backdrop-blur-xs ${theme.borderLight}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className={`text-[11px] font-black tracking-tight ${theme.text}`}>
                  {lang === 'it' ? "Sintesi Vocale Attiva..." : "Speaking Announcement..."}
                </span>
              </div>
              
              <div className="flex items-end gap-0.5 h-5">
                {['h-2', 'h-4', 'h-5', 'h-3', 'h-5', 'h-4', 'h-2', 'h-4', 'h-5', 'h-3', 'h-5', 'h-2'].map((height, i) => {
                  const delayClass = `animation-delay-${(i * 75) % 900}`;
                  return (
                    <div
                      key={i}
                      className={`w-0.5 rounded-full ${theme.bg} ${height} animate-soundwave ${delayClass}`}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PERSISTENT TAB BAR FOOTER */}
        <nav id="bottom-accessible-nav" className={`absolute bottom-0 inset-x-0 h-20 border-t z-40 flex justify-around items-center px-4 ${appTheme === 'dark' ? 'bg-slate-900 border-slate-700' : appTheme === 'warm' ? 'bg-orange-100 border-orange-200' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
          <button
            id="nav-btn-agenda"
            onClick={() => setActiveTab('agenda')}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
              activeTab === 'agenda' ? theme.text : 'text-slate-400 hover:text-[#1E293B]'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-wide">{t.tabToday}</span>
          </button>

          <button
            id="nav-btn-history"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
              activeTab === 'history' ? theme.text : 'text-slate-400 hover:text-[#1E293B]'
            }`}
          >
            <BellRing className="w-6 h-6" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-wide">{t.tabMeds}</span>
          </button>

          <button
            id="nav-btn-voice-studio"
            onClick={() => setActiveTab('voice-studio')}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
              activeTab === 'voice-studio' ? theme.text : 'text-slate-400 hover:text-[#1E293B]'
            }`}
          >
            <Mic className="w-6 h-6" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-wide">{t.tabVoices}</span>
          </button>

          <button
            id="nav-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
              activeTab === 'settings' ? theme.text : 'text-slate-400 hover:text-[#1E293B]'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-wide">{t.tabSetup}</span>
          </button>
        </nav>

        {/* ADD / EDIT MEDICATION MODAL OVERLAY */}
        <AnimatePresence>

          {medToDeleteId && (
            <motion.div
              id="delete-confirm-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/55 z-50 flex items-center justify-center p-5"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl w-full max-w-[280px] p-5 space-y-4 text-center border border-slate-100 shadow-2xl"
              >
                <div className="flex justify-center">
                  <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 text-2xl">
                    🗑️
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 leading-snug">
                    {t.deleteConfirmTitle}
                  </h3>
                </div>
                <div className="flex gap-2.5 pt-1">
                  <button
                    id="cancel-delete-btn"
                    onClick={() => setMedToDeleteId(null)}
                    className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    {lang === 'it' ? "ANNULLA" : "CANCEL"}
                  </button>
                  <button
                    id="confirm-delete-btn"
                    onClick={() => deleteMedication(medToDeleteId)}
                    className="flex-1 py-2.5 px-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-rose-200 text-xs"
                  >
                    {lang === 'it' ? "OK" : "OK"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showAddModal && (
            <motion.div
              id="medication-form-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center"
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="bg-white rounded-t-[36px] w-full max-h-[92%] overflow-y-auto p-6 space-y-4 border-t-4 border-[#E58045]"
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="text-xl font-extrabold text-[#2C2115]">
                    {isEditingId ? t.editMedication : t.addMedication}
                  </h3>
                  
                  <button
                    id="close-add-modal-btn"
                    onClick={() => {
                      setShowAddModal(false);
                      setIsEditingId(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 font-extrabold text-lg p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Main Form Fields */}
                <form onSubmit={handleSaveMedication} className="space-y-4 text-sm text-left">
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t.medicationName}</label>
                    <input
                      id="form-med-name"
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={t.medicationNamePlaceholder}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">{t.dosageLabel.split(' ')[0]}</label>
                      <input
                        id="form-med-dosage"
                        type="text"
                        required
                        value={formDosage}
                        onChange={(e) => setFormDosage(e.target.value)}
                        placeholder={t.dosagePlaceholder}
                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                        {t.reminderTimesLabel}
                      </label>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {formTimes.map((timeVal, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <input
                              type="time"
                              required
                              value={timeVal}
                              onChange={(e) => {
                                const newTimes = [...formTimes];
                                newTimes[idx] = e.target.value;
                                setFormTimes(newTimes);
                              }}
                              className="flex-1 p-2 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] text-sm"
                            />
                            {formTimes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormTimes(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="text-rose-500 font-extrabold hover:text-rose-700 p-1 text-sm shrink-0"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormTimes(prev => [...prev, '08:00']);
                        }}
                        className="mt-1.5 py-1.5 px-3 bg-[#E58045]/10 hover:bg-[#E58045]/20 text-[#E58045] font-extrabold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.addTimeSlotLabel}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase block">{t.categoryLabel}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { key: 'pill', icon: '📝', labelMap: { it: 'Nota', en: 'Note', es: 'Nota', fr: 'Note', de: 'Notiz' } },
                        { key: 'capsule', icon: '🔔', labelMap: { it: 'Avviso Vocale', en: 'Voice Alert', es: 'Aviso Vocal', fr: 'Alerte Vocale', de: 'Sprachalarm' } },
                        { key: 'liquid', icon: '⏰', labelMap: { it: 'Sveglia', en: 'Alarm', es: 'Alarma', fr: 'Alarme', de: 'Wecker' } },
                        { key: 'bottle', icon: '📅', labelMap: { it: 'Evento', en: 'Event', es: 'Evento', fr: 'Événement', de: 'Ereignis' } },
                        { key: 'inhaler', icon: '🗣️', labelMap: { it: 'Nota Vocale', en: 'Voice Note', es: 'Nota de Voz', fr: 'Note Vocale', de: 'Sprachnotiz' } },
                        { key: 'cream', icon: '📋', labelMap: { it: 'Attività', en: 'Task', es: 'Tarea', fr: 'Tâche', de: 'Aufgabe' } },
                        { key: 'injection', icon: '💡', labelMap: { it: 'Routine', en: 'Routine', es: 'Rutina', fr: 'Routine', de: 'Routine' } },
                        { key: 'other', icon: '📌', labelMap: { it: 'Altro', en: 'Other', es: 'Otro', fr: 'Autre', de: 'Sonstiges' } }
                      ] as const).map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setFormCategory(cat.key)}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 font-bold text-[10px] ${
                            formCategory === cat.key 
                              ? 'bg-[#E58045]/10 text-[#E58045] border-[#E58045]' 
                              : 'bg-[#FCFAF7] border-gray-200 text-gray-600'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span className="scale-85 origin-center">{cat.labelMap[lang] || cat.labelMap.en}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frequency Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase block">
                      {t.frequencyTypeLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setFormFrequencyType('weekly')}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border-2 transition-all ${
                          formFrequencyType === 'weekly'
                            ? 'bg-[#E58045] text-white border-[#E58045]'
                            : 'bg-[#FCFAF7] text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        🔄 {t.frequencyWeekly}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormFrequencyType('monthly')}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border-2 transition-all ${
                          formFrequencyType === 'monthly'
                            ? 'bg-[#E58045] text-white border-[#E58045]'
                            : 'bg-[#FCFAF7] text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        📅 {t.frequencyMonthly}
                      </button>
                    </div>
                  </div>

                  {formFrequencyType === 'weekly' ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase block">{t.frequencyLabel}</label>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <button
                          type="button"
                          onClick={() => setFormSchedule([0,1,2,3,4,5,6])}
                          className={`py-2 px-3 rounded-xl font-bold text-xs border-2 transition-all ${
                            formSchedule.length === 7 
                              ? 'bg-[#E58045] text-white border-[#E58045]' 
                              : 'bg-[#FCFAF7] text-gray-600 border-gray-200'
                          }`}
                        >
                          {t.allDays}
                        </button>
                        {[1, 2, 3, 4, 5, 6, 0].map((dayValue) => {
                          const dayNames = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat];
                          const isSelected = formSchedule.includes(dayValue);
                          return (
                            <button
                              key={dayValue}
                              type="button"
                              onClick={() => {
                                if (isSelected && formSchedule.length > 1) {
                                  setFormSchedule(prev => prev.filter(d => d !== dayValue));
                                } else if (!isSelected) {
                                  setFormSchedule(prev => [...prev, dayValue]);
                                }
                              }}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs border-2 transition-all ${
                                isSelected 
                                    ? 'bg-[#E58045] text-white border-[#E58045]' 
                                    : 'bg-[#FCFAF7] text-gray-600 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {dayNames[dayValue].charAt(0)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase block">
                        {t.monthlyDayLabel}
                      </label>
                      <select
                        value={formMonthlyDay}
                        onChange={(e) => setFormMonthlyDay(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] text-sm"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>
                            {d} {t.ofEveryMonth}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t.instructionsLabel}</label>
                    <textarea
                      id="form-med-notes"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder={t.instructionsPlaceholder}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] h-16 text-sm resize-none"
                    />
                  </div>

                  {/* Voice Option & Personal Voice Recording Component */}
                  <VoiceRecorderField
                    customVoiceUri={formCustomVoiceUri}
                    onChange={setFormCustomVoiceUri}
                    lang={lang}
                    t={t}
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t.voiceMessageLabel}</label>
                    <input
                      id="form-med-voice"
                      type="text"
                      value={formVoicePrompt}
                      onChange={(e) => setFormVoicePrompt(e.target.value)}
                      placeholder={t.voiceMessagePlaceholder}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] text-xs"
                    />
                    <span className="text-3xs text-gray-400 leading-normal block italic mt-1">
                      {t.voiceTextSynthesisHint}
                    </span>
                  </div>
                  {/* Stock/Inventory Management Block */}
                  <div className="space-y-2 bg-[#FCFAF7] p-3.5 rounded-2xl border border-gray-150 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-gray-700 uppercase block">{t.manageInventoryLabel}</span>
                        <span className="text-3xs text-gray-400 block font-semibold">{t.manageInventorySub}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                        <input
                          type="checkbox"
                          checked={formStockEnabled}
                          onChange={(e) => setFormStockEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    {formStockEnabled && (
                      <div className="grid grid-cols-2 gap-3 pt-1.5 animate-fade-in">
                        <div className="space-y-1">
                          <span className="text-3xs font-bold text-gray-500 uppercase block">{t.remainingCountLabel}</span>
                          <input
                            type="number"
                            min="0"
                            value={formStockCurrent}
                            onChange={(e) => setFormStockCurrent(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full p-2.5 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[#E58045] text-xs font-extrabold text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-3xs font-bold text-gray-500 uppercase block">{t.lowStockAlertLabel}</span>
                          <input
                            type="number"
                            min="1"
                            value={formStockMin}
                            onChange={(e) => setFormStockMin(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full p-2.5 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[#E58045] text-xs font-extrabold text-center"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pill Color Identifier Selector */}
                  <div className="space-y-2 text-left">
                    <span className="text-xs font-bold text-gray-500 uppercase block">{t.colorAccentLabel}</span>
                    <div className="flex gap-3">
                      {([
                        { key: 'blue', color: 'bg-blue-500 border-blue-600', text: 'it-Blu' },
                        { key: 'red', color: 'bg-rose-500 border-rose-600', text: 'it-Rosso' },
                        { key: 'green', color: 'bg-emerald-500 border-emerald-600', text: 'it-Verde' },
                        { key: 'orange', color: 'bg-amber-500 border-amber-600', text: 'it-Arancione' },
                        { key: 'purple', color: 'bg-purple-500 border-purple-600', text: 'it-Viola' },
                      ] as const).map((col) => (
                        <button
                          key={col.key}
                          type="button"
                          onClick={() => setFormPillColor(col.key)}
                          className={`w-9 h-9 rounded-full border-3 transition-all flex items-center justify-center ${col.color} ${
                            formPillColor === col.key ? 'scale-110 shadow-md ring-2 ring-[#E58045]/40 border-white' : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                        >
                          {formPillColor === col.key && (
                            <span className="text-white text-xs font-black">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 flex items-center gap-3">
                    <button
                      id="cancel-add-modal"
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setIsEditingId(null);
                      }}
                      className="flex-1 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-center text-xs transition-all border border-gray-250"
                    >
                      {t.cancel}
                    </button>

                    <button
                      id="submit-add-modal"
                      type="submit"
                      className="flex-1 py-3.5 rounded-xl bg-[#E58045] hover:bg-[#D5601B] text-white font-extrabold text-center text-xs shadow-md transition-all"
                    >
                      {t.save}
                    </button>
                  </div>

                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>





        {/* ACCESSORY MODAL: CUSTOM DEVICE SOUNDS IMPORT POPUP CARD */}
        <AnimatePresence>
          {showImportSoundsModal && (
            <motion.div
              id="import-sounds-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center"
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="bg-white rounded-t-[36px] w-full max-h-[92%] overflow-y-auto p-6 space-y-5 border-t-4 border-[#2563EB] text-left"
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div className="space-y-0.5">
                    <h3 className="text-xl font-extrabold text-[#1E3A8A] flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      <span>{lang === 'it' ? "Importatore Suoni Vocali" : "Voice Sounds Importer"}</span>
                    </h3>
                    <p className="text-3xs text-gray-500 font-bold uppercase tracking-wider">
                      {lang === 'it' ? "Personalizza le sveglie del dispositivo" : "Customize device alarm alerts"}
                    </p>
                  </div>
                  
                  <button
                    id="close-import-sounds-btn"
                    onClick={() => setShowImportSoundsModal(false)}
                    className="text-gray-400 hover:text-gray-600 font-extrabold text-lg p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Info Text */}
                <div className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {lang === 'it' ? (
                    "I browser moderni e le Webview di Android richiedono autorizzazioni esplicite. Invece di far comparire fastidiosi errori nativi del sistema, Ricorda con Voce ti consente di caricare direttamente le tue suonerie preferite o attivare suoni integrati ad alta efficacia."
                  ) : (
                    "Modern browsers and Android Webviews require strict user permissions. To prevent system dialog errors, Ricorda con Voce allows you to upload custom ringtones directly or use pre-configured high-efficiency system alarms."
                  )}
                </div>

                {/* Upload File Input Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wide">
                    {lang === 'it' ? "1. Carica File Audio dal Telefono" : "1. Upload Audio File from Phone"}
                  </h4>
                  <div className="relative border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] transition-all rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center gap-2 text-center cursor-pointer">
                    <input
                      id="native-audio-file-input"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 1.5 * 1024 * 1024) {
                          alert(lang === 'it' ? "File troppo grande! Seleziona una notifica corta sotto 1.5MB." : "File too large! Select a short notification under 1.5MB.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          const cleanName = file.name.replace(/\.[^/.]+$/, "");
                          const newSound = {
                            id: Date.now().toString(),
                            name: cleanName,
                            dataUrl: dataUrl
                          };
                          setImportedSounds(prev => [...prev, newSound]);
                          // Auto trigger to let them hear it
                          setTimeout(() => {
                            playAlarmTone('custom_' + newSound.id);
                          }, 100);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-[#1E293B] block">
                        {lang === 'it' ? "Premi qui per selezionare" : "Tap here to select file"}
                      </span>
                      <span className="text-3xs text-gray-500 font-bold block">
                        {lang === 'it' ? "Supporta MP3, WAV, OGG, M4A (Max 1.5MB)" : "Supports MP3, WAV, OGG, M4A (Max 1.5MB)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Load System Presets Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wide">
                    {lang === 'it' ? "2. Oppure attiva Suoni di Sistema Predefiniti" : "2. Or import System Sound Presets"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'preset_arpeggio', name: lang === 'it' ? 'Arpeggio Zen' : 'Arpeggio Zen', desc: lang === 'it' ? 'Rilassante e fluido' : 'Relaxing & fluid' },
                      { id: 'preset_marimba', name: lang === 'it' ? 'Marimba Allegra' : 'Bouncy Marimba', desc: lang === 'it' ? 'Vivace e chiaro' : 'Cheerful & clear' },
                      { id: 'preset_trillo', name: lang === 'it' ? 'Trillo Notifica' : 'Sweet Chimes', desc: lang === 'it' ? 'Rapido e squillante' : 'Rapid & bright' }
                    ].map((preset) => {
                      const isAlreadyAdded = importedSounds.some(s => s.id === preset.id);
                      return (
                        <div
                          key={preset.id}
                          className="p-3 rounded-xl border border-[#E2E8F0] bg-white flex flex-col justify-between gap-2 text-left"
                        >
                          <div>
                            <span className="text-xs font-extrabold text-[#1E293B] block">{preset.name}</span>
                            <span className="text-3xs text-gray-500 font-bold block">{preset.desc}</span>
                          </div>
                          <div className="flex gap-1.5 mt-1">
                            <button
                              id={`test-preset-${preset.id}`}
                              type="button"
                              onClick={() => playAlarmTone(preset.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-3xs font-extrabold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              🔊 {lang === 'it' ? "Ascolta" : "Test"}
                            </button>
                            <button
                              id={`import-preset-${preset.id}`}
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => {
                                const newSound = {
                                  id: preset.id,
                                  name: preset.name,
                                  dataUrl: 'preset' // flag to use preset synthesizer
                                };
                                setImportedSounds(prev => [...prev, newSound]);
                              }}
                              className={`flex-1 px-2.5 py-1.5 rounded-lg text-3xs font-black text-center transition-all ${
                                isAlreadyAdded
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isAlreadyAdded ? (lang === 'it' ? "Attivo ✓" : "Active ✓") : (lang === 'it' ? "Importa" : "Import")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Device Notification Sounds Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wide flex justify-between items-center">
                    <span>{lang === 'it' ? "3. Suoni di Notifica del Dispositivo" : "3. Device Notification Sounds"}</span>
                    <span className="text-3xs text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full">
                      {(window as any).Android ? (lang === 'it' ? "Nativo" : "Native") : (lang === 'it' ? "Simulato" : "Simulated")}
                    </span>
                  </h4>
                  {deviceRingtones.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 italic">
                      {lang === 'it' ? "Nessun suono trovato sul dispositivo." : "No sounds found on the device."}
                    </div>
                  ) : (
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 border border-[#E2E8F0] rounded-2xl p-2 bg-slate-50/50">
                      {deviceRingtones.map((ringtone, rIdx) => {
                        const isAlreadyImported = importedSounds.some(s => s.dataUrl === ringtone.uri);
                        const isCurrentPlaying = currentlyPlayingUri === ringtone.uri;
                        return (
                          <div
                            key={rIdx}
                            className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-[#2563EB]/40 transition-all text-left"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm shrink-0">📱</span>
                              <span className="text-xs font-bold text-slate-700 truncate">{ringtone.title}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isCurrentPlaying) {
                                    // Stop
                                    const android = (window as any).Android;
                                    if (android && android.stopDeviceSound) {
                                      android.stopDeviceSound();
                                    }
                                    setCurrentlyPlayingUri(null);
                                  } else {
                                    // Play
                                    setCurrentlyPlayingUri(ringtone.uri);
                                    if (ringtone.uri.startsWith('device_uri_')) {
                                      // Browser mock trigger
                                      playAlarmTone('custom_preset_trillo');
                                    } else {
                                      const android = (window as any).Android;
                                      if (android && android.playDeviceSound) {
                                        android.playDeviceSound(ringtone.uri);
                                      }
                                    }
                                  }
                                }}
                                className={`px-2 py-1 rounded-lg text-3xs font-extrabold border transition-colors ${
                                  isCurrentPlaying
                                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {isCurrentPlaying ? (lang === 'it' ? "■ Ferma" : "■ Stop") : (lang === 'it' ? "🔊 Ascolta" : "🔊 Listen")}
                              </button>
                              
                              <button
                                type="button"
                                disabled={isAlreadyImported}
                                onClick={() => {
                                  const newSound = {
                                    id: 'device_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                                    name: ringtone.title,
                                    dataUrl: ringtone.uri
                                  };
                                  setImportedSounds(prev => [...prev, newSound]);
                                }}
                                className={`px-2 py-1 rounded-lg text-3xs font-black text-center transition-all ${
                                  isAlreadyImported
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {isAlreadyImported ? (lang === 'it' ? "Importato ✓" : "Imported ✓") : (lang === 'it' ? "Importa" : "Import")}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* List of Custom Imported Sounds */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wide flex justify-between items-center">
                    <span>{lang === 'it' ? "I Tuoi Suoni Personalizzati" : "Your Imported Sounds"}</span>
                    <span className="text-3xs text-gray-400 font-bold">({importedSounds.length} caricati)</span>
                  </h4>
                  {importedSounds.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl text-xs text-gray-400 font-bold">
                      {lang === 'it' ? "Nessun suono personalizzato aggiunto." : "No custom sounds added yet."}
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {importedSounds.map((sound) => (
                        <div
                          key={sound.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">🎵</span>
                            <span className="text-xs font-bold text-slate-700 truncate">{sound.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              id={`play-custom-sound-btn-${sound.id}`}
                              type="button"
                              onClick={() => playAlarmTone('custom_' + sound.id)}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 text-[#2563EB] text-xs transition-colors"
                              title={lang === 'it' ? "Riproduci suono" : "Play sound"}
                            >
                              🔊
                            </button>
                            <button
                              id={`delete-custom-sound-btn-${sound.id}`}
                              type="button"
                              onClick={() => {
                                setImportedSounds(prev => prev.filter(s => s.id !== sound.id));
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 text-xs transition-colors"
                              title={lang === 'it' ? "Elimina suono" : "Delete sound"}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-2">
                  <button
                    id="finish-import-sounds-btn"
                    onClick={() => setShowImportSoundsModal(false)}
                    className="w-full py-3 bg-[#1E293B] hover:bg-[#0F172A] text-white font-black text-sm rounded-xl shadow-md transition-colors"
                  >
                    {lang === 'it' ? "Fatto" : "Done"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>

      {/* PREMIUM HIGH-FIDELITY SIDE INFORMATION PANEL (GEOMETRIC BALANCE THEME) */}
      <div id="premium-sidebar" className="hidden lg:flex flex-col w-[360px] bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-md space-y-6 text-left shrink-0">
        
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#1E40AF] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 fill-[#1E40AF]" />
            <span>{lang === 'it' ? "Guida Intelligente" : "Smart Assistant"}</span>
          </span>
          <h3 className="text-2xl font-extrabold text-[#1E3A8A] tracking-tight leading-snug">
            {lang === 'it' ? "La tua giornata guidata dalla voce." : "Your day, guided by voice."}
          </h3>
          <div className="text-xs text-slate-500 font-medium leading-relaxed">
            {lang === 'it' 
              ? "Ricorda con Voce unisce promemoria rassicuranti ad alta leggibilità e controlli vocali avanzati pensati soprattutto per le persone anziane."
              : "Ricorda con Voce pairs reassuring voice notes with large geometric clarity & advanced vocal confirmation tailored for older adults."}
          </div>
        </div>

        <div className="space-y-4 border-t border-[#E2E8F0] pt-4">
          
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 border border-teal-100">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1E293B] uppercase">{lang === 'it' ? "Promemoria Empatici" : "Empathetic Audios"}</h4>
              <div className="text-xs text-slate-500 leading-relaxed font-semibold">
                {lang === 'it' ? "Istruzioni rassicuranti e costanti sia di giorno che di notte con voce naturale." : "Clear voice alerts generated day and night to keep doses perfectly synchronized."}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-lg ${theme.bgLight} flex items-center justify-center ${theme.text} shrink-0 border ${theme.borderLight}`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1E293B] uppercase">{lang === 'it' ? "Conferma con un soffio" : "Hands-Free Confirmation"}</h4>
              <div className="text-xs text-slate-500 leading-relaxed font-semibold">
                {lang === 'it' ? "Dì 'Preso' o 'Ho fatto' per registrare senza bisogno di toccare lo schermo." : "Confirm out loud bypasses direct manual input. Easy, safe, and immediate."}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1E293B] uppercase">{lang === 'it' ? "Modalità diurno/notturno" : "Day/Night Contrast"}</h4>
              <div className="text-xs text-slate-500 leading-relaxed font-semibold">
                {lang === 'it' ? "Palette ad alto contrasto adatta anche a problemi visivi o per l'uso stanco notturno." : "Optimized theme colors to alleviate eye strain in dark rooms or low light conditions."}
              </div>
            </div>
          </div>

        </div>

        {/* ACTIVE STATUS SOUNDWAVE SIMULATION */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-black text-slate-400 uppercase tracking-widest">{lang === 'it' ? "Stato Servizio" : "Service Status"}</span>
            <span className="inline-flex items-center gap-1.5 text-2xs font-extrabold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_1.5s_infinite]" />
              {lang === 'it' ? "Attivo h24" : "On duty 24/7"}
            </span>
          </div>

          <div className="h-6 flex items-center justify-center gap-1 px-1">
            <span className={`w-1.5 h-3 ${theme.visualizer1} rounded-full`} />
            <span className={`w-1.5 h-5 ${theme.visualizer2} rounded-full`} />
            <span className={`w-1.5 h-4 ${theme.visualizer3} rounded-full`} />
            <span className={`w-1.5 h-2 ${theme.visualizer4} rounded-full`} />
            <span className={`w-1.5 h-5 ${theme.visualizer5} rounded-full`} />
            <span className={`w-1.5 h-3 ${theme.visualizer6} rounded-full`} />
            <span className="w-1.5 h-4 bg-slate-400 rounded-full" />
            <span className={`w-1.5 h-2 ${theme.visualizer7} rounded-full`} />
          </div>
          
          <div className="text-3xs text-center text-slate-400 font-bold uppercase">
            {lang === 'it' ? "Pronto per l'ascolto vocale" : "Vocal listening engine online"}
          </div>
        </div>

      </div>

    </div>

  );
}
