import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePracticeSession } from '../../stores/practiceSession';
import { AppShell } from '../layout/AppShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { XPBar } from '../ui/XPBar';
import { ExplainButton } from '../ui/ExplainButton';
import type { Domain } from '@cert-trainer/shared';

const DOMAIN_LABELS: Record<Domain, string> = {
  AGENTIC_ARCHITECTURE: 'Agentic Architecture',
  TOOL_MCP_INTEGRATION: 'Tool & MCP Integration',
  CLAUDE_CODE_WORKFLOWS: 'Claude Code Workflows',
  PROMPT_ENGINEERING: 'Prompt Engineering',
  CONTEXT_MANAGEMENT: 'Context Management',
};

const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } };

export function ExamResult() {
  const navigate = useNavigate();
  const { result, status, reset } = usePracticeSession();

  useEffect(() => {
    if (status === 'idle' || !result) navigate('/', { replace: true });
  }, [status, result, navigate]);

  if (!result) return null;

  const { score, totalAnswered, totalCorrect, byDomain, wrongAnswers } = result;
  const xpEarned = totalCorrect * 20 + (totalAnswered - totalCorrect) * 5;
  const totalTime = Math.round(totalAnswered * 30);
  const passed = score >= 70;

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-center py-6"
      >
        <p className="text-sm text-gray-500 mb-2">Sessão concluída</p>
        <p className="text-6xl font-bold font-mono text-gray-900">{score}</p>
        <p className="text-gray-400 font-mono mt-1">/ 100</p>
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-sm font-medium ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {passed ? '✓ Aprovado' : '✗ Não aprovado'}
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 mt-2">
        {[
          { value: `${totalCorrect}/${totalAnswered}`, label: 'corretas' },
          { value: `~${totalTime}s`, label: 'tempo total' },
          { value: `+${xpEarned} XP`, label: 'ganhos' },
        ].map(({ value, label }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 + i * 0.07 }}>
            <Card className="p-4 text-center">
              <p className="text-xl font-semibold font-mono text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-base font-medium text-gray-900 mb-4">Por domínio</h2>
        <motion.ul variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          {byDomain.map((d) => (
            <motion.li key={d.domain} variants={fadeUp}>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{DOMAIN_LABELS[d.domain as Domain]}</span>
                    {d.pct < 60 && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">ponto fraco</span>}
                  </div>
                  <span className="text-sm font-mono text-gray-400">{d.pct}%</span>
                </div>
                <XPBar pct={d.pct} />
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {wrongAnswers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-medium text-gray-900 mb-4">Questões erradas</h2>
          <motion.ul variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            {wrongAnswers.map((w) => (
              <motion.li key={w.questionId} variants={fadeUp}>
                <Card className="p-5">
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">{w.text}</p>
                  <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-1">
                    <span className="font-mono text-xs text-emerald-500 mr-1">
                      {String.fromCharCode(65 + w.correctIndex)}
                    </span>
                    {w.options[w.correctIndex]}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 mb-2 leading-relaxed">{w.explanation}</p>
                  <ExplainButton questionId={w.questionId} userAnswer={w.userAnswer} />
                </Card>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        {wrongAnswers.length > 0 && (
          <Button variant="secondary" onClick={() => navigate('/review')}>
            Revisar erros ({wrongAnswers.length})
          </Button>
        )}
        <Button onClick={() => { reset(); navigate('/practice'); }}>Nova sessão</Button>
      </div>
    </AppShell>
  );
}
