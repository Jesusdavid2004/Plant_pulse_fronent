import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { AddPlantDialog } from '../features/plants/components/AddPlantDialog';
import { PlantCard } from '../features/plants/components/PlantCard';
import { usePlants } from '../features/plants/hooks/usePlants';
import type { PlantRegistration } from '../features/plants/types';
import { useLocalizedNavigate } from '../i18n/useLocale';

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const { data: plants, status, reload } = usePlants();
  const [dialogOpen, setDialogOpen] = useState(false);

  const onFinished = (registration: PlantRegistration) => {
    setDialogOpen(false);
    void reload();
    navigate(`/plants/${registration.plant.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">{t('dashboard.title')}</h1>
        <Button onClick={() => setDialogOpen(true)}>{t('dashboard.addPlant')}</Button>
      </div>

      {status === 'loading' && <Spinner />}

      {status === 'error' && (
        <Card role="alert" className="space-y-3 text-center">
          <p className="text-[var(--color-danger)]">{t('dashboard.error')}</p>
          <Button variant="secondary" onClick={() => void reload()}>
            {t('common.retry')}
          </Button>
        </Card>
      )}

      {status === 'ready' && plants?.length === 0 && (
        <Card className="space-y-4 py-12 text-center">
          <p className="text-4xl" aria-hidden="true">
            🪴
          </p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            {t('dashboard.emptyTitle')}
          </h2>
          <p className="mx-auto max-w-md text-[var(--color-text-secondary)]">
            {t('dashboard.emptyBody')}
          </p>
          <Button onClick={() => setDialogOpen(true)}>{t('dashboard.addFirst')}</Button>
        </Card>
      )}

      {status === 'ready' && plants && plants.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <li key={plant.id}>
              <PlantCard plant={plant} />
            </li>
          ))}
        </ul>
      )}

      <AddPlantDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onFinished={onFinished}
      />
    </div>
  );
}
