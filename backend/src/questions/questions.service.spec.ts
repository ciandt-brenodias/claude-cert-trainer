import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { PrismaService } from '../prisma/prisma.service';
import { Domain, Difficulty, Language } from '@cert-trainer/shared';

const mockQuestion = {
  id: 'q-uuid-1',
  domain: Domain.AGENTIC_ARCHITECTURE,
  difficulty: Difficulty.MEDIUM,
  text: 'Test question?',
  options: ['A', 'B', 'C', 'D'],
  correctIndex: 1,
  explanation: 'Because B.',
  source: 'anthropic',
  isApproved: true,
  createdAt: new Date(),
};

describe('QuestionsService', () => {
  let service: QuestionsService;
  let prisma: {
    question: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      question: {
        findMany: jest.fn().mockResolvedValue([mockQuestion]),
        findUnique: jest.fn().mockResolvedValue(mockQuestion),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(QuestionsService);
  });

  describe('findAll', () => {
    it('returns questions without correctIndex and explanation', async () => {
      const result = await service.findAll();

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({ id: true, text: true, options: true }),
        }),
      );
      expect(result[0]).not.toHaveProperty('correctIndex');
      expect(result[0]).not.toHaveProperty('explanation');
    });

    it('applies domain filter when provided', async () => {
      await service.findAll(Domain.AGENTIC_ARCHITECTURE);

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ domain: Domain.AGENTIC_ARCHITECTURE }),
        }),
      );
    });

    it('applies difficulty filter when provided', async () => {
      await service.findAll(undefined, Difficulty.HARD);

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ difficulty: Difficulty.HARD }),
        }),
      );
    });

    it('applies language filter when provided', async () => {
      await service.findAll(undefined, undefined, Language.EN);

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ language: Language.EN }),
        }),
      );
    });

    it('always filters by isApproved true', async () => {
      await service.findAll();

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isApproved: true }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('returns full question including correctIndex and explanation', async () => {
      const result = await service.findById('q-uuid-1');

      expect(result.correctIndex).toBe(1);
      expect(result.explanation).toBe('Because B.');
    });

    it('throws NotFoundException when question does not exist', async () => {
      prisma.question.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findRandom', () => {
    it('returns at most count questions', async () => {
      prisma.question.findMany.mockResolvedValue([mockQuestion, { ...mockQuestion, id: 'q-2' }]);

      const result = await service.findRandom(1);

      expect(result.length).toBe(1);
    });

    it('returns empty array when no questions available', async () => {
      prisma.question.findMany.mockResolvedValue([]);

      const result = await service.findRandom(10);

      expect(result).toEqual([]);
    });

    it('applies language filter when provided', async () => {
      await service.findRandom(10, undefined, Language.PT_BR);

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ language: Language.PT_BR }),
        }),
      );
    });
  });
});
