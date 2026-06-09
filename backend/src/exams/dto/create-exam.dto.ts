import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Domain, ExamMode, Language } from '@cert-trainer/shared';

export class CreateExamDto {
  @IsOptional()
  @IsEnum(Domain)
  domain?: Domain;

  @IsIn([10, 20, 40, 65])
  questionCount: 10 | 20 | 40 | 65;

  @IsOptional()
  @IsEnum(ExamMode)
  mode?: ExamMode;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(300)
  timeLimitMinutes?: number;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;
}
