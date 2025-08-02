/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-01-27 10:00:00
 * @LastEditors: tianci dex_Liu@outlook.com
 * @LastEditTime: 2025-08-02 22:17:12
 * @FilePath: \my-website\src\app\portfolio\page.tsx
 * @Description: 个人作品展示页面
 */
"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { ExternalLink, Github, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface Project {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  date: string;
  category: string;
}

const projects: Project[] = [
  
  {
    id: 1,
    title: "VCC卡系统",
    description: "虚拟信用卡管理系统",
    longDescription: "一套完整的虚拟信用卡管理系统，包括客户端、运营端、风控端，支持卡片申请、额度管理、交易记录、风控监控等功能，提供安全可靠的虚拟支付解决方案。",
    image: "/35.jpg",
    technologies: ["Vue3", "Vite", "TypeScript", "Pinia", "Ant-design-vue", "class-transformer", "Eslint"],
    githubUrl: "https://github.com/tianci",
    liveUrl: "/",
    date: "2024-04",
    category: "前端架构"
  },
  {
    id: 2,
    title: "API文档多人协同编辑系统",
    description: "基于Vue的API文档多人协同编辑系统",
    longDescription: "这是一个基于Vue的API文档多人协同编辑系统，支持多人同时编辑、版本控制、权限管理等功能，提供完善的文档编写和发布机制。",
    image: "/32.jpg",
    technologies: ["Vue3", "Vite","TypeScript", "shareDB", "WebSocket","Node.js","MongoDB"],
    githubUrl: "https://github.com/tianci",
    liveUrl: "https://apidocs.aletaplanet.com/web/login",
    date: "2023-10",
    category: "全栈开发"
  },
  {
    id: 3,
    title: "天赐印记博客系统",
    description: "基于Next.js和Node.js的全栈博客系统",
    longDescription: "这是一个现代化的全栈博客系统，采用Next.js作为前端框架，Node.js作为后端，支持文章管理、分类标签、主题切换等功能。界面设计简洁优雅，用户体验流畅。",
    image: "/31.jpg",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Nest.js", "Node.js", "MySQL"],
    githubUrl: "https://github.com/tianci",
    liveUrl: "https://itianci.cn",
    date: "2024-12",
    category: "全栈开发"
  },
  {
    id: 4,
    title: "数据可视化大屏",
    description: "基于ECharts的数据可视化展示系统",
    longDescription: "为企业打造的数据可视化大屏系统，支持实时数据展示、多种图表类型、响应式布局，可以灵活配置数据源和图表样式。",
    image: "/37.jpg",
    technologies: ["Vue.js", "ECharts", "WebSocket", "Element Plus"],
    githubUrl: "https://github.com/tianci",
    liveUrl: "/",
    date: "2024-12",
    category: "数据可视化"
  },
  {
    id: 5,
    title: "电商达人CRM系统",
    description: "基于Next.js的电商达人CRM系统",
    longDescription: "这是一个基于Next.js的电商达人CRM系统，支持客户管理、订单管理、库存管理等功能，提供完善的客户关系管理机制。",
    image: "/36.jpg",
    technologies: ["Next.js","Shadcn-ui", "Turbopack","TypeScript","Supabase"],
    githubUrl: "https://github.com/tianci",
    liveUrl: "/",
    date: "2025-07",
    category: "全栈开发"
  },
  {
    id: 6,
    title: "惠买小程序",
    description: "基于uni-app的跨平台电商应用",
    longDescription: "一款功能完整的移动端电商应用，支持商品浏览、购物车、订单管理、支付等核心功能，采用uni-app开发，同时支持iOS和Android平台。",
    image: "/34.jpg",
    technologies: ["uni-app", "Vue.js", "TypeScript", "uni-ui"],
    githubUrl: "https://github.com/tianci",
    liveUrl: "/",
    date: "2022-12",
    category: "移动开发"
  },
];

const categories = ["全部", "全栈开发","前端架构", "前端组件", "数据可视化", "移动开发",  "人工智能"];

const PortfolioPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState("全部");
  const [hoveredProject, setHoveredProject] = React.useState<number | null>(null);

  // 页面进入时重置滚动条位置
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProjects = selectedCategory === "全部" 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  return (
    <div className="min-h-screen pt-24" style={{ backgroundColor: "var(--background)" }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            个人作品集
          </motion.h1>
          <motion.p 
            className="text-lg max-w-2xl mx-auto pt-2"
            style={{ color: "var(--text-secondary)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            展示我在全栈开发、前端技术、数据可视化等领域的项目作品
          </motion.p>
        </div>

        {/* Category Filter */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                    : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105"
                }`}
                style={{
                  color: selectedCategory === category ? 'white' : 'var(--text-primary)',
                  backgroundColor: selectedCategory === category ? undefined : 'var(--section-bg)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              style={{ 
                backgroundColor: 'var(--article-bg)',
                boxShadow: 'var(--card-shadow)'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={400}
                  height={192}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-cover.jpg";
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                    {project.category}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className={`absolute top-4 right-4 flex gap-2 transition-all duration-300 ${
                  hoveredProject === project.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}>
                  {/* 暂时隐藏 */}
                  {/* {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )} */}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={tech} 
                      className="relative px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer group overflow-hidden"
                      style={{ 
                        backgroundColor: 'rgba(156, 163, 175, 0.15)',
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(156, 163, 175, 0.2)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-1">
                        <span 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{
                            background: `linear-gradient(135deg, 
                              hsl(${(techIndex * 137 + 180) % 360}, 65%, 60%) 0%, 
                              hsl(${(techIndex * 137 + 240) % 360}, 70%, 70%) 100%)`
                          }}
                        ></span>
                        {tech}
                      </span>
                    </span>
                  ))}
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Calendar className="w-4 h-4" />
                  <span>{project.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>暂无项目</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {`"${selectedCategory}" 分类下暂无项目作品`}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default PortfolioPage;