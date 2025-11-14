import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const streamSources = [
  {
    id: 1,
    name: "Server 1",
    type: "iframe",
    url: "https://hakunamatata5.org/hakunamatata5.html",
  },
  {
    id: 2,
    name: "Server 2 (HLS)",
    type: "hls",
    url: "https://amg12058-c15studio-amg12058c1-lg-us-5787.playouts.now.amagi.tv/playlist720p.m3u8",
  },
  {
    id: 3,
    name: "Server 3",
    type: "iframe",
    url: "https://embednow.top/embed/f1/2025/brazil/race",
  },
];

const LiveStream = () => {
  const videoRef = useRef(null);
  const [active, setActive] = useState(streamSources[0]);
  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!active) return;

    if (active.type === "hls" && videoRef.current) {
      // init hls.js
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(active.url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          videoRef.current.play().catch(() => {});
        });
        return () => {
          hls.destroy();
        };
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = active.url;
        setLoading(false);
      } else {
        setLoading(false);
      }
    } else {
      setTimeout(() => setLoading(false), 600);
    }
  }, [active]);

  const wrapperModeClass =
    active?.type === "iframe" ? "iframeTall" : "hlsNormal";

  return (
    <section className="live-section">
      <h2 className="section-title">Live Stream</h2>
      <p className="subtle">
        Choose a server — unlock to interact with the player.
      </p>

      <div className="live-container">
        <div className={`player-wrapper ${wrapperModeClass}`}>
          {active.type === "hls" ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              className="live-player"
            />
          ) : (
            <iframe
              key={active.id}
              src={active.url}
              title={`live-${active.id}`}
              className="live-iframe"
              allow="encrypted-media; picture-in-picture"
              allowFullScreen
              scrolling="no"
              frameBorder="0"
            />
          )}
          {/* click blocker overlay (covers iframe/video to prevent accidental clicks) */}
          <div className={`click-blocker ${locked ? "active" : ""}`} />
        </div>

        {/* absolute-positioned unlock button to avoid being pushed */}
        <div className="player-controls">
          <p>Unlock player to interact with player</p>
          <button className="lock-toggle" onClick={() => setLocked(!locked)}>
            {locked ? "Unlock Player" : "Lock Player"}
          </button>
        </div>

        {/* server buttons */}
        <div className="server-switch">
          {streamSources.map((s) => (
            <button
              key={s.id}
              className={`server-btn ${active.id === s.id ? "active" : ""}`}
              onClick={() => {
                setLoading(true);
                setActive(s);
                setTimeout(() => setLoading(false), 700);
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        {loading && <div className="stream-loading">⏳ Loading stream...</div>}
      </div>
    </section>
  );
};

export default LiveStream;
