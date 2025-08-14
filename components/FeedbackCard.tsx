import React from 'react';
import { AdvancedFeedback, Accent } from '../types';
import { GaugeIcon, LightbulbIcon, CheckCircleIcon, TargetIcon, Volume2Icon } from './icons';

interface FeedbackCardProps {
    feedback: AdvancedFeedback;
    speak: (text: string, accent: Accent, onEnd?: () => void) => void;
    accent: Accent;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, speak, accent }) => {
    const scoreColor = feedback.overallScore >= 80 ? 'text-green-400' : feedback.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="mt-4 p-4 bg-brand-surface-light border border-brand-surface rounded-lg space-y-4">
            <h4 className="text-md font-bold text-white flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-brand-secondary" />
                Advanced Feedback
            </h4>

            <div className="flex items-center gap-4 bg-brand-surface p-3 rounded-lg">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <GaugeIcon className={`w-12 h-12 ${scoreColor}`} />
                    <span className={`absolute font-bold text-lg ${scoreColor}`}>
                        {feedback.overallScore}
                    </span>
                </div>
                <div className="flex-grow">
                    <h5 className="font-semibold text-white">Overall Score</h5>
                    <p className="text-sm text-brand-text-secondary">{feedback.positiveFeedback}</p>
                </div>
            </div>

            {feedback.improvementAreas.length > 0 && (
                <div>
                     <h5 className="font-semibold text-white flex items-center gap-2 mb-2">
                        <TargetIcon className="w-5 h-5 text-yellow-400" />
                        Areas for Improvement
                    </h5>
                    <ul className="space-y-1 pl-1">
                        {feedback.improvementAreas.map((area, index) => (
                             <li key={index} className="text-sm flex items-center gap-2 py-1">
                                <div className="w-1/3 flex-shrink-0">
                                    <button
                                        onClick={() => speak(area.word, accent)}
                                        className="font-semibold text-yellow-300 text-left hover:text-yellow-200 transition-colors flex items-center gap-1.5 p-1 -m-1 rounded-md hover:bg-yellow-500/10 w-full"
                                        aria-label={`Listen to ${area.word}`}
                                    >
                                        <span className="truncate">{area.word}</span>
                                        <Volume2Icon className="w-4 h-4 flex-shrink-0" />
                                    </button>
                                </div>
                                <span className="text-brand-text-secondary flex-1 w-2/3">{area.feedback}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div>
                 <h5 className="font-semibold text-white flex items-center gap-2 mb-2">
                    <LightbulbIcon className="w-5 h-5 text-purple-400" />
                    Intonation & Rhythm
                </h5>
                <p className="text-sm text-brand-text-secondary">{feedback.intonationFeedback}</p>
            </div>
        </div>
    );
};

export default FeedbackCard;