export enum Domain {
  AGENTIC_ARCHITECTURE = 'AGENTIC_ARCHITECTURE',
  TOOL_MCP_INTEGRATION = 'TOOL_MCP_INTEGRATION',
  CLAUDE_CODE_WORKFLOWS = 'CLAUDE_CODE_WORKFLOWS',
  PROMPT_ENGINEERING    = 'PROMPT_ENGINEERING',
  CONTEXT_MANAGEMENT    = 'CONTEXT_MANAGEMENT',
}

export enum Difficulty {
  EASY   = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD   = 'HARD',
}

export enum ExamMode {
  PRACTICE  = 'PRACTICE',
  FULL_EXAM = 'FULL_EXAM',
  REVIEW    = 'REVIEW',
}

export interface UserProfile {
  uuid: string;
  name: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudiedAt: string | null;
}

export interface DomainProgress {
  domain: Domain;
  totalAnswered: number;
  totalCorrect: number;
  xpEarned: number;
}

export interface Question {
  id: string;
  domain: Domain;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: 'anthropic' | 'generated';
  isApproved: boolean;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  domain?: Domain;
  condition: BadgeCondition;
}

export interface BadgeCondition {
  type: 'streak' | 'accuracy' | 'count';
  value: number;
}

export interface UserBadge {
  badgeId: string;
  earnedAt: string;
}

export interface Credentials {
  uuid: string;
  name: string;
}
