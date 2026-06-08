import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWrongAnswers } from '../../hooks/useWrongAnswers';
import { AppShell } from '../layout/AppShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ErrorScreen } from '../ui/ErrorScreen';
import { SkeletonRow } from '../ui/Skeleton';
import { ExplainButton } from '../ui/ExplainButton';
import type { Domain } from '@cert-trainer/shared';

const DOMAIN_LABELS: Record<Domain, string> = {
  AGENTIC_ARCHITECTURE: 'Agentic Architecture',
  TOOL_MCP_INTEGRATION: 'Tool & MCP Integration',
  CLAUDE_CODE_WORKFLOWS: 'Claude Code Workflows',
  PROMPT_ENGINEERING: 'Prompt Engineering',
  CONTEXT_MANAGEMENT: 'Context Management',
};

const DIFFICULTY_CLASSES: Record<string, string> = {
  EASY: 'bg-emerald-50 text-emerald-600',
  MEDIUM: 'bg-amber-50 text-amber-600',
  HARD: 'bg-red-50 text-red-600',
};

const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } };

export function Review() {
  const navigate = useNavigate();
  const { data: wrongAnswers, isLoading, error, refetch } = useWrongAnswers();

  if (error) return <AppShell><ErrorScreen message="Erro ao carregar revisão" onRetry={refetch} /></AppShell>;

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
        <h1 className="text-2xl font-semibold text-gray-900">Revisar</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? 'Carregando...' : `${wrongAnswers?.length ?? 0} questões para revisar`}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : wrongAnswers?.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">Nenhuma questão para revisar.</p>
          <p className="text-xs text-gray-400 mt-1">Questões são removidas após 2 acertos consecutivos.</p>
        </div>
      ) : (
        <motion.ul variants={staggerContainer} initial="hidden" animate="visible" className="mt-8 space-y-3">
          {(wrongAnswers ?? []).map((q) => (
            <motion.li key={q.questionId} variants={fadeUp}>
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono uppercase tracking-wide bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                    {(DOMAIN_LABELS[q.domain as Domain] ?? q.domain).split(' ')[0]}
                  </span>
                  <span className={`text-xs font-mono uppercase tracking-wide px-2 py-0.5 rounded ${DIFFICULTY_CLASSES[q.difficulty] ?? ''}`}>
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{q.text}</p>
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <span className="font-mono text-xs text-emerald-500 mr-1">
                    {String.fromCharCode(65 + q.correctIndex)}
                  </span>
                  {q.options[q.correctIndex]}
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{q.explanation}</p>
                <ExplainButton questionId={q.questionId} userAnswer={-1} />
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      )}

      <div className="mt-8">
        <Button variant="secondary" onClick={() => navigate('/practice')}>
          Voltar a praticar
        </Button>
      </div>
    </AppShell>
  );
}
