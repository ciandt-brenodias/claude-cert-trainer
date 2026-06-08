import { useMutation } from '@tanstack/react-query';
import { explainQuestion } from '../api/claude';

export function useExplain() {
  return useMutation({
    mutationFn: explainQuestion,
  });
}
