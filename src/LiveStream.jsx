import React from "react";

const LiveStream = () => {
  return (
    <section className="container">
      <h2 className="section-title">Live Stream</h2>
      <p className="subtle">Watch the livestream in real time.</p>

      <div className="live-grid fade-in">
        {/* Player */}
        <div className="player-wrapper player">
          <iframe
            id="player"
            src="https://embednow.top/embed/f1/2025/brazil/race"
            frameBorder="0"
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            scrolling="no"
            title="F1 Live Stream"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default LiveStream;
