/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-01-27 10:00:00
 * @LastEditors: tianci tianci1208@outlook.com
 * @LastEditTime: 2025-01-27 10:00:00
 * @FilePath: \tianciyinji_nextjs\src\components\common\Loading.tsx
 * @Description: 通用Loading组件
 */
import React from 'react';

interface LoadingProps {
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** Loading容器的尺寸 */
  size?: 'small' | 'medium' | 'large' | number;
  /** 是否显示Loading */
  visible?: boolean;
  /** 加载文本 */
  text?: string;
  /** 是否全屏显示 */
  fullscreen?: boolean;
  /** 背景遮罩透明度 */
  maskOpacity?: number;
}

export default function Loading({
  className = '',
  style,
  size = 'medium',
  visible = true,
  text,
  fullscreen = false,
  maskOpacity = 0.5
}: LoadingProps) {
  if (!visible) return null;

  // 根据size计算实际尺寸
  const getSize = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'small': return 60;
      case 'medium': return 80;
      case 'large': return 120;
      default: return 80;
    }
  };

  const logoSize = getSize();

  const containerClass = fullscreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center'
    : 'flex items-center justify-center w-full h-full min-h-[300px]';

  const maskStyle = fullscreen 
    ? { backgroundColor: `rgba(255, 255, 255, ${maskOpacity})` }
    : {};

  return (
    <div 
      className={`${containerClass} ${className}`}
      style={{ ...maskStyle, ...style }}
    >
      <div className="flex flex-col items-center justify-center">
        <div 
          className="relative"
          style={{ width: logoSize, height: logoSize }}
        >
          {/* 旋转环 */}
          <div 
            className="absolute border-2 border-transparent border-t-purple-500 rounded-full animate-spin"
            style={{
              width: logoSize + 40,
              height: logoSize + 40,
              top: -20,
              left: -20
            }}
          />
          
          {/* Logo SVG */}
          <svg 
            className="w-full h-full relative z-10 animate-burst-rotate" 
            viewBox="0 0 100.34 100.34" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <g 
              fill="#8A61B9" 
              transform="matrix(.34923 0 0 .34923 -2.282 -2.195)"
            >
              <path d="M150 198.8c26.1 0 47.2 21.2 47.2 47.4s-21.1 47.4-47.2 47.4-47.2-21.2-47.2-47.4 21.1-47.4 47.2-47.4zM198.7 152.9c-.1-1.1-.1-2.2-.1-3.3.1-12.4-4.5-24.4-13.3-33.2l-2-2c-8.7-8.7-20.5-13.4-32.8-13.3h-1.4c-12.3-.2-24.1 4.6-32.8 13.3l-2 2c-8.8 8.8-13.3 20.8-13.3 33.2 0 1.1 0 2.2-.1 3.3-1.3 23.3-19.8 42.4-43.1 44.3-29.3 2.5-53.5-21.9-51.1-51.3 1.9-23.3 21-41.8 44.1-43.2 1-.1 2.2-.1 3.2-.1 12.4.1 24.3-4.5 33.1-13.3l2-2c8.8-8.8 13.3-20.8 13.3-33.2 0-1.6.1-3.3.2-4.9 2.1-22.9 20.8-41.1 43.7-42.8C174 4.5 197 26.4 197 53.6v.7c-.2 12.3 4.6 24.2 13.3 32.9l2 2c8.8 8.8 20.7 13.4 33.1 13.3 1 0 2.1 0 3.2.1 23.3 1.3 42.2 19.9 44.1 43.2 2.5 29.4-21.8 53.7-51.1 51.3-23.1-1.8-41.5-21-42.9-44.2zM101.3 147.1c.1 1.1.1 2.2.1 3.3-.1 12.4 4.5 24.4 13.3 33.2l2 2c8.7 8.7 20.5 13.4 32.8 13.3h1.4c12.3.2 24.1-4.6 32.8-13.3l2-2c8.8-8.8 13.3-20.8 13.3-33.2 0-1.1 0-2.2.1-3.3 1.3-23.3 19.8-42.4 43.1-44.3 29.3-2.5 53.5 21.9 51.1 51.3-1.9 23.3-21 41.8-44.1 43.2-1 .1-2.2.1-3.2.1-12.4-.1-24.3 4.5-33.1 13.3l-2 2c-8.8 8.8-13.3 20.8-13.3 33.2 0 1.6-.1 3.3-.2 4.9-2.1 22.9-20.8 41.1-43.7 42.8C126 295.5 103 273.6 103 246.4v-.7c.2-12.3-4.6-24.2-13.3-32.9l-2-2c-8.8-8.8-20.7-13.4-33.1-13.3-1 0-2.1 0-3.2-.1-23.3-1.3-42.2-19.9-44.1-43.2-2.5-29.4 21.8-53.7 51.1-51.3 23.1 1.8 41.5 21 42.9 44.2z" />
            </g>
          </svg>
        </div>
        
        {/* 加载文本 */}
        {text && (
          <div className="mt-4 text-gray-600 text-sm font-medium animate-pulse">
            {text}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .animate-burst-rotate {
          animation: burstRotate 3s ease-in-out infinite;
        }
        
        @keyframes burstRotate {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.1); }
        }
      `}</style>

    </div>
  );
}