
import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Language } from '../contexts/LanguageContext';
import { GlobeIcon, CheckIcon } from './icons';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const options: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'bilingual', label: 'Song Ngữ' },
  ];

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };
  
  const currentLabel = options.find(o => o.value === language)?.label || 'English';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-brand-text-secondary hover:text-white transition-colors p-2 rounded-lg hover:bg-brand-surface-light"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <GlobeIcon className="w-5 h-5" />
        <span className="text-sm hidden sm:inline">{currentLabel}</span>
      </button>
      {isOpen && (
        <div 
            className="absolute right-0 top-full mt-2 w-40 bg-brand-surface rounded-lg shadow-lg border border-brand-surface-light z-10"
            onMouseLeave={() => setIsOpen(false)}
        >
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  onClick={() => selectLanguage(option.value)}
                  className="w-full text-left px-4 py-2 text-sm text-brand-text-primary hover:bg-brand-surface-light flex items-center justify-between"
                >
                  {option.label}
                  {language === option.value && <CheckIcon className="w-4 h-4 text-brand-primary" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;