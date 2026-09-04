/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = 'it' | 'en' | 'es' | 'fr' | 'de';

export type MedicationCategory = 'pill' | 'capsule' | 'bottle' | 'liquid' | 'inhaler' | 'cream' | 'injection' | 'other';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:MM
  times?: string[]; // Multiple daily HH:MM schedules
  notes: string;
  category: MedicationCategory;
  weeklySchedule: number[]; // 0 for Sunday, 1 for Monday, etc.
  frequencyType?: 'weekly' | 'monthly';
  monthlyDay?: number; // 1 to 31 representing day of the month
  isActive: boolean;
  history: { [dateStr: string]: boolean }; // e.g. "2026-06-10": true (taken) or "2026-06-10_08:30": true
  audioTone: string; // 'preset_arpeggio' | 'preset_marimba' | 'preset_trillo'
  voicePrompt: string; // custom empathetic speech prompt
  customVoiceUri?: string; // Base64 Data URL or audio URI with user's personal recorded voice
  nativeId?: number; // Unique 32-bit integer for Android AlarmManager
  stockCurrent?: number; // Current stock count (optional)
  stockMin?: number; // Threshold for low stock warning
  pillColor?: string; // Custom color accent for high-fidelity styling
}

export interface DoctorNote {
  id: string;
  date: string;
  text: string;
  hasSymptom: boolean;
}

export interface SavedVoiceItem {
  id: string;
  title: string;
  createdAt: string;
  durationSec: number;
  dataUrl: string;
  assignedMedId?: string;
}

