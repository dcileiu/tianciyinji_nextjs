'use client';

import { Check, Copy, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FancySelect,
  OutputBox,
  downloadPlainText,
  inputClass,
  secondaryButtonClass,
} from '@/components/tools/tool-ui';
import { useServerTool } from '@/components/tools/use-server-tool';
import {
  analyzeKeywordDensity,
  buildJsonLd,
  buildRobotsTxt,
  buildSeoMetaTags,
} from '@/lib/tools/seo-builders';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/tools/TranslationContext';

/* ===================== llms.txt 生成器（服务端） ===================== */
export function LlmsTxtTool() {
  const { t } = useTranslation();
  const [llmsUrlInput, setLlmsUrlInput] = useState('https://itianci.cn');
  const { loading, result, error, copied, run, copy } = useServerTool<any>('llms-txt');

  return (
    <div className="space-y-3">
      <Input className={inputClass} value={llmsUrlInput} onChange={(e) => setLlmsUrlInput(e.target.value)} placeholder={t('例如 https://example.com')} />

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => run({ url: llmsUrlInput })} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('生成 llms.txt')}
        </Button>

        {result?.generated && (
          <>
            <Button variant="outline" onClick={() => copy(result.generated)} className={secondaryButtonClass}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? t('已复制') : t('复制文本')}
            </Button>
            <Button variant="outline" onClick={() => downloadPlainText('llms.txt', result.generated)} className={secondaryButtonClass}>
              <Download className="mr-2 h-4 w-4" />
              {t('下载 llms.txt')}
            </Button>
          </>
        )}
      </div>

      {error && <OutputBox>{error}</OutputBox>}

      {result && (
        <OutputBox className="space-y-3">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>{t(`站点标题：${result.siteTitle}`)}</div>
            <div>{t(`主语言：${result.language || '-'}`)}</div>
            <div className="break-all">{t(`站点地址：${result.siteUrl}`)}</div>
            <div>{t(`语言版本：${result.languageVariants.filter((item: { code: string }) => item.code !== 'x-default').length} 个`)}</div>
            <div>{t(`主要栏目数：${result.primarySections.length} 个`)}</div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <a href={result.robots.url} target="_blank" rel="noreferrer" className="rounded-full border border-[#ddd0ff] bg-white/70 px-3 py-1.5 text-[#5c4a88] transition hover:border-[#8b6bff] hover:text-[#5b3df5] dark:border-[#392d56] dark:bg-white/[0.03] dark:text-[#d2c6f3]">
              robots.txt
            </a>
            <a href={result.sitemap.url} target="_blank" rel="noreferrer" className="rounded-full border border-[#ddd0ff] bg-white/70 px-3 py-1.5 text-[#5c4a88] transition hover:border-[#8b6bff] hover:text-[#5b3df5] dark:border-[#392d56] dark:bg-white/[0.03] dark:text-[#d2c6f3]">
              sitemap.xml
            </a>
            {result.rssUrl && (
              <a href={result.rssUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[#ddd0ff] bg-white/70 px-3 py-1.5 text-[#5c4a88] transition hover:border-[#8b6bff] hover:text-[#5b3df5] dark:border-[#392d56] dark:bg-white/[0.03] dark:text-[#d2c6f3]">
                RSS / Feed
              </a>
            )}
          </div>

          {result.languageVariants.filter((item: { code: string }) => item.code !== 'x-default').length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.18em] text-[#7f71ab] dark:text-[#ab9cd8]">Language Versions</div>
              <div className="flex flex-wrap gap-2">
                {result.languageVariants.map((item: { code: string; label: string; url: string }) =>
                  item.code === 'x-default' ? null : (
                    <a
                      key={`${item.code}-${item.url}`}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[#dacdff] bg-[#f7f1ff] px-3 py-1.5 text-xs text-[#543c8f] transition hover:border-[#8b6bff] hover:text-[#4f31d7] dark:border-[#392d56] dark:bg-[#211834] dark:text-[#d8ccff]"
                    >
                      {item.label}
                      <span className="ml-1 text-[#876fc4] dark:text-[#bbaef0]">{item.code}</span>
                    </a>
                  ),
                )}
              </div>
            </div>
          )}

          {result.primarySections.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.18em] text-[#7f71ab] dark:text-[#ab9cd8]">Primary Sections</div>
              <div className="flex flex-wrap gap-2">
                {result.primarySections.map((item: { label: string; url: string }) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[#dacdff] bg-[#f7f1ff] px-3 py-1.5 text-xs text-[#543c8f] transition hover:border-[#8b6bff] hover:text-[#4f31d7] dark:border-[#392d56] dark:bg-[#211834] dark:text-[#d8ccff]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <textarea className={`${inputClass} min-h-[320px] resize-y font-mono text-xs leading-6`} value={result.generated} readOnly />
        </OutputBox>
      )}
    </div>
  );
}

function useCopyButton() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t('已复制'));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t('复制失败'));
    }
  };
  return { copied, copy };
}

