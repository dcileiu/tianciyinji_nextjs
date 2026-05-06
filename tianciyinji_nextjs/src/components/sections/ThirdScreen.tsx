/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-22 20:42:49
 * @LastEditors: tianci dex_Liu@outlook.com
 * @LastEditTime: 2025-08-02 22:10:26
 * @FilePath: \my-website\src\components\sections\ThirdScreen.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use client';

import React from 'react';
import DotGrid from '../ui/DotGrid';

const ThirdScreen: React.FC = () => {
  return (
    <section
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
    </section>
  );
};

export default ThirdScreen;