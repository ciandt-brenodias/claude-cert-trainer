import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { useDomainProgress } from '../../hooks/useDomainProgress';
import { useStats } from '../../hooks/useStats';
import { AppShell } from '../layout/AppShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { XPBar } from '../ui/XPBar';
import { ErrorScreen } from '../ui/ErrorScreen';
import { SkeletonCard, SkeletonRow } from '../ui/Skeleton';
import type { Domain } from '@cert-trainer/shared';

const DOMAIN_LABELS: Record<Domain, string> = {
  AGENTIC_ARCHITECTURE: 'Agentic Architecture',
  TOOL_MCP_INTEGRATION: 'Tool & MCP Integration',
  CLAUDE_CODE_WORKFLOWS: 'Claude Code Workflows',
  PROMPT_ENGINEERING: 'Prompt Engineering',
  CONTEXT_MANAGEMENT: 'Context Management',
};

const XP_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000];

function xpPct(xp: number, level: number): number {
  const floor = XP_THRESHOLDS[level - 1] ?? 0;
  const ceiling = XP_THRESHOLDS[level] ?? (XP_THRESHOLDS[XP_THRESHOLDS.length - 1]! * 2);
  return Math.min(100, ((xp - floor) / (ceiling - floor)) * 100);
}

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
  const { data: user, isLoading: userLoading, error: userError, refetch: refetchUser } = useUser();
  const { data: progress, isLoading: progressLoading, error: progressError, refetch: refetchProgress } = useDomainProgress();
  const { data: stats, isLoading: statsLoading } = useStats();

  if (userError) return <AppShell><ErrorScreen message="Erro ao carregar perfil" onRetry={refetchUser} /></AppShell>;
  if (progressError) return <AppShell><ErrorScreen message="Erro ao carregar progresso" onRetry={refetchProgress} /></AppShell>;

  const pct = user ? xpPct(user.xp, user.level) : 0;

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
        <h1 className="text-2xl font-semibold text-gray-900">
          {userLoading ? 'Carregando...' : `Bom dia, ${user?.name}`}
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          {user && `Nível ${user.level} · ${user.xp} XP${user.currentStreak > 0 ? ` · 🔥 ${user.currentStreak} dias` : ''}`}
        </p>
        <XPBar pct={pct} className="mt-3 max-w-xs" />
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        {statsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          [
            { value: String(stats?.questionsToday ?? 0), label: 'questões hoje' },
            { value: `${stats?.overallAccuracy ?? 0}%`, label: 'precisão geral' },
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
          ))
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-base font-medium text-gray-900 mb-4">Progresso por domínio</h2>
        {progressLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : (
          <motion.ul variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            {(progress ?? []).map((dp) => (
              <motion.li key={dp.domain} variants={fadeUp}>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{DOMAIN_LABELS[dp.domain]}</span>
                    <span className="text-sm font-mono text-gray-400">{dp.accuracy}%</span>
                  </div>
                  <XPBar pct={dp.accuracy} />
                </Card>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        <Button onClick={() => navigate('/practice')}>Praticar agora →</Button>
        <Button variant="secondary" onClick={() => navigate('/review')}>Revisar erros</Button>
      </div>
    </AppShell>
  );
}
