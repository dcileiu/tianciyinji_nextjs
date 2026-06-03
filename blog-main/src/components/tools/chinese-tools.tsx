'use client';

import { Check, Copy, RefreshCcw } from 'lucide-react';
import * as OpenCC from 'opencc-js';
import { pinyin } from 'pinyin-pro';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/tools/TranslationContext';

const inputClass =
  'w-full rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-3 text-sm text-[#2f2154] placeholder:text-[#75689e] shadow-sm outline-none transition focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff] dark:placeholder:text-[#ae9fda]';

const outBox =
  'rounded-2xl border border-[#ece3ff] bg-white/60 p-3 text-sm dark:border-[#2c2347] dark:bg-white/[0.03]';

function CopyButton({ text, label = '复制' }: { text: string; label?: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success(t('已复制'));
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error(t('复制失败'));
        }
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {t(label)}
    </Button>
  );
}

/* ===================== 繁简转换 ===================== */
export function HanziConvertTool() {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [direction, setDirection] = useState<'s2t' | 't2s'>('s2t');

  const converters = useMemo(
    () => ({
      s2t: OpenCC.Converter({ from: 'cn', to: 'tw' }),
      t2s: OpenCC.Converter({ from: 'tw', to: 'cn' }),
    }),
    [],
  );

  const output = useMemo(() => {
    if (!text) return '';
    try {
      return converters[direction](text);
    } catch {
      return '';
    }
  }, [text, direction, converters]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(
          [
            { id: 's2t', label: '简 → 繁' },
            { id: 't2s', label: '繁 → 简' },
          ] as const
        ).map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDirection(d.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition',
              direction === d.id ? 'bg-[#5b3df5] text-white' : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]',
            )}
          >
            {t(d.label)}
          </button>
        ))}
      </div>
      <textarea
        className={`${inputClass} min-h-[120px] resize-y`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={direction === 's2t' ? t('输入简体中文') : t('输入繁体中文')}
      />
      {output && (
        <div className={`${outBox} flex items-start justify-between gap-2`}>
          <div className="whitespace-pre-wrap break-words text-[#3a2c63] dark:text-[#e6def9]">{output}</div>
          <CopyButton text={output} label="" />
        </div>
      )}
    </div>
  );
}

/* ===================== 拼音转换 ===================== */
export function PinyinTool() {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [tone, setTone] = useState<'symbol' | 'num' | 'none' | 'first'>('symbol');

  const output = useMemo(() => {
    if (!text) return '';
    try {
      if (tone === 'first') return pinyin(text, { pattern: 'first', toneType: 'none' });
      if (tone === 'num') return pinyin(text, { toneType: 'num' });
      if (tone === 'none') return pinyin(text, { toneType: 'none' });
      return pinyin(text);
    } catch {
      return '';
    }
  }, [text, tone]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'symbol', label: '带声调' },
            { id: 'none', label: '不带声调' },
            { id: 'num', label: '数字声调' },
            { id: 'first', label: '首字母' },
          ] as const
        ).map((tBtn) => (
          <button
            key={tBtn.id}
            type="button"
            onClick={() => setTone(tBtn.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition',
              tone === tBtn.id ? 'bg-[#5b3df5] text-white' : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]',
            )}
          >
            {t(tBtn.label)}
          </button>
        ))}
      </div>
      <textarea
        className={`${inputClass} min-h-[100px] resize-y`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('输入中文，转换为拼音')}
      />
      {output && (
        <div className={`${outBox} flex items-start justify-between gap-2`}>
          <div className="break-words text-[#3a2c63] dark:text-[#e6def9]">{output}</div>
          <CopyButton text={output} label="" />
        </div>
      )}
    </div>
  );
}

/* ===================== 中文假数据生成 ===================== */
const SURNAMES = '李王张刘陈杨黄赵周吴徐孙马朱胡郭何高林郑谢罗梁宋唐许韩冯邓曹彭曾'.split('');
const GIVEN = '伟芳娜敏静秀英华慧巧美娟磊强军洋勇艳杰娟涛明超霞平刚桂英文辉力'.split('');
const PROVINCES = ['北京市', '上海市', '广东省深圳市', '广东省广州市', '浙江省杭州市', '江苏省南京市', '四川省成都市', '湖北省武汉市', '陕西省西安市', '福建省厦门市'];
const STREETS = ['人民路', '中山路', '解放大道', '科技园路', '高新大道', '滨江路', '建设街', '文化路'];
const DOMAINS = ['qq.com', '163.com', 'gmail.com', 'outlook.com', 'foxmail.com'];

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randDigits(n: number) {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

interface FakePerson {
  name: string;
  phone: string;
  email: string;
  address: string;
  id: string;
}

function genPerson(): FakePerson {
  const name = randItem(SURNAMES) + randItem(GIVEN) + (Math.random() > 0.5 ? randItem(GIVEN) : '');
  const phone = '1' + randItem(['3', '5', '7', '8', '9']) + randDigits(9);
  const namePinyin = pinyin(name, { toneType: 'none', separator: '' });
  const email = `${namePinyin}${randDigits(3)}@${randItem(DOMAINS)}`;
  const address = `${randItem(PROVINCES)}${randItem(STREETS)}${Math.floor(Math.random() * 200) + 1}号`;
  const id = randDigits(6) + (1970 + Math.floor(Math.random() * 40)) + randDigits(8);
  return { name, phone, email, address, id };
}

export function ChineseFakerTool() {
  const { t } = useTranslation();
  const [count, setCount] = useState(5);
  const [people, setPeople] = useState<FakePerson[]>([]);

  function generate() {
    setPeople(Array.from({ length: count }, () => genPerson()));
  }

  const asText = people
    .map((p) => `${p.name}\t${p.phone}\t${p.email}\t${p.address}\t${p.id}`)
    .join('\n');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#5c4a88] dark:text-[#d2c6f3]">{t('生成数量')}</span>
        {[5, 10, 20].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCount(c)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm transition',
              count === c ? 'bg-[#5b3df5] text-white' : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]',
            )}
          >
            {c}
          </button>
        ))}
        <Button onClick={generate} className="gap-1.5 bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
          <RefreshCcw className="h-4 w-4" />
          {t('生成')}
        </Button>
        {people.length > 0 && <CopyButton text={asText} label="复制全部" />}
      </div>
      <p className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
        {t('全部为随机生成的虚构测试数据，与真实个人信息无关，请勿用于非法用途。')}
      </p>
      {people.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-[#7b69a5] dark:text-[#af9fda]">
                <th className="py-2 pr-3 font-medium">{t('姓名')}</th>
                <th className="py-2 pr-3 font-medium">{t('手机号')}</th>
                <th className="py-2 pr-3 font-medium">{t('邮箱')}</th>
                <th className="py-2 pr-3 font-medium">{t('地址')}</th>
                <th className="py-2 font-medium">{t('证件号(虚构)')}</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p, i) => (
                <tr
                  key={i}
                  className="border-t border-[#ece3ff] text-[#3a2c63] dark:border-[#2c2347] dark:text-[#e6def9]"
                >
                  <td className="py-2 pr-3">{p.name}</td>
                  <td className="py-2 pr-3 font-mono">{p.phone}</td>
                  <td className="py-2 pr-3 font-mono">{p.email}</td>
                  <td className="py-2 pr-3">{p.address}</td>
                  <td className="py-2 font-mono">{p.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
