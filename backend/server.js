const express = require("express");
const axios = require("axios");
const path = require("path");
const { google } = require("googleapis");
const OpenAI = require("openai");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

const DISCOGS_API_URL = "https://api.discogs.com/";
const {
  DISCOGS_CONSUMER_KEY,
  DISCOGS_CONSUMER_SECRET,
  YOUTUBE_API_KEY,
  OPENAI_API_KEY,
} = process.env;

const youtube = google.youtube({
  version: "v3",
  auth: YOUTUBE_API_KEY,
});

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

let cachedTrack = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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
        per_page: 100,
        page: 1,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error searching Discogs API:", error);
    throw error;
  }
};

// Function to search for a YouTube video
const searchYouTubeVideo = async (query) => {
  try {
    const response = await youtube.search.list({
      part: "snippet",
      q: query,
      maxResults: 1,
    });
    if (response.data.items.length === 0) {
      throw new Error("No video found for the query.");
    }
    return response.data.items[0];
  } catch (error) {
    console.error("Error searching YouTube API:", error);
    throw error;
  }
};

// Function to generate description using OpenAI
const generateDescription = async (artist, album, track) => {
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant that provides detailed and interesting descriptions for music.",
      },
      {
        role: "user",
        content: `Provide a detailed and interesting description for the following:\n\nArtist: ${artist}\nAlbum: ${album}\nTrack: ${track}`,
      },
    ];
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 150,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    if (error.response) {
      if (error.response.status === 429) {
        console.error(
          "Error generating description with OpenAI: Quota exceeded."
        );
      } else {
        console.error(
          "Error generating description with OpenAI:",
          error.response.data
        );
      }
    } else {
      console.error("Error generating description with OpenAI:", error.message);
    }
    throw error;
  }
};

const fetchValidTrack = async () => {
  let validTrack = null;
  while (!validTrack) {
    const tracks = await searchHipHopTracks();
    const trackOfTheDay = getRandomTrack(tracks);

    const trackDetailsResponse = await axios.get(trackOfTheDay.resource_url, {
      params: {
        key: DISCOGS_CONSUMER_KEY,
        secret: DISCOGS_CONSUMER_SECRET,
      },
    });

    const trackDetails = trackDetailsResponse.data;
    const query = `${trackDetails.title} ${trackDetails.artists_sort}`;

    try {
      const video = await searchYouTubeVideo(query);

      if (
        trackDetails.images &&
        trackDetails.images.length > 0 &&
        video.id.videoId
      ) {
        const description = await generateDescription(
          trackDetails.artists_sort,
          trackDetails.title,
          trackDetails.title
        );

        validTrack = {
          title: trackDetails.title,
          artist: trackDetails.artists_sort,
          albumArt: trackDetails.images[0].uri,
          albumArtBlurred: trackDetails.images[0].uri,
          videoId: video.id.videoId,
          resourceUrl: trackDetails.uri, // Using the correct URL
          description: description,
        };
      }
    } catch (error) {
      console.error("Error finding a valid track, retrying...", error.message);
    }
  }
  return validTrack;
};

// Endpoint to get the track of the day
app.get("/api/getSongOfTheDay", async (req, res) => {
  try {
    const now = Date.now();
    if (
      cachedTrack &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_DURATION
    ) {
      return res.json(cachedTrack);
    }

    const validTrack = await fetchValidTrack();
    cachedTrack = validTrack;
    cacheTimestamp = now;

    console.log("Track of the Day:", validTrack);
    res.json(validTrack);
  } catch (error) {
    res.status(500).send("Error fetching song data");
  }
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Serve the React frontend app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
