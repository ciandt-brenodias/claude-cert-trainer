import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mockQuestions } from '../../data/mock';
import { AppShell } from '../layout/AppShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DomainBadge, DifficultyBadge } from '../ui/Badge';

const wrongQuestions = mockQuestions.filter((_, i) => i % 2 === 1);

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export function Review() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-2xl font-semibold text-gray-900">Revisar</h1>
        <p className="text-sm text-gray-500 mt-1">
          {wrongQuestions.length} questões incorretas para revisar
        </p>
      </motion.div>

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-8 space-y-3"
      >
        {wrongQuestions.map((q) => (
          <motion.li key={q.id} variants={fadeUp}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <DomainBadge domain={q.domain} />
                <DifficultyBadge difficulty={q.difficulty} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{q.text}</p>
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <span className="font-mono text-xs text-emerald-500 mr-1">
                  {String.fromCharCode(65 + q.correctIndex)}
                </span>
                {q.options[q.correctIndex]}
              </div>
            </Card>
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-8">
        <Button variant="secondary" onClick={() => navigate('/practice')}>
          Voltar a praticar
        </Button>
      </div>
    </AppShell>
  );
}
