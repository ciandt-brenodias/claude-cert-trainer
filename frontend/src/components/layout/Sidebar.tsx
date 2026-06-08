import { NavLink } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { XPBar } from '../ui/XPBar';

const navItems = [
  { to: '/',         label: 'Dashboard', end: true  },
  { to: '/practice', label: 'Praticar',  end: false },
  { to: '/review',   label: 'Revisar',   end: false },
  { to: '/profile',  label: 'Perfil',    end: false },
];

const XP_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000];

function xpPct(xp: number, level: number): number {
  const floor = XP_THRESHOLDS[level - 1] ?? 0;
  const ceiling = XP_THRESHOLDS[level] ?? (XP_THRESHOLDS[XP_THRESHOLDS.length - 1]! * 2);
  return Math.min(100, ((xp - floor) / (ceiling - floor)) * 100);
}

export function Sidebar() {
  const { data: user } = useUser();

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 font-mono tracking-tight">
          cert-trainer
        </span>
      </div>

      <nav className="flex-1 p-3" aria-label="Navegação principal">
        <ul className="space-y-0.5">
          {navItems.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-900">{user?.name ?? '—'}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5">
          Nível {user?.level ?? 1} · {user?.xp ?? 0} XP
        </p>
        <XPBar pct={user ? xpPct(user.xp, user.level) : 0} className="mt-2" />
      </div>
    </aside>
  );
}
