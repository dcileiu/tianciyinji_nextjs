'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { NavItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HapticFeedback, triggerHaptic } from '@/utils/haptics';

interface SidebarProps {
  isOpen: boolean;
  width?: number;
  navItems: NavItem[];
  onClose?: () => void;
}

export function Sidebar({ isOpen, width = 192, navItems, onClose }: SidebarProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimating(false);
    }
  }, [isOpen]);

  // 首次加载完成后禁用初始化动画
  useEffect(() => {
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 400); // 动画持续时间
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  const handleClose = () => {
    triggerHaptic(HapticFeedback.Medium);
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    if (isAnimating) {
      setShouldRender(false);
      setIsAnimating(false);
      onClose?.();
    }
  };

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside
        className={cn(
          'hidden md:block',
          'fixed top-0 left-0 z-40 h-screen pt-16',
          'bg-[#fbf8ff] dark:bg-[#120f1f]',
          'transition-transform duration-300 ease-out will-change-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // 初始加载时的淡入动画
          isInitialLoad && isOpen && 'animate-in fade-in slide-in-from-left-4 duration-400'
        )}
        style={{ width }}
        aria-label="侧边导航"
      >
        <nav className="flex h-full flex-col items-stretch justify-center px-6">
          <ul className="space-y-2">
            {navItems
              .filter((item) => item.enabled)
              .map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href as any}
                    className={cn(
                      'group flex h-9 w-full items-center justify-between rounded-md px-3 text-sm',
                      'text-[#34265d] dark:text-[#efeaff]',
                      'hover:bg-[#eee7ff] dark:hover:bg-[#221b37]',
                      'hover:text-[#4f31d7] dark:hover:text-[#ffffff]',
                      'transition-colors duration-200'
                    )}
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </aside>

      {/* 移动端侧边栏 */}
      <AnimatePresence>
        {shouldRender && (
          <motion.div
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: isAnimating ? '-100%' : 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            onAnimationComplete={handleAnimationComplete}
            // @ts-ignore - framer-motion type issue
            className={cn('md:hidden', 'fixed inset-0 z-50', 'bg-[#fbf8ff]/95 dark:bg-[#120f1f]/96', 'backdrop-blur-3xl')}
            onMouseDown={handleClose}
          >
            {/* 侧边栏内容区域 */}
            <div className="w-[280px] h-full" onMouseDown={(e: any) => e.stopPropagation()}>
              {/* 关闭按钮 - 右上角 */}
              <div className="absolute top-6 right-6">
                <button
                  onClick={handleClose}
                  className={cn(
                    'p-2 rounded-full',
                    'text-[#75689e] dark:text-[#b8a9e4]',
                    'hover:bg-[#ece5ff] dark:hover:bg-[#231c38]',
                    'transition-colors duration-200'
                  )}
                  aria-label="关闭菜单"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* 导航内容 */}
              <nav className="flex h-full flex-col justify-center px-8 py-20">
                <ul className="space-y-2">
                  {navItems
                    .filter((item) => item.enabled)
                    .map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href as any}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                          }}
                          className={cn(
                            'block w-full py-3 px-4',
                            'text-3xl font-bold text-left',
                            'text-[#2f2154] dark:text-[#f1ebff]',
                            'rounded-lg',
                            'hover:bg-[#eee7ff] dark:hover:bg-[#221b37]',
                            'transition-all duration-200'
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
