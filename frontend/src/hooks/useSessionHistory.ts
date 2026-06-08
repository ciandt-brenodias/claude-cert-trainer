import { useQuery } from '@tanstack/react-query';
import { getSessions } from '../api/users';

export function useSessionHistory() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
    staleTime: 30_000,
  });
}
