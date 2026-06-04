'use client';

import { motion } from 'framer-motion';
import Lenis from 'lenis';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';

interface Game {
  title: string;
  quote: string;
  description: string;
  video: string;
  startTime?: number;
  accentColor?: string;
  steam?: string;
  link?: { url: string; label: string };
  videoHeight?: string;
}

const gamesByLocale: Record<Locale, Game[]> = {
  'zh-CN': [
    {
      title: '赛博朋克 2077',
      quote: '这是我最喜欢的游戏，没有之一。',
      description:
        '夜之城里发生的故事，从 V、强尼银手到后来的百灵鸟和李德，每个人、每段故事都让我很难忘。刚发售时它确实不完美，但到往日之影 DLC 后，已经是一部真正值得体验的作品。',
      video: 'http://1500015089.vod2.myqcloud.com/439635e7vodtranscq1500015089/7a6d228a1397757899027001433/v.f100800.mp4',
      startTime: 6,
      accentColor: '#F4E600',
      steam: 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/',
    },
    {
      title: '最后生还者',
      quote: '对我来说绝对是神作之一。',
      description:
        '一代和二代我都玩过。它的叙事、节奏和人物都很有沉浸感，画面漂亮，情绪也足够扣人心弦。前期或许慢热，但进入状态后很难停下来。',
      video: 'https://video.akamai.steamstatic.com/store_trailers/256936971/movie_max_vp9.webm?t=1680015399',
      startTime: 10,
      accentColor: '#4A7C59',
      steam: 'https://store.steampowered.com/app/1888930/The_Last_of_Us_Part_I/',
    },
    {
      title: '最后生还者 Part II',
      quote: '虽然有争议，但不妨碍它依然是神作。',
      description: '二代的表达更激烈，也更容易让人受伤。它不一定讨好所有人，但在叙事完成度和情绪冲击上依然非常强。',
      video: 'https://cdn.akamai.steamstatic.com/steam/apps/257121063/movie_max_vp9.webm?t=1746152569',
      startTime: 8,
      accentColor: '#8B4513',
      steam: 'https://store.steampowered.com/app/2531310/The_Last_of_Us_Part_II_Remastered/',
      videoHeight: '65vh',
    },
    {
      title: 'THE FINALS',
      quote: '画面很好看，玩法新颖，但可能不太适合新手。',
      description:
        '长 TTK 的 FPS 游戏，国内常叫终极角逐。它的破坏、节奏和视觉风格都很鲜明，不过匹配机制和上手门槛会让新人吃点苦。如果喜欢这种竞技味和场景破坏，很值得试试。',
      video: 'https://cdn.fastly.steamstatic.com/steam/apps/257102318/movie_max_vp9.webm?t=1742475028',
      accentColor: '#FF4655',
      link: { url: 'https://www.xbox.com/zh-CN/games/store/the-finals/9PGD71CMDS0Z', label: 'Xbox' },
    },
    {
      title: '幻兽帕鲁',
      quote: '和朋友一起玩再合适不过。',
      description:
        '抓帕鲁、建房子、打 Boss，再加上一点轻松混乱的联机体验。它不总是精致，但对得起价格，也足够好玩。',
      video: 'https://cdn.akamai.steamstatic.com/steam/apps/257063169/movie_max_vp9.webm?t=1728458616',
      accentColor: '#5DADE2',
      steam: 'https://store.steampowered.com/app/1623730/Palworld/',
    },
    {
      title: '底特律：变人',
      quote: '每一个选择都会改变结局。',
      description:
        '互动电影式的剧情游戏，三条主线交织，每个决定都会影响人物命运。画面精美，剧情扣人心弦，多周目体验完全不同。',
      video: 'https://cdn.akamai.steamstatic.com/steam/apps/256784014/movie_max_vp9.webm?t=1590429401',
      startTime: 7,
      accentColor: '#00BFFF',
      steam: 'https://store.steampowered.com/app/1222140/Detroit_Become_Human/',
    },
  ],
  en: [
    {
      title: 'Cyberpunk 2077',
      quote: 'My favorite game. No contest.',
      description:
        'Night City stayed with me: V, Johnny Silverhand, Songbird, Reed, and all the messy choices around them. It launched rough, but with Phantom Liberty it became something genuinely special.',
      video: 'http://1500015089.vod2.myqcloud.com/439635e7vodtranscq1500015089/7a6d228a1397757899027001433/v.f100800.mp4',
      startTime: 6,
      accentColor: '#F4E600',
      steam: 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/',
    },
    {
      title: 'The Last of Us',
      quote: 'One of the greats for me.',
      description:
        'I played both Part I and Part II. The storytelling, mood, and character work are deeply immersive, with beautiful visuals and a slow burn that becomes hard to leave.',
      video: 'https://video.akamai.steamstatic.com/store_trailers/256936971/movie_max_vp9.webm?t=1680015399',
      startTime: 10,
      accentColor: '#4A7C59',
      steam: 'https://store.steampowered.com/app/1888930/The_Last_of_Us_Part_I/',
    },
    {
      title: 'The Last of Us Part II',
      quote: 'Controversial, yes. Still remarkable.',
      description:
        'Part II is harsher and more divisive, but that does not take away from its craft, emotional force, and narrative confidence.',
      video: 'https://cdn.akamai.steamstatic.com/steam/apps/257121063/movie_max_vp9.webm?t=1746152569',
      startTime: 8,
      accentColor: '#8B4513',
      steam: 'https://store.steampowered.com/app/2531310/The_Last_of_Us_Part_II_Remastered/',
      videoHeight: '65vh',
    },
    {
      title: 'THE FINALS',
      quote: 'Great looking and inventive, but not the easiest first FPS.',
      description:
        'A long-TTK shooter with a strong visual identity and satisfying destruction. The matchmaking and learning curve can be punishing, but the format feels fresh when it clicks.',
      video: 'https://cdn.fastly.steamstatic.com/steam/apps/257102318/movie_max_vp9.webm?t=1742475028',
      accentColor: '#FF4655',
      link: { url: 'https://www.xbox.com/zh-CN/games/store/the-finals/9PGD71CMDS0Z', label: 'Xbox' },
    },
    {
      title: 'Palworld',
      quote: 'Best enjoyed with friends.',
      description:
        'Catch Pals, build a base, fight bosses, and let the co-op chaos do its thing. It is not always polished, but it is fun and more than worth its price.',
      video: 'https://cdn.akamai.steamstatic.com/steam/apps/257063169/movie_max_vp9.webm?t=1728458616',
      accentColor: '#5DADE2',
      steam: 'https://store.steampowered.com/app/1623730/Palworld/',
    },
    {
      title: 'Detroit: Become Human',
      quote: 'Every choice changes the ending.',
      description:
        'An interactive cinematic story with three intertwined routes. Each decision affects the plot and character fates, which makes replaying it feel meaningfully different.',
      video: 'https://cdn.akamai.steamstatic.com/steam/apps/256784014/movie_max_vp9.webm?t=1590429401',
      startTime: 7,
      accentColor: '#00BFFF',
      steam: 'https://store.steampowered.com/app/1222140/Detroit_Become_Human/',
    },
  ],
};

