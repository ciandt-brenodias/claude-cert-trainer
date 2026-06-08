import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionsService } from '../questions/questions.service';
import { Domain, Difficulty, ExamMode } from '@cert-trainer/shared';

const mockQuestion = {
  id: 'q-uuid-1',
  domain: Domain.AGENTIC_ARCHITECTURE,
  difficulty: Difficulty.MEDIUM,
  text: 'Test question?',
  options: ['A', 'B', 'C', 'D'],
  correctIndex: 1,
  explanation: 'Because B.',
  source: 'anthropic',
};

const mockSession = {
  id: 'session-uuid-1',
  userId: 'user-uuid-1',
  mode: 'PRACTICE',
  domain: null,
  startedAt: new Date(),
  finishedAt: null,
  score: null,
  totalTime: null,
};

describe('ExamsService', () => {
  let service: ExamsService;
  let prisma: {
    examSession: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    examAnswer: { create: jest.Mock };
    domainProgress: { upsert: jest.Mock };
    user: { update: jest.Mock };
    question: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };
  let questionsService: { findRandom: jest.Mock };

  beforeEach(async () => {
    prisma = {
      examSession: {
        create: jest.fn().mockResolvedValue(mockSession),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      examAnswer: {
        create: jest.fn().mockReturnValue({}),
      },
      domainProgress: {
        upsert: jest.fn().mockReturnValue({}),
      },
      user: {
        update: jest.fn().mockReturnValue({}),
      },
      question: {
        findUnique: jest.fn().mockResolvedValue(mockQuestion),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    questionsService = {
      findRandom: jest.fn().mockResolvedValue([mockQuestion]),
    };

    const module = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: PrismaService, useValue: prisma },
        { provide: QuestionsService, useValue: questionsService },
      ],
    }).compile();

    service = module.get(ExamsService);
  });

  describe('create', () => {
    it('creates a PRACTICE session by default and returns questions', async () => {
      const result = await service.create('user-uuid-1', { questionCount: 10 });

      expect(result.sessionId).toBe('session-uuid-1');
      expect(result.mode).toBe(ExamMode.PRACTICE);
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0]).not.toHaveProperty('correctIndex');
    });

    it('creates a FULL_EXAM session when mode is specified', async () => {
      const fullExamSession = { ...mockSession, mode: ExamMode.FULL_EXAM, timeLimitMinutes: 120 };
      prisma.examSession.create.mockResolvedValue(fullExamSession);

      const result = await service.create('user-uuid-1', {
        questionCount: 65,
        mode: ExamMode.FULL_EXAM,
        timeLimitMinutes: 120,
      });

      expect(result.mode).toBe(ExamMode.FULL_EXAM);
      expect(result.timeLimitMinutes).toBe(120);
    });

    it('throws BadRequestException when no questions available', async () => {
      questionsService.findRandom.mockResolvedValue([]);

      await expect(
        service.create('user-uuid-1', { questionCount: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('passes domain filter to questionsService.findRandom', async () => {
      await service.create('user-uuid-1', { questionCount: 10, domain: Domain.AGENTIC_ARCHITECTURE });

      expect(questionsService.findRandom).toHaveBeenCalledWith(10, Domain.AGENTIC_ARCHITECTURE);
    });
  });

  describe('submitAnswer', () => {
    beforeEach(() => {
      prisma.examSession.findUnique.mockResolvedValue(mockSession);
    });

    it('returns isCorrect true when userAnswer matches correctIndex', async () => {
      const result = await service.submitAnswer('session-uuid-1', {
        questionId: 'q-uuid-1',
        userAnswer: 1,
        timeSpent: 5000,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.explanation).toBe('Because B.');
      expect(result.xpGained).toBe(20);
    });

    it('returns isCorrect false and xpGained 5 when userAnswer does not match', async () => {
      const result = await service.submitAnswer('session-uuid-1', {
        questionId: 'q-uuid-1',
        userAnswer: 0,
        timeSpent: 3000,
      });

      expect(result.isCorrect).toBe(false);
      expect(result.xpGained).toBe(5);
    });

    it('runs DomainProgress upsert and User.xp update in transaction', async () => {
      await service.submitAnswer('session-uuid-1', {
        questionId: 'q-uuid-1',
        userAnswer: 1,
        timeSpent: 5000,
      });

      expect(prisma.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([expect.anything(), expect.anything(), expect.anything()]),
      );
    });

    it('throws NotFoundException when session does not exist', async () => {
      prisma.examSession.findUnique.mockResolvedValue(null);

      await expect(
        service.submitAnswer('missing-session', { questionId: 'q-uuid-1', userAnswer: 0, timeSpent: 0 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when session is already finished', async () => {
      prisma.examSession.findUnique.mockResolvedValue({ ...mockSession, finishedAt: new Date() });

      await expect(
        service.submitAnswer('session-uuid-1', { questionId: 'q-uuid-1', userAnswer: 0, timeSpent: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when question does not exist', async () => {
      prisma.question.findUnique.mockResolvedValue(null);

      await expect(
        service.submitAnswer('session-uuid-1', { questionId: 'missing', userAnswer: 0, timeSpent: 0 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not return correctIndex/explanation for FULL_EXAM sessions', async () => {
      prisma.examSession.findUnique.mockResolvedValue({ ...mockSession, mode: ExamMode.FULL_EXAM });

      const result = await service.submitAnswer('session-uuid-1', {
        questionId: 'q-uuid-1',
        userAnswer: 1,
        timeSpent: 5000,
      });

      expect(result).not.toHaveProperty('correctIndex');
      expect(result).not.toHaveProperty('explanation');
      expect(result.isCorrect).toBeNull();
      expect(result.xpGained).toBe(20);
    });
  });

  describe('getResult', () => {
    const mockAnswers = [
      { isCorrect: true, questionId: 'q-uuid-1', userAnswer: 1, timeSpent: 5000, question: mockQuestion },
      { isCorrect: false, questionId: 'q-uuid-2', userAnswer: 0, timeSpent: 3000, question: { ...mockQuestion, id: 'q-uuid-2', correctIndex: 2 } },
    ];

    beforeEach(() => {
      prisma.examSession.findUnique.mockResolvedValue({ ...mockSession, answers: mockAnswers });
    });

    it('calculates score correctly', async () => {
      const result = await service.getResult('session-uuid-1');

      expect(result.totalAnswered).toBe(2);
      expect(result.totalCorrect).toBe(1);
      expect(result.score).toBe(50);
    });

    it('includes byDomain breakdown', async () => {
      const result = await service.getResult('session-uuid-1');

      expect(result.byDomain).toHaveLength(1);
      expect(result.byDomain[0].domain).toBe(Domain.AGENTIC_ARCHITECTURE);
      expect(result.byDomain[0].pct).toBe(50);
    });

    it('includes only wrong answers in wrongAnswers list', async () => {
      const result = await service.getResult('session-uuid-1');

      expect(result.wrongAnswers).toHaveLength(1);
      expect(result.wrongAnswers[0].userAnswer).toBe(0);
      expect(result.wrongAnswers[0].correctIndex).toBe(2);
    });

    it('throws NotFoundException when session does not exist', async () => {
      prisma.examSession.findUnique.mockResolvedValue(null);

      await expect(service.getResult('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
