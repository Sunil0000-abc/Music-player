import { useEffect, useState } from "react";
import { getAllPlaylists, createPlaylist, addSongToPlaylist } from "../api/songApi";

export default function AddToPlaylistModal({ song, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await getAllPlaylists();
      setPlaylists(res.data.data);
    } catch {
      setMessage({ text: "Failed to load playlists", error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId, playlistName) => {
    try {
      await addSongToPlaylist(playlistId, song._id);
      setMessage({ text: `Added to "${playlistName}"`, error: false });
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add song";
      setMessage({ text: msg, error: true });
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newName.trim()) return;
    try {
      setCreating(true);
      const res = await createPlaylist(newName.trim());
      const playlist = res.data.data;
      setPlaylists((prev) => [playlist, ...prev]);
      setNewName("");
      await handleAddToPlaylist(playlist._id, playlist.name);
    } catch {
      setMessage({ text: "Failed to create playlist", error: true });
    } finally {
      setCreating(false);
    }
  };

  return (
    // Backdrop
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
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          padding: "28px",
          width: "100%",
          maxWidth: "400px",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
            }}>
              Add to Playlist
            </h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
              {song.songName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              fontSize: "20px",
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
          }}>
            {message.text}
          </div>
        )}

        {/* Create new playlist */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
        }}>
          <input
            type="text"
            placeholder="New playlist name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
            style={{
              flex: 1,
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
          <button
            onClick={handleCreateAndAdd}
            disabled={creating || !newName.trim()}
            style={{
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: creating || !newName.trim() ? "not-allowed" : "pointer",
              opacity: creating || !newName.trim() ? 0.5 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {creating ? "..." : "+ Create"}
          </button>
        </div>

        {/* Divider */}
        <div style={{
          borderTop: "1px solid var(--border)",
          marginBottom: "16px",
        }} />

        {/* Playlist list */}
        {loading ? (
          <p style={{ color: "var(--muted)", fontSize: "14px", textAlign: "center" }}>
            Loading playlists...
          </p>
        ) : playlists.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: "14px", textAlign: "center" }}>
            No playlists yet. Create one above.
          </p>
        ) : (
          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                onClick={() => handleAddToPlaylist(playlist._id, playlist.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "4px",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {/* Playlist icon */}
                <div style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "8px",
                  background: "var(--surface2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}>
                  ♪
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>
                    {playlist.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                    {playlist.songs?.length || 0} songs
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}