import { useQuery } from '@tanstack/react-query';
import { getDomainProgress } from '../api/users';

export function useDomainProgress() {
  return useQuery({
    queryKey: ['domainProgress'],
    queryFn: getDomainProgress,
    staleTime: 10_000,
  });
}
