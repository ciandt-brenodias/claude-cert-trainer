import type { Domain, Difficulty } from '@cert-trainer/shared';

const DOMAIN_LABELS: Record<Domain, string> = {
  AGENTIC_ARCHITECTURE: 'AGENTIC',
  TOOL_MCP_INTEGRATION: 'MCP',
  CLAUDE_CODE_WORKFLOWS: 'CODE',
  PROMPT_ENGINEERING: 'PROMPT',
  CONTEXT_MANAGEMENT: 'CONTEXT',
};

const DIFFICULTY_CLASSES: Record<Difficulty, string> = {
  EASY: 'bg-emerald-50 text-emerald-600',
  MEDIUM: 'bg-amber-50 text-amber-600',
  HARD: 'bg-red-50 text-red-600',
};

const BASE = 'text-xs font-mono uppercase tracking-wide px-2 py-0.5 rounded';

export function DomainBadge({ domain }: { domain: Domain }) {
  return (
    <span className={`${BASE} bg-indigo-50 text-indigo-600`}>
      {DOMAIN_LABELS[domain]}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`${BASE} ${DIFFICULTY_CLASSES[difficulty]}`}>
      {difficulty}
    </span>
  );
}
