import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './questions/questions.module';
import { ExamsModule } from './exams/exams.module';
import { UsersModule } from './users/users.module';
import { ClaudeModule } from './claude/claude.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    QuestionsModule,
    ExamsModule,
    UsersModule,
    ClaudeModule,
  ],
})
export class AppModule {}
