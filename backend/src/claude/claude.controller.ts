import { Body, Controller, Post } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExplainQuestionDto } from './dto/explain-question.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import type { GeneratedQuestion } from './claude.service';

@Controller('claude')
export class ClaudeController {
  constructor(
    private readonly claudeService: ClaudeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('explain')
  async explain(@Body() dto: ExplainQuestionDto): Promise<{ explanation: string }> {
    const cached = await this.prisma.questionExplanation.findUnique({
      where: { questionId: dto.questionId },
    });

    if (cached) {
      return { explanation: cached.content };
    }

    const question = await this.prisma.question.findUniqueOrThrow({
      where: { id: dto.questionId },
    });

    const explanation = await this.claudeService.explainQuestion({
      questionText: question.text,
      options: question.options as string[],
      correctIndex: question.correctIndex,
      userAnswer: dto.userAnswer,
    });

    await this.prisma.questionExplanation.create({
      data: { questionId: dto.questionId, content: explanation },
    });

    return { explanation };
  }

  @Post('generate')
  async generate(@Body() dto: GenerateQuestionsDto): Promise<{ generated: number; questions: Omit<GeneratedQuestion, 'source'>[] }> {
    const generated = await this.claudeService.generateQuestions(dto);

    if (generated.length === 0) {
      return { generated: 0, questions: [] };
    }

    await this.prisma.question.createMany({
      data: generated.map((q) => ({ ...q, source: 'generated', isApproved: false })),
    });

    return { generated: generated.length, questions: generated };
  }
}
