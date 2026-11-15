import { AnimatePresence, motion } from 'motion/react';

interface SpeechBubbleProps {
  message: string;
}

export function SpeechBubble({ message }: SpeechBubbleProps) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[4.5rem] justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="relative max-w-xs rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] px-4 py-3 text-center text-sm font-medium text-[var(--color-text)] after:absolute after:-bottom-2 after:left-1/2 after:h-4 after:w-4 after:-translate-x-1/2 after:rotate-45 after:border-b after:border-r after:border-[var(--color-border)] after:bg-[var(--color-surface-hover)] after:content-['']"
        >
          {message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
