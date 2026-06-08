import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Domain } from '@cert-trainer/shared';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getDomainProgress(userId: string) {
    const rows = await this.prisma.domainProgress.findMany({
      where: { userId },
      orderBy: { domain: 'asc' },
    });

    return rows.map((r) => ({
      domain: r.domain as Domain,
      totalAnswered: r.totalAnswered,
      totalCorrect: r.totalCorrect,
      xpEarned: r.xpEarned,
      accuracy: r.totalAnswered > 0 ? Math.round((r.totalCorrect / r.totalAnswered) * 100) : 0,
    }));
  }

  async getStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [domainProgress, todayAnswers] = await Promise.all([
      this.prisma.domainProgress.findMany({ where: { userId } }),
      this.prisma.examAnswer.count({
        where: {
          session: { userId, startedAt: { gte: today } },
        },
      }),
    ]);

    const totalAnswered = domainProgress.reduce((sum, r) => sum + r.totalAnswered, 0);
    const totalCorrect = domainProgress.reduce((sum, r) => sum + r.totalCorrect, 0);
    const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return { questionsToday: todayAnswers, overallAccuracy };
  }

  async getBadges(userId: string) {
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    return userBadges.map((ub) => ({
      badgeId: ub.badgeId,
      slug: ub.badge.slug,
      name: ub.badge.name,
      description: ub.badge.description,
      domain: ub.badge.domain,
      earnedAt: ub.earnedAt.toISOString(),
    }));
  }

  async getWrongAnswers(userId: string) {
    const answers = await this.prisma.examAnswer.findMany({
      where: { session: { userId } },
      orderBy: { session: { startedAt: 'asc' } },
      select: {
        questionId: true,
        isCorrect: true,
        session: { select: { startedAt: true } },
        question: {
          select: {
            id: true,
            domain: true,
            difficulty: true,
            text: true,
            options: true,
            correctIndex: true,
            explanation: true,
          },
        },
      },
    });

    const byQuestion = new Map<string, { isCorrect: boolean }[]>();
    for (const a of answers) {
      const list = byQuestion.get(a.questionId) ?? [];
      list.push({ isCorrect: a.isCorrect });
      byQuestion.set(a.questionId, list);
    }

    const wrongQuestions: Array<{
      questionId: string;
      domain: string;
      difficulty: string;
      text: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }> = [];

    for (const [questionId, history] of byQuestion) {
      const everWrong = history.some((h) => !h.isCorrect);
      if (!everWrong) continue;

      const last2 = history.slice(-2);
      const mastered = last2.length === 2 && last2.every((h) => h.isCorrect);
      if (mastered) continue;

      const answer = answers.find((a) => a.questionId === questionId)!;
      wrongQuestions.push({
        questionId,
        domain: answer.question.domain,
        difficulty: answer.question.difficulty,
        text: answer.question.text,
        options: answer.question.options as string[],
        correctIndex: answer.question.correctIndex,
        explanation: answer.question.explanation,
      });
    }

    return wrongQuestions;
  }

  async getSessions(userId: string) {
    const sessions = await this.prisma.examSession.findMany({
      where: { userId, finishedAt: { not: null } },
      orderBy: { finishedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        mode: true,
        domain: true,
        startedAt: true,
        finishedAt: true,
        score: true,
        totalTime: true,
        _count: { select: { answers: true } },
      },
    });

    return sessions.map((s) => ({
      id: s.id,
      mode: s.mode,
      domain: s.domain,
      startedAt: s.startedAt.toISOString(),
      finishedAt: s.finishedAt!.toISOString(),
      score: s.score,
      totalTime: s.totalTime,
      totalAnswered: s._count.answers,
    }));
  }
}
