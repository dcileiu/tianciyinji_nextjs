'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ToolsNavSubmenu } from '@/components/ToolsNavSubmenu';
import { useI18n } from '@/components/I18nProvider';
import type { NavItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HapticFeedback, triggerHaptic } from '@/utils/haptics';

interface SidebarProps {
  isOpen: boolean;
  labels: {
    ariaLabel: string;
    closeMenu: string;
    collapseSubmenu: string;
    expandSubmenu: string;
  };
  navItems: NavItem[];
  onClose?: () => void;
}

function splitIntoBalancedColumns(items: NavItem[]): [NavItem[], NavItem[]] {
  const columns: [NavItem[], NavItem[]] = [[], []];
  const heights = [0, 0];

  for (const item of items) {
    const childCount = item.children?.filter((child) => child.enabled).length ?? 0;
    const estimatedHeight = childCount + 1;
    const targetColumn = heights[0] <= heights[1] ? 0 : 1;
    columns[targetColumn].push(item);
    heights[targetColumn] += estimatedHeight;
  }

  return columns;
}

export function Sidebar({ isOpen, labels, navItems, onClose }: SidebarProps) {
  const { localizedHref } = useI18n();
  const router = useRouter();
  const asideRef = useRef<HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // 移动端展开的子菜单（按 label 记录）
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);
  // 桌面端飞出子菜单：首次悬停/聚焦后才挂载，避免重型工具菜单常驻渲染、拖慢首屏与语言切换
  const [mountedDesktopMenus, setMountedDesktopMenus] = useState<Record<string, boolean>>({});
  const markDesktopMenuMounted = (label: string) =>
    setMountedDesktopMenus((prev) => (prev[label] ? prev : { ...prev, [label]: true }));

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimating(false);
    } else {
      // 关闭时收起所有展开的子菜单
      setExpandedLabel(null);
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

  // 同步侧栏实际宽度，供主内容区 padding 与音乐播放器定位使用
  useEffect(() => {
    const el = asideRef.current;
    if (!el || !isOpen) return;

    const syncWidth = () => {
      document.documentElement.style.setProperty('--sidebar-width', `${el.getBoundingClientRect().width}px`);
    };

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen, navItems]);

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

  const visibleItems = useMemo(() => navItems.filter((item) => item.enabled), [navItems]);
  // 仅预取顶级导航项：工具子菜单含数十个独立页，全部预取会造成不必要的请求与开销。
  const navHrefs = useMemo(
    () => visibleItems.map((item) => localizedHref(item.href)),
    [localizedHref, visibleItems],
  );

  useEffect(() => {
    for (const href of navHrefs) {
      router.prefetch(href as any);
    }
  }, [navHrefs, router]);

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside
        ref={asideRef}
        className={cn(
          'hidden md:block',
          'fixed top-0 left-0 z-40 h-screen w-fit pt-16',
          'bg-transparent',
          'transition-transform duration-300 ease-out will-change-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // 初始加载时的淡入动画
          isInitialLoad && isOpen && 'animate-in fade-in slide-in-from-left-4 duration-400'
        )}
        aria-label={labels.ariaLabel}
      >
        <nav className="flex h-full flex-col items-start justify-center px-3 lg:px-4">
          <ul className="space-y-2">
            {visibleItems.map((item) => {
              const isToolsNav = item.href === '/tools';
              const children = item.children?.filter((child) => child.enabled) ?? [];
              const childColumns = splitIntoBalancedColumns(children);
              const hasChildren = isToolsNav || children.length > 0;

              return (
                <li
                  key={item.label}
                  className="group/navitem relative"
                  onMouseEnter={hasChildren ? () => markDesktopMenuMounted(item.label) : undefined}
                  onFocusCapture={hasChildren ? () => markDesktopMenuMounted(item.label) : undefined}
                >
                  <Link
                    href={localizedHref(item.href) as any}
                    className={cn(
                      'group inline-flex h-9 w-fit min-w-0 items-center gap-1 rounded-md px-3 text-sm whitespace-nowrap',
                      'text-[#34265d] dark:text-[#efeaff]',
                      'hover:bg-[#eee7ff] dark:hover:bg-[#221b37]',
                      'hover:text-[#4f31d7] dark:hover:text-[#ffffff]',
                      'transition-colors duration-200',
                      hasChildren && 'group-hover/navitem:bg-[#eee7ff] dark:group-hover/navitem:bg-[#221b37]'
                    )}
                  >
                    <span>{item.label}</span>
                    {hasChildren && (
                      <ChevronRight
                        className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-hover/navitem:translate-x-0.5"
                        aria-hidden="true"
                      />
                    )}
                  </Link>

                  {/* 桌面端：悬停在右侧展开的子菜单 */}
                  {hasChildren && (
                    <div
                      className={cn(
                        'invisible absolute left-full top-1/2 z-50 pl-2 opacity-0',
                        '-translate-y-1/2 translate-x-1 transition-all duration-200',
                        'group-hover/navitem:visible group-hover/navitem:translate-x-0 group-hover/navitem:opacity-100',
                        'group-focus-within/navitem:visible group-focus-within/navitem:translate-x-0 group-focus-within/navitem:opacity-100'
                      )}
                    >
                      {mountedDesktopMenus[item.label] && (
                      <div
                        className={cn(
                          'w-[min(28rem,calc(100vw-7rem))] max-h-[70vh] overflow-y-auto overscroll-contain rounded-xl p-2',
                          'bg-popover text-popover-foreground',
                          'border border-border',
                          'shadow-[0_12px_40px_rgba(63,42,143,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
                          'backdrop-blur-xl'
                        )}
                      >
                        {isToolsNav ? (
                          <ToolsNavSubmenu />
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {childColumns.map((column, columnIndex) => (
                              <ul key={columnIndex} className="min-w-0 space-y-2">
                                {column.map((child) => {
                                  const groupTools = child.children?.filter((tool) => tool.enabled) ?? [];

                                  if (groupTools.length === 0) {
                                    return (
                                      <li key={child.label}>
                                        <Link
                                          href={localizedHref(child.href) as any}
                                          className={cn(
                                            'block rounded-lg px-3 py-2 text-sm whitespace-nowrap',
                                            'text-foreground/80',
                                            'hover:bg-accent hover:text-accent-foreground',
                                            'transition-colors duration-150'
                                          )}
                                        >
                                          {child.label}
                                        </Link>
                                      </li>
                                    );
                                  }

                                  return (
                                    <li key={child.label}>
                                      <span
                                        className={cn(
                                          'block px-3 py-1.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap select-none',
                                          'text-foreground/45'
                                        )}
                                      >
                                        {child.label}
                                      </span>
                                      <ul>
                                        {groupTools.map((tool) => (
                                          <li key={tool.label}>
                                            <Link
                                              href={localizedHref(tool.href) as any}
                                              className={cn(
                                                'block rounded-lg px-3 py-1.5 text-sm whitespace-nowrap',
                                                'text-foreground/80',
                                                'hover:bg-accent hover:text-accent-foreground',
                                                'transition-colors duration-150'
                                              )}
                                            >
                                              {tool.label}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </li>
                                  );
                                })}
                              </ul>
                            ))}
                          </div>
                        )}
                      </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
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
            className={cn('md:hidden', 'fixed inset-0 z-50', 'bg-background text-foreground', 'backdrop-blur-3xl')}
            onMouseDown={handleClose}
          >
            {/* 侧边栏内容区域 */}
            <div
              className="h-full w-[min(20rem,82vw)] overflow-y-auto overscroll-contain"
              onMouseDown={(e: any) => e.stopPropagation()}
            >
              {/* 关闭按钮 - 右上角 */}
              <div className="absolute top-6 right-6">
                <button
                  onClick={handleClose}
                  className={cn(
                    'p-2 rounded-full',
                    'text-foreground/70',
                    'hover:bg-accent hover:text-foreground',
                    'transition-colors duration-200'
                  )}
                  aria-label={labels.closeMenu}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* 导航内容 */}
              <nav className="flex min-h-full flex-col justify-center px-8 py-20">
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const isToolsNav = item.href === '/tools';
                    const children = item.children?.filter((child) => child.enabled) ?? [];
                    const hasChildren = isToolsNav || children.length > 0;
                    const isExpanded = expandedLabel === item.label;

                    return (
                      <li key={item.label}>
                        <div className="flex items-center">
                          <Link
                            href={localizedHref(item.href) as any}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClose();
                            }}
                            className={cn(
                              'block flex-1 py-3 px-4',
                              'text-3xl font-bold text-left',
                              'text-foreground',
                              'rounded-lg',
                              'hover:bg-accent',
                              'transition-colors duration-200'
                            )}
                          >
                            {item.label}
                          </Link>

                          {hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic(HapticFeedback.Light);
                                setExpandedLabel((prev) => (prev === item.label ? null : item.label));
                              }}
                              className={cn(
                                'ml-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg',
                                'text-foreground/70',
                                'hover:bg-accent hover:text-foreground',
                                'transition-colors duration-200'
                              )}
                              aria-label={
                                isExpanded
                                  ? labels.collapseSubmenu.replace('{label}', item.label)
                                  : labels.expandSubmenu.replace('{label}', item.label)
                              }
                              aria-expanded={isExpanded}
                            >
                              <ChevronDown
                                className={cn(
                                  'h-6 w-6 transition-transform duration-200',
                                  isExpanded && 'rotate-180'
                                )}
                              />
                            </button>
                          )}
                        </div>

                        {/* 移动端子菜单（手风琴展开） */}
                        {hasChildren && (
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                key={`${item.label}-children`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                                // @ts-ignore - framer-motion type issue
                                className="overflow-hidden pl-2 pr-2"
                              >
                                {isToolsNav ? (
                                  <ToolsNavSubmenu variant="mobile" onNavigate={handleClose} />
                                ) : (
                                  <ul>
                                    {children.map((child) => {
                                      const groupTools = child.children?.filter((tool) => tool.enabled) ?? [];

                                      if (groupTools.length === 0) {
                                        return (
                                          <li key={child.label}>
                                            <Link
                                              href={localizedHref(child.href) as any}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleClose();
                                              }}
                                              className={cn(
                                                'block rounded-lg px-4 py-2.5',
                                                'text-lg font-medium',
                                                'text-foreground/75',
                                                'hover:bg-accent hover:text-foreground',
                                                'transition-colors duration-200'
                                              )}
                                            >
                                              {child.label}
                                            </Link>
                                          </li>
                                        );
                                      }

                                      return (
                                        <li key={child.label} className="mt-2 first:mt-0">
                                          <span
                                            className={cn(
                                              'block px-4 py-1.5 select-none',
                                              'text-sm font-semibold uppercase tracking-wide',
                                              'text-foreground/45'
                                            )}
                                          >
                                            {child.label}
                                          </span>
                                          <ul className="pl-2">
                                            {groupTools.map((tool) => (
                                              <li key={tool.label}>
                                                <Link
                                                  href={localizedHref(tool.href) as any}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleClose();
                                                  }}
                                                  className={cn(
                                                    'block rounded-lg px-4 py-2',
                                                    'text-base font-medium',
                                                    'text-foreground/75',
                                                    'hover:bg-accent hover:text-foreground',
                                                    'transition-colors duration-200'
                                                  )}
                                                >
                                                  {tool.label}
                                                </Link>
                                              </li>
                                            ))}
                                          </ul>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
