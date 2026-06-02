'use client';

/* eslint-disable @next/next/no-img-element */
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OutputBox, inputClass } from '@/components/tools/tool-ui';
import { useServerTool } from '@/components/tools/use-server-tool';

const runBtn = 'rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]';

/* ===================== 客户端 IP ===================== */
export function ClientIpTool() {
  const { loading, result, error, run } = useServerTool<any>('client-ip');
  return (
    <div className="space-y-3">
      <Button onClick={() => run()} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '获取客户端信息'}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-2">
          <div>IP：{result.ip}</div>
          <div className="break-all">x-forwarded-for：{result.forwardedFor || '-'}</div>
          <div className="break-all">User-Agent：{result.userAgent || '-'}</div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== DNS 查询 ===================== */
export function DnsLookupTool() {
  const [dnsHost, setDnsHost] = useState('openai.com');
  const { loading, result, error, run } = useServerTool<any>('dns-lookup');
  return (
    <div className="space-y-3">
      <Input className={inputClass} value={dnsHost} onChange={(e) => setDnsHost(e.target.value)} placeholder="例如 openai.com" />
      <Button onClick={() => run({ host: dnsHost })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '开始查询'}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-2">
          <div>A：{result.a.join(', ') || '-'}</div>
          <div>AAAA：{result.aaaa.join(', ') || '-'}</div>
          <div>
            MX：
            {result.mx
              .map((item: { exchange: string; priority: number }) => `${item.exchange} (${item.priority})`)
              .join(', ') || '-'}
          </div>
          <div>NS：{result.ns.join(', ') || '-'}</div>
          <div>TXT：{result.txt.join(' | ') || '-'}</div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== Ping ===================== */
export function PingTool() {
  const [pingHost, setPingHost] = useState('openai.com');
  const [pingPort, setPingPort] = useState('443');
  const { loading, result, error, run } = useServerTool<any>('ping');
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input className={inputClass} value={pingHost} onChange={(e) => setPingHost(e.target.value)} placeholder="目标主机" />
        <Input className={inputClass} value={pingPort} onChange={(e) => setPingPort(e.target.value)} placeholder="端口，例如 443" />
      </div>
      <Button onClick={() => run({ host: pingHost, port: pingPort, count: 4 })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '开始 Ping'}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-2">
          <div>平均延迟：{result.averageLatency !== null ? `${result.averageLatency} ms` : '全部超时'}</div>
          <div className="space-y-1">
            {result.attempts.map(
              (
                item: { port: number; open: boolean; latency: number | null; error?: string },
                index: number,
              ) => (
                <div key={`${item.port}-${index}`}>
                  #{index + 1}：{item.open ? `${item.latency} ms` : `失败 (${item.error || 'closed'})`}
                </div>
              ),
            )}
          </div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 端口扫描 ===================== */
export function PortScanTool() {
  const [portHost, setPortHost] = useState('openai.com');
  const [portExpression, setPortExpression] = useState('80,443,3000-3002');
  const { loading, result, error, run } = useServerTool<any>('port-scan');
  return (
    <div className="space-y-3">
      <Input className={inputClass} value={portHost} onChange={(e) => setPortHost(e.target.value)} placeholder="目标主机" />
      <Input className={inputClass} value={portExpression} onChange={(e) => setPortExpression(e.target.value)} placeholder="例如 80,443,3000-3005" />
      <Button onClick={() => run({ host: portHost, ports: portExpression })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '扫描端口'}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-2">
          <div>开放端口：{result.openPorts.join(', ') || '未发现'}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {result.results.map((item: { port: number; open: boolean; latency: number | null }) => (
              <div key={item.port} className="rounded-xl bg-white/60 px-3 py-2 dark:bg-white/[0.03]">
                {item.port} · {item.open ? `开放 (${item.latency} ms)` : '关闭'}
              </div>
            ))}
          </div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== URL 状态检测 ===================== */
export function UrlStatusTool() {
  const [urlStatusInput, setUrlStatusInput] = useState('https://openai.com');
  const { loading, result, error, run } = useServerTool<any>('url-status');
  return (
    <div className="space-y-3">
      <Input className={inputClass} value={urlStatusInput} onChange={(e) => setUrlStatusInput(e.target.value)} placeholder="例如 https://openai.com" />
      <Button onClick={() => run({ url: urlStatusInput })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '检测状态'}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-2">
          <div>状态：{result.status} {result.statusText}</div>
          <div className="break-all">最终地址：{result.finalUrl}</div>
          <div>类型：{result.contentType || '-'}</div>
          <div>长度：{result.contentLength || '-'}</div>
          <div>Server：{result.server || '-'}</div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 网页元数据提取 ===================== */
export function WebMetadataTool() {
  const [metadataUrlInput, setMetadataUrlInput] = useState('https://openai.com');
  const { loading, result, error, run } = useServerTool<any>('web-metadata');
  return (
    <div className="space-y-3">
      <Input className={inputClass} value={metadataUrlInput} onChange={(e) => setMetadataUrlInput(e.target.value)} placeholder="输入网页 URL" />
      <Button onClick={() => run({ url: metadataUrlInput })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '提取元数据'}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-2">
          <div>标题：{result.title}</div>
          <div>描述：{result.description || '-'}</div>
          <div className="break-all">Canonical：{result.canonical || '-'}</div>
          <div className="break-all">Favicon：{result.favicon || '-'}</div>
          <div className="break-all">OG Image：{result.openGraph?.image || '-'}</div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 网页图片提取 ===================== */
export function WebImagesTool() {
  const [imageExtractUrlInput, setImageExtractUrlInput] = useState('https://openai.com');
  const { loading, result, error, run } = useServerTool<any>('web-images');
  return (
    <div className="space-y-3">
      <Input
        className={inputClass}
        value={imageExtractUrlInput}
        onChange={(e) => setImageExtractUrlInput(e.target.value)}
        placeholder="输入网页 URL"
      />
      <Button onClick={() => run({ url: imageExtractUrlInput })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '提取图片'}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-3">
          <div>共提取 {result.images.length} 张图片</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {result.images.slice(0, 12).map((item: { url: string; alt: string }) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-[#e3d7ff] bg-white p-2 dark:border-[#34294f] dark:bg-white/[0.03]"
              >
                <img src={item.url} alt={item.alt || 'web image'} className="h-28 w-full rounded-xl object-cover" />
              </a>
            ))}
          </div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 网页转 Markdown ===================== */
export function WebMarkdownTool() {
  const [markdownUrlInput, setMarkdownUrlInput] = useState('https://openai.com');
  const { loading, result, error, run } = useServerTool<any>('web-markdown');
  return (
    <div className="space-y-3">
      <Input className={inputClass} value={markdownUrlInput} onChange={(e) => setMarkdownUrlInput(e.target.value)} placeholder="输入网页 URL" />
      <Button onClick={() => run({ url: markdownUrlInput })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '转换为 Markdown'}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox>
          <textarea className={`${inputClass} min-h-[260px] resize-y font-mono text-xs`} value={result.markdown} readOnly />
        </OutputBox>
      )}
    </div>
  );
}
