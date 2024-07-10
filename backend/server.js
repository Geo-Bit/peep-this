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

const RATE_LIMIT_DELAY = 60000; // 1 minute delay

// Function to get a random track from the results
const getRandomTrack = (tracks) => {
  const randomIndex = Math.floor(Math.random() * tracks.length);
  return tracks[randomIndex];
};

// Function to search for hip hop tracks from the 80s and 90s
const searchHipHopTracks = async (minHave, maxHave, page) => {
  try {
    const response = await axios.get(`${DISCOGS_API_URL}database/search`, {
      params: {
        key: DISCOGS_CONSUMER_KEY,
        secret: DISCOGS_CONSUMER_SECRET,
        genre: "Hip Hop",
        year: "1980-1999",
        type: "release",
        per_page: 100,
        page: page,
        min_have: minHave,
        max_have: maxHave,
      },
    });
    return response.data.results;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error(
        "Rate limit exceeded, waiting for a minute before retrying..."
      );
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      return searchHipHopTracks(minHave, maxHave, page); // Retry after delay
    }
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
  const minHave = 5 + Math.floor(Math.random() * 5); // Random min_have between 10 and 30
  const maxHave = 25 + Math.floor(Math.random() * 25); // Random max_have between 50 and 100
  const page = 1 + Math.floor(Math.random() * 10); // Random page between 1 and 10

  try {
    const tracks = await searchHipHopTracks(minHave, maxHave, page);

    if (tracks.length === 0) {
      throw new Error("No tracks found with the given criteria.");
    }

    for (let track of tracks) {
      try {
        const trackDetailsResponse = await axios.get(track.resource_url, {
          params: {
            key: DISCOGS_CONSUMER_KEY,
            secret: DISCOGS_CONSUMER_SECRET,
          },
        });

        const trackDetails = trackDetailsResponse.data;
        const query = `${trackDetails.title} ${trackDetails.artists_sort}`;

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

          return {
            title: trackDetails.title,
            artist: trackDetails.artists_sort,
            albumArt: trackDetails.images[0].uri,
            albumArtBlurred: trackDetails.images[0].uri,
            videoId: video.id.videoId,
            discogsUrl: trackDetails.uri, // Using the correct URL
            description: description,
          };
        }
      } catch (error) {
        console.warn(
          `Error processing track "${track.title}", trying next one...`,
          error.message
        );
      }
    }

    throw new Error("No valid tracks found after filtering.");
  } catch (error) {
    console.error("Error finding a valid track, retrying...", error.message);
    throw error;
  }
};

// Endpoint to get the track of the day
app.get("/api/getSongOfTheDay", async (req, res) => {
  try {
    const validTrack = await fetchValidTrack();
    console.log("Track of the Day:", validTrack);
    res.json(validTrack);
  } catch (error) {
    console.error("Error fetching song data:", error);
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
