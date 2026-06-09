import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { QuestionsModule } from '../questions/questions.module';
import { AuthModule } from '../auth/auth.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [QuestionsModule, AuthModule, GamificationModule],
  controllers: [ExamsController],
  providers: [ExamsService],
})
export class ExamsModule {}
