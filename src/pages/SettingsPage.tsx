import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { useAuth } from '../features/auth/hooks/authContext';
import { useLocalizedNavigate } from '../i18n/useLocale';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, deleteAccount } = useAuth();
  const navigate = useLocalizedNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      navigate('/');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-text)]">{t('settings.title')}</h1>
      <Card className="space-y-1">
        <p className="text-sm text-[var(--color-text-secondary)]">{t('auth.email')}</p>
        <p className="font-medium text-[var(--color-text)]">{user?.email}</p>
      </Card>
      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--color-danger)]">
          {t('settings.dangerZone')}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{t('settings.deleteBody')}</p>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          {t('settings.deleteAccount')}
        </Button>
      </Card>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t('settings.deleteTitle')}
      >
        <p className="text-[var(--color-text-secondary)]">{t('settings.deleteConfirmBody')}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" loading={deleting} onClick={() => void confirmDelete()}>
            {t('settings.deleteConfirm')}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
