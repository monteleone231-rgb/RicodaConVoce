/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Check, Edit3, RotateCcw, X, Clock, Sparkles, 
  Volume2, AlertCircle, ArrowRight 
} from 'lucide-react';
import { LanguageCode, MedicationCategory } from '../types';
import { parseSpokenReminder, ParsedSpokenReminder } from '../speechParser';
import { speakAnnouncement, stopSpeaking } from '../utils';

interface VoiceDictateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  onSaveDirect: (parsed: ParsedSpokenReminder) => void;
  onOpenInFullForm: (parsed: ParsedSpokenReminder) => void;
  speechSpeed?: number;
  speechTone?: 'empathetic' | 'firm';
}

interface ModalTranslations {
  modalTitle: string;
  subListening: string;
  subReview: string;
  closeTooltip: string;
  listeningState: string;
  tapToSpeak: string;
  promptListening: string;
  exampleListening: string;
  tapMicPrompt: string;
  doneSpeakingBtn: string;
  recommendedTitle: string;
  recommendedExamples: string[];
  spokenPhraseEcho: string;
  retryBtn: string;
  retryTooltip: string;
  nameLabel: string;
  namePlaceholder: string;
  alarmTimeLabel: string;
  dosageLabel: string;
  dosagePlaceholder: string;
  categoryLabel: string;
  categories: { id: MedicationCategory; label: string; icon: string }[];
  notesLabel: string;
  saveDirectBtn: string;
  openFullBtn: string;
  defaultReminderName: string;
  defaultDosage: string;
  feedbackText: (name: string, time: string) => string;
  errNoSpeech: string;
  errMicrophone: string;
  errNoText: string;
  errTryAgainClearly: string;
  errNotSupported: string;
  errPrefix: string;
}