/* ===================== Meta 标签 / TDK ===================== */
export function MetaTagsTool() {
  const { t } = useTranslation();
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoUrl, setSeoUrl] = useState('https://itianci.cn');
  const [seoImage, setSeoImage] = useState('');
  const [seoSiteName, setSeoSiteName] = useState('');
  const { copied, copy } = useCopyButton();

  const metaTagsOutput = buildSeoMetaTags({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    url: seoUrl,
    image: seoImage,
    siteName: seoSiteName,
  });

  return (
    <div className="space-y-3">
      <div>
        <Input className={inputClass} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={t('页面标题 Title')} />
        <div className={cn('mt-1 text-xs', seoTitle.length > 60 ? 'text-[#d8453f] dark:text-[#ff9b95]' : 'text-[#7b69a5] dark:text-[#af9fda]')}>
          {t(`标题 ${seoTitle.length} 字符（建议 ≤ 60）`)}
        </div>
      </div>
      <div>
        <textarea
          className={`${inputClass} min-h-[88px] resize-y`}
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          placeholder={t('页面描述 Description')}
        />
        <div className={cn('mt-1 text-xs', seoDescription.length > 160 ? 'text-[#d8453f] dark:text-[#ff9b95]' : 'text-[#7b69a5] dark:text-[#af9fda]')}>
          {t(`描述 ${seoDescription.length} 字符（建议 ≤ 160）`)}
        </div>
      </div>
      <Input className={inputClass} value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder={t('关键词，逗号分隔（可选）')} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input className={inputClass} value={seoUrl} onChange={(e) => setSeoUrl(e.target.value)} placeholder={t('规范链接 URL')} />
        <Input className={inputClass} value={seoSiteName} onChange={(e) => setSeoSiteName(e.target.value)} placeholder={t('站点名称（可选）')} />
      </div>
      <Input className={inputClass} value={seoImage} onChange={(e) => setSeoImage(e.target.value)} placeholder={t('社交分享图 URL（可选）')} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => copy(metaTagsOutput)} className={secondaryButtonClass} disabled={!metaTagsOutput}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? t('已复制') : t('复制标签')}
        </Button>
        <Button
          variant="outline"
          onClick={() => downloadPlainText('meta-tags.html', metaTagsOutput)}
          className={secondaryButtonClass}
          disabled={!metaTagsOutput}
        >
          <Download className="mr-2 h-4 w-4" />
          {t('下载')}
        </Button>
      </div>
      {metaTagsOutput && (
        <textarea className={`${inputClass} min-h-[200px] resize-y font-mono text-xs leading-6`} value={metaTagsOutput} readOnly />
      )}
    </div>
  );
}

/* ===================== robots.txt 生成器 ===================== */
export function RobotsTxtTool() {
  const { t } = useTranslation();
  const [robotsUserAgent, setRobotsUserAgent] = useState('*');
  const [robotsAllow, setRobotsAllow] = useState('');
  const [robotsDisallow, setRobotsDisallow] = useState('/admin\n/api');
  const [robotsSitemap, setRobotsSitemap] = useState('https://itianci.cn/sitemap.xml');
  const { copied, copy } = useCopyButton();

  const robotsOutput = buildRobotsTxt({
    userAgent: robotsUserAgent,
    allow: robotsAllow,
    disallow: robotsDisallow,
    sitemap: robotsSitemap,
  });

  return (
    <div className="space-y-3">
      <Input className={inputClass} value={robotsUserAgent} onChange={(e) => setRobotsUserAgent(e.target.value)} placeholder={t('User-agent（默认 *）')} />
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea
          className={`${inputClass} min-h-[96px] resize-y font-mono text-xs`}
          value={robotsAllow}
          onChange={(e) => setRobotsAllow(e.target.value)}
          placeholder={t('allowPathsOnePerLineForExample')}
        />
        <textarea
          className={`${inputClass} min-h-[96px] resize-y font-mono text-xs`}
          value={robotsDisallow}
          onChange={(e) => setRobotsDisallow(e.target.value)}
          placeholder={t('disallowPathsOnePerLineForExampleAdmin')}
        />
      </div>
      <textarea
        className={`${inputClass} min-h-[64px] resize-y font-mono text-xs`}
        value={robotsSitemap}
        onChange={(e) => setRobotsSitemap(e.target.value)}
        placeholder={t('Sitemap 地址，每行一个（可选）')}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => copy(robotsOutput)} className={secondaryButtonClass}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? t('已复制') : t('复制')}
        </Button>
        <Button variant="outline" onClick={() => downloadPlainText('robots.txt', robotsOutput)} className={secondaryButtonClass}>
          <Download className="mr-2 h-4 w-4" />
          {t('下载 robots.txt')}
        </Button>
      </div>
      <textarea className={`${inputClass} min-h-[160px] resize-y font-mono text-xs leading-6`} value={robotsOutput} readOnly />
    </div>
  );
}