function GameSection({ game, index }: { game: Game; index: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isInView, setIsInView] = useState(index === 0);
  const startTime = game.startTime || 0;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    if (isInView) {
      video.currentTime = startTime;
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isInView, isReady, startTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = 0.3;
    video.muted = true;

    const initVideo = () => {
      video.currentTime = startTime;
    };
    const handleSeeked = () => {
      if (Math.abs(video.currentTime - startTime) < 1) setIsReady(true);
    };
    const handleTimeUpdate = () => {
      if (startTime > 0 && video.currentTime < startTime - 0.5) video.currentTime = startTime;
    };

    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('timeupdate', handleTimeUpdate);

    if (video.readyState >= 3) initVideo();
    else video.addEventListener('canplay', initVideo, { once: true });

    return () => {
      video.removeEventListener('canplay', initVideo);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [startTime]);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section ref={sectionRef}>
      <div className="relative h-[50vh] w-full md:h-[75vh]" style={game.videoHeight ? { height: undefined } : undefined}>
        {game.videoHeight && (
          <style jsx>{`
            @media (min-width: 768px) {
              .video-container {
                height: ${game.videoHeight};
              }
            }
          `}</style>
        )}
        <div className={`relative h-full w-full ${game.videoHeight ? 'video-container' : ''}`}>
          <video
            ref={videoRef}
            src={game.video}
            className={`h-full w-full cursor-pointer object-cover transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onClick={handlePlay}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(to top, #0B0B0B 0%, rgba(11,11,11,0.7) 25%, rgba(11,11,11,0.3) 50%, transparent 70%)' }}
          />
          <div className="absolute bottom-4 right-4 z-10 flex gap-2 pb-safe md:bottom-6 md:right-6 md:gap-3">
            <button type="button" onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 md:h-10 md:w-10" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              {isMuted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
              )}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); handlePlay(); }} className="flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 md:h-10 md:w-10" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              )}
            </button>
          </div>
          <div className="absolute bottom-4 left-4 pr-24 md:bottom-12 md:left-12 md:pr-0">
            <h2 className="text-2xl font-medium text-white md:text-5xl">{game.title}</h2>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-24">
        <p className="mb-6 text-xl font-medium leading-relaxed md:mb-8 md:text-3xl" style={{ color: game.accentColor || '#fff' }}>
          {game.quote}
        </p>
        <p className="mb-8 text-sm leading-relaxed md:mb-10 md:text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {game.description}
        </p>
        {(game.steam || game.link) && (
          <a href={game.steam || game.link?.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm transition-all hover:gap-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span>{game.steam ? 'Steam' : game.link?.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
          </a>
        )}
      </div>
    </section>
  );
}

export default function GamesPageClient() {
  const { locale, localizedHref } = useI18n();
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const games = gamesByLocale[locale];
  const backLabel = locale === 'en' ? 'Back' : '返回';

  useEffect(() => {
    document.documentElement.classList.add('dark-scrollbar');
    return () => document.documentElement.classList.remove('dark-scrollbar');
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const handleExit = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsExiting(true);
    localStorage.setItem('sidebar-open', 'false');
    setTimeout(() => router.push(localizedHref('/') as Route), 500);
  };

  return (
    <motion.div className="fullscreen-page min-h-screen" style={{ backgroundColor: '#0B0B0B' }} animate={{ opacity: isExiting ? 0 : 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      <motion.a
        href={localizedHref('/')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isExiting ? 0 : 1, x: isExiting ? -20 : 0 }}
        transition={{ duration: 0.6, delay: isExiting ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-6 top-6 z-50 flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
        onClick={handleExit}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        <span className="text-sm">{backLabel}</span>
      </motion.a>

      {games.map((game, index) => (
        <motion.div key={game.title} initial={{ opacity: 0, y: index === 0 ? 0 : 80 }} animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? 40 : 0 }} transition={{ duration: isExiting ? 0.4 : index === 0 ? 0.8 : 1.2, delay: isExiting ? index * 0.05 : index === 0 ? 0.1 : 0.3 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}>
          <GameSection game={game} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
}
