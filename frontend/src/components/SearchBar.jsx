import { useState } from "react";

export default function SearchBar({ onSearch, onClear }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    val.trim() === "" ? onClear() : onSearch(val);
  };

  return (
    <div style={{ position: "relative", marginBottom: "32px" }}>
      <span style={{
        position: "absolute",
        left: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "var(--muted)",
        fontSize: "16px",
        pointerEvents: "none",
      }}>
        ⌕
      </span>
      <input
        type="text"
        placeholder="Search songs, artists..."
        value={query}
        onChange={handleChange}
        style={{
          width: "100%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          padding: "14px 20px 14px 46px",
          borderRadius: "14px",
          fontSize: "14px",
          transition: "all 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.background = "var(--surface2)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.background = "var(--surface)";
        }}
      />
    </div>
  );
}