import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mockUser, mockDomainProgress, xpForLevel, DOMAIN_LABELS } from '../../data/mock';
import { AppShell } from '../layout/AppShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { XPBar } from '../ui/XPBar';

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { name, xp, level, currentStreak } = mockUser;
  const { pct } = xpForLevel(level);

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-2xl font-semibold text-gray-900">Bom dia, {name}</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          Nível {level} · {xp} XP{currentStreak > 0 ? ` · 🔥 ${currentStreak} dias` : ''}
        </p>
        <XPBar pct={pct} className="mt-3 max-w-xs" />
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        {[
          { value: '47', label: 'questões hoje' },
          { value: '83%', label: 'precisão geral' },
        ].map(({ value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 + i * 0.07 }}
          >
            <Card className="p-6">
              <p className="text-3xl font-semibold font-mono text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-base font-medium text-gray-900 mb-4">Progresso por domínio</h2>
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {mockDomainProgress.map((dp) => {
            const accuracy = dp.totalAnswered > 0
              ? Math.round((dp.totalCorrect / dp.totalAnswered) * 100)
              : 0;
            return (
              <motion.li key={dp.domain} variants={fadeUp}>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{DOMAIN_LABELS[dp.domain]}</span>
                    <span className="text-sm font-mono text-gray-400">{accuracy}%</span>
                  </div>
                  <XPBar pct={accuracy} />
                </Card>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>

      <div className="flex gap-3 mt-8">
        <Button onClick={() => navigate('/practice')}>Praticar agora →</Button>
        <Button variant="secondary" onClick={() => navigate('/exam')}>Ver simulado</Button>
      </div>
    </AppShell>
  );
}
