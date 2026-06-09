import { useTranslation } from 'react-i18next';
import { Button } from './Button';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <p className="text-sm text-red-600 font-medium">{message ?? t('error.defaultMessage')}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('error.retry')}
        </Button>
      )}
    </div>
  );
}
