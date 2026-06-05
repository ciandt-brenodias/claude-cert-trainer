import { motion } from 'framer-motion';

interface XPBarProps {
  pct: number;
  className?: string;
}

export function XPBar({ pct, className = '' }: XPBarProps) {
  return (
    <div className={`bg-gray-100 rounded-full h-1.5 overflow-hidden ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className="h-full bg-indigo-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
      />
    </div>
  );
}
