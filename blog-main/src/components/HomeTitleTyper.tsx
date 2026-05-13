'use client';

import { useEffect, useMemo, useState } from 'react';

interface HomeTitleTyperProps {
  className?: string;
  lines: readonly string[];
}

type Phase = 'typing' | 'holding' | 'resetting';

const TYPE_INTERVAL_MS = 85;
const BETWEEN_LINES_MS = 280;
const HOLD_MS = 2200;
const RESET_MS = 380;

const LINE_STYLES = [
  'min-h-[1.6rem] text-sm font-medium tracking-[0.18em] text-[#5f4aa8] dark:text-[#cfc4ff] sm:min-h-[2rem] sm:text-base md:text-lg',
  'min-h-[3.2rem] text-3xl font-semibold tracking-tight text-[#3f2a8f] dark:text-[#f1ebff] sm:min-h-[4rem] sm:text-4xl md:min-h-[5rem] md:text-5xl lg:min-h-[5.75rem] lg:text-6xl',
  'min-h-[1.8rem] text-base font-medium tracking-[0.06em] text-[#7660c8] dark:text-[#ded5ff] sm:min-h-[2.2rem] sm:text-lg md:text-2xl',
] as const;

export default function HomeTitleTyper({ className, lines }: HomeTitleTyperProps) {
  const safeLines = useMemo(() => lines.filter((line) => line.trim().length > 0), [lines]);
  const [activeLine, setActiveLine] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setCursorVisible((visible) => !visible), 520);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (safeLines.length === 0) return;

    const currentLine = safeLines[activeLine] ?? '';

    if (phase === 'typing') {
      if (visibleChars < currentLine.length) {
        const timer = window.setTimeout(() => setVisibleChars((count) => count + 1), TYPE_INTERVAL_MS);
        return () => window.clearTimeout(timer);
      }

      if (activeLine < safeLines.length - 1) {
        const timer = window.setTimeout(() => {
          setActiveLine((index) => index + 1);
          setVisibleChars(0);
          setPhase('typing');
        }, BETWEEN_LINES_MS);
        return () => window.clearTimeout(timer);
      }

      const timer = window.setTimeout(() => setPhase('holding'), 0);
      return () => window.clearTimeout(timer);
    }

    if (phase === 'holding') {
      const timer = window.setTimeout(() => setPhase('resetting'), HOLD_MS);
      return () => window.clearTimeout(timer);
    }

    if (phase === 'resetting') {
      const timer = window.setTimeout(() => {
        setActiveLine(0);
        setVisibleChars(0);
        setPhase('typing');
      }, RESET_MS);
      return () => window.clearTimeout(timer);
    }
  }, [activeLine, phase, safeLines, visibleChars]);

  useEffect(() => {
    if (safeLines.length === 0) return;
    if (activeLine < safeLines.length) return;

    setActiveLine(0);
    setVisibleChars(0);
    setPhase('typing');
  }, [activeLine, safeLines.length]);

  const renderedLines = safeLines.map((line, index) => {
    if (phase === 'resetting') return '';
    if (index < activeLine) return line;
    if (index === activeLine) return line.slice(0, visibleChars);
    return '';
  });

  const cursorLineIndex = phase === 'holding' ? safeLines.length - 1 : activeLine;

  if (safeLines.length === 0) return null;

  return (
    <div className={className}>
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {safeLines.map((line, index) => {
          const displayText = renderedLines[index] ?? '';
          const isCursorLine = cursorLineIndex === index && phase !== 'resetting';
          const lineStyle = LINE_STYLES[index] ?? LINE_STYLES[LINE_STYLES.length - 1];

          return (
            <div key={`${index}-${line}`} className={`${lineStyle} flex items-baseline gap-1`}>
              <span
                className={
                  index === 1
                    ? 'bg-gradient-to-r from-[#4f31d7] via-[#7f5cff] to-[#b79bff] bg-clip-text text-transparent dark:from-[#d6cbff] dark:via-[#b79bff] dark:to-[#efe9ff] drop-shadow-[0_10px_24px_rgba(103,70,255,0.18)]'
                    : ''
                }
              >
                {displayText}
              </span>
              {isCursorLine && (
                <span
                  aria-hidden="true"
                  className="inline-block h-[1em] w-[0.12em] rounded-full bg-[#5b3df5] dark:bg-[#d8cdff]"
                  style={{ opacity: cursorVisible ? 1 : 0 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
