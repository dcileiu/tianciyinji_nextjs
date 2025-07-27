/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-22 23:48:55
 * @LastEditors: tianci dex_Liu@outlook.com
 * @LastEditTime: 2025-07-27 19:57:14
 * @FilePath: \my-website\src\app\components\Header.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client";

import { useEffect, useState } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className={`header-content ${isScrolled ? 'scrolled' : ''}`}>
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
            {/* <a style={{color: 'var(--purple)'}} href="https://greensock.com/forums/topic/36177-scrollsmoother-data-speed-and-firstlast-folds/#comment-183450">
              About
            </a> */}
            <ThemeToggle style={{color: 'var(--purple)'}}/>
        </div>
      </div>
    </div>
  );
}
