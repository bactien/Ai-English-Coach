
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProgressChart from '../components/ProgressChart';
import { MOCK_PROGRESS_DATA, PERSONALIZED_PLAN } from '../constants';
import { ArrowRightIcon, MessageSquareIcon, RepeatIcon, ClipboardListIcon, LockIcon, ZapIcon, GlobeIcon, HistoryIcon, QuoteIcon, TargetIcon, FireIcon, CheckCircleIcon } from '../components/icons';
import { useUser } from '../contexts/UserContext';
import { ActivityType, ProgressData, ConversationRecord, PlanTask } from '../types';
import OnboardingModal from '../components/OnboardingModal';
import { useLanguage } from '../hooks/useLanguage';

const StatCard: React.FC<{ title: string; value: string; unit: string }> = ({ title, value, unit }) => (
  <div className="bg-brand-surface p-4 rounded-xl text-center shadow-lg">
    <p className="text-brand-text-secondary text-sm">{title}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-brand-text-secondary text-sm">{unit}</p>
  </div>
);

const FeatureCard: React.FC<{ to: string; icon: React.ReactNode; title: string; description: string; isLocked?: boolean; }> = ({ to, icon, title, description, isLocked }) => (
    <Link to={to} className={`bg-brand-surface p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform hover:scale-[1.03] duration-300 relative ${isLocked ? 'opacity-70 hover:opacity-100' : ''}`}>
        {isLocked && 
          <div className="absolute top-3 right-3 bg-yellow-400/20 p-1 rounded-full">
            <LockIcon className="w-4 h-4 text-yellow-300"/>
          </div>
        }
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-surface-light flex items-center justify-center">
            {icon}
        </div>
        <div className="flex-grow">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-brand-text-secondary text-sm">{description}</p>
        </div>
        <ArrowRightIcon className="w-6 h-6 text-brand-text-secondary"/>
    </Link>
)

const NextUpCard: React.FC<{ task: PlanTask | { type: 'drill' }, isPro: boolean }> = ({ task, isPro }) => {
    const { t } = useLanguage();

    let title, description, to, icon;

    if (task.type === 'drill') {
        title = t('dashboard.drill_title');
        description = t('dashboard.drill_desc_nextup');
        to = '/drill';
        icon = <ZapIcon className="w-6 h-6 text-brand-secondary" />;
    } else {
        title = t(task.description);
        description = isPro ? t('dashboard.next_task_in_plan') : t('dashboard.unlock_plan_prompt');
        to = task.type === 'conversation' ? '/conversation' : '/shadowing';
        icon = task.type === 'conversation' ? <MessageSquareIcon className="w-6 h-6 text-brand-primary" /> : <RepeatIcon className="w-6 h-6 text-yellow-400" />;
    }

    return (
        <Link to={isPro || task.type === 'drill' ? to : '/pricing'} className="bg-gradient-to-br from-brand-primary/80 to-brand-surface p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform hover:scale-[1.03] duration-300 border-2 border-brand-primary/50">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-grow">
                <p className="text-sm font-bold uppercase tracking-wider text-brand-primary/80">{t('dashboard.next_up')}</p>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-brand-text-secondary text-sm">{description}</p>
            </div>
            <ArrowRightIcon className="w-6 h-6 text-brand-text-secondary"/>
        </Link>
    );
};


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
    // Get the user's first message as a snippet, or the AI's first if user message doesn't exist.
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
                <div className="pl-4 border-l-2 border-brand-surface-light ml-5 flex items-start gap-3 pt-1">
                    <QuoteIcon className="w-5 h-5 text-brand-surface-light flex-shrink-0" />
                    <p className="text-sm text-brand-text-secondary italic">"{snippet.substring(0, 70)}{snippet.length > 70 ? '...' : ''}"</p>
                </div>
            )}
        </Link>
    );
};

