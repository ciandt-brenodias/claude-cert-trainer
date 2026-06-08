import { useQuery } from '@tanstack/react-query';
import { getBadges } from '../api/users';

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: getBadges,
    staleTime: 30_000,
  });
}
