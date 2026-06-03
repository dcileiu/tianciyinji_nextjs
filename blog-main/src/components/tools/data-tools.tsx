'use client';

/* eslint-disable @next/next/no-img-element */
import { ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FancySelect, OutputBox, inputClass } from '@/components/tools/tool-ui';
import { useServerTool } from '@/components/tools/use-server-tool';
import { useTranslation } from '@/components/tools/TranslationContext';

const runBtn = 'rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]';

/* ===================== Minecraft 玩家信息 ===================== */
export function MinecraftPlayerTool() {
  const { t } = useTranslation();
  const [minecraftPlayerInput, setMinecraftPlayerInput] = useState('Notch');
  const { loading, result, error, run } = useServerTool<any>('minecraft-player');
  return (
    <div className="space-y-3">
      <Input
        className={inputClass}
        value={minecraftPlayerInput}
        onChange={(e) => setMinecraftPlayerInput(e.target.value)}
        placeholder={t('例如 Notch')}
      />
      <Button onClick={() => run({ username: minecraftPlayerInput })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('查询玩家')}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-3">
          <div className="flex items-center gap-3">
            <img src={result.avatarUrl} alt="Minecraft avatar" className="h-14 w-14 rounded-2xl border border-[#e3d7ff]" />
            <div>
              <div className="font-medium text-[#2f2154] dark:text-[#f4efff]">{result.username}</div>
              <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{result.id}</div>
            </div>
          </div>
          <div className="break-all text-xs">{t('皮肤')}：{result.skinUrl}</div>
          {result.capeUrl && <div className="break-all text-xs">{t('披风')}：{result.capeUrl}</div>}
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== Minecraft 服务器信息 ===================== */
export function MinecraftServerTool() {
  const { t } = useTranslation();
  const [minecraftServerInput, setMinecraftServerInput] = useState('mc.hypixel.net');
  const [minecraftEdition, setMinecraftEdition] = useState<'java' | 'bedrock'>('java');
  const { loading, result, error, run } = useServerTool<any>('minecraft-server');
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setMinecraftEdition('java')}
          className={`rounded-full px-4 py-2 text-sm transition ${minecraftEdition === 'java' ? 'bg-[#5b3df5] text-white' : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]'}`}
        >
          Java
        </button>
        <button
          onClick={() => setMinecraftEdition('bedrock')}
          className={`rounded-full px-4 py-2 text-sm transition ${minecraftEdition === 'bedrock' ? 'bg-[#5b3df5] text-white' : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]'}`}
        >
          Bedrock
        </button>
      </div>
      <Input
        className={inputClass}
        value={minecraftServerInput}
        onChange={(e) => setMinecraftServerInput(e.target.value)}
        placeholder={t('例如 mc.hypixel.net')}
      />
      <Button onClick={() => run({ address: minecraftServerInput, edition: minecraftEdition })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('查询服务器')}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-2">
          <div>{t('在线状态')}：{result.data.online ? t('在线') : t('离线')}</div>
          <div>{t('版本')}：{result.data.version?.name_clean || result.data.version?.name || '-'}</div>
          <div>
            {t('玩家')}：{result.data.players?.online ?? '-'} / {result.data.players?.max ?? '-'}
          </div>
          <div className="break-all">MOTD：{result.data.motd?.clean || result.data.motd?.raw || '-'}</div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== GitHub 仓库信息 ===================== */
export function GithubRepoTool() {
  const { t } = useTranslation();
  const [githubRepoInput, setGithubRepoInput] = useState('vercel/next.js');
  const { loading, result, error, run } = useServerTool<any>('github-repo');
  return (
    <div className="space-y-3">
      <Input className={inputClass} value={githubRepoInput} onChange={(e) => setGithubRepoInput(e.target.value)} placeholder={t('例如 vercel/next.js')} />
      <Button onClick={() => run({ repo: githubRepoInput })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('查询仓库')}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-2">
          <div className="font-medium text-[#2f2154] dark:text-[#f4efff]">{result.fullName}</div>
          <div>{result.description || '-'}</div>
          <div>
            Stars {result.stars} · Forks {result.forks} · Issues {result.openIssues}
          </div>
          <div className="flex flex-wrap gap-2">
            {(result.topics || []).slice(0, 8).map((topic: string) => (
              <span key={topic} className="rounded-full bg-[#f1eaff] px-3 py-1 text-xs text-[#5b3df5] dark:bg-[#241739] dark:text-[#d9ccff]">
                {topic}
              </span>
            ))}
          </div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== Gravatar ===================== */
export function GravatarTool() {
  const { t } = useTranslation();
  const [gravatarEmail, setGravatarEmail] = useState('dcileiu@outlook.com');
  const { loading, result, error, run } = useServerTool<any>('gravatar');
  return (
    <div className="space-y-3">
      <Input className={inputClass} value={gravatarEmail} onChange={(e) => setGravatarEmail(e.target.value)} placeholder={t('邮箱地址')} />
      <Button onClick={() => run({ email: gravatarEmail, size: 256 })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('生成头像地址')}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-3">
          <img src={result.avatarUrl} alt="Gravatar avatar" className="h-24 w-24 rounded-full border border-[#e3d7ff]" />
          <div className="break-all font-mono text-xs">{result.hash}</div>
          <a
            href={result.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#5b3df5] hover:underline"
          >
            {t('打开 Gravatar 资料页')} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 基础 IP 归属 ===================== */
export function IpGeoTool() {
  const { t } = useTranslation();
  const [geoIpInput, setGeoIpInput] = useState('');
  const { loading, result, error, run } = useServerTool<any>('ip-geo');
  return (
    <div className="space-y-3">
      <Input className={inputClass} value={geoIpInput} onChange={(e) => setGeoIpInput(e.target.value)} placeholder={t('可留空，默认查询当前访问 IP')} />
      <Button onClick={() => run({ ip: geoIpInput })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('查询归属')}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-2">
          <div>{t('IP')}：{result.ip}</div>
          <div>
            {t('国家 / 地区')}：{result.country || '-'} / {result.region || '-'}
          </div>
          <div>{t('城市')}：{result.city || '-'}</div>
          <div>{t('时区')}：{result.timezone || '-'}</div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 手机号归属地 ===================== */
export function MobileAreaTool() {
  const { t } = useTranslation();
  const [phoneInput, setPhoneInput] = useState('13800138000');
  const { loading, result, error, run } = useServerTool<any>('mobile-area');
  return (
    <div className="space-y-3">
      <Input className={inputClass} value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder={t('例如 13800138000')} />
      <Button onClick={() => run({ phone: phoneInput })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('查询归属地')}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-2">
          <div>{t('号码')}：{result.phone}</div>
          <div>{t('省份')}：{result.province || '-'}</div>
          <div>{t('城市')}：{result.city || '-'}</div>
          <div>{t('运营商')}：{result.carrier || '-'}</div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== Bing 每日壁纸 ===================== */
export function BingWallpaperTool() {
  const { t } = useTranslation();
  const [bingMarket, setBingMarket] = useState('zh-CN');
  const { loading, result, error, run } = useServerTool<any>('bing-wallpaper');
  return (
    <div className="space-y-3">
      <FancySelect
        value={bingMarket}
        onChange={setBingMarket}
        ariaLabel={t('选择 Bing 区域')}
        options={[
          { value: 'zh-CN', label: t('中国大陆（zh-CN）') },
          { value: 'en-US', label: t('美国（en-US）') },
          { value: 'ja-JP', label: t('日本（ja-JP）') },
        ]}
      />
      <Button onClick={() => run({ market: bingMarket })} className={runBtn}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('获取壁纸')}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-3">
          <img src={result.url} alt={result.title} className="max-h-64 rounded-2xl border border-[#e3d7ff] object-cover" />
          <div className="font-medium text-[#2f2154] dark:text-[#f4efff]">{result.title}</div>
          <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{result.copyright}</div>
          <a href={result.url} target="_blank" rel="noreferrer" className="text-sm text-[#5b3df5] hover:underline">
            {t('打开原图')}
          </a>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 答案之书 / 诗词 / 历史今天 ===================== */
export function ContentTools() {
  const { t } = useTranslation();
  const [answerQuestion, setAnswerQuestion] = useState('我该不该继续把这个博客做成长期项目？');
  const [historyMonth, setHistoryMonth] = useState(String(new Date().getMonth() + 1));
  const [historyDay, setHistoryDay] = useState(String(new Date().getDate()));
  const answer = useServerTool<any>('answer-book');
  const poetry = useServerTool<any>('poetry');
  const history = useServerTool<any>('history-today');

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#e3d7ff] bg-white/60 p-4 dark:border-[#34294f] dark:bg-white/[0.03]">
        <div className="mb-2 text-sm font-medium text-[#2f2154] dark:text-[#f4efff]">{t('答案之书')}</div>
        <Input className={inputClass} value={answerQuestion} onChange={(e) => setAnswerQuestion(e.target.value)} placeholder={t('输入问题')} />
        <Button onClick={() => answer.run({ question: answerQuestion })} className="mt-3 rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
          {answer.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('翻一页')}
        </Button>
        {answer.result && <div className="mt-3 text-sm leading-7 text-[#5b3df5] dark:text-[#d9ccff]">{t(answer.result.answer)}</div>}
      </div>

      <div className="rounded-2xl border border-[#e3d7ff] bg-white/60 p-4 dark:border-[#34294f] dark:bg-white/[0.03]">
        <div className="mb-2 text-sm font-medium text-[#2f2154] dark:text-[#f4efff]">{t('随机诗词')}</div>
        <Button onClick={() => poetry.run()} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
          {poetry.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('来一首')}
        </Button>
        {poetry.result && (
          <div className="mt-3 space-y-2 text-sm leading-7 text-[#5c4a88] dark:text-[#d9ccff]">
            <div className="font-medium text-[#2f2154] dark:text-[#f4efff]">{poetry.result.title}</div>
            <div>{poetry.result.content}</div>
            <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
              {poetry.result.dynasty} · {poetry.result.author}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#e3d7ff] bg-white/60 p-4 dark:border-[#34294f] dark:bg-white/[0.03]">
        <div className="mb-2 text-sm font-medium text-[#2f2154] dark:text-[#f4efff]">{t('历史今天')}</div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input className={inputClass} value={historyMonth} onChange={(e) => setHistoryMonth(e.target.value)} placeholder={t('月')} />
          <Input className={inputClass} value={historyDay} onChange={(e) => setHistoryDay(e.target.value)} placeholder={t('日')} />
          <Button onClick={() => history.run({ month: historyMonth, day: historyDay })} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
            {history.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('查询')}
          </Button>
        </div>
        {history.result && (
          <div className="mt-3 space-y-2 text-sm leading-6 text-[#5c4a88] dark:text-[#d9ccff]">
            {history.result.events.slice(0, 6).map((item: { year: string; text: string }, index: number) => (
              <div key={`${item.year}-${index}`} className="rounded-xl border border-[#ece3ff] px-3 py-2 dark:border-[#322746]">
                <span className="mr-2 font-semibold text-[#2f2154] dark:text-[#f4efff]">{item.year}</span>
                {item.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
