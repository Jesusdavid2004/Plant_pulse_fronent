import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui/Card';
import type { Analysis } from '../types';
import { HealthBadge } from './HealthBadge';

interface AnalysisCardProps {
  analysis: Pick<Analysis, 'healthScore' | 'status' | 'diagnosis' | 'createdAt'>;
  advice: string[];
  visibleSigns?: string[];
  heading?: string;
}

export function AnalysisCard({ analysis, advice, visibleSigns = [], heading }: AnalysisCardProps) {
  const { t, i18n } = useTranslation();
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
    new Date(analysis.createdAt),
  );

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {heading ?? t('analysis.title')}
        </h3>
        <HealthBadge status={analysis.status} score={analysis.healthScore} />
      </div>
      <p className="text-sm text-[var(--color-text-muted)]">{date}</p>
      <p className="text-[var(--color-text)]">{analysis.diagnosis}</p>

      {visibleSigns.length > 0 && (
        <div>
          <h4 className="mb-1 text-sm font-semibold text-[var(--color-text)]">
            {t('analysis.visibleSigns')}
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-text-secondary)]">
            {visibleSigns.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
        </div>
      )}

      {advice.length > 0 && (
        <div>
          <h4 className="mb-1 text-sm font-semibold text-[var(--color-text)]">
            {t('analysis.advice')}
          </h4>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--color-text-secondary)]">
            {advice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      )}

      <p className="border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]">
        {t('analysis.disclaimer')}
      </p>
    </Card>
  );
}
