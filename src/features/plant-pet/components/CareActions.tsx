import { useTranslation } from 'react-i18next';
import { needKey } from '../moodPresentation';
import { CARE_TYPES, type CareType } from '../types';
import { CareIcon } from './CareIcon';

interface CareActionsProps {
  pendingCare: CareType | null;
  urgentNeed: CareType | null;
  onCare: (type: CareType) => void;
}

export function CareActions({ pendingCare, urgentNeed, onCare }: CareActionsProps) {
  const { t } = useTranslation();

  return (
    <div role="group" aria-label={t('pet.actions.title')} className="grid grid-cols-3 gap-3">
      {CARE_TYPES.map((type) => {
        const isUrgent = urgentNeed === type;
        return (
          <button
            key={type}
            type="button"
            disabled={pendingCare !== null}
            onClick={() => onCare(type)}
            className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60 ${
              isUrgent
                ? 'border-[var(--color-warning)] bg-[var(--color-surface-hover)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]'
            }`}
          >
            <CareIcon type={type} className="h-7 w-7" />
            {t(`pet.actions.${needKey(type)}`)}
          </button>
        );
      })}
    </div>
  );
}
