import express from "express";
import Song from "../model/song.js";
import Playlist from "../model/playlist.js";
import { upload } from "../middleware/upload.js";
import { uploadToS3 } from "../utils/upload.js";
import { getCachedUrls } from "../utils/generatecashedUrl.js"
import os from "os"
const router = express.Router();

router.post(
  "/upload",
  upload.fields([
    { name: "song", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { songName, artist } = req.body;
      const songFile = req.files["song"]?.[0];
      const imageFile = req.files["image"]?.[0];

      if (!songName || !songFile || !imageFile) {
        return res.status(400).json({
          error: "songName, song file and image are all required",
        });
      }

      const [songKey, imageKey] = await Promise.all([
        uploadToS3(songFile, "songs"),
        uploadToS3(imageFile, "covers"),
      ]);

      const song = await Song.create({
        songName,
        artist: artist || "",
        songKey,
        imageKey,
      });

      res.status(201).json({
        message: "Song uploaded successfully",
        data: {
          _id: song._id,
          songName: song.songName,
          artist: song.artist,
          songKey: song.songKey,
          imageKey: song.imageKey,
        },
      });
    } catch (error) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

router.get("/songs", async (req, res) => {
  try {
    console.log("GET /api/songs hit"); // step 1

    const songs = await Song.find().sort({ createdAt: -1 });
    console.log("Songs from DB:", songs.length); // step 2

    const data = await Promise.all(
      songs.map(async (song) => {
        console.log("Processing song:", song.songName); // step 3
        const { songUrl, imageUrl } = await getCachedUrls(song);
        return {
          _id: song._id,
          songName: song.songName,
          artist: song.artist,
          songUrl,
          imageUrl,
        };
      })
    );

    res.status(200).json({ count: data.length, data });
  } catch (err) {
    console.error("GET /api/songs error:", err); // step 4
    res.status(500).json({ error: err.message });
  }
});

router.get("/songs/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Search query q is required" });
    }

    const songs = await Song.find({
      songName: { $regex: q.trim(), $options: "i" }, 
    }).sort({ createdAt: -1 });

    if (songs.length === 0) {
      return res.status(404).json({ message: "No songs found", data: [] });
    }

    const data = await Promise.all(
      songs.map(async (song) => {
        const { songUrl, imageUrl } = await getCachedUrls(song);
        return {
          _id: song._id,
          songName: song.songName,
          artist: song.artist,
          songUrl,
          imageUrl,
        };
      })
    );

    res.status(200).json({ count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new playlist
router.post("/playlist", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Playlist name is required" });
    }

    const playlist = await Playlist.create({ name: name.trim(), songs: [] });

    res.status(201).json({
      message: "Playlist created",
      data: playlist,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-playlists", async (req, res) => {
  try {
    const playlists = await Playlist.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: playlists.length,
      data: playlists,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/playlist/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Sort by order field
    const sortedSongs = [...playlist.songs].sort((a, b) => a.order - b.order);

    // Fetch full song details + presigned URLs
    const songsWithDetails = await Promise.all(
      sortedSongs.map(async ({ songId, order }) => {
        const song = await Song.findById(songId);
        if (!song) return null;
        const { songUrl, imageUrl } = await getCachedUrls(song);
        return {
          _id: song._id,
          songName: song.songName,
          artist: song.artist,
          songKey: song.songKey,
          imageKey: song.imageKey,
          songUrl,
          imageUrl,
          order,
        };
      })
    );

    res.status(200).json({
      data: {
        _id: playlist._id,
        name: playlist.name,
        createdAt: playlist.createdAt,
        songs: songsWithDetails.filter(Boolean),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/playlists/:id/songs", async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ error: "songId is required" });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Check duplicate
    const alreadyExists = playlist.songs.some(
      (s) => s.songId.toString() === songId
    );
    if (alreadyExists) {
      return res.status(400).json({ error: "Song already in playlist" });
    }

    // Add at end
    const order = playlist.songs.length;
    playlist.songs.push({ songId, order });
    await playlist.save();

    res.status(200).json({ message: "Song added to playlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id/songs/:songId", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Remove the song
    playlist.songs = playlist.songs.filter(
      (s) => s.songId.toString() !== req.params.songId
    );

    // Reindex order after removal
    playlist.songs = playlist.songs.map((s, i) => ({
      songId: s.songId,
      order: i,
    }));

    await playlist.save();

    res.status(200).json({ message: "Song removed from playlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/playlists/:id/reorder", async (req, res) => {
  try {
    const { songs } = req.body;

    if (!Array.isArray(songs)) {
      return res.status(400).json({ error: "songs must be an array" });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Update order
    playlist.songs = songs.map(({ songId, order }) => ({
      songId,
      order,
    }));

    await playlist.save();

    res.status(200).json({ message: "Playlist reordered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/playlists/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/playlists/liked ─────────────────────────────
// Get or create Liked Songs playlist automatically
router.get("/playlists/liked", async (req, res) => {
  try {
    let liked = await Playlist.findOne({ name: "Liked Songs" });

    // Create if doesn't exist
    if (!liked) {
      liked = await Playlist.create({ name: "Liked Songs", songs: [] });
    }

    const sortedSongs = [...liked.songs].sort((a, b) => a.order - b.order);

    const songsWithDetails = await Promise.all(
      sortedSongs.map(async ({ songId, order }) => {
        const song = await Song.findById(songId);
        if (!song) return null;
        const { songUrl, imageUrl } = await getCachedUrls(song);
        return {
          _id: song._id,
          songName: song.songName,
          artist: song.artist,
          songUrl,
          imageUrl,
          order,
        };
      })
    );

    res.status(200).json({
      data: {
        _id: liked._id,
        name: liked.name,
        songs: songsWithDetails.filter(Boolean),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/whoami",(req,res)=>{
  res.json({container: os.hostname()})
})
export default router;
