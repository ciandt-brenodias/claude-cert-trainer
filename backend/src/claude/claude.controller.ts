import { Body, Controller, Post } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExplainQuestionDto } from './dto/explain-question.dto';

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
}
