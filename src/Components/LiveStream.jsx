import React, { useState } from "react";

const LiveStream = () => {
  const [locked, setLocked] = useState(true);
  return (
    <section id="live" className="live-section">
      <h2 className="section-title">Live Stream</h2>
      <p className="subtle">Watch the livestream in real time.</p>

      <div className="live-center">
        <div className="player-wrapper">
          <iframe
            id="player"
            src="https://embednow.top/embed/f1/2025/brazil/race"
            frameBorder="0"
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            scrolling="no"
            title="F1 Live Stream"
          ></iframe>
          {/* Invisible click-blocker overlay */}
          {locked && <div className="click-blocker"></div>}
        </div>
        <button className="toggle-lock-btn" onClick={() => setLocked(!locked)}>
          {locked ? "Unlock Player" : "Lock Player"}
        </button>
        <div className="server-switch">
          <button className="btn btn-red server-btn">Server 1</button>
          <button className="btn btn-dark server-btn">Server 2</button>
          <button className="btn btn-dark server-btn">Server 3</button>

          <select className="server-dropdown" defaultValue="Server 1">
            <option>Server 1</option>
            <option>Server 2</option>
            <option>Server 3</option>
          </select>
        </div>
      </div>
    </section>
  );
};

export default LiveStream;
