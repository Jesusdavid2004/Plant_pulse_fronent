import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ApiError } from '../../../lib/api-client';
import { plantService } from '../services/PlantService';
import type { PlantCheckup } from '../types';
import { AnalysisCard } from './AnalysisCard';
import { PhotoPicker } from './PhotoPicker';

interface CheckupPanelProps {
  plantId: string;
  onCompleted: () => void;
}

export function CheckupPanel({ plantId, onCompleted }: CheckupPanelProps) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [result, setResult] = useState<PlantCheckup | null>(null);

  const submit = async () => {
    if (!photo) return;
    setErrorKey(null);
    setSubmitting(true);
    try {
      setResult(await plantService.checkup(plantId, photo));
      setPhoto(null);
      onCompleted();
    } catch (error) {
      setErrorKey(error instanceof ApiError ? error.messageKey : 'errors.generic');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">{t('checkup.title')}</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{t('checkup.intro')}</p>
        <PhotoPicker photo={photo} onChange={setPhoto} disabled={submitting} />
        {errorKey && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {t(errorKey, { defaultValue: t('errors.generic') })}
          </p>
        )}
        <Button onClick={() => void submit()} disabled={!photo} loading={submitting}>
          {t(submitting ? 'checkup.analyzing' : 'checkup.submit')}
        </Button>
      </Card>

      {result && (
        <AnalysisCard
          heading={t('checkup.resultTitle')}
          analysis={result.analysis}
          advice={result.advice}
          visibleSigns={result.visibleSigns}
        />
      )}
    </div>
  );
}
