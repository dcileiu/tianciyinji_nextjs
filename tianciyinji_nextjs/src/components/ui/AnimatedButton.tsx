/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-20 23:11:57
 * @LastEditors: tianci tianci1208@outlook.com
 * @LastEditTime: 2025-07-22 22:03:56
 * @FilePath: \my-website\src\app\components\AnimatedButton.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use client';

import React from 'react';
import './AnimatedButton.css';

interface AnimatedButtonProps {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  text?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  onClick, 
  className = '', 
  disabled = false,
  text = 'Modern Button'
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <button 
        className={`animated-button ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
        </svg>
        <span className="text">{text}</span>
        <span className="circle"></span>
        <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
        </svg>
      </button>
    </div>
  );
};

export default AnimatedButton;