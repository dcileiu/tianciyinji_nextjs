"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import SecondScreen from "../components/sections/SecondScreen";
import BlogSection from "../components/sections/BlogSection";
import ThirdScreen from "../components/sections/ThirdScreen";


gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function Home() {
  const smoothWrapperRef = useRef<HTMLDivElement>(null);
  const smoothContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let smoother: ScrollSmoother | null = null;
    let ctx: gsap.Context | null = null;

    // Detect mobile devices for performance optimization
    const isMobile = window.innerWidth <= 768;
    
    // Create ScrollSmoother with mobile-optimized settings
    smoother = ScrollSmoother.create({
      smooth: isMobile ? 1 : 2, // Reduce smoothness on mobile for better performance
      effects: !isMobile, // Disable effects on mobile for better performance
      normalizeScroll: isMobile, // Enable on mobile for better touch scrolling
    });

    ctx = gsap.context(() => {
      // SVG path animation using strokeDasharray (simulating drawSVG)
      const path = document.querySelector(".draw") as SVGPathElement;
      if (path) {
        const pathLength = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        gsap.from(".draw", {
          strokeDashoffset: 0,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".heading",
            start: "clamp(top center)",
            scrub: true,
            pin: ".pin",
            pinSpacing: false,
            markers: false,
          },
        });
      }

      // Set logo opacity (from CodePen)
      gsap.set(".logo svg", { opacity: 1 });
    });

    return () => {
      if (smoother) smoother.kill();
      if (ctx) ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={smoothWrapperRef}>
      <div id="smooth-content" ref={smoothContentRef}>
        <section className="hero pad-l overflow-hidden">
          <div className="heading">
            <div className="pin">
              <h1>
                <span className="clamp">
                  你好！
                  <svg data-name="Layer 1" viewBox="0 0 842.14 500" aria-hidden="true" focusable="false">
                    <path
                      className="draw"
                      d="M336.2,130.05C261.69,118,16.52,122,20.65,244.29c4.17,123,484.3,299.8,734.57,108.37,244-186.65-337.91-311-546.54-268.47"
                      fill="none"
                      stroke="#8A61B9"
                      strokeMiterlimit="10"
                      strokeWidth="8"
                    />
                  </svg>
                </span>
                <span className="yt">这位朋友.</span>
                <span className="sr-only">
                  天赐印记 - Tianci 的前端开发者个人网站，分享 React、Next.js、TypeScript 等现代 Web 开发技术文章与项目作品。
                </span>
              </h1>
            </div>
          </div>

          <div className="images">
            <Image
              data-speed="clamp(2.4)"
              src="/31.jpg"
              alt="前端开发者工作场景 - 专注编程的程序员"
              width={400}
              height={300}
              priority
            />
            <Image
              data-speed="clamp(1.8)"
              src="/35.jpg"
              alt="现代Web开发技术栈 - React Next.js TypeScript"
              width={400}
              height={300}
              priority
            />
            <Image
              data-speed="clamp(2.2)"
              src="/36.jpg"
              alt="技术博客写作 - 分享前端开发经验"
              width={400}
              height={300}
              priority
            />
            <Image
              data-speed="clamp(1.5)"
              src="/37.jpg"
              alt="个人项目作品展示 - 创新的Web应用"
              width={400}
              height={300}
              priority
            />
          </div>
        </section>

        <SecondScreen />

        <BlogSection />

        <ThirdScreen />
      </div>
    </div>
  );
}
