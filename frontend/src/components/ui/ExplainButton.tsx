import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExplain } from '../../hooks/useExplain';
import { Button } from './Button';

interface ExplainButtonProps {
  questionId: string;
  userAnswer: number;
}

export function ExplainButton({ questionId, userAnswer }: ExplainButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate, data, isPending, isError } = useExplain();
  const { t } = useTranslation();

  function handleToggle() {
    if (!open && !data) {
      mutate({ questionId, userAnswer });
    }
    setOpen((prev) => !prev);
  }

  return (
    <div className="mt-2">
      <Button variant="secondary" size="sm" onClick={handleToggle} disabled={isPending}>
        {isPending ? t('explain.loading') : open ? t('explain.close') : t('explain.open')}
      </Button>

      {open && (
        <div className="mt-2 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {isError && <span className="text-red-600">{t('explain.error')}</span>}
          {data?.explanation}
        </div>
      )}
    </div>
  );
}
