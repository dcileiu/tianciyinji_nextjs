'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import BrandLogo from '@/components/BrandLogo';

const COOKIE_NAME = 'home-intro-seen';
const INTRO_DURATION_MS = 2600;
const EXIT_DURATION_MS = 950;

type IntroState = 'checking' | 'playing' | 'leaving' | 'hidden';

interface HomeIntroOverlayProps {
  enabled?: boolean;
}

function markIntroSeen() {
  document.cookie = `${COOKIE_NAME}=1; path=/; SameSite=Lax`;
}

export default function HomeIntroOverlay({ enabled = true }: HomeIntroOverlayProps) {
  const [state, setState] = useState<IntroState>(enabled ? 'playing' : 'hidden');
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!enabled) {
      setState('hidden');
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      markIntroSeen();
      setState('hidden');
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / INTRO_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setProgress(Math.round(eased * 100));

      if (ratio < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      markIntroSeen();
      exitTimerRef.current = window.setTimeout(() => setState('leaving'), 180);
      hideTimerRef.current = window.setTimeout(() => setState('hidden'), EXIT_DURATION_MS + 220);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
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

  if (!enabled || state === 'checking' || state === 'hidden') return null;

  const isLeaving = state === 'leaving';

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{
        opacity: isLeaving ? 0 : 1,
        y: isLeaving ? '-7%' : '0%',
        filter: isLeaving ? 'blur(8px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[120] overflow-hidden bg-[#0f0b1b]"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3f2a8f_0%,rgba(63,42,143,0.35)_24%,rgba(15,11,27,0.92)_58%,#0f0b1b_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(123,97,255,0.18),transparent_36%,transparent_68%,rgba(216,205,255,0.08))]" />
      <motion.div
        animate={{ opacity: [0.35, 0.75, 0.45], scale: [0.9, 1.08, 0.96] }}
        transition={{ duration: 2.4, ease: 'easeInOut' }}
        className="absolute left-[8%] top-[14%] h-40 w-40 rounded-full bg-[#7558ff]/20 blur-[90px]"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.45, 0.24], x: [0, -10, 4] }}
        transition={{ duration: 2.6, ease: 'easeInOut' }}
        className="absolute bottom-[14%] right-[10%] h-36 w-36 rounded-full border border-[#c6baff]/20"
      />
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.24 }}
        className="absolute left-[9%] top-[22%] h-px w-20 origin-left bg-gradient-to-r from-[#c6baff]/0 via-[#c6baff]/70 to-[#c6baff]/0"
      />
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.38 }}
        className="absolute bottom-[18%] right-[13%] h-24 w-px origin-bottom bg-gradient-to-b from-[#c6baff]/0 via-[#c6baff]/70 to-[#c6baff]/0"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b7a7ff]/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b7a7ff]/50 to-transparent" />

      <div className="relative flex h-full flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-[#cfc4ff]/72 sm:text-xs"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] shadow-[0_18px_36px_rgba(10,8,18,0.28)] backdrop-blur-xl">
              <BrandLogo className="h-[22px] w-[22px]" decorative />
            </span>
            <span>Dci</span>
          </span>
          <span>Personal Archive</span>
        </motion.div>

        <div className="flex flex-1 items-center">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-[30px] border border-white/10 bg-white/[0.04] shadow-[0_30px_80px_rgba(10,8,18,0.35)] backdrop-blur-xl sm:mb-8 sm:h-24 sm:w-24"
            >
              <BrandLogo className="h-12 w-12 sm:h-14 sm:w-14" decorative />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-[11px] uppercase tracking-[0.38em] text-[#bcaeff]/72"
            >
              Entering the next scene
            </motion.div>

            <div className="mt-5 space-y-2 sm:mt-6 sm:space-y-3">
              {['记录', '作品', '长期试验'].map((word, index) => (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, y: 42 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.38 + index * 0.12 }}
                  className="overflow-hidden"
                >
                  <span className="block text-5xl font-semibold tracking-tight text-[#f4efff] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
                    {word}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.84 }}
              className="mt-6 max-w-xl text-sm leading-7 text-[#d8cdff]/70 sm:mt-8 sm:text-base"
            >
              正在载入一个更安静、更有触感的首页，用来安放文章、项目，以及一些缓慢生长的小实验。
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.65 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-[#c7baf1]/72 sm:text-xs">
            <span>Initializing interface</span>
            <span>{String(progress).padStart(2, '0')}%</span>
          </div>
          <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.18 }}
              className="h-full rounded-full bg-gradient-to-r from-[#8e75ff] via-[#c6baff] to-[#f1ebff]"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
