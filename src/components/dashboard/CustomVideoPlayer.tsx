import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward
} from "lucide-react";

interface CustomVideoPlayerProps {
  youtubeId: string;
  title?: string;
  onClose: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

const loadYTApi = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const first = document.getElementsByTagName("script")[0];
    first.parentNode?.insertBefore(tag, first);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const CustomVideoPlayer = ({ youtubeId, title, onClose }: CustomVideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [ready, setReady] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    loadYTApi().then(() => {
      if (!mounted) return;
      playerRef.current = new window.YT.Player("yt-player-embed", {
        videoId: youtubeId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            setDuration(e.target.getDuration());
            e.target.setVolume(80);
            e.target.playVideo();
            setReady(true);
          },
          onStateChange: (e: any) => {
            setPlaying(e.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    });

    return () => {
      mounted = false;
      playerRef.current?.destroy();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [youtubeId]);

  useEffect(() => {
    if (ready) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 250);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [ready]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const seek = (val: number[]) => {
    playerRef.current?.seekTo(val[0], true);
    setCurrentTime(val[0]);
  };

  const skip = (sec: number) => {
    if (!playerRef.current) return;
    const t = Math.max(0, Math.min(duration, playerRef.current.getCurrentTime() + sec));
    playerRef.current.seekTo(t, true);
  };

  const changeVolume = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    setMuted(v === 0);
    playerRef.current?.setVolume(v);
    if (v > 0) playerRef.current?.unMute();
  };

  const toggleMute = () => {
    if (muted) {
      playerRef.current?.unMute();
      playerRef.current?.setVolume(volume || 50);
      setMuted(false);
    } else {
      playerRef.current?.mute();
      setMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case " ": case "k": togglePlay(); break;
        case "ArrowLeft": skip(-10); break;
        case "ArrowRight": skip(10); break;
        case "m": toggleMute(); break;
        case "f": toggleFullscreen(); break;
        case "Escape": onClose(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playing, muted, volume, duration]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex flex-col select-none"
      onMouseMove={handleMouseMove}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Close button */}
      <div className={`absolute top-4 right-4 z-30 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Title */}
      {title && (
        <div className={`absolute top-4 left-4 z-30 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
          <h3 className="text-white font-semibold text-lg drop-shadow-lg">{title}</h3>
        </div>
      )}

      {/* Video area */}
      <div className="flex-1 relative flex items-center justify-center" onClick={togglePlay}>
        <div className="w-full h-full" style={{ pointerEvents: "none" }}>
          <div id="yt-player-embed" className="w-full h-full" />
        </div>
        {/* Center play/pause indicator */}
        {!playing && ready && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-4 px-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.5}
            onValueChange={seek}
            className="cursor-pointer [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-primary [&_.range]:bg-primary"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/10 h-10 w-10">
              {playing ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9">
              <SkipForward className="w-4 h-4" />
            </Button>

            {/* Volume */}
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9 ml-1">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <div className="w-20 hidden sm:block">
              <Slider value={[muted ? 0 : volume]} max={100} step={1} onValueChange={changeVolume}
                className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_.range]:bg-white" />
            </div>

            <span className="text-white/70 text-xs ml-2 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
