import './style/global.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_SC } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import { ThemeProvider } from 'next-themes';
import { ChristmasEffect } from '@/components/ChristmasEffect';
import { FabricBackground } from '@/components/FabricBackground';
import { LayoutClient } from '@/components/LayoutClient';
import { MusicRuntime } from '@/components/music/music-runtime';
import { getDictionary, getLocalizedSiteConfig } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { absoluteUrl, siteConfig, siteKeywords } from '@/lib/site-config';
import { buildPageMetadata, buildPersonJsonLd, buildWebSiteJsonLd } from '@/lib/seo';

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

const baseMetadata = buildPageMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: '/',
  keywords: siteKeywords,
});

export const metadata: Metadata = {
  ...baseMetadata,
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s`,
  },
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'technology',
  manifest: '/manifest.webmanifest',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  alternates: {
    canonical: absoluteUrl('/'),
    types: {
      'application/rss+xml': absoluteUrl('/rss'),
    },
  },
  verification: {
    google: '06d6108ddd065823',
  },
  icons: {
    icon: '/logo-mark.svg',
    apple: siteConfig.avatar,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const localizedSiteConfig = getLocalizedSiteConfig(locale);

  return (
    <html lang={localizedSiteConfig.language} suppressHydrationWarning className="christmas">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var root = document.documentElement;
                  var rawConfig = localStorage.getItem('appearance-config');
                  var layout = 'default';
                  var backgroundStyle = 'fabric';

                  if (rawConfig) {
                    var parsed = JSON.parse(rawConfig);
                    layout = parsed.layoutMode || 'default';
                    backgroundStyle = parsed.backgroundStyle === 'none' ? 'none' : 'fabric';
                  }

                  root.classList.add('layout-' + layout);

                  if (backgroundStyle && backgroundStyle !== 'none') {
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
                    root.style.setProperty('--sidebar-padding', 'calc(var(--sidebar-width) + var(--sidebar-gutter))');
                  } else {
                    root.style.setProperty('--sidebar-padding', 'var(--sidebar-gutter)');
                  }

                  root.classList.add('sidebar-initializing');
                } catch (error) {
                  document.documentElement.classList.add('layout-default');
                  document.documentElement.style.setProperty('--sidebar-padding', 'var(--sidebar-gutter)');
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
          <JsonLd data={[buildWebSiteJsonLd(), buildPersonJsonLd()]} />
          <MusicRuntime>
            <LayoutClient
              dictionary={dictionary}
              locale={locale}
            >
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
