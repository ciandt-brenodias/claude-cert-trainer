import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Domain, Difficulty } from '@cert-trainer/shared';

export class GenerateQuestionsDto {
  @IsInt()
  @Min(1)
  @Max(20)
  count: number;

  @IsOptional()
  @IsEnum(Domain)
  domain?: Domain;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;
}
