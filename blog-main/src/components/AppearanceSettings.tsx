'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Grid3x3, Maximize2, Minimize2, Monitor, Moon, Settings, Square, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { HapticFeedback, triggerHaptic } from '@/utils/haptics';

export type BackgroundOption = 'none' | 'fabric';
export type LayoutMode = 'default' | 'wide' | 'compact';

interface AppearanceConfig {
  backgroundStyle: BackgroundOption;
  layoutMode: LayoutMode;
}

export default function AppearanceSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [config, setConfig] = useState<AppearanceConfig>({
    backgroundStyle: 'fabric',
    layoutMode: 'default',
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('appearance-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<AppearanceConfig>;
        setConfig({
          backgroundStyle: parsed.backgroundStyle === 'none' ? 'none' : 'fabric',
          layoutMode: parsed.layoutMode || 'default',
        });
      } catch (e) {
        console.error('Failed to parse appearance config:', e);
      }
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('appearance-config', JSON.stringify(config));

    if (document.body) {
      document.body.classList.remove('background-character', 'background-luoxiaohei', 'background-fabric');

      if (config.backgroundStyle === 'fabric') {
        document.body.classList.add('background-fabric');
      }
    }

    if (document.documentElement) {
      document.documentElement.classList.remove('layout-default', 'layout-wide', 'layout-compact');
      document.documentElement.classList.add(`layout-${config.layoutMode}`);
    }
  }, [config, mounted]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!mounted) return null;

  const updateBackground = (style: BackgroundOption) => {
    setConfig((prev) => ({ ...prev, backgroundStyle: style }));
  };

  const updateLayout = (mode: LayoutMode) => {
    setConfig((prev) => ({ ...prev, layoutMode: mode }));
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          triggerHaptic(HapticFeedback.Light);
          setIsOpen(!isOpen);
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[#75689e] dark:text-[#b3a4de] hover:text-[#4f31d7] dark:hover:text-[#f0ebff] hover:bg-[#ece5ff] dark:hover:bg-[#231c38] transition-all"
        aria-label="外观设置"
      >
        <Settings className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-2 w-72 bg-[#fffbff] dark:bg-[#171125] rounded-xl border border-[#ddd3fb]/70 dark:border-[#2a2140]/90 shadow-[0_18px_48px_rgba(91,61,245,0.14)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)] overflow-hidden z-50"
          >
            <div className="p-5 space-y-5">
              <div>
                <div className="text-[11px] font-semibold text-[#8677b2] dark:text-[#b4a7db] mb-3 uppercase tracking-wider">
                  主题
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', label: '浅色', Icon: Sun },
                    { value: 'dark', label: '深色', Icon: Moon },
                    { value: 'system', label: '系统', Icon: Monitor },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        triggerHaptic(HapticFeedback.Light);
                        setTheme(item.value);
                      }}
                      className={`group relative p-3 rounded-xl transition-all ${
                        theme === item.value
                          ? 'bg-[#efe8ff] dark:bg-[#241c38]'
                          : 'hover:bg-[#f5f0ff] dark:hover:bg-[#1d162f]'
                      }`}
                    >
                      <item.Icon
                        className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${
                          theme === item.value ? 'text-[#4f31d7] dark:text-[#f0ebff]' : 'text-[#7c6daa] dark:text-[#ac9cd8]'
                        }`}
                      />
                      <div
                        className={`text-[11px] font-medium transition-colors ${
                          theme === item.value ? 'text-[#3d2b82] dark:text-[#f0ebff]' : 'text-[#716397] dark:text-[#ac9cd8]'
                        }`}
                      >
                        {item.label}
                      </div>
                      {theme === item.value && (
                        <motion.div
                          layoutId="activeTheme"
                          className="absolute inset-0 border-2 border-[#c4b6ff] dark:border-[#5b4694] rounded-xl"
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#e5ddfb] dark:bg-[#2a2140]" />

              <div>
                <div className="text-[11px] font-semibold text-[#8677b2] dark:text-[#b4a7db] mb-3 uppercase tracking-wider">
                  背景
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'fabric' as const, label: '织物', Icon: Grid3x3 },
                    { value: 'none' as const, label: '纯净', Icon: Square },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        triggerHaptic(HapticFeedback.Light);
                        updateBackground(item.value);
                      }}
                      className={`group relative p-3 rounded-xl transition-all ${
                        config.backgroundStyle === item.value
                          ? 'bg-[#efe8ff] dark:bg-[#241c38]'
                          : 'hover:bg-[#f5f0ff] dark:hover:bg-[#1d162f]'
                      }`}
                    >
                      <item.Icon
                        className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${
                          config.backgroundStyle === item.value
                            ? 'text-[#4f31d7] dark:text-[#f0ebff]'
                            : 'text-[#7c6daa] dark:text-[#ac9cd8]'
                        }`}
                      />
                      <div
                        className={`text-[11px] font-medium transition-colors ${
                          config.backgroundStyle === item.value
                            ? 'text-[#3d2b82] dark:text-[#f0ebff]'
                            : 'text-[#716397] dark:text-[#ac9cd8]'
                        }`}
                      >
                        {item.label}
                      </div>
                      {config.backgroundStyle === item.value && (
                        <motion.div
                          layoutId="activeBackground"
                          className="absolute inset-0 border-2 border-[#c4b6ff] dark:border-[#5b4694] rounded-xl"
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#e5ddfb] dark:bg-[#2a2140]" />

              <div>
                <div className="text-[11px] font-semibold text-[#8677b2] dark:text-[#b4a7db] mb-3 uppercase tracking-wider">
                  布局
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'compact' as const, label: '紧凑', Icon: Minimize2 },
                    { value: 'default' as const, label: '默认', Icon: Square },
                    { value: 'wide' as const, label: '宽屏', Icon: Maximize2 },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        triggerHaptic(HapticFeedback.Light);
                        updateLayout(item.value);
                      }}
                      className={`group relative p-3 rounded-xl transition-all ${
                        config.layoutMode === item.value
                          ? 'bg-[#efe8ff] dark:bg-[#241c38]'
                          : 'hover:bg-[#f5f0ff] dark:hover:bg-[#1d162f]'
                      }`}
                    >
                      <item.Icon
                        className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${
                          config.layoutMode === item.value
                            ? 'text-[#4f31d7] dark:text-[#f0ebff]'
                            : 'text-[#7c6daa] dark:text-[#ac9cd8]'
                        }`}
                      />
                      <div
                        className={`text-[11px] font-medium transition-colors ${
                          config.layoutMode === item.value
                            ? 'text-[#3d2b82] dark:text-[#f0ebff]'
                            : 'text-[#716397] dark:text-[#ac9cd8]'
                        }`}
                      >
                        {item.label}
                      </div>
                      {config.layoutMode === item.value && (
                        <motion.div
                          layoutId="activeLayout"
                          className="absolute inset-0 border-2 border-[#c4b6ff] dark:border-[#5b4694] rounded-xl"
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
