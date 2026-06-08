import { apiGet } from './client';
import type { Domain, Difficulty } from '@cert-trainer/shared';

export interface SafeQuestion {
  id: string;
  domain: Domain;
  difficulty: Difficulty;
  text: string;
  options: string[];
}

export interface FullQuestion extends SafeQuestion {
  correctIndex: number;
  explanation: string;
  source: string;
}

export function listQuestions(params?: { domain?: Domain; difficulty?: Difficulty }): Promise<SafeQuestion[]> {
  const qs = new URLSearchParams();
  if (params?.domain) qs.set('domain', params.domain);
  if (params?.difficulty) qs.set('difficulty', params.difficulty);
  const query = qs.toString();
  return apiGet<SafeQuestion[]>(`/questions${query ? `?${query}` : ''}`);
}

export function getQuestion(id: string): Promise<FullQuestion> {
  return apiGet<FullQuestion>(`/questions/${id}`);
}
