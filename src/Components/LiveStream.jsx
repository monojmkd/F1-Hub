import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
const streamSources = [
  {
    id: 1,
    name: "Server 1",
    type: "iframe",
    url: "https://hakunamatata5.org/sky-main-event/clean.html",
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
    url: "https://sportspass.fit/f1/f1streams.html",
  },
  {
    id: 4,
    name: "Server 4",
    type: "iframe",
    url: "https://streamfree.app/embed/racing/skyf1?server=origin&quality=1080p&category=racing",
  },
  {
    id: 5,
    name: "Server 5 (AppleTV)",
    type: "iframe",
    url: "https://junkieembeds.pages.dev/embed/f1-on-apple",
  },
  {
    id: 6,
    name: "Server 6 (Sky Sports 2)",
    type: "iframe",
    url: "https://junkieembeds.pages.dev/embed/f1-fuck-you-sky",
  },
];
const LiveStream = () => {
  const videoRef = useRef(null);
  const [active, setActive] = useState(null);
  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    if (!active) return;
    if (active.type === "hls" && videoRef.current) {
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
          {!active ? (
            <div className="stream-placeholder">
              <img src="/serverselect.png" alt="F1 Live Stream" />
              {/* <div className="placeholder-overlay">
                <h3>Formula 1 Live Stream</h3>
                <p>Select a server below to start watching</p>
              </div> */}
            </div>
          ) : active.type === "hls" ? (
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
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              scrolling="no"
              frameBorder="0"
            />
          )}
          <div className={`click-blocker ${locked ? "active" : ""}`} />
        </div>
        <div className="player-controls">
          <p>Unlock player to interact with player</p>
          <button className="lock-toggle" onClick={() => setLocked(!locked)}>
            {locked ? "Unlock Player" : "Lock Player"}
          </button>
        </div>
        <div className="server-switch">
          {streamSources.map((s) => (
            <button
              key={s.id}
              className={`server-btn ${active?.id === s.id ? "active" : ""}`}
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
        {/* {loading && <div className="stream-loading">⏳ Loading stream...</div>} */}
      </div>
    </section>
  );
};
export default LiveStream;
