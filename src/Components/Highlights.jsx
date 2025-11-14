import React, { useRef } from "react";

const Highlights = () => {
  const carouselRef = useRef(null);

  // Real F1 videos from the official channel
  const videos = [
    {
      videoId: "MK83clSv6-k",
      title: "Race Highlights | 2025 Sao Paulo Grand Prix",
      duration: "8:08",
      viewCount: "4.9M views",
    },
    {
      videoId: "hTqxfkWRimk",
      title: "Race Highlights | 2025 Mexico City Grand Prix",
      duration: "8:15",
      viewCount: "5.9M views",
    },
    {
      videoId: "CdKwc1bC44c",
      title: "Race Highlights | 2025 United States Grand Prix",
      duration: "8:27",
      viewCount: "5.5M views",
    },
    {
      videoId: "XZhXFbFCOu4",
      title: "Race Highlights | 2025 Singapore Grand Prix",
      duration: "8:14",
      viewCount: "5.8M views",
    },
    {
      videoId: "JntKOmbMI08",
      title: "Race Highlights | 2025 Azerbaijan Grand Prix",
      duration: "8:11",
      viewCount: "7.1M views",
    },
    {
      videoId: "kGMp1Byuwto",
      title: "Race Highlights | 2025 Italian Grand Prix",
      duration: "8:10",
      viewCount: "6.4M views",
    },
  ].map((video) => ({
    ...video,
    thumbnail: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
    channel: "FORMULA 1",
    published: "2025",
  }));

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="container">
      <h2 className="section-title">F1 Highlights</h2>
      <p className="subtle">Official Formula 1 Highlights & Recaps</p>

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
                <span className="play" aria-hidden="true"></span>
                <div className="duration">{video.duration}</div>
              </div>

              <div className="body">
                <strong title={video.title}>{video.title}</strong>
                <div
                  style={{ fontSize: "12px", opacity: 0.7, margin: "2px 0" }}
                >
                  {video.channel}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.6,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{video.viewCount}</span>
                  <span>{video.published}</span>
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
    </section>
  );
};

export default Highlights;
