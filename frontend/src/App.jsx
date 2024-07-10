import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [track, setTrack] = useState(null);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    axios
      .get("/api/getSongOfTheDay")
      .then((response) => {
        console.log("API Response:", response.data);
        setTrack(response.data);
      })
      .catch((error) => {
        console.error("Error fetching song data:", error);
        setError("Error fetching song data. Please try again later.");
      });
  }, []);

  return (
    <div className="content">
      {error && <div className="error-message">{error}</div>}
      {track && !error && (
        <>
          <div
            className="background"
            style={{ backgroundImage: `url(${track.albumArtBlurred})` }}
          ></div>
          <div className="main-content">
            <img src={track.albumArt} alt={track.title} className="album-art" />
            <div className="navigation">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="nav-button"
              >
                Info
              </button>
              <a
                href={`https://www.youtube.com/watch?v=${track.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-button"
              >
                Listen on YouTube
              </a>
              {/* Add Spotify link here */}
            </div>
            {showInfo && (
              <div className="info-box">
                <h3>{track.title}</h3>
                <p>
                  <strong>Artist:</strong> {track.artist}
                </p>
                <p>
                  <strong>Description:</strong> {track.description}
                </p>
                <p>
                  <strong>Resource URL:</strong>{" "}
                  <a
                    href={track.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    More Info
                  </a>
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
