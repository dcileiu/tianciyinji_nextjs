interface HomeTitleTyperProps {
  className?: string;
  lines: readonly string[];
}

const LINE_STYLES = [
  'text-xs font-medium leading-[1.6] tracking-[0.18em] text-[#5f4aa8] dark:text-[#cfc4ff] sm:text-sm md:text-base',
  'text-[1.6rem] font-semibold leading-[1.25] tracking-tight text-[#3f2a8f] dark:text-[#f1ebff] sm:text-[2.05rem] md:text-[2.5rem] lg:text-[2.9rem]',
  'text-sm font-medium leading-[1.55] tracking-[0.06em] text-[#7660c8] dark:text-[#ded5ff] sm:text-base md:text-xl',
] as const;

const gradientClass =
  'bg-gradient-to-r from-[#4f31d7] via-[#7f5cff] to-[#b79bff] bg-clip-text text-transparent dark:from-[#d6cbff] dark:via-[#b79bff] dark:to-[#efe9ff] drop-shadow-[0_10px_24px_rgba(103,70,255,0.18)]';

export default function HomeTitleTyper({ className, lines }: HomeTitleTyperProps) {
  const safeLines = lines.filter((line) => line.trim().length > 0);
  if (safeLines.length === 0) return null;

  return (
    <div className={className}>
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {safeLines.map((line, index) => {
          const lineStyle = LINE_STYLES[index] ?? LINE_STYLES[LINE_STYLES.length - 1];
          const isGradient = index === 1;

          return (
            <div key={`${index}-${line}`} className={lineStyle}>
              <span className={isGradient ? gradientClass : ''}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
