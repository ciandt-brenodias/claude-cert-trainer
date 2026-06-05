import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mockQuestions } from '../../data/mock';
import { DomainBadge, DifficultyBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

const TOTAL = 60;
const DEMO_CURRENT = 22;

export function ExamView() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = mockQuestions[1];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 shrink-0">Simulado CCA-F</span>
          <div className="flex-1">
            <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(DEMO_CURRENT / TOTAL) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-gray-400 font-mono mt-1">{DEMO_CURRENT}/{TOTAL}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-mono text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
              ⏱ 01:47:23
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <p className="text-xs text-gray-400 font-mono mb-4">Questão {DEMO_CURRENT} de {TOTAL}</p>

          <div className="flex items-center gap-2 mb-4">
            <DomainBadge domain={question.domain} />
            <DifficultyBadge difficulty={question.difficulty} />
          </div>

          <p className="text-lg font-medium text-gray-900 leading-relaxed mb-6">
            {question.text}
          </p>

          <div className="space-y-3">
            {question.options.map((opt, idx) => (
              <motion.button
                key={idx}
                className={`w-full text-left p-4 rounded-lg border transition-all text-sm ${
                  selectedOption === idx
                    ? 'border-indigo-400 bg-indigo-50 text-gray-900'
                    : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => setSelectedOption(idx)}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.15 }}
                aria-label={`Opção ${String.fromCharCode(65 + idx)}: ${opt}`}
              >
                <span className="font-mono text-xs text-gray-400 mr-2">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </motion.button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="secondary" size="sm">← Anterior</Button>
            <Button
              onClick={() => navigate('/exam/result')}
              disabled={selectedOption === null}
            >
              Próxima →
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
