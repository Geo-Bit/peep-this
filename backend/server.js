const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

const DISCOGS_API_URL = "https://api.discogs.com/";
const { DISCOGS_CONSUMER_KEY, DISCOGS_CONSUMER_SECRET } = process.env;

// Function to get a random track from the results
const getRandomTrack = (tracks) => {
  const randomIndex = Math.floor(Math.random() * tracks.length);
  return tracks[randomIndex];
};

// Function to search for hip hop tracks from the 80s and 90s
const searchHipHopTracks = async () => {
  try {
    const response = await axios.get(`${DISCOGS_API_URL}database/search`, {
      params: {
        key: DISCOGS_CONSUMER_KEY,
        secret: DISCOGS_CONSUMER_SECRET,
        genre: "Hip Hop",
        year: "1980-1999",
        type: "release",
        per_page: 100, // Number of results per page (max is 100)
        page: 1, // You can implement pagination if needed
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error searching Discogs API:", error);
    throw error;
  }
};

// Endpoint to get the track of the day
app.get("/api/getSongOfTheDay", async (req, res) => {
  try {
    const tracks = await searchHipHopTracks();
    const trackOfTheDay = getRandomTrack(tracks);

    // Fetch detailed information about the selected track
    const trackDetailsResponse = await axios.get(trackOfTheDay.resource_url, {
      params: {
        key: DISCOGS_CONSUMER_KEY,
        secret: DISCOGS_CONSUMER_SECRET,
      },
    });

    const trackDetails = trackDetailsResponse.data;

    res.json({
      title: trackDetails.title,
      artist: trackDetails.artists_sort,
      albumArt: trackDetails.images ? trackDetails.images[0].uri : null,
      albumArtBlurred: trackDetails.images ? trackDetails.images[0].uri : null,
      resourceUrl: trackDetails.resource_url,
    });
  } catch (error) {
    res.status(500).send("Error fetching song data");
  }
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

// Serve the React frontend app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
