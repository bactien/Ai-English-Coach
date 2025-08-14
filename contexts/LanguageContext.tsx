import React, { createContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'vi' | 'bilingual';
const LANG_STORAGE_KEY = 'ai-coach-language';

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: any }) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getNestedValue = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
        const storedLang = localStorage.getItem(LANG_STORAGE_KEY);
        return (storedLang as Language) || 'en';
    } catch {
        return 'en';
    }
  });

  const [translations, setTranslations] = useState<{ en: any; vi: any; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enResponse, viResponse] = await Promise.all([
          fetch('/locales/en.json'),
          fetch('/locales/vi.json')
        ]);
        if (!enResponse.ok || !viResponse.ok) {
            throw new Error('Failed to load translation files');
        }
        const enData = await enResponse.json();
        const viData = await viResponse.json();
        setTranslations({ en: enData, vi: viData });
      } catch (error) {
        console.error("Error fetching translations:", error);
        // Fallback to empty objects to prevent crashing
        setTranslations({ en: {}, vi: {} });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  };

  const t = (key: string, options?: { [key: string]: any }): string => {
    if (isLoading || !translations) {
        // Return a default value or the key itself during the loading state
        // to prevent errors, but UI will be blank until loaded.
        return ''; 
    }
    
    const enTextDefault = options?.defaultValue || key;
    const enText = getNestedValue(translations.en, key) || enTextDefault;
    const viText = getNestedValue(translations.vi, key) || enText;

    let text: string;

    if (language === 'bilingual') {
        text = enText === viText ? enText : `${enText} / ${viText}`;
    } else {
        text = language === 'vi' ? viText : enText;
    }
    
    if (options) {
      Object.keys(options).forEach(optKey => {
          if (optKey !== 'defaultValue') {
              text = text.replace(new RegExp(`{{${optKey}}}`, 'g'), String(options[optKey]));
          }
      });
    }

    return text;
  };

  if (isLoading) {
      // Render a blank screen or a loading spinner to prevent the app from crashing
      // while translations are being fetched.
      return <div className="bg-brand-background w-screen h-screen"></div>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};