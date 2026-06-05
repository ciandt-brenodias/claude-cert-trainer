import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mockQuestions } from '../../data/mock';
import { DomainBadge, DifficultyBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

const TOTAL = 20;

export function QuestionView() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = mockQuestions[currentIdx % mockQuestions.length];
  const current = currentIdx + 1;
  const isCorrect = selectedOption === question.correctIndex;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);
  }

  function handleNext() {
    setCurrentIdx((i) => i + 1);
    setSelectedOption(null);
    setAnswered(false);
    setShowExplanation(false);
  }

  function optionClass(idx: number): string {
    const base = 'w-full text-left p-4 rounded-lg border transition-all text-sm';
    if (!answered) {
      return `${base} border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer text-gray-700`;
    }
    if (idx === question.correctIndex) return `${base} border-emerald-400 bg-emerald-50 text-emerald-800`;
    if (idx === selectedOption)        return `${base} border-red-400 bg-red-50 text-red-800`;
    return `${base} border-gray-100 text-gray-400 bg-gray-50`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/practice')}>
            ✕ Sair
          </Button>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-400 font-mono">{current} / {TOTAL}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(current / TOTAL) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
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
                  className={optionClass(idx)}
                  onClick={() => handleSelect(idx)}
                  whileHover={answered ? {} : { scale: 1.005 }}
                  whileTap={answered ? {} : { scale: 0.995 }}
                  transition={{ duration: 0.15 }}
                  aria-label={`Opção ${String.fromCharCode(65 + idx)}: ${opt}`}
                >
                  <span className="font-mono text-xs text-gray-400 mr-2">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                  {answered && idx === question.correctIndex && (
                    <span className="ml-2 text-emerald-600 font-semibold">✓</span>
                  )}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mt-6"
                >
                  <div className={`p-4 rounded-lg border ${
                    isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <p className={`text-sm font-medium ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isCorrect ? '✓ Correto!' : '✗ Incorreto'}
                      {isCorrect && (
                        <span className="ml-2 text-xs font-mono bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">
                          +20 XP
                        </span>
                      )}
                    </p>

                    {showExplanation ? (
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {question.explanation}
                      </p>
                    ) : (
                      <button
                        onClick={() => setShowExplanation(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 flex items-center gap-1 transition-colors"
                      >
                        Ver explicação com IA ✦
                      </button>
                    )}
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button onClick={handleNext}>
                      {current < TOTAL ? 'Próxima →' : 'Finalizar'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
