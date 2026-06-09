import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import type { Tool, ToolUseBlock } from '@anthropic-ai/sdk/resources/messages';
import { Domain, Difficulty } from '@cert-trainer/shared';

const EXPLAIN_SYSTEM_PROMPT = `You are a concise CCA-F (Claude Certified Associate Fundamentals) exam tutor.

When given a multiple-choice question, explain:
1. Why the correct answer is correct (cite the relevant Claude/Anthropic concept)
2. Why each incorrect option is wrong (one sentence per option)

Be specific and educational. Avoid filler. Return plain text, no markdown headers.`;

const GENERATE_SYSTEM_PROMPT = `You are an expert question author for the CCA-F (Claude Certified Associate Fundamentals) certification exam.

Create multiple-choice questions that test practical understanding of Claude and Anthropic's ecosystem.
Base all content strictly on official Anthropic documentation and certification material.

Guidelines:
- Questions must be scenario-based or conceptual, not trivia
- Each option must be plausible — no obviously wrong distractors
- The correct answer must be unambiguous and defensible
- Explanation must cite the specific Claude/Anthropic concept
- Options must be distinct and not overlap semantically`;

const GENERATE_TOOL: Tool = {
  name: 'create_questions',
  description: 'Create multiple-choice exam questions for the CCA-F certification',
  input_schema: {
    type: 'object' as const,
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            domain: { type: 'string', enum: Object.values(Domain) },
            difficulty: { type: 'string', enum: Object.values(Difficulty) },
            text: { type: 'string', description: 'The question text' },
            options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
            correctIndex: { type: 'number', minimum: 0, maximum: 3 },
            explanation: { type: 'string', description: 'Why the correct answer is right' },
          },
          required: ['domain', 'difficulty', 'text', 'options', 'correctIndex', 'explanation'],
        },
      },
    },
    required: ['questions'],
  },
};

export interface GeneratedQuestion {
  domain: Domain;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GenerateQuestionsInput {
  count: number;
  domain?: Domain;
  difficulty?: Difficulty;
}

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
          text: EXPLAIN_SYSTEM_PROMPT,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cache_control: { type: 'ephemeral' } as any,
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    });

    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }

  async generateQuestions(input: GenerateQuestionsInput): Promise<GeneratedQuestion[]> {
    const domainClause = input.domain
      ? `Domain: ${input.domain}`
      : `Distribute evenly across all 5 domains: ${Object.values(Domain).join(', ')}`;
    const difficultyClause = input.difficulty
      ? `Difficulty: ${input.difficulty}`
      : 'Mix difficulties: approximately 30% EASY, 50% MEDIUM, 20% HARD';

    const userMessage = `Generate exactly ${input.count} CCA-F multiple-choice question(s).
${domainClause}
${difficultyClause}

Use the create_questions tool to return the structured output.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: GENERATE_SYSTEM_PROMPT,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cache_control: { type: 'ephemeral' } as any,
        },
      ],
      tools: [GENERATE_TOOL],
      tool_choice: { type: 'tool', name: 'create_questions' },
      messages: [{ role: 'user', content: userMessage }],
    });

    const toolBlock = response.content.find((b): b is ToolUseBlock => b.type === 'tool_use');
    if (!toolBlock) return [];

    const parsed = toolBlock.input as { questions: GeneratedQuestion[] };
    return parsed.questions ?? [];
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
