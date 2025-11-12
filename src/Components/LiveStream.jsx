import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const streamSources = [
  // update/create as you like
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

  // init hls only when active.type === 'hls'
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
      // iframe mode - mark loaded (we can't detect internal load reliably for cross-origin)
      // small delay to let iframe settle visually
      setTimeout(() => setLoading(false), 600);
    }
  }, [active]);

  // Determine wrapper height class based on source type
  const wrapperModeClass =
    active?.type === "iframe" ? "iframeTall" : "hlsNormal";

  return (
    <section id="live" className="live-section">
      <h2 className="section-title">Live Stream</h2>
      <p className="subtle">
        Choose a server — unlock to interact with the player.
      </p>

      <div className="live-container">
        {/* player wrapper uses explicit responsive height */}
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
              // remove sandbox only if it breaks playback — you can re-add if needed
            />
          )}
        </div>
        {/* absolute-positioned unlock button to avoid being pushed */}
        <div className="player-controls">
          <button className="lock-toggle" onClick={() => setLocked(!locked)}>
            {locked ? "Unlock Player" : "Lock Player"}
          </button>
        </div>

        {/* click blocker overlay (covers iframe/video to prevent accidental clicks) */}
        {locked && (
          <div
            className="click-blocker"
            title="Click unlock to enable player"
          />
        )}
        {/* server buttons */}
        <div className="server-switch">
          {streamSources.map((s) => (
            <button
              key={s.id}
              className={`server-btn ${active.id === s.id ? "active" : ""}`}
              onClick={() => {
                setLoading(true);
                setActive(s);
                // small delay to reset loading for iframe
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
