import type { CareType } from '../types';

interface CareIconProps {
  type: CareType;
  className?: string;
}

export function CareIcon({ type, className }: CareIconProps) {
  const common = { viewBox: '0 0 24 24', 'aria-hidden': true, className, fill: 'none' } as const;

  if (type === 'WATER') {
    return (
      <svg {...common}>
        <path d="M12 3 C7 10 6 13 6 15 a6 6 0 0 0 12 0 c0-2-1-5-6-12 Z" fill="var(--color-pet-water)" />
      </svg>
    );
  }

  if (type === 'SUN') {
    return (
      <svg {...common} stroke="var(--color-pet-sun)" strokeWidth={2} strokeLinecap="round">
        <circle cx={12} cy={12} r={4} fill="var(--color-pet-sun)" />
        <path d="M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="M12 2 L14 9 L21 12 L14 15 L12 22 L10 15 L3 12 L10 9 Z"
        fill="var(--color-pet-sparkle)"
      />
    </svg>
  );
}
