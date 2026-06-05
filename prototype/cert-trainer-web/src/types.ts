export enum Domain {
  AGENTIC_ARCHITECTURE = 'AGENTIC_ARCHITECTURE',
  TOOL_MCP_INTEGRATION = 'TOOL_MCP_INTEGRATION',
  CLAUDE_CODE_WORKFLOWS = 'CLAUDE_CODE_WORKFLOWS',
  PROMPT_ENGINEERING = 'PROMPT_ENGINEERING',
  CONTEXT_MANAGEMENT = 'CONTEXT_MANAGEMENT',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface User {
  uuid: string;
  name: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
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
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export interface HistoryEntry {
  date: string;
  label: string;
  xp: number;
}
