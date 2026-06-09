import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Difficulty } from '@cert-trainer/shared';

const XP_TABLE: Record<Difficulty, { correct: number; wrong: number }> = {
  [Difficulty.EASY]:   { correct: 10, wrong: 2 },
  [Difficulty.MEDIUM]: { correct: 20, wrong: 2 },
  [Difficulty.HARD]:   { correct: 35, wrong: 2 },
};

const STREAK_BONUS_XP = 5;
const STREAK_BONUS_THRESHOLD = 7;

const LEVELS = [0, 200, 500, 1000, 2000];

export interface BadgeEarned {
  slug: string;
  name: string;
  description: string;
}

export interface BadgeEvaluationContext {
  userId: string;
  domain: string;
  totalCorrectInDomain: number;
  currentStreak: number;
  totalCorrectEver: number;
}

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  calculateXp(difficulty: Difficulty, isCorrect: boolean, currentStreak: number): number {
    const base = isCorrect
      ? XP_TABLE[difficulty].correct
      : XP_TABLE[difficulty].wrong;

    const streakBonus = isCorrect && currentStreak >= STREAK_BONUS_THRESHOLD ? STREAK_BONUS_XP : 0;
    return base + streakBonus;
  }

  calculateLevel(totalXp: number): number {
    let level = 1;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalXp >= LEVELS[i]) {
        level = i + 1;
        break;
      }
    }
    return level;
  }

  async evaluateBadges(ctx: BadgeEvaluationContext): Promise<BadgeEarned[]> {
    const allBadges = await this.prisma.badge.findMany();
    const alreadyEarned = await this.prisma.userBadge.findMany({
      where: { userId: ctx.userId },
      select: { badgeId: true },
    });
    const earnedIds = new Set(alreadyEarned.map((ub) => ub.badgeId));

    const toAward: typeof allBadges = [];

    for (const badge of allBadges) {
      if (earnedIds.has(badge.id)) continue;

      const condition = badge.condition as { type: string; value: number };

      if (this.conditionMet(condition, ctx, badge.domain)) {
        toAward.push(badge);
      }
    }

    if (toAward.length === 0) return [];

    await this.prisma.userBadge.createMany({
      data: toAward.map((b) => ({ userId: ctx.userId, badgeId: b.id })),
      skipDuplicates: true,
    });

    return toAward.map((b) => ({
      slug: b.slug,
      name: b.name,
      description: b.description,
    }));
  }

  private conditionMet(
    condition: { type: string; value: number },
    ctx: BadgeEvaluationContext,
    badgeDomain: string | null,
  ): boolean {
    switch (condition.type) {
      case 'count':
        return ctx.totalCorrectEver >= condition.value;

      case 'streak':
        return ctx.currentStreak >= condition.value;

      case 'accuracy': {
        const isForDomain = badgeDomain !== null;
        if (isForDomain) {
          return ctx.domain === badgeDomain && ctx.totalCorrectInDomain >= condition.value;
        }
        return ctx.totalCorrectEver >= condition.value;
      }

      default:
        return false;
    }
  }
}
