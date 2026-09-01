/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCode, Medication } from './types';

// Web Audio API Audio synthesizer to generate alarm tones without external static file requests.
let audioCtx: AudioContext | null = null;

export function playAlarmTone(toneType: string) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Check if it's an imported custom sound from localStorage
    if (toneType && toneType.startsWith('custom_')) {
      const soundId = toneType.replace('custom_', '');
      
      // Preset check
      if (soundId === 'preset_arpeggio') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = audioCtx!.createOscillator();
          const gain = audioCtx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0.6, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx!.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.4);
        });
        return;
      }
      
      if (soundId === 'preset_marimba') {
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, idx) => {
          const osc = audioCtx!.createOscillator();
          const gain = audioCtx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.7, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx!.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.3);
        });
        return;
      }

      if (soundId === 'preset_trillo') {
        for (let i = 0; i < 4; i++) {
          const osc = audioCtx!.createOscillator();
          const gain = audioCtx!.createGain();
          osc.type = 'sine';
          const freq = i % 2 === 0 ? 880 : 987.77; // A5 vs B5 rapid alternation
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.5, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.12);
          osc.connect(gain);
          gain.connect(audioCtx!.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.12);
        }
        return;
      }

      const savedSounds = localStorage.getItem('medivoce_custom_sounds');
      if (savedSounds) {
        try {
          const parsed = JSON.parse(savedSounds);
          const match = parsed.find((s: any) => s.id === soundId);
          if (match && match.dataUrl) {
            const android = (window as any).Android;
            if (android && android.playDeviceSound && (match.dataUrl.startsWith('content://') || match.dataUrl.startsWith('device_uri_'))) {
              android.playDeviceSound(match.dataUrl);
              return;
            }

            if (match.dataUrl.startsWith('device_uri_') || match.dataUrl.startsWith('content://')) {
              // Web Audio fallback for browser preview of device sounds
              const frequencies = [600, 800, 1000];
              frequencies.forEach((freq, idx) => {
                const osc = audioCtx!.createOscillator();
                const gain = audioCtx!.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                gain.gain.setValueAtTime(0.4, now + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
                osc.connect(gain);
                gain.connect(audioCtx!.destination);
                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.25);
              });
              return;
            }

            const audio = new Audio(match.dataUrl);
            audio.play().catch(e => console.error("Error playing custom loaded sound:", e));
            return;
          }
        } catch (err) {
          console.error("Error parsing custom sounds for playback:", err);
        }
      }
    }

    // Direct preset check
    if (toneType === 'preset_arpeggio' || toneType === 'custom_preset_arpeggio' || toneType === 'standard') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.6, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.4);
      });
      return;
    }

    if (toneType === 'preset_marimba' || toneType === 'custom_preset_marimba' || toneType === 'campana') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.7, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.3);
      });
      return;
    }

    if (toneType === 'preset_trillo' || toneType === 'custom_preset_trillo' || toneType === 'tranquillo' || toneType === 'sirena') {
      for (let i = 0; i < 4; i++) {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'sine';
        const freq = i % 2 === 0 ? 880 : 987.77;
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.5, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.12);
      }
      return;
    }

    // Default fallback to preset_arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.6, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.4);
    });
  } catch (error) {
    console.error('Failed to play custom synthesizer audio tone: ', error);
  }
}

/**
 * Uses Web Speech Synthesis to announce reminders with customization options.
 * Prioritizes natural, warm, human-like female voices if available on the system.
 */
// Cache for voices loaded asynchronously on mobile browsers/webviews
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    cachedVoices = window.speechSynthesis.getVoices() || [];
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      console.log('[MediVoce] Loaded voices from onvoiceschanged:', cachedVoices.map(v => `${v.name} (${v.lang})`));
    };
  } catch (e) {
    console.error('[MediVoce] Error initializing SpeechSynthesis voices listener:', e);
  }
}

