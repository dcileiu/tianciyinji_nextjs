'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import BrandLogo from '@/components/BrandLogo';

const INTRO_DURATION_MS = 3200;
const EXIT_DURATION_MS = 1050;

type IntroState = 'playing' | 'leaving' | 'hidden';

interface HomeIntroOverlayProps {
  enabled?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function HomeIntroOverlay({ enabled = true }: HomeIntroOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<IntroState>(enabled ? 'playing' : 'hidden');
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!enabled) {
      setState('hidden');
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const introDuration = prefersReducedMotion ? 700 : INTRO_DURATION_MS;
    const exitDuration = prefersReducedMotion ? 260 : EXIT_DURATION_MS;

    setState('playing');
    setProgress(0);

    const start = performance.now();

    const tick = (now: number) => {
      const ratio = clamp((now - start) / introDuration, 0, 1);
      const eased = easeOutCubic(ratio);
      setProgress(Math.round(eased * 100));

      if (ratio < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      setProgress(100);
      setState('leaving');
      hideTimerRef.current = window.setTimeout(() => setState('hidden'), exitDuration);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    };
  }, [enabled]);

  useEffect(() => {
    if (state === 'hidden') return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [state]);

  if (!mounted || !enabled || state === 'hidden') return null;

  const isLeaving = state === 'leaving';
  const logoOpacity = clamp((progress - 24) / 22, 0, 1);
  const logoEntrance = clamp((progress - 30) / 30, 0, 1);
  const logoLateScale = clamp((progress - 82) / 18, 0, 1);
  const revealFillOpacity = clamp((progress - 76) / 18, 0, 0.72);
  const glowOpacity = clamp((progress - 54) / 30, 0, 0.22);
  const logoScale = 0.48 + logoEntrance * 0.52 + logoLateScale * 0.3;
  const logoRotate = 8 - logoEntrance * 6;
  const displayProgress = String(progress).padStart(3, '0');

  const logoMaskStyle = {
    WebkitMaskImage: 'url(/logo-mark.svg)',
    maskImage: 'url(/logo-mark.svg)',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
  } as const;

  return createPortal(
    <motion.div
      initial={{ opacity: 1 }}
      animate={{
        opacity: isLeaving ? 0 : 1,
        filter: isLeaving ? 'blur(8px)' : 'blur(0px)',
      }}
      transition={{ duration: isLeaving ? 1.05 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 left-0 top-0 z-[2147483647] h-screen w-screen overflow-hidden bg-black"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_42%)]" />

      <div className="relative flex h-full w-full items-center justify-center px-6">
        <div className="relative flex h-[220px] w-[220px] items-center justify-center sm:h-[260px] sm:w-[260px] md:h-[320px] md:w-[320px]">
          <motion.div
            animate={{
              scale: isLeaving ? 8.2 : logoScale,
              rotate: isLeaving ? 3 : logoRotate,
              opacity: isLeaving ? 0.96 : logoOpacity,
            }}
            transition={{ duration: isLeaving ? 1 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0"
              style={{
                ...logoMaskStyle,
                opacity: revealFillOpacity,
                background:
                  'radial-gradient(circle at 35% 32%, rgba(246,244,255,0.95), rgba(229,231,255,0.76) 22%, transparent 24%), radial-gradient(circle at 72% 60%, rgba(214,221,255,0.9), rgba(208,217,255,0.34) 18%, transparent 22%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(242,244,255,0.82) 48%, rgba(224,230,255,0.74) 100%)',
              }}
            />
            <div
              className="absolute inset-0 blur-[18px]"
              style={{
                ...logoMaskStyle,
                opacity: glowOpacity,
                background:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.85), rgba(188,198,255,0.32) 46%, transparent 72%)',
              }}
            />
            <BrandLogo className="h-full w-full text-white" decorative />
          </motion.div>
        </div>
      </div>

      <motion.div
        animate={{
          opacity: isLeaving ? 0.92 : 1,
          y: isLeaving ? 8 : 0,
        }}
        transition={{ duration: isLeaving ? 0.9 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute bottom-5 left-5 sm:bottom-7 sm:left-7 md:bottom-8 md:left-8"
      >
        <div className="flex items-end gap-2 font-mono leading-none text-white">
          <span className="text-[72px] tabular-nums tracking-[-0.08em] sm:text-[108px] md:text-[132px]">
            {displayProgress}
          </span>
          <span className="pb-[0.18em] text-[26px] tracking-[-0.08em] sm:text-[38px] md:text-[44px]">%</span>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
