import React, { useEffect, useRef, useState } from "react";
import AlertModal from "./AlertModal"; // Adjust path as needed

const MusicPlayer = () => {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);
  const timerId = useRef(null);

  const [input, setInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Extract video ID from YouTube URL using regex
  const extractVideoId = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  // Create YouTube player instance
  const createPlayer = () => {
    if (!window.YT || playerInstance.current) return;

    playerInstance.current = new window.YT.Player(playerRef.current, {
      height: "180",
      width: "320",
      playerVars: {
        modestbranding: 1,
        controls: 0,
        rel: 0,
        disablekb: 1,
      },
      events: {
        onReady: (event) => {
          event.target.setVolume(volume);
          setDuration(event.target.getDuration() || 0);
        },
        onStateChange: (event) => {
          const state = event.data;
          setIsPlaying(state === window.YT.PlayerState.PLAYING);

          if (state === window.YT.PlayerState.PLAYING) {
            const title = playerInstance.current.getVideoData()?.title;
            if (title) document.title = title;
            startTimer();
          } else {
            stopTimer();
          }
        },
      },
    });
  };

  // Load YouTube API script and initialize player
  useEffect(() => {
    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    return () => {
      stopTimer();
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
      delete window.onYouTubeIframeAPIReady;
    };
  }, []);

  // Timer to update currentTime and duration every second while playing
  const startTimer = () => {
    if (timerId.current) return;
    timerId.current = setInterval(() => {
      if (playerInstance.current?.getCurrentTime) {
        setCurrentTime(playerInstance.current.getCurrentTime());
        setDuration(playerInstance.current.getDuration());
      }
    }, 1000);
  };

  // Stop the playback timer
  const stopTimer = () => {
    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
  };

  // Load video by ID or show modal invalid URL message
  const loadVideo = () => {
    if (!playerInstance.current) return;
    const id = extractVideoId(input.trim());
    if (id) {
      playerInstance.current.loadVideoById(id);
    } else {
      setModalMessage("Invalid YouTube URL");
      setModalOpen(true);
    }
  };

  // Play or pause video toggle
  const togglePlayPause = () => {
    if (!playerInstance.current) return;
    if (isPlaying) {
      playerInstance.current.pauseVideo();
    } else {
      playerInstance.current.playVideo();
    }
  };

  // Update volume in state and player
  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (playerInstance.current) {
      playerInstance.current.setVolume(newVol);
    }
  };

  // Seek forward/backward by seconds, clamped to [0, duration]
  const seekRelative = (seconds) => {
    if (!playerInstance.current) return;
    const current = playerInstance.current.getCurrentTime() || 0;
    const dur = playerInstance.current.getDuration() || 0;
    const newTime = Math.min(Math.max(current + seconds, 0), dur);
    playerInstance.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  return (
    <>
      <div className="music-player">
        <div ref={playerRef} id="ytplayer" style={{ marginBottom: 12 }}></div>

        <input
          type="text"
          placeholder="Enter YouTube URL to play..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadVideo()}
          style={{ width: "100%", marginBottom: 10, padding: "8px" }}
        />

        <div
          className="music-controls"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <button
            className="skip-btn"
            onClick={() => seekRelative(-10)}
            title="Rewind 10 seconds"
          >
            ⏪
          </button>

          <button
            className="play-pause-btn"
            onClick={togglePlayPause}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            className="skip-btn"
            onClick={() => seekRelative(10)}
            title="Fast-forward 10 seconds"
          >
            ⏩
          </button>

          <button onClick={loadVideo} style={{ padding: "6px 12px" }}>
            Load
          </button>

          <p style={{ marginLeft: "12px" }}>Vol:</p>

          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            title="Volume"
            style={{ flexGrow: 1 }}
          />
        </div>
      </div>

      {modalOpen && (
        <AlertModal
          message={modalMessage}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default MusicPlayer;
