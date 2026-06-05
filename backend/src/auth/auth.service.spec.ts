import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CredentialsService } from './credentials.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaUser = {
  id:            'test-uuid',
  name:          'TestUser',
  xp:            0,
  level:         1,
  currentStreak: 0,
  longestStreak: 0,
  lastStudiedAt: null,
  createdAt:     new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { upsert: jest.Mock } };
  let credentialsService: { load: jest.Mock };

  beforeEach(async () => {
    prisma = { user: { upsert: jest.fn().mockResolvedValue(mockPrismaUser) } };
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
    const profile = await service.getProfile();

    expect(profile.uuid).toBe('test-uuid');
    expect(profile.name).toBe('TestUser');
    expect(profile.xp).toBe(0);
    expect(profile.level).toBe(1);
    expect(profile.lastStudiedAt).toBeNull();
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
    const now = new Date();
    prisma.user.upsert.mockResolvedValue({ ...mockPrismaUser, lastStudiedAt: now });

    const profile = await service.getProfile();

    expect(profile.lastStudiedAt).toBe(now.toISOString());
  });
});
