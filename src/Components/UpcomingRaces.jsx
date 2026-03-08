import React, { useEffect, useState } from "react";

const circuitImages = {
  yas_marina: "/assets/Abu Dhabi.png",
  vegas: "/assets/Las Vegas.png",
  losail: "/assets/Qatar.png",
  albert_park: "/assets/Australian.png",
  shanghai: "/assets/Chinese.png",
  suzuka: "/assets/Japanese.png",
  bahrain: "/assets/Bahrain.png",
  jeddah: "/assets/Saudi Arabian.png",
  miami: "/assets/Miami.png",
  villeneuve: "/assets/Canadian.png",
  monaco: "/assets/Monaco.png",
  catalunya: "/assets/Barcelona.png",
  red_bull_ring: "/assets/Austrian.png",
  silverstone: "/assets/British.png",
  spa: "/assets/Belgian.png",
  hungaroring: "/assets/Hungarian.png",
  zandvoort: "/assets/Dutch.png",
  monza: "/assets/Italian.png",
  madring: "/assets/Spanish.png",
  baku: "/assets/Azerbaijan.png",
  marina_bay: "/assets/Singapore.png",
  americas: "/assets/United States.png",
  rodriguez: "/assets/Mexico City.png",
  interlagos: "/assets/Brazilian.png",
};

const UpcomingRaces = ({ season = 2026 }) => {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `https://api.jolpi.ca/ergast/f1/${season}.json`,
        );
        const data = await res.json();
        const races = data?.MRData?.RaceTable?.Races || [];

        const now = new Date();

        // Compare the actual race start time (UTC) against right now —
        // not just the date. This prevents a completed race from still
        // showing as "upcoming" on race day after it has finished.
        // Add a 3-hour buffer so the card clears well after the chequered flag.
        const index = races.findIndex((r) => {
          const raceEnd = new Date(`${r.date}T${r.time || "14:00:00"}`);
          raceEnd.setHours(raceEnd.getHours() + 3); // ~race duration buffer
          return raceEnd > now;
        });

        setUpcoming(index !== -1 ? races.slice(index, index + 3) : []);
      } catch (err) {
        console.error("Upcoming races error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [season]);

  if (loading) {
    return (
      <section className="upcoming-section">
        <h2 className="section-title">Upcoming Races</h2>
        <div className="uc-loading-row">
          {[0, 1, 2].map((i) => (
            <div key={i} className="uc-skeleton shimmer" />
          ))}
        </div>
      </section>
    );
  }

  if (!upcoming.length) {
    return (
      <section className="upcoming-section">
        <h2 className="section-title">Upcoming Races</h2>
        <p className="subtle">No upcoming races scheduled.</p>
      </section>
    );
  }

  return (
    <section className="upcoming-section">
      <h2 className="section-title">Upcoming Races</h2>
      <p className="subtle">Next {upcoming.length} races on the calendar</p>

      <div className="upcoming-list">
        {upcoming.map((race, i) => {
          const img =
            circuitImages[race.Circuit.circuitId] || "/assets/default.jpg";
          const localTime = race.time
            ? new Date(`${race.date}T${race.time}`).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

          return (
            <div key={race.round} className="upcoming-card">
              {i === 0 && <div className="uc-next-tag">Next Race ▶</div>}
              <img src={img} alt={race.raceName} className="circuit-image" />
              <div className="info">
                <div className="round">Round {race.round}</div>
                <div className="name">{race.raceName}</div>
                <div className="location">
                  {race.Circuit.Location.locality},{" "}
                  {race.Circuit.Location.country}
                </div>
                <div className="date">
                  {race.date}
                  {localTime ? ` · ${localTime} IST` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingRaces;
