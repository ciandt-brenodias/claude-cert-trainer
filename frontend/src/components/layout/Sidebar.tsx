import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../hooks/useUser';
import { useLanguage } from '../../stores/language';
import { XPBar } from '../ui/XPBar';

const XP_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000];

function xpPct(xp: number, level: number): number {
  const floor = XP_THRESHOLDS[level - 1] ?? 0;
  const ceiling = XP_THRESHOLDS[level] ?? (XP_THRESHOLDS[XP_THRESHOLDS.length - 1]! * 2);
  return Math.min(100, ((xp - floor) / (ceiling - floor)) * 100);
}

export function Sidebar() {
  const { data: user } = useUser();
  const { t } = useTranslation();
  const { lang, setLang } = useLanguage();

  const navItems = [
    { to: '/',         label: t('nav.dashboard'), end: true  },
    { to: '/practice', label: t('nav.practice'),  end: false },
    { to: '/review',   label: t('nav.review'),    end: false },
    { to: '/profile',  label: t('nav.profile'),   end: false },
  ];

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 font-mono tracking-tight">
          cert-trainer
        </span>
      </div>

      <nav className="flex-1 p-3" aria-label={t('nav.ariaLabel')}>
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

      <div className="px-4 pt-3 pb-1 border-t border-gray-100 flex items-center gap-1">
        {(['en', 'pt-BR'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              lang === l
                ? 'bg-indigo-500 text-white'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {l === 'en' ? 'EN' : 'PT'}
          </button>
        ))}
      </div>

      <div className="p-4 pt-2">
        <p className="text-sm font-medium text-gray-900">{user?.name ?? '—'}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5">
          {t('sidebar.level', { level: user?.level ?? 1, xp: user?.xp ?? 0 })}
        </p>
        <XPBar pct={user ? xpPct(user.xp, user.level) : 0} className="mt-2" />
      </div>
    </aside>
  );
}
