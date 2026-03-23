import { useState } from "react";
import { uploadSong } from "../api/songApi";

export default function UploadForm({ onUploadSuccess }) {
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [songFile, setSongFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!songName || !songFile || !imageFile) {
      setMessage("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("songName", songName);
    formData.append("artist", artist);
    formData.append("song", songFile);
    formData.append("image", imageFile);

    try {
      setLoading(true);
      await uploadSong(formData);
      setMessage("Song uploaded successfully!");
      setSongName("");
      setArtist("");
      setSongFile(null);
      setImageFile(null);
      onUploadSuccess(); // refresh song list
    } catch (err) {
      setMessage(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Song</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Song name"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Artist (optional)"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Song file (.mp3)</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setSongFile(e.target.files[0])}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Cover image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}