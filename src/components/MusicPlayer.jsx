import React, { useEffect, useRef, useState } from "react";

const MusicPlayer = () => {
  const playerRef = useRef(null);         // Reference to the div where YouTube player loads
  const playerInstance = useRef(null);    // YouTube Player instance reference
  const timerId = useRef(null);            // Interval timer for updating playback time

  const [input, setInput] = useState("");          // YouTube URL input
  const [isPlaying, setIsPlaying] = useState(false);  // Playback state
  const [volume, setVolume] = useState(50);         // Volume (0-100)
  const [duration, setDuration] = useState(0);      // Video duration (seconds)
  const [currentTime, setCurrentTime] = useState(0);// Current playback time (seconds)

  // Create YouTube player instance when API is ready and not yet created
  const createPlayer = () => {
    if (!window.YT || playerInstance.current) return; // Prevent duplicate creation or if API not loaded

    playerInstance.current = new window.YT.Player(playerRef.current, {
      height: "180",
      width: "320",
      playerVars: {
        modestbranding: 1, // Minimal YouTube branding
        controls: 0,       // Hide default controls, we use custom ones
        rel: 0,            // Don't show related videos at the end
        disablekb: 1,      // Disable keyboard controls
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
            startTimer();
          } else {
            stopTimer();
          }
        },
      },
    });
  };

  // Load YouTube API script and create player once ready
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    // Cleanup on unmount: clear timer, destroy player, remove API ready callback
    return () => {
      stopTimer();
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
      delete window.onYouTubeIframeAPIReady;
    };
  }, []);

  // Update currentTime and duration every second during playback
  const startTimer = () => {
    if (timerId.current) return;
    timerId.current = setInterval(() => {
      if (playerInstance.current && playerInstance.current.getCurrentTime) {
        setCurrentTime(playerInstance.current.getCurrentTime());
        setDuration(playerInstance.current.getDuration());
      }
    }, 1000);
  };

  // Stop the interval timer
  const stopTimer = () => {
    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
  };

  // Extract video ID from a YouTube URL using regex
  const extractVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  // Load video into player by ID, alert if invalid URL
  const loadVideo = () => {
    if (!playerInstance.current) return;
    const id = extractVideoId(input);
    if (id) {
      playerInstance.current.loadVideoById(id);
    } else {
      alert("Invalid YouTube URL");
    }
  };

  // Toggle play/pause state of player
  const togglePlayPause = () => {
    if (!playerInstance.current) return;
    if (isPlaying) {
      playerInstance.current.pauseVideo();
    } else {
      playerInstance.current.playVideo();
    }
  };

  // Adjust volume both in state and on player
  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (playerInstance.current) {
      playerInstance.current.setVolume(newVol);
    }
  };

  // Seek forward or backward by specified seconds
  const seekRelative = (seconds) => {
    if (!playerInstance.current) return;
    const current = playerInstance.current.getCurrentTime() || 0;
    const dur = playerInstance.current.getDuration() || 0;
    let newTime = current + seconds;
    newTime = Math.max(0, Math.min(newTime, dur)); // Clamp between 0 and duration
    playerInstance.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  return (
    <div className="music-player">
      {/* YouTube iframe player container */}
      <div ref={playerRef} id="ytplayer" style={{ marginBottom: 12 }}></div>

      {/* Input for entering YouTube video URL */}
      <input
        type="text"
        placeholder="Enter YouTube URL to play..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && loadVideo()}
        style={{ width: "100%", marginBottom: 10, padding: "8px" }}
      />

      {/* Playback controls */}
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
  );
};

export default MusicPlayer;