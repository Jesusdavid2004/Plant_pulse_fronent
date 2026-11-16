import type { MemorySymbol } from './memoryEngine';

interface GameIconProps {
  symbol: MemorySymbol;
  className?: string;
}

export function GameIcon({ symbol, className }: GameIconProps) {
  const common = { viewBox: '0 0 24 24', 'aria-hidden': true, className, fill: 'none' } as const;

  switch (symbol) {
    case 'water':
      return (
        <svg {...common}>
          <path
            d="M12 3 C7 10 6 13 6 15 a6 6 0 0 0 12 0 c0-2-1-5-6-12 Z"
            fill="var(--color-pet-water)"
          />
        </svg>
      );
    case 'sun':
      return (
        <svg {...common} stroke="var(--color-pet-sun)" strokeWidth={2} strokeLinecap="round">
          <circle cx={12} cy={12} r={4} fill="var(--color-pet-sun)" />
          <path d="M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...common}>
          <path
            d="M12 2 L14 9 L21 12 L14 15 L12 22 L10 15 L3 12 L10 9 Z"
            fill="var(--color-pet-sparkle)"
          />
        </svg>
      );
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M5 19 C4 9 10 4 20 4 C20 14 15 20 5 19 Z" fill="var(--color-pet-leaf)" />
          <path d="M5 19 L14 10" stroke="var(--color-pet-stem)" strokeWidth={1.6} />
        </svg>
      );
    case 'flower':
      return (
        <svg {...common}>
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx={12}
              cy={7}
              rx={3}
              ry={4.5}
              fill="var(--color-plant-bloom-pink)"
              transform={`rotate(${angle} 12 12)`}
            />
          ))}
          <circle cx={12} cy={12} r={2.6} fill="var(--color-pet-sun)" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...common}>
          <path
            d="M12 20 C4 14 3 9 6 6.5 C8.5 4.5 11 6 12 8 C13 6 15.5 4.5 18 6.5 C21 9 20 14 12 20 Z"
            fill="var(--color-plant-bloom-red)"
          />
        </svg>
      );
  }
}
