import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mockDomainProgress, DOMAIN_LABELS, DOMAIN_CODES } from '../../data/mock';
import { AppShell } from '../layout/AppShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export function PracticeSelect() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-2xl font-semibold text-gray-900">Praticar</h1>
        <p className="text-sm text-gray-500 mt-1">Escolha um domínio para estudar</p>
      </motion.div>

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-8 space-y-3"
      >
        {mockDomainProgress.map((dp) => {
          const accuracy = dp.totalAnswered > 0
            ? Math.round((dp.totalCorrect / dp.totalAnswered) * 100)
            : 0;
          return (
            <motion.li key={dp.domain} variants={fadeUp}>
              <Card className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wide bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                    {DOMAIN_CODES[dp.domain]}
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-2">{DOMAIN_LABELS[dp.domain]}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {dp.totalAnswered} questões · {accuracy}% precisão
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/practice/session')}
                >
                  Praticar →
                </Button>
              </Card>
            </motion.li>
          );
        })}
      </motion.ul>
    </AppShell>
  );
}
