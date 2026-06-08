import { apiGet } from './client';
import type { Domain } from '@cert-trainer/shared';

export interface DomainProgressItem {
  domain: Domain;
  totalAnswered: number;
  totalCorrect: number;
  xpEarned: number;
  accuracy: number;
}

export interface UserStats {
  questionsToday: number;
  overallAccuracy: number;
}

export interface UserBadge {
  badgeId: string;
  slug: string;
  name: string;
  description: string;
  domain: Domain | null;
  earnedAt: string;
}

export interface SessionSummary {
  id: string;
  mode: string;
  domain: Domain | null;
  startedAt: string;
  finishedAt: string;
  score: number | null;
  totalTime: number | null;
  totalAnswered: number;
}

export interface WrongAnswerItem {
  questionId: string;
  domain: string;
  difficulty: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function getDomainProgress(): Promise<DomainProgressItem[]> {
  return apiGet<DomainProgressItem[]>('/users/me/domain-progress');
}

export function getStats(): Promise<UserStats> {
  return apiGet<UserStats>('/users/me/stats');
}

export function getBadges(): Promise<UserBadge[]> {
  return apiGet<UserBadge[]>('/users/me/badges');
}

export function getSessions(): Promise<SessionSummary[]> {
  return apiGet<SessionSummary[]>('/users/me/sessions');
}

export function getWrongAnswers(): Promise<WrongAnswerItem[]> {
  return apiGet<WrongAnswerItem[]>('/users/me/wrong-answers');
}
