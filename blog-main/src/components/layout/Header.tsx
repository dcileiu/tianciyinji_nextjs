'use client';

import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import Link from 'next/link';
import AppearanceSettings from '@/components/AppearanceSettings';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HapticFeedback, triggerHaptic } from '@/utils/haptics';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  title: string;
  showSidebarToggle?: boolean;
}

export function Header({ isSidebarOpen, onToggleSidebar, title, showSidebarToggle = true }: HeaderProps) {
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-[#fbf8ff]/95 dark:bg-[#120f1f]/95',
        'border-b border-[#e5dcff]/70 dark:border-[#2a2140]/80',
        'backdrop-blur supports-[backdrop-filter]:bg-[#fbf8ff]/80 supports-[backdrop-filter]:dark:bg-[#120f1f]/82'
      )}
      aria-label="全局顶部导航"
    >
      <div className="mx-auto flex h-16 items-center gap-2 md:gap-3 px-4 md:px-6">
        {/* 左侧区域 - 固定宽度 */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-[#2e2150] transition-colors hover:text-[#5b3df5] dark:text-[#f3efff] dark:hover:text-[#cdc1ff] text-sm md:text-base"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-[#e4d8ff] bg-[#f6f1ff] text-[#3f2a8f] shadow-[0_8px_24px_rgba(91,61,245,0.12)] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#f4efff]">
              <BrandLogo className="h-[22px] w-[22px]" decorative />
            </span>
            <span>{title}</span>
          </Link>

          {showSidebarToggle && (
            <Button
              aria-label={isSidebarOpen ? '关闭侧边栏' : '打开侧边栏'}
              onClick={() => {
                triggerHaptic(HapticFeedback.Medium);
                onToggleSidebar();
              }}
              variant="ghost"
              className="rounded-md text-[#75689e] dark:text-[#ae9fda] hover:bg-[#ece5ff] dark:hover:bg-[#231c38] hover:text-[#4f31d7] dark:hover:text-[#f3efff] h-8 w-8 md:h-8 md:w-8"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4 md:h-4 md:w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4 md:h-4 md:w-4" />
              )}
            </Button>
          )}
        </div>

        <div className="flex-1" />

        {/* 右侧区域 - 固定宽度 */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* 搜索按钮 */}
          <Link href="/search" onClick={() => triggerHaptic(HapticFeedback.Light)}>
            <Button
              variant="ghost"
              aria-label="搜索"
              className="rounded-full text-[#75689e] dark:text-[#ae9fda] hover:bg-[#ece5ff] dark:hover:bg-[#231c38] hover:text-[#4f31d7] dark:hover:text-[#f3efff] h-8 w-8 md:h-8 md:w-8"
            >
              <Search className="h-4 w-4 md:h-4 md:w-4" />
            </Button>
          </Link>

          {/* 外观设置 */}
          <AppearanceSettings />
        </div>
      </div>
    </header>
  );
}
