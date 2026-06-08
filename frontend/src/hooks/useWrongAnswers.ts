import { useQuery } from '@tanstack/react-query';
import { getWrongAnswers } from '../api/users';

export function useWrongAnswers() {
  return useQuery({
    queryKey: ['wrongAnswers'],
    queryFn: getWrongAnswers,
    staleTime: 10_000,
  });
}
