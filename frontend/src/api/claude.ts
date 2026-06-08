import { apiPost } from './client';

export interface ExplainQuestionDto {
  questionId: string;
  userAnswer: number;
}

export interface ExplainQuestionResponse {
  explanation: string;
}

export function explainQuestion(dto: ExplainQuestionDto): Promise<ExplainQuestionResponse> {
  return apiPost<ExplainQuestionResponse>('/claude/explain', dto);
}