const VOICE_MODAL_I18N: Record<LanguageCode, ModalTranslations> = {
  it: {
    modalTitle: "Crea Promemoria con la Voce",
    subListening: "Parla all'app liberamente",
    subReview: "Controlla e Salva",
    closeTooltip: "Chiudi",
    listeningState: "Ascolto...",
    tapToSpeak: "Tocca per parlare",
    promptListening: "Ti ascolto... pronuncia il tuo promemoria",
    exampleListening: 'Ad esempio: "Bere un bicchiere d\'acqua alle 16:30"',
    tapMicPrompt: "Tocca il microfono sopra per iniziare a parlare",
    doneSpeakingBtn: "Ho finito di parlare",
    recommendedTitle: "Esempi vocali consigliati",
    recommendedExamples: [
      "Bere un bicchiere d'acqua alle 16 e 30",
      "Prendere le gocce alle 8 di sera dopo cena",
      "Fare una telefonata importante alle 10 di mattina",
      "Camminata nel parco a mezzogiorno"
    ],
    spokenPhraseEcho: "Frase pronunciata",
    retryBtn: "Riprova",
    retryTooltip: "Riprova a parlare",
    nameLabel: "Nome del Promemoria",
    namePlaceholder: "Es. Bere acqua, Camminata...",
    alarmTimeLabel: "Orario sveglia",
    dosageLabel: "Dose o Quantità",
    dosagePlaceholder: "Es. 1 bicchiere, 5 gocce, 1 bustina",
    categoryLabel: "Tipologia / Icona",
    categories: [
      { id: 'pill', label: 'Promemoria', icon: '📝' },
      { id: 'capsule', label: 'Attività', icon: '🔔' },
      { id: 'bottle', label: 'Acqua/Bottiglia', icon: '📅' },
      { id: 'liquid', label: 'Gocce/Liquido', icon: '⏰' },
      { id: 'other', label: 'Altro', icon: '📌' },
    ],
    notesLabel: "Note Rilevate",
    saveDirectBtn: "Salva Questo Promemoria",
    openFullBtn: "Apri nel Modulo Completo (suoni, giorni, voce reale)",
    defaultReminderName: "Promemoria",
    defaultDosage: "1 dose",
    feedbackText: (name, time) => `Ho preparato: ${name} alle ore ${time}. Controlla e tocca Salva.`,
    errNoSpeech: "Non ho sentito nulla. Tocca il microfono e parla.",
    errMicrophone: "Impossibile avviare il microfono",
    errNoText: "Nessun testo rilevato. Riprova a parlare.",
    errTryAgainClearly: "Riprova a parlare scandendo bene le parole",
    errNotSupported: "Riconoscimento vocale non supportato su questo browser.",
    errPrefix: "Errore vocale: "
  },
  en: {
    modalTitle: "Voice-to-Reminder",
    subListening: "Speak naturally to the app",
    subReview: "Review & Save",
    closeTooltip: "Close",
    listeningState: "Listening...",
    tapToSpeak: "Tap to speak",
    promptListening: "Listening... speak your reminder",
    exampleListening: 'e.g. "Drink a glass of water at 4:30 pm"',
    tapMicPrompt: "Tap microphone above to start speaking",
    doneSpeakingBtn: "Done speaking",
    recommendedTitle: "Recommended voice examples",
    recommendedExamples: [
      "Drink a glass of water at 4:30 pm",
      "Take the drops at 8 pm after dinner",
      "Make an important phone call at 10 am",
      "Walk in the park at noon"
    ],
    spokenPhraseEcho: "What you said",
    retryBtn: "Retry",
    retryTooltip: "Speak again",
    nameLabel: "Reminder Name",
    namePlaceholder: "E.g. Drink water, Walk...",
    alarmTimeLabel: "Alarm Time",
    dosageLabel: "Dose or Quantity",
    dosagePlaceholder: "E.g. 1 glass, 5 drops, 1 sachet",
    categoryLabel: "Category / Icon",
    categories: [
      { id: 'pill', label: 'Reminder', icon: '📝' },
      { id: 'capsule', label: 'Activity', icon: '🔔' },
      { id: 'bottle', label: 'Water / Bottle', icon: '📅' },
      { id: 'liquid', label: 'Drops / Liquid', icon: '⏰' },
      { id: 'other', label: 'Other', icon: '📌' },
    ],
    notesLabel: "Detected Notes",
    saveDirectBtn: "Save This Reminder",
    openFullBtn: "Open in Full Editor (sounds, days, custom voice)",
    defaultReminderName: "Reminder",
    defaultDosage: "1 dose",
    feedbackText: (name, time) => `Prepared: ${name} at ${time}. Review and tap Save.`,
    errNoSpeech: "No speech detected. Tap microphone and speak.",
    errMicrophone: "Cannot start microphone",
    errNoText: "No text detected. Try speaking again.",
    errTryAgainClearly: "Try speaking again clearly",
    errNotSupported: "Speech recognition not supported on this browser.",
    errPrefix: "Voice error: "
  },
  es: {
    modalTitle: "Crear Recordatorio con la Voz",
    subListening: "Habla a la aplicación con libertad",
    subReview: "Revisar y Guardar",
    closeTooltip: "Cerrar",
    listeningState: "Escuchando...",
    tapToSpeak: "Toca para hablar",
    promptListening: "Te escucho... di tu recordatorio",
    exampleListening: 'Por ejemplo: "Beber un vaso de agua a las 16:30"',
    tapMicPrompt: "Toca el micrófono arriba para empezar a hablar",
    doneSpeakingBtn: "He terminado de hablar",
    recommendedTitle: "Ejemplos de voz recomendados",
    recommendedExamples: [
      "Beber un vaso de agua a las 4 y media",
      "Tomar las gotas a las 8 de la noche después de cenar",
      "Hacer una llamada importante a las 10 de la mañana",
      "Caminar en el parque al mediodía"
    ],
    spokenPhraseEcho: "Frase dicha",
    retryBtn: "Reintentar",
    retryTooltip: "Hablar de nuevo",
    nameLabel: "Nombre del Recordatorio",
    namePlaceholder: "Ej. Beber agua, Caminata...",
    alarmTimeLabel: "Hora de alarma",
    dosageLabel: "Dosis o Cantidad",
    dosagePlaceholder: "Ej. 1 vaso, 5 gotas, 1 sobre",
    categoryLabel: "Categoría / Icono",
    categories: [
      { id: 'pill', label: 'Recordatorio', icon: '📝' },
      { id: 'capsule', label: 'Actividad', icon: '🔔' },
      { id: 'bottle', label: 'Agua / Botella', icon: '📅' },
      { id: 'liquid', label: 'Gotas / Líquido', icon: '⏰' },
      { id: 'other', label: 'Otro', icon: '📌' },
    ],
    notesLabel: "Notas detectadas",
    saveDirectBtn: "Guardar Este Recordatorio",
    openFullBtn: "Abrir en Editor Completo (sonidos, días, voz real)",
    defaultReminderName: "Recordatorio",
    defaultDosage: "1 dosis",
    feedbackText: (name, time) => `He preparado: ${name} a las ${time}. Revisa y toca Guardar.`,
    errNoSpeech: "No se escuchó nada. Toca el micrófono y habla.",
    errMicrophone: "No se pudo iniciar el micrófono",
    errNoText: "No se detectó ningún texto. Intenta hablar de nuevo.",
    errTryAgainClearly: "Intenta hablar de nuevo pronunciando claramente",
    errNotSupported: "Reconocimiento de voz no compatible con este navegador.",
    errPrefix: "Error de voz: "
  },
  fr: {
    modalTitle: "Créer un Rappel à la Voix",
    subListening: "Parlez librement à l'application",
    subReview: "Vérifier et Enregistrer",
    closeTooltip: "Fermer",
    listeningState: "Écoute en cours...",
    tapToSpeak: "Appuyez pour parler",
    promptListening: "Je vous écoute... dictez votre rappel",
    exampleListening: 'Par exemple: "Boire un verre d\'eau à 16h30"',
    tapMicPrompt: "Appuyez sur le micro ci-dessus pour parler",
    doneSpeakingBtn: "J'ai fini de parler",
    recommendedTitle: "Exemples vocaux recommandés",
    recommendedExamples: [
      "Boire un verre d'eau à 16 heures 30",
      "Prendre les gouttes à 20 heures après le dîner",
      "Passer un appel important à 10 heures du matin",
      "Marche dans le parc à midi"
    ],
    spokenPhraseEcho: "Phrase prononcée",
    retryBtn: "Réessayer",
    retryTooltip: "Parler à nouveau",
    nameLabel: "Nom du Rappel",
    namePlaceholder: "Ex. Boire de l'eau, Marche...",
    alarmTimeLabel: "Heure de l'alarme",
    dosageLabel: "Dose ou Quantité",
    dosagePlaceholder: "Ex. 1 verre, 5 gouttes, 1 sachet",
    categoryLabel: "Catégorie / Icône",
    categories: [
      { id: 'pill', label: 'Rappel', icon: '📝' },
      { id: 'capsule', label: 'Activité', icon: '🔔' },
      { id: 'bottle', label: 'Eau / Bouteille', icon: '📅' },
      { id: 'liquid', label: 'Gouttes / Liquide', icon: '⏰' },
      { id: 'other', label: 'Autre', icon: '📌' },
    ],
    notesLabel: "Notes détectées",
    saveDirectBtn: "Enregistrer Ce Rappel",
    openFullBtn: "Ouvrir dans l'Éditeur Complet (sons, jours, voix réelle)",
    defaultReminderName: "Rappel",
    defaultDosage: "1 dose",
    feedbackText: (name, time) => `J'ai préparé: ${name} à ${time}. Vérifiez et appuyez sur Enregistrer.`,
    errNoSpeech: "Rien entendu. Appuyez sur le micro et parlez.",
    errMicrophone: "Impossible de démarrer le microphone",
    errNoText: "Aucun texte détecté. Réessayez de parler.",
    errTryAgainClearly: "Réessayez en articulant clairement",
    errNotSupported: "Reconnaissance vocale non prise en charge sur ce navigateur.",
    errPrefix: "Erreur vocale: "
  },
  de: {
    modalTitle: "Erinnerung per Sprache erstellen",
    subListening: "Sprechen Sie frei mit der App",
    subReview: "Prüfen & Speichern",
    closeTooltip: "Schließen",
    listeningState: "Höre zu...",
    tapToSpeak: "Tippen zum Sprechen",
    promptListening: "Ich höre zu... sprechen Sie Ihre Erinnerung",
    exampleListening: 'Zum Beispiel: "Ein Glas Wasser um 16:30 Uhr trinken"',
    tapMicPrompt: "Tippen Sie oben auf das Mikrofon, um zu sprechen",
    doneSpeakingBtn: "Fertig gesprochen",
    recommendedTitle: "Empfohlene Sprachbeispiele",
    recommendedExamples: [
      "Ein Glas Wasser um 16 Uhr 30 trinken",
      "Die Tropfen um 20 Uhr nach dem Abendessen nehmen",
      "Einen wichtigen Anruf um 10 Uhr morgens tätigen",
      "Spaziergang im Park um 12 Uhr mittags"
    ],
    spokenPhraseEcho: "Gesprochener Satz",
    retryBtn: "Wiederholen",
    retryTooltip: "Nochmals sprechen",
    nameLabel: "Name der Erinnerung",
    namePlaceholder: "Z.B. Wasser trinken, Spaziergang...",
    alarmTimeLabel: "Weckzeit",
    dosageLabel: "Dosis oder Menge",
    dosagePlaceholder: "Z.B. 1 Glas, 5 Tropfen, 1 Beutel",
    categoryLabel: "Kategorie / Symbol",
    categories: [
      { id: 'pill', label: 'Erinnerung', icon: '📝' },
      { id: 'capsule', label: 'Aktivität', icon: '🔔' },
      { id: 'bottle', label: 'Wasser / Flasche', icon: '📅' },
      { id: 'liquid', label: 'Tropfen / Flüssig', icon: '⏰' },
      { id: 'other', label: 'Sonstiges', icon: '📌' },
    ],
    notesLabel: "Erkannte Notizen",
    saveDirectBtn: "Diese Erinnerung Speichern",
    openFullBtn: "Im vollständigen Editor öffnen (Töne, Tage, eigene Stimme)",
    defaultReminderName: "Erinnerung",
    defaultDosage: "1 Dosis",
    feedbackText: (name, time) => `Ich habe vorbereitet: ${name} um ${time}. Bitte prüfen und speichern.`,
    errNoSpeech: "Keine Sprache erkannt. Tippen Sie auf das Mikrofon und sprechen Sie.",
    errMicrophone: "Mikrofon konnte nicht gestartet werden",
    errNoText: "Kein Text erkannt. Bitte noch einmal sprechen.",
    errTryAgainClearly: "Bitte versuchen Sie es noch einmal deutlich",
    errNotSupported: "Spracherkennung wird in diesem Browser nicht unterstützt.",
    errPrefix: "Sprachfehler: "
  }
};

