

import React from 'react';
import { PERSONALIZED_PLAN } from '../constants';
import { PlanTask, WeeklyPlan } from '../types';
import { CheckCircleIcon, MessageSquareIcon, RepeatIcon, TargetIcon, ClipboardListIcon, StarIcon, LockIcon } from '../components/icons';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../hooks/useLanguage';

const getTaskIcon = (type: PlanTask['type']) => {
    switch (type) {
        case 'conversation':
            return <MessageSquareIcon className="w-5 h-5 text-brand-primary" />;
        case 'shadowing':
            return <RepeatIcon className="w-5 h-5 text-brand-secondary" />;
        case 'focus':
            return <TargetIcon className="w-5 h-5 text-yellow-400" />;
    }
}

const TaskItem: React.FC<{ task: PlanTask }> = ({ task }) => {
    const { user, togglePlanTask } = useUser();
    const { t } = useLanguage();
    const isCompleted = user?.planState?.[task.id] ?? false;

    const getLinkForTask = (taskType: PlanTask['type']) => {
        switch (taskType) {
            case 'conversation': return '/conversation';
            case 'shadowing': return '/shadowing';
            default: return null;
        }
    };
    const taskLink = getLinkForTask(task.type);
    
    // The description is a key like 'plan.w1t1'
    const taskDescription = t(task.description);

    return (
        <div className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${isCompleted ? 'bg-green-900/40' : 'bg-brand-surface'}`}>
            <div className="flex-shrink-0">
                {getTaskIcon(task.type)}
            </div>
            <div className="flex-grow">
                {taskLink ? (
                     <Link to={taskLink} className="hover:underline">
                        <p className={`text-brand-text-primary ${isCompleted ? 'line-through text-brand-text-secondary' : ''}`}>
                            {taskDescription}
                        </p>
                    </Link>
                ) : (
                     <p className={`text-brand-text-primary ${isCompleted ? 'line-through text-brand-text-secondary' : ''}`}>
                        {taskDescription}
                    </p>
                )}
            </div>
            <div className="flex-shrink-0">
                <button
                    onClick={() => togglePlanTask(task.id)}
                    aria-label={isCompleted ? t('plan.mark_incomplete') : t('plan.mark_complete')}
                    className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface-light focus:ring-brand-primary"
                >
                    {isCompleted ? (
                        <CheckCircleIcon className="w-7 h-7 text-brand-secondary" />
                    ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-brand-text-secondary hover:border-white bg-brand-surface"></div>
                    )}
                </button>
            </div>
        </div>
    );
};

const WeekCard: React.FC<{ plan: WeeklyPlan }> = ({ plan }) => {
    const { t } = useLanguage();
    // The title is a key like 'plan.week1_title'
    const weekTitle = t(plan.title);
    return (
        <div className="bg-brand-surface-light p-4 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-white mb-3">{t('plan.week', { week: plan.week })}: {weekTitle}</h3>
            <div className="space-y-2">
                {plan.tasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
};

const Paywall: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-brand-surface rounded-2xl border-2 border-yellow-400/50 shadow-2xl shadow-yellow-500/10 mt-10">
            <LockIcon className="w-16 h-16 text-yellow-400 mb-4"/>
            <h2 className="text-3xl font-extrabold text-white">{t('plan.unlock_title')}</h2>
            <p className="text-brand-text-secondary mt-2 max-w-md">
                {t('plan.unlock_desc')}
            </p>
            <Link 
                to="/pricing"
                className="mt-8 flex items-center gap-2 bg-brand-secondary hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform hover:scale-105 duration-200"
            >
                <StarIcon className="w-5 h-5"/>
                {t('plan.upgrade_button')}
            </Link>
        </div>
    )
}


const Plan: React.FC = () => {
  const { isPro } = useUser();
  const { t } = useLanguage();

  if (!isPro) {
      return (
          <div className="p-4 md:p-6 max-w-2xl mx-auto">
              <Paywall />
          </div>
      )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <header className="mb-6 text-center">
        <ClipboardListIcon className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
        <h1 className="text-3xl font-bold text-white">{t('plan.title')}</h1>
        <p className="text-brand-text-secondary mt-1">{t('plan.subtitle')}</p>
      </header>
      
      <div className="space-y-6 pb-4">
        {PERSONALIZED_PLAN.map(weekPlan => (
          <WeekCard key={weekPlan.week} plan={weekPlan} />
        ))}
      </div>
    </div>
  );
};

export default Plan;