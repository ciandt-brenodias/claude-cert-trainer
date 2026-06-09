import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePracticeSession } from '../../stores/practiceSession';
import { DomainBadge, DifficultyBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BadgeModal } from '../ui/BadgeModal';
import { ErrorScreen } from '../ui/ErrorScreen';
import type { SubmitAnswerResponse } from '../../api/exams';
import { ExamMode } from '@cert-trainer/shared';

export function QuestionView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { status, mode, questions, currentIdx, pendingBadges, clearPendingBadges, submitAnswer, finish, reset } = usePracticeSession();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<SubmitAnswerResponse | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const isFullExam = mode === ExamMode.FULL_EXAM;

  useEffect(() => {
    if (status === 'idle') navigate('/practice', { replace: true });
    if (status === 'finished') {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['domainProgress'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['wrongAnswers'] });
      navigate('/exam/result', { replace: true });
    }
  }, [status, navigate, queryClient]);

  useEffect(() => {
    setSelectedOption(null);
    setFeedback(null);
    setShowExplanation(false);
    setStartTime(Date.now());
  }, [currentIdx]);

  if (status === 'error') return <ErrorScreen message="Erro na sessão. Tente novamente." onRetry={() => { reset(); navigate('/practice'); }} />;
  if (!questions.length) return null;

  const question = questions[currentIdx];
  const total = questions.length;
  const current = currentIdx + 1;
  const isLastQuestion = currentIdx === total - 1;

  if (!question) return null;

  async function handleSelect(idx: number) {
    if (feedback) return;
    setSelectedOption(idx);
    const timeSpent = Date.now() - startTime;
    const result = await submitAnswer(question!.id, idx, timeSpent);
    setFeedback(result);
  }

  async function handleNext() {
    if (isLastQuestion) {
      await finish();
    }
  }

  function optionClass(idx: number): string {
    const base = 'w-full text-left p-4 rounded-lg border transition-all text-sm';
    if (!feedback) return `${base} border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer text-gray-700`;
    if (!isFullExam && idx === feedback.correctIndex) return `${base} border-emerald-400 bg-emerald-50 text-emerald-800`;
    if (!isFullExam && idx === selectedOption) return `${base} border-red-400 bg-red-50 text-red-800`;
    if (isFullExam && idx === selectedOption) return `${base} border-indigo-400 bg-indigo-50 text-indigo-800`;
    return `${base} border-gray-100 text-gray-400 bg-gray-50`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BadgeModal badges={pendingBadges} onClose={clearPendingBadges} />
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => { reset(); navigate('/practice'); }}>
            ✕ Sair
          </Button>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-400 font-mono">{current} / {total}</span>
              {isFullExam && (
                <span className="text-xs font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">SIMULADO</span>
              )}
            </div>
            <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(current / total) * 100}%` }}
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

            <p className="text-lg font-medium text-gray-900 leading-relaxed mb-6">{question.text}</p>

            <div className="space-y-3">
              {question.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  className={optionClass(idx)}
                  onClick={() => handleSelect(idx)}
                  whileHover={feedback ? {} : { scale: 1.005 }}
                  whileTap={feedback ? {} : { scale: 0.995 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="font-mono text-xs text-gray-400 mr-2">{String.fromCharCode(65 + idx)}</span>
                  {opt}
                  {!isFullExam && feedback && idx === feedback.correctIndex && (
                    <span className="ml-2 text-emerald-600 font-semibold">✓</span>
                  )}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mt-6"
                >
                  {!isFullExam && (
                    <div className={`p-4 rounded-lg border ${feedback.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                      <p className={`text-sm font-medium ${feedback.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                        {feedback.isCorrect ? '✓ Correto!' : '✗ Incorreto'}
                        {feedback.isCorrect && (
                          <span className="ml-2 text-xs font-mono bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">
                            +{feedback.xpGained} XP
                          </span>
                        )}
                      </p>

                      {showExplanation ? (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{feedback.explanation}</p>
                      ) : (
                        <button
                          onClick={() => setShowExplanation(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 flex items-center gap-1 transition-colors"
                        >
                          Ver explicação ✦
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <Button onClick={handleNext} disabled={status === 'loading' || status === 'submitting'}>
                      {isLastQuestion ? 'Finalizar' : 'Próxima →'}
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
