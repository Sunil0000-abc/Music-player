import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    songs: [
      {
        songId:    { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
        order:     { type: Number, required: true }, // drag and drop order
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Playlist", playlistSchema);