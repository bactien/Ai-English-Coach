
import React from 'react';
import { NavLink, Route, Routes, useLocation, Link } from 'react-router-dom';
import { DashboardIcon, MessageSquareIcon, RepeatIcon, ClipboardListIcon, LockIcon, StarIcon, HistoryIcon, TargetIcon } from './components/icons';
import Dashboard from './pages/Dashboard';
import Conversation from './pages/Conversation';
import Shadowing from './pages/Shadowing';
import Plan from './pages/Plan';
import Pricing from './pages/Pricing';
import Drill from './pages/Drill';
import Explorer from './pages/Explorer';
import Settings from './pages/Settings';
import Review from './pages/Review';
import HistoryPage from './pages/History';
import PronunciationGym from './pages/Architecture';
import { useUser } from './contexts/UserContext';
import { useLanguage } from './hooks/useLanguage';
import LanguageSelector from './components/LanguageSelector';
import UserMenu from './components/UserMenu';

const NavItem: React.FC<{ to: string; children: React.ReactNode; isLocked?: boolean }> = ({ to, children, isLocked }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`flex flex-col items-center justify-center space-y-1 px-2 py-2 rounded-lg transition-colors duration-200 flex-1 text-center relative ${
        isActive ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-brand-surface-light'
      }`}
    >
      {isLocked && <LockIcon className="absolute top-1 right-1 sm:right-3 w-3 h-3 text-yellow-400" />}
      {children}
    </NavLink>
  );
};

const Header: React.FC = () => {
  const { user, isLoggedIn, isPro, login, logout } = useUser();
  const { t } = useLanguage();

  return (
    <header className="bg-brand-surface p-4 flex justify-between items-center border-b border-brand-surface-light">
      <Link to="/" className="text-xl font-bold text-white">AI Coach</Link>
      <div className="flex items-center gap-4">
        {!isLoggedIn ? (
            <button onClick={() => login('Demo User')} className="bg-brand-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                {t('header.login')}
            </button>
        ) : (
            <div className="flex items-center gap-2 sm:gap-4">
                {isPro ? (
                    <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 rounded-full px-3 py-1 text-xs font-bold">
                        <StarIcon className="w-3 h-3"/>
                        PRO
                    </div>
                ) : (
                    <Link to="/pricing" className="bg-brand-secondary hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                        {t('header.go_pro')}
                    </Link>
                )}
                <LanguageSelector />
                <UserMenu user={user} logout={logout} />
            </div>
        )}
      </div>
    </header>
  )
}


const App: React.FC = () => {
  const { isPro } = useUser();
  const { t } = useLanguage();

  return (
      <div className="flex flex-col h-screen font-sans bg-brand-background text-brand-text-primary">
        <Header />
        <main className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/conversation" element={<Conversation />} />
            <Route path="/shadowing" element={<Shadowing />} />
            <Route path="/gym" element={<PronunciationGym />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/drill" element={<Drill />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/review/:id" element={<Review />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
        
        <footer className="bg-brand-surface border-t border-brand-surface-light shadow-lg">
          <nav className="flex justify-around items-center h-20 max-w-2xl mx-auto">
            <NavItem to="/">
              <DashboardIcon className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav.dashboard')}</span>
            </NavItem>
            <NavItem to="/conversation">
              <MessageSquareIcon className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav.converse')}</span>
            </NavItem>
            <NavItem to="/shadowing">
              <RepeatIcon className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav.shadowing')}</span>
            </NavItem>
            <NavItem to="/gym">
                <TargetIcon className="w-6 h-6" />
                <span className="text-xs font-medium">{t('nav.gym')}</span>
            </NavItem>
             <NavItem to="/plan" isLocked={!isPro}>
              <ClipboardListIcon className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav.plan')}</span>
            </NavItem>
             <NavItem to="/history">
              <HistoryIcon className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav.history')}</span>
            </NavItem>
          </nav>
        </footer>
      </div>
  );
};

export default App;