const StreakCard: React.FC<{ currentStreak: number, longestStreak: number }> = ({ currentStreak, longestStreak }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-brand-surface p-4 rounded-xl shadow-lg flex-1 flex items-center gap-4">
      <FireIcon className="w-12 h-12 text-orange-500" />
      <div>
        <p className="text-3xl font-bold text-white">{currentStreak}</p>
        <p className="text-brand-text-secondary text-sm font-semibold">{t('dashboard.day_streak')}</p>
        <p className="text-brand-text-secondary text-xs mt-1">{t('dashboard.longest_streak', { count: longestStreak })}</p>
      </div>
    </div>
  );
};

const DailyGoalCard: React.FC<{ goal: number, current: number }> = ({ goal, current }) => {
  const { t } = useLanguage();
  const progress = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <div className="bg-brand-surface p-4 rounded-xl shadow-lg flex-1 flex flex-col justify-center">
      <h3 className="font-semibold text-white mb-2">{t('dashboard.todays_goal')}</h3>
      <div className="w-full bg-brand-surface-light rounded-full h-2.5 mb-1 transition-all duration-500">
        <div className={`h-2.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-brand-secondary' : 'bg-brand-primary'}`} style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-brand-text-secondary">
          <span className="font-bold text-white">{current.toFixed(0)}</span> / {goal} {t('dashboard.unit_minutes')}
        </p>
        {isComplete && <CheckCircleIcon className="w-5 h-5 text-brand-secondary" />}
      </div>
    </div>
  );
};


