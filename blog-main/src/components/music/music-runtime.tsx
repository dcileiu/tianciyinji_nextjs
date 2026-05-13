'use client';

import { usePathname } from 'next/navigation';
import { MusicPlayerProvider } from '@/hooks/use-music-player';
import { GlobalMusicPlayer } from './global-music-player';

interface MusicRuntimeProps {
  children: React.ReactNode;
}

export function MusicRuntime({ children }: MusicRuntimeProps) {
  const pathname = usePathname();
  const shouldEnableMusic = pathname.startsWith('/music');

  if (!shouldEnableMusic) {
    return <>{children}</>;
  }

  return (
    <MusicPlayerProvider>
      {children}
      <GlobalMusicPlayer />
    </MusicPlayerProvider>
  );
}
