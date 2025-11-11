import React, { useEffect, useState } from "react";

const RaceStats = ({ year = 2025, round = 21 }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(
          `https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`
        );
        const data = await res.json();

        const race = data?.MRData?.RaceTable?.Races[0];
        if (!race) return;

        const results = race.Results;

        // Winner = P1
        const winner = results[0];

        // Podium
        const podium = results.slice(0, 3);

        // Find fastest lap
        const fastest = results.find((r) => r.FastestLap?.rank === "1");

        // Total laps
        const totalLaps = winner.laps || "-";

        setStats({
          raceName: race.raceName,
          circuit: race.Circuit.circuitName,
          date: race.date,
          time: race.time,
          winner,
          podium,
          fastest,
          totalLaps,
        });
      } catch (err) {
        console.error("Failed to fetch race stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [year, round]);

  if (loading) {
    return <p>Loading race stats...</p>;
  }

  if (!stats) {
    return <p>No race data available.</p>;
  }

  return (
    <div className="stats panel" style={{ padding: "20px" }}>
      <h2 className="section-title">{stats.raceName}</h2>
      <p className="subtle">{stats.circuit}</p>

      <div className="stat-grid">
        <div className="stat">
          <div>Winner</div>
          <strong>
            {stats.winner.Driver.givenName} {stats.winner.Driver.familyName}
          </strong>
        </div>

        <div className="stat">
          <div>Total Laps</div>
          <strong>{stats.totalLaps}</strong>
        </div>

        <div className="stat">
          <div>Date</div>
          <strong>{stats.date}</strong>
        </div>

        <div className="stat">
          <div>Time</div>
          <strong>{stats.time}</strong>
        </div>
      </div>

      <h4>Podium</h4>
      <ol>
        {stats.podium.map((p) => (
          <li key={p.Driver.driverId}>
            {p.Driver.givenName} {p.Driver.familyName} — {p.Constructor.name}
          </li>
        ))}
      </ol>

      {stats.fastest && (
        <>
          <h4>Fastest Lap</h4>
          <p>
            <strong>
              {stats.fastest.Driver.givenName} {stats.fastest.Driver.familyName}
            </strong>{" "}
            — {stats.fastest.FastestLap.Time.time}
          </p>
        </>
      )}
    </div>
  );
};

export default RaceStats;
