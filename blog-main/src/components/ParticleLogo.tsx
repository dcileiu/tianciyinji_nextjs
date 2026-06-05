'use client';

import { useEffect, useRef } from 'react';

// 与 logo-mark.svg / BrandLogo 保持一致的路径（viewBox 0 0 96 96）
const LOGO_PATHS = ['M34 14H62L54 70H26L34 14Z', 'M54 58H84L80 82H50L54 58Z'];

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  size: number;
  tone: number; // 沙砾亮度差异
  baseAlpha: number; // 单颗静止透明度
  colorPrefix: string; // `rgba(r,g,b,`
  rest: string; // 静止态完整颜色串（性能缓存）
}

interface ParticleLogoProps {
  className?: string;
}

export default function ParticleLogo({ className }: ParticleLogoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let baseR = 96;
    let baseG = 66;
    let baseB = 240;

    const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
    const makeColorPrefix = (tone: number) =>
      `rgba(${clamp255(baseR * tone)},${clamp255(baseG * tone)},${clamp255(baseB * tone)},`;

    const resolveColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        baseR = 222;
        baseG = 212;
        baseB = 255;
      } else {
        baseR = 96;
        baseG = 66;
        baseB = 240;
      }
      // 主题切换后按每颗的亮度重新着色
      for (const p of particlesRef.current) {
        p.colorPrefix = makeColorPrefix(p.tone);
        p.rest = `${p.colorPrefix}${p.baseAlpha.toFixed(3)})`;
      }
    };

    // 离屏栅格化「实心圆 - 镂空 logo」后采样像素，生成粒子目标位置：
    // 粒子汇聚后形成一个完整圆盘，中心镂空出 logo。
    const sampleParticles = () => {
      const box = Math.min(width, height);
      if (box <= 0) return;

      const off = document.createElement('canvas');
      off.width = box;
      off.height = box;
      const octx = off.getContext('2d');
      if (!octx) return;

      // 1) 实心圆盘
      octx.fillStyle = '#000';
      octx.beginPath();
      octx.arc(box / 2, box / 2, (box / 2) * 0.98, 0, Math.PI * 2);
      octx.fill();

      // 2) 把居中的 logo 从圆盘里抠掉（destination-out）
      // logo 内容包围盒（viewBox 0..96）：x 26..84、y 14..82，中心约 (55, 48)
      const logoFraction = 0.52; // logo 占圆盘直径比例
      const s = (logoFraction * box) / 68;
      const tx = box / 2 - 55 * s;
      const ty = box / 2 - 48 * s;
      octx.globalCompositeOperation = 'destination-out';
      octx.setTransform(s, 0, 0, s, tx, ty);
      for (const d of LOGO_PATHS) octx.fill(new Path2D(d));
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.globalCompositeOperation = 'source-over';

      const data = octx.getImageData(0, 0, box, box).data;
      // 细密采样 + 抖动，呈现沙砾质感
      const step = Math.max(2, Math.round(box / 150));
      const offsetX = (width - box) / 2;
      const offsetY = (height - box) / 2;
      const dotScale = Math.max(0.8, box / 300);

      const next: Particle[] = [];
      for (let y = 0; y < box; y += step) {
        for (let x = 0; x < box; x += step) {
          const alpha = data[(y * box + x) * 4 + 3];
          if (alpha > 128) {
            // 在网格内做亚像素抖动，避免规则排布、更像散沙
            const jitter = step * 0.6;
            const homeX = x + offsetX + (Math.random() - 0.5) * jitter;
            const homeY = y + offsetY + (Math.random() - 0.5) * jitter;
            const tone = Math.random() * 0.5 + 0.72; // 0.72..1.22 亮度差异
            const baseAlpha = Math.random() * 0.32 + 0.28; // 0.28..0.6 疏密透明度
            const colorPrefix = makeColorPrefix(tone);
            next.push({
              // 初始随机散布，加载时聚拢成圆盘
              x: Math.random() * width,
              y: Math.random() * height,
              homeX,
              homeY,
              vx: 0,
              vy: 0,
              size: (Math.random() * 0.5 + 0.55) * dotScale,
              tone,
              baseAlpha,
              colorPrefix,
              rest: `${colorPrefix}${baseAlpha.toFixed(3)})`,
            });
          }
        }
      }
      particlesRef.current = next;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      resolveColor();
      sampleParticles();
    };

    const renderFrame = (interactive: boolean) => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const radius = Math.max(48, Math.min(width, height) * 0.22);
      const radiusSq = radius * radius;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const active = interactive && mouseRef.current.active;

      for (const p of particles) {
        if (active) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < radiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const force = (radius - dist) / radius;
            p.vx += (dx / dist) * force * 5.5;
            p.vy += (dy / dist) * force * 5.5;
          }
        }

        // 弹簧回到 logo 目标位置
        p.vx += (p.homeX - p.x) * 0.045;
        p.vy += (p.homeY - p.y) * 0.045;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;

        const speed = Math.abs(p.vx) + Math.abs(p.vy);
        // 静止用缓存色串（省去字符串构建）；运动时按速度提亮
        if (speed < 0.15) {
          ctx.fillStyle = p.rest;
        } else {
          const alpha = Math.min(0.95, p.baseAlpha + speed * 0.06);
          ctx.fillStyle = `${p.colorPrefix}${alpha.toFixed(3)})`;
        }
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    };

    const animate = () => {
      renderFrame(true);
      rafRef.current = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = event.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const onPointerLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    resize();

    if (prefersReducedMotion) {
      // 尊重「减少动态效果」：粒子直接落位，画一帧静态 logo
      for (const p of particlesRef.current) {
        p.x = p.homeX;
        p.y = p.homeY;
      }
      renderFrame(false);
    } else {
      rafRef.current = window.requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const themeObserver = new MutationObserver(resolveColor);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onPointerLeave);

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
    </div>
  );
}
