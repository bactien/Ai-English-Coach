
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PHONEME_DRILLS } from '../constants';
import { PhonemeDrill, SpeechState, AdvancedFeedback, ActivityType, Accent } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { getAdvancedPronunciationFeedback } from '../services/gemini';
import { AlertTriangleIcon, MicIcon, PlayIcon, TargetIcon, SparklesIcon, LockIcon, ArrowRightIcon, CheckCircleIcon } from '../components/icons';
import { useUser } from '../contexts/UserContext';
import FeedbackCard from '../components/FeedbackCard';
import { useLanguage } from '../hooks/useLanguage';

const SoundCard: React.FC<{ drill: PhonemeDrill; onSelect: () => void; isLocked: boolean; }> = ({ drill, onSelect, isLocked }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSelect = () => {
        if (isLocked) {
            navigate('/pricing');
        } else {
            onSelect();
        }
    }

    return (
        <button 
            onClick={handleSelect}
            className="w-full bg-brand-surface p-4 rounded-lg text-left transition-transform hover:scale-105 duration-200 relative shadow-lg"
        >
            {isLocked && <LockIcon className="absolute top-3 right-3 w-4 h-4 text-yellow-400" />}
            <div className="flex items-center gap-4">
                <div className="text-2xl font-mono text-green-400 bg-brand-surface-light w-12 h-12 flex items-center justify-center rounded-lg">
                    {drill.sound}
                </div>
                <div>
                    <h3 className="font-bold text-white">{t(drill.name)}</h3>
                    <p className="text-sm text-brand-text-secondary">{drill.exampleWords}</p>
                </div>
            </div>
        </button>
    );
};


