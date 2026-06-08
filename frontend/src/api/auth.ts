import { apiGet } from './client';
import type { UserProfile } from '@cert-trainer/shared';

export function getProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/auth/me');
}