/* ===================== 结构化数据 JSON-LD ===================== */
export function JsonLdTool() {
  const { t } = useTranslation();
  const [jsonLdType, setJsonLdType] = useState<'Article' | 'WebSite' | 'Organization'>('Article');
  const [jsonLdName, setJsonLdName] = useState('');
  const [jsonLdUrl, setJsonLdUrl] = useState('https://itianci.cn');
  const [jsonLdDesc, setJsonLdDesc] = useState('');
  const [jsonLdAuthor, setJsonLdAuthor] = useState('');
  const [jsonLdImage, setJsonLdImage] = useState('');
  const [jsonLdDate, setJsonLdDate] = useState('');
  const { copied, copy } = useCopyButton();

  const jsonLdOutput = buildJsonLd(jsonLdType, {
    name: jsonLdName,
    url: jsonLdUrl,
    description: jsonLdDesc,
    author: jsonLdAuthor,
    image: jsonLdImage,
    date: jsonLdDate,
  });

  return (
    <div className="space-y-3">
      <FancySelect
        ariaLabel={t('选择结构化数据类型')}
        value={jsonLdType}
        onChange={(value) => setJsonLdType(value)}
        options={[
          { value: 'Article', label: t('文章 Article') },
          { value: 'WebSite', label: t('网站 WebSite') },
          { value: 'Organization', label: t('组织 Organization') },
        ]}
      />
      <Input
        className={inputClass}
        value={jsonLdName}
        onChange={(e) => setJsonLdName(e.target.value)}
        placeholder={jsonLdType === 'Article' ? t('文章标题 headline') : t('名称 name')}
      />
      <Input className={inputClass} value={jsonLdUrl} onChange={(e) => setJsonLdUrl(e.target.value)} placeholder="URL" />
      <textarea
        className={`${inputClass} min-h-[72px] resize-y`}
        value={jsonLdDesc}
        onChange={(e) => setJsonLdDesc(e.target.value)}
        placeholder={t('描述 description（可选）')}
      />
      {jsonLdType === 'Article' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input className={inputClass} value={jsonLdAuthor} onChange={(e) => setJsonLdAuthor(e.target.value)} placeholder={t('作者 author（可选）')} />
          <Input className={inputClass} type="date" value={jsonLdDate} onChange={(e) => setJsonLdDate(e.target.value)} placeholder={t('发布日期')} />
        </div>
      )}
      <Input
        className={inputClass}
        value={jsonLdImage}
        onChange={(e) => setJsonLdImage(e.target.value)}
        placeholder={jsonLdType === 'Organization' ? t('Logo 图片 URL（可选）') : t('图片 URL（可选）')}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => copy(jsonLdOutput)} className={secondaryButtonClass}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? t('已复制') : t('复制 JSON-LD')}
        </Button>
      </div>
      <textarea className={`${inputClass} min-h-[200px] resize-y font-mono text-xs leading-6`} value={jsonLdOutput} readOnly />
    </div>
  );
}

/* ===================== 关键词密度分析 ===================== */
export function KeywordDensityTool() {
  const { t } = useTranslation();
  const [densityText, setDensityText] = useState('');
  const [densityKeyword, setDensityKeyword] = useState('');
  const densityResult = analyzeKeywordDensity(densityText, densityKeyword);

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[150px] resize-y`}
        value={densityText}
        onChange={(e) => setDensityText(e.target.value)}
        placeholder={t('粘贴要分析的正文内容')}
      />
      <Input className={inputClass} value={densityKeyword} onChange={(e) => setDensityKeyword(e.target.value)} placeholder={t('目标关键词（可选）')} />
      {densityText.trim() && (
        <OutputBox className="space-y-3">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>{t(`总字数（去空白）：${densityResult.chars}`)}</div>
            <div>{t(`分词数：${densityResult.totalTokens}`)}</div>
          </div>
          {densityResult.keyword && (
            <div className="rounded-2xl border border-[#ddd0ff] bg-white/60 px-3 py-2 text-sm dark:border-[#392d56] dark:bg-white/[0.03]">
              {t(`关键词「${densityResult.keyword.keyword}」出现 ${densityResult.keyword.occurrences} 次，密度约 ${(densityResult.keyword.density * 100).toFixed(2)}%`)}
            </div>
          )}
          {densityResult.top.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.18em] text-[#7f71ab] dark:text-[#ab9cd8]">
                {t(`高频词 Top ${densityResult.top.length}`)}
              </div>
              <div className="flex flex-wrap gap-2">
                {densityResult.top.map((item) => (
                  <span
                    key={item.word}
                    className="rounded-full border border-[#dacdff] bg-[#f7f1ff] px-3 py-1 text-xs text-[#543c8f] dark:border-[#392d56] dark:bg-[#211834] dark:text-[#d8ccff]"
                  >
                    {item.word}
                    <span className="ml-1 text-[#876fc4] dark:text-[#bbaef0]">
                      {item.count}（{(item.ratio * 100).toFixed(1)}%）
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </OutputBox>
      )}
    </div>
  );
}
