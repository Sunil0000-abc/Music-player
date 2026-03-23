import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getAllSongs = () => API.get("/songs");
export const searchSongs = (q) => API.get(`/songs/search?q=${q}`);
export const uploadSong = (formData) =>
  API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });


export const getAllPlaylists    = ()              => API.get("/get-playlists");
export const getPlaylist        = (id)            => API.get(`/playlist/${id}`);
export const createPlaylist     = (name)          => API.post("/playlist", { name });
export const deletePlaylist     = (id)            => API.delete(`/playlists/${id}`);
export const addSongToPlaylist  = (id, songId)    => API.post(`/playlists/${id}/songs`, { songId });
export const removeSongFromPlaylist = (id, songId) => API.delete(`/playlists/${id}/songs/${songId}`);
export const reorderPlaylist    = (id, songs)     => API.put(`/playlists/${id}/reorder`, { songs });
export const getLikedSongs      = ()              => API.get("/playlists/liked");
export const likeSong           = (songId)        => API.post("/playlists/liked/songs", { songId });
export const unlikeSong         = (songId)        => API.delete(`/playlists/liked/songs/${songId}`);  