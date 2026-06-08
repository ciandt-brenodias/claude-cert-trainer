import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Domain } from '@cert-trainer/shared';

const mockDomainProgress = [
  { domain: Domain.AGENTIC_ARCHITECTURE, totalAnswered: 10, totalCorrect: 8, xpEarned: 160 },
  { domain: Domain.PROMPT_ENGINEERING, totalAnswered: 5, totalCorrect: 3, xpEarned: 60 },
];

const mockUserBadge = {
  badgeId: 'badge-1',
  earnedAt: new Date('2026-06-01'),
  badge: {
    slug: 'first-correct',
    name: 'Primeira resposta',
    description: 'Acertou a primeira questão',
    domain: null,
  },
};

const mockSession = {
  id: 'session-1',
  mode: 'PRACTICE',
  domain: Domain.AGENTIC_ARCHITECTURE,
  startedAt: new Date('2026-06-01T10:00:00Z'),
  finishedAt: new Date('2026-06-01T10:15:00Z'),
  score: 80,
  totalTime: 900000,
  _count: { answers: 10 },
};

function makeAnswer(questionId: string, isCorrect: boolean) {
  return {
    questionId,
    isCorrect,
    session: { startedAt: new Date('2026-06-01T10:00:00Z') },
    question: {
      id: questionId,
      domain: Domain.AGENTIC_ARCHITECTURE,
      difficulty: 'MEDIUM',
      text: `Question ${questionId}`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 1,
      explanation: 'Because B.',
    },
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    domainProgress: { findMany: jest.Mock };
    examAnswer: { count: jest.Mock; findMany: jest.Mock };
    userBadge: { findMany: jest.Mock };
    examSession: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      domainProgress: { findMany: jest.fn().mockResolvedValue(mockDomainProgress) },
      examAnswer: { count: jest.fn().mockResolvedValue(7), findMany: jest.fn().mockResolvedValue([]) },
      userBadge: { findMany: jest.fn().mockResolvedValue([mockUserBadge]) },
      examSession: { findMany: jest.fn().mockResolvedValue([mockSession]) },
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('getDomainProgress', () => {
    it('returns domain progress with calculated accuracy', async () => {
      const result = await service.getDomainProgress('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].domain).toBe(Domain.AGENTIC_ARCHITECTURE);
      expect(result[0].accuracy).toBe(80);
      expect(result[1].accuracy).toBe(60);
    });

    it('returns 0 accuracy when totalAnswered is 0', async () => {
      prisma.domainProgress.findMany.mockResolvedValue([
        { domain: Domain.CONTEXT_MANAGEMENT, totalAnswered: 0, totalCorrect: 0, xpEarned: 0 },
      ]);

      const result = await service.getDomainProgress('user-1');

      expect(result[0].accuracy).toBe(0);
    });
  });

  describe('getStats', () => {
    it('returns questionsToday and overallAccuracy', async () => {
      const result = await service.getStats('user-1');

      expect(result.questionsToday).toBe(7);
      expect(result.overallAccuracy).toBe(73);
    });

    it('returns 0 accuracy when no answers exist', async () => {
      prisma.domainProgress.findMany.mockResolvedValue([]);

      const result = await service.getStats('user-1');

      expect(result.overallAccuracy).toBe(0);
    });
  });

  describe('getBadges', () => {
    it('returns user badges with badge info and ISO earnedAt', async () => {
      const result = await service.getBadges('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('first-correct');
      expect(result[0].earnedAt).toBe(new Date('2026-06-01').toISOString());
    });

    it('returns empty array when user has no badges', async () => {
      prisma.userBadge.findMany.mockResolvedValue([]);

      const result = await service.getBadges('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getSessions', () => {
    it('returns finished sessions with totalAnswered from _count', async () => {
      const result = await service.getSessions('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('session-1');
      expect(result[0].totalAnswered).toBe(10);
      expect(result[0].score).toBe(80);
    });

    it('returns ISO string dates', async () => {
      const result = await service.getSessions('user-1');

      expect(result[0].startedAt).toBe(new Date('2026-06-01T10:00:00Z').toISOString());
      expect(result[0].finishedAt).toBe(new Date('2026-06-01T10:15:00Z').toISOString());
    });

    it('queries only finished sessions, last 10, desc order', async () => {
      await service.getSessions('user-1');

      expect(prisma.examSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', finishedAt: { not: null } },
          take: 10,
          orderBy: { finishedAt: 'desc' },
        }),
      );
    });
  });

  describe('getWrongAnswers', () => {
    it('returns empty when user has no answers', async () => {
      prisma.examAnswer.findMany.mockResolvedValue([]);

      const result = await service.getWrongAnswers('user-1');

      expect(result).toEqual([]);
    });

    it('includes question answered wrongly with no follow-up', async () => {
      prisma.examAnswer.findMany.mockResolvedValue([makeAnswer('q-1', false)]);

      const result = await service.getWrongAnswers('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].questionId).toBe('q-1');
    });

    it('excludes question answered correctly twice consecutively', async () => {
      prisma.examAnswer.findMany.mockResolvedValue([
        makeAnswer('q-1', false),
        makeAnswer('q-1', true),
        makeAnswer('q-1', true),
      ]);

      const result = await service.getWrongAnswers('user-1');

      expect(result).toHaveLength(0);
    });

    it('keeps question when last 2 answers are not both correct', async () => {
      prisma.examAnswer.findMany.mockResolvedValue([
        makeAnswer('q-1', false),
        makeAnswer('q-1', true),
        makeAnswer('q-1', false),
      ]);

      const result = await service.getWrongAnswers('user-1');

      expect(result).toHaveLength(1);
    });

    it('keeps question when only 1 correct answer after wrong', async () => {
      prisma.examAnswer.findMany.mockResolvedValue([
        makeAnswer('q-1', false),
        makeAnswer('q-1', true),
      ]);

      const result = await service.getWrongAnswers('user-1');

      expect(result).toHaveLength(1);
    });

    it('excludes questions never answered wrong', async () => {
      prisma.examAnswer.findMany.mockResolvedValue([
        makeAnswer('q-1', true),
        makeAnswer('q-1', true),
      ]);

      const result = await service.getWrongAnswers('user-1');

      expect(result).toHaveLength(0);
    });
  });
});
