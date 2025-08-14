
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, SubscriptionTier, ActivityType, ActivityLog, Accent, ConversationRecord, ChatMessage } from '../types';

const USER_STORAGE_KEY = 'ai-coach-user';

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  isPro: boolean;
  login: (name: string, tier?: SubscriptionTier) => void;
  logout: () => void;
  upgrade: () => void;
  logActivity: (type: ActivityType, durationMinutes: number) => void;
  updatePreferredAccent: (accent: Accent) => void;
  addConversationToHistory: (scenarioTitle: string, messages: ChatMessage[]) => void;
  completeOnboarding: () => void;
  togglePlanTask: (taskId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
      try {
          const storedUser = localStorage.getItem(USER_STORAGE_KEY);
          return storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
          console.error("Failed to parse user from localStorage", error);
          return null;
      }
  });

  const updateUser = useCallback((updatedUser: User | null) => {
      setUser(updatedUser);
      if (updatedUser) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      } else {
          localStorage.removeItem(USER_STORAGE_KEY);
      }
  }, []);

  const login = useCallback((name: string, tier: SubscriptionTier = SubscriptionTier.FREE) => {
    updateUser({
      name: name || 'Guest',
      tier,
      activityLog: [],
      conversationHistory: [],
      planState: {},
      preferredAccent: Accent.US,
      hasCompletedOnboarding: false,
      dailyGoalMinutes: 10,
      streaks: {
        current: 0,
        longest: 0,
        lastActivityTimestamp: 0,
      },
    });
  }, [updateUser]);

  const logout = useCallback(() => {
    updateUser(null);
  }, [updateUser]);
  
  const upgrade = useCallback(() => {
    if (user) {
        updateUser({ ...user, tier: SubscriptionTier.PRO });
    }
  }, [user, updateUser]);

  const logActivity = useCallback((type: ActivityType, durationMinutes: number) => {
      if (!user) return;
      
      const now = Date.now();

      const newActivity: ActivityLog = {
          type,
          durationMinutes,
          timestamp: now,
      };
      
      const newStreaks = { ...user.streaks };
      const lastDate = new Date(user.streaks.lastActivityTimestamp);
      const currentDate = new Date(now);

      const isSameDay = lastDate.toDateString() === currentDate.toDateString();

      if (!isSameDay) {
          const yesterday = new Date();
          yesterday.setDate(currentDate.getDate() - 1);
          
          if (user.streaks.lastActivityTimestamp !== 0 && lastDate.toDateString() === yesterday.toDateString()) {
              // Consecutive day
              newStreaks.current += 1;
          } else {
              // Day was skipped or first activity ever
              newStreaks.current = 1;
          }
      }

      newStreaks.lastActivityTimestamp = now;
      if (newStreaks.current > newStreaks.longest) {
          newStreaks.longest = newStreaks.current;
      }

      updateUser({ 
          ...user, 
          activityLog: [...user.activityLog, newActivity],
          streaks: newStreaks
      });
  }, [user, updateUser]);
  
  const updatePreferredAccent = useCallback((accent: Accent) => {
      if (!user) return;
      updateUser({ ...user, preferredAccent: accent });
  }, [user, updateUser]);

  const addConversationToHistory = useCallback((scenarioTitle: string, messages: ChatMessage[]) => {
      if (!user) return;
      const newRecord: ConversationRecord = {
          id: Date.now(),
          scenarioTitle,
          messages,
          timestamp: Date.now(),
      };
      updateUser({ ...user, conversationHistory: [...user.conversationHistory, newRecord] });
  }, [user, updateUser]);

  const completeOnboarding = useCallback(() => {
    if (user) {
      updateUser({ ...user, hasCompletedOnboarding: true });
    }
  }, [user, updateUser]);

  const togglePlanTask = useCallback((taskId: string) => {
    if (!user) return;
    const newPlanState = {
      ...user.planState,
      [taskId]: !user.planState[taskId],
    };
    updateUser({ ...user, planState: newPlanState });
  }, [user, updateUser]);

  const isLoggedIn = user !== null;
  const isPro = user?.tier === SubscriptionTier.PRO;

  return (
    <UserContext.Provider value={{ user, isLoggedIn, isPro, login, logout, upgrade, logActivity, updatePreferredAccent, addConversationToHistory, completeOnboarding, togglePlanTask }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};