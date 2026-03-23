import SongCard from "./SongCard";

export default function SongList({ songs, onPlay, currentSong, likedIds, onLikeChange }) {
  if (!songs.length) {
    return (
      <p style={{
        color: "var(--muted)",
        textAlign: "center",
        marginTop: "60px",
      }}>
        No songs found.
      </p>
    );
  }

  return (
    <div>
      {songs.map((song, index) => (
        <SongCard
          key={song._id}
          song={song}
          index={index}
          onPlay={onPlay}
          isPlaying={currentSong?._id === song._id}
          likedIds={likedIds}
          onLikeChange={onLikeChange}
        />
      ))}
    </div>
  );
}