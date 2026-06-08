import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { QuestionsModule } from '../questions/questions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [QuestionsModule, AuthModule],
  controllers: [ExamsController],
  providers: [ExamsService],
})
export class ExamsModule {}
