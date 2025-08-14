import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { DRILL_TASKS } from '../constants';
import { DrillTask, SpeechState, ActivityType, Accent } from '../types';
import { getDrillResponse } from '../services/gemini';
import MicButton from '../components/MicButton';
import { RepeatIcon, MessageSquareIcon, CheckCircleIcon, ZapIcon, AlertTriangleIcon } from '../components/icons';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../hooks/useLanguage';

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const Drill: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
    const [timeLeft, setTimeLeft] = useState(300);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [currentMessage, setCurrentMessage] = useState('');
    const navigate = useNavigate();
    const { user, logActivity } = useUser();
    const { t } = useLanguage();
    const { speak, cancel } = useSpeechSynthesis();

    const currentTask = DRILL_TASKS[currentTaskIndex];

    const advanceTask = useCallback(() => {
        const nextIndex = currentTaskIndex + 1;
        if (nextIndex >= DRILL_TASKS.length) {
            // Loop back for continuous practice
            setCurrentTaskIndex(0);
        } else {
            setCurrentTaskIndex(nextIndex);
        }
    }, [currentTaskIndex]);

    const handleSpeechResult = async (transcript: string) => {
        if (!currentTask) return;
        
        if (currentTask.type === 'conversation') {
            const aiResponse = await getDrillResponse(transcript);
            setCurrentMessage(aiResponse);
            speak(aiResponse, user?.preferredAccent || Accent.US, () => {
                resetState();
                advanceTask();
            });
        } else { // Shadowing
            // For drills, we move on immediately after shadowing
            setTimeout(() => {
                resetState();
                advanceTask();
            }, 500);
        }
    };
    
    const { speechState, startListening, resetState, error, isSupported } = useSpeechRecognition(handleSpeechResult);

    useEffect(() => {
        if (status !== 'running' || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [status, timeLeft]);

    useEffect(() => {
        if (timeLeft <= 0 && status === 'running') {
            setStatus('finished');
            logActivity(ActivityType.DRILL, 5); // Log 5 minutes
            speak("Time's up! Great work today. You completed several tasks.", user?.preferredAccent || Accent.US);
        }
    }, [timeLeft, status, logActivity, speak, user]);

    // Handle task changes
     useEffect(() => {
        if (status === 'running' && currentTask) {
            cancel(); // Cancel any previous speech before starting a new task
            setCurrentMessage(currentTask.prompt);
            if (currentTask.type === 'shadowing') {
                speak(currentTask.prompt, user?.preferredAccent || Accent.US, () => {
                   // After speaking the prompt, automatically start listening for the user
                    setTimeout(() => startListening(), 300);
                });
            } else { // Conversation
                speak(currentTask.prompt, user?.preferredAccent || Accent.US, () => resetState());
            }
        }
    }, [currentTask, status, speak, user, startListening, resetState, cancel]);

    useEffect(() => {
        // Cleanup on unmount
        return () => cancel();
    }, [cancel]);

    const startDrill = () => {
        if (!isSupported) return;
        cancel();
        setTimeLeft(300);
        setCurrentTaskIndex(0);
        setStatus('running');
        resetState();
    };

    const handleStartListening = () => {
        cancel();
        startListening();
    };

    if (!isSupported) {
        return <div className="p-4 text-center text-red-400">{t('errors.speech_not_supported_title')}</div>;
    }

    if (status === 'idle') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <ZapIcon className="w-24 h-24 text-brand-secondary" />
                <h1 className="text-4xl font-extrabold text-white mt-4">{t('drill.title')}</h1>
                <p className="text-brand-text-secondary mt-2 max-w-sm">{t('drill.subtitle')}</p>
                <button 
                    onClick={startDrill}
                    className="mt-8 bg-brand-secondary hover:bg-green-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg transition-transform hover:scale-105"
                >
                    {t('drill.start_button')}
                </button>
            </div>
        );
    }
    
    if (status === 'finished') {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <CheckCircleIcon className="w-24 h-24 text-brand-secondary" />
                <h1 className="text-4xl font-extrabold text-white mt-4">{t('drill.finished_title')}</h1>
                <p className="text-brand-text-secondary mt-2 max-w-sm">{t('drill.finished_subtitle')}</p>
                <button 
                    onClick={() => navigate('/')}
                    className="mt-8 bg-brand-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg"
                >
                    {t('drill.back_to_dashboard')}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-4 max-w-2xl mx-auto text-center">
            <header className="relative">
                <h2 className="text-2xl font-bold text-brand-secondary">{t('drill.title')}</h2>
                <div className="absolute top-0 right-0 text-2xl font-mono bg-brand-surface-light px-3 py-1 rounded-lg">
                    {formatTime(timeLeft)}
                </div>
            </header>
            
            <div className="w-full bg-brand-surface-light rounded-full h-2.5 mt-4">
                <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${(currentTaskIndex / DRILL_TASKS.length) * 100}%` }}></div>
            </div>

            <main className="flex-grow flex flex-col items-center justify-center my-6">
                <div className="w-16 h-16 mb-4 rounded-full bg-brand-surface-light flex items-center justify-center">
                    {currentTask.type === 'conversation' ? 
                        <MessageSquareIcon className="w-8 h-8 text-brand-primary"/> : 
                        <RepeatIcon className="w-8 h-8 text-yellow-400" />}
                </div>
                <p className="text-sm uppercase font-bold text-brand-text-secondary">
                    {currentTask.type === 'conversation' ? t('drill.respond_prompt') : t('drill.repeat_phrase')}
                </p>
                <p className="text-3xl font-semibold text-white mt-2 p-4 min-h-[100px]">
                    {currentMessage}
                </p>
            </main>

             {error && (
                <div className="my-2 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                    <div className="flex justify-center items-center gap-2">
                        <AlertTriangleIcon className="w-5 h-5 text-red-400"/>
                        <p className="font-semibold text-red-300">{t('errors.mic_error_title')}</p>
                    </div>
                </div>
              )}

            <footer className="pt-4 mt-auto">
                <MicButton 
                    speechState={currentTask.type === 'shadowing' && speechState === SpeechState.IDLE ? SpeechState.LISTENING : speechState} 
                    startListening={handleStartListening} 
                />
            </footer>
        </div>
    );
};

export default Drill;