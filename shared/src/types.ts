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

export enum Language {
  EN    = 'EN',
  PT_BR = 'PT_BR',
}

export const DOMAIN_LABELS: Record<Language, Record<Domain, string>> = {
  [Language.EN]: {
    [Domain.AGENTIC_ARCHITECTURE]: 'Agentic Architecture',
    [Domain.TOOL_MCP_INTEGRATION]: 'Tool & MCP Integration',
    [Domain.CLAUDE_CODE_WORKFLOWS]: 'Claude Code Workflows',
    [Domain.PROMPT_ENGINEERING]: 'Prompt Engineering',
    [Domain.CONTEXT_MANAGEMENT]: 'Context Management',
  },
  [Language.PT_BR]: {
    [Domain.AGENTIC_ARCHITECTURE]: 'Arquitetura Agêntica',
    [Domain.TOOL_MCP_INTEGRATION]: 'Tool & MCP Integration',
    [Domain.CLAUDE_CODE_WORKFLOWS]: 'Workflows Claude Code',
    [Domain.PROMPT_ENGINEERING]: 'Engenharia de Prompt',
    [Domain.CONTEXT_MANAGEMENT]: 'Gerenciamento de Contexto',
  },
};

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
  language: Language;
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
  language?: Language;
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
