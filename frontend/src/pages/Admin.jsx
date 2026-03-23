import { useState } from "react";
import { uploadSong } from "../api/songApi";

export default function Admin() {
  const [form, setForm] = useState({ songName: "", artist: "" });
  const [songFile, setSongFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.songName || !songFile || !imageFile) {
      setMessage({ text: "Song name, audio and cover image are required.", error: true });
      return;
    }

    const formData = new FormData();
    formData.append("songName", form.songName);
    formData.append("artist", form.artist);
    formData.append("song", songFile);
    formData.append("image", imageFile);

    try {
      setLoading(true);
      await uploadSong(formData);
      setMessage({ text: "Song uploaded successfully!", error: false });
      setForm({ songName: "", artist: "" });
      setSongFile(null);
      setImageFile(null);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Upload failed.", error: true });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "14px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    color: "var(--muted)",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "480px",
        background: "var(--surface)",
        borderRadius: "20px",
        padding: "40px",
        border: "1px solid var(--border)",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "20px",
            marginBottom: "6px",
          }}>
            wave<span style={{ color: "var(--accent)" }}>.</span> Admin
          </p>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "6px",
          }}>
            Upload Song
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Add a new track to the music player.
          </p>
        </div>

        {message && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            background: message.error ? "#3a1a1a" : "#1a3a2a",
            color: message.error ? "#f87171" : "#4ade80",
            fontSize: "14px",
            border: `1px solid ${message.error ? "#f8717130" : "#4ade8030"}`,
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Song name *</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. Blinding Lights"
            value={form.songName}
            onChange={(e) => setForm({ ...form, songName: e.target.value })}
          />

          <label style={labelStyle}>Artist</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. The Weeknd"
            value={form.artist}
            onChange={(e) => setForm({ ...form, artist: e.target.value })}
          />

          <label style={labelStyle}>Audio file (.mp3) *</label>
          <input
            style={{ ...inputStyle, padding: "10px 16px" }}
            type="file"
            accept="audio/*"
            onChange={(e) => setSongFile(e.target.files[0])}
          />

          <label style={labelStyle}>Cover image *</label>
          <input
            style={{ ...inputStyle, padding: "10px 16px", marginBottom: "28px" }}
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: loading ? "var(--surface2)" : "var(--accent)",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 500,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Uploading..." : "Upload Song"}
          </button>
        </form>
      </div>
    </div>
  );
}