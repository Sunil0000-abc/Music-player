import { useEffect, useState } from "react";
import { getAllPlaylists, deletePlaylist } from "../api/songApi";
import PlaylistModal from "./PlaylistModal";

export default function Sidebar({ onPlayPlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const fetchPlaylists = () => {
    getAllPlaylists()
      .then((res) => setPlaylists(res.data.data))
      .catch(() => console.error("Failed to fetch playlists"));
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleDelete = (playlistId) => {
    deletePlaylist(playlistId)
      .then(() => {
        setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
        setSelectedPlaylist(null);
      })
      .catch(() => console.error("Failed to delete playlist"));
  };

  return (
    <>
      <div style={{
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "28px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "22px",
          letterSpacing: "-0.5px",
          flexShrink: 0,
        }}>
          wave<span style={{ color: "var(--accent)" }}>.</span>
        </div>

        {/* Menu */}
        <div>
          <p style={{
            fontSize: "11px",
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: "10px",
          }}>
            Menu
          </p>
          {[
            { icon: "⊞", label: "Discover", active: true },
            { icon: "♡", label: "Liked Songs" },
            { icon: "⊕", label: "Recently Played" },
          ].map(({ icon, label, active }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                fontSize: "14px",
                color: active ? "var(--accent)" : "var(--muted)",
                background: active ? "var(--surface2)" : "transparent",
                cursor: "pointer",
                marginBottom: "2px",
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
              {active && (
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  marginLeft: "auto",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Playlists */}
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: "11px",
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: "10px",
          }}>
            Playlists
          </p>

          {playlists.length === 0 ? (
            <p style={{
              fontSize: "13px",
              color: "var(--muted)",
              padding: "4px 12px",
            }}>
              No playlists yet.
            </p>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist._id}
                onClick={() => setSelectedPlaylist(playlist)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "var(--muted)",
                  cursor: "pointer",
                  marginBottom: "2px",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface2)";
                  e.currentTarget.style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--muted)";
                }}
              >
                <span style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "var(--surface2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  flexShrink: 0,
                }}>
                  ♪
                </span>
                <span style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1,
                }}>
                  {playlist.name}
                </span>
                <span style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  flexShrink: 0,
                }}>
                  {playlist.songs?.length || 0}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Playlist modal */}
      {selectedPlaylist && (
        <PlaylistModal
          playlist={selectedPlaylist}
          onClose={() => setSelectedPlaylist(null)}
          onDelete={handleDelete}
          onPlay={(firstSong, songs) => {
            onPlayPlaylist(firstSong, songs);
            setSelectedPlaylist(null);
          }}
        />
      )}
    </>
  );
}