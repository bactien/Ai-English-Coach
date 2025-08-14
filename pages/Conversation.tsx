

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CONVERSATION_SCENARIOS } from '../constants';
import { ConversationScenario, ChatMessage as ChatMessageType, SpeechState, ActivityType, Accent } from '../types';
import { getOrCreateChatSession, continueConversation } from '../services/gemini';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useUser } from '../contexts/UserContext';
import MicButton from '../components/MicButton';
import ChatMessage from '../components/ChatMessage';
import { Chat } from '@google/genai';
import { AlertTriangleIcon, LockIcon, StarIcon } from '../components/icons';
import { useLanguage } from '../hooks/useLanguage';

const ScenarioCard: React.FC<{ scenario: ConversationScenario; onSelect: () => void; isLocked: boolean; }> = ({ scenario, onSelect, isLocked }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const handleSelect = () => {
      if (isLocked) {
          navigate('/pricing');
      } else {
          onSelect();
      }
  }

  // Descriptions in constants can be keys
  const descriptionKey = `scenario.${scenario.id}.description`;
  const scenarioDescription = t(descriptionKey, { defaultValue: scenario.description });

  return (
    <button onClick={handleSelect} className="w-full bg-brand-surface p-4 rounded-lg text-left transition-colors hover:bg-brand-surface-light relative">
      {isLocked && <LockIcon className="absolute top-4 right-4 w-5 h-5 text-yellow-400" />}
      <div className="flex justify-between items-start">
          <div className="pr-8">
              <div className="flex items-center gap-2">
                {scenario.isPro && <StarIcon className="w-4 h-4 text-yellow-400" />}
                <h3 className="font-bold text-white">{scenario.title}</h3>
              </div>
              <p className="text-sm text-brand-text-secondary mt-1">{scenarioDescription}</p>
          </div>
          <span className="text-xs font-mono bg-brand-surface-light px-2 py-1 rounded flex-shrink-0">{scenario.cefrLevel}</span>
      </div>
    </button>
  );
};


const Conversation: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const { user, isPro, logActivity, addConversationToHistory } = useUser();
  const { t } = useLanguage();
  const { speak, cancel } = useSpeechSynthesis();

  const saveSession = useCallback(() => {
    if (sessionStartTimeRef.current && selectedScenario) {
        const endTime = Date.now();
        const durationSeconds = (endTime - sessionStartTimeRef.current) / 1000;
        const durationMinutes = durationSeconds / 60;
        if (durationMinutes > 0.1) { // Only log if session is > 6 seconds
            logActivity(ActivityType.CONVERSATION, durationMinutes);
        }
        // Save to history if there's been at least one user interaction
        if (messages.length > 1) { 
             addConversationToHistory(selectedScenario.title, messages);
        }
    }
    sessionStartTimeRef.current = null;
  }, [logActivity, addConversationToHistory, messages, selectedScenario]);

  useEffect(() => {
    // This cleanup function will run when the component unmounts
    return () => {
        cancel(); // Stop any speech on unmount
        saveSession();
    };
  }, [saveSession, cancel]);

  const onSpeechResult = async (transcript: string) => {
      if (!chatSession) return;

      setMessages(prev => [...prev, { sender: 'user', text: transcript }]);

      const aiResponse = await continueConversation(chatSession, transcript);

      const newAiMessage: ChatMessageType = {
          sender: 'ai',
          text: aiResponse.response,
          feedback: aiResponse.feedback,
      };

      setMessages(prev => [...prev, newAiMessage]);
      speak(aiResponse.response, user?.preferredAccent || Accent.US, () => resetState());
  };

  const { speechState, startListening, isSupported, resetState, error } = useSpeechRecognition(onSpeechResult);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectScenario = (scenario: ConversationScenario) => {
    setSelectedScenario(scenario);
    const session = getOrCreateChatSession(scenario, isPro);
    setChatSession(session);
    setMessages([{ sender: 'ai', text: scenario.initialPrompt }]);
    sessionStartTimeRef.current = Date.now(); // Start timer
    speak(scenario.initialPrompt, user?.preferredAccent || Accent.US);
  };
  
  const handleBackToScenarios = () => {
    cancel(); // Stop any ongoing speech
    saveSession();
    setSelectedScenario(null); 
    setMessages([]);
  };
  
  const handleStartListening = () => {
      cancel(); // Stop any TTS before starting ASR
      startListening();
  };

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

  if (!selectedScenario) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">{t('conversation.title')}</h1>
        <p className="text-brand-text-secondary mb-6">{t('conversation.subtitle')}</p>
        <div className="space-y-3">
          {CONVERSATION_SCENARIOS.map(s => (
            <ScenarioCard 
                key={s.id} 
                scenario={s} 
                onSelect={() => handleSelectScenario(s)}
                isLocked={!!s.isPro && !isPro}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 max-w-2xl mx-auto">
      <header className="mb-4">
        <button onClick={handleBackToScenarios} className="text-brand-primary hover:underline text-sm mb-2 block">{t('conversation.back_to_scenarios')}</button>
        <h2 className="text-xl font-bold">{selectedScenario.title}</h2>
        <p className="text-brand-text-secondary text-sm">{t('conversation.talking_to')} <span className="font-semibold text-brand-text-primary">{selectedScenario.character}</span></p>
      </header>
      
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {speechState === SpeechState.LISTENING && <div className="text-center text-brand-text-secondary italic">{t('speech.listening')}...</div>}
        {speechState === SpeechState.PROCESSING && <div className="text-center text-brand-text-secondary italic">{t('speech.processing')}...</div>}
      </div>

      {error && (
        <div className="my-2 p-3 bg-red-900/50 border border-red-500 rounded-lg text-center">
            <div className="flex justify-center items-center gap-2">
                <AlertTriangleIcon className="w-5 h-5 text-red-400"/>
                <p className="font-semibold text-red-300">{t('errors.mic_error_title')}</p>
            </div>
            <p className="text-red-200 text-sm mt-1">
                {t('errors.mic_error_desc')}
            </p>
        </div>
      )}
      
      <footer className="pt-4 mt-auto">
        <MicButton speechState={speechState} startListening={handleStartListening} />
      </footer>
    </div>
  );
};

export default Conversation;