import { useState } from 'react';
import { useExplain } from '../../hooks/useExplain';
import { Button } from './Button';

interface ExplainButtonProps {
  questionId: string;
  userAnswer: number;
}

export function ExplainButton({ questionId, userAnswer }: ExplainButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate, data, isPending, isError } = useExplain();

  function handleToggle() {
    if (!open && !data) {
      mutate({ questionId, userAnswer });
    }
    setOpen((prev) => !prev);
  }

  return (
    <div className="mt-2">
      <Button variant="secondary" size="sm" onClick={handleToggle} disabled={isPending}>
        {isPending ? 'Consultando Claude...' : open ? 'Fechar explicação' : 'Explicar com Claude'}
      </Button>

      {open && (
        <div className="mt-2 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {isError && <span className="text-red-600">Erro ao buscar explicação. Tente novamente.</span>}
          {data?.explanation}
        </div>
      )}
    </div>
  );
}
