

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { ChatMessage as ChatMessageType, SpeechState, ActivityType, Accent } from '../types';
import { generateGroundedResponse } from '../services/gemini';
import MicButton from '../components/MicButton';
import ChatMessage from '../components/ChatMessage';
import { AlertTriangleIcon, GlobeIcon, LockIcon, StarIcon, ArrowRightIcon } from '../components/icons';
import { useLanguage } from '../hooks/useLanguage';

const Paywall: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-brand-surface rounded-2xl border-2 border-yellow-400/50 shadow-2xl shadow-yellow-500/10 mt-10">
            <LockIcon className="w-16 h-16 text-yellow-400 mb-4"/>
            <h2 className="text-3xl font-extrabold text-white">{t('explorer.unlock_title')}</h2>
            <p className="text-brand-text-secondary mt-2 max-w-md">
                {t('explorer.unlock_desc')}
            </p>
            <Link 
                to="/pricing"
                className="mt-8 flex items-center gap-2 bg-brand-secondary hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform hover:scale-105 duration-200"
            >
                <StarIcon className="w-5 h-5"/>
                {t('plan.upgrade_button')}
            </Link>
        </div>
    )
}

const Explorer: React.FC = () => {
    const { user, isPro, logActivity } = useUser();
    const { t } = useLanguage();
    const [topic, setTopic] = useState<string>('');
    const [inputTopic, setInputTopic] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const sessionStartTimeRef = useRef<number | null>(null);
    const { speak, cancel } = useSpeechSynthesis();

    const onSpeechResult = async (transcript: string) => {
        if (!topic) return;

        const userMessage: ChatMessageType = { sender: 'user', text: transcript };
        setMessages(prev => [...prev, userMessage]);

        const { text, sources } = await generateGroundedResponse(messages, transcript, topic);

        const aiMessage: ChatMessageType = {
            sender: 'ai',
            text: text,
            groundingSources: sources
        };
        setMessages(prev => [...prev, aiMessage]);
        speak(text, user?.preferredAccent || Accent.US, () => resetState());
    };
    
    const { speechState, startListening, isSupported, resetState, error } = useSpeechRecognition(onSpeechResult);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    useEffect(() => {
        return () => {
            cancel();
            if (sessionStartTimeRef.current) {
                const endTime = Date.now();
                const durationMinutes = (endTime - sessionStartTimeRef.current) / 60000;
                if (durationMinutes > 0.1) {
                    logActivity(ActivityType.EXPLORER, durationMinutes);
                }
                sessionStartTimeRef.current = null;
            }
        };
    }, [logActivity, cancel]);

    const startSession = () => {
        if (inputTopic.trim()) {
            const currentTopic = inputTopic.trim();
            setTopic(currentTopic);
            const initialMessage = `Great! Let's talk about "${currentTopic}". What would you like to know or discuss?`;
            setMessages([{ sender: 'ai', text: initialMessage }]);
            sessionStartTimeRef.current = Date.now();
            speak(initialMessage, user?.preferredAccent || Accent.US);
        }
    };

    const endSession = () => {
        cancel();
        if (sessionStartTimeRef.current) {
            const endTime = Date.now();
            const durationMinutes = (endTime - sessionStartTimeRef.current) / 60000;
            if (durationMinutes > 0.1) {
                logActivity(ActivityType.EXPLORER, durationMinutes);
            }
        }
        setTopic('');
        setInputTopic('');
        setMessages([]);
        sessionStartTimeRef.current = null;
    };
    
    const handleStartListening = () => {
        cancel();
        startListening();
    };

    if (!isPro) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <Paywall />
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
    
    if (!topic) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto text-center flex flex-col items-center justify-center h-full">
                <GlobeIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white">{t('explorer.title')}</h1>
                <p className="text-brand-text-secondary mt-2 mb-8 max-w-md">{t('explorer.subtitle')}</p>
                
                <div className="flex gap-2 w-full">
                    <input 
                        type="text"
                        value={inputTopic}
                        onChange={(e) => setInputTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && startSession()}
                        placeholder={t('explorer.placeholder')}
                        className="w-full bg-brand-surface-light border border-brand-surface-light focus:ring-2 focus:ring-brand-primary focus:border-transparent rounded-lg p-3 text-white placeholder-brand-text-secondary"
                    />
                    <button 
                        onClick={startSession}
                        disabled={!inputTopic.trim()}
                        className="bg-brand-primary hover:bg-blue-600 text-white font-bold p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                        <ArrowRightIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-4 max-w-2xl mx-auto">
            <header className="mb-4">
                <button onClick={endSession} className="text-brand-primary hover:underline text-sm mb-2 block">{t('explorer.change_topic')}</button>
                <h2 className="text-xl font-bold truncate">{t('explorer.topic')}: {topic}</h2>
                <p className="text-brand-text-secondary text-sm flex items-center gap-1.5"><GlobeIcon className="w-3 h-3 text-cyan-400" /> {t('explorer.powered_by')}</p>
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
    )
};

export default Explorer;