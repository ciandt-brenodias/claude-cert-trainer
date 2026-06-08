import { Test } from '@nestjs/testing';
import { ClaudeService, ExplainQuestionInput } from './claude.service';

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
