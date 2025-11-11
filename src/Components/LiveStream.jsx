import React, { useState } from "react";

const LiveStream = () => {
  const [locked, setLocked] = useState(true);
  const [server, setServer] = useState(1);

  const sources = {
    1: "https://hakunamatata5.org/hakunamatata5.html",
    2: "https://embednow.top/embed/f1/2025/brazil/race",
    3: "https://embednow.top/embed/f1/2025/brazil/qualifying",
  };

  return (
    <section id="live" className="live-section">
      <h2 className="section-title">Live Stream</h2>
      <p className="subtle">Watch the livestream in real time.</p>

      <div className="live-center">
        <div className="player-wrapper">
          <iframe
            key={server} // forces proper iframe reload
            id="player"
            src={sources[server]}
            frameBorder="0"
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            scrolling="no"
            title="F1 Live Stream"
          ></iframe>

          {/* Invisible click blocker */}
          {locked && <div className="click-blocker"></div>}
        </div>

        <button className="toggle-lock-btn" onClick={() => setLocked(!locked)}>
          {locked ? "Unlock Player" : "Lock Player"}
        </button>

        <div className="server-switch">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              className={`server-btn ${server === num ? "active" : ""}`}
              onClick={() => setServer(num)}
            >
              Server {num}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveStream;
