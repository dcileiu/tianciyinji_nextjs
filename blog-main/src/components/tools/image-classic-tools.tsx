'use client';

/* eslint-disable @next/next/no-img-element */
import { Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FancySelect,
  OutputBox,
  ToolFileInput,
  inputClass,
} from '@/components/tools/tool-ui';
import {
  base64ToBytes,
  dataUrlByteSize,
  formatBytes,
  generatePetGifFromDataUrl,
  loadImageElement,
  readFileAsDataUrl,
} from '@/lib/tools/compute';

/* ===================== 二维码生成 ===================== */
export function QrcodeTool() {
  const [qrText, setQrText] = useState('https://github.com/dcileiu');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');

  async function handleQrGenerate() {
    setQrError('');
    try {
      if (!qrText.trim()) throw new Error('请输入二维码内容。');
      const url = await QRCode.toDataURL(qrText, {
        width: 360,
        margin: 1,
        color: { dark: '#2e2150', light: '#0000' },
      });
      setQrDataUrl(url);
    } catch (error) {
      setQrError(error instanceof Error ? error.message : '二维码生成失败。');
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[120px] resize-y`}
        value={qrText}
        onChange={(event) => setQrText(event.target.value)}
        placeholder="输入二维码内容"
      />
      <Button onClick={handleQrGenerate} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
        生成二维码
      </Button>
      {qrError && <OutputBox>{qrError}</OutputBox>}
      {qrDataUrl && (
        <OutputBox className="space-y-3 text-center">
          <img src={qrDataUrl} alt="QR code" className="mx-auto h-44 w-44 rounded-2xl border border-[#e3d7ff] bg-white p-3" />
          <a href={qrDataUrl} download="dci-qrcode.png" className="text-sm text-[#5b3df5] hover:underline">
            下载 PNG
          </a>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 图片与 Base64 互转 ===================== */
export function ImageBase64Tool() {
  const [imageBase64Value, setImageBase64Value] = useState('');
  const [imageBase64Preview, setImageBase64Preview] = useState('');
  const [imageBase64Info, setImageBase64Info] = useState<{ name?: string; size?: number } | null>(null);
  const [imageBase64Error, setImageBase64Error] = useState('');

  async function handleImageFileToBase64(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageBase64Error('');
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageBase64Value(dataUrl);
      setImageBase64Preview(dataUrl);
      setImageBase64Info({ name: file.name, size: file.size });
    } catch (error) {
      setImageBase64Error(error instanceof Error ? error.message : '图片读取失败。');
    }
  }

  function handleBase64ToImagePreview() {
    setImageBase64Error('');
    try {
      if (!imageBase64Value.trim()) throw new Error('请输入 Base64 内容。');
      const normalized = imageBase64Value.startsWith('data:')
        ? imageBase64Value
        : `data:image/png;base64,${imageBase64Value.replace(/\s+/g, '')}`;
      base64ToBytes(normalized);
      setImageBase64Preview(normalized);
      setImageBase64Info({ size: dataUrlByteSize(normalized) });
    } catch (error) {
      setImageBase64Error(error instanceof Error ? error.message : 'Base64 图片内容无效。');
    }
  }

  return (
    <div className="space-y-3">
      <ToolFileInput
        accept="image/*"
        onChange={handleImageFileToBase64}
        hint="支持 PNG / JPG / WebP 等图片，转换完全在本地完成"
      />
      <textarea
        className={`${inputClass} min-h-[150px] resize-y font-mono`}
        value={imageBase64Value}
        onChange={(event) => setImageBase64Value(event.target.value)}
        placeholder="这里会显示图片 Base64，也可以直接粘贴现成的 Base64"
      />
      <div className="flex gap-3">
        <Button onClick={handleBase64ToImagePreview} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
          解析并预览
        </Button>
      </div>
      {imageBase64Error && <OutputBox>{imageBase64Error}</OutputBox>}
      {imageBase64Preview && (
        <OutputBox className="space-y-3">
          {imageBase64Info && (
            <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
              {imageBase64Info.name ? `${imageBase64Info.name} · ` : ''}
              {imageBase64Info.size ? formatBytes(imageBase64Info.size) : ''}
            </div>
          )}
          <img
            src={imageBase64Preview}
            alt="Base64 preview"
            className="max-h-64 rounded-2xl border border-[#e3d7ff] bg-white object-contain p-2"
          />
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== SVG 转图片 ===================== */
export function SvgToImageTool() {
  const [svgInput, setSvgInput] = useState(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="32" fill="#2e2150"/><path d="M52 24h46l-8 68H44l8-68Z" fill="#fff"/><path d="M90 80h52l-6 28H84l6-28Z" fill="#d9ccff"/></svg>',
  );
  const [svgPngUrl, setSvgPngUrl] = useState('');
  const [svgError, setSvgError] = useState('');

  async function handleSvgConvert() {
    setSvgError('');
    try {
      if (!svgInput.includes('<svg')) throw new Error('请输入完整的 SVG 代码。');
      const svgBlob = new Blob([svgInput], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const image = await loadImageElement(url);
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || 512;
      canvas.height = image.naturalHeight || 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法初始化画布。');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      setSvgPngUrl(canvas.toDataURL('image/png'));
      URL.revokeObjectURL(url);
    } catch (error) {
      setSvgError(error instanceof Error ? error.message : 'SVG 转图片失败。');
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[200px] resize-y font-mono text-xs`}
        value={svgInput}
        onChange={(event) => setSvgInput(event.target.value)}
      />
      <Button onClick={handleSvgConvert} className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
        转成 PNG
      </Button>
      {svgError && <OutputBox>{svgError}</OutputBox>}
      {svgPngUrl && (
        <OutputBox className="space-y-3 text-center">
          <img src={svgPngUrl} alt="SVG to PNG result" className="mx-auto max-h-64 rounded-2xl border border-[#e3d7ff] bg-white p-3" />
          <a href={svgPngUrl} download="converted-from-svg.png" className="text-sm text-[#5b3df5] hover:underline">
            下载 PNG
          </a>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 图片压缩 ===================== */
export function ImageCompressTool() {
  const [compressDataUrl, setCompressDataUrl] = useState('');
  const [compressInfo, setCompressInfo] = useState<{ before: number; after: number; type: string } | null>(null);
  const [compressError, setCompressError] = useState('');
  const [compressQuality, setCompressQuality] = useState('0.78');
  const [compressMaxWidth, setCompressMaxWidth] = useState('1600');
  const [compressType, setCompressType] = useState<'image/jpeg' | 'image/webp'>('image/webp');

  async function handleCompressImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCompressError('');
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const image = await loadImageElement(dataUrl);
      const maxWidth = Math.max(320, Number(compressMaxWidth) || 1600);
      const quality = Math.min(Math.max(Number(compressQuality) || 0.78, 0.3), 0.95);
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法初始化画布。');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL(compressType, quality);
      setCompressDataUrl(compressed);
      setCompressInfo({ before: file.size, after: dataUrlByteSize(compressed), type: compressType });
    } catch (error) {
      setCompressError(error instanceof Error ? error.message : '图片压缩失败。');
    }
  }

  return (
    <div className="space-y-3">
      <ToolFileInput accept="image/*" onChange={handleCompressImage} hint="选择要压缩的图片，可调整质量、最大宽度与导出格式" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input className={inputClass} value={compressQuality} onChange={(event) => setCompressQuality(event.target.value)} placeholder="质量 0~1" />
        <Input className={inputClass} value={compressMaxWidth} onChange={(event) => setCompressMaxWidth(event.target.value)} placeholder="最大宽度" />
        <FancySelect
          value={compressType}
          onChange={setCompressType}
          ariaLabel="选择压缩格式"
          options={[
            { value: 'image/webp', label: 'WebP' },
            { value: 'image/jpeg', label: 'JPEG' },
          ]}
        />
      </div>
      {compressError && <OutputBox>{compressError}</OutputBox>}
      {compressDataUrl && compressInfo && (
        <OutputBox className="space-y-3">
          <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
            压缩前 {formatBytes(compressInfo.before)} · 压缩后 {formatBytes(compressInfo.after)} · 输出 {compressInfo.type}
          </div>
          <img src={compressDataUrl} alt="Compressed result" className="max-h-72 rounded-2xl border border-[#e3d7ff] bg-white object-contain p-2" />
          <a
            href={compressDataUrl}
            download={`compressed.${compressType === 'image/webp' ? 'webp' : 'jpg'}`}
            className="text-sm text-[#5b3df5] hover:underline"
          >
            下载压缩图
          </a>
        </OutputBox>
      )}
    </div>
  );
}

/* ===================== 摸头 GIF ===================== */
export function PetGifTool() {
  const [petGifUrl, setPetGifUrl] = useState('');
  const [petGifError, setPetGifError] = useState('');
  const [petGifBusy, setPetGifBusy] = useState(false);
  const petGifObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (petGifObjectUrlRef.current) {
        URL.revokeObjectURL(petGifObjectUrlRef.current);
      }
    };
  }, []);

  async function handleGeneratePetGif(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPetGifBusy(true);
    setPetGifError('');
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const blob = await generatePetGifFromDataUrl(dataUrl);
      if (petGifObjectUrlRef.current) URL.revokeObjectURL(petGifObjectUrlRef.current);
      const objectUrl = URL.createObjectURL(blob);
      petGifObjectUrlRef.current = objectUrl;
      setPetGifUrl(objectUrl);
    } catch (error) {
      setPetGifError(error instanceof Error ? error.message : '摸头 GIF 生成失败。');
    } finally {
      setPetGifBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <ToolFileInput accept="image/*" onChange={handleGeneratePetGif} hint="上传一张头像/图片，生成透明背景的摸头 GIF" />
      <div className="text-xs leading-6 text-[#7b69a5] dark:text-[#af9fda]">
        这版是站内自制的极简摸头动效，不依赖外部服务，会生成透明背景 GIF。
      </div>
      {petGifError && <OutputBox>{petGifError}</OutputBox>}
      {petGifBusy && (
        <OutputBox>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在生成 GIF，请稍等…
          </div>
        </OutputBox>
      )}
      {petGifUrl && !petGifBusy && (
        <OutputBox className="space-y-3 text-center">
          <img
            src={petGifUrl}
            alt="Patting GIF"
            className="mx-auto max-h-56 rounded-2xl border border-[#e3d7ff] bg-[radial-gradient(circle_at_center,#f7f2ff,#efe7ff)] p-3"
          />
          <a href={petGifUrl} download="pet-pat.gif" className="text-sm text-[#5b3df5] hover:underline">
            下载 GIF
          </a>
        </OutputBox>
      )}
    </div>
  );
}
