
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { CheckIcon, StarIcon } from '../components/icons';
import { useLanguage } from '../hooks/useLanguage';

const FeatureListItem: React.FC<{ children: React.ReactNode, pro?: boolean }> = ({ children, pro = false }) => (
    <li className="flex items-center space-x-3">
        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${pro ? 'bg-yellow-400' : 'bg-brand-secondary'}`}>
            <CheckIcon className="w-4 h-4 text-brand-background" />
        </span>
        <span className="text-brand-text-primary">{children}</span>
    </li>
);

const Pricing: React.FC = () => {
  const { user, login, upgrade } = useUser();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleUpgradeClick = () => {
    if (!user) {
        // For demo purposes, log in a default user and then upgrade
        login('Demo User');
    }
    upgrade();
    // Navigate to the now-unlocked plan page
    navigate('/plan'); 
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white">{t('pricing.title')}</h1>
        <p className="text-brand-text-secondary mt-2">{t('pricing.subtitle')}</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Free Plan */}
        <div className="bg-brand-surface p-8 rounded-2xl border border-brand-surface-light">
            <h2 className="text-2xl font-bold">{t('pricing.free_title')}</h2>
            <p className="text-brand-text-secondary mt-1">{t('pricing.free_desc')}</p>
            <p className="text-4xl font-bold my-6">$0 <span className="text-lg font-normal text-brand-text-secondary">/ {t('pricing.month')}</span></p>
            <ul className="space-y-4">
                <FeatureListItem>{t('pricing.feature_scenarios_free')}</FeatureListItem>
                <FeatureListItem>{t('pricing.feature_feedback_free')}</FeatureListItem>
                <FeatureListItem>{t('pricing.feature_chunks_free')}</FeatureListItem>
            </ul>
             <button disabled className="w-full mt-8 bg-brand-surface-light text-brand-text-secondary font-bold py-3 px-6 rounded-lg cursor-not-allowed">
                {t('pricing.current_plan_button')}
            </button>
        </div>
        
        {/* Pro Plan */}
        <div className="bg-brand-surface p-8 rounded-2xl border-2 border-brand-secondary shadow-2xl shadow-brand-secondary/20 relative">
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                <div className="bg-brand-secondary text-brand-background px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">{t('pricing.popular_badge')}</div>
            </div>
            <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
                <StarIcon className="w-6 h-6"/>
                {t('pricing.pro_title')}
            </h2>
            <p className="text-brand-text-secondary mt-1">{t('pricing.pro_desc')}</p>
            <p className="text-4xl font-bold my-6">150.000đ <span className="text-lg font-normal text-brand-text-secondary">/ {t('pricing.month')}</span></p>
            <ul className="space-y-4">
                <FeatureListItem pro>{t('pricing.feature_scenarios_pro')}</FeatureListItem>
                <FeatureListItem pro>{t('pricing.feature_plan_pro')}</FeatureListItem>
                <FeatureListItem pro>{t('pricing.feature_coaching_pro')}</FeatureListItem>
                <FeatureListItem pro>{t('pricing.feature_feedback_pro')}</FeatureListItem>
                <FeatureListItem pro>{t('pricing.feature_chunks_pro')}</FeatureListItem>
            </ul>
             <button onClick={handleUpgradeClick} className="w-full mt-8 bg-brand-secondary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform hover:scale-105 duration-200">
                {t('pricing.upgrade_button')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;