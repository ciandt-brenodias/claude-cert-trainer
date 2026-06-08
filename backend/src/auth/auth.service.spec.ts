import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CredentialsService } from './credentials.service';
import { PrismaService } from '../prisma/prisma.service';

const TODAY = new Date();
TODAY.setHours(12, 0, 0, 0);

const YESTERDAY = new Date(TODAY.getTime() - 86_400_000);
const TWO_DAYS_AGO = new Date(TODAY.getTime() - 2 * 86_400_000);

function mockUser(overrides: Partial<{
  id: string;
  name: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudiedAt: Date | null;
  createdAt: Date;
}> = {}) {
  return {
    id: 'test-uuid',
    name: 'TestUser',
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastStudiedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { upsert: jest.Mock; update: jest.Mock } };
  let credentialsService: { load: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        upsert: jest.fn().mockResolvedValue(mockUser()),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve(mockUser(args.data)),
        ),
      },
    };
    credentialsService = { load: jest.fn().mockReturnValue({ uuid: 'test-uuid', name: 'TestUser' }) };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: CredentialsService, useValue: credentialsService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('returns user profile from database', async () => {
    // lastStudiedAt = today so streak update is a no-op and upsert result is returned directly
    prisma.user.upsert.mockResolvedValue(mockUser({ lastStudiedAt: TODAY, currentStreak: 1 }));

    const profile = await service.getProfile();

    expect(profile.uuid).toBe('test-uuid');
    expect(profile.name).toBe('TestUser');
    expect(profile.xp).toBe(0);
    expect(profile.level).toBe(1);
    expect(profile.currentStreak).toBe(1);
  });

  it('upserts user with uuid from credentials', async () => {
    await service.getProfile();

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where:  { id: 'test-uuid' },
      create: { id: 'test-uuid', name: 'TestUser' },
      update: {},
    });
  });

  it('maps lastStudiedAt to ISO string when present', async () => {
    prisma.user.upsert.mockResolvedValue(mockUser({ lastStudiedAt: TODAY }));

    const profile = await service.getProfile();

    expect(profile.lastStudiedAt).toBe(TODAY.toISOString());
  });

  describe('streak logic', () => {
    it('sets streak to 1 when lastStudiedAt is null', async () => {
      prisma.user.upsert.mockResolvedValue(mockUser({ lastStudiedAt: null }));

      await service.getProfile();

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currentStreak: 1, longestStreak: 1 }),
        }),
      );
    });

    it('increments streak when lastStudiedAt is yesterday', async () => {
      prisma.user.upsert.mockResolvedValue(mockUser({ lastStudiedAt: YESTERDAY, currentStreak: 5, longestStreak: 7 }));

      await service.getProfile();

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currentStreak: 6, longestStreak: 7 }),
        }),
      );
    });

    it('updates longestStreak when new streak exceeds it', async () => {
      prisma.user.upsert.mockResolvedValue(mockUser({ lastStudiedAt: YESTERDAY, currentStreak: 7, longestStreak: 7 }));

      await service.getProfile();

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currentStreak: 8, longestStreak: 8 }),
        }),
      );
    });

    it('resets streak to 1 when lastStudiedAt is older than yesterday', async () => {
      prisma.user.upsert.mockResolvedValue(mockUser({ lastStudiedAt: TWO_DAYS_AGO, currentStreak: 5, longestStreak: 10 }));

      await service.getProfile();

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currentStreak: 1, longestStreak: 10 }),
        }),
      );
    });

    it('does not update when lastStudiedAt is today', async () => {
      prisma.user.upsert.mockResolvedValue(mockUser({ lastStudiedAt: TODAY, currentStreak: 3 }));

      await service.getProfile();

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
