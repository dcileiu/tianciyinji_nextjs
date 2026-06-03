'use client';

import { Check, Copy, Download, Loader2 } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FancyCheckbox,
  FancySelect,
  OutputBox,
  downloadPlainText,
  inputClass,
  secondaryButtonClass,
} from '@/components/tools/tool-ui';
import { useServerTool } from '@/components/tools/use-server-tool';
import { useTranslation } from '@/components/tools/TranslationContext';
import {
  analyzeParameters,
  decodeBase64ToText,
  decryptAesGcm,
  detectSensitiveWords,
  encodeTextToBase64,
  encryptAesGcm,
  formatBytes,
  generateRandomString,
  parseTimestampInput,
} from '@/lib/tools/compute';

/* ===================== AES 加解密 ===================== */
export function AesTool() {
  const { t } = useTranslation();
  const [aesMode, setAesMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [aesText, setAesText] = useState('');
  const [aesPassword, setAesPassword] = useState('');
  const [aesOutput, setAesOutput] = useState('');
  const [aesError, setAesError] = useState('');

  async function handleAesSubmit() {
    setAesError('');
    setAesOutput('');
    try {
      if (!aesText.trim())
        throw new Error(aesMode === 'encrypt' ? t('请输入要加密的内容。') : t('请输入要解密的密文。'));
      if (!aesPassword.trim()) throw new Error(t('请输入密码。'));
      const result =
        aesMode === 'encrypt'
          ? await encryptAesGcm(aesText, aesPassword)
          : await decryptAesGcm(aesText, aesPassword);
      setAesOutput(result);
    } catch (error) {
      setAesError(error instanceof Error ? t(error.message) : t('AES 处理失败。'));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setAesMode('encrypt')}
          className={`rounded-full px-4 py-2 text-sm transition ${aesMode === 'encrypt' ? 'bg-[#5b3df5] text-white' : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]'}`}
        >
          {t('加密')}
        </button>
        <button
          onClick={() => setAesMode('decrypt')}
          className={`rounded-full px-4 py-2 text-sm transition ${aesMode === 'decrypt' ? 'bg-[#5b3df5] text-white' : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]'}`}
        >
          {t('解密')}
        </button>
      </div>
      <textarea
        className={`${inputClass} min-h-[132px] resize-y`}
        value={aesText}
        onChange={(event) => setAesText(event.target.value)}
        placeholder={aesMode === 'encrypt' ? t('输入要加密的文本') : t('粘贴 aesgcm.salt.iv.cipher 格式密文')}
      />
      <Input
        className={inputClass}
        type="password"
        value={aesPassword}
        onChange={(event) => setAesPassword(event.target.value)}
        placeholder={t('输入密码')}
      />
      <div className="flex gap-3">
        <Button onClick={handleAesSubmit} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
          {t('立即处理')}
        </Button>
      </div>
      {aesError && <OutputBox>{aesError}</OutputBox>}
      {aesOutput && (
        <OutputBox>
          <pre className="whitespace-pre-wrap break-all">{aesOutput}</pre>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== Base64 编解码 ===================== */
export function Base64Tool() {
  const { t } = useTranslation();
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [base64Error, setBase64Error] = useState('');

  async function handleBase64Encode() {
    setBase64Error('');
    try {
      setBase64Output(encodeTextToBase64(base64Input));
    } catch (error) {
      setBase64Error(error instanceof Error ? t(error.message) : t('Base64 编码失败。'));
    }
  }

  async function handleBase64Decode() {
    setBase64Error('');
    try {
      setBase64Output(decodeBase64ToText(base64Input));
    } catch (error) {
      setBase64Error(error instanceof Error ? t(error.message) : t('Base64 解码失败，请检查输入。'));
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[132px] resize-y`}
        value={base64Input}
        onChange={(event) => setBase64Input(event.target.value)}
        placeholder={t('输入文本或 Base64 内容')}
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleBase64Encode} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
          {t('编码')}
        </Button>
        <Button onClick={handleBase64Decode} variant="outline" className={secondaryButtonClass}>
          {t('解码')}
        </Button>
      </div>
      {base64Error && <OutputBox>{base64Error}</OutputBox>}
      {base64Output && (
        <OutputBox>
          <pre className="whitespace-pre-wrap break-all">{base64Output}</pre>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 随机数 / 随机字符串 ===================== */
export function RandomStringTool() {
  const { t } = useTranslation();
  const [randomLength, setRandomLength] = useState('16');
  const [randomValue, setRandomValue] = useState('');
  const [randomIncludeUppercase, setRandomIncludeUppercase] = useState(true);
  const [randomIncludeLowercase, setRandomIncludeLowercase] = useState(true);
  const [randomIncludeNumbers, setRandomIncludeNumbers] = useState(true);
  const [randomIncludeSymbols, setRandomIncludeSymbols] = useState(false);

  function handleRandomGenerate() {
    const length = Number(randomLength);
    let alphabet = '';
    if (randomIncludeUppercase) alphabet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (randomIncludeLowercase) alphabet += 'abcdefghijklmnopqrstuvwxyz';
    if (randomIncludeNumbers) alphabet += '0123456789';
    if (randomIncludeSymbols) alphabet += '!@#$%^&*_-+=?';
    if (!alphabet) {
      setRandomValue(t('请至少勾选一种字符集。'));
      return;
    }
    if (!Number.isInteger(length) || length <= 0 || length > 256) {
      setRandomValue(t('长度需在 1 到 256 之间。'));
      return;
    }
    setRandomValue(generateRandomString(length, alphabet));
  }

  return (
    <div className="space-y-3">
      <Input
        className={inputClass}
        value={randomLength}
        onChange={(event) => setRandomLength(event.target.value)}
        placeholder={t('长度，例如 16')}
      />
      <div className="grid grid-cols-2 gap-3">
        <FancyCheckbox checked={randomIncludeUppercase} onChange={setRandomIncludeUppercase} label={t('大写字母')} />
        <FancyCheckbox checked={randomIncludeLowercase} onChange={setRandomIncludeLowercase} label={t('小写字母')} />
        <FancyCheckbox checked={randomIncludeNumbers} onChange={setRandomIncludeNumbers} label={t('数字')} />
        <FancyCheckbox checked={randomIncludeSymbols} onChange={setRandomIncludeSymbols} label={t('符号')} />
      </div>
      <Button onClick={handleRandomGenerate} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
        {t('生成随机串')}
      </Button>
      {randomValue && (
        <OutputBox>
          <div className="break-all font-mono">{randomValue}</div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 时间戳转换 ===================== */
export function TimestampTool() {
  const { t } = useTranslation();
  const [timestampInput, setTimestampInput] = useState(String(Date.now()));
  const [timestampOutput, setTimestampOutput] = useState<{
    local: string;
    iso: string;
    seconds: number;
    milliseconds: number;
  } | null>(null);
  const [timestampError, setTimestampError] = useState('');

  function handleTimestampConvert() {
    setTimestampError('');
    try {
      const date = parseTimestampInput(timestampInput);
      setTimestampOutput({
        local: date.toLocaleString('zh-CN', { hour12: false }),
        iso: date.toISOString(),
        seconds: Math.floor(date.getTime() / 1000),
        milliseconds: date.getTime(),
      });
    } catch (error) {
      setTimestampError(error instanceof Error ? t(error.message) : t('转换失败。'));
    }
  }

  return (
    <div className="space-y-3">
      <Input
        className={inputClass}
        value={timestampInput}
        onChange={(event) => setTimestampInput(event.target.value)}
        placeholder={t('例如 1715664000000 或 2026-05-14 12:00:00')}
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleTimestampConvert} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
          {t('转换')}
        </Button>
        <Button onClick={() => setTimestampInput(String(Date.now()))} variant="outline" className={secondaryButtonClass}>
          {t('使用当前时间')}
        </Button>
      </div>
      {timestampError && <OutputBox>{timestampError}</OutputBox>}
      {timestampOutput && (
        <OutputBox>
          <div className="space-y-2">
            <div>{t(`本地时间：${timestampOutput.local}`)}</div>
            <div>{t(`ISO：${timestampOutput.iso}`)}</div>
            <div>{t(`秒：${timestampOutput.seconds}`)}</div>
            <div>{t(`毫秒：${timestampOutput.milliseconds}`)}</div>
          </div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== JSON 美化 / 压缩 ===================== */
export function JsonTool() {
  const { t } = useTranslation();
  const [jsonInput, setJsonInput] = useState('{\n  "name": "Dci",\n  "stack": ["Next.js", "TypeScript"]\n}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');

  function handleJsonBeautify(compact = false) {
    setJsonError('');
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(compact ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2));
    } catch (error) {
      setJsonError(error instanceof Error ? t(error.message) : t('JSON 解析失败。'));
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[180px] resize-y font-mono`}
        value={jsonInput}
        onChange={(event) => setJsonInput(event.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => handleJsonBeautify(false)} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
          {t('美化')}
        </Button>
        <Button onClick={() => handleJsonBeautify(true)} variant="outline" className={secondaryButtonClass}>
          {t('压缩')}
        </Button>
      </div>
      {jsonError && <OutputBox>{jsonError}</OutputBox>}
      {jsonOutput && (
        <OutputBox>
          <pre className="whitespace-pre-wrap break-all font-mono">{jsonOutput}</pre>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== MD5 计算与校验（服务端） ===================== */
export function Md5Tool() {
  const { t } = useTranslation();
  const [md5Text, setMd5Text] = useState('');
  const [md5Expected, setMd5Expected] = useState('');
  const { loading, result, error, run } = useServerTool<any>('md5');

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[118px] resize-y`}
        value={md5Text}
        onChange={(event) => setMd5Text(event.target.value)}
        placeholder={t('输入待计算文本')}
      />
      <Input
        className={inputClass}
        value={md5Expected}
        onChange={(event) => setMd5Expected(event.target.value)}
        placeholder={t('可选：输入预期 MD5 做比对')}
      />
      <Button
        onClick={() => run({ text: md5Text, expected: md5Expected })}
        className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('计算 MD5')}
      </Button>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox>
          <div className="space-y-2">
            <div className="break-all font-mono">{result.hash}</div>
            {result.matches !== null && (
              <div>{result.matches ? t('与预期哈希一致。') : t('与预期哈希不一致。')}</div>
            )}
          </div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 代码混淆 / 压缩（服务端） ===================== */
export function CodeObfuscateTool() {
  const { t } = useTranslation();
  const [codeObfuscateInput, setCodeObfuscateInput] = useState(
    "function greet(name) {\n  const message = `Hello, ${name}!`;\n  console.log(message);\n  return message;\n}\n\ngreet('World');",
  );
  const [codeObfuscateLanguage, setCodeObfuscateLanguage] = useState<'javascript' | 'css' | 'html'>('javascript');
  const [codeObfuscateMode, setCodeObfuscateMode] = useState<'minify' | 'obfuscate'>('minify');
  const [codeObfuscateLevel, setCodeObfuscateLevel] = useState<'normal' | 'strong'>('normal');
  const { loading, result, error, copied, run, copy } = useServerTool<any>('code-obfuscate');

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[220px] resize-y font-mono text-[13px]`}
        value={codeObfuscateInput}
        onChange={(event) => setCodeObfuscateInput(event.target.value)}
        placeholder={t('粘贴 JavaScript、CSS 或 HTML 代码')}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FancySelect
          ariaLabel={t('代码语言')}
          value={codeObfuscateLanguage}
          onChange={(value) => setCodeObfuscateLanguage(value as 'javascript' | 'css' | 'html')}
          options={[
            { value: 'javascript', label: 'JavaScript' },
            { value: 'css', label: 'CSS' },
            { value: 'html', label: 'HTML' },
          ]}
        />
        <FancySelect
          ariaLabel={t('处理模式')}
          value={codeObfuscateMode}
          onChange={(value) => setCodeObfuscateMode(value as 'minify' | 'obfuscate')}
          options={[
            { value: 'minify', label: t('仅压缩') },
            {
              value: 'obfuscate',
              label: codeObfuscateLanguage === 'javascript' ? t('混淆 + 压缩') : t('混淆 + 压缩（仅 JS）'),
            },
          ]}
        />
        {codeObfuscateLanguage === 'javascript' && codeObfuscateMode === 'obfuscate' ? (
          <FancySelect
            ariaLabel={t('混淆强度')}
            value={codeObfuscateLevel}
            onChange={(value) => setCodeObfuscateLevel(value as 'normal' | 'strong')}
            options={[
              { value: 'normal', label: t('标准混淆') },
              { value: 'strong', label: t('高强度混淆') },
            ]}
          />
        ) : (
          <div className="flex items-center rounded-2xl border border-dashed border-[#d9ccff] px-4 py-3 text-xs text-[#7b69a5] dark:border-[#3b2f59] dark:text-[#af9fda]">
            {codeObfuscateLanguage === 'javascript' ? t('选择「混淆 + 压缩」后可调节强度。') : t('CSS / HTML 当前仅支持压缩。')}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() =>
            run({
              code: codeObfuscateInput,
              language: codeObfuscateLanguage,
              mode: codeObfuscateMode,
              level: codeObfuscateLevel,
            })
          }
          disabled={loading}
          className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('处理中…')}
            </>
          ) : codeObfuscateMode === 'obfuscate' && codeObfuscateLanguage === 'javascript' ? (
            t('开始混淆')
          ) : (
            t('开始压缩')
          )}
        </Button>
      </div>
      {error && <OutputBox>{error}</OutputBox>}
      {result && (
        <OutputBox className="space-y-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7b69a5] dark:text-[#af9fda]">
            <span>{t(`原始：${formatBytes(result.stats.before)}`)}</span>
            <span>{t(`结果：${formatBytes(result.stats.after)}`)}</span>
            <span>{t(`体积比：${result.stats.ratio}`)}</span>
            <span>{t(`模式：${result.mode === 'obfuscate' ? '混淆' : '压缩'}`)}</span>
          </div>
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-all font-mono text-[12px] leading-6">
            {result.output}
          </pre>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className={secondaryButtonClass} onClick={() => copy(result.output)}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t('已复制')}
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  {t('复制结果')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className={secondaryButtonClass}
              onClick={() =>
                downloadPlainText(`output.${result.language === 'javascript' ? 'js' : result.language}`, result.output)
              }
            >
              <Download className="mr-2 h-4 w-4" />
              {t('下载文件')}
            </Button>
          </div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 参数分析 ===================== */
export function ParamsTool() {
  const { t } = useTranslation();
  const [paramsInput, setParamsInput] = useState('https://example.com/search?q=blog&tag=next&tag=tools');
  const [paramsResult, setParamsResult] = useState<{
    entries: Array<{ key: string; values: string[] }>;
    summary: { total: number; duplicates: number };
    pathname: string;
    hash: string;
  } | null>(null);
  const [paramsError, setParamsError] = useState('');

  function handleParamsAnalyze() {
    setParamsError('');
    try {
      setParamsResult(analyzeParameters(paramsInput));
    } catch (error) {
      setParamsError(error instanceof Error ? t(error.message) : t('参数分析失败。'));
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[148px] resize-y`}
        value={paramsInput}
        onChange={(event) => setParamsInput(event.target.value)}
        placeholder={t('粘贴完整 URL、a=1&b=2 或 JSON')}
      />
      <Button onClick={handleParamsAnalyze} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
        {t('解析参数')}
      </Button>
      {paramsError && <OutputBox>{paramsError}</OutputBox>}
      {paramsResult && (
        <OutputBox className="space-y-3">
          {(paramsResult.pathname || paramsResult.hash) && (
            <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
              {t(`路径：${paramsResult.pathname || '/'} ${paramsResult.hash ? `| 哈希：${paramsResult.hash}` : ''}`)}
            </div>
          )}
          <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
            {t(`共 ${paramsResult.summary.total} 个字段，重复键 ${paramsResult.summary.duplicates} 个`)}
          </div>
          <div className="space-y-2">
            {paramsResult.entries.map((entry) => (
              <div
                key={entry.key}
                className="rounded-xl border border-[#e3d7ff] bg-white/60 px-3 py-2 dark:border-[#34294f] dark:bg-white/[0.03]"
              >
                <div className="font-medium text-[#3d2d67] dark:text-[#efe9ff]">{entry.key}</div>
                <div className="mt-1 break-all text-sm text-[#685890] dark:text-[#c5b8ea]">
                  {entry.values.join(' | ')}
                </div>
              </div>
            ))}
          </div>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 敏感词快速检测 ===================== */
export function SensitiveTool() {
  const { t } = useTranslation();
  const [sensitiveInput, setSensitiveInput] = useState('');
  const deferredSensitiveInput = useDeferredValue(sensitiveInput);
  const sensitiveMatches = detectSensitiveWords(deferredSensitiveInput);

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[164px] resize-y`}
        value={sensitiveInput}
        onChange={(event) => setSensitiveInput(event.target.value)}
        placeholder={t('把要检测的文本贴进来')}
      />
      <OutputBox>
        {sensitiveMatches.length === 0 ? (
          <div>{t('当前没有命中内置词表。')}</div>
        ) : (
          <div className="space-y-2">
            <div>{t(`命中 ${sensitiveMatches.length} 个词条：`)}</div>
            <div className="flex flex-wrap gap-2">
              {sensitiveMatches.map((item) => (
                <span
                  key={item.word}
                  className="rounded-full bg-[#f1eaff] px-3 py-1 text-xs text-[#5b3df5] dark:bg-[#241739] dark:text-[#d9ccff]"
                >
                  {item.word} × {item.count}
                </span>
              ))}
            </div>
          </div>
        )}
      </OutputBox>
    </div>
  );
}
