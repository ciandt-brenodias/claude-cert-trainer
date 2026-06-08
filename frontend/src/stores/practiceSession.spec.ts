import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Domain, Difficulty, ExamMode } from '@cert-trainer/shared';
import { usePracticeSession } from './practiceSession';

vi.mock('../api/exams', () => ({
  createExam: vi.fn(),
  submitAnswer: vi.fn(),
  getExamResult: vi.fn(),
}));

import { createExam, submitAnswer as apiSubmitAnswer, getExamResult } from '../api/exams';

const mockQuestion = {
  id: 'q-1',
  domain: Domain.AGENTIC_ARCHITECTURE,
  difficulty: Difficulty.MEDIUM,
  text: 'Question 1?',
  options: ['A', 'B', 'C', 'D'],
};

const mockFeedback = {
  isCorrect: true,
  correctIndex: 1,
  explanation: 'Because B.',
  source: 'anthropic',
  xpGained: 20,
};

const mockFullExamFeedback = {
  isCorrect: null,
  xpGained: 20,
};

const mockCreateResponse = {
  sessionId: 'session-1',
  mode: ExamMode.PRACTICE,
  timeLimitMinutes: null,
  questions: [mockQuestion],
};

const mockResult = {
  sessionId: 'session-1',
  score: 100,
  totalAnswered: 1,
  totalCorrect: 1,
  byDomain: [],
  wrongAnswers: [],
};

describe('practiceSession store', () => {
  beforeEach(() => {
    usePracticeSession.getState().reset();
    vi.clearAllMocks();
  });

  it('starts in idle state', () => {
    const { status, sessionId, questions, mode } = usePracticeSession.getState();
    expect(status).toBe('idle');
    expect(sessionId).toBeNull();
    expect(questions).toHaveLength(0);
    expect(mode).toBeNull();
  });

  it('transitions to in_progress after startSession', async () => {
    vi.mocked(createExam).mockResolvedValue(mockCreateResponse);

    await usePracticeSession.getState().startSession({ questionCount: 10 });

    const { status, sessionId, questions, mode } = usePracticeSession.getState();
    expect(status).toBe('in_progress');
    expect(sessionId).toBe('session-1');
    expect(questions).toHaveLength(1);
    expect(mode).toBe(ExamMode.PRACTICE);
  });

  it('stores mode and timeLimitMinutes for FULL_EXAM sessions', async () => {
    vi.mocked(createExam).mockResolvedValue({
      ...mockCreateResponse,
      mode: ExamMode.FULL_EXAM,
      timeLimitMinutes: 120,
    });

    await usePracticeSession.getState().startSession({ questionCount: 65, mode: ExamMode.FULL_EXAM, timeLimitMinutes: 120 });

    const { mode, timeLimitMinutes } = usePracticeSession.getState();
    expect(mode).toBe(ExamMode.FULL_EXAM);
    expect(timeLimitMinutes).toBe(120);
  });

  it('transitions to error when startSession fails', async () => {
    vi.mocked(createExam).mockRejectedValue(new Error('Network error'));

    await usePracticeSession.getState().startSession({ questionCount: 10 });

    expect(usePracticeSession.getState().status).toBe('error');
    expect(usePracticeSession.getState().error).toBe('Network error');
  });

  it('increments currentIdx after submitAnswer', async () => {
    vi.mocked(createExam).mockResolvedValue({ ...mockCreateResponse, questions: [mockQuestion, mockQuestion] });
    vi.mocked(apiSubmitAnswer).mockResolvedValue(mockFeedback);

    await usePracticeSession.getState().startSession({ questionCount: 10 });
    expect(usePracticeSession.getState().currentIdx).toBe(0);

    await usePracticeSession.getState().submitAnswer('q-1', 1, 5000);
    expect(usePracticeSession.getState().currentIdx).toBe(1);
    expect(usePracticeSession.getState().answers).toHaveLength(1);
  });

  it('stores null isCorrect feedback for FULL_EXAM answers', async () => {
    vi.mocked(createExam).mockResolvedValue({ ...mockCreateResponse, mode: ExamMode.FULL_EXAM, timeLimitMinutes: 120 });
    vi.mocked(apiSubmitAnswer).mockResolvedValue(mockFullExamFeedback);

    await usePracticeSession.getState().startSession({ questionCount: 65, mode: ExamMode.FULL_EXAM });
    await usePracticeSession.getState().submitAnswer('q-1', 0, 5000);

    const { answers } = usePracticeSession.getState();
    expect(answers[0].feedback.isCorrect).toBeNull();
  });

  it('transitions to finished after finish()', async () => {
    vi.mocked(createExam).mockResolvedValue(mockCreateResponse);
    vi.mocked(getExamResult).mockResolvedValue(mockResult);

    await usePracticeSession.getState().startSession({ questionCount: 10 });
    await usePracticeSession.getState().finish();

    expect(usePracticeSession.getState().status).toBe('finished');
    expect(usePracticeSession.getState().result).toEqual(mockResult);
  });

  it('resets to idle state', async () => {
    vi.mocked(createExam).mockResolvedValue(mockCreateResponse);

    await usePracticeSession.getState().startSession({ questionCount: 10 });
    usePracticeSession.getState().reset();

    const { status, sessionId, questions, answers, mode } = usePracticeSession.getState();
    expect(status).toBe('idle');
    expect(sessionId).toBeNull();
    expect(questions).toHaveLength(0);
    expect(answers).toHaveLength(0);
    expect(mode).toBeNull();
  });
});
