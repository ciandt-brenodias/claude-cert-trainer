import { useQuery } from '@tanstack/react-query';
import { getStats } from '../api/users';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    staleTime: 10_000,
  });
}
