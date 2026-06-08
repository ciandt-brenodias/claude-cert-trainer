import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionFilterDto } from './dto/question-filter.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Query() filter: QuestionFilterDto) {
    return this.questionsService.findAll(filter.domain, filter.difficulty);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }
}
