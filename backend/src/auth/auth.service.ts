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

    const updated = await this.applyStreakUpdate(user);

    return {
      uuid:          updated.id,
      name:          updated.name,
      xp:            updated.xp,
      level:         updated.level,
      currentStreak: updated.currentStreak,
      longestStreak: updated.longestStreak,
      lastStudiedAt: updated.lastStudiedAt?.toISOString() ?? null,
    };
  }

  private async applyStreakUpdate(user: {
    id: string;
    name: string;
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastStudiedAt: Date | null;
    createdAt: Date;
  }) {
    const today = this.toDateOnly(new Date());
    const last = user.lastStudiedAt ? this.toDateOnly(user.lastStudiedAt) : null;

    if (last === today) {
      return user;
    }

    const yesterday = this.toDateOnly(new Date(Date.now() - 86_400_000));
    const newStreak = last === yesterday ? user.currentStreak + 1 : 1;
    const newLongest = Math.max(newStreak, user.longestStreak);

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastStudiedAt: new Date(),
      },
    });
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
