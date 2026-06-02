'use client';

import { Check, ChevronDown, Upload } from 'lucide-react';
import { type ChangeEvent, type ReactNode, useRef, useState } from 'react';
import { SimpleDropdown, SimpleDropdownItem } from '@/components/ui/simple-dropdown';
import { cn } from '@/lib/utils';

export const inputClass =
  'w-full rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-3 text-sm text-[#2f2154] placeholder:text-[#75689e] dark:placeholder:text-[#ae9fda] shadow-sm outline-none transition focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff]';

export const cardClass =
  'rounded-[28px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(247,242,255,0.92))] p-5 shadow-[0_22px_70px_rgba(91,61,245,0.08)] dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))]';

export const outputClass =
  'rounded-2xl border border-dashed border-[#d9ccff] bg-[#faf7ff] px-4 py-3 text-sm text-[#4d3f77] dark:border-[#3b2f59] dark:bg-[#181127] dark:text-[#d9ccff]';

export const secondaryButtonClass =
  'rounded-full border-[#b9a3ff] bg-[#f7f1ff] text-[#4b2fd0] shadow-[0_12px_32px_rgba(91,61,245,0.12)] hover:border-[#8b6bff] hover:bg-[#eee3ff] hover:text-[#3c22c3] dark:border-[#5a4492] dark:bg-[#1d1533] dark:text-[#efe9ff] dark:hover:border-[#8b6bff] dark:hover:bg-[#291e45]';

export function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}: {
  icon: any;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`${cardClass} ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff]">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#6c5b98] dark:text-[#b9aadf]">
            {description}
          </p>
        </div>
      </div>
      {children}
    </article>
  );
}

export function OutputBox({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${outputClass} ${className}`}>{children}</div>;
}

export function downloadPlainText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
}

export function FancySelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  const currentOption = options.find((option) => option.value === value);

  return (
    <SimpleDropdown
      align="start"
      className="min-w-[13rem] rounded-[22px] border border-[#dacdff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,239,255,0.96))] p-2 shadow-[0_24px_70px_rgba(91,61,245,0.18)] dark:border-[#3a2f58] dark:bg-[linear-gradient(180deg,rgba(30,23,49,0.98),rgba(18,13,30,0.98))]"
      trigger={
        <button
          type="button"
          aria-label={ariaLabel}
          className="flex h-9 w-full items-center justify-between rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-1 text-left text-sm text-[#2f2154] shadow-sm transition hover:border-[#b99fff] focus-visible:border-[#8b6bff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff]"
        >
          <span className="truncate font-medium">
            {currentOption?.label || ariaLabel}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#745da9] dark:text-[#c7baf1]" />
        </button>
      }
    >
      {options.map((option) => (
        <SimpleDropdownItem
          key={option.value}
          onClick={() => onChange(option.value)}
          active={option.value === value}
          className={cn(
            'rounded-2xl px-3 py-2.5 text-[#2f2154] dark:text-[#f4efff]',
            option.value === value
              ? 'bg-[#ece3ff] text-[#4f31d7] dark:bg-[#2b1f43] dark:text-[#efe9ff]'
              : 'hover:text-[#4f31d7] dark:hover:text-[#ffffff]',
          )}
        >
          <span className="text-sm font-medium">{option.label}</span>
          {option.value === value ? (
            <Check className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" />
          )}
        </SimpleDropdownItem>
      ))}
    </SimpleDropdown>
  );
}

export function FancyCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition select-none',
        checked
          ? 'border-[#b69cff] bg-[linear-gradient(135deg,rgba(240,231,255,0.96),rgba(234,224,255,0.88))] text-[#4327ba] shadow-[0_14px_36px_rgba(91,61,245,0.12)] dark:border-[#7454cf] dark:bg-[linear-gradient(135deg,rgba(40,28,69,0.94),rgba(31,22,53,0.9))] dark:text-[#f2edff]'
          : 'border-[#ded2ff] bg-white/55 text-[#5e4f8a] hover:border-[#b99fff] hover:bg-[#f7f2ff] dark:border-[#382d55] dark:bg-white/[0.03] dark:text-[#cbbff0] dark:hover:border-[#7156c8] dark:hover:bg-white/[0.05]',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-[8px] border transition',
          checked
            ? 'border-[#6d46ff] bg-[#5b3df5] text-white shadow-[0_8px_18px_rgba(91,61,245,0.24)] dark:border-[#a58eff] dark:bg-[#8e72ff]'
            : 'border-[#bfaeff] bg-white/90 text-transparent dark:border-[#54407f] dark:bg-[#1a132d]',
        )}
      >
        <Check
          className={cn(
            'h-3.5 w-3.5 transition',
            checked ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
          )}
        />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

export function ToolFileInput({
  accept,
  onChange,
  hint,
}: {
  accept?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const files = event.dataTransfer.files;
        if (files && files.length && inputRef.current) {
          inputRef.current.files = files;
          setFileName(files[0]?.name ?? '');
          onChange({
            target: inputRef.current,
          } as unknown as ChangeEvent<HTMLInputElement>);
        }
      }}
      className={cn(
        'group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition',
        dragging
          ? 'border-[#8b6bff] bg-[#f1ebff] dark:border-[#8b6bff] dark:bg-white/[0.06]'
          : 'border-[#cdbcff] bg-white/60 hover:border-[#8b6bff] hover:bg-[#f5f0ff] dark:border-[#3a2f58] dark:bg-white/[0.03] dark:hover:border-[#8b6bff] dark:hover:bg-white/[0.05]',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          setFileName(event.target.files?.[0]?.name ?? '');
          onChange(event);
        }}
      />
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ece3ff] text-[#5b3df5] transition group-hover:scale-105 dark:bg-[#2b1f43] dark:text-[#cbbcff]">
        <Upload className="h-5 w-5" />
      </span>
      <span className="text-sm font-medium text-[#4f31d7] dark:text-[#cbbcff]">
        {fileName || '点击或拖拽文件到此处'}
      </span>
      <span className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
        {hint || '支持点击选择或拖拽上传'}
      </span>
    </label>
  );
}
