import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CredentialsService } from './credentials.service';
import type { UserProfile } from '@cert-trainer/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentials: CredentialsService,
  ) {}

  async getProfile(): Promise<UserProfile> {
    const { uuid, name } = this.credentials.load();

    const user = await this.prisma.user.upsert({
      where: { id: uuid },
      create: { id: uuid, name },
      update: {},
    });

    return {
      uuid:          user.id,
      name:          user.name,
      xp:            user.xp,
      level:         user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastStudiedAt: user.lastStudiedAt?.toISOString() ?? null,
    };
  }
}
