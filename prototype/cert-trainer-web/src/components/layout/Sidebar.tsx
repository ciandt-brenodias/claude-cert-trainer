import { NavLink } from 'react-router-dom';
import { mockUser, xpForLevel } from '../../data/mock';
import { XPBar } from '../ui/XPBar';

const navItems = [
  { to: '/',        label: 'Dashboard' },
  { to: '/practice', label: 'Praticar'  },
  { to: '/exam',    label: 'Simulado'  },
  { to: '/review',  label: 'Revisar'   },
  { to: '/profile', label: 'Perfil'    },
];

export function Sidebar() {
  const { name, xp, level } = mockUser;
  const { pct } = xpForLevel(level);

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 font-mono tracking-tight">
          cert-trainer
        </span>
      </div>

      <nav className="flex-1 p-3" aria-label="Navegação principal">
        <ul className="space-y-0.5">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
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
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5">
          Nível {level} · {xp} XP
        </p>
        <XPBar pct={pct} className="mt-2" />
      </div>
    </aside>
  );
}
