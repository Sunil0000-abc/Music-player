import { useEffect, useRef, useState } from "react";

export default function Player({ song, songs = [], onSongChange }) {
  const audioRef = useRef(null);
  const volumeBarRef = useRef(null);
  const isDraggingVolume = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const currentIndex = songs.findIndex((s) => s._id === song?._id);

  useEffect(() => {
    if (song && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [song]);

  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress((audio.currentTime / audio.duration) * 100 || 0);
    setCurrentTime(formatTime(audio.currentTime));
    setDuration(formatTime(audio.duration));
  };

  const handleProgressClick = (e) => {
    const bar = e.currentTarget;
    const ratio = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Volume drag handlers
  const applyVolume = (e) => {
    const bar = volumeBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.min(Math.max(ratio, 0), 1);
    setVolume(newVolume);
    setIsMuted(false);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const handleVolumeMouseDown = (e) => {
    isDraggingVolume.current = true;
    applyVolume(e);

    const onMouseMove = (e) => {
      if (isDraggingVolume.current) applyVolume(e);
    };

    const onMouseUp = () => {
      isDraggingVolume.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const playNext = () => {
    if (!songs.length) return;
    const nextIndex = (currentIndex + 1) % songs.length;
    onSongChange(songs[nextIndex]);
  };

  const playPrev = () => {
    if (!songs.length) return;
    if (audioRef.current?.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    onSongChange(songs[prevIndex]);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    playNext();
  };

  if (!song) return null;

  return (
    <div style={{
      gridColumn: "1 / 3",
      background: "var(--surface)",
      borderTop: "1px solid var(--border)",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      gap: "24px",
      height: "90px",
    }}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      >
        <source src={song.songUrl} type="audio/mpeg" />
      </audio>

      {/* Song info */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        width: "260px",
        flexShrink: 0,
      }}>
        <img
          src={song.imageUrl}
          alt={song.songName}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            objectFit: "cover",
          }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: "14px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {song.songName}
          </p>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
            {song.artist || "Unknown artist"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

          {/* Previous */}
          <button
            onClick={playPrev}
            style={{
              background: "none",
              border: "none",
              color: currentIndex > 0 ? "var(--text)" : "var(--muted)",
              fontSize: "18px",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
          >
            ⏮
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--text)",
              border: "none",
              color: "var(--bg)",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--text)"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            style={{
              background: "none",
              border: "none",
              color: currentIndex < songs.length - 1 ? "var(--text)" : "var(--muted)",
              fontSize: "18px",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
          >
            ⏭
          </button>

        </div>

        {/* Progress bar */}
        <div style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <span style={{
            fontSize: "11px",
            color: "var(--muted)",
            minWidth: "32px",
          }}>
            {currentTime}
          </span>

          <div
            onClick={handleProgressClick}
            style={{
              flex: 1,
              height: "4px",
              background: "var(--surface2)",
              borderRadius: "4px",
              cursor: "pointer",
              position: "relative",
            }}
          >
            {/* Progress fill */}
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--accent), var(--accent2))",
              borderRadius: "4px",
              transition: "width 0.1s",
              pointerEvents: "none",
            }} />

            {/* Progress thumb */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: `${progress}%`,
              transform: "translate(-50%, -50%)",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "var(--text)",
              boxShadow: "0 0 4px #0008",
              pointerEvents: "none",
              transition: "left 0.1s",
            }} />
          </div>

          <span style={{
            fontSize: "11px",
            color: "var(--muted)",
            minWidth: "32px",
            textAlign: "right",
          }}>
            {duration}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "180px",
        flexShrink: 0,
        justifyContent: "flex-end",
      }}>

        {/* Mute toggle */}
        <span
          onClick={toggleMute}
          style={{
            color: "var(--muted)",
            fontSize: "16px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
        </span>

        {/* Draggable volume bar */}
        <div
          ref={volumeBarRef}
          onMouseDown={handleVolumeMouseDown}
          style={{
            width: "90px",
            height: "4px",
            background: "var(--surface2)",
            borderRadius: "4px",
            cursor: "pointer",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {/* Volume fill */}
          <div style={{
            height: "100%",
            width: `${isMuted ? 0 : volume * 100}%`,
            background: "linear-gradient(90deg, var(--accent), var(--accent2))",
            borderRadius: "4px",
            pointerEvents: "none",
          }} />

          {/* Volume thumb */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: `${isMuted ? 0 : volume * 100}%`,
            transform: "translate(-50%, -50%)",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "var(--text)",
            boxShadow: "0 0 4px #0008",
            pointerEvents: "none",
          }} />
        </div>

        {/* Volume % */}
        <span style={{
          fontSize: "11px",
          color: "var(--muted)",
          minWidth: "28px",
          textAlign: "right",
          userSelect: "none",
        }}>
          {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
        </span>

      </div>
    </div>
  );
}