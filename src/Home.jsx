import React from "react";
import Rankings from "./Components/Rankings";
import AutoRaceStats from "./Components/AutoRaceStats";
import UpcomingRaces from "./Components/UpcomingRaces";
import LiveStream from "./Components/LiveStream";
import Highlights from "./Components/Highlights";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="hero" style={{ marginBottom: "2%" }}>
        <div className="slideshow">
          <div
            className="slide"
            style={{ backgroundImage: "url('/img5.png')" }}
          ></div>
          <div
            className="slide"
            style={{ backgroundImage: "url('/img2.png')" }}
          ></div>
          <div
            className="slide"
            style={{ backgroundImage: "url('/img1.png')" }}
          ></div>
          <div
            className="slide"
            style={{ backgroundImage: "url('/img3.png')" }}
          ></div>
          <div
            className="slide"
            style={{ backgroundImage: "url('/img4.png')" }}
          ></div>
          <div
            className="slide"
            style={{ backgroundImage: "url('/img6.png')" }}
          ></div>
        </div>

        {/* Text overlay */}
        <div className="hero-inner container">
          <h1>Experience the Thrill of Formula 1</h1>
          <p>
            Live speed. Live strategy. Live drama. Catch real-time updates and
            stream every heart-pounding lap.
          </p>

          <div className="actions">
            <a href="#live" className="btn btn-red">
              Watch Live
            </a>
            <a href="#rankings" className="btn btn-dark">
              View Rankings
            </a>
          </div>
        </div>
      </section>

      {/* Rankings - ADD ID HERE */}
      <section id="rankings" className="container" style={{ marginTop: "2%" }}>
        <Rankings />
      </section>

      <section
        id="live"
        className="container"
        style={{ display: "grid", alignContent: "center", marginTop: "2%" }}
      >
        <LiveStream />
      </section>

      {/* Auto Race Stats */}
      <section
        id="stats"
        className="container"
        style={{ marginTop: "2%", paddingLeft: "15%", paddingRight: "15%" }}
      >
        <AutoRaceStats year={2025} />
      </section>

      {/* Schedule */}
      <section id="schedule" className="container" style={{ marginTop: "2%" }}>
        <UpcomingRaces />
      </section>

      {/* Highlights */}
      <section id="highlights" style={{ marginTop: "2%" }}>
        <Highlights />
      </section>
    </div>
  );
}
