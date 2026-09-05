import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  RotateCcw,
  Sparkles,
  Volume2,
  Check,
  Plus,
  Link,
  Info,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { Medication, LanguageCode, TRANSLATIONS, SavedVoiceItem } from '../types';

interface VoiceStudioProps {
  lang: LanguageCode;
  medications: Medication[];
  onUpdateMedicationVoice: (medId: string, customVoiceUri: string | undefined) => void;
  themeColorClass?: string;
  themeTextClass?: string;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  lang,
  medications,
  onUpdateMedicationVoice,
  themeColorClass = 'bg-[#2563EB]',
  themeTextClass = 'text-[#2563EB]'
}) => {
  const t = TRANSLATIONS[lang];

  // Saved voices storage state
  const [savedVoices, setSavedVoices] = useState<SavedVoiceItem[]>(() => {
    try {
      const stored = localStorage.getItem('ricordaconvoce_saved_voices') ?? localStorage.getItem('medivoce_saved_voices');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading saved voices:', e);
    }
    return [];
  });

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedDataUrl, setRecordedDataUrl] = useState<string | null>(null);
  const [newVoiceTitle, setNewVoiceTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Audio Playback state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isNewVoicePlaying, setIsNewVoicePlaying] = useState<boolean>(false);

  // Assign Modal state
  const [assignModalVoice, setAssignModalVoice] = useState<SavedVoiceItem | null>(null);
  const [targetMedIdForDirectRecord, setTargetMedIdForDirectRecord] = useState<string | null>(null);

  // Refs for recording & audio
  const recordingTypeRef = useRef<'native' | 'web'>('web');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Save to localStorage when savedVoices changes
  useEffect(() => {
    try {
      localStorage.setItem('ricordaconvoce_saved_voices', JSON.stringify(savedVoices));
    } catch (e) {
      console.error('Error persisting saved voices:', e);
    }
  }, [savedVoices]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (_e) {}
      }
      const win = window as any;
      if (win.Android && typeof win.Android.cancelNativeVoiceRecording === 'function') {
        try {
          win.Android.cancelNativeVoiceRecording();
        } catch (_e) {}
      }
    };
  }, []);

  // Clear toast after 3.5s
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const stopAllAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    const win = window as any;
    if (win.Android && typeof win.Android.stopCustomVoice === 'function') {
      try {
        win.Android.stopCustomVoice();
      } catch (_e) {}
    }
    setPlayingVoiceId(null);
    setIsNewVoicePlaying(false);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startRecording = async (targetMedId?: string) => {
    stopAllAudio();
    setErrorMessage('');
    setRecordedDataUrl(null);
    audioChunksRef.current = [];
    if (targetMedId) {
      setTargetMedIdForDirectRecord(targetMedId);
      const targetMed = medications.find(m => m.id === targetMedId);
      if (targetMed) {
        setNewVoiceTitle(`${t.voiceStudioDefaultPrefix} ${targetMed.name}`);
      }
    } else if (!newVoiceTitle) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setNewVoiceTitle(`${t.voiceStudioNewMessage} (${timeStr})`);
    }

    const win = window as any;
    // Native Android Bridge
    if (win.Android && typeof win.Android.startNativeVoiceRecording === 'function') {
      try {
        if (typeof win.Android.hasRecordAudioPermission === 'function' && !win.Android.hasRecordAudioPermission()) {
          win.Android.requestRecordAudioPermission();
          setErrorMessage(t.micPermissionError);
          return;
        }

        const success = win.Android.startNativeVoiceRecording();
        if (success) {
          recordingTypeRef.current = 'native';
          setIsRecording(true);
          setRecordingSeconds(0);

          timerIntervalRef.current = setInterval(() => {
            setRecordingSeconds((prev) => {
              if (prev >= 29) {
                stopRecording();
                return 30;
              }
              return prev + 1;
            });
          }, 1000);
          return;
        }
      } catch (err) {
        console.warn('Native recording start failed, falling back to Web API:', err);
      }
    }

    // Web MediaRecorder Fallback
    recordingTypeRef.current = 'web';
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage(t.micPermissionError);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          options = { mimeType: 'audio/aac' };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        if (audioBlob.size > 0) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64DataUrl = reader.result as string;
            setRecordedDataUrl(base64DataUrl);
          };
          reader.readAsDataURL(audioBlob);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      setErrorMessage(t.micPermissionError);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const win = window as any;
    if (recordingTypeRef.current === 'native' && win.Android && typeof win.Android.stopNativeVoiceRecording === 'function') {
      try {
        const base64Uri = win.Android.stopNativeVoiceRecording();
        if (base64Uri && base64Uri.length > 0) {
          setRecordedDataUrl(base64Uri);
        }
      } catch (err) {
        console.error('Error stopping native recording:', err);
      }
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping media recorder:', err);
      }
    }
    setIsRecording(false);
  };

  const playAudio = (dataUrl: string, voiceId?: string) => {
    if (playingVoiceId === voiceId || (voiceId === undefined && isNewVoicePlaying)) {
      stopAllAudio();
      return;
    }

    stopAllAudio();

    const win = window as any;
    // Native bridge playback test
    if (win.Android && typeof win.Android.playCustomVoice === 'function') {
      try {
        win.Android.playCustomVoice(dataUrl);
        if (voiceId) {
          setPlayingVoiceId(voiceId);
        } else {
          setIsNewVoicePlaying(true);
        }
        return;
      } catch (e) {
        console.warn('Native playback error, falling back to Web Audio:', e);
      }
    }

    // HTML5 Audio
    try {
      const audio = new Audio(dataUrl);
      activeAudioRef.current = audio;

      if (voiceId) {
        setPlayingVoiceId(voiceId);
      } else {
        setIsNewVoicePlaying(true);
      }

      audio.onended = () => {
        stopAllAudio();
      };

      audio.onerror = () => {
        stopAllAudio();
      };

      audio.play().catch((err) => {
        console.error('Playback failed:', err);
        stopAllAudio();
      });
    } catch (e) {
      console.error('Failed to create Audio instance:', e);
      stopAllAudio();
    }
  };

  const handleSaveToLibrary = (andAssignToMedId?: string) => {
    if (!recordedDataUrl) return;

    const targetId = andAssignToMedId || targetMedIdForDirectRecord;
    const title = newVoiceTitle.trim() || `${t.voiceStudioFallbackTitle} #${savedVoices.length + 1}`;
    const newVoiceItem: SavedVoiceItem = {
      id: `voice_${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
      durationSec: recordingSeconds > 0 ? recordingSeconds : 5,
      dataUrl: recordedDataUrl,
      assignedMedId: targetId || undefined
    };

    setSavedVoices(prev => [newVoiceItem, ...prev]);

    if (targetId) {
      onUpdateMedicationVoice(targetId, recordedDataUrl);
      const med = medications.find(m => m.id === targetId);
      setSuccessToast(`${t.voiceStudioSavedAndLinked} "${med?.name || ''}"!`);
    } else {
      setSuccessToast(t.voiceStudioToastSavedLib);
    }

    // Reset recording draft
    setRecordedDataUrl(null);
    setNewVoiceTitle('');
    setRecordingSeconds(0);
    setTargetMedIdForDirectRecord(null);
  };

  const handleAssignVoiceToMedication = (voice: SavedVoiceItem, medId: string) => {
    // 1. Update medication state & native bridge
    onUpdateMedicationVoice(medId, voice.dataUrl);

    // 2. Update assignedMedId in savedVoices
    setSavedVoices(prev =>
      prev.map(v => (v.id === voice.id ? { ...v, assignedMedId: medId } : v))
    );

    setAssignModalVoice(null);
    const med = medications.find(m => m.id === medId);
    setSuccessToast(`"${voice.title}" ${t.voiceStudioLinkedTo} "${med?.name || ''}"!`);
  };

  const handleRemoveVoiceFromMedication = (medId: string) => {
    onUpdateMedicationVoice(medId, undefined);
    setSavedVoices(prev =>
      prev.map(v => (v.assignedMedId === medId ? { ...v, assignedMedId: undefined } : v))
    );
    setSuccessToast(t.voiceStudioToastRemoved);
  };

  const handleDeleteSavedVoice = (voiceId: string) => {
    stopAllAudio();
    const voiceToDelete = savedVoices.find(v => v.id === voiceId);
    if (voiceToDelete && voiceToDelete.assignedMedId) {
      onUpdateMedicationVoice(voiceToDelete.assignedMedId, undefined);
    }
    setSavedVoices(prev => prev.filter(v => v.id !== voiceId));
    setSuccessToast(t.voiceStudioToastDeleted);
  };

  const activeVocalRemindersCount = medications.filter(m => !!m.customVoiceUri).length;

  return (
    <div id="voice-studio-container" className="space-y-6 pb-8 text-left animate-fade-in">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-3 border border-emerald-500"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="text-xs font-black flex-1">{successToast}</span>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="text-white/80 hover:text-white p-1"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-blue-500/10 pointer-events-none blur-xl" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/10">
                <Mic className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black tracking-tight">{t.voiceStudioTitle}</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white font-extrabold text-[11px] border border-white/10">
              🎙️ {activeVocalRemindersCount} {t.voiceStudioActiveCount}
            </span>
          </div>
          <p className="text-xs text-blue-100/90 font-medium leading-relaxed max-w-md">
            {t.voiceStudioSubtitle}
          </p>
        </div>
      </div>

      {/* SECTION 1: STUDIO RECORDER (REGISTRA ORA) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-800">{t.voiceStudioRecordNew}</h3>
          </div>
          {recordedDataUrl && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              ✓ {t.voiceStudioReady}
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-2">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => startRecording()}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all"
              >
                {t.voiceStudioRetryNow}
              </button>
            </div>
          </div>
        )}

        {/* State A: Idle - Ready to record */}
        {!isRecording && !recordedDataUrl && (
          <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-blue-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Mic className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-800">
                {t.voiceStudioTapToRecord}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {t.voiceStudioTapToRecordDesc}
              </p>
            </div>

            {/* Optional Title input */}
            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={newVoiceTitle}
                onChange={(e) => setNewVoiceTitle(e.target.value)}
                placeholder={t.voiceStudioNamePlaceholder}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
              />
            </div>

            <button
              type="button"
              id="studio-start-record-btn"
              onClick={() => startRecording()}
              className="py-3.5 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-sm shadow-lg shadow-rose-200 transition-all inline-flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full bg-white animate-ping" />
              <span>{t.recordStartBtn}</span>
            </button>

            <span className="text-[11px] text-slate-400 font-semibold block">
              ⏱️ {t.recordingTimeLimit}
            </span>
          </div>
        )}

        {/* State B: Active Recording in Progress */}
        {isRecording && (
          <div className="p-6 rounded-3xl bg-rose-50/90 border-2 border-rose-400 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-rose-600 font-black text-sm">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping" />
              <span>{t.recordingInProgress}</span>
            </div>

            {/* Dynamic Soundwave */}
            <div className="flex items-end justify-center gap-1.5 h-12 px-5 py-1.5 bg-white/80 rounded-2xl border border-rose-200 max-w-[220px] mx-auto">
              {['h-4', 'h-8', 'h-11', 'h-6', 'h-10', 'h-12', 'h-5', 'h-11', 'h-7', 'h-9', 'h-4'].map((h, i) => (
                <div
                  key={i}
                  className={`w-2 rounded-full bg-rose-500 ${h} animate-pulse`}
                  style={{ animationDelay: `${(i * 120) % 700}ms` }}
                />
              ))}
            </div>

            {/* Timer Counter */}
            <div className="font-mono text-3xl font-black text-rose-600">
              {formatTimer(recordingSeconds)} <span className="text-sm text-rose-400 font-normal">/ 00:30</span>
            </div>

            <button
              type="button"
              id="studio-stop-record-btn"
              onClick={stopRecording}
              className="py-3.5 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-sm shadow-xl shadow-rose-300 transition-all inline-flex items-center gap-2.5 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>{t.recordStopBtn}</span>
            </button>
          </div>
        )}

        {/* State C: Recording Finished & Preview */}
        {recordedDataUrl && !isRecording && (
          <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    {newVoiceTitle || t.voiceStudioRecordedCompleted}
                  </h4>
                  <span className="text-xs text-emerald-700 font-bold">
                    ⏱️ {formatTimer(recordingSeconds > 0 ? recordingSeconds : 5)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopAllAudio();
                  setRecordedDataUrl(null);
                }}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100/60 rounded-xl transition-all"
                title={t.recordedDeleteBtn}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => playAudio(recordedDataUrl)}
                className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isNewVoicePlaying
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200'
                }`}
              >
                {isNewVoicePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isNewVoicePlaying ? t.voiceStudioPause : t.recordedListenBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => startRecording()}
                className="py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.voiceStudioReRecord}</span>
              </button>
            </div>

            {/* Save Buttons */}
            <div className="space-y-2 pt-2 border-t border-emerald-200/60">
              <button
                type="button"
                onClick={() => handleSaveToLibrary()}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs shadow-md shadow-blue-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" strokeWidth={3} />
                <span>{t.voiceStudioSaveToLibrary}</span>
              </button>

              {medications.length > 0 && (
                <div className="pt-1">
                  <label className="text-[11px] font-extrabold text-slate-600 block mb-1.5">
                    {t.voiceStudioOrAssignDirectly}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {medications.map(med => (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => handleSaveToLibrary(med.id)}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-left flex items-center justify-between transition-all group"
                      >
                        <div className="truncate pr-2">
                          <span className="text-xs font-black text-slate-800 block truncate">{med.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">⏰ {med.time}</span>
                        </div>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2 py-1 rounded-lg transition-all">
                          {t.voiceStudioAssign}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PROMEMORIA & STATO VOCE (TUTTI I PROMEMORIA) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Layers className="w-5 h-5 text-blue-600 shrink-0" />
            <h3 className="text-base font-black text-slate-800 leading-tight">
              {t.voiceStudioRemindersStatusTitle}
            </h3>
          </div>
          <span className="text-xs font-black text-slate-400 shrink-0 mr-2 sm:mr-3 whitespace-nowrap">
            {medications.length} {t.voiceStudioTotalCount}
          </span>
        </div>

        {medications.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 text-center text-xs text-slate-400 italic">
            {t.noMedsToday}
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => {
              const hasCustomVoice = !!med.customVoiceUri;
              const isPlayingThisMed = playingVoiceId === `med_${med.id}`;

              return (
                <div
                  key={med.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    hasCustomVoice
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Top Bar: Badge in alto a sinistra + Orario sveglia in alto a destra */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {hasCustomVoice ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{t.recordedVoiceBadge}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-200/80 text-slate-700 shrink-0">
                        <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{t.voiceOptionTts}</span>
                      </span>
                    )}

                    <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shrink-0 shadow-2xs">
                      ⏰ {med.time}
                    </span>
                  </div>

                  {/* Testo Promemoria a piena larghezza: nessun restringimento verticale */}
                  <div className="space-y-1 text-left">
                    <h4 className="text-sm font-black text-slate-800 break-words leading-snug">
                      {med.name}
                    </h4>
                    {(med.dosage || med.notes) && (
                      <p className="text-xs text-slate-500 font-medium break-words">
                        {med.dosage || med.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions for this reminder */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-200/70">
                    {hasCustomVoice ? (
                      <>
                        <button
                          type="button"
                          onClick={() => playAudio(med.customVoiceUri!, `med_${med.id}`)}
                          className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all ${
                            isPlayingThisMed
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isPlayingThisMed ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isPlayingThisMed ? t.voiceStudioPause : t.voiceStudioPlay}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => startRecording(med.id)}
                          className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.voiceStudioRecordNewForThis}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveVoiceFromMedication(med.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all ml-auto"
                          title={t.voiceStudioRemoveCustomVoice}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startRecording(med.id)}
                          className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{t.voiceStudioRecordForThis}</span>
                        </button>

                        {savedVoices.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              // Assign first unassigned voice or open assign modal
                              if (savedVoices.length === 1) {
                                handleAssignVoiceToMedication(savedVoices[0], med.id);
                              } else {
                                setAssignModalVoice(savedVoices[0]);
                              }
                            }}
                            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Link className="w-3.5 h-3.5 text-blue-600" />
                            <span>{t.voiceStudioUseFromLibrary}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: ARCHIVIO VOCI SALVATE (SAVED VOICES LIBRARY) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Volume2 className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="text-base font-black text-slate-800 truncate">{t.voiceStudioSavedLibrary}</h3>
          </div>
          <span className="text-xs font-black text-slate-400 shrink-0 mr-2 sm:mr-3 whitespace-nowrap">
            {savedVoices.length} {t.voiceStudioRecordedCount}
          </span>
        </div>

        {savedVoices.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
            <Mic className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
              {t.voiceStudioNoSaved}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedVoices.map((voice) => {
              const isPlayingThis = playingVoiceId === voice.id;
              const assignedMed = medications.find(m => m.id === voice.assignedMedId);

              return (
                <div
                  key={voice.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-black text-slate-800 truncate">{voice.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                        <span>⏱️ {formatTimer(voice.durationSec)}</span>
                        <span>•</span>
                        <span>{new Date(voice.createdAt).toLocaleDateString(lang)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSavedVoice(voice.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title={t.voiceStudioDelete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Assigned Status */}
                  <div className="text-[11px] font-bold">
                    {assignedMed ? (
                      <span className="text-emerald-700 flex items-center gap-1 truncate">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t.voiceStudioAssignedTo} {assignedMed.name}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium italic">
                        {t.voiceStudioUnassigned}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => playAudio(voice.dataUrl, voice.id)}
                      className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isPlayingThis
                          ? 'bg-amber-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      }`}
                    >
                      {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlayingThis ? t.voiceStudioPause : t.voiceStudioPlay}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAssignModalVoice(voice)}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Link className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.voiceStudioAssignBtn}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: EMPATHETIC TIPS CARD */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-2 text-slate-700">
        <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-wider">
          <Info className="w-4 h-4 text-amber-600" />
          <span>{t.voiceStudioLiveTipsTitle}</span>
        </div>
        <ul className="text-xs space-y-1.5 font-medium pl-1 leading-relaxed">
          <li className="flex items-start gap-1.5">
            <span className="text-amber-600 font-bold">•</span>
            <span>{t.voiceStudioTip1}</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-amber-600 font-bold">•</span>
            <span>{t.voiceStudioTip2}</span>
          </li>
        </ul>
      </div>

      {/* ASSIGN MODAL OVERLAY */}
      <AnimatePresence>
        {assignModalVoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Link className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-800">
                    {t.voiceStudioAssignModalTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignModalVoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-black text-slate-700 block">{assignModalVoice.title}</span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  ⏱️ {formatTimer(assignModalVoice.durationSec)}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 block">
                  {t.voiceStudioSelectMedPrompt}
                </label>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {medications.map((med) => {
                    const isAlreadyAssigned = assignModalVoice.assignedMedId === med.id;
                    return (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => handleAssignVoiceToMedication(assignModalVoice, med.id)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isAlreadyAssigned
                            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400'
                            : 'bg-white hover:bg-blue-50 border-slate-200'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="text-xs font-black text-slate-800 block truncate">{med.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">⏰ {med.time}</span>
                        </div>
                        {isAlreadyAssigned ? (
                          <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-black text-[10px]">
                            {t.voiceStudioCurrentStatus}
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAssignModalVoice(null)}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-all"
              >
                {t.cancel}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
