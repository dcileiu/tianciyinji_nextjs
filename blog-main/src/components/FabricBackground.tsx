'use client';

import { useEffect, useRef, useState } from 'react';

type Point = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

export function FabricBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const syncActiveState = () => {
      setIsActive(document.body.classList.contains('background-fabric'));
    };

    syncActiveState();

    const observer = new MutationObserver(syncActiveState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: -9999, y: -9999, active: false };
    let points: Point[] = [];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let columns = 0;
    let spacing = 44;

    const buildPoints = () => {
      spacing = width < 640 ? 32 : 44;

      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      const offsetX = (width - (cols - 1) * spacing) / 2;
      const offsetY = (height - (rows - 1) * spacing) / 2;

      const built: Point[] = [];

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const x = offsetX + c * spacing;
          const y = offsetY + r * spacing;
          built.push({
            baseX: x,
            baseY: y,
            x,
            y,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.6 + 2.0,
          });
        }
      }

      points = built;
      columns = cols;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildPoints();
    };

    const onPointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    };

    const onPointerLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark');

      ctx.clearRect(0, 0, width, height);

      if (mouse.active) {
        const pointerGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
        pointerGlow.addColorStop(0, isDark ? 'rgba(166, 145, 255, 0.22)' : 'rgba(120, 96, 255, 0.18)');
        pointerGlow.addColorStop(0.4, isDark ? 'rgba(120, 96, 255, 0.1)' : 'rgba(120, 96, 255, 0.08)');
        pointerGlow.addColorStop(1, 'rgba(120, 96, 255, 0)');
        ctx.fillStyle = pointerGlow;
        ctx.fillRect(mouse.x - 200, mouse.y - 200, 400, 400);
      }

      const interactionRadius = width < 640 ? 88 : 128;

      for (const point of points) {
        const dx = point.x - mouse.x;
        const dy = point.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        if (!prefersReducedMotion && mouse.active && distance < interactionRadius) {
          const force = Math.pow((interactionRadius - distance) / interactionRadius, 1.6);
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

      const lineRgb = isDark ? '180, 158, 255' : '112, 86, 255';
      const baseLineAlpha = isDark ? 0.08 : 0.06;

      const drawConnection = (from: Point | undefined, to: Point | undefined) => {
        if (!from || !to) return;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.hypot(dx, dy);
        const maxDistance = spacing * 1.5;
        if (distance > maxDistance) return;

        const displacement =
          (Math.hypot(from.x - from.baseX, from.y - from.baseY) + Math.hypot(to.x - to.baseX, to.y - to.baseY)) / 2;
        const alpha = Math.min(baseLineAlpha + displacement * 0.016, 0.28);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = `rgba(${lineRgb}, ${alpha})`;
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

      const dotRgb = isDark ? '180, 158, 255' : '91, 61, 245';
      const baseDotAlpha = isDark ? 0.22 : 0.18;

      for (const point of points) {
        const displacement = Math.hypot(point.x - point.baseX, point.y - point.baseY);
        const alpha = Math.min(baseDotAlpha + displacement * 0.03, 0.9);
        const size = point.size + Math.min(displacement * 0.08, 4.6);
        const rotation = displacement * 0.04;

        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(rotation);
        ctx.fillStyle = `rgba(${dotRgb}, ${alpha})`;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }

    };

    // 帧率限制到 ~30fps，降低主线程占用
    const frameInterval = 1000 / 30;
    let lastFrame = 0;
    const loop = (now: number) => {
      frameRef.current = window.requestAnimationFrame(loop);
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;
      draw();
    };

    resize();

    // 尊重「减少动态效果」：只画一帧静态网格，不启动动画循环
    let startTimer = 0;
    if (prefersReducedMotion) {
      draw();
    } else {
      // 延迟到首屏渲染/水合之后再启动，避免与 LCP 抢占主线程（降低 TBT）
      startTimer = window.setTimeout(() => {
        frameRef.current = window.requestAnimationFrame(loop);
      }, 600);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    return () => {
      window.clearTimeout(startTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [isActive]);

  return (
    <div
      aria-hidden="true"
      style={{ zIndex: 0 }}
      className={`pointer-events-none fixed inset-0 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'
        }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(252,249,255,0.96),rgba(238,231,253,0.92))] dark:bg-[linear-gradient(135deg,rgba(14,10,24,0.97),rgba(7,5,15,0.99))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(126,92,255,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(196,184,250,0.14),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(110,82,230,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(170,150,230,0.07),transparent_36%)]" />
      <div className="absolute inset-0 hidden bg-black/90 dark:block" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
