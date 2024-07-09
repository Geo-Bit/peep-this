import React, { useEffect, useState } from "react";
import axios from "axios";
import YouTube from "react-youtube";
import "./App.css";

const App = () => {
  const [track, setTrack] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/api/getSongOfTheDay")
      .then((response) => setTrack(response.data))
      .catch((error) => {
        console.error("Error fetching song data:", error);
        setError("Error fetching song data. Please try again later.");
      });
  }, []);

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover"
      style={{ backgroundImage: `url(${track?.albumArtBlurred})` }}
    >
      {error && <div className="error-message">{error}</div>}
      {track && !error && (
        <div className="text-center">
          <img
            src={track.albumArt}
            alt={track.title}
            className="mx-auto mb-4"
          />
          <YouTube
            videoId={track.videoId}
            opts={{ playerVars: { autoplay: 1 } }}
            onError={(e) =>
              setError("Error playing video. Please try again later.")
            }
          />
          <div className="controls mt-4">
            <button>Play</button>
            <button>Pause</button>
            <button onClick={() => alert(`More info about ${track.artist}`)}>
              Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
