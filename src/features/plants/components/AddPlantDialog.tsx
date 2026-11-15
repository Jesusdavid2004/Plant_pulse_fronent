import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Spinner } from '../../../components/ui/Spinner';
import { TextField } from '../../../components/ui/TextField';
import { ApiError } from '../../../lib/api-client';
import { plantService } from '../services/PlantService';
import type { PlantRegistration } from '../types';
import { AnalysisCard } from './AnalysisCard';
import { PhotoPicker } from './PhotoPicker';

const MAX_NAME_LENGTH = 100;

interface AddPlantDialogProps {
  open: boolean;
  onClose: () => void;
  onFinished: (registration: PlantRegistration) => void;
}

type Step = 'form' | 'analyzing' | 'result';

export function AddPlantDialog({ open, onClose, onFinished }: AddPlantDialogProps) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [registration, setRegistration] = useState<PlantRegistration | null>(null);

  const reset = () => {
    setPhoto(null);
    setName('');
    setStep('form');
    setErrorKey(null);
    setRegistration(null);
  };

  const close = () => {
    if (step === 'analyzing') return;
    reset();
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!photo) return;
    setErrorKey(null);
    setStep('analyzing');
    try {
      setRegistration(await plantService.registerWithPhoto(photo, name.trim() || undefined));
      setStep('result');
    } catch (error) {
      setErrorKey(error instanceof ApiError ? error.messageKey : 'errors.generic');
      setStep('form');
    }
  };

  const finish = () => {
    if (!registration) return;
    onFinished(registration);
    reset();
  };

  return (
    <Dialog open={open} onClose={close} title={t('addPlant.title')}>
      {step === 'analyzing' && <Spinner label={t('addPlant.analyzing')} />}

      {step === 'form' && (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">{t('addPlant.intro')}</p>
          <PhotoPicker photo={photo} onChange={setPhoto} />
          <TextField
            label={t('addPlant.nameLabel')}
            value={name}
            maxLength={MAX_NAME_LENGTH}
            placeholder={t('addPlant.namePlaceholder')}
            onChange={(event) => setName(event.target.value)}
          />
          {errorKey && (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {t(errorKey, { defaultValue: t('errors.generic') })}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!photo}>
              {t('addPlant.submit')}
            </Button>
          </div>
        </form>
      )}

      {step === 'result' && registration && (
        <div className="space-y-4">
          <p className="text-[var(--color-text)]">
            {t('addPlant.identified', {
              name: registration.plant.name,
              species: registration.plant.species ?? t('plant.unknownSpecies'),
            })}
          </p>
          <AnalysisCard
            analysis={registration.analysis}
            advice={registration.advice}
            visibleSigns={registration.visibleSigns}
          />
          <div className="flex justify-end">
            <Button onClick={finish}>{t('addPlant.meet')}</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