export const VoiceDictateModal: React.FC<VoiceDictateModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSaveDirect,
  onOpenInFullForm,
  speechSpeed = 1.0,
  speechTone = 'empathetic'
}) => {
  const tM = VOICE_MODAL_I18N[lang] || VOICE_MODAL_I18N.it;

  const [step, setStep] = useState<'listening' | 'review'>('listening');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedSpokenReminder | null>(null);

  // Editable review fields
  const [editName, setEditName] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('08:00');
  const [editDosage, setEditDosage] = useState<string>(tM.defaultDosage);
  const [editCategory, setEditCategory] = useState<MedicationCategory>('pill');
  const [editNotes, setEditNotes] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef<boolean>(true);
  const transcriptBufferRef = useRef<string>('');

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      cleanupRecognition();
    };
  }, []);

  // When modal opens or language changes, reset state and start listening automatically
  useEffect(() => {
    if (isOpen) {
      setStep('listening');
      setTranscript('');
      setErrorMsg('');
      setParsedData(null);
      setEditDosage(tM.defaultDosage);
      transcriptBufferRef.current = '';
      startListening();
    } else {
      cleanupRecognition();
      stopSpeaking();
    }
  }, [isOpen, lang]);

  const cleanupRecognition = () => {
    setIsListening(false);

    // Stop native Android recognition if active
    const win = window as any;
    if (win.Android && typeof win.Android.stopSpeechRecognition === 'function') {
      try {
        win.Android.stopSpeechRecognition();
      } catch (_e) {}
    }

    // Stop Web Speech API recognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_e) {}
      recognitionRef.current = null;
    }
  };

  const startListening = () => {
    cleanupRecognition();
    setErrorMsg('');
    setTranscript('');
    transcriptBufferRef.current = '';
    setIsListening(true);

    const win = window as any;

    // 1. Native Android Speech Recognition bridge (if running in custom Android App / WebView)
    if (win.Android && typeof win.Android.startSpeechRecognition === 'function') {
      win.onNativeSpeechResult = (text: string, isFinal: boolean) => {
        if (!isComponentMounted.current) return;
        if (text) {
          setTranscript(text);
          transcriptBufferRef.current = text;
        }
        if (isFinal && text.trim().length > 0) {
          setIsListening(false);
          handleProcessSpeech(text);
        }
      };

      win.onNativeSpeechError = (errMsg: string) => {
        if (!isComponentMounted.current) return;
        setIsListening(false);
        // Only set error if we don't have any transcript yet
        if (!transcriptBufferRef.current) {
          setErrorMsg(errMsg || tM.errTryAgainClearly);
        }
      };

      try {
        win.Android.startSpeechRecognition(lang);
        return;
      } catch (err) {
        console.warn('[VoiceDictateModal] Native Android speech recognition failed, trying Web Speech API:', err);
      }
    }

    // 2. Web Speech API fallback (browsers and modern webviews)
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsListening(false);
      setErrorMsg(tM.errNotSupported);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === 'it' ? 'it-IT' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : 'en-US';

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += trans;
          } else {
            interimText += trans;
          }
        }

        const currentText = finalText || interimText;
        if (currentText) {
          setTranscript(currentText);
          transcriptBufferRef.current = currentText;
        }

        if (finalText && finalText.trim().length > 0) {
          setIsListening(false);
          handleProcessSpeech(finalText);
        }
      };

      recognition.onerror = (event: any) => {
        if (!isComponentMounted.current) return;
        if (event.error === 'no-speech') {
          if (!transcriptBufferRef.current) {
            setErrorMsg(tM.errNoSpeech);
          }
        } else if (event.error !== 'aborted') {
          setErrorMsg(tM.errPrefix + event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        if (!isComponentMounted.current) return;
        setIsListening(false);
        // If we captured something, process it
        if (transcriptBufferRef.current && transcriptBufferRef.current.trim().length > 1 && !parsedData) {
          handleProcessSpeech(transcriptBufferRef.current);
        }
      };

      recognition.start();
    } catch (e: any) {
      console.error('[VoiceDictateModal] Speech recognition startup error:', e);
      setIsListening(false);
      setErrorMsg(tM.errMicrophone);
    }
  };

  const handleStopListening = () => {
    cleanupRecognition();
    if (transcriptBufferRef.current && transcriptBufferRef.current.trim().length > 0) {
      handleProcessSpeech(transcriptBufferRef.current);
    } else {
      setErrorMsg(tM.errNoText);
    }
  };

  const handleProcessSpeech = (spokenText: string) => {
    const parsed = parseSpokenReminder(spokenText, lang);
    setParsedData(parsed);
    setEditName(parsed.name);
    setEditTime(parsed.time);
    setEditDosage(parsed.dosage || tM.defaultDosage);
    setEditCategory(parsed.category);
    setEditNotes(parsed.notes);
    setStep('review');

    // Voice announcement feedback (Option A - empathetic voice confirmation)
    try {
      const feedback = tM.feedbackText(parsed.name, parsed.time);
      speakAnnouncement(
        feedback,
        lang,
        speechSpeed,
        speechTone === 'firm' ? 'firm' : 'empathetic'
      );
    } catch (_e) {}
  };

  const handleConfirmDirect = () => {
    stopSpeaking();
    const finalData: ParsedSpokenReminder = {
      name: editName.trim() || tM.defaultReminderName,
      time: editTime || '08:00',
      times: [editTime || '08:00'],
      dosage: editDosage.trim() || tM.defaultDosage,
      notes: editNotes.trim(),
      category: editCategory,
      rawTranscript: transcript
    };
    onSaveDirect(finalData);
    onClose();
  };

  const handleOpenFull = () => {
    stopSpeaking();
    const finalData: ParsedSpokenReminder = {
      name: editName.trim() || tM.defaultReminderName,
      time: editTime || '08:00',
      times: [editTime || '08:00'],
      dosage: editDosage.trim() || tM.defaultDosage,
      notes: editNotes.trim(),
      category: editCategory,
      rawTranscript: transcript
    };
    onOpenInFullForm(finalData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="voice-dictate-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/65 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
      >
        <motion.div
          id="voice-dictate-modal-sheet"
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="bg-white w-full sm:max-w-lg rounded-t-[36px] sm:rounded-3xl shadow-2xl overflow-hidden border-t-4 border-indigo-500 max-h-[92vh] flex flex-col text-left"
        >
          {/* Header */}
          <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-purple-50/40 to-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 leading-tight">
                  {tM.modalTitle}
                </h3>
                <p className="text-[11px] font-bold text-slate-500">
                  {step === 'listening' ? tM.subListening : tM.subReview}
                </p>
              </div>
            </div>

            <button
              id="voice-dictate-close-btn"
              onClick={() => {
                stopSpeaking();
                cleanupRecognition();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              title={tM.closeTooltip}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">

            {/* STEP 1: LISTENING VIEW */}
            {step === 'listening' && (
              <div className="flex flex-col items-center text-center py-4 space-y-5">
                
                {/* Visualizer Pulsing Avatar */}
                <div className="relative my-2">
                  {isListening && (
                    <>
                      <div className="absolute -inset-4 rounded-full bg-indigo-400/20 animate-ping" />
                      <div className="absolute -inset-2 rounded-full bg-indigo-500/30 animate-pulse" />
                    </>
                  )}
                  <button
                    id="toggle-listening-btn"
                    onClick={() => {
                      if (isListening) {
                        handleStopListening();
                      } else {
                        startListening();
                      }
                    }}
                    className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-xl cursor-pointer ${
                      isListening
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white ring-4 ring-indigo-200 scale-105'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <Mic className="w-9 h-9 animate-bounce" />
                        <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                          {tM.listeningState}
                        </span>
                      </>
                    ) : (
                      <>
                        <MicOff className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                          {tM.tapToSpeak}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Status or Realtime Spoken Transcript */}
                <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 min-h-[90px] flex items-center justify-center text-center">
                  {transcript ? (
                    <p className="text-base font-bold text-slate-800 italic">
                      "{transcript}"
                    </p>
                  ) : isListening ? (
                    <div className="space-y-1">
                      <p className="text-sm font-extrabold text-indigo-600">
                        {tM.promptListening}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {tM.exampleListening}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-medium">
                      {tM.tapMicPrompt}
                    </p>
                  )}
                </div>

                {/* Error warning if any */}
                {errorMsg && (
                  <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Stop & Parse Button */}
                {isListening && transcript && (
                  <button
                    id="finish-voice-input-btn"
                    onClick={handleStopListening}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Check className="w-5 h-5" />
                    <span>{tM.doneSpeakingBtn}</span>
                  </button>
                )}

                {/* Helpful Speaking Tips */}
                <div className="w-full text-left bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{tM.recommendedTitle}</span>
                  </div>
                  <ul className="text-xs text-slate-600 font-medium space-y-1 pl-1">
                    {tM.recommendedExamples.map((ex, idx) => (
                      <li key={idx}>• <span className="font-semibold text-slate-800">"{ex}"</span></li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {/* STEP 2: OPTION A - PRE-FILLED REVIEW VIEW */}
            {step === 'review' && (
              <div className="space-y-4">
                
                {/* Voice Transcript Echo */}
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                      {tM.spokenPhraseEcho}
                    </span>
                    <p className="text-xs font-bold text-slate-800 italic truncate">
                      "{transcript}"
                    </p>
                  </div>
                  <button
                    id="re-record-voice-btn"
                    onClick={() => {
                      stopSpeaking();
                      setStep('listening');
                      startListening();
                    }}
                    className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 px-2 py-1 bg-white rounded-lg border border-indigo-200 cursor-pointer"
                    title={tM.retryTooltip}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{tM.retryBtn}</span>
                  </button>
                </div>

                {/* Pre-filled fields ready for quick review/edit */}
                <div className="space-y-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      {tM.nameLabel}
                    </label>
                    <input
                      id="voice-review-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={tM.namePlaceholder}
                      className="w-full p-3 bg-[#FCFAF7] border-2 border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>

                  {/* Time and Dosage Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Time field */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{tM.alarmTimeLabel}</span>
                      </label>
                      <input
                        id="voice-review-time"
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-full p-3 bg-[#FCFAF7] border-2 border-slate-200 rounded-xl font-black text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>

                    {/* Dosage / Quantity field */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        {tM.dosageLabel}
                      </label>
                      <input
                        id="voice-review-dosage"
                        type="text"
                        value={editDosage}
                        onChange={(e) => setEditDosage(e.target.value)}
                        placeholder={tM.dosagePlaceholder}
                        className="w-full p-3 bg-[#FCFAF7] border-2 border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Category Pill Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                      {tM.categoryLabel}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tM.categories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setEditCategory(cat.id as MedicationCategory)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
                            editCategory === cat.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Notes */}
                  {editNotes && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        {tM.notesLabel}
                      </label>
                      <input
                        id="voice-review-notes"
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full p-2.5 bg-[#FCFAF7] border-2 border-slate-200 rounded-xl font-medium text-slate-700 text-xs"
                      />
                    </div>
                  )}

                </div>

                {/* ACTION BUTTONS (Option A): Direct Save vs Open in full form */}
                <div className="space-y-2.5 pt-2">
                  {/* Primary Save Button */}
                  <button
                    id="voice-review-save-direct-btn"
                    onClick={handleConfirmDirect}
                    className="w-full py-4 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Check className="w-5 h-5" />
                    <span>{tM.saveDirectBtn}</span>
                  </button>

                  {/* Secondary: Open in full detailed editor */}
                  <button
                    id="voice-review-open-full-btn"
                    onClick={handleOpenFull}
                    className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-slate-500" />
                    <span>{tM.openFullBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceDictateModal;
