export const DEFAULT_DEWATERMARK_VIDEO_PREFERENCE = 'resolution';
export const DEFAULT_XHS_IMAGE_FORMAT = 'jpeg';

export const SUPPORTED_DEWATERMARK_PLATFORMS = ['wechat', 'douyin', 'xhs', 'kuaishou'] as const;

export type SupportedDewatermarkPlatform = (typeof SUPPORTED_DEWATERMARK_PLATFORMS)[number];
export type DewatermarkPlatform = SupportedDewatermarkPlatform | 'unknown';

export const DEWATERMARK_PLATFORM_ENDPOINT: Record<SupportedDewatermarkPlatform, string> = {
  wechat: '/api/v1/wechat/detail',
  douyin: '/api/v1/douyin/detail',
  xhs: '/api/v1/xhs/detail',
  kuaishou: '/api/v1/kuaishou/detail',
};

export function isSupportedDewatermarkPlatform(value: unknown): value is SupportedDewatermarkPlatform {
  return typeof value === 'string' && SUPPORTED_DEWATERMARK_PLATFORMS.includes(value as SupportedDewatermarkPlatform);
}

export function detectDewatermarkPlatform(value: string): DewatermarkPlatform {
  const text = String(value || '');
  if (/mp\.weixin\.qq\.com\/s\//i.test(text)) return 'wechat';
  if (/xhslink\.com\/|xiaohongshu\.com\//i.test(text)) return 'xhs';
  if (/v\.douyin\.com\/|(?:www\.)?douyin\.com\/|(?:www\.)?iesdouyin\.com\//i.test(text)) return 'douyin';
  if (/v\.kuaishou\.com\/|(?:[\w-]+\.)?kuaishou\.com\/|(?:[\w-]+\.)?gifshow\.com\//i.test(text)) {
    return 'kuaishou';
  }
  return 'unknown';
}

export function buildDewatermarkRequestBody(platform: SupportedDewatermarkPlatform, url: string) {
  if (platform === 'wechat') return { url };
  if (platform === 'xhs') {
    return {
      url,
      imageFormat: DEFAULT_XHS_IMAGE_FORMAT,
      videoPreference: DEFAULT_DEWATERMARK_VIDEO_PREFERENCE,
    };
  }
  return { url, videoPreference: DEFAULT_DEWATERMARK_VIDEO_PREFERENCE };
}
