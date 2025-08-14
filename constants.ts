import { ConversationScenario, LanguageChunk, ProgressData, WeeklyPlan, DrillTask, PhonemeDrill } from './types';

export const CONVERSATION_SCENARIOS: ConversationScenario[] = [
  {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Practice answering common questions for a a software engineer role.',
    character: 'Sarah, the Hiring Manager',
    cefrLevel: 'B1-B2',
    context: 'You are in a job interview for a Senior Software Engineer position at a tech company.',
    initialPrompt: 'Thanks for coming in today. To start, can you tell me a little bit about yourself and what led you to apply for this role?',
  },
  {
    id: 'daily-scrum',
    title: 'Daily Scrum Meeting',
    description: 'Give updates and discuss blockers in a typical agile meeting.',
    character: 'John, the Scrum Master',
    cefrLevel: 'A2-B1',
    context: 'It is the daily stand-up meeting for your project team.',
    initialPrompt: "Good morning, team. Let's start with our daily updates. Who wants to go first?",
  },
  {
    id: 'coffee-chat',
    title: 'Networking Coffee Chat',
    description: 'Practice small talk and professional networking.',
    character: 'Maria, a UX Designer',
    cefrLevel: 'A2-B1',
    context: 'You are having a virtual coffee chat with a colleague from another department.',
    initialPrompt: "Hey! Thanks for making time to chat. How's your week going so far?",
  },
   {
    id: 'behavioral-interview-pro',
    title: 'Senior Role Behavioral Interview',
    description: 'Handle tough behavioral questions using the STAR method.',
    character: 'David, the Senior Director',
    cefrLevel: 'B2-C1',
    context: "This is the final round interview for a senior position. The interviewer will ask challenging behavioral questions.",
    initialPrompt: "Let's dive a bit deeper. Can you tell me about a time you had a significant disagreement with a colleague? How did you handle it?",
    isPro: true,
  }
];

export const LANGUAGE_CHUNKS: LanguageChunk[] = [
  { id: 'chunk-1', text: "Could you elaborate on that?", category: "Meetings", cefrLevel: "B1" },
  { id: 'chunk-2', text: "Let's table that discussion for now.", category: "Meetings", cefrLevel: "B2" },
  { id: 'chunk-3', text: "I'm passionate about solving complex problems.", category: "Interviews", cefrLevel: "B1" },
  { id: 'chunk-4', text: "What's the timeline for this project?", category: "Project Management", cefrLevel: "A2" },
  { id: 'chunk-5', text: "I'm running a bit behind schedule.", category: "Project Management", cefrLevel: "A2" },
  { id: 'chunk-6', text: "Let's circle back to this next week.", category: "Meetings", cefrLevel: "B1" },
  { id: 'chunk-7', text: "I can take ownership of that task.", category: "Project Management", cefrLevel: "B1" },
  { id: 'chunk-8', text: "My key strength is my adaptability.", category: "Interviews", cefrLevel: "B2" },
];

export const MOCK_PROGRESS_DATA: ProgressData[] = [
  { day: 'Mon', minutesSpoken: 5 },
  { day: 'Tue', minutesSpoken: 8 },
  { day: 'Wed', minutesSpoken: 3 },
  { day: 'Thu', minutesSpoken: 12 },
  { day: 'Fri', minutesSpoken: 15 },
  { day: 'Sat', minutesSpoken: 7 },
  { day: 'Sun', minutesSpoken: 10 },
];

