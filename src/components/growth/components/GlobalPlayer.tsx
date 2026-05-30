// Global Media Player V9 - Player NEVER moves in DOM
// - Le player YouTube est rendu UNE FOIS et JAMAIS déplacé
// - CSS contrôle la visibilité et la position
// - L'UI est séparée du player
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, Pause, X, Volume2, VolumeX, 
  Maximize2, Minimize2, GripVertical, ExternalLink
} from 'lucide-react';
import { useMediaPlayer, getYouTubeThumbnail } from '@/contexts/MediaPlayerContext';

// YouTube Player API types
declare global {
  interface Window {
    YT: {
      Player: new (element: HTMLDivElement, config: {
        videoId: string;
        playerVars?: { autoplay?: number; controls?: number; modestbranding?: number; rel?: number };
        events?: {
          onReady?: (event: { target: YTPlayer }) => void;
          onStateChange?: (event: { data: number; target: YTPlayer }) => void;
        };
      }) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
}

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getYouTubePlaylistId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/[?&]list=([^&]+)/);
  return match ? match[1] : null;
}

let ytApiLoaded = false;
let ytApiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (ytApiLoaded) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  
  ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    
    window.onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true;
      resolve();
    };
    
    setTimeout(() => { ytApiLoaded = true; resolve(); }, 3000);
  });
  
  return ytApiPromise;
}

