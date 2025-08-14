

import React, { useState, useCallback } from 'react';
import { LANGUAGE_CHUNKS } from '../constants';
import { LanguageChunk, SpeechState, AdvancedFeedback, ActivityType, Accent } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { getPronunciationFeedback, getAdvancedPronunciationFeedback } from '../services/gemini';
import { AlertTriangleIcon, MicIcon, PlayIcon, RepeatIcon, SparklesIcon } from '../components/icons';
import { useUser } from '../contexts/UserContext';
import FeedbackCard from '../components/FeedbackCard';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';


const Shadowing: React.FC = () => {
  const [activeChunkId, setActiveChunkId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ [key: string]: string | AdvancedFeedback }>({});
  const { user, isPro, logActivity } = useUser();
  const { t } = useLanguage();
  const { speak, cancel } = useSpeechSynthesis();

  const handleSpeechResult = useCallback(async (transcript: string) => {
    if (!activeChunkId) return;
    
    const chunk = LANGUAGE_CHUNKS.find(c => c.id === activeChunkId);
    if (chunk) {
      let fb;
      if(isPro) {
        fb = await getAdvancedPronunciationFeedback(chunk.text, transcript);
      } else {
        fb = await getPronunciationFeedback(chunk.text, transcript);
      }
      setFeedback(prev => ({ ...prev, [activeChunkId]: fb }));
      // Log activity. Approx 0.1 minutes (6 seconds) per chunk.
      logActivity(ActivityType.SHADOWING, 0.1); 
    }
    resetState();
    setActiveChunkId(null);
  }, [activeChunkId, isPro, logActivity]);
  
  const { speechState, startListening, resetState, isSupported, error } = useSpeechRecognition(handleSpeechResult);

  const handleRecord = (chunk: LanguageChunk) => {
    cancel(); // Stop any playing audio before recording
    setActiveChunkId(chunk.id);
    startListening();
  };
  
  const handleListen = (text: string) => {
    if (speechState === SpeechState.LISTENING) {
        // Do not play audio if already listening to avoid conflicts
        return;
    }
    cancel(); // Ensure no other audio is playing
    speak(text, user?.preferredAccent || Accent.US)
  }

  const renderFeedback = (chunkId: string) => {
      const fb = feedback[chunkId];
      if (!fb) return null;

      if(typeof fb === 'object') {
          return (
            <FeedbackCard 
              feedback={fb} 
              speak={speak}
              accent={user?.preferredAccent || Accent.US}
            />
          )
      }

      // Basic feedback for free users
      return (
        <div className="mt-3 p-3 bg-brand-surface-light rounded-md">
            <p className="text-sm text-brand-text-secondary"><span className="font-bold text-brand-text-primary">{t('shadowing.feedback_title')}:</span> {fb}</p>
             <div className="mt-3 pt-3 border-t border-brand-surface">
                <Link to="/pricing" className="text-sm text-yellow-400 hover:text-yellow-300 font-semibold flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    {t('shadowing.upgrade_prompt')}
                </Link>
            </div>
        </div>
      )
  }

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <div className="bg-red-900/50 border border-red-500 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-300">{t('errors.speech_not_supported_title')}</h2>
            <p className="text-red-200 mt-2">{t('errors.speech_not_supported_desc')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <RepeatIcon className="w-8 h-8 text-brand-secondary" />
          {t('shadowing.title')}
        </h1>
        <p className="text-brand-text-secondary">{t('shadowing.subtitle')}</p>
      </header>
      
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <div className="flex items-center gap-3">
                <AlertTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0"/>
                <div>
                    <h3 className="text-red-300 font-semibold">{t('errors.mic_error_title')}</h3>
                    <p className="text-red-200 text-sm mt-1">
                        {t('errors.mic_error_desc_short')}
                    </p>
                </div>
            </div>
        </div>
      )}

      <div className="space-y-4">
        {LANGUAGE_CHUNKS.map(chunk => (
            <div key={chunk.id} className="bg-brand-surface p-4 rounded-lg shadow-lg flex flex-col space-y-3">
                <p className="text-lg text-white font-medium">"{chunk.text}"</p>
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                    onClick={() => handleListen(chunk.text)}
                    className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                    <PlayIcon className="w-5 h-5" />
                    <span>{t('shadowing.listen')}</span>
                    </button>
                    <button
                    onClick={() => handleRecord(chunk)}
                    disabled={speechState !== SpeechState.IDLE}
                    className="flex items-center space-x-2 text-sm text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                    >
                    <MicIcon className="w-5 h-5" />
                    <span>{speechState !== SpeechState.IDLE && activeChunkId === chunk.id ? t('speech.listening') + '...' : t('shadowing.record')}</span>
                    </button>
                </div>
                <span className="text-xs font-mono bg-brand-surface-light px-2 py-1 rounded">{chunk.cefrLevel}</span>
                </div>
                {(speechState === SpeechState.PROCESSING && activeChunkId === chunk.id) && <p className="text-sm text-yellow-400 italic">{t('shadowing.getting_feedback')}...</p>}
                {renderFeedback(chunk.id)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shadowing;