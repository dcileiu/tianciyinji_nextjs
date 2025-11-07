/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-22 23:48:55
 * @LastEditors: tianci dex_Liu@outlook.com
 * @LastEditTime: 2025-07-27 19:57:14
 * @FilePath: \my-website\src\app\components\Header.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import Logo from "../common/Logo";
import { motion } from "framer-motion";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (clickTimeout) {
      // 双击：返回首页
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      // 添加轻微延迟让动画更自然
      setTimeout(() => {
        router.push('/');
      }, 100);
    } else {
      // 单击：设置延时，如果没有第二次点击则返回上一页
      const timeout = setTimeout(() => {
        router.back();
        setClickTimeout(null);
      }, 300); // 300ms内如果有第二次点击则认为是双击
      setClickTimeout(timeout);
    }
  };

  return (
    <div className="header">
      <div className="header-effect">
        <div className="header-content">
          {usePathname() === "/" ? (
            <div className="logo">
              <Logo />
            </div>
          ) : (
            <motion.div
              onClick={handleBackClick}
              className="sm:w-2.5 md:w-20 flex items-center justify-center space-x-2 cursor-pointer"
              style={{ color: 'var(--purple)' }}
              title="点击返回上一页，双击返回首页"
              whileHover={{
                scale: 1.05,
                opacity: 0.8,
                transition: { duration: 0.2 }
              }}
              whileTap={{
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">返回</span>
            </motion.div>
          )}
          {title && (
            <div className="flex-1 text-center">
              <h4 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold mr-auto" style={{ color: 'var(--purple)' }}>
                {title}
              </h4>
            </div>
          )}
          <div className="ml-auto flex items-center gap-[10px]">
            <ThemeToggle style={{ color: 'var(--purple)' }} />
          </div>
        </div>

        <svg className="header-filter" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="displacementFilter" colorInterpolationFilters="sRGB">
              <feImage x="0" y="0" width="100%" height="100%" href="data:image/svg+xml,%0A%20%20%20%20%3Csvg%20viewBox%3D%220%200%20768%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20%20%20%3Cdefs%3E%0A%20%20%20%20%20%20%20%20%3ClinearGradient%20id%3D%22red%22%20x1%3D%22100%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%220%25%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230000%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22red%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%20%20%20%20%3ClinearGradient%20id%3D%22blue%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230000%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22blue%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%20%20%3C%2Fdefs%3E%0A%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22768%22%20height%3D%2260%22%20fill%3D%22black%22%3E%3C%2Frect%3E%0A%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22768%22%20height%3D%2260%22%20rx%3D%2216%22%20fill%3D%22url(%23red)%22%20%2F%3E%0A%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22768%22%20height%3D%2260%22%20rx%3D%2216%22%20fill%3D%22url(%23blue)%22%20style%3D%22mix-blend-mode%3A%20difference%22%20%2F%3E%0A%20%20%20%20%20%20%3Crect%20%0A%20%20%20%20%20%20%20%20x%3D%222.1%22%20%0A%20%20%20%20%20%20%20%20y%3D%222.1%22%20%0A%20%20%20%20%20%20%20%20width%3D%22763.8%22%20%0A%20%20%20%20%20%20%20%20height%3D%2255.8%22%20%0A%20%20%20%20%20%20%20%20rx%3D%2216%22%20%0A%20%20%20%20%20%20%20%20fill%3D%22hsl(0%200%25%2050%25%20%2F%200.93)%22%20%0A%20%20%20%20%20%20%20%20style%3D%22filter%3Ablur(11px)%22%20%0A%20%20%20%20%20%20%2F%3E%0A%20%20%20%20%3C%2Fsvg%3E%0A%20%20" result="map" />
              <feDisplacementMap id="redchannel" in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" scale="-25" result="dispRed" />
              <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
              <feDisplacementMap id="greenchannel" in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" scale="-20" result="dispGreen" />
              <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
              <feDisplacementMap id="bluechannel" in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" scale="-15" result="dispBlue" />
              <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
              <feBlend in="red" in2="green" mode="screen" result="rg" />
              <feBlend in="rg" in2="blue" mode="screen" result="output" />
              <feGaussianBlur stdDeviation="0.15" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}
