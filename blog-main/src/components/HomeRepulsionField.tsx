'use client';

import { useEffect, useRef } from 'react';

type Point = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

export default function HomeRepulsionField() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: -9999, y: -9999, active: false };
    let points: Point[] = [];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.8);
    let columns = 0;
    let spacing = 34;

    const buildPoints = () => {
      spacing = width < 640 ? 28 : 34;
      const marginX = width < 640 ? 18 : 32;
      const marginY = width < 640 ? 20 : 28;
      const built: Point[] = [];
      let builtColumns = 0;

      for (let y = marginY; y <= height - marginY; y += spacing) {
        let rowColumns = 0;
        for (let x = marginX; x <= width - marginX; x += spacing) {
          built.push({
            baseX: x,
            baseY: y,
            x,
            y,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.8 + 2.2,
          });
          rowColumns += 1;
        }

        builtColumns = Math.max(builtColumns, rowColumns);
      }

      points = built;
      columns = builtColumns;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.8);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildPoints();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = true;
    };

    const onPointerLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const glow = ctx.createLinearGradient(0, 0, width, height);
      glow.addColorStop(0, 'rgba(91, 61, 245, 0.05)');
      glow.addColorStop(0.5, 'rgba(198, 186, 255, 0.03)');
      glow.addColorStop(1, 'rgba(91, 61, 245, 0.08)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      if (mouse.active) {
        const pointerGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
        pointerGlow.addColorStop(0, 'rgba(166, 145, 255, 0.22)');
        pointerGlow.addColorStop(0.4, 'rgba(120, 96, 255, 0.12)');
        pointerGlow.addColorStop(1, 'rgba(120, 96, 255, 0)');
        ctx.fillStyle = pointerGlow;
        ctx.fillRect(0, 0, width, height);
      }

      for (const point of points) {
        const dx = point.x - mouse.x;
        const dy = point.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const radius = width < 640 ? 88 : 128;

        if (!prefersReducedMotion && mouse.active && distance < radius) {
          const force = Math.pow((radius - distance) / radius, 1.6);
          point.vx += (dx / distance) * force * 2.6;
          point.vy += (dy / distance) * force * 2.6;
        }

        point.vx += (point.baseX - point.x) * 0.052;
        point.vy += (point.baseY - point.y) * 0.052;
        point.vx *= 0.82;
        point.vy *= 0.82;
        point.x += point.vx;
        point.y += point.vy;
      }

      const drawConnection = (from: Point | undefined, to: Point | undefined) => {
        if (!from || !to) return;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.hypot(dx, dy);
        const maxDistance = spacing * 1.5;
        if (distance > maxDistance) return;

        const displacement =
          (Math.hypot(from.x - from.baseX, from.y - from.baseY) + Math.hypot(to.x - to.baseX, to.y - to.baseY)) / 2;
        const alpha = Math.min(0.08 + displacement * 0.016, 0.28);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = `rgba(112, 86, 255, ${alpha})`;
        ctx.lineWidth = distance < spacing * 1.1 ? 0.85 : 0.5;
        ctx.stroke();
      };

      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        const isLastColumn = columns > 0 && (index + 1) % columns === 0;
        const below = points[index + columns];
        const diagonal = points[index + columns + 1];

        if (!isLastColumn) drawConnection(point, points[index + 1]);
        drawConnection(point, below);
        if (!isLastColumn) drawConnection(point, diagonal);
      }

      for (const point of points) {
        const displacement = Math.hypot(point.x - point.baseX, point.y - point.baseY);
        const alpha = Math.min(0.2 + displacement * 0.03, 0.95);
        const size = point.size + Math.min(displacement * 0.08, 4.6);
        const rotation = displacement * 0.04;

        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(rotation);
        ctx.fillStyle = `rgba(91, 61, 245, ${alpha})`;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }

      frameRef.current = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <section className="mt-24 sm:mt-28 md:mt-32">
      <div className="mb-6 flex items-end justify-between gap-6">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#7f71ab] dark:text-[#ab9cd8]">Interactive Field</p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f1ebff] sm:text-3xl md:text-4xl">
            把鼠标丢进这片紫色力场里试试
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-[#615488] dark:text-[#c7baf1] sm:text-base">
            这是放在首页底部的小交互实验。灵感来自你提到的 repulsion 效果，但我把它做得更克制一点，像一块会呼吸的数字织物。
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-[320px] overflow-hidden rounded-[28px] border border-[#dcd2fb] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(242,235,255,0.86))] shadow-[0_24px_80px_rgba(91,61,245,0.12)] dark:border-[#2d2444] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.88),rgba(16,12,28,0.94))]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(126,92,255,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(216,205,255,0.18),transparent_32%)]" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-white/40 px-5 py-4 backdrop-blur-sm dark:border-white/10 sm:px-6">
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#7f71ab] dark:text-[#ab9cd8]">
            Hover to disturb the field
          </span>
          <span className="text-xs text-[#615488] dark:text-[#c7baf1]">Repulsion Study / 01</span>
        </div>
      </div>
    </section>
  );
}
