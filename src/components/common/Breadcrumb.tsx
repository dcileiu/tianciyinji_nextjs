import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import Script from 'next/script';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // 构建结构化数据
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `https://itianci.cn${item.href}` }),
    })),
  };

  return (
    <>
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <nav 
        className={`flex items-center space-x-2 text-sm ${className}`}
        aria-label="面包屑导航"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Link
          href="/"
          className="flex items-center hover:text-blue-600 transition-colors duration-200"
          aria-label="回到首页"
        >
          <Home className="w-4 h-4" />
        </Link>
        
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="hover:text-blue-600 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
} 