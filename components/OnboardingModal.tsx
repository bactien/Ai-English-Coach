

import React, { useState } from 'react';
import { MessageSquareIcon, RepeatIcon, ZapIcon, StarIcon } from './icons';
import { useLanguage } from '../hooks/useLanguage';

interface OnboardingModalProps {
    onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const { t } = useLanguage();

    const steps = [
        {
            icon: <StarIcon className="w-16 h-16 text-yellow-300" />,
            title: t('onboarding.step1_title'),
            description: t('onboarding.step1_desc'),
        },
        {
            icon: <MessageSquareIcon className="w-16 h-16 text-brand-primary" />,
            title: t('onboarding.step2_title'),
            description: t('onboarding.step2_desc'),
        },
        {
            icon: <RepeatIcon className="w-16 h-16 text-brand-secondary" />,
            title: t('onboarding.step3_title'),
            description: t('onboarding.step3_desc'),
        },
        {
            icon: <ZapIcon className="w-16 h-16 text-yellow-400" />,
            title: t('onboarding.step4_title'),
            description: t('onboarding.step4_desc'),
        },
    ];


    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-brand-surface-light rounded-2xl w-full max-w-md shadow-2xl p-8 text-center flex flex-col items-center">
                <div className="mb-6">{step.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
                <p className="text-brand-text-secondary mb-8">{step.description}</p>

                <div className="flex items-center justify-center space-x-2 mb-8">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                index === currentStep ? 'bg-brand-primary' : 'bg-brand-surface'
                            }`}
                        />
                    ))}
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-3">
                     <button
                        onClick={onComplete}
                        className="w-full sm:w-1/3 text-brand-text-secondary hover:text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm"
                    >
                        {t('onboarding.skip')}
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-full sm:w-2/3 bg-brand-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        {currentStep === steps.length - 1 ? t('onboarding.lets_go') : t('onboarding.next')}
                    </button>
                   
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;