export function GlobalPlayer() {
  const { currentMedia, isPlaying, volume, playMedia, pauseMedia, stopMedia, setVolume, playerMode, setPlayerMode } = useMediaPlayer();
  
  const [isClient, setIsClient] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  
  // SINGLE ref that NEVER changes
  const playerDivRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const lastMediaKeyRef = useRef<string | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  
  const normalPlaceholderRef = useRef<HTMLDivElement | null>(null);
  const semiPlaceholderRef = useRef<HTMLDivElement | null>(null);
  
  const currentVideoId = currentMedia?.url ? getYouTubeVideoId(currentMedia.url) : null;
  const currentPlaylistId = currentMedia?.url ? getYouTubePlaylistId(currentMedia.url) : null;
  const currentMediaKey = `${currentVideoId || ''}-${currentPlaylistId || ''}`;
  const thumbnail = currentMedia?.url ? getYouTubeThumbnail(currentMedia.url) : currentMedia?.imageUrl;

  useEffect(() => { setIsClient(true); }, []);

  // Create player div ONCE on mount
  useEffect(() => {
    if (!isClient) return;
    
    // Create a single div that will hold the player
    const div = document.createElement('div');
    div.id = 'global-youtube-player';
    div.style.cssText = 'position: fixed; z-index: 10000; pointer-events: auto;';
    document.body.appendChild(div);
    playerDivRef.current = div;
    
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
        playerRef.current = null;
      }
      if (div.parentNode) {
        div.parentNode.removeChild(div);
      }
      playerDivRef.current = null;
    };
  }, [isClient]);

  // Initialize player when video changes
  useEffect(() => {
    if (!isClient || (!currentVideoId && !currentPlaylistId) || !playerDivRef.current) return;
    
    if (lastMediaKeyRef.current === currentMediaKey && playerRef.current) return;
    
    let mounted = true;
    
    loadYouTubeAPI().then(() => {
      if (!mounted || !playerDivRef.current) return;
      
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
        playerRef.current = null;
      }
      
      // Clear the container
      playerDivRef.current.innerHTML = '';
      
      // Create inner div for player
      const innerDiv = document.createElement('div');
      innerDiv.style.cssText = 'width: 100%; height: 100%;';
      playerDivRef.current.appendChild(innerDiv);
      
      lastMediaKeyRef.current = currentMediaKey;
      
      const playerVars: any = { 
        autoplay: 1, 
        controls: 1, 
        modestbranding: 1, 
        rel: 0,
        origin: window.location.origin 
      };

      if (currentPlaylistId) {
        playerVars.listType = 'playlist';
        playerVars.list = currentPlaylistId;
      }

      playerRef.current = new window.YT.Player(innerDiv, {
        videoId: currentVideoId || '',
        playerVars,
        events: {
          onReady: (e) => {
            if (mounted) {
              setPlayerReady(true);
              e.target.setVolume(volume * 100);
              setDuration(e.target.getDuration());
            }
          },
          onStateChange: (e) => {
            if (!mounted) return;
            if (e.data === window.YT.PlayerState.PLAYING) {
              if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
              timeIntervalRef.current = setInterval(() => {
                if (playerRef.current) {
                  try { setCurrentTime(playerRef.current.getCurrentTime()); } catch (e) {}
                }
              }, 1000);
            } else if (timeIntervalRef.current) {
              clearInterval(timeIntervalRef.current);
              timeIntervalRef.current = null;
            }
          },
        },
      });
    });
    
    return () => {
      mounted = false;
      if (timeIntervalRef.current) { clearInterval(timeIntervalRef.current); timeIntervalRef.current = null; }
    };
  }, [isClient, currentVideoId, currentPlaylistId, currentMediaKey]);

  const updatePlayerPosition = useCallback(() => {
    if (!playerDivRef.current || !playerReady) return;
    
    const div = playerDivRef.current;
    
    if (playerMode === 'normal' && normalPlaceholderRef.current) {
      const rect = normalPlaceholderRef.current.getBoundingClientRect();
      div.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        z-index: 10000;
        border-radius: 12px;
        overflow: hidden;
        pointer-events: auto;
      `;
    } else if (playerMode === 'semi' && semiPlaceholderRef.current) {
      const rect = semiPlaceholderRef.current.getBoundingClientRect();
      div.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        z-index: 10000;
        border-radius: 0 0 12px 12px;
        overflow: hidden;
        pointer-events: auto;
      `;
    } else if (playerMode === 'mini') {
      div.style.cssText = `
        position: fixed;
        left: -9999px;
        width: 1px;
        height: 1px;
        z-index: 10000;
        pointer-events: none;
      `;
    }
  }, [playerMode, playerReady]);

  // Synchronise la position du lecteur avec le placeholder
  useEffect(() => {
    updatePlayerPosition();
    window.addEventListener('resize', updatePlayerPosition);
    window.addEventListener('scroll', updatePlayerPosition);
    return () => {
      window.removeEventListener('resize', updatePlayerPosition);
      window.removeEventListener('scroll', updatePlayerPosition);
    };
  }, [updatePlayerPosition, position, playerMode, playerReady]);

  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    try { isPlaying ? playerRef.current.playVideo() : playerRef.current.pauseVideo(); } catch (e) {}
  }, [isPlaying, playerReady]);

  useEffect(() => {
    if (playerReady && playerRef.current) try { playerRef.current.setVolume(volume * 100); } catch (e) {}
  }, [volume, playerReady]);

  const handleStop = useCallback(() => {
    if (playerRef.current) { try { playerRef.current.destroy(); } catch (e) {} playerRef.current = null; }
    lastMediaKeyRef.current = null;
    setPlayerReady(false);
    stopMedia();
  }, [stopMedia]);

  const handlePlayPause = useCallback(() => {
    isPlaying ? pauseMedia() : playMedia(currentMedia!);
  }, [isPlaying, pauseMedia, playMedia, currentMedia]);

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      try {
        if (isMuted) { playerRef.current.unMute(); setIsMuted(false); }
        else { playerRef.current.mute(); setIsMuted(true); }
      } catch (e) {}
    }
  }, [isMuted]);

  // Drag
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Éviter le drag si on clique sur des éléments interactifs (boutons, inputs, sliders, liens)
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('a') || 
      target.closest('[role="button"]') ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'A'
    ) {
      return;
    }
    
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY, posX: position.x, posY: position.y };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const width = playerMode === 'mini' ? 320 : 420;
      const height = playerMode === 'mini' ? 80 : 340;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - width, dragStartRef.current.posX + clientX - dragStartRef.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - height, dragStartRef.current.posY + clientY - dragStartRef.current.y)),
      });
    };
    const end = () => setIsDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end); window.removeEventListener('touchmove', move); window.removeEventListener('touchend', end); };
  }, [isDragging]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  if (!isClient || !currentMedia || (!currentVideoId && !currentPlaylistId)) return null;

  // ============================================
  // MINI MODE - Just UI, player is hidden
  // ============================================
  if (playerMode === 'mini') {
    return createPortal(
      <div 
        className="fixed z-[9998] select-none"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl w-80 cursor-grab active:cursor-grabbing">
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
            {thumbnail ? <img src={thumbnail} alt="" className="w-full h-full object-cover" /> : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                <Play className="w-5 h-5 text-white/50" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{currentMedia.title}</div>
            <div className="text-white/50 text-xs">{formatTime(currentTime)} / {formatTime(duration)}</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            {currentMedia.url && (
              <a 
                href={currentMedia.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-emerald-400 hover:bg-white/20 transition-colors"
                title="Ouvrir la source"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button onClick={(e) => { e.stopPropagation(); setPlayerMode('semi'); }} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleStop(); }} className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ============================================
  // SEMI MODE - UI + positioned player
  // ============================================
  if (playerMode === 'semi') {
    return createPortal(
      <div 
        className="fixed z-[9999] select-none"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="w-[420px]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/98 backdrop-blur-xl border border-white/10 border-b-0 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/60 truncate max-w-[200px]">{currentMedia.title}</span>
            </div>
            <div className="flex items-center gap-1">
              {currentMedia.url && (
                <a 
                  href={currentMedia.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-emerald-400 hover:bg-white/20 transition-colors"
                  title="Ouvrir la source"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button onClick={() => setPlayerMode('normal')} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setPlayerMode('mini')} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20">
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleStop} className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Video placeholder - actual video is positioned via CSS */}
          <div ref={semiPlaceholderRef} className="h-[236px] bg-black/50"></div>
          
          {/* Controls */}
          <div className="p-3 bg-slate-900/98 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="text-white/60 text-xs">{formatTime(currentTime)} / {formatTime(duration)}</div>
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer" />
                <button onClick={handlePlayPause} className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white hover:shadow-lg hover:shadow-emerald-500/30">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ============================================
  // NORMAL MODE - Bottom bar + positioned player
  // ============================================
  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-[9999]">
      <div className="bg-slate-900/98 backdrop-blur-xl border-t border-white/10 shadow-2xl">
        <div className="max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${currentMedia.type === 'audio' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                {currentMedia.type === 'audio' ? '🎧 Audio' : '▶ Vidéo'}
              </div>
              <div>
                <h3 className="text-white font-medium">{currentMedia.title}</h3>
                {currentMedia.author && <p className="text-white/50 text-sm">{currentMedia.author}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentMedia.url && (
                <a 
                  href={currentMedia.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-emerald-400 hover:bg-white/10 transition-colors"
                  title="Ouvrir la source"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
              <button onClick={() => setPlayerMode('semi')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
                <Minimize2 className="w-5 h-5" />
              </button>
              <button onClick={() => setPlayerMode('mini')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={handleStop} className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content - video placeholder */}
          <div className="flex items-center gap-4 p-4">
            <div ref={normalPlaceholderRef} className="w-[400px] h-[225px] rounded-xl overflow-hidden flex-shrink-0 bg-black/50"></div>
            
            <div className="flex-1">
              <div className="text-white/60 text-sm mb-2">{formatTime(currentTime)} / {formatTime(duration)}</div>
              <div className="flex items-center gap-4 mb-4">
                <button onClick={handlePlayPause} className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white hover:shadow-lg hover:shadow-emerald-500/30">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <div className="text-white/60 text-sm">{isPlaying ? 'Lecture en cours...' : 'En pause'}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-5 h-5 text-white/40" /> : <Volume2 className="w-5 h-5 text-white/40" />}
                </button>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-40 h-2 bg-white/20 rounded-full appearance-none cursor-pointer" />
                <span className="text-white/40 text-sm w-12">{Math.round(volume * 100)}%</span>
              </div>
              {currentMedia.description && <p className="text-white/40 text-sm mt-4 line-clamp-2">{currentMedia.description}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default GlobalPlayer;
