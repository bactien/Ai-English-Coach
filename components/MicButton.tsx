

import React from 'react';
import { MicIcon } from './icons';
import { SpeechState } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface MicButtonProps {
  speechState: SpeechState;
  startListening: () => void;
}

const MicButton: React.FC<MicButtonProps> = ({ speechState, startListening }) => {
  const { t } = useLanguage();

  const getButtonClass = () => {
    switch (speechState) {
      case SpeechState.LISTENING:
        return 'bg-red-500'; // Pulse effect is now handled by separate elements
      case SpeechState.PROCESSING:
        return 'bg-yellow-500 animate-spin';
      case SpeechState.IDLE:
      default:
        return 'bg-brand-primary hover:bg-blue-600';
    }
  };
  
  const getButtonText = () => {
    switch (speechState) {
        case SpeechState.LISTENING: return t('speech.listening') + '...';
        case SpeechState.PROCESSING: return t('speech.processing') + '...';
        case SpeechState.IDLE: return t('speech.tap_to_speak');
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {speechState === SpeechState.LISTENING && (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="animate-ping absolute inline-flex h-3/4 w-3/4 rounded-full bg-red-500 opacity-50" style={{ animationDelay: '0.3s' }}></span>
            </>
        )}
        <button
          onClick={startListening}
          disabled={speechState !== SpeechState.IDLE}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-75 ${getButtonClass()}`}
        >
          <MicIcon className="w-8 h-8" />
        </button>
      </div>
      <p className="text-brand-text-secondary text-sm font-medium">{getButtonText()}</p>
    </div>
  );
};

export default MicButton;
