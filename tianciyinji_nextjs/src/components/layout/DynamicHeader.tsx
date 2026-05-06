/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-26 00:05:03
 * @LastEditors: tianci tianci1208@outlook.com
 * @LastEditTime: 2025-07-26 14:16:19
 * @FilePath: \my-website\src\components\layout\DynamicHeader.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client";

import { usePathname } from "next/navigation";
import { useArticleStore } from "@/store/articleStore";
import Header from "./Header";

const DynamicHeader: React.FC = () => {
  const pathname = usePathname();
  const { currentArticle } = useArticleStore();
  
  // 根据路径设置标题
  const getTitle = (path: string): string | undefined => {
    switch (path) {
      case "/blog":
        return "博客文章";
      default:
        // 检查是否是文章详情页面
        if (path.startsWith("/blog/") && currentArticle) {
          return currentArticle.title;
        }
        return undefined;
    }
  };
  
  const title = getTitle(pathname);
  
  return <Header title={title} />;
};

export default DynamicHeader;