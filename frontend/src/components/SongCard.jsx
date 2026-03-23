import { useState, useEffect } from "react";
import AddToPlaylistModal from "./AddToPlaylistModal";
import { likeSong, unlikeSong } from "../api/songApi";

export default function SongCard({ song, index, onPlay, isPlaying, likedIds, onLikeChange }) {
  const [showModal, setShowModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    setLiked(likedIds?.includes(song._id) || false);
  }, [likedIds, song._id]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (likeLoading) return;

    try {
      setLikeLoading(true);
      if (liked) {
        await unlikeSong(song._id);
        setLiked(false);
        onLikeChange?.(song._id, false);
      } else {
        await likeSong(song._id);
        setLiked(true);
        onLikeChange?.(song._id, true);
      }
    } catch (err) {
      console.error("Like error:", err.response?.data?.error || err.message);
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "12px 16px",
          borderRadius: "12px",
          cursor: "pointer",
          background: isPlaying ? "var(--surface2)" : "transparent",
          border: isPlaying ? "1px solid var(--border)" : "1px solid transparent",
          marginBottom: "4px",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!isPlaying) e.currentTarget.style.background = "var(--surface)";
        }}
        onMouseLeave={(e) => {
          if (!isPlaying) e.currentTarget.style.background = "transparent";
        }}
      >
        {/* Index / Playing bars */}
        <div
          onClick={() => onPlay(song)}
          style={{
            width: "24px",
            textAlign: "center",
            fontSize: "13px",
            color: isPlaying ? "var(--accent)" : "var(--muted)",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          {isPlaying ? (
            <span style={{
              display: "flex",
              gap: "2px",
              alignItems: "flex-end",
              height: "16px",
            }}>
              {[8, 14, 10].map((h, i) => (
                <span key={i} style={{
                  width: "3px",
                  height: `${h}px`,
                  borderRadius: "2px",
                  background: "var(--accent)",
                  animation: "bars 0.8s ease infinite alternate",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </span>
          ) : (
            index + 1
          )}
        </div>

        {/* Thumbnail */}
        <img
          src={song.imageUrl}
          alt={song.songName}
          onClick={() => onPlay(song)}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "8px",
            objectFit: "cover",
            flexShrink: 0,
            cursor: "pointer",
          }}
        />

        {/* Info */}
        <div
          onClick={() => onPlay(song)}
          style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        >
          <p style={{
            fontSize: "14px",
            fontWeight: 500,
            color: isPlaying ? "var(--accent)" : "var(--text)",
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

        {/* Heart button */}
        <button
          onClick={handleLike}
          disabled={likeLoading}
          title={liked ? "Unlike" : "Like"}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: likeLoading ? "not-allowed" : "pointer",
            flexShrink: 0,
            padding: "4px",
            transition: "transform 0.15s",
            color: liked ? "#f76aae" : "var(--muted)",
            transform: likeLoading ? "scale(0.9)" : "scale(1)",
          }}
          onMouseEnter={(e) => {
            if (!likeLoading) e.currentTarget.style.transform = "scale(1.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {liked ? "♥" : "♡"}
        </button>

        {/* + Add to playlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          title="Add to playlist"
          style={{
            background: "none",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            fontSize: "18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.15s",
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--muted)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          +
        </button>
      </div>

      {showModal && (
        <AddToPlaylistModal
          song={song}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}