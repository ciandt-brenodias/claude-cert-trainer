import { IsInt, IsString, IsUUID, Min } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  questionId: string;

  @IsInt()
  @Min(0)
  userAnswer: number;

  @IsInt()
  @Min(0)
  timeSpent: number;
}