export const PERSONALIZED_PLAN: WeeklyPlan[] = [
  {
    week: 1,
    title: "plan.week1_title",
    tasks: [
      { id: "w1t1", description: "plan.w1t1", type: 'conversation', target: 'coffee-chat' },
      { id: "w1t2", description: "plan.w1t2", type: 'shadowing', target: 'Meetings' },
      { id: "w1t3", description: "plan.w1t3", type: 'focus', target: '/th/' },
      { id: "w1t4", description: "plan.w1t4", type: 'conversation', target: 'daily-scrum' },
    ]
  },
  {
    week: 2,
    title: "plan.week2_title",
    tasks: [
      { id: "w2t1", description: "plan.w2t1", type: 'shadowing', target: 'Project Management' },
      { id: "w2t2", description: "plan.w2t2", type: 'conversation', target: 'daily-scrum' },
      { id: "w2t3", description: "plan.w2t3", type: 'focus', target: 'intonation' },
      { id: "w2t4", description: "plan.w2t4", type: 'conversation', target: 'review' },
    ]
  },
  {
    week: 3,
    title: "plan.week3_title",
    tasks: [
      { id: "w3t1", description: "plan.w3t1", type: 'conversation', target: 'job-interview' },
      { id: "w3t2", description: "plan.w3t2", type: 'shadowing', target: 'Interviews' },
      { id: "w3t3", description: "plan.w3t3", type: 'focus', target: 'questions' },
      { id: "w3t4", description: "plan.w3t4", type: 'conversation', target: 'daily-scrum' },
    ]
  },
  {
    week: 4,
    title: "plan.week4_title",
    tasks: [
      { id: "w4t1", description: "plan.w4t1", type: 'conversation', target: 'job-interview' },
      { id: "w4t2", description: "plan.w4t2", type: 'shadowing', target: 'all' },
      { id: "w4t3", description: "plan.w4t3", type: 'focus', target: 'fillers' },
      { id: "w4t4", description: "plan.w4t4", type: 'focus', target: 'assessment' },
    ]
  }
];

export const DRILL_TASKS: DrillTask[] = [
    { type: 'shadowing', prompt: "Let's kick things off." },
    { type: 'conversation', prompt: "How was your weekend?" },
    { type: 'shadowing', prompt: "That's a great question." },
    { type: 'conversation', prompt: "What are you working on today?" },
    { type: 'shadowing', prompt: "I'll get back to you on that." },
    { type: 'conversation', prompt: "Tell me about a challenge you faced recently." },
    { type: 'shadowing', prompt: "Could you clarify what you mean?" },
    { type: 'conversation', prompt: "What's your biggest goal for this quarter?" },
    { type: 'shadowing', prompt: "I completely agree with you." },
    { type: 'conversation', prompt: "What's something new you learned this week?" },
];

export const PHONEME_DRILLS: PhonemeDrill[] = [
  {
    id: 'th-voiceless',
    sound: '/θ/',
    name: 'phonemes.th-voiceless.name',
    description: 'phonemes.th-voiceless.description',
    exampleWords: 'think, three, path',
    practiceItems: [
      { type: 'word', text: 'think' },
      { type: 'word', text: 'third' },
      { type: 'word', text: 'thumb' },
      { type: 'word', text: 'path' },
      { type: 'word', text: 'month' },
      { type: 'sentence', text: 'I think it is the third one.' },
      { type: 'sentence', text: 'Thank you for the thoughtful gift.' },
    ],
  },
  {
    id: 'th-voiced',
    sound: '/ð/',
    name: 'phonemes.th-voiced.name',
    description: 'phonemes.th-voiced.description',
    exampleWords: 'this, that, them',
    practiceItems: [
      { type: 'word', text: 'this' },
      { type: 'word', text: 'that' },
      { type: 'word', text: 'them' },
      { type: 'word', text: 'father' },
      { type: 'word', text: 'breathe' },
      { type: 'sentence', text: 'This is their father.' },
      { type: 'sentence', text: 'Could you pass that one to them?' },
    ],
  },
  {
    id: 'r-sound',
    sound: '/r/',
    name: 'phonemes.r-sound.name',
    description: 'phonemes.r-sound.description',
    exampleWords: 'right, story, car',
    practiceItems: [
        { type: 'word', text: 'right' },
        { type: 'word', text: 'run' },
        { type: 'word', text: 'around' },
        { type: 'word', text: 'carry' },
        { type: 'word', text: 'story' },
        { type: 'sentence', text: 'Reading is a great way to learn.' },
        { type: 'sentence', text: 'Her car is red and very fast.' },
    ],
    isPro: true,
  },
  {
    id: 'l-sound',
    sound: '/l/',
    name: 'phonemes.l-sound.name',
    description: 'phonemes.l-sound.description',
    exampleWords: 'light, hello, feel',
    practiceItems: [
        { type: 'word', text: 'light' },
        { type: 'word', text: 'like' },
        { type: 'word', text: 'look' },
        { type: 'word', text: 'hello' },
        { type: 'word', text: 'feel' },
        { type: 'sentence', text: 'Let\'s look at the light.' },
        { type: 'sentence', text: 'I feel like learning English.' },
    ],
    isPro: true,
  }
];
