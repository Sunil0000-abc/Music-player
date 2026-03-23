import { useEffect, useState } from "react";
import { getAllSongs, searchSongs, getLikedSongs } from "../api/songApi";
import Sidebar from "../components/SideBar";
import SearchBar from "../components/SearchBar";
import SongList from "../components/SongList";
import Player from "../components/Player";

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likedIds, setLikedIds] = useState([]);

  const fetchSongs = () => {
    setLoading(true);
    getAllSongs()
      .then((res) => {
        setSongs(res.data.data);
        setQueue(res.data.data);
      })
      .catch((err) => console.error("Fetch songs error:", err))
      .finally(() => setLoading(false));
  };

  // const fetchLikedIds = () => {
  //   getLikedSongs()
  //     .then((res) => {
  //       const ids = res.data.data.songs.map((s) => s._id);
  //       setLikedIds(ids);
  //     })
  //     .catch((err) => console.error("Fetch liked error:", err));
  // };

  const handleSearch = (q) => {
    searchSongs(q)
      .then((res) => setSongs(res.data.data))
      .catch(() => setSongs([]));
  };

  const handlePlay = (song) => {
    setCurrentSong(song);
    setQueue(songs);
  };

  const handlePlayPlaylist = (firstSong, playlistSongs) => {
    setCurrentSong(firstSong);
    setQueue(playlistSongs);
  };

  const handleLikeChange = (songId, isLiked) => {
    setLikedIds((prev) =>
      isLiked
        ? [...prev, songId]
        : prev.filter((id) => id !== songId)
    );
  };

  // useEffect(() => {
    
  //   fetchSongs();
  //   fetchLikedIds();
  // }, []);
  useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);

      const songsRes = await getAllSongs();
      setSongs(songsRes.data.data);
      setQueue(songsRes.data.data);

      const likedRes = await getLikedSongs();
      const ids = likedRes.data.data.songs.map((s) => s._id);
      setLikedIds(ids);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "240px 1fr",
      gridTemplateRows: "1fr 90px",
      height: "100vh",
    }}>

      <Sidebar onPlayPlaylist={handlePlayPlaylist} />

      {/* Main content */}
      <div style={{
        padding: "32px",
        overflowY: "auto",
        background: "var(--bg)",
      }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "26px",
            fontWeight: 700,
            marginBottom: "4px",
          }}>
            Discover
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            {songs.length} songs available
          </p>
        </div>

        {/* Search */}
        <SearchBar onSearch={handleSearch} onClear={fetchSongs} />

        {/* Featured — latest song */}
        {songs[0] && (
          <div
            onClick={() => handlePlay(songs[0])}
            style={{
              background: "linear-gradient(135deg, #2a1f6e, #1a1a2e)",
              borderRadius: "20px",
              padding: "28px",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow effect */}
            <div style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "180px",
              height: "180px",
              background: "radial-gradient(circle, #7c6af740, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* Album art */}
            <img
              src={songs[0].imageUrl}
              alt={songs[0].songName}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "14px",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />

            {/* Info */}
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: "11px",
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "6px",
              }}>
                Latest Upload
              </p>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "4px",
              }}>
                {songs[0].songName}
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                {songs[0].artist || "Unknown artist"}
              </p>
            </div>

            {/* Play button */}
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              flexShrink: 0,
            }}>
              ▶
            </div>
          </div>
        )}

        {/* All songs */}
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "18px",
          fontWeight: 700,
          marginBottom: "16px",
        }}>
          All Songs
        </h2>

        {loading ? (
          <p style={{
            color: "var(--muted)",
            textAlign: "center",
            marginTop: "60px",
          }}>
            Loading...
          </p>
        ) : (
          <SongList
            songs={songs}
            onPlay={handlePlay}
            currentSong={currentSong}
            likedIds={likedIds}
            onLikeChange={handleLikeChange}
          />
        )}
      </div>

      {/* Player */}
      <Player
        song={currentSong}
        songs={queue}
        onSongChange={(song) => setCurrentSong(song)}
      />

    </div>
  );
}