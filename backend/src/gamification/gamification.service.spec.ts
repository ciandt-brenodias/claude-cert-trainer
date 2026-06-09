import { Test } from '@nestjs/testing';
import { GamificationService, BadgeEvaluationContext } from './gamification.service';
import { PrismaService } from '../prisma/prisma.service';
import { Difficulty, Domain } from '@cert-trainer/shared';

const mockBadges = [
  { id: 'b-1', slug: 'first-correct', name: 'Primeira resposta', description: 'Acertou a primeira questão', domain: null, condition: { type: 'count', value: 1 } },
  { id: 'b-2', slug: 'streak-3', name: 'Streak 3 dias', description: '3 dias', domain: null, condition: { type: 'streak', value: 3 } },
  { id: 'b-3', slug: 'domain-agentic-bronze', name: 'Arquiteto Iniciante', description: '10 acertos', domain: Domain.AGENTIC_ARCHITECTURE, condition: { type: 'accuracy', value: 10 } },
];

describe('GamificationService', () => {
  let service: GamificationService;
  let prisma: {
    badge: { findMany: jest.Mock };
    userBadge: { findMany: jest.Mock; createMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      badge: { findMany: jest.fn().mockResolvedValue(mockBadges) },
      userBadge: {
        findMany: jest.fn().mockResolvedValue([]),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(GamificationService);
  });

  describe('calculateXp', () => {
    it.each([
      [Difficulty.EASY,   true,  0, 10],
      [Difficulty.MEDIUM, true,  0, 20],
      [Difficulty.HARD,   true,  0, 35],
      [Difficulty.EASY,   false, 0,  2],
      [Difficulty.MEDIUM, false, 0,  2],
      [Difficulty.HARD,   false, 0,  2],
    ])('%s correct=%s streak=%s → %s xp', (difficulty, isCorrect, streak, expected) => {
      expect(service.calculateXp(difficulty, isCorrect, streak)).toBe(expected);
    });

    it('adds streak bonus (+5) when correct and streak >= 7', () => {
      expect(service.calculateXp(Difficulty.MEDIUM, true, 7)).toBe(25);
      expect(service.calculateXp(Difficulty.HARD, true, 10)).toBe(40);
    });

    it('does not add streak bonus when wrong even with high streak', () => {
      expect(service.calculateXp(Difficulty.MEDIUM, false, 10)).toBe(2);
    });
  });

  describe('calculateLevel', () => {
    it.each([
      [0, 1],
      [199, 1],
      [200, 2],
      [499, 2],
      [500, 3],
      [999, 3],
      [1000, 4],
      [1999, 4],
      [2000, 5],
      [9999, 5],
    ])('%s xp → level %s', (xp, expectedLevel) => {
      expect(service.calculateLevel(xp)).toBe(expectedLevel);
    });
  });

  describe('evaluateBadges', () => {
    const baseCtx: BadgeEvaluationContext = {
      userId: 'user-1',
      domain: Domain.AGENTIC_ARCHITECTURE,
      totalCorrectInDomain: 0,
      currentStreak: 0,
      totalCorrectEver: 0,
    };

    it('awards first-correct badge when totalCorrectEver >= 1', async () => {
      const result = await service.evaluateBadges({ ...baseCtx, totalCorrectEver: 1 });

      expect(result.map((b) => b.slug)).toContain('first-correct');
    });

    it('awards streak-3 badge when currentStreak >= 3', async () => {
      const result = await service.evaluateBadges({ ...baseCtx, currentStreak: 3 });

      expect(result.map((b) => b.slug)).toContain('streak-3');
    });

    it('awards domain-agentic-bronze when totalCorrectInDomain >= 10 and domain matches', async () => {
      const result = await service.evaluateBadges({
        ...baseCtx,
        domain: Domain.AGENTIC_ARCHITECTURE,
        totalCorrectInDomain: 10,
        totalCorrectEver: 10,
      });

      expect(result.map((b) => b.slug)).toContain('domain-agentic-bronze');
    });

    it('does not award domain badge when domain does not match', async () => {
      const result = await service.evaluateBadges({
        ...baseCtx,
        domain: Domain.PROMPT_ENGINEERING,
        totalCorrectInDomain: 10,
        totalCorrectEver: 10,
      });

      expect(result.map((b) => b.slug)).not.toContain('domain-agentic-bronze');
    });

    it('does not award badges already earned', async () => {
      prisma.userBadge.findMany.mockResolvedValue([{ badgeId: 'b-1' }]);

      const result = await service.evaluateBadges({ ...baseCtx, totalCorrectEver: 5 });

      expect(result.map((b) => b.slug)).not.toContain('first-correct');
    });

    it('returns empty array when no conditions are met', async () => {
      const result = await service.evaluateBadges(baseCtx);

      expect(result).toHaveLength(0);
    });

    it('persists awarded badges via createMany', async () => {
      await service.evaluateBadges({ ...baseCtx, totalCorrectEver: 1 });

      expect(prisma.userBadge.createMany).toHaveBeenCalledWith({
        data: [{ userId: 'user-1', badgeId: 'b-1' }],
        skipDuplicates: true,
      });
    });
  });
});
