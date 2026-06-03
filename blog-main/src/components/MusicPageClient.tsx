'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMusicPlayer } from '@/hooks/use-music-player';
import type { Locale } from '@/lib/i18n';
import type { UnifiedSong } from '@/lib/types';

type MusicPageClientProps = {
  locale: Locale;
  text: {
    title: string;
    description: string;
  };
};

export default function MusicPageClient({ locale, text }: MusicPageClientProps) {
  const {
    playlist,
    currentSong,
    nextUpSongs,
    isPlaying,
    isLoading,
    hasMore,
    currentSongIndex,
    handleSongChange,
    handleNextSong,
    handlePrevSong,
    handleTogglePlay,
    loadMoreSongsForUI,
  } = useMusicPlayer();

  const [hasMounted, setHasMounted] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const labels =
    locale === 'en'
      ? {
          fromAlbum: (album: string) => `From album "${album}"`,
          previous: 'Previous song',
          next: 'Next song',
          play: 'Play',
          pause: 'Pause',
          nextUp: 'Next up',
          wall: 'Album Wall',
          wallDescription: 'A casual listen.',
          loadingMore: 'Loading more songs...',
          keepScrolling: 'Keep scrolling to load more',
          loadedAll: (count: number) => `All songs loaded (${count})`,
        }
      : {
          fromAlbum: (album: string) => `来自专辑「${album}」`,
          previous: '上一首',
          next: '下一首',
          play: '播放',
          pause: '暂停',
          nextUp: '接下来播放',
          wall: '唱片墙',
          wallDescription: '随手听。',
          loadingMore: '加载更多歌曲...',
          keepScrolling: '继续滚动加载更多',
          loadedAll: (count: number) => `已加载全部歌曲（${count} 首）`,
        };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = async () => {
      if (isLoadingMore || !hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.offsetHeight;

      if (scrollTop + windowHeight >= documentHeight - 200) {
        setIsLoadingMore(true);
        try {
          await loadMoreSongsForUI();
        } finally {
          setIsLoadingMore(false);
        }
      }
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [isLoadingMore, hasMore, loadMoreSongsForUI]);

  if (!hasMounted || !playlist || (playlist.length === 0 && isLoading)) {
    return (
      <div className="space-y-16 pt-8">
        <div className="space-y-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-3">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="hidden space-y-4 lg:block">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentSong) return null;

  return (
    <div className="space-y-16 pt-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{text.title}</h1>
        <p className="text-muted-foreground">{text.description}</p>
      </div>

      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-3">
        <div className="relative aspect-square w-full lg:col-span-1">
          <Image src={currentSong.coverUrl} alt={currentSong.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
        </div>

        <div className="relative flex h-full flex-col justify-between overflow-hidden lg:col-span-1">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold leading-tight tracking-tighter text-foreground md:text-5xl">
              {currentSong.title}
            </h2>
            <p className="text-xl text-foreground/90 md:text-2xl">{currentSong.artist}</p>
            <p className="text-md text-muted-foreground">{labels.fromAlbum(currentSong.album)}</p>
          </div>

          <div className="relative z-10 mt-8 flex items-center gap-4 pt-4">
            <button
              onClick={handlePrevSong}
              className="rounded-full border border-border p-3 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              aria-label={labels.previous}
            >
              <ChevronUp className="h-6 w-6" />
            </button>
            <button
              onClick={handleTogglePlay}
              className="group relative rounded-full border border-foreground bg-foreground p-4 text-background transition-transform"
              aria-label={isPlaying ? labels.pause : labels.play}
            >
              <div className="absolute inset-0 cursor-pointer rounded-full bg-foreground/20 opacity-0 transition-opacity group-hover:opacity-100" />
              {isPlaying ? <Pause className="h-6 w-6 fill-background" /> : <Play className="h-6 w-6 fill-background" />}
            </button>
            <button
              onClick={handleNextSong}
              className="rounded-full border border-border p-3 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              aria-label={labels.next}
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="hidden lg:col-span-1 lg:block">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{labels.nextUp}</h3>
          <div className="space-y-4">
            {nextUpSongs.map((song: UnifiedSong, index: number) => {
              const songIndex = currentSongIndex + index + 1;
              return (
                <button
                  key={song.id}
                  type="button"
                  className="group flex w-full cursor-pointer items-center gap-4 rounded-md p-2 text-left transition-colors hover:bg-secondary/50"
                  onClick={() => handleSongChange(songIndex)}
                >
                  <span className="relative aspect-square h-12 w-12 shrink-0">
                    <Image src={song.coverUrl} alt={song.album} fill className="object-cover" sizes="48px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{song.title}</span>
                    <span className="block truncate text-sm text-muted-foreground">{song.artist}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-16">
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{labels.wall}</h2>
          <p className="text-muted-foreground">{labels.wallDescription}</p>
        </div>
        <div className="grid grid-cols-2 gap-px sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {playlist.map((song, index) => {
            const isCurrentSong = index === currentSongIndex;
            return (
              <motion.button
                key={`${song.id}-${index}`}
                type="button"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: index < 20 ? 0 : Math.min(0.1 * (index % 20), 0.8) }}
                className="group relative aspect-square cursor-pointer overflow-hidden"
                onClick={() => (isCurrentSong ? handleTogglePlay() : handleSongChange(index))}
              >
                <Image
                  src={song.coverUrl}
                  alt={`${song.title} by ${song.artist}`}
                  fill
                  className={`object-cover transition-all duration-300 ${isCurrentSong ? 'scale-105' : 'group-hover:scale-105'}`}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw"
                />
                <span
                  className={`absolute inset-0 flex items-center justify-center bg-foreground/80 transition-opacity duration-300 ${
                    isCurrentSong ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <span className="p-4 text-center text-background">
                    <span className="mb-2 flex items-center justify-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/20">
                        {isCurrentSong && isPlaying ? (
                          <Pause className="h-6 w-6 fill-background" />
                        ) : (
                          <Play className="h-6 w-6 translate-x-0.5 fill-background" />
                        )}
                      </span>
                    </span>
                    <span className="line-clamp-2 block text-sm font-bold">{song.title}</span>
                    <span className="mt-1 line-clamp-1 block text-xs text-background/90">{song.artist}</span>
                    <span className="mt-1 line-clamp-1 block text-xs text-background/70">{song.album}</span>
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {(isLoadingMore || hasMore) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="mt-8 flex justify-center">
              {isLoadingMore ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-3 text-muted-foreground">
                  <span className="relative h-5 w-5">
                    <span className="absolute inset-0 h-5 w-5 rounded-full border-2 border-muted" />
                    <span className="absolute inset-0 h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                  </span>
                  <span className="text-sm font-medium">{labels.loadingMore}</span>
                </motion.div>
              ) : hasMore ? (
                <motion.div initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }} className="text-sm text-muted-foreground">
                  {labels.keepScrolling}
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!hasMore && playlist.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{labels.loadedAll(playlist.length)}</span>
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
