'use client';

import { useEffect, useMemo, useState } from 'react';

interface HomeTitleSvgProps {
  className?: string;
  lines: readonly string[];
}

const VIEWBOX_WIDTH = 860;
const VIEWBOX_HEIGHT = 76;
const TEXT_X = 0;
const TEXT_Y = 44;
const FONT_SIZE = 40;
const TYPE_INTERVAL_MS = 110;
const DELETE_INTERVAL_MS = 55;
const HOLD_MS = 1800;
const CURSOR_WIDTH = 16;

type Phase = 'typing' | 'holding' | 'deleting';

export default function HomeTitleSvg({ className, lines }: HomeTitleSvgProps) {
  const safeLines = useMemo(() => lines.filter((line) => line.trim().length > 0), [lines]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [cursorVisible, setCursorVisible] = useState(true);

  const currentLine = safeLines[activeIndex] ?? '';
  const visibleText = currentLine.slice(0, visibleChars);

  useEffect(() => {
    if (safeLines.length === 0) return;

    if (phase === 'typing') {
      if (visibleChars < currentLine.length) {
        const timer = window.setTimeout(() => setVisibleChars((count) => count + 1), TYPE_INTERVAL_MS);
        return () => window.clearTimeout(timer);
      }

      const timer = window.setTimeout(() => setPhase('holding'), 0);
      return () => window.clearTimeout(timer);
    }

    if (phase === 'holding') {
      const timer = window.setTimeout(() => setPhase('deleting'), HOLD_MS);
      return () => window.clearTimeout(timer);
    }

    if (visibleChars > 0) {
      const timer = window.setTimeout(() => setVisibleChars((count) => count - 1), DELETE_INTERVAL_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % safeLines.length);
      setPhase('typing');
    }, 200);
    return () => window.clearTimeout(timer);
  }, [currentLine.length, phase, safeLines.length, visibleChars]);

  useEffect(() => {
    const timer = window.setInterval(() => setCursorVisible((visible) => !visible), 500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setVisibleChars(0);
  }, [activeIndex]);

  useEffect(() => {
    if (safeLines.length === 0) return;
    if (activeIndex < safeLines.length) return;

    setActiveIndex(0);
    setVisibleChars(0);
    setPhase('typing');
  }, [activeIndex, safeLines.length]);

  if (safeLines.length === 0) return null;

  return (
    <div aria-hidden="true" className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMinYMid meet"
        className="h-auto w-full overflow-visible"
      >
        <text
          x={TEXT_X}
          y={TEXT_Y}
          fill="#2E97F7"
          fontSize={FONT_SIZE}
          fontFamily="'Fira Code', 'JetBrains Mono', 'SF Mono', ui-monospace, monospace"
          textAnchor="start"
          letterSpacing="normal"
        >
          {visibleText}
        </text>
        <rect
          x={Math.max(0, visibleText.length * (FONT_SIZE * 0.62))}
          y={12}
          width={CURSOR_WIDTH}
          height={38}
          rx={2}
          fill="#2E97F7"
          opacity={cursorVisible ? 1 : 0}
        />
      </svg>
    </div>
  );
}
