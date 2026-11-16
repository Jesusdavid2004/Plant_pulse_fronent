import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { authService } from '../features/auth/services/AuthService';
import { LocalizedLink } from '../i18n/LocalizedLink';

type Status = 'working' | 'done' | 'error';

export default function UnsubscribePage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>(token ? 'working' : 'error');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    authService
      .unsubscribe(token)
      .then(() => {
        if (!cancelled) setStatus('done');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === 'working') return <Spinner />;

  return (
    <Card
      role={status === 'error' ? 'alert' : 'status'}
      className="mx-auto max-w-lg space-y-3 text-center"
    >
      <h1 className="text-2xl font-bold text-[var(--color-text)]">
        {t(status === 'done' ? 'unsubscribe.doneTitle' : 'unsubscribe.errorTitle')}
      </h1>
      <p className="text-[var(--color-text-secondary)]">
        {t(status === 'done' ? 'unsubscribe.doneBody' : 'unsubscribe.errorBody')}
      </p>
      <LocalizedLink to="/" className="font-semibold text-[var(--color-primary)] underline">
        {t('notFound.home')}
      </LocalizedLink>
    </Card>
  );
}
