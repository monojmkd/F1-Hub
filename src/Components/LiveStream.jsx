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
    name: "Server 3 (HLS)",
    type: "hls",
    // ⚠ Token-based — may expire. Refresh URL on race day.
    url: "https://lb7.strmd.st/secure/QfWkEsWMvvoPfArcksoIqheOmUeUEjmU/rtmp/stream/nwXumQye0RfVvM41xUgh2VeUAdQOIMLT23VTfqSUIeC1OA4CfPVdhz251_VIo09ffhFgHW_OtNKDLa8t60HMA2hVyIiTTz-cgYB9ODQ/1/playlist.m3u8",
  },
  {
    id: 4,
    name: "Server 4 (HLS)",
    type: "hls",
    // ⚠ Token-based — may expire. Refresh URL on race day.
    url: "https://lb4.strmd.st/secure/bYFYLLiNMXBxuhvmalYCbQAkOxBUAywN/rtmp/stream/rQvigtNC4ajn5ETJ7hFLZCU0ccGYRPfggtq7Lla8gDY7z4wQXBUylGc9QYJWdhsmS-pEkSD5Mp8/1/playlist.m3u8",
  },
  {
    id: 5,
    name: "Server 5 (Sky F1)",
    type: "iframe",
    url: "https://junkieembeds.pages.dev/embed/f1-fuck-you-sky",
  },
  {
    id: 6,
    name: "Server 6 ⚠ VPN",
    type: "iframe",
    url: "https://hamis.romponalis.st/premiumtv/daddy3.php?id=111",
  },
];

const LiveStream = () => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [active, setActive] = useState(null);
  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setLoading(true);
    if (!active) {
      setLoading(false);
      return;
    }

    if (active.type === "hls" && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(active.url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          videoRef.current.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, d) => {
          if (d.fatal) setLoading(false);
        });
        return () => {
          hls.destroy();
          hlsRef.current = null;
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
      </div>
    </section>
  );
};

export default LiveStream;
