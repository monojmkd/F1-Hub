import React, { useEffect, useState } from "react";

const circuitImages = {
  yas_marina: "/assets/Abu Dhabi.png",
  vegas: "/assets/Las Vegas.png",
  losail: "/assets/Qatar.png",
};

const UpcomingRaces = ({ season = 2025 }) => {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `https://api.jolpi.ca/ergast/f1/${season}.json`
        );
        const data = await res.json();

        const races = data?.MRData?.RaceTable?.Races || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0); // ignore time

        // convert dates safely (YYYY-MM-DD always valid)
        const index = races.findIndex((r) => {
          const raceDate = new Date(r.date + "T00:00:00");
          return raceDate >= today;
        });

        if (index !== -1) {
          setUpcoming(races.slice(index, index + 3));
        } else {
          setUpcoming([]);
        }
      } catch (err) {
        console.error("Upcoming races error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [season]);

  if (loading) return <p>Loading upcoming races...</p>;

  if (!upcoming.length) return <p>No upcoming races.</p>;

  return (
    <section className="upcoming-section">
      <h2 className="section-title">Upcoming Races</h2>

      <div className="upcoming-list">
        {upcoming.map((race) => {
          const img =
            circuitImages[race.Circuit.circuitId] || "/assets/default.jpg";

          return (
            <div key={race.round} className="upcoming-card">
              <img src={img} alt={race.raceName} className="circuit-image" />

              <div className="info">
                <div className="round">Round {race.round}</div>
                <div className="name">{race.raceName}</div>
                <div className="location">
                  {race.Circuit.Location.locality},{" "}
                  {race.Circuit.Location.country}
                </div>
                <div className="date">{race.date}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingRaces;
