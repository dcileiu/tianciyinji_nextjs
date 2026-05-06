/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-26 16:33:34
 * @LastEditors: tianci tianci1208@outlook.com
 * @LastEditTime: 2025-07-26 16:37:26
 * @FilePath: \my-website\src\components\layout\PageTransition.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div 
      className="page-fade-transition"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {children}
    </div>
  );
}