// Active Audio instance for custom recorded voice playback
let currentVoiceAudio: HTMLAudioElement | null = null;
let nativeVoiceAudioTimeout: any = null;

export function stopVoiceAudio() {
  if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.Android && typeof win.Android.stopCustomVoice === 'function') {
      try {
        win.Android.stopCustomVoice();
      } catch (e) {
        console.warn('[MediVoce] Error calling native stopCustomVoice', e);
      }
    }
    if (nativeVoiceAudioTimeout) {
      clearTimeout(nativeVoiceAudioTimeout);
      nativeVoiceAudioTimeout = null;
    }
  }

  if (currentVoiceAudio) {
    try {
      currentVoiceAudio.pause();
      currentVoiceAudio.currentTime = 0;
    } catch (e) {
      console.warn('[MediVoce] Error pausing voice audio', e);
    }
    currentVoiceAudio = null;
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking: false } }));
  }
}

export function playVoiceAudio(audioDataUrl: string, onEnded?: () => void): HTMLAudioElement | null {
  if (!audioDataUrl || audioDataUrl.trim().length === 0) return null;

  // Stop any other speech / audio currently playing
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_e) {}
  }
  stopVoiceAudio();

  if (typeof window !== 'undefined') {
    const win = window as any;
    // 1. Try Native Android MediaPlayer Bridge for 100% reliable hardware output
    if (win.Android && typeof win.Android.playCustomVoice === 'function') {
      try {
        win.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking: true } }));
        win.Android.playCustomVoice(audioDataUrl);
        
        // Safety timeout for visual ripple reset (approx. 10 seconds or until finished)
        nativeVoiceAudioTimeout = setTimeout(() => {
          win.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking: false } }));
          if (onEnded) onEnded();
        }, 8000);
        return null;
      } catch (err) {
        console.warn('[MediVoce] Native playCustomVoice failed, falling back to Web Audio API:', err);
      }
    }
  }

  // 2. Web HTML5 Audio Element Fallback
  try {
    const audio = new Audio(audioDataUrl);
    currentVoiceAudio = audio;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking: true } }));
    }

    audio.onended = () => {
      currentVoiceAudio = null;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking: false } }));
      }
      if (onEnded) onEnded();
    };

    audio.onerror = (e) => {
      console.error('[MediVoce] Error playing custom voice recording:', e);
      currentVoiceAudio = null;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking: false } }));
      }
    };

    audio.play().catch(e => {
      console.error('[MediVoce] audio.play() failed for custom voice recording:', e);
      currentVoiceAudio = null;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking: false } }));
      }
    });

    return audio;
  } catch (err) {
    console.error('[MediVoce] Failed to instantiate audio for recorded voice:', err);
    return null;
  }
}

export function stopSpeaking() {
  stopVoiceAudio();

  if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.nativeSpeechTimeoutId) {
      clearTimeout(win.nativeSpeechTimeoutId);
      win.nativeSpeechTimeoutId = null;
    }
    win.isSpeakingNatively = false;
    win.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking: false } }));
    
    const android = win.Android;
    if (android && typeof android.stopSpeaking === 'function') {
      try {
        android.stopSpeaking();
      } catch (e) {
        console.error('[MediVoce] Failed to call native stopSpeaking', e);
      }
    }
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error('[MediVoce] Failed to cancel Web SpeechSynthesis', e);
    }
  }
}

/**
 * Uses Web Speech Synthesis or native Android TTS to announce reminders with customization options.
 * Prioritizes natural, warm, human-like female voices if available on the system.
 */
