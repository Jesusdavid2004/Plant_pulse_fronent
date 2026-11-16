import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useLocale } from '../../../i18n/useLocale';
import { authService } from '../services/AuthService';
import { useAuth } from '../hooks/authContext';

type Feedback = 'saved' | 'testSent' | 'error' | null;

export function NotificationSettings() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { user, updatePreferences } = useAuth();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const enabled = user?.emailNotifications ?? true;

  const toggle = async () => {
    setBusy(true);
    try {
      await updatePreferences({ emailNotifications: !enabled, locale });
      setFeedback('saved');
    } catch {
      setFeedback('error');
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setBusy(true);
    try {
      await updatePreferences({ locale });
      await authService.sendTestEmail();
      setFeedback('testSent');
    } catch {
      setFeedback('error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          {t('settings.notifications.title')}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('settings.notifications.body')}
        </p>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
        <span className="font-medium text-[var(--color-text)]">
          {t('settings.notifications.toggle')}
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={enabled}
          disabled={busy}
          onChange={() => void toggle()}
          className="h-5 w-5 accent-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" disabled={busy || !enabled} onClick={() => void sendTest()}>
          {t('settings.notifications.sendTest')}
        </Button>
        <p
          role={feedback === 'error' ? 'alert' : 'status'}
          className={`text-sm ${feedback === 'error' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}
        >
          {feedback && t(`settings.notifications.${feedback}`)}
        </p>
      </div>
    </Card>
  );
}
