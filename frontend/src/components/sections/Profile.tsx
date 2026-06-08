import { motion } from 'framer-motion';
import { useUser } from '../../hooks/useUser';
import { useBadges } from '../../hooks/useBadges';
import { useSessionHistory } from '../../hooks/useSessionHistory';
import { AppShell } from '../layout/AppShell';
import { Card } from '../ui/Card';
import { XPBar } from '../ui/XPBar';
import { ErrorScreen } from '../ui/ErrorScreen';
import { Skeleton } from '../ui/Skeleton';

const XP_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000];

function xpPct(xp: number, level: number): number {
  const floor = XP_THRESHOLDS[level - 1] ?? 0;
  const ceiling = XP_THRESHOLDS[level] ?? (XP_THRESHOLDS[XP_THRESHOLDS.length - 1]! * 2);
  return Math.min(100, ((xp - floor) / (ceiling - floor)) * 100);
}

function xpCeiling(level: number): number {
  return XP_THRESHOLDS[level] ?? (XP_THRESHOLDS[XP_THRESHOLDS.length - 1]! * 2);
}

const badgeContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const badgeItem = { hidden: { opacity: 0, scale: 0.88 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } } };

export function Profile() {
  const { data: user, isLoading: userLoading, error: userError, refetch: refetchUser } = useUser();
  const { data: badges, isLoading: badgesLoading } = useBadges();
  const { data: sessions, isLoading: sessionsLoading } = useSessionHistory();

  if (userError) return <AppShell><ErrorScreen message="Erro ao carregar perfil" onRetry={refetchUser} /></AppShell>;

  const pct = user ? xpPct(user.xp, user.level) : 0;
  const ceiling = user ? xpCeiling(user.level) : 0;

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
        {userLoading ? (
          <>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-3" />
            <Skeleton className="h-1.5 w-48" />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-gray-900">{user?.name}</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              Nível {user?.level} · {user?.xp}/{ceiling} XP
            </p>
            <XPBar pct={pct} className="mt-3 max-w-xs" />
            {user?.currentStreak ? (
              <p className="text-sm text-gray-400 mt-2">🔥 {user.currentStreak} dias consecutivos</p>
            ) : null}
          </>
        )}
      </motion.div>

      <div className="mt-8">
        <h2 className="text-base font-medium text-gray-900 mb-4">Badges</h2>
        {badgesLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : badges?.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum badge conquistado ainda.</p>
        ) : (
          <motion.div variants={badgeContainer} initial="hidden" animate="visible" className="grid grid-cols-3 gap-3">
            {(badges ?? []).map((badge) => (
              <motion.div key={badge.badgeId} variants={badgeItem}>
                <Card className="p-4 text-center">
                  <p className="text-xs font-medium text-gray-700 leading-tight">{badge.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{badge.description}</p>
                  <p className="text-xs text-gray-300 mt-1 font-mono">
                    {new Date(badge.earnedAt).toLocaleDateString('pt-BR')}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-base font-medium text-gray-900 mb-4">Histórico de sessões</h2>
        {sessionsLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : sessions?.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma sessão finalizada.</p>
        ) : (
          <Card>
            <ul className="divide-y divide-gray-100">
              {(sessions ?? []).map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: i * 0.05 }}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-700">
                      {s.mode === 'PRACTICE' ? 'Prática' : 'Simulado'}
                      {s.domain ? ` · ${s.domain.replace(/_/g, ' ')}` : ''}
                      {s.score !== null ? ` · ${s.score}%` : ''}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {new Date(s.finishedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {s.totalAnswered}q
                  </span>
                </motion.li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
