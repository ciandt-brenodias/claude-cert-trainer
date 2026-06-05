import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DOMAIN_LABELS, EXAM_DOMAIN_RESULTS } from '../../data/mock';
import { AppShell } from '../layout/AppShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { XPBar } from '../ui/XPBar';

const SCORE = 742;
const PASS_SCORE = 720;
const CORRECT = 47;
const TIME = '1h 12min';
const XP_EARNED = 350;

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export function ExamResult() {
  const navigate = useNavigate();
  const passed = SCORE >= PASS_SCORE;

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-center py-6"
      >
        <p className="text-sm text-gray-500 mb-2">Simulado concluído</p>
        <p className="text-6xl font-bold font-mono text-gray-900">{SCORE}</p>
        <p className="text-gray-400 font-mono mt-1">/ 1000 pts</p>
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-sm font-medium ${
          passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {passed ? '✓ Aprovado' : '✗ Não aprovado'}
        </div>
        <p className="text-xs text-gray-400 mt-1 font-mono">mínimo: {PASS_SCORE}</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 mt-2">
        {[
          { value: `${CORRECT}/60`, label: 'corretas' },
          { value: TIME,            label: 'tempo total' },
          { value: `+${XP_EARNED} XP`, label: 'ganhos' },
        ].map(({ value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 + i * 0.07 }}
          >
            <Card className="p-4 text-center">
              <p className="text-xl font-semibold font-mono text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-base font-medium text-gray-900 mb-4">Por domínio</h2>
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {EXAM_DOMAIN_RESULTS.map((result) => (
            <motion.li key={result.domain} variants={fadeUp}>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{DOMAIN_LABELS[result.domain]}</span>
                    {result.weak && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        ponto fraco
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-mono text-gray-400">{result.pct}%</span>
                </div>
                <XPBar pct={result.pct} />
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={() => navigate('/review')}>Revisar erros</Button>
        <Button onClick={() => navigate('/exam')}>Novo simulado</Button>
      </div>
    </AppShell>
  );
}
