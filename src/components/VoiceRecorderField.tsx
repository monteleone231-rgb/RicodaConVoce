import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { LanguageCode, TRANSLATIONS } from '../types';

interface VoiceRecorderFieldProps {
  customVoiceUri?: string;
  onChange: (uri: string | undefined) => void;
  lang: LanguageCode;
  t: typeof TRANSLATIONS[LanguageCode];
}

export const VoiceRecorderField: React.FC<VoiceRecorderFieldProps> = ({
  customVoiceUri,
  onChange,
  lang,
  t
}) => {
  const [mode, setMode] = useState<'tts' | 'custom'>(customVoiceUri ? 'custom' : 'tts');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const recordingTypeRef = useRef<'native' | 'web'>('web');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Sync mode if customVoiceUri prop changes
  useEffect(() => {
    if (customVoiceUri) {
      setMode('custom');
    }
  }, [customVoiceUri]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
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

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setErrorMessage('');
    audioChunksRef.current = [];

    const win = window as any;
    // 1. If running inside Native Android App, prefer native MediaRecorder for 100% reliable hardware mic recording
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

    // 2. Web / Browser fallback using HTML5 getUserMedia & MediaRecorder
    recordingTypeRef.current = 'web';
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage(t.micPermissionError);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      // Find supported mimeType
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
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          options = { mimeType: 'audio/ogg;codecs=opus' };
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
        // Stop all audio stream tracks
        stream.getTracks().forEach((track) => track.stop());

        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        if (audioBlob.size > 0) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64DataUrl = reader.result as string;
            onChange(base64DataUrl);
          };
          reader.readAsDataURL(audioBlob);
        }
      };

      mediaRecorder.start(200); // chunk every 200ms
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start duration counter (max 30 seconds)
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
          onChange(base64Uri);
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

  const playRecordedAudio = () => {
    if (!customVoiceUri) return;

    if (isPlaying && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    try {
      const audio = new Audio(customVoiceUri);
      audioPreviewRef.current = audio;
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = (e) => {
        console.error('Playback error:', e);
        setIsPlaying(false);
      };

      audio.play().catch((err) => {
        console.error('Audio play failed:', err);
        setIsPlaying(false);
      });
    } catch (err) {
      console.error('Failed to create audio preview:', err);
      setIsPlaying(false);
    }
  };

  const handleDeleteVoice = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    setIsPlaying(false);
    onChange(undefined);
  };

  return (
    <div id="voice-recorder-field" className="space-y-2.5 bg-[#FCFAF7] p-3.5 rounded-2xl border border-gray-200 text-left">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold text-gray-700 uppercase flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-[#E58045]" />
            <span>{t.voiceOptionLabel}</span>
          </span>
          <span className="text-3xs text-gray-400 block font-semibold mt-0.5">
            {mode === 'custom' ? t.voiceRecordingSub : t.stepVoiceTitle}
          </span>
        </div>
        {customVoiceUri && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>{t.recordedVoiceBadge}</span>
          </span>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          id="voice-mode-tts-btn"
          onClick={() => {
            setMode('tts');
          }}
          className={`py-2 px-2.5 rounded-xl font-bold text-xs border-2 transition-all flex items-center justify-center gap-1.5 ${
            mode === 'tts'
              ? 'bg-[#E58045] text-white border-[#E58045] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="truncate">{t.voiceOptionTts}</span>
        </button>

        <button
          type="button"
          id="voice-mode-custom-btn"
          onClick={() => {
            setMode('custom');
          }}
          className={`py-2 px-2.5 rounded-xl font-bold text-xs border-2 transition-all flex items-center justify-center gap-1.5 ${
            mode === 'custom'
              ? 'bg-[#E58045] text-white border-[#E58045] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="truncate">{t.voiceOptionCustom}</span>
        </button>
      </div>

      {/* Mode: Custom Voice Recording Panel */}
      {mode === 'custom' && (
        <div className="pt-2 space-y-3">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-2">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-3xs transition-all cursor-pointer"
                >
                  {t.voiceStudioRetryNow}
                </button>
                {(window as any).Android && typeof (window as any).Android.openAppSettings === 'function' && (
                  <button
                    type="button"
                    onClick={() => (window as any).Android.openAppSettings()}
                    className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg font-bold text-3xs transition-all cursor-pointer"
                  >
                    {t.voiceStudioOpenSettings}
                  </button>
                )}
              </div>
            </div>
          )}

          {!customVoiceUri && !isRecording && (
            <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-[#E58045]/40 text-center space-y-3">
              <div className="w-14 h-14 bg-[#E58045]/10 rounded-full flex items-center justify-center mx-auto text-[#E58045]">
                <Mic className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-gray-800">{t.voiceRecordingTitle}</h4>
                <p className="text-3xs text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                  {t.voiceStudioTapToRecordDesc}
                </p>
              </div>

              <button
                type="button"
                id="start-voice-recording-btn"
                onClick={startRecording}
                className="py-3 px-5 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                <span>{t.recordStartBtn}</span>
              </button>

              <span className="text-[10px] text-gray-400 font-semibold block">
                ⏱️ {t.recordingTimeLimit}
              </span>
            </div>
          )}

          {/* Active Recording In-Progress State */}
          {isRecording && (
            <div className="p-4 rounded-2xl bg-red-50/80 border-2 border-red-400 text-center space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-red-600 font-black text-sm">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                <span>{t.recordingInProgress}</span>
              </div>

              {/* Live soundwave animation */}
              <div className="flex items-end justify-center gap-1.5 h-10 px-4 py-1 bg-white/70 rounded-xl border border-red-200 max-w-[200px] mx-auto">
                {['h-3', 'h-7', 'h-9', 'h-5', 'h-8', 'h-10', 'h-4', 'h-9', 'h-6', 'h-8', 'h-3'].map((height, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full bg-red-500 ${height} animate-pulse`}
                    style={{ animationDelay: `${(i * 100) % 600}ms` }}
                  />
                ))}
              </div>

              {/* Live Counter */}
              <div className="font-mono text-2xl font-black text-red-600">
                {formatTimer(recordingSeconds)} <span className="text-xs text-red-400 font-normal">/ 00:30</span>
              </div>

              <button
                type="button"
                id="stop-voice-recording-btn"
                onClick={stopRecording}
                className="py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-red-300 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>{t.recordStopBtn}</span>
              </button>
            </div>
          )}

          {/* Recorded Voice Ready State */}
          {customVoiceUri && !isRecording && (
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">{t.recordedSuccessBadge}</span>
                    <span className="text-3xs text-emerald-700 font-bold block">{t.voiceStudioReady}</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="delete-voice-btn"
                  onClick={handleDeleteVoice}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                  title={t.recordedDeleteBtn}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons for recorded voice */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  id="play-recorded-voice-btn"
                  onClick={playRecordedAudio}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                    isPlaying
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? t.voiceStudioPause : t.recordedListenBtn}</span>
                </button>

                <button
                  type="button"
                  id="rerecord-voice-btn"
                  onClick={startRecording}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.voiceStudioReRecord}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
