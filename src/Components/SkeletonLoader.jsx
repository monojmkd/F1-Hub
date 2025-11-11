import React from "react";

const SkeletonLoader = () => {
  const items = Array(5).fill(0);
  return (
    <section className="container">
      <h2 className="section-title">Highlights</h2>
      <div className="carousel fade-in">
        {items.map((_, i) => (
          <div key={i} className="skeleton-card shimmer"></div>
        ))}
      </div>
    </section>
  );
};

export default SkeletonLoader;
