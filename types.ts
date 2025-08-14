
export interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  character: string;
  cefrLevel: string;
  context: string;
  initialPrompt: string;
  isPro?: boolean;
}

export interface LanguageChunk {
  id: string;
  text: string;
  category: string;
  cefrLevel: string;
}

export interface AdvancedConversationFeedback {
  linguistic: string;
  fluency: string;
  content?: string; // For interview feedback
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  feedback?: string | AdvancedConversationFeedback;
  audioUrl?: string;
  groundingSources?: GroundingSource[];
}

export interface ConversationRecord {
    id: number; // Use timestamp for unique ID
    scenarioTitle: string;
    timestamp: number;
    messages: ChatMessage[];
}

export interface ProgressData {
  day: string;
  minutesSpoken: number;
}

export enum SpeechState {
    IDLE = "idle",
    LISTENING = "listening",
    PROCESSING = "processing"
}

export interface PlanTask {
  id: string;
  description: string;
  type: 'conversation' | 'shadowing' | 'focus';
  target: string; // e.g., 'job-interview' scenario id, or a specific sound
}

export interface WeeklyPlan {
  week: number;
  title: string;
  tasks: PlanTask[];
}

export enum SubscriptionTier {
  FREE = 'Free',
  PRO = 'Pro',
}

export enum ActivityType {
    CONVERSATION = 'conversation',
    SHADOWING = 'shadowing',
    DRILL = 'drill',
    EXPLORER = 'explorer',
    PRONUNCIATION_GYM = 'pronunciation_gym',
}

export interface ActivityLog {
    timestamp: number;
    type: ActivityType;
    durationMinutes: number; // e.g., 5 for a drill, 0.1 for a chunk, variable for conversation
}

export enum Accent {
  US = 'en-US',
  GB = 'en-GB',
  AU = 'en-AU',
}

export interface User {
  name: string;
  tier: SubscriptionTier;
  activityLog: ActivityLog[];
  conversationHistory: ConversationRecord[];
  planState: { [taskId: string]: boolean };
  preferredAccent: Accent;
  hasCompletedOnboarding: boolean;
  dailyGoalMinutes: number;
  streaks: {
    current: number;
    longest: number;
    lastActivityTimestamp: number;
  };
}

export interface DrillTask {
    type: 'conversation' | 'shadowing';
    prompt: string;
}

export interface ImprovementArea {
    word: string;
    feedback: string;
}

export interface AdvancedFeedback {
    overallScore: number;
    positiveFeedback: string;
    improvementAreas: ImprovementArea[];
    intonationFeedback: string;
}

export interface PracticeItem {
    type: 'word' | 'sentence';
    text: string;
}

export interface PhonemeDrill {
  id: string;
  sound: string; // e.g., /θ/
  name: string; // translation key
  description: string; // translation key
  exampleWords: string;
  practiceItems: PracticeItem[];
  isPro?: boolean;
}