const PronunciationGym: React.FC = () => {
    const [selectedDrill, setSelectedDrill] = useState<PhonemeDrill | null>(null);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [feedback, setFeedback] = useState<{ [key: string]: AdvancedFeedback | 'loading' }>({});

    const { user, isPro, logActivity } = useUser();
    const { t } = useLanguage();
    const { speak, cancel } = useSpeechSynthesis();
    
    const currentItem = selectedDrill?.practiceItems[currentItemIndex];

    const handleSpeechResult = useCallback(async (transcript: string) => {
        if (!currentItem || !selectedDrill) return;
        
        const feedbackKey = currentItem.text;
        setFeedback(prev => ({ ...prev, [feedbackKey]: 'loading' }));
        
        const fb = await getAdvancedPronunciationFeedback(currentItem.text, transcript, selectedDrill.sound);
        setFeedback(prev => ({ ...prev, [feedbackKey]: fb }));
        logActivity(ActivityType.PRONUNCIATION_GYM, 0.1); // ~6 seconds per item
        
        resetState();
    }, [currentItem, selectedDrill, logActivity]);

    const { speechState, startListening, resetState, isSupported, error } = useSpeechRecognition(handleSpeechResult);

    const handleRecord = () => {
        cancel();
        startListening();
    };

    const handleListen = (text: string) => {
        if (speechState === SpeechState.LISTENING) return;
        cancel();
        speak(text, user?.preferredAccent || Accent.US);
    };

    const handleNext = () => {
        if (!selectedDrill) return;
        if (currentItemIndex < selectedDrill.practiceItems.length - 1) {
            setCurrentItemIndex(prev => prev + 1);
        } else {
             setCurrentItemIndex(prev => prev + 1); // Go one past the end to show completion screen
        }
    };
    
    const resetDrill = () => {
        setCurrentItemIndex(0);
        setFeedback({});
    }

    const backToSelection = () => {
        cancel();
        setSelectedDrill(null);
        resetDrill();
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
    
    if (!selectedDrill) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <header className="mb-6 text-center">
                    <TargetIcon className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <h1 className="text-3xl font-bold text-white">{t('gym.title')}</h1>
                    <p className="text-brand-text-secondary">{t('gym.subtitle')}</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PHONEME_DRILLS.map(drill => (
                        <SoundCard 
                            key={drill.id}
                            drill={drill}
                            isLocked={!!drill.isPro && !isPro}
                            onSelect={() => setSelectedDrill(drill)}
                        />
                    ))}
                </div>
                {!isPro && (
                     <div className="mt-6 p-4 bg-yellow-900/40 border border-dashed border-yellow-500/50 rounded-lg text-center">
                        <Link to="/pricing" className="text-sm text-yellow-300 hover:text-yellow-200 font-semibold flex items-center justify-center gap-2">
                            <SparklesIcon className="w-4 h-4" />
                            {t('gym.pro_prompt')}
                        </Link>
                    </div>
                )}
            </div>
        );
    }
    
    // Completion View
    if (currentItemIndex >= selectedDrill.practiceItems.length) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto text-center flex flex-col items-center justify-center h-full">
                <CheckCircleIcon className="w-20 h-20 text-brand-secondary mb-4" />
                <h2 className="text-3xl font-bold text-white">{t('gym.completed_title')}</h2>
                <p className="text-brand-text-secondary mt-2 max-w-sm">{t('gym.completed_desc')}</p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button onClick={resetDrill} className="bg-brand-secondary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg">
                        {t('gym.practice_again')}
                    </button>
                     <button onClick={backToSelection} className="bg-brand-surface hover:bg-brand-surface-light text-white font-bold py-3 px-6 rounded-lg">
                        {t('gym.choose_another')}
                    </button>
                </div>
            </div>
        )
    }

    const currentFeedback = currentItem ? feedback[currentItem.text] : null;

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col h-full">
            <header className="mb-4">
                <button onClick={backToSelection} className="text-brand-primary hover:underline text-sm mb-2 block">{t('gym.back_to_sounds')}</button>
                <h2 className="text-xl font-bold">{t('gym.practice_title', { sound: t(selectedDrill.name) })}</h2>
                 <div className="w-full bg-brand-surface-light rounded-full h-1.5 mt-2">
                    <div className="bg-brand-secondary h-1.5 rounded-full" style={{ width: `${((currentItemIndex + 1) / selectedDrill.practiceItems.length) * 100}%` }}></div>
                </div>
            </header>

            <div className="flex-grow overflow-y-auto pr-2">
                <div className="bg-brand-surface p-6 rounded-lg shadow-lg">
                     <p className="text-brand-text-secondary text-sm font-bold uppercase tracking-wider">{currentItem.type}</p>
                    <p className="text-3xl text-white font-medium my-4 text-center">"{currentItem.text}"</p>
                    
                    <div className="flex items-center justify-center gap-4">
                         <button
                            onClick={() => handleListen(currentItem.text)}
                            className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-full"
                         >
                            <PlayIcon className="w-5 h-5" />
                            <span>{t('shadowing.listen')}</span>
                        </button>
                        <button
                            onClick={handleRecord}
                            disabled={speechState !== SpeechState.IDLE}
                            className="flex items-center space-x-2 text-sm text-green-400 hover:text-green-300 transition-colors disabled:opacity-50 bg-green-500/10 hover:bg-green-500/20 px-4 py-2 rounded-full"
                        >
                            <MicIcon className="w-5 h-5" />
                            <span>{speechState !== SpeechState.IDLE ? t('speech.listening') + '...' : t('shadowing.record')}</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-center">
                        <div className="flex justify-center items-center gap-2">
                            <AlertTriangleIcon className="w-5 h-5 text-red-400"/>
                            <p className="font-semibold text-red-300">{t('errors.mic_error_title')}</p>
                        </div>
                    </div>
                )}
                
                {currentFeedback === 'loading' && <p className="mt-4 text-sm text-yellow-400 italic text-center">{t('shadowing.getting_feedback')}...</p>}
                
                {currentFeedback && typeof currentFeedback === 'object' && (
                     <FeedbackCard 
                        feedback={currentFeedback} 
                        speak={speak}
                        accent={user?.preferredAccent || Accent.US}
                    />
                )}
            </div>
            
             <footer className="pt-4 mt-auto">
                <button
                    onClick={handleNext}
                    disabled={!currentFeedback || currentFeedback === 'loading'}
                    className="w-full bg-brand-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {t('gym.next_item')} <ArrowRightIcon className="w-5 h-5" />
                </button>
            </footer>
        </div>
    );
};

export default PronunciationGym;
