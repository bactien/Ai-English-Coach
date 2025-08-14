

import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { BotIcon, LightbulbIcon, UserIcon, GaugeIcon, LinkIcon, LanguagesIcon } from './icons';
import { useLanguage } from '../hooks/useLanguage';
import { translateToVietnamese } from '../services/gemini';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { t, language } = useLanguage();
  const isUser = message.sender === 'user';
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const hasFeedback = !!message.feedback && (
    (typeof message.feedback === 'string' && message.feedback.trim() !== "" && !message.feedback.toLowerCase().includes('no specific feedback')) ||
    (typeof message.feedback === 'object' && (message.feedback.linguistic || message.feedback.fluency || message.feedback.content))
  );

  const handleTranslate = async () => {
    if (isTranslating || translatedText) return;
    setIsTranslating(true);
    try {
      const translation = await translateToVietnamese(message.text);
      setTranslatedText(translation);
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslatedText("Could not translate at this time.");
    } finally {
      setIsTranslating(false);
    }
  };

  const renderFeedbackContent = () => {
    if (!message.feedback) return null;

    if (typeof message.feedback === 'string') {
      return (
        <div className="mt-2 max-w-md p-3 bg-yellow-900/50 border border-yellow-400/30 rounded-lg flex items-start gap-2">
          <LightbulbIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
          <p className="text-sm text-yellow-200">{message.feedback}</p>
        </div>
      );
    }

    // Advanced Feedback for Pro Users
    return (
      <div className="mt-2 max-w-md space-y-2">
        {message.feedback.linguistic && (
          <div className="p-3 bg-yellow-900/50 border border-yellow-400/30 rounded-lg flex items-start gap-3">
            <LightbulbIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-300">{t('feedback.linguistic')}</h4>
              <p className="text-sm text-yellow-200">{message.feedback.linguistic}</p>
            </div>
          </div>
        )}
        {message.feedback.fluency && (
           <div className="p-3 bg-purple-900/50 border border-purple-400/30 rounded-lg flex items-start gap-3">
            <GaugeIcon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
             <div>
              <h4 className="text-sm font-semibold text-purple-300">{t('feedback.fluency')}</h4>
              <p className="text-sm text-purple-200">{message.feedback.fluency}</p>
            </div>
          </div>
        )}
        {message.feedback.content && (
           <div className="p-3 bg-sky-900/50 border border-sky-400/30 rounded-lg flex items-start gap-3">
            <LightbulbIcon className="w-5 h-5 text-sky-400 flex-shrink-0 mt-1" />
             <div>
              <h4 className="text-sm font-semibold text-sky-300">{t('feedback.content')}</h4>
              <p className="text-sm text-sky-200">{message.feedback.content}</p>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderFeedbackContainer = () => {
      if (!hasFeedback) return null;

      if (isFeedbackVisible) {
          return renderFeedbackContent();
      }

      return (
          <button 
              onClick={() => setIsFeedbackVisible(true)}
              className="mt-2 flex items-center gap-2 text-xs font-semibold text-yellow-300 bg-yellow-900/50 hover:bg-yellow-900/80 border border-dashed border-yellow-400/30 px-3 py-1.5 rounded-full transition-colors"
          >
              <LightbulbIcon className="w-4 h-4" />
              {t('feedback.view_feedback')}
          </button>
      )
  };

  const renderTranslationContainer = () => {
    if (isUser || (language !== 'vi' && language !== 'bilingual')) return null;

    if (translatedText) {
      return (
        <div className="mt-2 max-w-md p-3 bg-sky-900/50 border border-sky-400/30 rounded-lg">
          <p className="text-sm text-sky-200">{translatedText}</p>
        </div>
      );
    }

    return (
      <button
        onClick={handleTranslate}
        disabled={isTranslating}
        className="mt-2 flex items-center gap-2 text-xs font-semibold text-sky-300 bg-sky-900/50 hover:bg-sky-900/80 border border-dashed border-sky-400/30 px-3 py-1.5 rounded-full transition-colors disabled:opacity-70"
      >
        <LanguagesIcon className="w-4 h-4" />
        {isTranslating ? t('translate.translating') : t('translate.translate')}
      </button>
    );
  };

  const renderSources = () => {
    if (!message.groundingSources || message.groundingSources.length === 0) return null;

    return (
      <div className="mt-3 max-w-md">
        <h5 className="text-xs font-bold text-brand-text-secondary mb-2 uppercase tracking-wider">{t('feedback.sources')}</h5>
        <div className="space-y-2">
          {message.groundingSources.map((source, index) => (
            <a
              key={index}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 bg-brand-surface p-2 rounded-lg transition-colors border border-brand-surface-light hover:border-cyan-400/50"
            >
              <LinkIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{source.title || source.uri}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-surface-light flex items-center justify-center">
          <BotIcon className="w-6 h-6 text-brand-secondary" />
        </div>
      )}
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`max-w-md p-4 rounded-2xl ${isUser ? 'bg-brand-primary rounded-br-none' : 'bg-brand-surface-light rounded-bl-none'}`}>
          <p className="text-white">{message.text}</p>
        </div>
        {!isUser && (
          <div className="flex items-center gap-2 flex-wrap">
            {renderFeedbackContainer()}
            {renderTranslationContainer()}
          </div>
        )}
        {!isUser && renderSources()}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-surface-light flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-brand-primary" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
