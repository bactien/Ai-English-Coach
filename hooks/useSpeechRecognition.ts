import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechState } from '../types';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = (onResult: (transcript: string) => void) => {
  const [speechState, setSpeechState] = useState<SpeechState>(SpeechState.IDLE);
  const [isSupported, setIsSupported] = useState(!!SpeechRecognitionAPI);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const speechStateRef = useRef(speechState);
  speechStateRef.current = speechState;

  useEffect(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      setError(null);
      const transcript = event.results[0][0].transcript;
      onResultRef.current(transcript);
      setSpeechState(SpeechState.PROCESSING);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      setSpeechState(SpeechState.IDLE);
    };

    recognition.onend = () => {
        if (speechStateRef.current === SpeechState.LISTENING) {
            setSpeechState(SpeechState.IDLE);
        }
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && speechState === SpeechState.IDLE) {
      setError(null);
      try {
        recognitionRef.current.start();
        setSpeechState(SpeechState.LISTENING);
      } catch (e) {
        console.error("Could not start recognition", e);
        setError('start-failed');
      }
    }
  }, [speechState]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && speechState === SpeechState.LISTENING) {
      recognitionRef.current.stop();
      setSpeechState(SpeechState.IDLE);
    }
  }, [speechState]);
  
  const resetState = useCallback(() => {
    setSpeechState(SpeechState.IDLE);
    setError(null);
  }, []);

  return { speechState, startListening, stopListening, isSupported, resetState, error };
};