export const TRANSLATIONS: Record<LanguageCode, {
  appName: string;
  onboardingTitle: string;
  selectLanguage: string;
  welcome: string;
  welcomeDescription: string;
  stepVoiceTitle: string;
  stepVoiceDesc: string;
  stepScanTitle: string;
  stepScanDesc: string;
  stepPharmaTitle: string;
  stepPharmaDesc: string;
  buttonNext: string;
  buttonBack: string;
  buttonFinish: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  greetingNight: string;
  addMedication: string;
  speakButton: string;
  speakButtonTooltip: string;
  voiceDictateTrigger: string;
  vocalRemindersArmed: string;
  snoozeSilently: string;
  editMedication: string;
  medicationName: string;
  medicationNamePlaceholder: string;
  dosageLabel: string;
  dosagePlaceholder: string;
  timeLabel: string;
  instructionsLabel: string;
  instructionsPlaceholder: string;
  categoryLabel: string;
  frequencyTypeLabel: string;
  frequencyWeekly: string;
  frequencyMonthly: string;
  frequencyLabel: string;
  reminderTimesLabel: string;
  addTimeSlotLabel: string;
  monthlyDayLabel: string;
  ofEveryMonth: string;
  voiceTextSynthesisHint: string;
  manageInventoryLabel: string;
  manageInventorySub: string;
  remainingCountLabel: string;
  lowStockAlertLabel: string;
  voiceMessageLabel: string;
  voiceMessagePlaceholder: string;
  voiceOptionLabel: string;
  voiceOptionTts: string;
  voiceOptionCustom: string;
  voiceRecordingTitle: string;
  voiceRecordingSub: string;
  recordStartBtn: string;
  recordStopBtn: string;
  recordingInProgress: string;
  recordedListenBtn: string;
  recordedDeleteBtn: string;
  recordedSuccessBadge: string;
  recordingTimeLimit: string;
  micPermissionError: string;
  recordedVoiceBadge: string;
  save: string;
  cancel: string;
  confirmTaken: string;
  takenBtn: string;
  pendingBtn: string;
  speakAlert: string;
  testVoiceSettings: string;
  testVoiceBtn: string;
  testVoiceSuccess: string;
  voiceSpeed: string;
  voiceToneType: string;
  toneEmpathetic: string;
  toneFirm: string;
  ringtoneLabel: string;
  barcodeScanBtn: string;
  barcodeSuccess: string;
  barcodeScanPrompt: string;
  findPharmacyBtn: string;
  pharmacyTitle: string;
  pharmacyDistance: string;
  pharmacyOpen: string;
  voiceStudioTitle: string;
  voiceStudioSubtitle: string;
  voiceStudioRecordNew: string;
  voiceStudioSavedLibrary: string;
  voiceStudioNoSaved: string;
  voiceStudioAssignBtn: string;
  voiceStudioAssignedTo: string;
  voiceStudioUnassigned: string;
  voiceStudioPlay: string;
  voiceStudioStop: string;
  voiceStudioDelete: string;
  voiceStudioAssignModalTitle: string;
  voiceStudioSelectMedPrompt: string;
  voiceStudioAssignSuccess: string;
  voiceStudioRecordedCount: string;
  voiceStudioLiveTipsTitle: string;
  voiceStudioTip1: string;
  voiceStudioTip2: string;
  historyTitle: string;
  historySubtitle: string;
  weeklyRate: string;
  notesTitle: string;
  notesSubtitle: string;
  notesPlaceholder: string;
  notesVoiceBtn: string;
  notesDoctorLabel: string;
  androidDocsBtn: string;
  noMedsToday: string;
  allDays: string;
  mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string;
  todayMedsTitle: string;
  todayMedsSubtitle: string;
  dailySummaryTitle: string;
  dailySummaryTaken: string;
  dailySummaryRemaining: string;
  cameraRequesting: string;
  cameraDenied: string;
  cameraSimulateBtn: string;
  scanningInProgress: string;
  barcodeMatching: string;
  barcodeScanAgain: string;
  vibrationSetting: string;
  themeSetting: string;
  themeColorSetting: string;
  themeBgSetting: string;
  defaultTheme: string;
  darkTheme: string;
  warmTheme: string;
  alwaysOnSetting: string;
  voiceAnnounceSetting: string;
  privacyPolicy: string;
  privacyText: string;
  medicalDisclaimer: string;
  devicePreferences: string;
  listenTutorialBtn: string;
  voiceTutorialText: string;
  toneEmpatheticActive: string;
  toneFirmActive: string;
  supportDevTitle: string;
  supportDevText: string;
  donateBtn: string;
  historyAndNotesHeader: string;
  historyAndNotesSub: string;
  monthlyDosageCalendar: string;
  howDoYouFeel: string;
  wellbeingSubtitle: string;
  shareReportTitle: string;
  shareReportSub: string;
  reportCopied: string;
  copyDailyReport: string;
  detailsFor: string;
  noMedsForDay: string;
  emergencyTitle: string;
  emergencySub: string;
  callNow: string;
  noNotesYet: string;
  perfectAdherenceMsg: string;
  monthlyStatsSub: string;
  takenStatus: string;
  pendingStatus: string;
  activeMedsLabel: string;
  inactiveMedsLabel: string;
  noActiveMeds: string;
  noInactiveMeds: string;
  searchMedPlaceholder: string;
  medicationManagementHeader: string;
  medicationManagementSub: string;
  addBtn: string;
  editBtn: string;
  deleteBtn: string;
  timesLabel: string;
  deleteConfirmTitle: string;
  colorAccentLabel: string;
  tabToday: string;
  tabMeds: string;
  tabPharmacies: string;
  tabVoices: string;
  tabSetup: string;
  voiceStudioActiveCount: string;
  voiceStudioReady: string;
  voiceStudioRetryNow: string;
  voiceStudioTapToRecord: string;
  voiceStudioTapToRecordDesc: string;
  voiceStudioNamePlaceholder: string;
  voiceStudioRecordedCompleted: string;
  voiceStudioPause: string;
  voiceStudioReRecord: string;
  voiceStudioSaveToLibrary: string;
  voiceStudioOrAssignDirectly: string;
  voiceStudioAssign: string;
  voiceStudioRemindersStatusTitle: string;
  voiceStudioTotalCount: string;
  voiceStudioRecordNewForThis: string;
  voiceStudioRemoveCustomVoice: string;
  voiceStudioRecordForThis: string;
  voiceStudioUseFromLibrary: string;
  voiceStudioCurrentStatus: string;
  voiceStudioToastDeleted: string;
  voiceStudioToastSavedLib: string;
  voiceStudioToastRemoved: string;
  voiceStudioDefaultPrefix: string;
  voiceStudioNewMessage: string;
  voiceStudioFallbackTitle: string;
  voiceStudioLinkedTo: string;
  voiceStudioSavedAndLinked: string;
  voiceStudioOpenSettings: string;
}> = {
  it: {
    appName: "Ricorda con Voce",
    onboardingTitle: "Configurazione Iniziale",
    selectLanguage: "Seleziona la tua lingua:",
    welcome: "Benvenuto su Ricorda con Voce",
    welcomeDescription: "L'app amica, semplice e vocale progettata per aiutarti (o aiutare i tuoi cari) a ricordarsi di ogni impegno e routine con serenità e sicurezza.",
    stepVoiceTitle: "Promemoria Empatici",
    stepVoiceDesc: "L'app parla con te di giorno e di notte con una voce calma, lenta e chiara. Puoi confermare l'evento dicendo 'Fatto' o premendo un grande tasto.",
    stepScanTitle: "Suoni del Dispositivo",
    stepScanDesc: "Personalizza i tuoi allarmi caricando i tuoi file preferiti o importando direttamente le suonerie e i suoni di notifica originali del tuo telefono.",
    stepPharmaTitle: "Luoghi e Mappa",
    stepPharmaDesc: "Se hai bisogno di trovare punti di interesse vicini, c'è un tasto rapido che localizza i luoghi più vicini a te.",
    buttonNext: "Avanti",
    buttonBack: "Indietro",
    buttonFinish: "Fine",
    greetingMorning: "Buongiorno",
    greetingAfternoon: "Buon pomeriggio",
    greetingEvening: "Buonasera",
    greetingNight: "Buonanotte",
    addMedication: "Promemoria",
    speakButton: "Parla",
    speakButtonTooltip: "Crea promemoria parlando con la voce",
    voiceDictateTrigger: "Compila parlando con la voce (Automatico)",
    vocalRemindersArmed: "Promemoria vocali attivi",
    snoozeSilently: "Rimanda silenziosamente",
    editMedication: "Modifica Promemoria",
    medicationName: "Nome del Promemoria",
    medicationNamePlaceholder: "es: Bere un bicchiere d'acqua",
    dosageLabel: "Dettaglio (es. 1 volta, breve nota)",
    dosagePlaceholder: "es: 1 volta al giorno",
    timeLabel: "Orario dell'avviso",
    instructionsLabel: "Note speciali (es. prima di uscire, portare chiavi)",
    instructionsPlaceholder: "es: Prima di uscire, prendere le chiavi di casa",
    categoryLabel: "Tipo di promemoria",
    frequencyTypeLabel: "Frequenza Promemoria",
    frequencyWeekly: "Settimanale",
    frequencyMonthly: "Mensile",
    frequencyLabel: "Giorni di ripetizione",
    reminderTimesLabel: "Orari Promemoria",
    addTimeSlotLabel: "Aggiungi Orario",
    monthlyDayLabel: "Giorno del mese per il promemoria",
    ofEveryMonth: "ogni mese",
    voiceTextSynthesisHint: "Testo pronunciato dal sintetizzatore vocale (se non usi la voce registrata).",
    manageInventoryLabel: "Gestisci Scorte (Inventario)",
    manageInventorySub: "Allarme automatico se le scorte terminano",
    remainingCountLabel: "Quantità Rimasta",
    lowStockAlertLabel: "Soglia Minima Allarme",
    voiceMessageLabel: "Messaggio vocale personalizzato (opzionale)",
    voiceMessagePlaceholder: "Es: Ricordati di fare una passeggiata e bere un po' d'acqua.",
    voiceOptionLabel: "Tipo di Avviso Vocale",
    voiceOptionTts: "Voce Sintetica (Automatica)",
    voiceOptionCustom: "La Mia Voce Registrata 🎙️",
    voiceRecordingTitle: "Registra la Tua Voce",
    voiceRecordingSub: "Registra con la tua voce il messaggio per questo promemoria.",
    recordStartBtn: "Inizia Registrazione",
    recordStopBtn: "Ferma e Salva",
    recordingInProgress: "Registrazione in corso...",
    recordedListenBtn: "Riascolta Voce",
    recordedDeleteBtn: "Elimina Voce",
    recordedSuccessBadge: "Voce Registrata Salvata",
    recordingTimeLimit: "Max 30 secondi",
    micPermissionError: "Accesso al microfono non consentito. Verifica i permessi nelle impostazioni.",
    recordedVoiceBadge: "Voce Personale",
    save: "Salva",
    cancel: "Annulla",
    confirmTaken: "Hai completato il promemoria?",
    takenBtn: "Fatto",
    pendingBtn: "CONFERMA",
    speakAlert: "Sveglia Vocale",
    testVoiceSettings: "Impostazioni e Prova Voce",
    testVoiceBtn: "Ascolta Prova Voce",
    testVoiceSuccess: "Voce configurata correttamente! Come ti sembra il tono?",
    voiceSpeed: "Velocità della Voce (Consigliata Bassa per anziani)",
    voiceToneType: "Tono della Voce",
    toneEmpathetic: "Empatico e Caldo ✨",
    toneFirm: "Deciso e Rassicurante 🔔",
    ringtoneLabel: "Suono / Notifica di Allarme",
    barcodeScanBtn: "Fotocamera (Inquadra Codice)",
    barcodeSuccess: "Codice scansionato con successo!",
    barcodeScanPrompt: "Posiziona il codice davanti alla fotocamera per rilevarlo in automatico.",
    findPharmacyBtn: "Trova Luoghi Vicini sulla Mappa",
    pharmacyTitle: "Mappa e Punti di Interesse",
    pharmacyDistance: "Distanza",
    pharmacyOpen: "Aperto Ora",
    voiceStudioTitle: "Studio Vocale & Registratore",
    voiceStudioSubtitle: "Crea e gestisci promemoria con la tua vera voce o quella dei tuoi cari",
    voiceStudioRecordNew: "Nuova Registrazione Vocale",
    voiceStudioSavedLibrary: "Archivio Messaggi Vocali",
    voiceStudioNoSaved: "Nessun messaggio vocale salvato. Tocca il pulsante sopra per registrarne uno!",
    voiceStudioAssignBtn: "Assegna a Promemoria",
    voiceStudioAssignedTo: "Assegnato a:",
    voiceStudioUnassigned: "Non assegnato",
    voiceStudioPlay: "Ascolta",
    voiceStudioStop: "Ferma",
    voiceStudioDelete: "Elimina",
    voiceStudioAssignModalTitle: "Collega Voce a un Promemoria",
    voiceStudioSelectMedPrompt: "Scegli a quale promemoria applicare questo messaggio vocale:",
    voiceStudioAssignSuccess: "Voce collegata con successo al promemoria!",
    voiceStudioRecordedCount: "Messaggi registrati",
    voiceStudioLiveTipsTitle: "Consigli per registrare al meglio:",
    voiceStudioTip1: "Parla vicino al microfono scandendo le parole in modo chiaro ed empatico.",
    voiceStudioTip2: "Puoi far registrare un messaggio affettuoso da un figlio, nipote o persona cara.",
    historyTitle: "Cronologia Settimanale",
    historySubtitle: "Traccia la costanza dei tuoi promemoria",
    weeklyRate: "Tasso di completamento di questa settimana",
    notesTitle: "Registro delle Note e Appunti",
    notesSubtitle: "Scrivi promemoria liberi, idee o appunti per la tua giornata",
    notesPlaceholder: "Scrivi qui o premi il microfono per dettare con la voce...",
    notesVoiceBtn: "Dettatura Vocale",
    notesDoctorLabel: "Segnala come nota importante",
    androidDocsBtn: "Codice Android AlarmManager (Dev)",
    noMedsToday: "Nessun promemoria programmato per oggi. Ottimo!",
    allDays: "Tutti i giorni",
    mon: "Lun", tue: "Mar", wed: "Mer", thu: "Gio", fri: "Ven", sat: "Sab", sun: "Dom",
    todayMedsTitle: "Promemoria di Oggi",
    todayMedsSubtitle: "Controlla e conferma i tuoi impegni",
    dailySummaryTitle: "Riepilogo Giornaliero",
    dailySummaryTaken: "Completati",
    dailySummaryRemaining: "Rimanenti",
    cameraRequesting: "Richiesta autorizzazione fotocamera in corso...",
    cameraDenied: "Impossibile accedere alla fotocamera. Assicurati di aver consentito l'accesso o usa il simulatore.",
    cameraSimulateBtn: "Simula Scansione Rapida (Offline)",
    scanningInProgress: "Scansione...",
    barcodeMatching: "Associazione riuscita! Compilazione automatica in corso...",
    barcodeScanAgain: "Scansiona ancora",
    vibrationSetting: "Vibrazione",
    themeSetting: "Tema e Colore Sfondo",
    themeColorSetting: "Colore del Tema (Tasti)",
    themeBgSetting: "Stile dello Sfondo",
    defaultTheme: "Chiaro",
    darkTheme: "Scuro",
    warmTheme: "Caldo",
    alwaysOnSetting: "Display Attivo alla Notifica",
    voiceAnnounceSetting: "Notifiche Vocali Attive (Sintesi Vocale)",
    privacyPolicy: "Informativa sulla Privacy",
    privacyText: "Privacy Policy Lineare: L'app opera esclusivamente in modalità locale, non ha database remoti e non traccia in alcun modo le abitudini dell'utente.",
    medicalDisclaimer: "Nota: Quest'app è uno strumento di promemoria e organizzazione personale.",
    devicePreferences: "Preferenze Dispositivo",
    listenTutorialBtn: "Ascolta Tutorial Vocale",
    voiceTutorialText: "Benvenuto nel tutorial. Quando senti l'avviso del promemoria, puoi dire 'Sì' o 'Fatto' per confermare l'evento. Oppure puoi toccare il pulsante sullo schermo per rimandare l'allarme.",
    toneEmpatheticActive: "Tono empatico attivato",
    toneFirmActive: "Tono deciso attivato",
    supportDevTitle: "Supporta lo Sviluppatore",
    supportDevText: "Se trovi utile questa app e vuoi aiutarmi a mantenerla gratuita e senza pubblicità, puoi offrirmi un caffè!",
    donateBtn: "Dona 2 euro",
    historyAndNotesHeader: "Cronologia & Note",
    historyAndNotesSub: "Completamento settimanale e diario appunti",
    monthlyDosageCalendar: "Calendario Promemoria Mensile",
    howDoYouFeel: "Come ti senti oggi?",
    wellbeingSubtitle: "Stato della tua giornata e condivisione",
    shareReportTitle: "Invia Report al Caregiver",
    shareReportSub: "Crea un report di oggi con promemoria completati, note e livello di benessere pronto da inviare su WhatsApp o SMS.",
    reportCopied: "Report Copiato!",
    copyDailyReport: "Copia Report Giornaliero",
    detailsFor: "Dettaglio di ",
    noMedsForDay: "Nessun promemoria programmato per questo giorno.",
    emergencyTitle: "Chiamata Rapida",
    emergencySub: "Imposta il numero per chiamare un familiare o contatto preferito.",
    callNow: "Chiama Ora",
    noNotesYet: "Ancora nessun appunto inserito nel registro.",
    perfectAdherenceMsg: "Completamento perfetto o dati in calcolo per il mese.",
    monthlyStatsSub: "Questi dati includono il calcolo mensile basato sull'attività recente.",
    takenStatus: "Completato",
    pendingStatus: "Salto",
    activeMedsLabel: "Attivi",
    inactiveMedsLabel: "Disattivati",
    noActiveMeds: "Nessun promemoria attivo.",
    noInactiveMeds: "Nessun promemoria disattivato.",
    searchMedPlaceholder: "Cerca promemoria...",
    medicationManagementHeader: "Gestione Promemoria",
    medicationManagementSub: "Attiva/disattiva e organizza",
    addBtn: "Nuovo",
    editBtn: "Modifica",
    deleteBtn: "Elimina",
    timesLabel: "Orari:",
    deleteConfirmTitle: "Eliminare questo promemoria?",
    colorAccentLabel: "Colore del Promemoria",
    tabToday: "Oggi",
    tabMeds: "Promemoria",
    tabPharmacies: "Mappa",
    tabVoices: "Voci",
    tabSetup: "Setup",
    voiceStudioActiveCount: "Voci Attive",
    voiceStudioReady: "Registrato",
    voiceStudioRetryNow: "Riprova ora",
    voiceStudioTapToRecord: "Tocca il microfono e parla liberamente",
    voiceStudioTapToRecordDesc: "Registra un messaggio d'affetto per ricordare un impegno o una routine quotidiana.",
    voiceStudioNamePlaceholder: "Nome del messaggio (es. Saluto Figlia)",
    voiceStudioRecordedCompleted: "Registrazione Completata",
    voiceStudioPause: "Pausa",
    voiceStudioReRecord: "Rifai",
    voiceStudioSaveToLibrary: "Salva nell'Archivio Voci",
    voiceStudioOrAssignDirectly: "Oppure assegna subito a un promemoria:",
    voiceStudioAssign: "Assegna",
    voiceStudioRemindersStatusTitle: "Stato Voci dei Tuoi Promemoria",
    voiceStudioTotalCount: "totali",
    voiceStudioRecordNewForThis: "Registra Nuova",
    voiceStudioRemoveCustomVoice: "Rimuovi voce personale",
    voiceStudioRecordForThis: "Registra Voce per Questo",
    voiceStudioUseFromLibrary: "Usa Voce dall'Archivio",
    voiceStudioCurrentStatus: "Attivo",
    voiceStudioToastDeleted: "Messaggio vocale eliminato.",
    voiceStudioToastSavedLib: "Messaggio vocale salvato nell'archivio!",
    voiceStudioToastRemoved: "Voce personale rimossa: ripristinata voce sintetica.",
    voiceStudioDefaultPrefix: "Voce per",
    voiceStudioNewMessage: "Nuovo Messaggio",
    voiceStudioFallbackTitle: "Messaggio Vocale",
    voiceStudioLinkedTo: "collegata a",
    voiceStudioSavedAndLinked: "Voce salvata e collegata a",
    voiceStudioOpenSettings: "Apri Impostazioni App",
  },
  en: {
    appName: "Ricorda con Voce",
    onboardingTitle: "Initial Configuration",
    selectLanguage: "Select your language:",
    welcome: "Welcome to Ricorda con Voce",
    welcomeDescription: "A friendly, simple, and vocal app designed to help you (or your loved ones) manage reminders, daily routines, and tasks with peace of mind.",
    stepVoiceTitle: "Empathetic Reminders",
    stepVoiceDesc: "The app talks to you day and night with a calm, slow, and clear voice. You can confirm by saying 'Done' or touching a giant button.",
    stepScanTitle: "Custom Device Sounds",
    stepScanDesc: "Personalize your alerts by uploading your favorite sounds or directly importing your phone's original ringtones and notification sounds.",
    stepPharmaTitle: "Places & Map",
    stepPharmaDesc: "Easily find points of interest and nearby locations on the map.",
    buttonNext: "Next",
    buttonBack: "Back",
    buttonFinish: "Finish",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    greetingNight: "Good night",
    addMedication: "Reminder",
    speakButton: "Speak",
    speakButtonTooltip: "Create reminder with voice",
    voiceDictateTrigger: "Fill in by speaking (Automatic)",
    vocalRemindersArmed: "Vocal reminders armed",
    snoozeSilently: "Snooze silently",
    editMedication: "Edit Reminder",
    medicationName: "Reminder Name",
    medicationNamePlaceholder: "e.g., Drink a glass of water",
    dosageLabel: "Details (e.g., 1 time, brief note)",
    dosagePlaceholder: "e.g., 1 time daily",
    timeLabel: "Reminder Time",
    instructionsLabel: "Special notes (e.g., before leaving, take keys)",
    instructionsPlaceholder: "e.g., Before leaving home, take house keys",
    categoryLabel: "Reminder Category",
    frequencyTypeLabel: "Reminder Frequency",
    frequencyWeekly: "Weekly",
    frequencyMonthly: "Monthly",
    frequencyLabel: "Repeat Days",
    reminderTimesLabel: "Reminder Times",
    addTimeSlotLabel: "Add Time Slot",
    monthlyDayLabel: "Day of the month for reminder",
    ofEveryMonth: "of every month",
    voiceTextSynthesisHint: "Text spoken by speech synthesizer (if not using recorded voice).",
    manageInventoryLabel: "Manage Inventory (Supplies)",
    manageInventorySub: "Voice alerts when supplies run low",
    remainingCountLabel: "Remaining Count",
    lowStockAlertLabel: "Low Stock Alert",
    voiceMessageLabel: "Custom Voice Message (optional)",
    voiceMessagePlaceholder: "E.g., Please remember to take a walk and drink some water.",
    voiceOptionLabel: "Voice Alert Type",
    voiceOptionTts: "Synthetic Voice",
    voiceOptionCustom: "My Recorded Voice 🎙️",
    voiceRecordingTitle: "Record Your Own Voice",
    voiceRecordingSub: "Speak this reminder in your own voice. The app will play it when it triggers.",
    recordStartBtn: "Start Recording",
    recordStopBtn: "Stop & Save",
    recordingInProgress: "Recording in progress...",
    recordedListenBtn: "Listen",
    recordedDeleteBtn: "Delete Voice",
    recordedSuccessBadge: "Custom Voice Saved",
    recordingTimeLimit: "Max 30 seconds",
    micPermissionError: "Microphone access denied. Please check device settings.",
    recordedVoiceBadge: "Custom Voice",
    save: "Save",
    cancel: "Cancel",
    confirmTaken: "Have you completed this reminder?",
    takenBtn: "Done",
    pendingBtn: "CONFIRM",
    speakAlert: "Vocal Alert",
    testVoiceSettings: "Settings & Voice Test",
    testVoiceBtn: "Listen to Voice Test",
    testVoiceSuccess: "Voice configured properly! How do you like this tone?",
    voiceSpeed: "Voice Speed (Low speed recommended for elderly)",
    voiceToneType: "Voice Character",
    toneEmpathetic: "Warm & Caring ✨",
    toneFirm: "Firm & Clear 🔔",
    ringtoneLabel: "Alarm Ringtone / Alert Sound",
    barcodeScanBtn: "Camera Scanner",
    barcodeSuccess: "Code scanned successfully!",
    barcodeScanPrompt: "Align the code inside the preview area to scan automatically.",
    findPharmacyBtn: "Find Nearby Places on Map",
    pharmacyTitle: "Map & Places of Interest",
    pharmacyDistance: "Distance",
    pharmacyOpen: "Open Now",
    voiceStudioTitle: "Voice Studio & Recorder",
    voiceStudioSubtitle: "Create and manage personalized vocal reminders with your own or loved ones' voice",
    voiceStudioRecordNew: "New Voice Recording",
    voiceStudioSavedLibrary: "Recorded Voice Library",
    voiceStudioNoSaved: "No recorded voice messages yet. Tap the button above to record one!",
    voiceStudioAssignBtn: "Assign to Reminder",
    voiceStudioAssignedTo: "Assigned to:",
    voiceStudioUnassigned: "Unassigned",
    voiceStudioPlay: "Play",
    voiceStudioStop: "Stop",
    voiceStudioDelete: "Delete",
    voiceStudioAssignModalTitle: "Link Voice to a Reminder",
    voiceStudioSelectMedPrompt: "Select which reminder should trigger this voice message:",
    voiceStudioAssignSuccess: "Voice successfully linked to the reminder!",
    voiceStudioRecordedCount: "Recorded messages",
    voiceStudioLiveTipsTitle: "Tips for best vocal recording:",
    voiceStudioTip1: "Speak close to your phone's microphone with a calm and natural tone.",
    voiceStudioTip2: "Have a family member, child or grandchild record a warm greeting.",
    historyTitle: "Weekly History",
    historySubtitle: "Keep track of your reminder consistency",
    weeklyRate: "Completion rate this week",
    notesTitle: "Notes & Daily Journal",
    notesSubtitle: "Write thoughts, ideas, or reminders for your day",
    notesPlaceholder: "Type notes here or tap the microphone to speak...",
    notesVoiceBtn: "Voice Input",
    notesDoctorLabel: "Mark as important note",
    androidDocsBtn: "Android AlarmManager Code (Dev)",
    noMedsToday: "No reminders scheduled for today. Great!",
    allDays: "Every day",
    mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
    todayMedsTitle: "Today's Reminders",
    todayMedsSubtitle: "Check and confirm your tasks",
    dailySummaryTitle: "Daily Summary",
    dailySummaryTaken: "Done",
    dailySummaryRemaining: "Remaining",
    cameraRequesting: "Requesting camera authorization...",
    cameraDenied: "Unable to access the camera. Make sure you have allowed access or use the simulator.",
    cameraSimulateBtn: "Simulate Fast Scan (Offline)",
    scanningInProgress: "Scanning...",
    barcodeMatching: "Match found! Auto-filling details...",
    barcodeScanAgain: "Scan again",
    vibrationSetting: "Vibration",
    themeSetting: "Background Color & Theme",
    themeColorSetting: "Theme Accent Color",
    themeBgSetting: "Background Style",
    defaultTheme: "Light",
    darkTheme: "Dark",
    warmTheme: "Warm",
    alwaysOnSetting: "Keep Display On for Notifications",
    voiceAnnounceSetting: "Enable Voice Announcements (Text-to-Speech)",
    privacyPolicy: "Privacy Policy",
    privacyText: "Linear Privacy Policy: The app operates entirely locally, has no remote databases, and does not track user habits in any way.",
    medicalDisclaimer: "Note: This app is a personal organization and reminder tool.",
    devicePreferences: "Device Preferences",
    listenTutorialBtn: "Listen to Voice Tutorial",
    voiceTutorialText: "Welcome to the tutorial. When you hear the reminder alert, say 'Yes' or 'Done' to confirm. Or, you can tap the button on the screen to snooze the alarm for a few minutes.",
    toneEmpatheticActive: "Empathetic tone active",
    toneFirmActive: "Firm tone active",
    supportDevTitle: "Support the Developer",
    supportDevText: "If you find this app helpful and want to help me keep it free and without ads, consider buying me a coffee!",
    donateBtn: "Donate €2",
    historyAndNotesHeader: "History & Notes",
    historyAndNotesSub: "Weekly completion and personal journal",
    monthlyDosageCalendar: "Monthly Reminders Calendar",
    howDoYouFeel: "How do you feel today?",
    wellbeingSubtitle: "Well-being & daily report",
    shareReportTitle: "Share Daily Report",
    shareReportSub: "Creates a summary of today's completed reminders, notes, and well-being ready to send via WhatsApp or SMS.",
    reportCopied: "Report Copied!",
    copyDailyReport: "Copy Daily Report",
    detailsFor: "Details for ",
    noMedsForDay: "No reminders scheduled for this day.",
    emergencyTitle: "Emergency",
    emergencySub: "Set the number to reach a relative or favorite contact quickly.",
    callNow: "Call Now",
    noNotesYet: "No notes recorded yet.",
    perfectAdherenceMsg: "Perfect completion or calculating monthly data.",
    monthlyStatsSub: "Monthly statistics are calculated from recent activity.",
    takenStatus: "Done",
    pendingStatus: "Pending",
    activeMedsLabel: "Active",
    inactiveMedsLabel: "Inactive",
    noActiveMeds: "No active reminders.",
    noInactiveMeds: "No inactive reminders.",
    searchMedPlaceholder: "Search reminders...",
    medicationManagementHeader: "Reminders Management",
    medicationManagementSub: "Toggle and organize",
    addBtn: "Add",
    editBtn: "Edit",
    deleteBtn: "Delete",
    timesLabel: "Times:",
    deleteConfirmTitle: "Delete this reminder?",
    colorAccentLabel: "Reminder Color Accent",
    tabToday: "Today",
    tabMeds: "Reminders",
    tabPharmacies: "Map",
    tabVoices: "Voices",
    tabSetup: "Setup",
    voiceStudioActiveCount: "Active Voices",
    voiceStudioReady: "Ready",
    voiceStudioRetryNow: "Retry now",
    voiceStudioTapToRecord: "Tap the microphone and speak freely",
    voiceStudioTapToRecordDesc: "Speak a clear, warm message for your loved ones or personal routine.",
    voiceStudioNamePlaceholder: "Voice message title (e.g. Morning Call)",
    voiceStudioRecordedCompleted: "Recorded Voice",
    voiceStudioPause: "Pause",
    voiceStudioReRecord: "Re-record",
    voiceStudioSaveToLibrary: "Save to Voice Library",
    voiceStudioOrAssignDirectly: "Or link directly to a reminder:",
    voiceStudioAssign: "Assign",
    voiceStudioRemindersStatusTitle: "Reminders Voice Status",
    voiceStudioTotalCount: "total",
    voiceStudioRecordNewForThis: "Re-record",
    voiceStudioRemoveCustomVoice: "Remove custom voice",
    voiceStudioRecordForThis: "Record Voice for This",
    voiceStudioUseFromLibrary: "Use Saved Voice",
    voiceStudioCurrentStatus: "Current",
    voiceStudioToastDeleted: "Voice message deleted.",
    voiceStudioToastSavedLib: "Voice message saved to your library!",
    voiceStudioToastRemoved: "Custom voice removed: restored default voice.",
    voiceStudioDefaultPrefix: "Voice for",
    voiceStudioNewMessage: "New Voice Message",
    voiceStudioFallbackTitle: "Voice Message",
    voiceStudioLinkedTo: "linked to",
    voiceStudioSavedAndLinked: "Voice saved and linked to",
    voiceStudioOpenSettings: "Open App Settings",
  },
  es: {
    appName: "Ricorda con Voce",
    onboardingTitle: "Configuración Inicial",
    selectLanguage: "Selecciona tu idioma:",
    welcome: "Bienvenido a Ricorda con Voce",
    welcomeDescription: "La aplicación amigable, sencilla y hablada diseñada para ayudarte a recordar cada tarea y rutina de forma segura y sin estrés.",
    stepVoiceTitle: "Recordatorios Empáticos",
    stepVoiceDesc: "La aplicación le habla de día y de noche con voz pausada y clara. Confirma la tarea diciendo 'Hecho' o pulsando un gran botón.",
    stepScanTitle: "Sonidos del Dispositivo",
    stepScanDesc: "Personaliza tus alertas subiendo tus archivos favoritos o importando directamente los tonos de llamada y de notificación de tu propio teléfono.",
    stepPharmaTitle: "Lugares y Mapa",
    stepPharmaDesc: "Encuentra puntos de interés y lugares cercanos rápidamente en el mapa.",
    buttonNext: "Siguiente",
    buttonBack: "Atrás",
    buttonFinish: "Finalizar",
    greetingMorning: "Buenos días",
    greetingAfternoon: "Buenas tardes",
    greetingEvening: "Buenas noches",
    greetingNight: "Buenas noches",
    addMedication: "Recordatorio",
    speakButton: "Hablar",
    speakButtonTooltip: "Crear recordatorio con la voz",
    voiceDictateTrigger: "Rellenar hablando con la voz (Automático)",
    vocalRemindersArmed: "Recordatorios de voz activos",
    snoozeSilently: "Posponer en silencio",
    editMedication: "Editar Recordatorio",
    medicationName: "Nombre del Recordatorio",
    medicationNamePlaceholder: "ej: Beber un vaso de agua",
    dosageLabel: "Detalle (ej. 1 vez, nota breve)",
    dosagePlaceholder: "ej: 1 vez al día",
    timeLabel: "Hora del aviso",
    instructionsLabel: "Notas especiales (ej. antes de salir, llevar llaves)",
    instructionsPlaceholder: "ej: Antes de salir, llevar las llaves",
    categoryLabel: "Tipo de recordatorio",
    frequencyTypeLabel: "Frecuencia del Recordatorio",
    frequencyWeekly: "Semanal",
    frequencyMonthly: "Mensual",
    frequencyLabel: "Días de repetición",
    reminderTimesLabel: "Horarios del Recordatorio",
    addTimeSlotLabel: "Añadir Horario",
    monthlyDayLabel: "Día del mes para el recordatorio",
    ofEveryMonth: "de cada mes",
    voiceTextSynthesisHint: "Texto pronunciado por el sintetizador de voz (si no se usa voz grabada).",
    manageInventoryLabel: "Gestionar Suministros (Inventario)",
    manageInventorySub: "Aviso de voz cuando los suministros se agotan",
    remainingCountLabel: "Cantidad Restante",
    lowStockAlertLabel: "Umbral Mínimo de Alerta",
    voiceMessageLabel: "Mensaje de voz personalizado (opcional)",
    voiceMessagePlaceholder: "Ej: Recuerda dar un paseo y beber agua.",
    voiceOptionLabel: "Tipo de Alerta de Voz",
    voiceOptionTts: "Voz Sintética",
    voiceOptionCustom: "Mi Voz Grabada 🎙️",
    voiceRecordingTitle: "Grabar Mi Propia Voz",
    voiceRecordingSub: "Graba con tu propia voz este recordatorio. La app lo reproducirá a la hora fijada.",
    recordStartBtn: "Iniciar Grabación",
    recordStopBtn: "Detener y Guardar",
    recordingInProgress: "Grabando voz...",
    recordedListenBtn: "Escuchar",
    recordedDeleteBtn: "Eliminar Voz",
    recordedSuccessBadge: "Voz Grabada Guardada",
    recordingTimeLimit: "Máx 30 segundos",
    micPermissionError: "Acceso al micrófono denegado. Comprueba los permisos.",
    recordedVoiceBadge: "Voz Propia",
    save: "Guardar",
    cancel: "Cancelar",
    confirmTaken: "¿Has completado el recordatorio?",
    takenBtn: "Hecho",
    pendingBtn: "CONFIRMAR",
    speakAlert: "Alerta de Voz",
    testVoiceSettings: "Configuración y Prueba de Voz",
    testVoiceBtn: "Escuchar Prueba de Voz",
    testVoiceSuccess: "¡Voz configurada correctamente! ¿Qué tal se oye el tono?",
    voiceSpeed: "Velocidad de Voz (Baja recomendada para mayores)",
    voiceToneType: "Tono de Voz",
    toneEmpathetic: "Empático y Cálido ✨",
    toneFirm: "Firme y Decidido 🔔",
    ringtoneLabel: "Tono / Sonido de Alerta",
    barcodeScanBtn: "Detector de Códigos",
    barcodeSuccess: "¡Código escaneado correctamente!",
    barcodeScanPrompt: "Coloque el código frente a la cámara para escanearlo.",
    findPharmacyBtn: "Buscar Lugares Cercanos en el Mapa",
    pharmacyTitle: "Mapa y Puntos de Interés",
    pharmacyDistance: "Distancia",
    pharmacyOpen: "Abierto Ahora",
    voiceStudioTitle: "Estudio de Voz y Grabadora",
    voiceStudioSubtitle: "Crea y administra recordatorios con tu propia voz o la de tus seres queridos",
    voiceStudioRecordNew: "Nueva Grabación de Voz",
    voiceStudioSavedLibrary: "Biblioteca de Mensajes de Voz",
    voiceStudioNoSaved: "Aún no hay mensajes grabados. ¡Toca el botón superior para grabar uno!",
    voiceStudioAssignBtn: "Asignar a Recordatorio",
    voiceStudioAssignedTo: "Asignado a:",
    voiceStudioUnassigned: "Sin asignar",
    voiceStudioPlay: "Escuchar",
    voiceStudioStop: "Detener",
    voiceStudioDelete: "Eliminar",
    voiceStudioAssignModalTitle: "Vincular Voz a un Recordatorio",
    voiceStudioSelectMedPrompt: "Selecciona a qué recordatorio deseas asociar esta voz:",
    voiceStudioAssignSuccess: "¡Voz vinculada exitosamente al recordatorio!",
    voiceStudioRecordedCount: "Mensajes grabados",
    voiceStudioLiveTipsTitle: "Consejos para grabar mejor:",
    voiceStudioTip1: "Habla cerca del micrófono con un tono claro, pausado y tranquilo.",
    voiceStudioTip2: "Pide a un hijo o ser querido que grabe un mensaje con cariño.",
    historyTitle: "Registro Semanal",
    historySubtitle: "Sigue la constancia de tus recordatorios",
    weeklyRate: "Tasa de cumplimiento de esta semana",
    notesTitle: "Notas y Diario Personal",
    notesSubtitle: "Escribe ideas, notas o tareas para tu día a día",
    notesPlaceholder: "Escriba aquí o toque el micrófono para dictar con voz...",
    notesVoiceBtn: "Dictar Nota",
    notesDoctorLabel: "Marcar como nota importante",
    androidDocsBtn: "Código Android AlarmManager (Dev)",
    noMedsToday: "No hay recordatorios programados para hoy. ¡Estupendo!",
    allDays: "Todos los días",
    mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom",
    todayMedsTitle: "Recordatorios de Hoy",
    todayMedsSubtitle: "Revisa y confirma tus tareas",
    dailySummaryTitle: "Resumen Diario",
    dailySummaryTaken: "Hecho",
    dailySummaryRemaining: "Restantes",
    cameraRequesting: "Solicitando autorización de la cámara...",
    cameraDenied: "No se pudo acceder a la cámara. Asegúrate de haber permitido el acceso o usa el simulador.",
    cameraSimulateBtn: "Simular Escaneo Rápido (Offline)",
    scanningInProgress: "Escaneando...",
    barcodeMatching: "¡Asociación exitosa! Auto-completando...",
    barcodeScanAgain: "Escanear de nuevo",
    vibrationSetting: "Vibración",
    themeSetting: "Color de Fondo y Tema",
    themeColorSetting: "Color de Acentos (Tema)",
    themeBgSetting: "Estilo de Fondo",
    defaultTheme: "Claro",
    darkTheme: "Oscuro",
    warmTheme: "Cálido",
    alwaysOnSetting: "Mantener Pantalla Encendida para Notificaciones",
    voiceAnnounceSetting: "Habilitar Anuncios Vocales (Síntesis de Voz)",
    privacyPolicy: "Política de Privacidad",
    privacyText: "Política de Privacidad Lineal: La aplicación funciona exclusivamente en modo local, no tiene bases de datos remotas y no rastrea los hábitos del usuario.",
    medicalDisclaimer: "Nota: Esta aplicación es una herramienta de organización personal y recordatorios.",
    devicePreferences: "Preferencias del Dispositivo",
    listenTutorialBtn: "Escuchar Tutorial de Voz",
    voiceTutorialText: "Bienvenido al tutorial. Cuando escuche la alerta, diga 'Sí' o 'Hecho' para confirmar. O bien, toque el botón en la pantalla para posponer la alarma unos minutos.",
    toneEmpatheticActive: "Tono empático activado",
    toneFirmActive: "Tono firme activado",
    supportDevTitle: "Apoyar al Desarrollador",
    supportDevText: "Si encuentra útil esta aplicación y desea ayudarme a mantenerla gratuita y sin publicidad, ¡considere invitarme a un café!",
    donateBtn: "Donar 2 €",
    historyAndNotesHeader: "Historial y Notas",
    historyAndNotesSub: "Cumplimiento semanal y diario de notas",
    monthlyDosageCalendar: "Calendario Mensual de Recordatorios",
    howDoYouFeel: "¿Cómo te sientes hoy?",
    wellbeingSubtitle: "Estado de ánimo y resumen diario",
    shareReportTitle: "Compartir Informe Diario",
    shareReportSub: "Crea un informe de hoy con los recordatorios completados, notas y nivel de bienestar listo para enviar por WhatsApp o SMS.",
    reportCopied: "¡Informe Copiado!",
    copyDailyReport: "Copiar Informe Diario",
    detailsFor: "Detalle de ",
    noMedsForDay: "No hay recordatorios programados para este día.",
    emergencyTitle: "Emergencia",
    emergencySub: "Configure el número para llamar a un familiar o contacto favorito rápidamente.",
    callNow: "Llamar Ahora",
    noNotesYet: "Aún no hay notas registradas.",
    perfectAdherenceMsg: "Cumplimiento perfecto o calculando datos del mes.",
    monthlyStatsSub: "Estos datos incluyen el cálculo mensual basado en la actividad reciente.",
    takenStatus: "Hecho",
    pendingStatus: "Pendiente",
    activeMedsLabel: "Activos",
    inactiveMedsLabel: "Desactivados",
    noActiveMeds: "No hay recordatorios activos.",
    noInactiveMeds: "No hay recordatorios desactivados.",
    searchMedPlaceholder: "Buscar recordatorio...",
    medicationManagementHeader: "Gestión de Recordatorios",
    medicationManagementSub: "Activar/desactivar y organizar",
    addBtn: "Añadir",
    editBtn: "Editar",
    deleteBtn: "Eliminar",
    timesLabel: "Horas:",
    deleteConfirmTitle: "¿Eliminar este recordatorio?",
    colorAccentLabel: "Color del Recordatorio",
    tabToday: "Hoy",
    tabMeds: "Recordatorios",
    tabPharmacies: "Mapa",
    tabVoices: "Voces",
    tabSetup: "Ajustes",
    voiceStudioActiveCount: "Voces Activas",
    voiceStudioReady: "Listo",
    voiceStudioRetryNow: "Reintentar ahora",
    voiceStudioTapToRecord: "Toca el micrófono y habla libremente",
    voiceStudioTapToRecordDesc: "Graba un mensaje cariñoso para recordar una tarea o rutina diaria.",
    voiceStudioNamePlaceholder: "Nombre del mensaje (ej. Saludo de mi hija)",
    voiceStudioRecordedCompleted: "Grabación Completada",
    voiceStudioPause: "Pausa",
    voiceStudioReRecord: "Repetir",
    voiceStudioSaveToLibrary: "Guardar en la Biblioteca de Voces",
    voiceStudioOrAssignDirectly: "O asignar directamente a un recordatorio:",
    voiceStudioAssign: "Asignar",
    voiceStudioRemindersStatusTitle: "Estado de Voz de Tus Recordatorios",
    voiceStudioTotalCount: "totales",
    voiceStudioRecordNewForThis: "Grabar Nueva",
    voiceStudioRemoveCustomVoice: "Eliminar voz personalizada",
    voiceStudioRecordForThis: "Grabar Voz para Este",
    voiceStudioUseFromLibrary: "Usar Voz de la Biblioteca",
    voiceStudioCurrentStatus: "Activo",
    voiceStudioToastDeleted: "Mensaje de voz eliminado.",
    voiceStudioToastSavedLib: "¡Mensaje de voz guardado en la biblioteca!",
    voiceStudioToastRemoved: "Voz personalizada eliminada: voz sintética restaurada.",
    voiceStudioDefaultPrefix: "Voz para",
    voiceStudioNewMessage: "Nuevo Mensaje de Voz",
    voiceStudioFallbackTitle: "Mensaje de Voz",
    voiceStudioLinkedTo: "vinculada a",
    voiceStudioSavedAndLinked: "Voz guardada y vinculada a",
    voiceStudioOpenSettings: "Abrir Ajustes de la App",
  },
  fr: {
    appName: "Ricorda con Voce",
    onboardingTitle: "Configuration Initiale",
    selectLanguage: "Choisissez votre langue :",
    welcome: "Bienvenue sur Ricorda con Voce",
    welcomeDescription: "L'application vocale simple et bienveillante conçue pour vous aider (ou vos aînés) à organiser vos rappels et routines quotidiennes en toute sérénité.",
    stepVoiceTitle: "Rappels Empathiques",
    stepVoiceDesc: "L'application vous parle jour et nuit avec une voix calme, lente et audible. Validez d'un mot en disant 'Fait' ou d'un appui géant.",
    stepScanTitle: "Sons de l'Appareil",
    stepScanDesc: "Personnalisez vos alertes en téléchargeant vos sons favoris ou en important directement les sonneries et notifications d'origine de votre téléphone.",
    stepPharmaTitle: "Lieux & Carte",
    stepPharmaDesc: "Localisez rapidement les points d'intérêt et lieux à proximité sur la carte.",
    buttonNext: "Suivant",
    buttonBack: "Retour",
    buttonFinish: "Terminer",
    greetingMorning: "Bonjour",
    greetingAfternoon: "Bon après-midi",
    greetingEvening: "Bonsoir",
    greetingNight: "Bonne nuit",
    addMedication: "Rappel",
    speakButton: "Parler",
    speakButtonTooltip: "Créer un rappel à la voix",
    voiceDictateTrigger: "Remplir en parlant à la voix (Automatique)",
    vocalRemindersArmed: "Rappels vocaux armés",
    snoozeSilently: "Reporter en silence",
    editMedication: "Modifier le Rappel",
    medicationName: "Nom du Rappel",
    medicationNamePlaceholder: "ex : Boire un verre d'eau",
    dosageLabel: "Détail (ex : 1 fois, courte note)",
    dosagePlaceholder: "ex : 1 fois par jour",
    timeLabel: "Heure du rappel",
    instructionsLabel: "Remarques (ex : avant de sortir, prendre les clés)",
    instructionsPlaceholder: "ex : Avant de sortir, prendre les clés",
    categoryLabel: "Type de rappel",
    frequencyTypeLabel: "Fréquence du Rappel",
    frequencyWeekly: "Hebdomadaire",
    frequencyMonthly: "Mensuel",
    frequencyLabel: "Jours de répétition",
    reminderTimesLabel: "Heures du Rappel",
    addTimeSlotLabel: "Ajouter une Heure",
    monthlyDayLabel: "Jour du mois pour le rappel",
    ofEveryMonth: "de chaque mois",
    voiceTextSynthesisHint: "Texte prononcé par la synthèse vocale (si vous n'utilisez pas de voix enregistrée).",
    manageInventoryLabel: "Gérer les Réserves (Inventaire)",
    manageInventorySub: "Alerte vocale en cas d'épuisement des stocks",
    remainingCountLabel: "Quantité Restante",
    lowStockAlertLabel: "Seuil d'Alerte Minimum",
    voiceMessageLabel: "Message vocal personnalisé (optionnel)",
    voiceMessagePlaceholder: "Ex : N'oublie pas de boire de l'eau et de marcher un peu.",
    voiceOptionLabel: "Type d'Alerte Vocale",
    voiceOptionTts: "Voix Synthétique",
    voiceOptionCustom: "Ma Propre Voix 🎙️",
    voiceRecordingTitle: "Enregistrer Votre Propre Voix",
    voiceRecordingSub: "Enregistrez ce rappel avec votre voix naturelle. L'application le lira à l'heure prévue.",
    recordStartBtn: "Démarrer l'Enregistrement",
    recordStopBtn: "Arrêter et Enregistrer",
    recordingInProgress: "Enregistrement en cours...",
    recordedListenBtn: "Écouter",
    recordedDeleteBtn: "Supprimer la Voix",
    recordedSuccessBadge: "Voix Personnalisée Enregistrée",
    recordingTimeLimit: "Max 30 secondes",
    micPermissionError: "Accès au micro refusé. Vérifiez les autorisations.",
    recordedVoiceBadge: "Voix Personnelle",
    save: "Enregistrer",
    cancel: "Annuler",
    confirmTaken: "Avez-vous complété ce rappel ?",
    takenBtn: "Fait",
    pendingBtn: "CONFIRMER",
    speakAlert: "Alerte Vocale",
    testVoiceSettings: "Paramètres & Test de Voix",
    testVoiceBtn: "Écouter le Test Vocal",
    testVoiceSuccess: "Voix configurée correctement ! Comment trouvez-vous cette intonation ?",
    voiceSpeed: "Vitesse d'élocution (Recommandé lent pour les aînés)",
    voiceToneType: "Tonalité de la Voix",
    toneEmpathetic: "Chaleureuse & Empathique ✨",
    toneFirm: "Douce mais Déterminée 🔔",
    ringtoneLabel: "Sonnerie de notification",
    barcodeScanBtn: "Lecteur Code-Barres",
    barcodeSuccess: "Code scanné avec succès !",
    barcodeScanPrompt: "Placez le code face à l'objectif pour une lecture rapide.",
    findPharmacyBtn: "Trouver des Lieux Proches sur la Carte",
    pharmacyTitle: "Carte & Points d'Intérêt",
    pharmacyDistance: "Distance",
    pharmacyOpen: "Ouvert Actuellement",
    voiceStudioTitle: "Studio Vocal & Enregistreur",
    voiceStudioSubtitle: "Créez et gérez des rappels vocaux avec votre propre voix ou celle de vos proches",
    voiceStudioRecordNew: "Nouvel Enregistrement Vocal",
    voiceStudioSavedLibrary: "Bibliothèque de Voix Enregistrées",
    voiceStudioNoSaved: "Aucun message vocal enregistré. Touchez le bouton ci-dessus pour en créer un !",
    voiceStudioAssignBtn: "Attribuer au Rappel",
    voiceStudioAssignedTo: "Attribué à :",
    voiceStudioUnassigned: "Non attribué",
    voiceStudioPlay: "Écouter",
    voiceStudioStop: "Arrêter",
    voiceStudioDelete: "Supprimer",
    voiceStudioAssignModalTitle: "Lier la Voix à un Rappel",
    voiceStudioSelectMedPrompt: "Choisissez le rappel qui déclenchera ce message vocal :",
    voiceStudioAssignSuccess: "Voix associée avec succès au rappel !",
    voiceStudioRecordedCount: "Messages enregistrés",
    voiceStudioLiveTipsTitle: "Conseils pour un bon enregistrement :",
    voiceStudioTip1: "Parlez près du micro avec une voix douce, lente et claire.",
    voiceStudioTip2: "Vous pouvez faire enregistrer un message bienveillant par un proche ou un enfant.",
    historyTitle: "Historique Hebdomadaire",
    historySubtitle: "Consultez la régularité de vos rappels",
    weeklyRate: "Taux de complétion pour cette semaine",
    notesTitle: "Journal de Notes & Idées",
    notesSubtitle: "Notes, rappels libres ou pensées pour votre journée",
    notesPlaceholder: "Saisissez vos remarques ou parlez en appuyant sur le micro...",
    notesVoiceBtn: "Saisie Vocale",
    notesDoctorLabel: "Signaler comme note importante",
    androidDocsBtn: "Code Android AlarmManager (Dev)",
    noMedsToday: "Aucun rappel prévu pour aujourd'hui. Parfait !",
    allDays: "Tous les jours",
    mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat: "Sam", sun: "Dim",
    todayMedsTitle: "Rappels d'Aujourd'hui",
    todayMedsSubtitle: "Vérifiez et confirmez vos tâches",
    dailySummaryTitle: "Résumé Quotidien",
    dailySummaryTaken: "Fait",
    dailySummaryRemaining: "Restants",
    cameraRequesting: "Demande d'autorisation de la caméra...",
    cameraDenied: "Impossible d'accéder à la caméra. Assurez-vous d'avoir autorisé l'accès ou utilisez le simulateur.",
    cameraSimulateBtn: "Simuler un Scan Rapide (Hors-ligne)",
    scanningInProgress: "Numérisation...",
    barcodeMatching: "Identifié ! Saisie automatique en cours...",
    barcodeScanAgain: "Scanner à nouveau",
    vibrationSetting: "Vibration",
    themeSetting: "Couleur de Fond et Thème",
    themeColorSetting: "Couleur Thématique",
    themeBgSetting: "Style d'Arrière-plan",
    defaultTheme: "Clair",
    darkTheme: "Sombre",
    warmTheme: "Chaud",
    alwaysOnSetting: "Garder l'Écran Allumé pour les Notifications",
    voiceAnnounceSetting: "Activer les Rappels Vocaux (Synthèse Vocale)",
    privacyPolicy: "Politique de Confidentialité",
    privacyText: "Politique de Confidentialité Linéaire : L'application fonctionne exclusivement en mode local, n'a pas de bases de données distantes et ne suit pas les habitudes des utilisateurs.",
    medicalDisclaimer: "Note : Cette application est un outil d'organisation personnelle et de rappels.",
    devicePreferences: "Préférences de l'Appareil",
    listenTutorialBtn: "Écouter le Tutoriel Vocal",
    voiceTutorialText: "Bienvenue dans le tutoriel. Lorsque vous entendez l'alerte du rappel, dites 'Oui' ou 'Fait' pour confirmer. Ou appuyez sur le bouton à l'écran pour reporter l'alarme de quelques minutes.",
    toneEmpatheticActive: "Tonalité empathique activée",
    toneFirmActive: "Tonalité ferme activée",
    supportDevTitle: "Soutenir le Développeur",
    supportDevText: "Si vous trouvez cette application utile et souhaitez m'aider à la maintenir gratuite et sans publicité, vous pouvez m'offrir un café !",
    donateBtn: "Faire un don de 2 €",
    historyAndNotesHeader: "Historique & Notes",
    historyAndNotesSub: "Complétion hebdomadaire et journal de bord",
    monthlyDosageCalendar: "Calendrier Mensuel des Rappels",
    howDoYouFeel: "Comment vous sentez-vous aujourd'hui ?",
    wellbeingSubtitle: "Bien-être et résumé du jour",
    shareReportTitle: "Partager le Rapport Journalier",
    shareReportSub: "Crée un rapport d'aujourd'hui avec les rappels complétés, notes et niveau de bien-être prêt à être envoyé par WhatsApp ou SMS.",
    reportCopied: "Rapport Copié !",
    copyDailyReport: "Copier le Rapport Journalier",
    detailsFor: "Détails pour ",
    noMedsForDay: "Aucun rappel programmé pour ce jour.",
    emergencyTitle: "Urgence",
    emergencySub: "Définissez le numéro pour appeler un proche ou contact favori rapidement.",
    callNow: "Appeler Maintenant",
    noNotesYet: "Aucune note enregistrée pour l'instant.",
    perfectAdherenceMsg: "Complétion parfaite ou calcul des données mensuelles.",
    monthlyStatsSub: "Ces données incluent le calcul mensuel basé sur l'activité récente.",
    takenStatus: "Fait",
    pendingStatus: "En attente",
    activeMedsLabel: "Actifs",
    inactiveMedsLabel: "Désactivés",
    noActiveMeds: "Aucun rappel actif.",
    noInactiveMeds: "Aucun rappel désactivé.",
    searchMedPlaceholder: "Rechercher un rappel...",
    medicationManagementHeader: "Gestion des Rappels",
    medicationManagementSub: "Activer/désactiver et organiser",
    addBtn: "Ajouter",
    editBtn: "Modifier",
    deleteBtn: "Supprimer",
    timesLabel: "Horaires :",
    deleteConfirmTitle: "Supprimer ce rappel ?",
    colorAccentLabel: "Couleur du Rappel",
    tabToday: "Aujourd'hui",
    tabMeds: "Rappels",
    tabPharmacies: "Carte",
    tabVoices: "Voix",
    tabSetup: "Réglages",
    voiceStudioActiveCount: "Voix Actives",
    voiceStudioReady: "Prêt",
    voiceStudioRetryNow: "Réessayer",
    voiceStudioTapToRecord: "Touchez le micro et parlez librement",
    voiceStudioTapToRecordDesc: "Enregistrez un message chaleureux pour vous souvenir d'un rendez-vous ou d'une routine.",
    voiceStudioNamePlaceholder: "Nom du message (ex. Message de ma fille)",
    voiceStudioRecordedCompleted: "Enregistrement Terminé",
    voiceStudioPause: "Pause",
    voiceStudioReRecord: "Recommencer",
    voiceStudioSaveToLibrary: "Enregistrer dans la Bibliothèque Vocale",
    voiceStudioOrAssignDirectly: "Ou associer directement à un rappel :",
    voiceStudioAssign: "Attribuer",
    voiceStudioRemindersStatusTitle: "État Vocal de Vos Rappels",
    voiceStudioTotalCount: "au total",
    voiceStudioRecordNewForThis: "Enregistrer une Nouvelle",
    voiceStudioRemoveCustomVoice: "Supprimer la voix personnalisée",
    voiceStudioRecordForThis: "Enregistrer une Voix pour Celui-ci",
    voiceStudioUseFromLibrary: "Utiliser une Voix Enregistrée",
    voiceStudioCurrentStatus: "Actif",
    voiceStudioToastDeleted: "Message vocal supprimé.",
    voiceStudioToastSavedLib: "Message vocal enregistré dans la bibliothèque !",
    voiceStudioToastRemoved: "Voix personnalisée retirée : voix synthétique restaurée.",
    voiceStudioDefaultPrefix: "Voix pour",
    voiceStudioNewMessage: "Nouveau Message Vocal",
    voiceStudioFallbackTitle: "Message Vocal",
    voiceStudioLinkedTo: "associée à",
    voiceStudioSavedAndLinked: "Voix enregistrée et associée à",
    voiceStudioOpenSettings: "Ouvrir les Paramètres",
  },
  de: {
    appName: "Ricorda con Voce",
    onboardingTitle: "Ersteinrichtung",
    selectLanguage: "Wählen Sie Ihre Sprache:",
    welcome: "Willkommen bei Ricorda con Voce",
    welcomeDescription: "Die freundliche, einfache und sprechende App, die Ihnen (oder Ihren Angehörigen) hilft, alle Aufgaben und Routinen sicher, einfach und beruhigt zu erledigen.",
    stepVoiceTitle: "Einfühlsame Erinnerungen",
    stepVoiceDesc: "Die App spricht Tag und Nacht mit Ihnen mit einer ruhigen, langsamen und deutlichen Stimme. Sie können die Aufgabe bestätigen, indem Sie 'Erledigt' sagen oder eine große Taste drücken.",
    stepScanTitle: "Gerätetöne",
    stepScanDesc: "Personalisieren Sie Ihre Alarme, indem Sie Ihre Lieblingsdateien hochladen oder die Original-Klingeltöne und Benachrichtigungstöne Ihres Telefons direkt importieren.",
    stepPharmaTitle: "Orte und Karte",
    stepPharmaDesc: "Wenn Sie nach Orten oder Punkten von Interesse in der Nähe suchen, zeigt Ihnen eine Schnellschaltfläche die nächsten Punkte an.",
    buttonNext: "Weiter",
    buttonBack: "Zurück",
    buttonFinish: "Fertig",
    greetingMorning: "Guten Morgen",
    greetingAfternoon: "Guten Nachmittag",
    greetingEvening: "Guten Abend",
    greetingNight: "Gute Nacht",
    addMedication: "Erinnerung",
    speakButton: "Sprechen",
    speakButtonTooltip: "Erinnerung mit der Stimme erstellen",
    voiceDictateTrigger: "Per Spracheingabe ausfüllen (Automatisch)",
    vocalRemindersArmed: "Spracherinnerungen aktiv",
    snoozeSilently: "Lautlos verschieben",
    editMedication: "Erinnerung bearbeiten",
    medicationName: "Name der Erinnerung",
    medicationNamePlaceholder: "z.B.: Ein Glas Wasser trinken",
    dosageLabel: "Detail (z.B. 1x, kurze Notiz)",
    dosagePlaceholder: "z.B.: 1x täglich",
    timeLabel: "Erinnerungszeit",
    instructionsLabel: "Besondere Hinweise (z.B. vor dem Verlassen, Schlüssel mitnehmen)",
    instructionsPlaceholder: "z.B.: Vor dem Verlassen Schlüssel mitnehmen",
    categoryLabel: "Art der Erinnerung",
    frequencyTypeLabel: "Erinnerungshäufigkeit",
    frequencyWeekly: "Wöchentlich",
    frequencyMonthly: "Monatlich",
    frequencyLabel: "Wiederholungstage",
    reminderTimesLabel: "Erinnerungszeiten",
    addTimeSlotLabel: "Uhrzeit hinzufügen",
    monthlyDayLabel: "Tag des Monats für die Erinnerung",
    ofEveryMonth: "jeden Monat",
    voiceTextSynthesisHint: "Vom Sprachsynthesizer gesprochener Text (wenn keine Sprachaufnahme verwendet wird).",
    manageInventoryLabel: "Vorrat verwalten (Inventar)",
    manageInventorySub: "Sprachalarm bei niedrigem Vorrat",
    remainingCountLabel: "Verbleibende Menge",
    lowStockAlertLabel: "Mindestbestand-Warnschwelle",
    voiceMessageLabel: "Individuelle Sprachnachricht (optional)",
    voiceMessagePlaceholder: "Z.B.: Denken Sie daran, spazieren zu gehen und ein Glas Wasser zu trinken.",
    voiceOptionLabel: "Art des Sprachalarms",
    voiceOptionTts: "Synthetische Stimme",
    voiceOptionCustom: "Meine eigene Stimme 🎙️",
    voiceRecordingTitle: "Eigene Stimme aufnehmen",
    voiceRecordingSub: "Sprechen Sie diese Erinnerung mit Ihrer eigenen Stimme ein. Die App spielt sie zur Alarmzeit ab.",
    recordStartBtn: "Aufnahme starten",
    recordStopBtn: "Stoppen & Speichern",
    recordingInProgress: "Aufnahme läuft...",
    recordedListenBtn: "Anhören",
    recordedDeleteBtn: "Aufnahme löschen",
    recordedSuccessBadge: "Eigene Sprachaufnahme gespeichert",
    recordingTimeLimit: "Max. 30 Sekunden",
    micPermissionError: "Mikrofonzugriff verweigert. Bitte Berechtigungen prüfen.",
    recordedVoiceBadge: "Eigene Stimme",
    save: "Speichern",
    cancel: "Abbrechen",
    confirmTaken: "Haben Sie die Erinnerung erledigt?",
    takenBtn: "Erledigt",
    pendingBtn: "BESTÄTIGEN",
    speakAlert: "Sprachalarm",
    testVoiceSettings: "Einstellungen & Sprachtest",
    testVoiceBtn: "Sprachtest anhören",
    testVoiceSuccess: "Stimme erfolgreich konfiguriert! Wie gefällt Ihnen dieser Ton?",
    voiceSpeed: "Sprechgeschwindigkeit (Niedrig empfohlen für Senioren)",
    voiceToneType: "Stimmencharakter",
    toneEmpathetic: "Einfühlsam & Warm ✨",
    toneFirm: "Bestimmt & Beruhigend 🔔",
    ringtoneLabel: "Alarmklingelton / Benachrichtigungston",
    barcodeScanBtn: "Kamera-Scanner",
    barcodeSuccess: "Code erfolgreich gescannt!",
    barcodeScanPrompt: "Richten Sie den Code im Vorschaubereich aus, um ihn automatisch zu scannen.",
    findPharmacyBtn: "Orte in der Nähe auf der Karte finden",
    pharmacyTitle: "Karte & Sehenswürdigkeiten",
    pharmacyDistance: "Entfernung",
    pharmacyOpen: "Jetzt geöffnet",
    voiceStudioTitle: "Sprachstudio & Rekorder",
    voiceStudioSubtitle: "Erstellen und verwalten Sie Erinnerungen mit Ihrer echten Stimme oder der Ihrer Angehörigen",
    voiceStudioRecordNew: "Neue Sprachaufnahme",
    voiceStudioSavedLibrary: "Bibliothek gespeicherter Stimmen",
    voiceStudioNoSaved: "Noch keine Sprachnachrichten gespeichert. Tippen Sie oben, um eine aufzunehmen!",
    voiceStudioAssignBtn: "An Erinnerung zuweisen",
    voiceStudioAssignedTo: "Zugewiesen an:",
    voiceStudioUnassigned: "Nicht zugewiesen",
    voiceStudioPlay: "Anhören",
    voiceStudioStop: "Stoppen",
    voiceStudioDelete: "Löschen",
    voiceStudioAssignModalTitle: "Stimme mit Erinnerung verknüpfen",
    voiceStudioSelectMedPrompt: "Wählen Sie die Erinnerung aus, die diese Nachricht abspielen soll:",
    voiceStudioAssignSuccess: "Sprachnachricht erfolgreich zugewiesen!",
    voiceStudioRecordedCount: "Gespeicherte Nachrichten",
    voiceStudioLiveTipsTitle: "Tipps für die beste Aufnahme:",
    voiceStudioTip1: "Sprechen Sie nah am Mikrofon mit ruhiger, deutlicher Stimme.",
    voiceStudioTip2: "Lassen Sie liebevolle Erinnerungen von Kindern oder Angehörigen einsprechen.",
    historyTitle: "Wöchentlicher Verlauf",
    historySubtitle: "Verfolgen Sie die Regelmäßigkeit Ihrer Erinnerungen",
    weeklyRate: "Erledigungsquote in dieser Woche",
    notesTitle: "Notizen & Tagebuch",
    notesSubtitle: "Schreiben Sie Notizen, Ideen oder wichtige Erinnerungen für Ihren Tag auf",
    notesPlaceholder: "Schreiben Sie hier oder tippen Sie auf das Mikrofon, um zu diktieren...",
    notesVoiceBtn: "Spracheingabe",
    notesDoctorLabel: "Als wichtige Notiz markieren",
    androidDocsBtn: "Android AlarmManager Code (Dev)",
    noMedsToday: "Keine Erinnerungen für heute geplant. Großartig!",
    allDays: "Jeden Tag",
    mon: "Mon", tue: "Die", wed: "Mit", thu: "Don", fri: "Fre", sat: "Sam", sun: "Son",
    todayMedsTitle: "Heutige Erinnerungen",
    todayMedsSubtitle: "Überprüfen und bestätigen Sie Ihre Aufgaben",
    dailySummaryTitle: "Tägliche Zusammenfassung",
    dailySummaryTaken: "Erledigt",
    dailySummaryRemaining: "Verbleibend",
    cameraRequesting: "Kamera-Freigabe wird angefordert...",
    cameraDenied: "Zugriff auf die Kamera nicht möglich. Stellen Sie sicher, dass Sie den Zugriff erlaubt haben oder verwenden Sie den Simulator.",
    cameraSimulateBtn: "Schnellen Scan simulieren (Offline)",
    scanningInProgress: "Scannen...",
    barcodeMatching: "Treffer gefunden! Details werden automatisch ausgefüllt...",
    barcodeScanAgain: "Erneut scannen",
    vibrationSetting: "Vibration",
    themeSetting: "Hintergrundfarbe & Design",
    themeColorSetting: "Design-Akzentfarbe",
    themeBgSetting: "Hintergrundstil",
    defaultTheme: "Hell",
    darkTheme: "Dunkel",
    warmTheme: "Warm",
    alwaysOnSetting: "Bildschirm bei Benachrichtigungen eingeschaltet lassen",
    voiceAnnounceSetting: "Sprachankündigungen aktivieren (Text-to-Speech)",
    privacyPolicy: "Datenschutzerklärung",
    privacyText: "Lineare Datenschutzerklärung: Die App läuft ausschließlich lokal, besitzt keine Online-Datenbanken und verfolgt die Gewohnheiten des Benutzers in keiner Weise.",
    medicalDisclaimer: "Hinweis: Diese App dient ausschließlich als persönliches Organisations- und Erinnerungswerkzeug.",
    devicePreferences: "Geräteeinstellungen",
    listenTutorialBtn: "Sprachanleitung anhören",
    voiceTutorialText: "Willkommen beim Tutorial. Wenn Sie den Alarm hören, sagen Sie 'Ja' oder 'Erledigt', um die Erinnerung zu bestätigen. Oder tippen Sie auf die Taste auf dem Bildschirm, um den Alarm zu verschieben.",
    toneEmpatheticActive: "Einfühlsamer Ton aktiviert",
    toneFirmActive: "Bestimmter Ton aktiviert",
    supportDevTitle: "Entwickler unterstützen",
    supportDevText: "Wenn Sie diese App nützlich finden und mir helfen möchten, sie kostenlos und werbefrei zu halten, können Sie mir einen Kaffee ausgeben!",
    donateBtn: "2 € spenden",
    historyAndNotesHeader: "Verlauf & Notizen",
    historyAndNotesSub: "Wöchentliche Erledigung und Notiztagebuch",
    monthlyDosageCalendar: "Monatlicher Erinnerungskalender",
    howDoYouFeel: "Wie fühlen Sie sich heute?",
    wellbeingSubtitle: "Wohlbefinden & Tagesbericht",
    shareReportTitle: "Tagesbericht teilen",
    shareReportSub: "Erstellt einen heutigen Bericht mit erledigten Erinnerungen, Notizen und Wohlbefinden zum Senden per WhatsApp oder SMS.",
    reportCopied: "Bericht kopiert!",
    copyDailyReport: "Tagesbericht kopieren",
    detailsFor: "Details für ",
    noMedsForDay: "Für diesen Tag sind keine Erinnerungen geplant.",
    emergencyTitle: "Notfall",
    emergencySub: "Legen Sie die Nummer fest, um im Notfall Angehörige oder Favoriten schnell anzurufen.",
    callNow: "Jetzt Anrufen",
    noNotesYet: "Noch keine Notizen im Tagebuch.",
    perfectAdherenceMsg: "Perfekte Erledigung oder Berechnung der Monatsdaten.",
    monthlyStatsSub: "Diese Daten enthalten die monatliche Berechnung basierend auf der letzten Aktivität.",
    takenStatus: "Erledigt",
    pendingStatus: "Offen",
    activeMedsLabel: "Aktiv",
    inactiveMedsLabel: "Inaktiv",
    noActiveMeds: "Keine aktiven Erinnerungen.",
    noInactiveMeds: "Keine inaktiven Erinnerungen.",
    searchMedPlaceholder: "Erinnerung suchen...",
    medicationManagementHeader: "Erinnerungsverwaltung",
    medicationManagementSub: "Aktivieren/deaktivieren und organisieren",
    addBtn: "Neu",
    editBtn: "Bearbeiten",
    deleteBtn: "Löschen",
    timesLabel: "Zeiten:",
    deleteConfirmTitle: "Diese Erinnerung löschen?",
    colorAccentLabel: "Farbe der Erinnerung",
    tabToday: "Heute",
    tabMeds: "Erinnerungen",
    tabPharmacies: "Karte",
    tabVoices: "Stimmen",
    tabSetup: "Einstellungen",
    voiceStudioActiveCount: "Aktive Stimmen",
    voiceStudioReady: "Bereit",
    voiceStudioRetryNow: "Jetzt wiederholen",
    voiceStudioTapToRecord: "Tippen Sie auf das Mikrofon und sprechen Sie",
    voiceStudioTapToRecordDesc: "Nehmen Sie eine herzliche Nachricht für Termine oder Alltagsroutinen auf.",
    voiceStudioNamePlaceholder: "Titel der Nachricht (z.B. Morgengruß)",
    voiceStudioRecordedCompleted: "Aufnahme abgeschlossen",
    voiceStudioPause: "Pause",
    voiceStudioReRecord: "Wiederholen",
    voiceStudioSaveToLibrary: "In der Stimmenbibliothek speichern",
    voiceStudioOrAssignDirectly: "Oder direkt einer Erinnerung zuweisen:",
    voiceStudioAssign: "Zuweisen",
    voiceStudioRemindersStatusTitle: "Sprachstatus Ihrer Erinnerungen",
    voiceStudioTotalCount: "gesamt",
    voiceStudioRecordNewForThis: "Neu aufnehmen",
    voiceStudioRemoveCustomVoice: "Eigene Stimme entfernen",
    voiceStudioRecordForThis: "Stimme hierfür aufnehmen",
    voiceStudioUseFromLibrary: "Gespeicherte Stimme nutzen",
    voiceStudioCurrentStatus: "Aktiv",
    voiceStudioToastDeleted: "Sprachnachricht gelöscht.",
    voiceStudioToastSavedLib: "Sprachnachricht in der Bibliothek gespeichert!",
    voiceStudioToastRemoved: "Eigene Stimme entfernt: Standardsprache wiederhergestellt.",
    voiceStudioDefaultPrefix: "Stimme für",
    voiceStudioNewMessage: "Neue Sprachnachricht",
    voiceStudioFallbackTitle: "Sprachnachricht",
    voiceStudioLinkedTo: "verknüpft mit",
    voiceStudioSavedAndLinked: "Stimme gespeichert und verknüpft mit",
    voiceStudioOpenSettings: "App-Einstellungen öffnen",
  }
};
