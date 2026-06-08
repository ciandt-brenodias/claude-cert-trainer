import { IsEnum, IsOptional } from 'class-validator';
import { Domain, Difficulty } from '@cert-trainer/shared';

export class QuestionFilterDto {
  @IsOptional()
  @IsEnum(Domain)
  domain?: Domain;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;
}
