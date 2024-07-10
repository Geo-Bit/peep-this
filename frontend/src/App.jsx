import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [track, setTrack] = useState(null);
  const [error, setError] = useState(null);

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
            <div className="album-art-container">
              <img
                src={track.albumArt}
                alt={track.title}
                className="album-art"
              />
              <div className="navigation">
                <a
                  href={`https://www.youtube.com/watch?v=${track.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-button"
                >
                  Listen on YouTube
                </a>
                <a
                  href={track.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-button"
                >
                  View on Discogs
                </a>
              </div>
            </div>
            <div className="info-box">
              <h3>{track.title}</h3>
              <p>
                <strong>Artist:</strong> {track.artist}
              </p>
              <p>
                <strong>Description:</strong> {track.description}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
