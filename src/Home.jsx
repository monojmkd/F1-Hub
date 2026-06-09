import React, { useEffect, useState, useRef } from "react";
import Rankings from "./Components/Rankings";
import AutoRaceStats from "./Components/AutoRaceStats";
import UpcomingRaces from "./Components/UpcomingRaces";
import LiveStream from "./Components/LiveStream";
import Highlights from "./Components/Highlights";
import LiveTrackMap from "./Components/LiveTrackMap";
import RaceWeekendHub from "./Components/RaceWeekendHub";

// ── RSS sources ───────────────────────────────────────────────
const RSS_SOURCES = [
  {
    name: "BBC Sport F1",
    url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
  },
  { name: "Autosport", url: "https://www.autosport.com/rss/f1/news/" },
  { name: "Sky Sports F1", url: "https://www.skysports.com/rss/12433" },
];

function proxyUrl(rssUrl) {
  return `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
}

function parseRSS(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, "text/xml");
  const items = Array.from(doc.querySelectorAll("item, entry"));
  return items
    .slice(0, 12)
    .map((item) => {
      const title = item.querySelector("title")?.textContent?.trim() || "";
      const linkEl = item.querySelector("link");
      const link =
        linkEl?.getAttribute("href") || linkEl?.textContent?.trim() || "#";
      const pubDate =
        item
          .querySelector("pubDate, published, updated")
          ?.textContent?.trim() || "";
      const desc =
        item
          .querySelector("description, summary")
          ?.textContent?.replace(/<[^>]+>/g, "")
          ?.trim()
          ?.slice(0, 110) || "";
      return { title, link, pubDate, desc };
    })
    .filter((a) => a.title && a.link !== "#");
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Collapsible News Bar ────────────────────────────────── */
function NewsBar() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onOutside(e) {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  useEffect(() => {
    async function fetchNews() {
      for (const src of RSS_SOURCES) {
        try {
          const res = await fetch(proxyUrl(src.url));
          if (!res.ok) continue;
          const json = await res.json();
          if (!json.contents) continue;
          const parsed = parseRSS(json.contents);
          if (!parsed.length) continue;
          setArticles(parsed);
          setSource(src.name);
          return;
        } catch {
          continue;
        }
      }
    }
    fetchNews().finally(() => setLoading(false));
  }, []);

  // Don't render at all if fetch failed
  if (!loading && !articles.length) return null;

  return (
    <div className="nb-wrap" ref={panelRef}>
      {/* ── Collapsed bar — always visible ── */}
      <button
        className={`nb-bar ${open ? "nb-bar--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle F1 news"
      >
        <span className="nb-bar__left">
          <span className="nb-bar__dot" />
          <span className="nb-bar__label">Latest F1 News</span>
          {source && <span className="nb-bar__source">{source}</span>}
        </span>

        {/* Scrolling headline preview when closed */}
        {!open && !loading && articles.length > 0 && (
          <span className="nb-bar__preview" aria-hidden="true">
            <span className="nb-bar__preview-inner">
              {/* Render twice so the loop is seamless — second set
                  picks up exactly where the first ends at -50% */}
              {[0, 1].map((copy) =>
                articles.slice(0, 6).map((a, i) => (
                  <span key={`${copy}-${i}`} className="nb-bar__preview-item">
                    <span className="nb-bar__preview-dot">●</span>
                    {a.title}
                  </span>
                )),
              )}
            </span>
          </span>
        )}

        {loading && <span className="nb-bar__loading">Loading news…</span>}

        <span
          className={`nb-bar__chevron ${open ? "nb-bar__chevron--up" : ""}`}
        >
          ▾
        </span>
      </button>

      {/* ── Expanded panel ── */}
      {open && (
        <div className="nb-panel">
          <div className="nb-panel__list">
            {articles.map((a, i) => (
              <a
                key={i}
                href={a.link}
                target="_blank"
                rel="noopener noreferrer"
                className="nb-article"
              >
                <span className="nb-article__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="nb-article__body">
                  <span className="nb-article__title">{a.title}</span>
                  {a.desc && (
                    <span className="nb-article__desc">{a.desc}…</span>
                  )}
                </div>
                <div className="nb-article__meta">
                  {a.pubDate && (
                    <span className="nb-article__age">
                      {timeAgo(a.pubDate)}
                    </span>
                  )}
                  <span className="nb-article__arrow">→</span>
                </div>
              </a>
            ))}
          </div>
          <div className="nb-panel__footer">
            {source} · {articles.length} articles
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Next Race Countdown Card ────────────────────────────── */
function NextRaceCard() {
  const [race, setRace] = useState(null);
  const [countdown, setCountdown] = useState({
    days: "--",
    hrs: "--",
    min: "--",
    sec: "--",
  });
  const timerRef = useRef(null);

  useEffect(() => {
    async function fetchNext() {
      try {
        const res = await fetch("https://api.jolpi.ca/ergast/f1/2026.json");
        const data = await res.json();
        const races = data?.MRData?.RaceTable?.Races || [];
        const now = new Date();
        const next = races.find(
          (r) => new Date(`${r.date}T${r.time || "00:00:00"}`) > now,
        );
        if (next) setRace(next);
      } catch (e) {
        console.error("NextRaceCard:", e);
      }
    }
    fetchNext();
  }, []);

  useEffect(() => {
    if (!race) return;
    function tick() {
      const target = new Date(`${race.date}T${race.time || "00:00:00"}`);
      const diff = target - new Date();
      if (diff <= 0) {
        setCountdown({ days: "00", hrs: "00", min: "00", sec: "00" });
        return;
      }
      const pad = (n) => String(Math.floor(n)).padStart(2, "0");
      setCountdown({
        days: pad(diff / 86400000),
        hrs: pad((diff % 86400000) / 3600000),
        min: pad((diff % 3600000) / 60000),
        sec: pad((diff % 60000) / 1000),
      });
    }
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [race]);

  if (!race) return null;

  const raceDate = new Date(`${race.date}T${race.time || "00:00:00"}`);
  const dateStr = raceDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = race.time
    ? raceDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : null;

  return (
    <div className="nrc-card">
      <div className="nrc-accent" />
      <div className="nrc-label">⚑ Next Race</div>
      <div className="nrc-round">Round {race.round}</div>
      <div className="nrc-name">{race.raceName}</div>
      <div className="nrc-circuit">{race.Circuit.circuitName}</div>
      <div className="nrc-location">
        {race.Circuit.Location.locality}, {race.Circuit.Location.country}
      </div>
      <div className="nrc-divider" />
      <div className="nrc-countdown">
        {[
          [countdown.days, "Days"],
          [countdown.hrs, "Hrs"],
          [countdown.min, "Min"],
          [countdown.sec, "Sec"],
        ].map(([val, lbl]) => (
          <div key={lbl} className="nrc-unit">
            <span className="nrc-num">{val}</span>
            <span className="nrc-lbl">{lbl}</span>
          </div>
        ))}
      </div>
      <div className="nrc-divider" />
      <div className="nrc-datetime">
        <span className="nrc-date-val">{dateStr}</span>
        {timeStr && <span className="nrc-time-val">{timeStr}</span>}
      </div>
      <a href="#schedule" className="nrc-cta">
        View Schedule →
      </a>
    </div>
  );
}

/* ── Home ────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section id="home" className="hero">
        <div className="slideshow">
          <div
            className="slide"
            style={{ backgroundImage: "url('/img5.png')" }}
          />
          <div
            className="slide"
            style={{ backgroundImage: "url('/img2.png')" }}
          />
          <div
            className="slide"
            style={{ backgroundImage: "url('/img1.png')" }}
          />
          <div
            className="slide"
            style={{ backgroundImage: "url('/img3.png')" }}
          />
          <div
            className="slide"
            style={{ backgroundImage: "url('/img4.png')" }}
          />
          <div
            className="slide"
            style={{ backgroundImage: "url('/img6.png')" }}
          />
        </div>

        <div className="hero-inner container">
          <div className="hero-eyebrow">
            Formula 1 · 2026 World Championship
          </div>
          <h1>
            Experience the
            <br />
            Thrill of
            <br />
            <span className="hero-accent">Formula 1</span>
          </h1>
          <p>
            Live speed. Live strategy. Live drama.
            <br />
            Catch real-time updates and stream every heart-pounding lap.
          </p>
          <div className="actions">
            <a href="#live" className="btn btn-red">
              ▶ Watch Live
            </a>
            <a href="#rankings" className="btn btn-dark">
              View Rankings
            </a>
          </div>
        </div>

        {/* next race card — right side of hero */}
        <NextRaceCard />

        <div className="hero-scroll-hint">
          <span className="hero-scroll-line" />
          <span className="hero-scroll-label">Scroll</span>
        </div>
      </section>

      {/* ── NEWS BAR — between hero and rankings ─────────────── */}
      <NewsBar />

      {/* ── RANKINGS ─────────────────────────────────────────── */}
      <section id="rankings" className="home-section container">
        <Rankings />
      </section>

      {/* ── LIVE TRACK MAP ───────────────────────────────────── */}
      {/* <section id="trackmap" className="home-section container">
        <LiveTrackMap />
      </section> */}

      <section id="rankings-page" className="home-section container">
        <RaceWeekendHub />
      </section>

      {/* ── LIVE STREAM ──────────────────────────────────────── */}
      <section id="live" className="home-section container">
        <LiveStream />
      </section>

      {/* ── LATEST RACE STATS ────────────────────────────────── */}
      <section
        id="stats"
        className="home-section home-section--narrow container"
      >
        <AutoRaceStats year={2026} />
      </section>

      {/* ── UPCOMING RACES ───────────────────────────────────── */}
      <section id="schedule" className="home-section container">
        <UpcomingRaces />
      </section>

      {/* ── HIGHLIGHTS ───────────────────────────────────────── */}
      <section id="highlights" className="home-section container">
        <Highlights />
      </section>
    </div>
  );
}
