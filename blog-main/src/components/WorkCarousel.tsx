'use client';

import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { cn } from '@/lib/utils';

interface WorkCarouselProps {
  images?: string[];
  alt: string;
  /** 自动轮播间隔（毫秒），0 关闭 */
  interval?: number;
}

export function WorkCarousel({ images, alt, interval = 4500 }: WorkCarouselProps) {
  const { dictionary } = useI18n();
  const text = dictionary.workCarousel;
  const list = (images ?? []).filter(Boolean);
  const count = list.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = (next: number) => setIndex((next + count) % count);

  useEffect(() => {
    if (count <= 1 || paused || interval <= 0) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, interval);
    return () => window.clearInterval(timer);
  }, [count, paused, interval]);

  // 空图：渐变占位
  if (count === 0) {
    return (
      <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(236,227,255,0.9),rgba(220,205,255,0.7))] dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(36,26,61,0.9),rgba(22,15,40,0.9))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(126,92,255,0.18),transparent_42%)]" />
        <div className="relative flex flex-col items-center gap-2 text-[#8b7bbf] dark:text-[#7c6ca6]">
          <ImageOff className="h-7 w-7" />
          <span className="text-xs">{text.screenshotComingSoon}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#e4d8ff] bg-black/5 dark:border-[#2a2140] dark:bg-white/[0.03]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
        touchStartX.current = null;
      }}
    >
      {list.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-out',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={src}
            alt={count > 1 ? text.screenshotAlt.replace('{title}', alt).replace('{index}', String(i + 1)) : alt}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className={cn('object-cover', i === index && 'kenburns-active')}
          />
        </div>
      ))}

      {count > 1 && (
        <>
          {/* 渐变遮罩，让控件更清晰 */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.28),transparent_38%)]" />

          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={text.previous}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/55 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={text.next}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/55 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={text.goToImage.replace('{index}', String(i + 1))}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
