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
  'text-xs font-medium leading-[1.6] tracking-[0.18em] text-[#5f4aa8] dark:text-[#cfc4ff] sm:text-sm md:text-base',
  'text-[1.6rem] font-semibold leading-[1.25] tracking-tight text-[#3f2a8f] dark:text-[#f1ebff] sm:text-[2.05rem] md:text-[2.5rem] lg:text-[2.9rem]',
  'text-sm font-medium leading-[1.55] tracking-[0.06em] text-[#7660c8] dark:text-[#ded5ff] sm:text-base md:text-xl',
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

  const typedLengthFor = (index: number) => {
    if (phase === 'resetting') return 0;
    if (index < activeLine) return safeLines[index].length;
    if (index === activeLine) return visibleChars;
    return 0;
  };

  const cursorLineIndex = phase === 'holding' ? safeLines.length - 1 : activeLine;

  if (safeLines.length === 0) return null;

  const gradientClass =
    'bg-gradient-to-r from-[#4f31d7] via-[#7f5cff] to-[#b79bff] bg-clip-text text-transparent dark:from-[#d6cbff] dark:via-[#b79bff] dark:to-[#efe9ff] drop-shadow-[0_10px_24px_rgba(103,70,255,0.18)]';

  return (
    <div className={className}>
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {safeLines.map((line, index) => {
          const typedText = line.slice(0, typedLengthFor(index));
          const isCursorLine = cursorLineIndex === index && phase !== 'resetting';
          const lineStyle = LINE_STYLES[index] ?? LINE_STYLES[LINE_STYLES.length - 1];
          const isGradient = index === 1;

          return (
            <div key={`${index}-${line}`} className={`relative ${lineStyle}`}>
              {/* 占位层：始终按完整文案撑开高度，避免打字过程中高度跳动导致下方内容位移 */}
              <span className="invisible block" aria-hidden="true">
                {line}
              </span>

              {/* 显示层：覆盖在占位层之上，仅渲染已打出的文字 */}
              <span className="absolute inset-0 block">
                <span className={isGradient ? gradientClass : ''}>{typedText}</span>
                {isCursorLine && (
                  <span
                    aria-hidden="true"
                    className="ml-[0.08em] inline-block h-[0.72em] w-[0.07em] rounded-full bg-[#5b3df5] align-baseline dark:bg-[#d8cdff]"
                    style={{ opacity: cursorVisible ? 1 : 0 }}
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
