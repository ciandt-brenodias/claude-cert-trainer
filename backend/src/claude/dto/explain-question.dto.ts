import { IsInt, IsUUID, Min } from 'class-validator';

export class ExplainQuestionDto {
  @IsUUID()
  questionId: string;

  @IsInt()
  @Min(0)
  userAnswer: number;
}
