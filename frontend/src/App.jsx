import React, { useEffect, useState } from "react";
import axios from "axios";
import YouTube from "react-youtube";
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

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 1,
      controls: 0, // Hide YouTube controls
      enablejsapi: 1,
    },
  };

  return (
    <div className="content">
      {error && <div className="error-message">{error}</div>}
      {track && !error && (
        <>
          <div
            className="background"
            style={{ backgroundImage: `url(${track.albumArtBlurred})` }}
          ></div>
          <div className="video-container">
            <img
              src={track.albumArt}
              alt={track.title}
              className="mx-auto mb-4"
            />
            <YouTube videoId={track.videoId} opts={opts} />
            <div className="controls mt-4">
              <button
                onClick={() =>
                  document
                    .querySelector("iframe")
                    .contentWindow.postMessage(
                      '{"event":"command","func":"playVideo","args":""}',
                      "*"
                    )
                }
                className="control-button"
              >
                Play
              </button>
              <button
                onClick={() =>
                  document
                    .querySelector("iframe")
                    .contentWindow.postMessage(
                      '{"event":"command","func":"pauseVideo","args":""}',
                      "*"
                    )
                }
                className="control-button"
              >
                Pause
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="control-button"
              >
                Info
              </button>
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
