/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-22 20:42:49
 * @LastEditors: tianci dex_Liu@outlook.com
 * @LastEditTime: 2025-07-27 23:25:17
 * @FilePath: \my-website\src\components\sections\ThirdScreen.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DotGrid from '../ui/DotGrid';

gsap.registerPlugin(ScrollTrigger);

const ThirdScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    // 内容区域动画
    gsap.fromTo(
      contentRef.current,
      {
        y: 100,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex items-center justify-center overflow-hidden third-screen"
      style={{
        backgroundColor: 'var(--third-section-bg)'
      }}
    >
      {/* 点阵背景 */}
      <DotGrid
        className="absolute inset-0"
        style={{ backgroundColor: 'transparent' }}
        dotSize={3}
        gap={10}
        baseColor="#1a1a2e"
        activeColor="#5227FF"
        proximity={120}
        speedTrigger={80}
        shockRadius={250}
        shockStrength={5}
        maxSpeed={5000}
        resistance={750}
        returnDuration={1.5}
      />
      
      {/* 内容区域 */}
       <h2 className="font-bold absolute Tianci" style={{ fontSize: '23vw', color: '#ffffff', letterSpacing: '0.1em' }}>
          TIANCI
        </h2>
    </section>
  ); 
};

export default ThirdScreen;