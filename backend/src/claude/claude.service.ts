import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a concise CCA-F (Claude Certified Associate Fundamentals) exam tutor.

When given a multiple-choice question, explain:
1. Why the correct answer is correct (cite the relevant Claude/Anthropic concept)
2. Why each incorrect option is wrong (one sentence per option)

Be specific and educational. Avoid filler. Return plain text, no markdown headers.`;

export interface ExplainQuestionInput {
  questionText: string;
  options: string[];
  correctIndex: number;
  userAnswer: number;
}

@Injectable()
export class ClaudeService {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_AUTH_TOKEN,
      baseURL: process.env.ANTHROPIC_BASE_URL,
    });
    this.model = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001';
  }

  async explainQuestion(input: ExplainQuestionInput): Promise<string> {
    const userMessage = this.buildExplainPrompt(input);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cache_control: { type: 'ephemeral' } as any,
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    });

    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }

  private buildExplainPrompt(input: ExplainQuestionInput): string {
    const optionLines = input.options
      .map((opt, i) => {
        const label = String.fromCharCode(65 + i);
        const isCorrect = i === input.correctIndex;
        const isUserAnswer = input.userAnswer >= 0 && i === input.userAnswer && !isCorrect;
        const marker = isCorrect ? ' [CORRECT]' : isUserAnswer ? ' [USER SELECTED]' : '';
        return `${label}) ${opt}${marker}`;
      })
      .join('\n');

    return `Question: ${input.questionText}

Options:
${optionLines}

Explain why the correct answer is right and why each wrong option is incorrect.`;
  }
}
