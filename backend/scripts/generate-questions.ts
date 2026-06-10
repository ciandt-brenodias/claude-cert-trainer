import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { Domain, Difficulty, Language } from '@cert-trainer/shared';
import type { Tool, ToolUseBlock } from '@anthropic-ai/sdk/resources/messages';

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
            language: { type: 'string', enum: Object.values(Language) },
            text: { type: 'string' },
            options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
            correctIndex: { type: 'number', minimum: 0, maximum: 3 },
            explanation: { type: 'string' },
          },
          required: ['domain', 'difficulty', 'language', 'text', 'options', 'correctIndex', 'explanation'],
        },
      },
    },
    required: ['questions'],
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const eqEntry = args.find((a) => a.startsWith(`${flag}=`));
    if (eqEntry) return eqEntry.slice(flag.length + 1);
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const count = parseInt(get('--count') ?? '5', 10);
  const domain = get('--domain') as Domain | undefined;
  const difficulty = get('--difficulty') as Difficulty | undefined;
  const langArg = get('--lang');
  const language: Language = langArg === 'pt-BR' ? Language.PT_BR : Language.EN;

  if (isNaN(count) || count < 1 || count > 20) {
    console.error('--count must be between 1 and 20');
    process.exit(1);
  }
  if (domain && !Object.values(Domain).includes(domain)) {
    console.error(`--domain must be one of: ${Object.values(Domain).join(', ')}`);
    process.exit(1);
  }
  if (difficulty && !Object.values(Difficulty).includes(difficulty)) {
    console.error(`--difficulty must be one of: ${Object.values(Difficulty).join(', ')}`);
    process.exit(1);
  }
  if (langArg && langArg !== 'en' && langArg !== 'pt-BR') {
    console.error('--lang must be "en" or "pt-BR"');
    process.exit(1);
  }

  return { count, domain, difficulty, language };
}

async function main() {
  const { count, domain, difficulty, language } = parseArgs();

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_AUTH_TOKEN,
    baseURL: process.env.ANTHROPIC_BASE_URL,
  });
  const model = process.env.ANTHROPIC_MODEL ?? 'anthropic.claude-4-5-haiku';
  const prisma = new PrismaClient();

  const domainClause = domain
    ? `Domain: ${domain}`
    : `Distribute evenly across all 5 domains: ${Object.values(Domain).join(', ')}`;
  const difficultyClause = difficulty
    ? `Difficulty: ${difficulty}`
    : 'Mix difficulties: approximately 30% EASY, 50% MEDIUM, 20% HARD';
  const languageClause = language === Language.PT_BR
    ? 'Language: Generate all questions and explanations in Brazilian Portuguese (pt-BR).'
    : 'Language: Generate all questions and explanations in English.';

  console.log(`Generating ${count} question(s)...`);
  console.log(`  domain: ${domain ?? 'all'}, difficulty: ${difficulty ?? 'mixed'}, lang: ${language}`);

  const BATCH_SIZE = 10;
  const batches: number[] = [];
  let remaining = count;
  while (remaining > 0) {
    batches.push(Math.min(remaining, BATCH_SIZE));
    remaining -= BATCH_SIZE;
  }

  type GeneratedQuestion = { domain: string; difficulty: string; language: string; text: string; options: string[]; correctIndex: number; explanation: string };

  async function generateBatch(batchCount: number): Promise<GeneratedQuestion[]> {
    const response = await client.messages.create({
      model,
      max_tokens: Math.min(512 * batchCount + 1024, 8192),
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
      messages: [
        {
          role: 'user',
          content: `Generate exactly ${batchCount} CCA-F multiple-choice question(s).
${domainClause}
${difficultyClause}
${languageClause}
Set the "language" field to "${language}" for every question.

Use the create_questions tool to return the structured output.`,
        },
      ],
    });

    const toolBlock = response.content.find((b): b is ToolUseBlock => b.type === 'tool_use');
    if (!toolBlock) return [];
    return (toolBlock.input as { questions: GeneratedQuestion[] }).questions ?? [];
  }

  const questions: GeneratedQuestion[] = [];
  for (const batchCount of batches) {
    const batch = await generateBatch(batchCount);
    questions.push(...batch);
  }

  if (questions.length === 0) {
    console.error('No questions generated');
    process.exit(1);
  }

  await prisma.question.createMany({
    data: questions.map((q) => ({
      ...q,
      domain: q.domain as Domain,
      difficulty: q.difficulty as Difficulty,
      language: (q.language as Language) ?? language,
      source: 'generated',
      isApproved: false,
    })),
  });

  console.log(`\nInserted ${questions.length} question(s) with isApproved=false`);
  console.log('Review and approve via: npx prisma studio\n');

  for (const [i, q] of questions.entries()) {
    console.log(`[${i + 1}] [${q.domain}] [${q.difficulty}] ${q.text.slice(0, 80)}...`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
