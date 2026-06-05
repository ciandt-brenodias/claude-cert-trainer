import { motion } from 'framer-motion';
import { mockUser, mockBadges, mockHistory, xpForLevel } from '../../data/mock';
import { AppShell } from '../layout/AppShell';
import { Card } from '../ui/Card';
import { XPBar } from '../ui/XPBar';

const badgeContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const badgeItem = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

export function Profile() {
  const { name, xp, level, currentStreak } = mockUser;
  const { pct, ceiling } = xpForLevel(level);

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          Nível {level} · {xp}/{ceiling} XP
        </p>
        <XPBar pct={pct} className="mt-3 max-w-xs" />
        <p className="text-sm text-gray-400 mt-2">🔥 {currentStreak} dias consecutivos</p>
      </motion.div>

      <div className="mt-8">
        <h2 className="text-base font-medium text-gray-900 mb-4">Badges</h2>
        <motion.div
          variants={badgeContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          {mockBadges.map((badge) => (
            <motion.div key={badge.id} variants={badgeItem}>
              <Card className={`p-4 text-center transition-opacity ${badge.earned ? '' : 'opacity-35'}`}>
                <p className="text-2xl font-mono mb-1">{badge.icon}</p>
                <p className="text-xs font-medium text-gray-700 leading-tight">{badge.name}</p>
                {badge.earned && badge.earnedAt ? (
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{badge.earnedAt}</p>
                ) : (
                  <p className="text-xs text-gray-300 mt-0.5">bloqueado</p>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="mt-8">
        <h2 className="text-base font-medium text-gray-900 mb-4">Histórico de sessões</h2>
        <Card>
          <ul className="divide-y divide-gray-100">
            {mockHistory.map((entry, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: i * 0.05 }}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-700">{entry.label}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{entry.date}</p>
                </div>
                <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  +{entry.xp} XP
                </span>
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
