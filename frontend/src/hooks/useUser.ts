import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api/auth';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
    staleTime: 30_000,
  });
}
