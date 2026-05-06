/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-20 17:04:04
 * @LastEditors: tianci tianci1208@outlook.com
 * @LastEditTime: 2025-07-26 19:28:26
 * @FilePath: \my-website\src\app\components\SecondScreen.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function SecondScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitInstanceRef = useRef<SplitText | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // 完全清理函数
    const cleanup = () => {
      // 清理 SplitText 实例
      if (splitInstanceRef.current) {
        splitInstanceRef.current.revert();
        splitInstanceRef.current = null;
      }

      // 清理时间线
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }

      // 清理所有 ScrollTrigger
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === containerRef.current || 
            (trigger.trigger && containerRef.current?.contains(trigger.trigger as Element))) {
          trigger.kill();
        }
      });

      // 重置所有元素的 GSAP 属性
      if (containerRef.current) {
        const allElements = containerRef.current.querySelectorAll('*');
        gsap.set(allElements, { clearProps: "all" });
        
        // 重置文本元素
        const textElements = containerRef.current.querySelectorAll('.split, .word');
        gsap.set(textElements, { 
          opacity: 0,
          y: 0,
          clearProps: "transform" 
        });
        
        // 重置图片容器到初始状态
        const imageContainers = containerRef.current.querySelectorAll('.stacked-image');
        imageContainers.forEach((img, index) => {
          const parentElement = img.parentElement;
          if (parentElement) {
            const isMobile = window.innerWidth < 1024;
            const initialY = isMobile ? [300, 600, 1200][index] : [600, 1200, 2400][index];
            const initialRotation = [-15, 20, -25][index];
            
            gsap.set(parentElement, {
              y: initialY,
              rotation: initialRotation,
              force3D: true,
              transformOrigin: "center center",
              backfaceVisibility: "hidden",
              perspective: 1000,
            });
          }
        });
      }
      
      isInitializedRef.current = false;
    };

    // 如果已经初始化过，先清理
    if (isInitializedRef.current) {
      cleanup();
    }

    // 使用 requestAnimationFrame 确保 DOM 更新后再初始化
    const initializeAnimations = () => {
      if (!containerRef.current || isInitializedRef.current) return;

      // SplitText动画效果
      const segmenter = new Intl.Segmenter("en", { granularity: "word" });

      document.fonts.ready.then(() => {
        if (!containerRef.current) return;
        
        gsap.set(".split", { opacity: 1 });

        splitInstanceRef.current = SplitText.create(".split", {
          type: "words",
          wordsClass: "word",
          prepareText: (text) => {
             return [...segmenter.segment(text)]
               .map((s) => s.segment)
               .join(String.fromCharCode(8204));
           },
          wordDelimiter: { delimiter: /\u200c/, replaceWith: " " },
          autoSplit: true,
          onSplit: (self) => {
            return gsap.from(self.words, {
              y: 50,
              opacity: 0,
              stagger: 0.1,
              ease: "back",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 70%",
                end: "top 50%",
              },
            });
          },
        });
      });

      // 图片滚动动画效果
      const imageElements = containerRef.current.querySelectorAll(".stacked-image");

      if (imageElements.length > 0) {
        // 为图片容器启用硬件加速和优化
        imageElements.forEach((img, index) => {
          const parentElement = img.parentElement;
          if (parentElement) {
            const isMobile = window.innerWidth < 1024;
            const initialY = isMobile ? [300, 600, 1200][index] : [600, 1200, 2400][index];
            const initialRotation = [-15, 20, -25][index];
            
            gsap.set(parentElement, {
              y: initialY,
              rotation: initialRotation,
              force3D: true,
              transformOrigin: "center center",
              backfaceVisibility: "hidden",
              perspective: 1000,
            });
          }
        });

        // 创建主时间线，固定容器并控制滚动
        timelineRef.current = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "bottom bottom",
            end: "+=300%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: -1,
          },
        });

        // 为每张图片添加滚动跟随动画
        imageElements.forEach((img, index) => {
          const isMobile = window.innerWidth < 1024;
          const initialY = isMobile ? [300, 600, 1200][index] : [600, 1200, 2400][index];
          const finalY = [0, 15, 30][index];
          const initialRotation = [-15, 20, -25][index];
          const finalRotation = [-1, 1, -2][index];
          const startProgress = index * 0.2;

          timelineRef.current?.fromTo(
            img.parentElement,
            {
              y: initialY,
              rotation: initialRotation,
              force3D: true,
            },
            {
              y: finalY,
              rotation: finalRotation,
              duration: 0.6,
              ease: "power2.out",
              force3D: true,
            },
            startProgress
          );
        });
      }
      
      isInitializedRef.current = true;
    };

    requestAnimationFrame(initializeAnimations);

    return cleanup;
  }, []);

  return (
    <section
      ref={containerRef}
      className="flex items-center justify-center px-4 py-8 min-h-screen overflow-hidden second-screen"
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      {/* 标题 */}
      <div className="w-full lg:w-[60%] lg:ml-[7%] z-[99] mb-15 lg:mb-8">
        <h2 className="lg:text-2xl md:text-xs leading-tight split opacity-0 text-center" style={{ color: 'var(--text-primary)' }}>
          你好！<br/><br/>
          我叫天赐（Tianci）,是一名全栈开发工程师，熟悉前端和后端开发，会写点小代码，包括但不限于Vue3、React、Nuxt.js、Next.js、TypeScript、Node.js、Express、MongoDB、MySQL、Redis、Git、Jira、Linux等。
          <br/><br/>
          在跨境支付、发卡、收单、电商、智能AI方向等公司待过，做过各种系统，包括金融支付、内容管理、智能AI应用等。
        </h2>
      </div>

      <div className="w-full mx-auto text-center">
        {/* 图片容器 */}
        <div className="relative">
          <div className="relative inline-block">
            {/* 堆叠图片 */}
            <div className="relative second-img w-[50vw] h-[35vw] mx-auto">
              {/* 第三张图片（底层） */}
              <div
                className="absolute z-[1]" 
                style={{
                  transform: "rotate(-2deg) translate(-15px, 2400px)",
                  filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  willChange: "transform",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                <Image
                  src="/34.jpg"
                  alt="Ranch Photo"
                  width={800}
                  height={600}
                  className="object-contain stacked-image"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                />
              </div>

              {/* 第二张图片（中层） */}
              <div
                className="absolute z-[2]"
                style={{
                  transform: "rotate(1deg) translate(5px, 1200px)",
                  filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
                  boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  willChange: "transform",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                <Image
                  src="/33.jpg"
                  alt="Ranch Photo"
                  width={800}
                  height={600}
                  className="object-contain stacked-image"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                />
              </div>

              {/* 第一张图片（顶层） */}
              <div
                className="absolute z-[3]"
                style={{
                  transform: "rotate(-1deg) translate(0px, 600px)",
                  filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.25))",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  willChange: "transform",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                <Image
                  src="/32.jpg"
                  alt="Ranch Photo"
                  width={800}
                  height={600}
                  className="object-contain stacked-image"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
