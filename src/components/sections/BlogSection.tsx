/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-20 22:50:44
 * @LastEditors: tianci tianci1208@outlook.com
 * @LastEditTime: 2025-07-26 20:34:10
 * @FilePath: \my-website\src\app\components\BlogSection.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AnimatedButton from "../ui/AnimatedButton";

const BlogSection: React.FC = () => {
  const router = useRouter();
  
  const handleBlogClick = () => {
    router.push('/blog');
  };

  const handlePortfolioClick = () => {
    // 这里可以添加跳转到个人作品页面的逻辑
    console.log("跳转到个人作品");
  };

  return (
    <section className="relative pt-[50px] pb-[16px] overflow-hidden flex flex-col items-center justify-center" style={{background: "var(--background)"}}>
      <div className="mb-[30px] tianci font-bold text-[20px]">✨ 欢迎探索我的世界</div>

      <div className="mb-[5px] text-center">在这里，你可以发现我的技术思考、项目实践和创意作品。</div>
      <div className="mb-[30px] px-1 w-full text-center">每一篇文章都是我成长路上的足迹，每一个项目都承载着我的热情与专注。</div>

      <div className="flex flex-row lg:flex-row gap-[50px] justify-center items-center max-w-4xl mx-auto">
        {/* 技术博客按钮 */}
        <div className="flex flex-col items-center">
          <h3
            className="text-2xl font-bold mb-4 text-center"
            style={{ fontFamily: "HanChanBanYuanTi, sans-serif", color: 'var(--text-primary)' }}
          >
            技术博客
          </h3>
          <p
            className="mb-6 leading-relaxed text-center max-w-xs"
            style={{ fontFamily: "HanChanBanYuanTi, sans-serif", color: 'var(--text-secondary)' }}
          >
            记录并分享全栈开发，探索最新技术趋势
          </p>
          <AnimatedButton onClick={handleBlogClick} text="阅读文章" />
        </div>

        {/* 个人作品按钮 */}
        <div className="flex flex-col items-center">
          <h3
            className="text-2xl font-bold mb-4 text-center"
            style={{ fontFamily: "HanChanBanYuanTi, sans-serif", color: 'var(--text-primary)' }}
          >
            个人作品
          </h3>
          <p
            className="mb-6 leading-relaxed text-center max-w-xs"
            style={{ fontFamily: "HanChanBanYuanTi, sans-serif", color: 'var(--text-secondary)' }}
          >
            展示项目作品集，从创意构思到技术实现
          </p>
          <AnimatedButton onClick={handlePortfolioClick} text="查看作品" />
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