export function speakAnnouncement(
  text: string,
  lang: LanguageCode,
  speed: number = 0.8, // default slower for seniors
  toneType: 'empathetic' | 'firm' = 'empathetic'
) {
  // Stop any currently active speech (native or web-based)
  stopSpeaking();

  // Try Native Android TTS Bridge first for 100% offline reliability in WebView
  if (typeof window !== 'undefined') {
    const win = window as any;
    const android = win.Android;
    if (android && typeof android.speak === 'function') {
      try {
        win.isSpeakingNatively = true;
        win.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking: true } }));
        
        // Calculate estimated speech duration to animate the visual soundwave accurately
        const wordsCount = text.split(/\s+/).length;
        // Average speaking pace adjusted by chosen velocity multiplier
        const estimatedDurationMs = Math.max(2500, (wordsCount / (1.6 * speed)) * 1000);
        
        win.nativeSpeechTimeoutId = setTimeout(() => {
          win.isSpeakingNatively = false;
          win.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking: false } }));
        }, estimatedDurationMs);

        android.speak(text, lang, speed, toneType);
        return;
      } catch (e) {
        console.error('[MediVoce] Native TTS call failed, falling back to Web Speech API:', e);
        win.isSpeakingNatively = false;
        if (win.nativeSpeechTimeoutId) {
          clearTimeout(win.nativeSpeechTimeoutId);
          win.nativeSpeechTimeoutId = null;
        }
      }
    }
  }

  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser environment.');
    return;
  }

  try {
    // Wake up speech synthesis in case it's in a paused state (very common on mobile)
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Set appropriate language locale
    let targetLocale = 'it-IT';
    let langPrefix = 'it';
    
    if (lang === 'de') {
      targetLocale = 'de-DE';
      langPrefix = 'de';
    } else if (lang === 'es') {
      targetLocale = 'es-ES';
      langPrefix = 'es';
    } else if (lang === 'fr') {
      targetLocale = 'fr-FR';
      langPrefix = 'fr';
    } else if (lang === 'en') {
      targetLocale = 'en-US';
      langPrefix = 'en';
    } else {
      targetLocale = 'it-IT';
      langPrefix = 'it';
    }

    // Use a longer setTimeout (250ms) before speaking. This is an essential workaround for Chrome on Android 
    // and mobile webviews where calling cancel() and speak() too quickly cancels the new utterance or locks the TTS queue.
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLocale;

      // Customize velocity & vocal resonance
      utterance.rate = speed;
      utterance.volume = 1.0; // Explicitly ensure maximum volume
      
      if (toneType === 'empathetic') {
        utterance.pitch = 1.25; // slightly higher, warmer and sweeter
      } else {
        utterance.pitch = 1.1; // a bit more authoritative
      }

      const dispatchSpeechEvent = (speaking: boolean) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('medivoce-speech', { detail: { speaking } }));
        }
      };

      utterance.onstart = () => {
        dispatchSpeechEvent(true);
      };

      // Try to find a warm, high-quality human-sounding female voice
      let allVoices: SpeechSynthesisVoice[] = [];
      try {
        allVoices = window.speechSynthesis.getVoices() || [];
      } catch (e) {
        console.warn('[MediVoce] Failed to get voices from window.speechSynthesis, using cache:', e);
      }
      if (!allVoices || allVoices.length === 0) {
        allVoices = cachedVoices;
      }

      const langVoices = allVoices.filter(v => {
        const LowerLang = (v.lang || '').toLowerCase().replace('_', '-');
        return LowerLang.startsWith(langPrefix);
      });

      if (langVoices.length > 0) {
        // List of common female, natural, or premium voice descriptors
        const femaleKeywords = [
          'female', 'donna', 'femme', 'mujer', 'elsa', 'paola', 'sonia', 'alice', 
          'samantha', 'victoria', 'zira', 'hazel', 'susan', 'karen', 'moira', 'tessa', 
          'helena', 'sabina', 'hortense', 'julie', 'pauline', 'clara', 'laura', 'silvia', 
          'giulia', 'melina', 'paula', 'cosmia', 'rosa', 'chiara', 'bianca', 'luciana', 'carmela'
        ];
        
        const maleNames = ['david', 'george', 'cosimo', 'mark', 'ravi', 'sean', 'guy', 'uomo', 'stefano', 'male', 'luca', 'diego', 'pablo', 'thomas', 'arthur', 'jacques', 'paul', 'martin', 'daniel', 'rocco', 'bernard', 'gabriel', 'jorge', 'piero', 'giovanni', 'mario'];

        // Priority 1: explicitly Female voices that are LOCAL (extremely reliable offline, won't fail silently)
        let selectedVoice = langVoices.find(v => {
          const nameLower = (v.name || '').toLowerCase();
          return femaleKeywords.some(kw => nameLower.includes(kw)) && v.localService;
        });

        // Priority 2: explicitly Female voices (even if network/Google)
        if (!selectedVoice) {
          selectedVoice = langVoices.find(v => {
            const nameLower = (v.name || '').toLowerCase();
            return femaleKeywords.some(kw => nameLower.includes(kw));
          });
        }

        // Priority 3: Not explicitly male voices, preferring local
        if (!selectedVoice) {
          selectedVoice = langVoices.find(v => {
            const nameLower = (v.name || '').toLowerCase();
            const isNotMale = !maleNames.some(kw => nameLower.includes(kw));
            return isNotMale && v.localService;
          });
        }

        // Priority 4: First available local voice
        if (!selectedVoice) {
          selectedVoice = langVoices.find(v => v.localService);
        }

        // Fallback: Use the first available voice for the target language (hoping it's female)
        if (!selectedVoice) {
          selectedVoice = langVoices[0];
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`[MediVoce] Selected female speech voice: ${selectedVoice.name} (Local: ${selectedVoice.localService}, Lang: ${selectedVoice.lang})`);
        }
      }

      // To prevent garbage collection of the utterance object on Android/Chrome,
      // which causes speech to stop mid-sentence or fail silently.
      if (typeof window !== 'undefined') {
        const win = window as any;
        if (!win._activeUtterances) {
          win._activeUtterances = new Set();
        }
        win._activeUtterances.add(utterance);
      }

      // Add Error Handler to fallback to system default voice if selected voice fails (e.g. Google network voices offline)
      utterance.onerror = (err) => {
        dispatchSpeechEvent(false);
        if (err.error === 'interrupted' || err.error === 'canceled') {
          console.log('[MediVoce] SpeechSynthesis interrupted or canceled normally:', err.error);
        } else {
          console.error('[MediVoce] SpeechSynthesis error:', err.error);
        }
        if (typeof window !== 'undefined') {
          const win = window as any;
          if (win._activeUtterances) {
            win._activeUtterances.delete(utterance);
          }
        }

        // Don't rerun fallback if the error was just "interrupted" or "canceled" via manual stop/cancel
        if (err.error !== 'interrupted' && err.error !== 'canceled') {
          console.warn('[MediVoce] SpeechSynthesis failed. Retrying with default device voice engine...');
          const fallbackUtterance = new SpeechSynthesisUtterance(text);
          fallbackUtterance.lang = targetLocale;
          fallbackUtterance.rate = speed;
          fallbackUtterance.volume = 1.0;
          fallbackUtterance.pitch = toneType === 'empathetic' ? 1.25 : 1.1;
          
          if (typeof window !== 'undefined') {
            const win = window as any;
            if (win._activeUtterances) {
              win._activeUtterances.add(fallbackUtterance);
            }
            fallbackUtterance.onstart = () => {
              dispatchSpeechEvent(true);
            };
            fallbackUtterance.onend = () => {
              dispatchSpeechEvent(false);
              if (win._activeUtterances) win._activeUtterances.delete(fallbackUtterance);
            };
            fallbackUtterance.onerror = () => {
              dispatchSpeechEvent(false);
              if (win._activeUtterances) win._activeUtterances.delete(fallbackUtterance);
            };
          }
          
          try {
            window.speechSynthesis.speak(fallbackUtterance);
          } catch (e) {
            console.error('[MediVoce] Fallback speech trigger failed:', e);
          }
        }
      };

      utterance.onend = () => {
        dispatchSpeechEvent(false);
        if (typeof window !== 'undefined') {
          const win = window as any;
          if (win._activeUtterances) {
            win._activeUtterances.delete(utterance);
          }
        }
        console.log('[MediVoce] Speech completed successfully.');
      };

      // Speak!
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('[MediVoce] Direct speech trigger failed:', e);
        dispatchSpeechEvent(false);
      }
    }, 250);

  } catch (error) {
    console.error('[MediVoce] Exception during speakAnnouncement:', error);
  }
}

