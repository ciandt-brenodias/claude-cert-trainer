import { create } from 'zustand';
import type { SafeQuestion } from '../api/questions';
import type { BadgeEarned, ExamResult, SubmitAnswerResponse } from '../api/exams';
import type { Domain, ExamMode, Language } from '@cert-trainer/shared';
import { createExam, submitAnswer as apiSubmitAnswer, getExamResult } from '../api/exams';

type SessionStatus = 'idle' | 'loading' | 'in_progress' | 'submitting' | 'finished' | 'error';

interface AnswerRecord {
  questionId: string;
  userAnswer: number;
  timeSpent: number;
  feedback: SubmitAnswerResponse;
}

interface PracticeSessionState {
  status: SessionStatus;
  sessionId: string | null;
  mode: ExamMode | null;
  timeLimitMinutes: number | null;
  questions: SafeQuestion[];
  currentIdx: number;
  answers: AnswerRecord[];
  result: ExamResult | null;
  error: string | null;
  pendingBadges: BadgeEarned[];

  startSession: (opts: { domain?: Domain; questionCount: 10 | 20 | 40 | 65; mode?: ExamMode; timeLimitMinutes?: number; language?: Language }) => Promise<void>;
  submitAnswer: (questionId: string, userAnswer: number, timeSpent: number) => Promise<SubmitAnswerResponse>;
  clearPendingBadges: () => void;
  finish: () => Promise<void>;
  reset: () => void;
}

const INITIAL: Pick<PracticeSessionState, 'status' | 'sessionId' | 'mode' | 'timeLimitMinutes' | 'questions' | 'currentIdx' | 'answers' | 'result' | 'error' | 'pendingBadges'> = {
  status: 'idle',
  sessionId: null,
  mode: null,
  timeLimitMinutes: null,
  questions: [],
  currentIdx: 0,
  answers: [],
  result: null,
  error: null,
  pendingBadges: [],
};

export const usePracticeSession = create<PracticeSessionState>((set, get) => ({
  ...INITIAL,

  async startSession({ domain, questionCount, mode, timeLimitMinutes, language }) {
    set({ status: 'loading', error: null });
    try {
      const response = await createExam({ domain, questionCount, mode, timeLimitMinutes, language });
      set({
        status: 'in_progress',
        sessionId: response.sessionId,
        mode: response.mode ?? null,
        timeLimitMinutes: response.timeLimitMinutes ?? null,
        questions: response.questions,
        currentIdx: 0,
        answers: [],
      });
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : 'Error starting session' });
    }
  },

  async submitAnswer(questionId, userAnswer, timeSpent) {
    const { sessionId } = get();
    if (!sessionId) throw new Error('No active session');

    set({ status: 'submitting' });
    const feedback = await apiSubmitAnswer(sessionId, { questionId, userAnswer, timeSpent });

    set((s) => ({
      status: 'in_progress',
      answers: [...s.answers, { questionId, userAnswer, timeSpent, feedback }],
      currentIdx: s.currentIdx + 1,
      pendingBadges: feedback.badgesEarned ?? [],
    }));

    return feedback;
  },

  clearPendingBadges() {
    set({ pendingBadges: [] });
  },

  async finish() {
    const { sessionId } = get();
    if (!sessionId) return;

    set({ status: 'loading' });
    try {
      const result = await getExamResult(sessionId);
      set({ status: 'finished', result });
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : 'Error finishing session' });
    }
  },

  reset() {
    set(INITIAL);
  },
}));
