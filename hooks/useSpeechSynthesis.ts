import { useState, useEffect, useCallback } from 'react';
import { Accent } from '../types';

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    
  useEffect(() => {
      const loadVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          if (availableVoices.length > 0) {
              setVoices(availableVoices);
          }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
          window.speechSynthesis.onvoiceschanged = null;
      };
  }, []);

  const findVoice = useCallback((accent: Accent): SpeechSynthesisVoice | null => {
      if (voices.length === 0) return null;
      
      const lang = accent;
      // More specific matching for GB and AU accents
      let langVoices = voices.filter(v => v.lang === lang);

      // Fallback for common mismatches e.g. en_GB vs en-GB
      if (langVoices.length === 0 && lang.includes('-')) {
          const baseLang = lang.split('-')[0];
          langVoices = voices.filter(v => v.lang.startsWith(baseLang));
      }
      
      if (langVoices.length === 0) return null;

      // Preference order for quality/naturalness
      const keywords = ['Google', 'Microsoft', 'Samantha', 'Daniel', 'Karen', 'Rishi', 'Zoe', 'Alex'];
      for (const keyword of keywords) {
          const found = langVoices.find(v => v.name.includes(keyword));
          if (found) return found;
      }
      
      // Return a default voice for the language if no keywords match
      return langVoices[0];
  }, [voices]);

  const speak = useCallback((text: string, accent: Accent, onEnd?: (event: SpeechSynthesisEvent) => void) => {
      if (!window.speechSynthesis) return;
      
      // Cancel any ongoing or queued speech to prevent overlap
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      const voice = findVoice(accent);
      if (voice) {
          utterance.voice = voice;
      } else {
          console.warn(`No specific voice found for accent: ${accent}. Using browser default.`);
      }
      
      if (onEnd) {
          utterance.onend = onEnd;
      }

      window.speechSynthesis.speak(utterance);
  }, [findVoice]);
  
  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, cancel };
};