export function getLocalIsoDate(date: Date = new Date()): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

/**
 * Set of mocked barcodes and prefilled pharmacology descriptions for the auto barcode scan feature
 */
export interface BarcodeResult {
  code: string;
  name: string;
  dosage: string;
  instructions: string;
  category: 'pill' | 'bottle' | 'inhaler' | 'injection';
}

export interface RawBarcodeResult {
  code: string;
  name: string;
  dosage: Record<string, string>;
  instructions: Record<string, string>;
  category: 'pill' | 'bottle' | 'inhaler' | 'injection';
}

export const BARCODE_MOCK_DATABASE: RawBarcodeResult[] = [
  {
    code: "800883100234",
    name: "Bicchiere d'Acqua al Limone",
    dosage: {
      it: "1 bicchiere (250 ml)",
      en: "1 glass (250 ml)",
      es: "1 vaso (250 ml)",
      fr: "1 verre (250 ml)"
    },
    instructions: {
      it: "Da bere al mattino appena svegli per idratarsi.",
      en: "Drink in the morning when you wake up for hydration.",
      es: "Beber por la mañana al despertar para hidratarse.",
      fr: "À boire le matin au réveil pour s'hydrater."
    },
    category: "bottle"
  },
  {
    code: "400423982341",
    name: "Bottiglia d'Acqua Minerale",
    dosage: {
      it: "500 ml",
      en: "500 ml",
      es: "500 ml",
      fr: "500 ml"
    },
    instructions: {
      it: "Bere regolarmente a piccoli sorsi durante l'arco della giornata.",
      en: "Drink regularly in small sips throughout the day.",
      es: "Beber regularmente a pequeños sorbos durante el día.",
      fr: "Boire régulièrement par petites gorgées tout au long de la journée."
    },
    category: "bottle"
  },
  {
    code: "800312012034",
    name: "Tisana Rilassante alla Camomilla",
    dosage: {
      it: "1 tazza (200 ml)",
      en: "1 cup (200 ml)",
      es: "1 taza (200 ml)",
      fr: "1 tasse (200 ml)"
    },
    instructions: {
      it: "Infondere la bustina in acqua calda per 5 minuti prima di coricarsi.",
      en: "Steep teabag in hot water for 5 minutes before bedtime.",
      es: "Dejar reposar la bolsita en agua caliente durante 5 minutos antes de dormir.",
      fr: "Laisser infuser le sachet dans l'eau chaude pendant 5 minutes avant le coucher."
    },
    category: "bottle"
  },
  {
    code: "501235123984",
    name: "Spray Idratante Acqua Termale",
    dosage: {
      it: "2 nebulizzazioni",
      en: "2 sprays",
      es: "2 pulverizaciones",
      fr: "2 pulvérisations"
    },
    instructions: {
      it: "Nebulizzare sul viso per una piacevole freschezza rigenerante.",
      en: "Spray gently on face for a refreshing and hydrating sensation.",
      es: "Pulverizar suavemente sobre el rostro para una sensación refrescante.",
      fr: "Vaporiser sur le visage pour une sensation de fraîcheur bienfaisante."
    },
    category: "inhaler"
  },
  {
    code: "078345672345",
    name: "Crema Idratante Mani e Corpo",
    dosage: {
      it: "1 applicazione",
      en: "1 application",
      es: "1 aplicación",
      fr: "1 application"
    },
    instructions: {
      it: "Massaggiare delicatamente sulla pelle fino a completo assorbimento.",
      en: "Massage gently into skin until fully absorbed.",
      es: "Masajear suavemente sobre la piel hasta su completa absorción.",
      fr: "Masser doucement sur la peau jusqu'à absorption complète."
    },
    category: "bottle"
  }
];

