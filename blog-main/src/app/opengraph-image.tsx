import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';

export const runtime = 'edge';
export const alt = `${siteConfig.name} Open Graph Image`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// 仅按需要渲染的文字向 Google Fonts 拉取中文字体子集（体积很小），
// 让 OG 图能显示中文站名；失败时回退拉丁字样，保证图始终能生成。
async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@700&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+?)\) format\(/);
  if (!resource) throw new Error('font url not found');
  const res = await fetch(resource[1]);
  if (!res.ok) throw new Error('font fetch failed');
  return res.arrayBuffer();
}

export default async function OpenGraphImage() {
  let titleText: string = siteConfig.name;
  let fonts: { name: string; data: ArrayBuffer; style: 'normal'; weight: 700 }[] | undefined;

  try {
    const data = await loadGoogleFont('Noto Sans SC', siteConfig.name);
    fonts = [{ name: 'Noto Sans SC', data, style: 'normal', weight: 700 }];
  } catch {
    titleText = 'Dci';
    fonts = undefined;
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'radial-gradient(circle at top left, rgba(126,92,255,0.24), transparent 34%), radial-gradient(circle at bottom right, rgba(216,205,255,0.18), transparent 38%), linear-gradient(135deg, #120f1f 0%, #1b1530 100%)',
          color: 'white',
          padding: '72px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 8, color: '#c6b8ff' }}>DCI</div>
          <div
            style={{
              border: '1px solid rgba(217,204,255,0.28)',
              borderRadius: 999,
              padding: '12px 22px',
              fontSize: 24,
              color: '#e9e2ff',
            }}
          >
            Blog · Works · Resources
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              fontSize: 108,
              fontWeight: 700,
              lineHeight: 1.1,
              fontFamily: fonts ? 'Noto Sans SC' : undefined,
            }}
          >
            {titleText}
          </div>
          <div style={{ fontSize: 34, maxWidth: 920, color: '#d8cdff', lineHeight: 1.4 }}>
            Blog, works, curated resources and long-term projects.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 24, color: '#b5a8df' }}>
          <div>Full-stack Developer · Writer</div>
          <div>{siteConfig.url.replace(/^https?:\/\//, '')}</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
