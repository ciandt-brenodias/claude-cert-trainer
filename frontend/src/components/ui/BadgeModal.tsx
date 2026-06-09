import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { BadgeEarned } from '../../api/exams';
import { Button } from './Button';

const AUTO_CLOSE_MS = 4000;

interface BadgeModalProps {
  badges: BadgeEarned[];
  onClose: () => void;
}

export function BadgeModal({ badges, onClose }: BadgeModalProps) {
  const { t } = useTranslation();
  useEffect(() => {
    if (badges.length === 0) return;
    const timer = setTimeout(onClose, AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [badges, onClose]);

  return (
    <AnimatePresence>
      {badges.length > 0 && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl px-8 py-6 max-w-sm w-full mx-4 text-center"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3">🏅</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {badges.length === 1 ? t('badge.singular') : t('badge.plural', { count: badges.length })}
            </h2>

            <ul className="mt-4 space-y-2 text-left">
              {badges.map((b) => (
                <li key={b.slug} className="flex items-start gap-3 bg-indigo-50 rounded-lg px-3 py-2">
                  <span className="text-indigo-500 font-bold text-sm mt-0.5">✓</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Button variant="primary" size="sm" className="mt-5 w-full" onClick={onClose}>
              {t('badge.continueBtn')}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