export function getRandomBarcode(lang: string = 'it'): BarcodeResult {
  const index = Math.floor(Math.random() * BARCODE_MOCK_DATABASE.length);
  const raw = BARCODE_MOCK_DATABASE[index];
  return {
    code: raw.code,
    name: raw.name,
    dosage: raw.dosage[lang] || raw.dosage['en'] || raw.dosage['it'] || '',
    instructions: raw.instructions[lang] || raw.instructions['en'] || raw.instructions['it'] || '',
    category: raw.category
  };
}

export function isScheduledOnDate(med: Medication, date: Date): boolean {
  if (med.frequencyType === 'monthly') {
    return med.monthlyDay !== undefined && date.getDate() === med.monthlyDay;
  }
  return Array.isArray(med.weeklySchedule) && med.weeklySchedule.includes(date.getDay());
}

export function formatMedicationSchedule(
  med: { frequencyType?: 'weekly' | 'monthly', weeklySchedule?: number[], monthlyDay?: number },
  lang: string
): string {
  const isIt = lang === 'it';
  const isEs = lang === 'es';
  const isFr = lang === 'fr';
  const isDe = lang === 'de';

  if (med.frequencyType === 'monthly') {
    const day = med.monthlyDay || 1;
    if (isIt) return `Mensile (Giorno ${day})`;
    if (isEs) return `Mensual (Día ${day})`;
    if (isFr) return `Mensuel (Jour ${day})`;
    if (isDe) return `Monatlich (Tag ${day})`;
    return `Monthly (Day ${day})`;
  }

  const schedule = med.weeklySchedule || [];
  if (schedule.length === 7) {
    if (isIt) return "Tutti i giorni";
    if (isEs) return "Todos los días";
    if (isFr) return "Tous les jours";
    if (isDe) return "Jeden Tag";
    return "Every day";
  }

  if (schedule.length === 0) {
    if (isIt) return "Nessun giorno";
    if (isEs) return "Ningún día";
    if (isFr) return "Aucun jour";
    if (isDe) return "Kein Tag";
    return "No days";
  }

  const daysIt = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysEs = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const daysFr = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const daysDe = ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"];

  const daysList = isIt ? daysIt : isEs ? daysEs : isFr ? daysFr : isDe ? daysDe : daysEn;
  
  const sortedSchedule = [...schedule].sort((a, b) => {
    const valA = a === 0 ? 7 : a;
    const valB = b === 0 ? 7 : b;
    return valA - valB;
  });

  const dayNames = sortedSchedule.map(d => daysList[d]);
  if (isIt) return `Nei giorni: ${dayNames.join(', ')}`;
  if (isEs) return `En los días: ${dayNames.join(', ')}`;
  if (isFr) return `Les jours : ${dayNames.join(', ')}`;
  if (isDe) return `An den Tagen: ${dayNames.join(', ')}`;
  return `On days: ${dayNames.join(', ')}`;
}

export function getNextOccurrence(
  med: { frequencyType?: 'weekly' | 'monthly', weeklySchedule: number[], monthlyDay?: number },
  timeSlot: string,
  now: Date
): Date {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  
  // Start checking from 'now'
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  
  // If the time has already passed today, the earliest possible occurrence is tomorrow (or later)
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  
  // Find the first matching day in the next 366 days starting from target
  for (let i = 0; i < 366; i++) {
    if (med.frequencyType === 'monthly') {
      if (med.monthlyDay !== undefined && target.getDate() === med.monthlyDay) {
        return target;
      }
    } else {
      // Weekly schedule
      if (med.weeklySchedule.includes(target.getDay())) {
        return target;
      }
    }
    // Try the next day
    target.setDate(target.getDate() + 1);
  }
  
  return target;
}
