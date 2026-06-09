import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Domain, Difficulty, Language } from '@cert-trainer/shared';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(domain?: Domain, difficulty?: Difficulty, language?: Language) {
    const questions = await this.prisma.question.findMany({
      where: {
        isApproved: true,
        ...(domain && { domain }),
        ...(difficulty && { difficulty }),
        ...(language && { language }),
      },
      select: {
        id: true,
        domain: true,
        difficulty: true,
        text: true,
        options: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return questions.map((q) => ({
      id: q.id,
      domain: q.domain,
      difficulty: q.difficulty,
      text: q.text,
      options: q.options as string[],
    }));
  }

  async findById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) throw new NotFoundException(`Question ${id} not found`);

    return {
      ...question,
      options: question.options as string[],
    };
  }

  async findRandom(count: number, domain?: Domain, language?: Language): Promise<{ id: string; domain: Domain; difficulty: Difficulty; text: string; options: string[] }[]> {
    const available = await this.prisma.question.findMany({
      where: {
        isApproved: true,
        ...(domain && { domain }),
        ...(language && { language }),
      },
      select: {
        id: true,
        domain: true,
        difficulty: true,
        text: true,
        options: true,
      },
    });

    const shuffled = available.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((q) => ({
      ...q,
      domain: q.domain as Domain,
      difficulty: q.difficulty as Difficulty,
      options: q.options as string[],
    }));
  }
}
