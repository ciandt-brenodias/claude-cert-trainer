import { Test } from '@nestjs/testing';
import { ClaudeService, ExplainQuestionInput, GenerateQuestionsInput } from './claude.service';
import { Domain, Difficulty } from '@cert-trainer/shared';

const mockCreate = jest.fn();

jest.mock('@anthropic-ai/sdk', () => {
  const MockAnthropic = jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  }));
  return { default: MockAnthropic, __esModule: true };
});

const mockInput: ExplainQuestionInput = {
  questionText: 'What is a tool in Claude?',
  options: ['A function Claude can call', 'A prompt template', 'A system message', 'A context window'],
  correctIndex: 0,
  userAnswer: 1,
};

describe('ClaudeService', () => {
  let service: ClaudeService;

  beforeEach(async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Option A is correct because...' }],
    });

    const module = await Test.createTestingModule({
      providers: [ClaudeService],
    }).compile();

    service = module.get(ClaudeService);
  });

  afterEach(() => {
    mockCreate.mockReset();
  });

  it('calls Anthropic messages.create with system prompt array (caching enabled)', async () => {
    await service.explainQuestion(mockInput);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.arrayContaining([
          expect.objectContaining({ type: 'text', cache_control: { type: 'ephemeral' } }),
        ]),
        messages: expect.arrayContaining([expect.objectContaining({ role: 'user' })]),
      }),
    );
  });

  it('returns the text from the first content block', async () => {
    const result = await service.explainQuestion(mockInput);

    expect(result).toBe('Option A is correct because...');
  });

  it('marks the correct option and user-selected option in the prompt', async () => {
    await service.explainQuestion(mockInput);

    const call = mockCreate.mock.calls[0][0];
    const userMessage = call.messages[0].content as string;

    expect(userMessage).toContain('[CORRECT]');
    expect(userMessage).toContain('[USER SELECTED]');
  });

  it('returns empty string when content block is not text type', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'tool_use', id: 'x', name: 'y', input: {} }] });

    const result = await service.explainQuestion(mockInput);

    expect(result).toBe('');
  });
});

describe('ClaudeService.generateQuestions', () => {
  let service: ClaudeService;

  const mockGeneratedQuestion = {
    domain: Domain.PROMPT_ENGINEERING,
    difficulty: Difficulty.MEDIUM,
    text: 'What is chain-of-thought prompting?',
    options: ['A prompt template', 'Step-by-step reasoning', 'A caching strategy', 'A tool definition'],
    correctIndex: 1,
    explanation: 'Chain-of-thought guides the model to reason step by step.',
  };

  const mockToolUseResponse = {
    content: [
      {
        type: 'tool_use',
        id: 'tu-1',
        name: 'create_questions',
        input: { questions: [mockGeneratedQuestion] },
      },
    ],
  };

  beforeEach(async () => {
    mockCreate.mockResolvedValue(mockToolUseResponse);

    const module = await Test.createTestingModule({
      providers: [ClaudeService],
    }).compile();

    service = module.get(ClaudeService);
  });

  afterEach(() => mockCreate.mockReset());

  it('uses tool_choice to force create_questions tool', async () => {
    const input: GenerateQuestionsInput = { count: 1 };
    await service.generateQuestions(input);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tool_choice: { type: 'tool', name: 'create_questions' },
        tools: expect.arrayContaining([expect.objectContaining({ name: 'create_questions' })]),
      }),
    );
  });

  it('returns parsed questions from tool_use response', async () => {
    const result = await service.generateQuestions({ count: 1 });

    expect(result).toHaveLength(1);
    expect(result[0].domain).toBe(Domain.PROMPT_ENGINEERING);
    expect(result[0].difficulty).toBe(Difficulty.MEDIUM);
  });

  it('includes domain clause in user message when domain is specified', async () => {
    await service.generateQuestions({ count: 1, domain: Domain.AGENTIC_ARCHITECTURE });

    const call = mockCreate.mock.calls[0][0];
    const msg = call.messages[0].content as string;
    expect(msg).toContain('AGENTIC_ARCHITECTURE');
  });

  it('includes difficulty clause in user message when difficulty is specified', async () => {
    await service.generateQuestions({ count: 1, difficulty: Difficulty.HARD });

    const call = mockCreate.mock.calls[0][0];
    const msg = call.messages[0].content as string;
    expect(msg).toContain('HARD');
  });

  it('returns empty array when response has no tool_use block', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'sorry' }] });

    const result = await service.generateQuestions({ count: 1 });

    expect(result).toHaveLength(0);
  });

  it('uses prompt caching on system message', async () => {
    await service.generateQuestions({ count: 1 });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.arrayContaining([
          expect.objectContaining({ cache_control: { type: 'ephemeral' } }),
        ]),
      }),
    );
  });
});
