import React, { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onEnter = () => playEngineRev();
    const onClick = () => playEngineRev();
    hero.addEventListener("mouseenter", onEnter);
    hero.addEventListener("click", onClick);
    return () => {
      hero.removeEventListener("mouseenter", onEnter);
      hero.removeEventListener("click", onClick);
    };
  }, [soundOn]);

  return (
    <div>
      {/* Hero */}
      <section id="home" className="hero" ref={heroRef}>
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
      <section id="rankings" className="container">
        <h2 className="section-title">Driver Rankings</h2>
        <p className="subtle">
          Table-style layout with alternating red/black glass rows. Replace with
          dynamic data later.
        </p>
        <div className="panel rankings fade-in">
          <table className="table" aria-label="F1 Driver Rankings">
            <thead>
              <tr>
                <th>Position</th>
                <th>Driver</th>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="badge">1</span>
                </td>
                <td>Max Placeholder</td>
                <td>Red Bull Placeholder</td>
                <td>402</td>
              </tr>
              <tr>
                <td>
                  <span className="badge">2</span>
                </td>
                <td>Lewis Placeholder</td>
                <td>Mercedes Placeholder</td>
                <td>366</td>
              </tr>
              <tr>
                <td>
                  <span className="badge">3</span>
                </td>
                <td>Charles Placeholder</td>
                <td>Ferrari Placeholder</td>
                <td>312</td>
              </tr>
              <tr>
                <td>
                  <span className="badge">4</span>
                </td>
                <td>Lando Placeholder</td>
                <td>McLaren Placeholder</td>
                <td>280</td>
              </tr>
              <tr>
                <td>
                  <span className="badge">5</span>
                </td>
                <td>Fernando Placeholder</td>
                <td>Aston Martin Placeholder</td>
                <td>210</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Live Stream */}
      <section id="live" className="container">
        <h2 className="section-title">Live Stream</h2>
        <p className="subtle">
          Embed your player in the black‑bordered area. Right panel shows lap
          count, race stats, and top 5 in real time.
        </p>
        <div className="live-grid fade-in">
          <div
            className="player"
            aria-label="Live streaming player placeholder"
          ></div>
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
          <aside className="stats" aria-label="Live race stats">
            <h4>Race Stats</h4>
            <div className="stat-grid">
              <div className="stat">
                <div>Lap</div>
                <strong>36 / 58</strong>
              </div>
              <div className="stat">
                <div>Track Temp</div>
                <strong>44°C</strong>
              </div>
              <div className="stat">
                <div>Safety Car</div>
                <strong>No</strong>
              </div>
              <div className="stat">
                <div>DRS</div>
                <strong>Enabled</strong>
              </div>
            </div>
            <h4>Top 5</h4>
            <ol className="top5">
              <li>
                <span>1. Max Placeholder</span> <strong>— +0.0s</strong>
              </li>
              <li>
                <span>2. Charles Placeholder</span> <strong>— +1.2s</strong>
              </li>
              <li>
                <span>3. Lando Placeholder</span> <strong>— +2.9s</strong>
              </li>
              <li>
                <span>4. Lewis Placeholder</span> <strong>— +5.1s</strong>
              </li>
              <li>
                <span>5. Fernando Placeholder</span> <strong>— +7.6s</strong>
              </li>
            </ol>
          </aside>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="container">
        <h2 className="section-title">Upcoming Races</h2>
        <p className="subtle">
          Grid cards with circuit image placeholder and date/time. Red hover
          glow effect.
        </p>
        <div className="cards fade-in">
          <article className="card">
            <div className="thumb"></div>
            <div className="body">
              <div className="badge-red">Round 1</div>
              <h3 style={{ margin: "10px 0 6px" }}>Bahrain Grand Prix</h3>
              <div style={{ opacity: 0.85 }}>Sakhir | Sun, 20:30 IST</div>
            </div>
          </article>
          <article className="card">
            <div className="thumb"></div>
            <div className="body">
              <div className="badge-red">Round 2</div>
              <h3 style={{ margin: "10px 0 6px" }}>Saudi Arabian Grand Prix</h3>
              <div style={{ opacity: 0.85 }}>Jeddah | Sat, 22:00 IST</div>
            </div>
          </article>
          <article className="card">
            <div className="thumb"></div>
            <div className="body">
              <div className="badge-red">Round 3</div>
              <h3 style={{ margin: "10px 0 6px" }}>Australian Grand Prix</h3>
              <div style={{ opacity: 0.85 }}>Melbourne | Sun, 05:30 IST</div>
            </div>
          </article>
          <article className="card">
            <div className="thumb"></div>
            <div className="body">
              <div className="badge-red">Round 4</div>
              <h3 style={{ margin: "10px 0 6px" }}>Japanese Grand Prix</h3>
              <div style={{ opacity: 0.85 }}>Suzuka | Sun, 08:30 IST</div>
            </div>
          </article>
        </div>
      </section>

      {/* Highlights */}
      <section id="highlights" className="container">
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
