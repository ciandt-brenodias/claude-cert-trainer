import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDomainProgress } from '../../hooks/useDomainProgress';
import { usePracticeSession } from '../../stores/practiceSession';
import { useLanguage } from '../../stores/language';
import { AppShell } from '../layout/AppShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ErrorScreen } from '../ui/ErrorScreen';
import { SkeletonRow } from '../ui/Skeleton';
import { DOMAIN_LABELS, Language, ExamMode } from '@cert-trainer/shared';
import type { Domain } from '@cert-trainer/shared';

const DOMAIN_CODES: Record<Domain, string> = {
  AGENTIC_ARCHITECTURE: 'AGENTIC',
  TOOL_MCP_INTEGRATION: 'MCP',
  CLAUDE_CODE_WORKFLOWS: 'CODE',
  PROMPT_ENGINEERING: 'PROMPT',
  CONTEXT_MANAGEMENT: 'CONTEXT',
};

const PRACTICE_COUNTS = [10, 20, 40] as const;
type PracticeCount = typeof PRACTICE_COUNTS[number];

const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } };

export function PracticeSelect() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const langKey = lang === 'pt-BR' ? Language.PT_BR : Language.EN;
  const dbLang = lang === 'pt-BR' ? Language.PT_BR : Language.EN;
  const { data: progress, isLoading, error, refetch } = useDomainProgress();
  const { startSession, status } = usePracticeSession();
  const [questionCount, setQuestionCount] = useState<PracticeCount>(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(120);

  if (error) return <AppShell><ErrorScreen message={t('practice.errorDomains')} onRetry={refetch} /></AppShell>;

  async function handleStart(domain?: Domain) {
    await startSession({ domain, questionCount, mode: ExamMode.PRACTICE, language: dbLang });
    navigate('/practice/session');
  }

  async function handleFullExam() {
    await startSession({ questionCount: 65, mode: ExamMode.FULL_EXAM, timeLimitMinutes, language: dbLang });
    navigate('/practice/session');
  }

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
        <h1 className="text-2xl font-semibold text-gray-900">{t('practice.heading')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('practice.subtitle')}</p>
      </motion.div>

      <div className="mt-6 flex items-center gap-3">
        <span className="text-sm text-gray-500">{t('practice.questionsLabel')}</span>
        {PRACTICE_COUNTS.map((n) => (
          <button
            key={n}
            onClick={() => setQuestionCount(n)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              questionCount === n
                ? 'bg-indigo-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <motion.ul variants={staggerContainer} initial="hidden" animate="visible" className="mt-8 space-y-3">
          {(progress ?? []).map((dp) => (
            <motion.li key={dp.domain} variants={fadeUp}>
              <Card className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wide bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                    {DOMAIN_CODES[dp.domain]}
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-2">{DOMAIN_LABELS[langKey][dp.domain]}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {t('practice.questionsStat', { total: dp.totalAnswered, accuracy: dp.accuracy })}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={status === 'loading'}
                  onClick={() => handleStart(dp.domain)}
                >
                  {t('practice.practiceBtn')}
                </Button>
              </Card>
            </motion.li>
          ))}

          <motion.li variants={fadeUp}>
            <Card className="p-5 border-dashed">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wide bg-amber-50 text-amber-600 px-2 py-0.5 rounded">
                    {t('practice.examBadge')}
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-2">{t('practice.examTitle')}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{t('practice.examSubtitle')}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">{t('practice.timeLimit')}</span>
                    {[60, 90, 120].map((tl) => (
                      <button
                        key={tl}
                        onClick={() => setTimeLimitMinutes(tl)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                          timeLimitMinutes === tl
                            ? 'bg-amber-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {tl}min
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={status === 'loading'}
                  onClick={handleFullExam}
                >
                  {t('practice.startBtn')}
                </Button>
              </div>
            </Card>
          </motion.li>
        </motion.ul>
      )}
    </AppShell>
  );
}
