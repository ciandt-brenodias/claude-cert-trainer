import { Domain, Difficulty } from '../../types';
import { DOMAIN_CODES } from '../../data/mock';

export function DomainBadge({ domain }: { domain: Domain }) {
  return (
    <span className="text-xs font-mono uppercase tracking-wide bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
      {DOMAIN_CODES[domain]}
    </span>
  );
}

const difficultyStyles: Record<Difficulty, string> = {
  [Difficulty.EASY]:   'bg-emerald-50 text-emerald-600',
  [Difficulty.MEDIUM]: 'bg-amber-50 text-amber-600',
  [Difficulty.HARD]:   'bg-red-50 text-red-600',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`text-xs font-mono uppercase tracking-wide px-2 py-0.5 rounded ${difficultyStyles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
