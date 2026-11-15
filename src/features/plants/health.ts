import type { HealthStatus } from './types';

const HEALTHY_THRESHOLD = 70;
const WARNING_THRESHOLD = 40;

export function statusForScore(score: number): HealthStatus {
  if (score >= HEALTHY_THRESHOLD) return 'healthy';
  if (score >= WARNING_THRESHOLD) return 'warning';
  return 'critical';
}
