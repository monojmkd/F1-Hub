import React, { useRef, useEffect, useState } from "react";

// ── Config ────────────────────────────────────────────────────
const F1_CHANNEL_ID = "UCB_qr75-ydFVKSF9Dmo6izg";

// We fetch the YouTube Atom/RSS feed through allorigins.win — a free, reliable
// CORS proxy that returns { contents: "<xml>..." }.
// No API key, no sign-up, no rate-limit issues like rss2json.
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${F1_CHANNEL_ID}`;
const API_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`;

// Filter: only show videos whose title contains one of these (case-insensitive)
const HIGHLIGHT_KEYWORDS = [
  "race highlights",
  "highlights",
  "race recap",
  "extended highlights",
  "grand prix highlights",
];

// Shown if fetch/parse fails completely
const FALLBACK_VIDEOS = [
  {
    videoId: "MK83clSv6-k",
    title: "Race Highlights | 2025 Sao Paulo Grand Prix",
    published: "2025",
  },
  {
    videoId: "hTqxfkWRimk",
    title: "Race Highlights | 2025 Mexico City Grand Prix",
    published: "2025",
  },
  {
    videoId: "CdKwc1bC44c",
    title: "Race Highlights | 2025 United States Grand Prix",
    published: "2025",
  },
  {
    videoId: "XZhXFbFCOu4",
    title: "Race Highlights | 2025 Singapore Grand Prix",
    published: "2025",
  },
  {
    videoId: "JntKOmbMI08",
    title: "Race Highlights | 2025 Azerbaijan Grand Prix",
    published: "2025",
  },
  {
    videoId: "kGMp1Byuwto",
    title: "Race Highlights | 2025 Italian Grand Prix",
    published: "2025",
  },
];

// ── Helpers ───────────────────────────────────────────────────
function isHighlight(title = "") {
  const t = title.toLowerCase();
  return HIGHLIGHT_KEYWORDS.some((kw) => t.includes(kw));
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// Parse the Atom XML string YouTube returns into plain video objects.
// Uses the browser's built-in DOMParser — no external library needed.
function parseAtomFeed(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, "text/xml");
  const entries = Array.from(doc.querySelectorAll("entry"));

  return entries
    .map((entry) => {
      // <yt:videoId> is the most reliable source; fall back to parsing the link href
      const videoId =
        entry.querySelector("videoId")?.textContent ||
        entry
          .querySelector("link")
          ?.getAttribute("href")
          ?.match(/v=([a-zA-Z0-9_-]{11})/)?.[1] ||
        null;

      const title = entry.querySelector("title")?.textContent || "";
      const published = entry.querySelector("published")?.textContent || "";

      // YouTube puts the HQ thumbnail inside <media:thumbnail url="...">
      const thumbnail = videoId
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : entry.querySelector("thumbnail")?.getAttribute("url") || "";

      return { videoId, title, published, thumbnail };
    })
    .filter((v) => v.videoId); // drop any entry without a valid video ID
}

// ── Component ─────────────────────────────────────────────────
const Highlights = () => {
  const carouselRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchHighlights() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!json.contents) throw new Error("Empty response from proxy");

        let parsed = parseAtomFeed(json.contents);
        if (!parsed.length) throw new Error("No entries in feed");

        // Prefer highlight videos; if none match keywords show all recent uploads
        const highlights = parsed.filter((v) => isHighlight(v.title));
        const finalList = highlights.length ? highlights : parsed;

        setVideos(
          finalList.slice(0, 10).map((v) => ({
            ...v,
            published: v.published ? timeAgo(v.published) : "Recent",
            channel: "FORMULA 1",
          })),
        );
        setIsLive(true);
      } catch (err) {
        console.warn(
          "Highlights: live feed failed, using fallback.",
          err.message,
        );
        setVideos(
          FALLBACK_VIDEOS.map((v) => ({
            ...v,
            thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
            channel: "FORMULA 1",
          })),
        );
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    }

    fetchHighlights();
  }, []);

  const scrollLeft = () =>
    carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () =>
    carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  return (
    <section className="container">
      <div className="hl-header">
        <div>
          <h2 className="section-title">F1 Highlights</h2>
          <p className="subtle subtle--flush">
            {loading
              ? "Loading latest highlights…"
              : isLive
                ? `Latest from the official F1 channel · ${videos.length} videos`
                : "Showing cached highlights · Live feed unavailable"}
          </p>
        </div>

        {!loading && isLive && (
          <div className="hl-live-badge">
            <span className="hl-live-dot" />
            Live Feed
          </div>
        )}
      </div>

      {/* Skeleton while loading */}
      {loading ? (
        <div className="carousel">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card shimmer" />
          ))}
        </div>
      ) : (
        <div className="carousel-wrapper">
          <button
            className="carousel-btn left"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            ◀
          </button>

          <div className="carousel" ref={carouselRef}>
            {videos.map((video, index) => (
              <article key={`${video.videoId}-${index}`} className="slide-card">
                <div className="thumb">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="thumb-img"
                    loading="lazy"
                  />
                  <span className="play" aria-hidden="true" />
                </div>

                <div className="body">
                  <strong title={video.title}>{video.title}</strong>

                  <div className="hl-meta">
                    <span className="hl-channel">{video.channel}</span>
                    <span className="hl-published">{video.published}</span>
                  </div>

                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="watch-btn"
                  >
                    ▶ Watch
                  </a>
                </div>
              </article>
            ))}
          </div>

          <button
            className="carousel-btn right"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            ▶
          </button>
        </div>
      )}
    </section>
  );
};

export default Highlights;
