import { apiGet, apiPost } from './client';
import type { Domain, ExamMode, Language } from '@cert-trainer/shared';
import type { SafeQuestion } from './questions';

export interface CreateExamDto {
  domain?: Domain;
  questionCount: 10 | 20 | 40 | 65;
  mode?: ExamMode;
  timeLimitMinutes?: number;
  language?: Language;
}

export interface CreateExamResponse {
  sessionId: string;
  mode: ExamMode;
  timeLimitMinutes: number | null;
  questions: SafeQuestion[];
}

export interface SubmitAnswerDto {
  questionId: string;
  userAnswer: number;
  timeSpent: number;
}

export interface BadgeEarned {
  slug: string;
  name: string;
  description: string;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean | null;
  correctIndex?: number;
  explanation?: string;
  source?: string;
  xpGained: number;
  badgesEarned: BadgeEarned[];
}

export interface DomainBreakdown {
  domain: Domain;
  correct: number;
  total: number;
  pct: number;
}

export interface WrongAnswer {
  questionId: string;
  text: string;
  options: string[];
  userAnswer: number;
  correctIndex: number;
  explanation: string;
}

export interface ExamResult {
  sessionId: string;
  score: number;
  totalAnswered: number;
  totalCorrect: number;
  byDomain: DomainBreakdown[];
  wrongAnswers: WrongAnswer[];
}

export function createExam(dto: CreateExamDto): Promise<CreateExamResponse> {
  return apiPost<CreateExamResponse>('/exams', dto);
}

export function submitAnswer(sessionId: string, dto: SubmitAnswerDto): Promise<SubmitAnswerResponse> {
  return apiPost<SubmitAnswerResponse>(`/exams/${sessionId}/answers`, dto);
}

export function getExamResult(sessionId: string): Promise<ExamResult> {
  return apiGet<ExamResult>(`/exams/${sessionId}/result`);
}
