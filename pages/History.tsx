

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { ConversationRecord } from '../types';
import { HistoryIcon, MessageSquareIcon, ArrowRightIcon, QuoteIcon } from '../components/icons';
import { useLanguage } from '../hooks/useLanguage';

const formatRelativeTime = (timestamp: number, t: (key: string, options?: any) => string, locale: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) return past.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    if (days > 1) return t('time.days_ago', { count: days });
    if (days === 1) return t('time.yesterday');
    if (hours > 1) return t('time.hours_ago', { count: hours });
    if (hours === 1) return t('time.hour_ago');
    if (minutes > 1) return t('time.minutes_ago', { count: minutes });
    return t('time.just_now');
};


const HistoryItem: React.FC<{ record: ConversationRecord }> = ({ record }) => {
    const { t, language } = useLanguage();
    const historyLocale = language === 'vi' ? 'vi-VN' : 'en-US';
    const snippet = record.messages.find(m => m.sender === 'user')?.text || record.messages[0]?.text || '';
    
    return (
        <Link to={`/review/${record.id}`} className="bg-brand-surface p-4 rounded-xl shadow-lg flex flex-col space-y-3 transition-transform hover:scale-[1.03] duration-300">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-surface-light flex items-center justify-center">
                        <MessageSquareIcon className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{record.scenarioTitle}</h4>
                        <p className="text-sm text-brand-text-secondary">{formatRelativeTime(record.timestamp, t, historyLocale)}</p>
                    </div>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-brand-text-secondary flex-shrink-0 mt-1"/>
            </div>
             {snippet && (
                <div className="pl-4 border-l-2 border-brand-surface-light ml-5">
                    <p className="text-sm text-brand-text-secondary italic">"{snippet.substring(0, 100)}{snippet.length > 100 ? '...' : ''}"</p>
                </div>
            )}
        </Link>
    );
};


const HistoryPage: React.FC = () => {
    const { user, isLoggedIn } = useUser();
    const { t } = useLanguage();
    const navigate = useNavigate();

    if (!isLoggedIn) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto text-center">
                <p className="text-brand-text-secondary">{t('history.login_prompt')}</p>
                 <button onClick={() => navigate('/')} className="mt-4 text-brand-primary hover:underline">{t('history.go_to_dashboard')}</button>
            </div>
        );
    }
    
    const conversationHistory = user?.conversationHistory ? [...user.conversationHistory].reverse() : [];

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
             <header className="mb-6 text-center">
                <HistoryIcon className="w-12 h-12 text-brand-primary mx-auto mb-2" />
                <h1 className="text-3xl font-bold text-white">{t('history.title')}</h1>
                <p className="text-brand-text-secondary mt-1">{t('history.subtitle')}</p>
            </header>

            <div className="space-y-3 pb-4">
                {conversationHistory.length > 0 ? (
                    conversationHistory.map(record => <HistoryItem key={record.id} record={record} />)
                ) : (
                    <div className="bg-brand-surface text-center p-8 rounded-xl border border-dashed border-brand-surface-light">
                        <p className="text-brand-text-secondary">{t('history.empty_state')}</p>
                        <Link to="/conversation" className="mt-4 inline-block bg-brand-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            {t('dashboard.start_conversation')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;