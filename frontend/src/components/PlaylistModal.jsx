import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getPlaylist, removeSongFromPlaylist, reorderPlaylist } from "../api/songApi";

// ─── Sortable Song Row ────────────────────────────────────
function SortableSongRow({ song, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 12px",
        borderRadius: "10px",
        background: isDragging ? "var(--surface2)" : "transparent",
        border: "1px solid transparent",
        marginBottom: "4px",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!isDragging) e.currentTarget.style.background = "var(--surface2)";
      }}
      onMouseLeave={(e) => {
        if (!isDragging) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          color: "var(--muted)",
          fontSize: "16px",
          cursor: "grab",
          padding: "4px",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        ⠿
      </div>

      {/* Thumbnail */}
      <img
        src={song.imageUrl}
        alt={song.songName}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "6px",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
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

      {/* Remove button */}
      <button
        onClick={() => onRemove(song._id)}
        style={{
          background: "none",
          border: "none",
          color: "var(--muted)",
          fontSize: "18px",
          cursor: "pointer",
          flexShrink: 0,
          lineHeight: 1,
          padding: "4px",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#f87171"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--muted)"}
        title="Remove from playlist"
      >
        ×
      </button>
    </div>
  );
}

// ─── Playlist Modal ───────────────────────────────────────
export default function PlaylistModal({ playlist, onClose, onDelete, onPlay }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchPlaylist();
  }, [playlist._id]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const res = await getPlaylist(playlist._id);
      setSongs(res.data.data.songs);
    } catch {
      setMessage({ text: "Failed to load playlist", error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (songId) => {
    try {
      await removeSongFromPlaylist(playlist._id, songId);
      setSongs((prev) => prev.filter((s) => s._id !== songId));
    } catch {
      setMessage({ text: "Failed to remove song", error: true });
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = songs.findIndex((s) => s._id === active.id);
    const newIndex = songs.findIndex((s) => s._id === over.id);

    // Reorder locally — instant UI update
    const reordered = arrayMove(songs, oldIndex, newIndex);
    setSongs(reordered);

    // Save to MongoDB
    try {
      await reorderPlaylist(
        playlist._id,
        reordered.map((s, i) => ({ songId: s._id, order: i }))
      );
    } catch {
      setMessage({ text: "Failed to save order", error: true });
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      onPlay(songs[0], songs);
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000aa",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          padding: "28px",
          width: "100%",
          maxWidth: "480px",
          border: "1px solid var(--border)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "4px",
            }}>
              {playlist.name}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>
              {songs.length} songs
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              fontSize: "22px",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "16px",
            background: message.error ? "#3a1a1a" : "#1a3a2a",
            color: message.error ? "#f87171" : "#4ade80",
            fontSize: "13px",
            flexShrink: 0,
          }}>
            {message.text}
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          flexShrink: 0,
        }}>
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              fontSize: "13px",
              cursor: songs.length === 0 ? "not-allowed" : "pointer",
              opacity: songs.length === 0 ? 0.5 : 1,
            }}
          >
            ▶ Play All
          </button>
          <button
            onClick={() => onDelete(playlist._id)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid #f8717150",
              color: "#f87171",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>

        {/* Divider */}
        <div style={{
          borderTop: "1px solid var(--border)",
          marginBottom: "16px",
          flexShrink: 0,
        }} />

        {/* Song list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "20px" }}>
              Loading...
            </p>
          ) : songs.length === 0 ? (
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "20px" }}>
              No songs yet. Add songs using the + button.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={songs.map((s) => s._id)}
                strategy={verticalListSortingStrategy}
              >
                {songs.map((song) => (
                  <SortableSongRow
                    key={song._id}
                    song={song}
                    onRemove={handleRemove}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}