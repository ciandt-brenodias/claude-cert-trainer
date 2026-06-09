import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionsService } from '../questions/questions.service';
import { Difficulty, Domain, ExamMode, Language } from '@cert-trainer/shared';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { BadgeEarned, GamificationService } from '../gamification/gamification.service';

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionsService: QuestionsService,
    private readonly gamification: GamificationService,
  ) {}

  async create(userId: string, dto: CreateExamDto) {
    const mode = dto.mode ?? ExamMode.PRACTICE;
    const questions = await this.questionsService.findRandom(dto.questionCount, dto.domain, dto.language ?? Language.EN);

    if (questions.length === 0) {
      throw new BadRequestException('No questions available for the given filters');
    }

    const session = await this.prisma.examSession.create({
      data: {
        userId,
        mode,
        domain: dto.domain ?? null,
        timeLimitMinutes: dto.timeLimitMinutes ?? null,
      },
    });

    const safeQuestions = questions.map(({ id, domain, difficulty, text, options }) => ({
      id,
      domain,
      difficulty,
      text,
      options,
    }));

    return { sessionId: session.id, mode, timeLimitMinutes: session.timeLimitMinutes, questions: safeQuestions };
  }

  async submitAnswer(sessionId: string, dto: SubmitAnswerDto) {
    const session = await this.prisma.examSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);
    if (session.finishedAt) throw new BadRequestException('Session already finished');

    const [question, user] = await Promise.all([
      this.prisma.question.findUnique({ where: { id: dto.questionId } }),
      this.prisma.user.findUnique({ where: { id: session.userId } }),
    ]);
    if (!question) throw new NotFoundException(`Question ${dto.questionId} not found`);
    if (!user) throw new NotFoundException(`User ${session.userId} not found`);

    const isCorrect = question.correctIndex === dto.userAnswer;
    const xpGained = this.gamification.calculateXp(
      question.difficulty as Difficulty,
      isCorrect,
      user.currentStreak,
    );

    const [, updatedProgress] = await this.prisma.$transaction([
      this.prisma.examAnswer.create({
        data: {
          sessionId,
          questionId: dto.questionId,
          userAnswer: dto.userAnswer,
          isCorrect,
          timeSpent: dto.timeSpent,
        },
      }),
      this.prisma.domainProgress.upsert({
        where: { userId_domain: { userId: session.userId, domain: question.domain } },
        create: {
          userId: session.userId,
          domain: question.domain,
          totalAnswered: 1,
          totalCorrect: isCorrect ? 1 : 0,
          xpEarned: xpGained,
        },
        update: {
          totalAnswered: { increment: 1 },
          totalCorrect: { increment: isCorrect ? 1 : 0 },
          xpEarned: { increment: xpGained },
        },
      }),
      this.prisma.user.update({
        where: { id: session.userId },
        data: { xp: { increment: xpGained } },
      }),
    ]);

    const totalCorrectInDomain = updatedProgress.totalCorrect;
    const allProgress = await this.prisma.domainProgress.findMany({ where: { userId: session.userId } });
    const totalCorrectEver = allProgress.reduce((sum, p) => sum + p.totalCorrect, 0);

    const badgesEarned: BadgeEarned[] = await this.gamification.evaluateBadges({
      userId: session.userId,
      domain: question.domain,
      totalCorrectInDomain,
      currentStreak: user.currentStreak,
      totalCorrectEver,
    });

    if (session.mode === ExamMode.FULL_EXAM) {
      return { isCorrect: null, xpGained, badgesEarned };
    }

    return {
      isCorrect,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      source: question.source,
      xpGained,
      badgesEarned,
    };
  }

  async getResult(sessionId: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: { question: true },
        },
      },
    });

    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

    const totalAnswered = session.answers.length;
    const totalCorrect = session.answers.filter((a) => a.isCorrect).length;
    const score = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const byDomain = this.buildDomainBreakdown(session.answers);
    const wrongAnswers = this.buildWrongAnswers(session.answers);

    if (!session.finishedAt) {
      await this.prisma.examSession.update({
        where: { id: sessionId },
        data: {
          finishedAt: new Date(),
          score,
          totalTime: session.answers.reduce((acc, a) => acc + a.timeSpent, 0),
        },
      });
    }

    return { sessionId, score, totalAnswered, totalCorrect, byDomain, wrongAnswers };
  }

  private buildDomainBreakdown(answers: Array<{ isCorrect: boolean; question: { domain: string } }>) {
    const map = new Map<string, { correct: number; total: number }>();

    for (const answer of answers) {
      const domain = answer.question.domain;
      const current = map.get(domain) ?? { correct: 0, total: 0 };
      map.set(domain, {
        correct: current.correct + (answer.isCorrect ? 1 : 0),
        total: current.total + 1,
      });
    }

    return Array.from(map.entries()).map(([domain, stats]) => ({
      domain: domain as Domain,
      correct: stats.correct,
      total: stats.total,
      pct: Math.round((stats.correct / stats.total) * 100),
    }));
  }

  private buildWrongAnswers(
    answers: Array<{
      isCorrect: boolean;
      questionId: string;
      userAnswer: number;
      question: { text: string; options: unknown; correctIndex: number; explanation: string };
    }>,
  ) {
    return answers
      .filter((a) => !a.isCorrect)
      .map((a) => ({
        questionId: a.questionId,
        text: a.question.text,
        options: a.question.options as string[],
        userAnswer: a.userAnswer,
        correctIndex: a.question.correctIndex,
        explanation: a.question.explanation,
      }));
  }
}
