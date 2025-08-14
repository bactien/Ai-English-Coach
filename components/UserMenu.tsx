import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { User } from '../types';
import { UserIcon, SettingsIcon, HistoryIcon, StarIcon } from './icons';

interface UserMenuProps {
  user: User | null;
  logout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-brand-text-secondary hover:text-white transition-colors p-2 rounded-full hover:bg-brand-surface-light"
      >
        <UserIcon className="w-6 h-6 bg-brand-surface-light rounded-full p-1 text-brand-primary" />
        <span className="text-sm font-semibold hidden sm:inline">{user.name}</span>
      </button>

      <div
        className={`absolute right-0 top-full mt-2 w-56 bg-brand-surface rounded-lg shadow-2xl border border-brand-surface-light z-20 origin-top-right transition-all duration-200 ease-out ${
          isOpen
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 border-b border-brand-surface-light">
          <p className="font-bold text-white truncate">{user.name}</p>
          <p className="text-sm text-brand-text-secondary">{user.tier === 'Pro' ? 'Pro Member' : 'Free Member'}</p>
        </div>
        <ul className="py-2">
            <li>
              <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-brand-text-primary hover:bg-brand-surface-light flex items-center gap-3"
              >
                  <SettingsIcon className="w-5 h-5 text-brand-text-secondary"/>
                  <span>{t('header.settings')}</span>
              </Link>
          </li>
            <li>
              <Link
                  to="/history"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-brand-text-primary hover:bg-brand-surface-light flex items-center gap-3"
              >
                  <HistoryIcon className="w-5 h-5 text-brand-text-secondary"/>
                  <span>{t('nav.history')}</span>
              </Link>
          </li>
            {user.tier !== 'Pro' && (
                <li>
                  <Link
                      to="/pricing"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-yellow-300 hover:bg-brand-surface-light flex items-center gap-3"
                  >
                      <StarIcon className="w-5 h-5"/>
                      <span>{t('header.go_pro')}</span>
                  </Link>
              </li>
            )}
        </ul>
          <div className="p-2 border-t border-brand-surface-light">
            <button
              onClick={() => {
                  setIsOpen(false);
                  logout();
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md"
            >
              {t('header.logout')}
          </button>
          </div>
      </div>
    </div>
  );
};

export default UserMenu;