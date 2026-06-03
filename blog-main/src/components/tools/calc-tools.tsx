'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/tools/TranslationContext';

const inputClass =
  'w-full rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-3 text-sm text-[#2f2154] placeholder:text-[#75689e] shadow-sm outline-none transition focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff] dark:placeholder:text-[#ae9fda]';

const statBox =
  'rounded-2xl border border-[#ece3ff] bg-white/60 px-3 py-3 text-center dark:border-[#2c2347] dark:bg-white/[0.03]';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[#7b69a5] dark:text-[#af9fda]">{t(label)}</span>
      {children}
    </label>
  );
}

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function money(v: number) {
  return v.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

/* ===================== 房贷计算器 ===================== */
export function LoanCalcTool() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('100'); // 万
  const [rate, setRate] = useState('3.5'); // 年利率 %
  const [years, setYears] = useState('30');
  const [mode, setMode] = useState<'equal-payment' | 'equal-principal'>('equal-payment');

  const result = useMemo(() => {
    const P = num(amount) * 10000;
    const n = num(years) * 12;
    const r = num(rate) / 100 / 12;
    if (P <= 0 || n <= 0) return null;
    if (mode === 'equal-payment') {
      const monthly = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = monthly * n;
      return { monthly, total, interest: total - P, first: monthly, last: monthly };
    }
    const basePrincipal = P / n;
    const firstInterest = P * r;
    const first = basePrincipal + firstInterest;
    const last = basePrincipal + basePrincipal * r;
    const interest = (r * P * (n + 1)) / 2;
    return { monthly: 0, total: P + interest, interest, first, last };
  }, [amount, rate, years, mode]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="贷款金额（万元）">
          <Input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="年利率（%）">
          <Input className={inputClass} value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="贷款年限（年）">
          <Input className={inputClass} value={years} onChange={(e) => setYears(e.target.value)} inputMode="numeric" />
        </Field>
      </div>
      <div className="flex gap-2">
        {(
          [
            { id: 'equal-payment', label: '等额本息' },
            { id: 'equal-principal', label: '等额本金' },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition',
              mode === m.id ? 'bg-[#5b3df5] text-white' : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]',
            )}
          >
            {t(m.label)}
          </button>
        ))}
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {mode === 'equal-payment' ? (
            <div className={statBox}>
              <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t('每月月供')}</div>
              <div className="mt-1 text-base font-semibold text-[#3a2c63] dark:text-[#f1ebff]">¥{money(result.monthly)}</div>
            </div>
          ) : (
            <div className={statBox}>
              <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t('首月 / 末月')}</div>
              <div className="mt-1 text-sm font-semibold text-[#3a2c63] dark:text-[#f1ebff]">
                ¥{money(result.first)} / ¥{money(result.last)}
              </div>
            </div>
          )}
          <div className={statBox}>
            <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t('总利息')}</div>
            <div className="mt-1 text-base font-semibold text-[#3a2c63] dark:text-[#f1ebff]">¥{money(result.interest)}</div>
          </div>
          <div className={statBox}>
            <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t('总还款')}</div>
            <div className="mt-1 text-base font-semibold text-[#3a2c63] dark:text-[#f1ebff]">¥{money(result.total)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== 个税计算器 ===================== */
const TAX_BRACKETS = [
  { limit: 3000, rate: 0.03, deduct: 0 },
  { limit: 12000, rate: 0.1, deduct: 210 },
  { limit: 25000, rate: 0.2, deduct: 1410 },
  { limit: 35000, rate: 0.25, deduct: 2660 },
  { limit: 55000, rate: 0.3, deduct: 4410 },
  { limit: 80000, rate: 0.35, deduct: 7160 },
  { limit: Infinity, rate: 0.45, deduct: 15160 },
];

export function IncomeTaxTool() {
  const { t } = useTranslation();
  const [salary, setSalary] = useState('15000');
  const [insurance, setInsurance] = useState('2000');
  const [special, setSpecial] = useState('0');

  const result = useMemo(() => {
    const taxable = num(salary) - num(insurance) - num(special) - 5000;
    if (taxable <= 0) return { tax: 0, after: num(salary) - num(insurance), taxable: 0 };
    const bracket = TAX_BRACKETS.find((b) => taxable <= b.limit) || TAX_BRACKETS[TAX_BRACKETS.length - 1];
    const tax = taxable * bracket.rate - bracket.deduct;
    return { tax, after: num(salary) - num(insurance) - tax, taxable };
  }, [salary, insurance, special]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="税前月薪（元）">
          <Input className={inputClass} value={salary} onChange={(e) => setSalary(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="五险一金（元）">
          <Input className={inputClass} value={insurance} onChange={(e) => setInsurance(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="专项附加扣除（元）">
          <Input className={inputClass} value={special} onChange={(e) => setSpecial(e.target.value)} inputMode="decimal" />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className={statBox}>
          <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t('应纳税所得额')}</div>
          <div className="mt-1 text-base font-semibold text-[#3a2c63] dark:text-[#f1ebff]">¥{money(result.taxable)}</div>
        </div>
        <div className={statBox}>
          <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t('应缴个税')}</div>
          <div className="mt-1 text-base font-semibold text-[#3a2c63] dark:text-[#f1ebff]">¥{money(result.tax)}</div>
        </div>
        <div className={statBox}>
          <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t('税后到手')}</div>
          <div className="mt-1 text-base font-semibold text-[#3a2c63] dark:text-[#f1ebff]">¥{money(result.after)}</div>
        </div>
      </div>
      <p className="text-xs leading-6 text-[#7b69a5] dark:text-[#af9fda]">
        {t('按月度税率表简化计算（起征点 5000 元），实际个税以累计预扣法为准，结果仅供参考。')}
      </p>
    </div>
  );
}

/* ===================== BMI 计算器 ===================== */
export function BmiTool() {
  const { t } = useTranslation();
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');

  const result = useMemo(() => {
    const h = num(height) / 100;
    const w = num(weight);
    if (h <= 0 || w <= 0) return null;
    const bmi = w / (h * h);
    let level = '正常';
    let color = 'text-[#0f8f4f] dark:text-[#7ee0a6]';
    if (bmi < 18.5) {
      level = '偏瘦';
      color = 'text-[#3b82f6]';
    } else if (bmi >= 28) {
      level = '肥胖';
      color = 'text-[#c4304a] dark:text-[#ff9aab]';
    } else if (bmi >= 24) {
      level = '超重';
      color = 'text-[#d8763f]';
    }
    return { bmi, level, color };
  }, [height, weight]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="身高（cm）">
          <Input className={inputClass} value={height} onChange={(e) => setHeight(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="体重（kg）">
          <Input className={inputClass} value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" />
        </Field>
      </div>
      {result && (
        <div className={`${statBox} flex items-center justify-center gap-3`}>
          <span className="text-2xl font-bold text-[#3a2c63] dark:text-[#f1ebff]">{result.bmi.toFixed(1)}</span>
          <span className={cn('text-lg font-semibold', result.color)}>{t(result.level)}</span>
        </div>
      )}
      <p className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
        {t('参考中国标准：偏瘦 <18.5，正常 18.5–24，超重 24–28，肥胖 ≥28。')}
      </p>
    </div>
  );
}

/* ===================== 日期间隔计算 ===================== */
export function DateDiffTool() {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState('2000-01-01');
  const [end, setEnd] = useState(today);

  const result = useMemo(() => {
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
    const ms = e.getTime() - s.getTime();
    const days = Math.round(ms / 86400000);
    const absDays = Math.abs(days);
    let years = e.getFullYear() - s.getFullYear();
    let months = e.getMonth() - s.getMonth();
    let dayPart = e.getDate() - s.getDate();
    if (dayPart < 0) months -= 1;
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { days, absDays, years: Math.abs(years), months: Math.abs(months) };
  }, [start, end]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="开始日期">
          <Input className={inputClass} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="结束日期">
          <Input className={inputClass} type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className={statBox}>
            <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t('相差天数')}</div>
            <div className="mt-1 text-base font-semibold text-[#3a2c63] dark:text-[#f1ebff]">{t(`${result.absDays} 天`)}</div>
          </div>
          <div className={statBox}>
            <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t('约')}</div>
            <div className="mt-1 text-base font-semibold text-[#3a2c63] dark:text-[#f1ebff]">{t(`${(result.absDays / 7).toFixed(1)} 周`)}</div>
          </div>
          <div className={statBox}>
            <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t('年/月')}</div>
            <div className="mt-1 text-base font-semibold text-[#3a2c63] dark:text-[#f1ebff]">
              {t(`${result.years}年${result.months}个月`)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== 单位换算 ===================== */
const UNIT_CATEGORIES: Record<string, { label: string; units: Record<string, number> }> = {
  length: {
    label: '长度',
    units: { 毫米: 0.001, 厘米: 0.01, 米: 1, 千米: 1000, 英寸: 0.0254, 英尺: 0.3048, 英里: 1609.344 },
  },
  weight: {
    label: '重量',
    units: { 毫克: 0.001, 克: 1, 千克: 1000, 吨: 1e6, 磅: 453.592, 盎司: 28.3495 },
  },
  area: {
    label: '面积',
    units: { 平方米: 1, 平方千米: 1e6, 公顷: 1e4, 亩: 666.667, 平方英尺: 0.092903 },
  },
  data: {
    label: '存储',
    units: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 },
  },
};

export function UnitConvertTool() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<keyof typeof UNIT_CATEGORIES | 'temperature'>('length');
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('米');
  const [tempUnit, setTempUnit] = useState('摄氏度');

  const results = useMemo(() => {
    const v = num(value);
    if (category === 'temperature') {
      let celsius = v;
      if (tempUnit === '华氏度') celsius = ((v - 32) * 5) / 9;
      else if (tempUnit === '开尔文') celsius = v - 273.15;
      return [
        { unit: '摄氏度', value: celsius },
        { unit: '华氏度', value: (celsius * 9) / 5 + 32 },
        { unit: '开尔文', value: celsius + 273.15 },
      ];
    }
    const cat = UNIT_CATEGORIES[category];
    const base = v * (cat.units[fromUnit] ?? 1);
    return Object.entries(cat.units).map(([unit, factor]) => ({ unit, value: base / factor }));
  }, [category, value, fromUnit, tempUnit]);

  const cats = [
    ...Object.entries(UNIT_CATEGORIES).map(([id, c]) => ({ id, label: c.label })),
    { id: 'temperature', label: '温度' },
  ];
  const currentUnits =
    category === 'temperature' ? ['摄氏度', '华氏度', '开尔文'] : Object.keys(UNIT_CATEGORIES[category].units);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCategory(c.id as any);
              if (c.id !== 'temperature') setFromUnit(Object.keys(UNIT_CATEGORIES[c.id as keyof typeof UNIT_CATEGORIES].units)[0]);
            }}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm transition',
              category === c.id ? 'bg-[#5b3df5] text-white' : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]',
            )}
          >
            {t(c.label)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input className={`${inputClass} max-w-[160px]`} value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" />
        <select
          className={`${inputClass} max-w-[140px]`}
          value={category === 'temperature' ? tempUnit : fromUnit}
          onChange={(e) => (category === 'temperature' ? setTempUnit(e.target.value) : setFromUnit(e.target.value))}
        >
          {currentUnits.map((u) => (
            <option key={u} value={u}>
              {t(u)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {results.map((r) => (
          <div key={r.unit} className={statBox}>
            <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{t(r.unit)}</div>
            <div className="mt-1 truncate text-sm font-semibold text-[#3a2c63] dark:text-[#f1ebff]">
              {Number(r.value.toPrecision(6))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
