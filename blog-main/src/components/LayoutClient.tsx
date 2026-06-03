'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import { I18nProvider, useI18n } from '@/components/I18nProvider';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/Sidebar';
import type { getDictionary, Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LayoutClientProps {
  children: React.ReactNode;
  dictionary: ReturnType<typeof getDictionary>;
  locale: Locale;
}

export function LayoutClient({
  children,
  dictionary,
  locale,
}: LayoutClientProps) {
  return (
    <I18nProvider initialDictionary={dictionary} initialLocale={locale}>
      <LayoutShell>{children}</LayoutShell>
    </I18nProvider>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { cleanPathname, dictionary, navItems, siteConfig } = useI18n();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 某些页面可能不需要显示侧边栏
  const isAuthPage = cleanPathname === '/login' || cleanPathname === '/setup';

  // 全屏页面（无 padding，无 max-width 限制）
  const isFullscreenPage = cleanPathname === '/games' || cleanPathname === '/designs';

  // 初始化：从 localStorage 读取侧边栏状态
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    // 移动端始终默认关闭，不使用 localStorage
    if (!mobile) {
      const savedState = localStorage.getItem('sidebar-open');
      if (savedState !== null) {
        setSidebarOpen(savedState === 'true');
      }
    }

    setIsInitialized(true);

    // 延迟启用 transition，让初始动画有时间播放
    setTimeout(() => {
      if (document.documentElement) {
        document.documentElement.classList.remove('sidebar-initializing');
      }
    }, 400); // 与 Sidebar 动画时间一致
  }, []);

  // 更新 CSS 变量以控制 padding
  useEffect(() => {
    if (!isInitialized) return;

    const paddingValue =
      !isMobile && !isAuthPage && isSidebarOpen
        ? 'calc(var(--sidebar-width) + var(--sidebar-gutter))'
        : 'var(--sidebar-gutter)';

    if (document.documentElement) {
      document.documentElement.style.setProperty('--sidebar-padding', paddingValue);
    }
  }, [isAuthPage, isSidebarOpen, isMobile, isInitialized]);

  // 检测移动端
  useEffect(() => {
    if (!isInitialized) return;

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      const wasMobile = isMobile;
      setIsMobile(mobile);

      // 仅在从桌面端切换到移动端时自动关闭侧边栏
      if (mobile && !wasMobile && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isInitialized, isMobile, isSidebarOpen]);

  const handleToggleSidebar = () => {
    const newState = !isSidebarOpen;
    setSidebarOpen(newState);
    // 只在桌面端保存状态
    if (!isMobile) {
      localStorage.setItem('sidebar-open', String(newState));
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    // 只在桌面端保存状态
    if (!isMobile) {
      localStorage.setItem('sidebar-open', 'false');
    }
  };

  return (
    <div className="relative min-h-dvh w-full text-foreground">

      {!isFullscreenPage && (
        <Header
          isSidebarOpen={isSidebarOpen}
          labels={dictionary.header}
          onToggleSidebar={handleToggleSidebar}
          title={siteConfig.name}
          showSidebarToggle={!isAuthPage}
        />
      )}

      {!isAuthPage && !isFullscreenPage && (
        <Sidebar
          isOpen={isSidebarOpen}
          labels={dictionary.sidebar}
          navItems={navItems}
          onClose={handleCloseSidebar}
        />
      )}

      {!isAuthPage && !isFullscreenPage && (
        <Image
          src="/Dragon.gif"
          alt=""
          width={126}
          height={205}
          unoptimized
          aria-hidden="true"
          className="pointer-events-none fixed right-0 top-1/2 z-20 hidden w-[126px] -translate-y-1/2 select-none md:block"
        />
      )}

      {isFullscreenPage ? (
        <main className="relative w-full">{children}</main>
      ) : (
        <main
          className={cn(
            'relative w-full',
            isAuthPage ? '' : 'pt-16',
            isAuthPage ? '' : 'px-4 md:pr-6',
            !isAuthPage && !isMobile && 'md:transition-[padding-left] md:duration-300 md:ease-out'
          )}
          style={{
            paddingLeft: !isMobile && !isAuthPage ? 'var(--sidebar-padding)' : undefined,
          }}
        >
          {children}
        </main>
      )}

      {!isAuthPage && !isFullscreenPage && (
        <footer
          className={cn('relative w-full', !isMobile && 'transition-[padding-left] duration-300 ease-out')}
          style={{
            paddingLeft: !isMobile && !isAuthPage ? 'var(--sidebar-padding)' : undefined,
          }}
        >
          <Footer siteName={siteConfig.name} tagline={siteConfig.tagline} />
        </footer>
      )}
    </div>
  );
}
