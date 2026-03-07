import React, { useEffect, useState } from "react";

const RaceStats = ({ year = 2026, round = 21 }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(
          `https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`,
        );
        const data = await res.json();
        const race = data?.MRData?.RaceTable?.Races[0];
        if (!race) return;

        const results = race.Results;
        const winner = results[0];
        const fastest = results.find((r) => r.FastestLap?.rank === "1");

        setStats({
          raceName: race.raceName,
          circuit: race.Circuit.circuitName,
          date: race.date,
          time: race.time,
          winner,
          podium: results.slice(0, 3),
          fastest,
          totalLaps: winner.laps || "—",
          results: results.slice(0, 10),
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
    return (
      <div className="panel rs-loading-panel">
        <span className="loading-text">Loading race data…</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="panel rs-loading-panel">
        <span className="loading-text">No race data available.</span>
      </div>
    );
  }

  function posClass(pos) {
    if (pos === "1") return "rs-pos rs-pos--p1";
    if (pos === "2") return "rs-pos rs-pos--p2";
    if (pos === "3") return "rs-pos rs-pos--p3";
    return "rs-pos";
  }

  return (
    <div className="stats panel">
      {/* Header */}
      <div className="rs-header">
        <div>
          <h2 className="section-title">{stats.raceName}</h2>
          <p className="subtle subtle--flush">{stats.circuit}</p>
        </div>
        <div className="rs-round-badge">Round {round}</div>
      </div>

      {/* Key stats */}
      <div className="stat-grid">
        <div className="stat">
          <div>Winner</div>
          <strong>
            {stats.winner.Driver.givenName[0]}. {stats.winner.Driver.familyName}
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
          <div>Race Time</div>
          <strong className="stat-small">{stats.time ?? "—"}</strong>
        </div>
      </div>

      {/* Results table */}
      <h4>Race Result</h4>
      <div className="rs-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>Pos</th>
              <th>Driver</th>
              <th>Team</th>
              <th className="th-right">Time / Gap</th>
              <th className="th-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {stats.results.map((r) => (
              <tr key={r.position}>
                <td>
                  <span className={posClass(r.position)}>{r.position}</span>
                </td>

                <td>
                  <div className="rs-driver-cell">
                    {r.Driver.givenName[0]}. {r.Driver.familyName}
                    {r.FastestLap?.rank === "1" && (
                      <span className="rs-fl-badge">⚡ FL</span>
                    )}
                  </div>
                </td>

                <td className="rs-constructor-col">{r.Constructor.name}</td>

                <td className="rs-time-cell">{r.Time?.time || r.status}</td>

                <td className="rs-pts-cell">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fastest lap callout */}
      {stats.fastest && (
        <div className="rs-fastest-box">
          <span className="rs-fl-label">⚡ Fastest Lap</span>
          <span className="rs-fl-driver">
            {stats.fastest.Driver.givenName} {stats.fastest.Driver.familyName}
          </span>
          <span className="rs-fl-time">
            {stats.fastest.FastestLap.Time.time}
          </span>
        </div>
      )}
    </div>
  );
};

export default RaceStats;
