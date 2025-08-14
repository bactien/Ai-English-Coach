
import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Accent } from '../types';
import { SettingsIcon, CheckIcon } from '../components/icons';
import { useLanguage } from '../hooks/useLanguage';

const ACCENT_OPTIONS = [
  { value: Accent.US, label: 'American (US)' },
  { value: Accent.GB, label: 'British (GB)' },
  { value: Accent.AU, label: 'Australian (AU)' },
];

const Settings: React.FC = () => {
  const { user, updatePreferredAccent, isLoggedIn } = useUser();
  const { t } = useLanguage();

  if (!isLoggedIn || !user) {
      return (
          <div className="p-4 md:p-6 max-w-2xl mx-auto text-center">
              <p className="text-brand-text-secondary">{t('settings.login_prompt')}</p>
          </div>
      )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <header className="mb-8 text-center">
        <SettingsIcon className="w-12 h-12 text-brand-primary mx-auto mb-2" />
        <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
        <p className="text-brand-text-secondary mt-1">{t('settings.subtitle')}</p>
      </header>

      <div className="bg-brand-surface-light p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">{t('settings.accent_title')}</h2>
        <p className="text-brand-text-secondary mb-6">{t('settings.accent_desc')}</p>
        
        <div className="space-y-3">
          {ACCENT_OPTIONS.map((option) => {
            const isSelected = user.preferredAccent === option.value;
            return (
              <button
                key={option.value}
                onClick={() => updatePreferredAccent(option.value)}
                role="radio"
                aria-checked={isSelected}
                className={`w-full text-left p-4 rounded-lg flex justify-between items-center transition-all duration-200 border-2 ${
                  isSelected
                    ? 'bg-brand-primary/20 border-brand-primary'
                    : 'bg-brand-surface border-brand-surface hover:border-brand-text-secondary'
                }`}
              >
                <span className={`font-medium ${isSelected ? 'text-white' : 'text-brand-text-primary'}`}>{option.label}</span>
                {isSelected && (
                  <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Settings;