const Dashboard: React.FC = () => {
  const { user, isPro, isLoggedIn, completeOnboarding } = useUser();
  const { t, language } = useLanguage();

  const progressStats = useMemo(() => {
    if (!user?.activityLog) {
      return {
        activeDays: '0',
        totalSpokenMinutes: '0',
        chunksMastered: '0',
        weeklyChartData: MOCK_PROGRESS_DATA.map(d => ({...d, minutesSpoken: 0})),
        todaysMinutes: 0,
      };
    }

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - i);
        return d.toDateString();
    }).reverse();

    const dailyMinutes = new Map<string, number>(last7Days.map(day => [day, 0]));
    const activeDaysSet = new Set<string>();

    let totalSpokenMinutes = 0;
    let chunksMastered = 0;
    let todaysMinutes = 0;

    for (const log of user.activityLog) {
      const logDate = new Date(log.timestamp);
      const dayString = logDate.toDateString();
      
      activeDaysSet.add(dayString);
      totalSpokenMinutes += log.durationMinutes;

      if (log.type === ActivityType.SHADOWING) {
        chunksMastered++;
      }
      
      if (logDate.toDateString() === today.toDateString()) {
          todaysMinutes += log.durationMinutes;
      }

      if (dailyMinutes.has(dayString)) {
          dailyMinutes.set(dayString, (dailyMinutes.get(dayString) || 0) + log.durationMinutes);
      }
    }
    
    const chartLocale = language === 'vi' ? 'vi-VN' : 'en-US';

    const weeklyChartData: ProgressData[] = Array.from(dailyMinutes.entries()).map(([dateStr, minutes]) => ({
        day: new Date(dateStr).toLocaleDateString(chartLocale, { weekday: 'short'}),
        minutesSpoken: parseFloat(minutes.toFixed(1)),
    }));

    return {
      activeDays: activeDaysSet.size.toString(),
      totalSpokenMinutes: Math.round(totalSpokenMinutes).toString(),
      chunksMastered: chunksMastered.toString(),
      weeklyChartData,
      todaysMinutes
    };
  }, [user, t, language]);
  
  const nextUpTask = useMemo(() => {
    if (!user || !isPro) return { type: 'drill' as const };
    for (const week of PERSONALIZED_PLAN) {
        for (const task of week.tasks) {
            if (!user.planState[task.id]) {
                return task;
            }
        }
    }
    return { type: 'drill' as const }; // Default if all tasks are complete
  }, [user, isPro]);


  const recentConversations = user?.conversationHistory ? [...user.conversationHistory].reverse().slice(0, 3) : [];
  const showOnboarding = isLoggedIn && user && !user.hasCompletedOnboarding;


  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}
      <header>
        <h1 className="text-3xl font-bold text-white">{t('dashboard.welcome')}{isLoggedIn ? `, ${user.name}` : ''}!</h1>
        <p className="text-brand-text-secondary">{isLoggedIn ? t('dashboard.progress_overview') : t('dashboard.login_prompt')}</p>
      </header>

      {isLoggedIn && user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StreakCard currentStreak={user.streaks.current} longestStreak={user.streaks.longest} />
            <DailyGoalCard goal={user.dailyGoalMinutes} current={progressStats.todaysMinutes} />
        </div>
      )}
      
      {isLoggedIn && <NextUpCard task={nextUpTask} isPro={isPro} />}
      
      <div className="grid grid-cols-3 gap-4">
        <StatCard title={t('dashboard.active_days')} value={isLoggedIn ? progressStats.activeDays : "-"} unit={t('dashboard.unit_days')} />
        <StatCard title={t('dashboard.total_spoken')} value={isLoggedIn ? progressStats.totalSpokenMinutes : "-"} unit={t('dashboard.unit_minutes')} />
        <StatCard title={t('dashboard.chunks_mastered')} value={isLoggedIn ? progressStats.chunksMastered : "-"} unit={t('dashboard.unit_phrases')} />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">{t('dashboard.weekly_speaking_time')}</h2>
        <ProgressChart data={isLoggedIn ? progressStats.weeklyChartData : MOCK_PROGRESS_DATA.map(d => ({...d, minutesSpoken: 0}))} />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
                <HistoryIcon className="w-6 h-6 text-brand-text-secondary" />
                {t('dashboard.recent_conversations')}
            </h2>
            {isLoggedIn && user && user.conversationHistory.length > 3 && (
                 <Link to="/history" className="text-sm font-semibold text-brand-primary hover:underline">
                    {t('dashboard.view_all')}
                </Link>
            )}
        </div>
        {isLoggedIn && recentConversations.length > 0 ? (
            <div className="space-y-3">
                {recentConversations.map(record => <HistoryItem key={record.id} record={record} />)}
            </div>
        ) : (
            <div className="bg-brand-surface text-center p-8 rounded-xl border border-dashed border-brand-surface-light">
                <p className="text-brand-text-secondary">{t('dashboard.history_empty')}</p>
                <Link to="/conversation" className="mt-4 inline-block bg-brand-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    {t('dashboard.start_conversation')}
                </Link>
            </div>
        )}
      </div>

      <div className="space-y-4">
         <h2 className="text-xl font-semibold">{t('dashboard.start_learning')}</h2>
          <FeatureCard 
            to="/drill"
            icon={<ZapIcon className="w-6 h-6 text-yellow-400"/>}
            title={t('dashboard.drill_title')}
            description={t('dashboard.drill_desc')}
         />
         <FeatureCard 
            to="/conversation"
            icon={<MessageSquareIcon className="w-6 h-6 text-brand-primary"/>}
            title={t('dashboard.converse_title')}
            description={t('dashboard.converse_desc')}
         />
         <FeatureCard 
            to="/shadowing"
            icon={<RepeatIcon className="w-6 h-6 text-brand-secondary"/>}
            title={t('dashboard.shadow_title')}
            description={t('dashboard.shadow_desc')}
         />
         <FeatureCard 
            to="/gym"
            icon={<TargetIcon className="w-6 h-6 text-green-400"/>}
            title={t('dashboard.gym_title')}
            description={t('dashboard.gym_desc')}
         />
         <FeatureCard 
            to={isPro ? "/plan" : "/pricing"}
            icon={<ClipboardListIcon className="w-6 h-6 text-purple-400"/>}
            title={t('dashboard.plan_title')}
            description={isPro ? t('dashboard.plan_desc_pro') : t('dashboard.plan_desc_free')}
            isLocked={!isPro}
         />
         <FeatureCard
            to={isPro ? "/explorer" : "/pricing"}
            icon={<GlobeIcon className="w-6 h-6 text-cyan-400" />}
            title={t('dashboard.explorer_title')}
            description={t('dashboard.explorer_desc')}
            isLocked={!isPro}
          />
      </div>
    </div>
  );
};

export default Dashboard;