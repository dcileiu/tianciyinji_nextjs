/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-22 23:00:00
 * @LastEditors: tianci tianci1208@outlook.com
 * @LastEditTime: 2025-07-26 16:17:20
 * @FilePath: \my-website\src\app\components\ThemeToggle.tsx
 * @Description: 主题切换按钮组件
 */
"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const ThemeToggle: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = async (event: React.MouseEvent) => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";

    // 检查是否支持 View Transition API
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(newTheme);
      return;
    }

    // 获取点击位置
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    // 开始视图过渡
    const transition = document.startViewTransition(async () => {
      setTheme(newTheme);
      // 等待DOM更新
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // 设置圆形扩散动画
    transition.ready
      .then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: newTheme === "dark" ? [...clipPath].reverse() : clipPath,
          },
          {
            duration: 500,
            easing: newTheme === "dark" ? "ease-out" : "ease-in",
            pseudoElement:
              newTheme === "dark"
                ? "::view-transition-old(root)"
                : "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        // 如果动画失败，直接切换主题
        setTheme(newTheme);
      });
  };

  // 在组件挂载前显示占位符，防止水合错误
  if (!mounted) {
    return (
      <button
        className="p-3 border-0 rounded-full bg-transparent flex"
        aria-label="切换主题"
        style={style}
      >
        <Sun className="w-5 h-5 margin-auto" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-3 border-0 rounded-full bg-transparent flex"
      aria-label="切换主题"
      style={style}
    >
      {resolvedTheme === "dark" ? (
        // 太阳图标 (浅色模式)
        <Sun className="w-5 h-5 margin-auto" />
      ) : (
        // 月亮图标 (暗色模式)
        <Moon className="w-5 h-5 margin-auto" />
      )}
    </button>
  );
};

export default ThemeToggle;
