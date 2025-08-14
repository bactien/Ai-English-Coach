

import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import ChatMessage from '../components/ChatMessage';
import { HistoryIcon, MessageSquareIcon } from '../components/icons';
import { useLanguage } from '../hooks/useLanguage';

const Review: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();
    const { t } = useLanguage();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const conversation = user?.conversationHistory.find(
        (record) => record.id.toString() === id
    );

    useEffect(() => {
        // Scroll to the bottom on initial load
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation]);

    if (!user) {
        return (
             <div className="p-4 text-center">
                <p className="text-brand-text-secondary">{t('history.login_prompt')}</p>
                <button onClick={() => navigate('/')} className="mt-4 text-brand-primary hover:underline">{t('history.go_to_dashboard')}</button>
            </div>
        )
    }

    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <HistoryIcon className="w-16 h-16 text-red-400 mb-4" />
                <h1 className="text-2xl font-bold text-white">{t('review.not_found_title')}</h1>
                <p className="text-brand-text-secondary mt-2">
                    {t('review.not_found_desc')}
                </p>
                <Link to="/" className="mt-6 bg-brand-primary hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-lg">
                    {t('drill.back_to_dashboard')}
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-4 max-w-2xl mx-auto">
            <header className="mb-4">
                <Link to="/" className="text-brand-primary hover:underline text-sm mb-2 block">&larr; {t('drill.back_to_dashboard')}</Link>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquareIcon className="w-6 h-6 text-brand-primary" />
                    {t('review.title')}: {conversation.scenarioTitle}
                </h2>
                <p className="text-brand-text-secondary text-sm ml-8">
                    {t('review.practiced_on')} {new Date(conversation.timestamp).toLocaleString()}
                </p>
            </header>
            
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 bg-brand-surface/30 p-2 rounded-lg border border-brand-surface-light">
                {conversation.messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}
            </div>
            
            <footer className="pt-4 mt-auto text-center">
                <p className="text-sm text-brand-text-secondary italic">{t('review.footer')}</p>
            </footer>
        </div>
    );
};

export default Review;