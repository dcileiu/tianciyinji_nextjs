import './style/global.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_SC } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { ChristmasEffect } from '@/components/ChristmasEffect';
import { FabricBackground } from '@/components/FabricBackground';
import { LayoutClient } from '@/components/LayoutClient';
import { MusicRuntime } from '@/components/music/music-runtime';
import { NAV_ITEMS } from '@/lib/navigation';
import { absoluteUrl, siteConfig, siteKeywords } from '@/lib/site-config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const notoSansSC = Noto_Sans_SC({
  variable: '--font-noto-sans-sc',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: siteKeywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: absoluteUrl('/'),
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: '/logo-mark.svg',
    apple: siteConfig.avatar,
  },
};

const navItems = NAV_ITEMS;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="christmas">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var root = document.documentElement;
                  var path = window.location.pathname;
                  var rawConfig = localStorage.getItem('appearance-config');
                  var layout = 'default';
                  var backgroundStyle = 'fabric';

                  if (rawConfig) {
                    var parsed = JSON.parse(rawConfig);
                    layout = parsed.layoutMode || 'default';
                    backgroundStyle = parsed.backgroundStyle === 'none' ? 'none' : 'fabric';
                  }

                  if (path.startsWith('/music') || path.startsWith('/games')) {
                    layout = 'wide';
                  } else if (path.startsWith('/works')) {
                    layout = 'compact';
                  }

                  root.classList.add('layout-' + layout);

                  var noBackgroundPages = ['/music', '/works', '/friends', '/resources', '/games'];
                  var shouldDisableBackground = noBackgroundPages.some(function (page) {
                    return path.startsWith(page);
                  });

                  if (!shouldDisableBackground && backgroundStyle && backgroundStyle !== 'none') {
                    var applyBackground = function () {
                      document.body.classList.add('background-' + backgroundStyle);
                    };

                    if (document.body) {
                      applyBackground();
                    } else {
                      document.addEventListener('DOMContentLoaded', applyBackground, { once: true });
                    }
                  }

                  var sidebarOpen = localStorage.getItem('sidebar-open');
                  if (sidebarOpen === 'true' && window.innerWidth >= 768) {
                    root.style.setProperty('--sidebar-padding', '216px');
                  } else {
                    root.style.setProperty('--sidebar-padding', '24px');
                  }

                  root.classList.add('sidebar-initializing');
                } catch (error) {
                  document.documentElement.classList.add('layout-default');
                  document.documentElement.style.setProperty('--sidebar-padding', '24px');
                  document.documentElement.classList.add('sidebar-initializing');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MusicRuntime>
            <LayoutClient navItems={navItems} siteName={siteConfig.name}>
              {children}
            </LayoutClient>
            <FabricBackground />
            <ChristmasEffect zIndex={0} showCursorHat={false} />
          </MusicRuntime>
        </ThemeProvider>
      </body>
    </html>
  );
}
