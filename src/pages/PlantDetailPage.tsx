import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { Spinner } from '../components/ui/Spinner';
import { PlantPet } from '../features/plant-pet/components/PlantPet';
import { AnalysisCard } from '../features/plants/components/AnalysisCard';
import { CheckupPanel } from '../features/plants/components/CheckupPanel';
import { usePlantDetail } from '../features/plants/hooks/usePlants';
import { plantService } from '../features/plants/services/PlantService';
import { LocalizedLink } from '../i18n/LocalizedLink';
import { useLocalizedNavigate } from '../i18n/useLocale';

export default function PlantDetailPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useLocalizedNavigate();
  const { plant, analyses } = usePlantDetail(id);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (plant.status === 'loading') return <Spinner />;
  if (plant.status === 'error' || !plant.data) {
    return (
      <Card role="alert" className="space-y-3 text-center">
        <p className="text-[var(--color-danger)]">{t('plant.notFound')}</p>
        <LocalizedLink
          to="/dashboard"
          className="font-semibold text-[var(--color-primary)] underline"
        >
          {t('plant.backToDashboard')}
        </LocalizedLink>
      </Card>
    );
  }

  const current = plant.data;

  const remove = async () => {
    setDeleting(true);
    try {
      await plantService.remove(current.id);
      navigate('/dashboard');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <LocalizedLink to="/dashboard" className="text-sm text-[var(--color-primary)] underline">
            {t('plant.backToDashboard')}
          </LocalizedLink>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">{current.name}</h1>
          <p className="text-[var(--color-text-secondary)]">
            {current.species ?? t('plant.unknownSpecies')}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setConfirmingDelete(true)}>
          {t('plant.delete')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mx-auto max-w-md">
            <PlantPet plantId={current.id} plantName={current.name} traits={current.petTraits} />
          </div>
        </Card>

        <div className="space-y-6">
          <CheckupPanel
            plantId={current.id}
            onCompleted={() => {
              void analyses.reload();
              void plant.reload();
            }}
          />
        </div>
      </div>

      <section aria-labelledby="history-title" className="space-y-4">
        <h2 id="history-title" className="text-2xl font-bold text-[var(--color-text)]">
          {t('plant.historyTitle')}
        </h2>
        {analyses.status === 'loading' && <Spinner />}
        {analyses.status === 'error' && (
          <p role="alert" className="text-[var(--color-danger)]">
            {t('plant.historyError')}
          </p>
        )}
        {analyses.status === 'ready' && analyses.data?.length === 0 && (
          <p className="text-[var(--color-text-secondary)]">{t('plant.historyEmpty')}</p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {analyses.data?.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} advice={analysis.carePlan} />
          ))}
        </div>
      </section>

      <Dialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title={t('plant.deleteTitle', { name: current.name })}
      >
        <p className="text-[var(--color-text-secondary)]">{t('plant.deleteBody')}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" loading={deleting} onClick={() => void remove()}>
            {t('plant.deleteConfirm')}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
