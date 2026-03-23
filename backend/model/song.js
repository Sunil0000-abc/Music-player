import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    songName:     { type: String, required: true },
    artist:       { type: String, default: "" },
    songKey:      { type: String, required: true }, // e.g. "songs/abc123.mp3"
    imageKey:     { type: String, required: true }, // e.g. "covers/abc123.jpg"

    // Cached presigned URLs
    songUrl:      { type: String, default: "" },
    imageUrl:     { type: String, default: "" },
    urlExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Song", songSchema);