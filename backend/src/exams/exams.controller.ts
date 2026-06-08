import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CredentialsService } from '../auth/credentials.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('exams')
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly credentials: CredentialsService,
  ) {}

  @Post()
  create(@Body() dto: CreateExamDto) {
    const { uuid } = this.credentials.load();
    return this.examsService.create(uuid, dto);
  }

  @Post(':id/answers')
  submitAnswer(@Param('id') id: string, @Body() dto: SubmitAnswerDto) {
    return this.examsService.submitAnswer(id, dto);
  }

  @Get(':id/result')
  getResult(@Param('id') id: string) {
    return this.examsService.getResult(id);
  }
}
