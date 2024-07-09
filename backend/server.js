const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 6000;

app.use(express.static(path.join(__dirname, "..", "frontend", "build")));

app.get("/api/getSongOfTheDay", async (req, res) => {
  try {
    const trackData = await axios.get("YOUR_API_URL_FOR_TRACK_DATA");
    const videoData = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${trackData.title}&key=YOUR_YOUTUBE_API_KEY`
    );
    const videoId = videoData.data.items[0].id.videoId;

    res.json({
      title: trackData.title,
      artist: trackData.artist,
      albumArt: trackData.albumArt,
      albumArtBlurred: trackData.albumArtBlurred,
      videoId: videoId,
    });
  } catch (error) {
    res.status(500).send("Error fetching song data");
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
