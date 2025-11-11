import React, { useEffect, useRef, useState } from "react";
import Rankings from "./Rankings";
import AutoRaceStats from "./AutoRaceStats";
import UpcomingRaces from "./UpcomingRaces";
import LiveStream from "./LiveStream";

export default function Home() {
  const [soundOn, setSoundOn] = useState(false);
  const heroRef = useRef(null);
  const heroInnerRef = useRef(null);
  const trackRef = useRef(null);
  // const audioCtxRef = useRef(null)

  // Dynamic year
  const year = new Date().getFullYear();

  // IntersectionObserver fade-in
  useEffect(() => {
    const els = document.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Hero tilt interaction
  useEffect(() => {
    const hero = heroRef.current;
    const inner = heroInnerRef.current;
    if (!hero || !inner) return;

    const onMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      inner.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    };
    const onLeave = () => {
      inner.style.transform = "rotateY(0deg) rotateX(0deg)";
    };
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Carousel wheel horizontal scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }
    };
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, []);

  //   useEffect(() => {
  //     const hero = heroRef.current;
  //     if (!hero) return;
  //     const onEnter = () => playEngineRev();
  //     const onClick = () => playEngineRev();
  //     hero.addEventListener("mouseenter", onEnter);
  //     hero.addEventListener("click", onClick);
  //     return () => {
  //       hero.removeEventListener("mouseenter", onEnter);
  //       hero.removeEventListener("click", onClick);
  //     };
  //   }, [soundOn]);

  return (
    <div>
      {/* Hero */}
      <section
        id="home"
        className="hero"
        ref={heroRef}
        style={{ marginBottom: "2%" }}
      >
        <div className="slideshow">
          {/* Replace with your images */}
          <div
            className="slide"
            style={{ backgroundImage: "url('/img3.png')" }}
          ></div>
          <div
            className="slide"
            style={{ backgroundImage: "url('/img2.png')" }}
          ></div>
          <div
            className="slide"
            style={{ backgroundImage: "url('/img1.png')" }}
          ></div>
        </div>
        <div className="hero-inner container fade-in" ref={heroInnerRef}>
          <h1>Experience the Thrill of Formula 1</h1>
          <p>
            Live speed. Live strategy. Live drama. Catch real‑time updates and
            stream every heart‑pounding lap.
          </p>
          <div className="actions">
            <a href="#live" className="btn btn-red">
              Watch Live
            </a>
            <a href="#rankings" className="btn btn-dark">
              View Rankings
            </a>
            {/* <button
              className={`sound-toggle ${soundOn ? 'on' : ''}`}
              aria-pressed={soundOn ? 'true' : 'false'}
              onClick={()=>setSoundOn(s=>!s)}
              title={soundOn ? 'Sound: ON' : 'Sound: OFF'}
            >
              🔊
            </button> */}
          </div>
        </div>
      </section>

      {/* Rankings */}
      <Rankings />
      {/* Live Stream */}
      <section
        id="live"
        className="container"
        style={{ display: "grid", alignContent: "center", marginTop: "2%" }}
      >
        <LiveStream />
      </section>
      <section
        id="live"
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
      <section
        id="highlights"
        className="container"
        style={{ marginTop: "2%" }}
      >
        <h2 className="section-title">Highlights</h2>
        <p className="subtle">
          Scroll‑snap carousel with recap thumbnails and minimal play icon.
        </p>
        <div className="carousel fade-in">
          <div className="track" id="carouselTrack" ref={trackRef}>
            <article className="slide-card">
              <div className="thumb">
                <span className="play" aria-hidden="true"></span>
              </div>
              <div className="body">
                <strong>Race Recap — Monza</strong>
                <div style={{ opacity: 0.85 }}>3:42</div>
              </div>
            </article>
            <article className="slide-card">
              <div className="thumb">
                <span className="play" aria-hidden="true"></span>
              </div>
              <div className="body">
                <strong>Last‑lap Drama — Silverstone</strong>
                <div style={{ opacity: 0.85 }}>5:01</div>
              </div>
            </article>
            <article className="slide-card">
              <div className="thumb">
                <span className="play" aria-hidden="true"></span>
              </div>
              <div className="body">
                <strong>Under the Lights — Singapore</strong>
                <div style={{ opacity: 0.85 }}>4:15</div>
              </div>
            </article>
            <article className="slide-card">
              <div className="thumb">
                <span className="play" aria-hidden="true"></span>
              </div>
              <div className="body">
                <strong>Wheel‑to‑Wheel — Austin</strong>
                <div style={{ opacity: 0.85 }}>2:58</div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
