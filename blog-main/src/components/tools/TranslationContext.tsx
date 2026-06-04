'use client';

import React, { createContext, useContext } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { defaultLocale, getDictionary, type Locale } from '@/lib/i18n';

const regexRules: Array<[RegExp, string | ((match: RegExpMatchArray, exactPairs: Record<string, string>) => string)]> = [
  [/^共\s*(\d+)\s*张图片$/, (match) => `${match[1]} images extracted`],
  [/^共提取\s*(\d+)\s*张图片$/, (match) => `${match[1]} images extracted`],
  [/^共\s*(\d+)\s*首歌曲$/, (match) => `${match[1]} songs`],
  [/^第\s*(\d+)\s*张$/, (match) => `Image ${match[1]}`],
  [/^前往作品\s*(\d+)$/, (match) => `Go to work ${match[1]}`],
  [/^前往游戏\s*(\d+)$/, (match) => `Go to game ${match[1]}`],
  [/^前往文章\s*(\d+)$/, (match) => `Go to post ${match[1]}`],
  [/^状态：(.+)$/, (match) => `Status: ${match[1]}`],
  [/^最终地址：(.+)$/, (match) => `Final URL: ${match[1]}`],
  [/^类型：(.+)$/, (match) => `Type: ${match[1]}`],
  [/^长度：(.+)$/, (match) => `Length: ${match[1]}`],
  [/^标题：(.+)$/, (match) => `Title: ${match[1]}`],
  [/^描述：(.+)$/, (match) => `Description: ${match[1]}`],
  [/^平均延迟：(.+)$/, (match) => `Average latency: ${match[1]}`],
  [/^开放端口：(.+)$/, (match) => `Open ports: ${match[1]}`],
  [/^资源：(.+)$/, (match) => `Resource: ${match[1]}`],
  [/^已复制：(.+)$/, (match) => `Copied: ${match[1]}`],
  [/^站点标题：(.+)$/, (match) => `Site title: ${match[1]}`],
  [/^主语言：(.+)$/, (match) => `Primary language: ${match[1]}`],
  [/^站点地址：(.+)$/, (match) => `Site URL: ${match[1]}`],
  [/^语言版本：(.+)$/, (match) => `Language versions: ${match[1]}`],
  [/^主要栏目数：(.+)$/, (match) => `Primary sections: ${match[1]}`],
  [/^主要栏目数：(\d+)\s*个$/, (match) => `Primary sections: ${match[1]}`],
  [/^语言版本：\s*(\d+)\s*个$/, (match) => `Language versions: ${match[1]}`],
  [/^标题\s*(\d+)\s*字符.+$/, (match) => `Title ${match[1]} characters (recommended <= 60)`],
  [/^描述\s*(\d+)\s*字符.+$/, (match) => `Description ${match[1]} characters (recommended <= 160)`],
  [/^总字数.+：(.+)$/, (match) => `Characters excluding whitespace: ${match[1]}`],
  [/^分词数：(.+)$/, (match) => `Tokens: ${match[1]}`],
  [/^关键词「(.+)」出现\s*(\d+)\s*次，密度(?:约)?\s*(.+)$/, (match) => `Keyword "${match[1]}" appears ${match[2]} times, density approx. ${match[3]}`],
  [/^高频词 Top (.+)$/, (match) => `Top words ${match[1]}`],
  [/^(\d+(?:\.\d+)?)\s*字$/, (match) => `${match[1]} characters`],
  [/^(\d+(?:\.\d+)?)\s*天$/, (match) => `${match[1]} days`],
  [/^(\d+(?:\.\d+)?)\s*周$/, (match) => `${match[1]} weeks`],
  [/^共\s*(\d+)\s*首歌曲$/, (match) => `${match[1]} songs`],
  [/^(\d+)\s*年$/, (match) => `${match[1]} years`],
  [/^(\d+)\s*天前$/, (match) => `${match[1]} days ago`],
  [/^(.+)：(.+)$/, (match, exactPairs) => {
    const translatedLabel = translateExact(match[1], exactPairs);
    return translatedLabel ? `${translatedLabel}: ${match[2]}` : match[0];
  }],
  [/^命中\s*(\d+)\s*个词条：?$/, (match) => `${match[1]} matches:`],
  [/^共\s*(\d+)\s*个字段，重复键\s*(\d+)\s*个$/, (match) => `Total ${match[1]} fields, ${match[2]} duplicate keys`],
  [/^(\d+)年(\d+)个月$/, (match) => `${match[1]} years ${match[2]} months`],
  [/^路径：(.+)$/, (match) => 'Path: ' + match[1].replace('哈希：', 'Hash:')],
  [/^原始：(.+)$/, (match) => `Original: ${match[1]}`],
  [/^结果：(.+)$/, (match) => `Result: ${match[1]}`],
  [/^体积比：(.+)$/, (match) => `Ratio: ${match[1]}`],
  [/^模式：混淆$/, 'Mode: Obfuscate'],
  [/^模式：压缩$/, 'Mode: Minify'],
  [/^压缩前\s*(.+)\s*·\s*压缩后\s*(.+)\s*·\s*输出\s*(.+)$/, (match) => `Before ${match[1]} · After ${match[2]} · Output ${match[3]}`],
];

function normalize(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function compact(value: string) {
  return normalize(value).replace(/[，。：“”「」『』、\s]/g, '');
}

let sourceMessageKeys: Record<string, string> | null = null;

function getSourceMessageKeys() {
  if (sourceMessageKeys) return sourceMessageKeys;

  const sourceMessages = getDictionary(defaultLocale).toolTranslations.exact as Record<string, string>;
  sourceMessageKeys = Object.fromEntries(
    Object.entries(sourceMessages).flatMap(([key, value]) => [
      [normalize(value), key],
      [compact(value), key],
    ]),
  );

  return sourceMessageKeys;
}

function translateExact(value: string, exactPairs: Record<string, string>) {
  const source = normalize(value);
  const key = getSourceMessageKeys()[source] ?? getSourceMessageKeys()[compact(source)];
  return key ? exactPairs[key] : undefined;
}

export function translateText(value: string, locale: Locale): string {
  if (locale !== 'en') return value;

  const exactPairs = getDictionary(locale).toolTranslations.exact as Record<string, string>;
  const source = normalize(value);
  if (!source) return source;

  // Direct lookup
  const direct = translateExact(source, exactPairs);
  if (direct) return direct;

  // Regex replacement
  for (const [pattern, replacement] of regexRules) {
    const match = source.match(pattern);
    if (!match) continue;
    return typeof replacement === 'function' ? replacement(match, exactPairs) : replacement;
  }

  return value;
}

const TranslationContext = createContext<{
  locale: Locale;
  t: (text: string) => string;
}>({
  locale: 'zh-CN',
  t: (text) => text,
});

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useI18n();
  const t = React.useCallback(
    (text: string) => {
      return translateText(text, locale);
    },
    [locale]
  );

  return (
    <TranslationContext.Provider value={{ locale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
