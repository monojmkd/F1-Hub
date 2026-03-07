import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function RaceResults() {
  const { season, round } = useParams();
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.jolpi.ca/ergast/f1/${season}/${round}/results.json`,
        );
        const data = await response.json();
        setRace(data.MRData.RaceTable.Races[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [season, round]);

  function posClass(pos) {
    const n = parseInt(pos, 10);
    if (n === 1) return "rr-pos rr-pos--p1";
    if (n === 2) return "rr-pos rr-pos--p2";
    if (n === 3) return "rr-pos rr-pos--p3";
    return "rr-pos";
  }

  function statusClass(status) {
    return status === "Finished"
      ? "rr-status-badge rr-status--finished"
      : "rr-status-badge rr-status--dnf";
  }

  if (loading) {
    return (
      <div className="container rr-page">
        <div className="panel loading-panel">
          <span className="loading-text">Loading results…</span>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="container rr-page">
        <p className="loading-text">No results found.</p>
      </div>
    );
  }

  const winner = race.Results?.[0];

  return (
    <div className="container rr-page">
      {/* Back */}
      <Link to="/races" className="btn btn-dark rr-back-btn">
        ← Back to Races
      </Link>

      {/* Race header */}
      <div className="rr-race-header">
        <div>
          <h2 className="section-title">{race.raceName}</h2>
          <div className="rr-meta">
            <span>{race.Circuit.circuitName}</span>
            <span className="rr-meta-dot">·</span>
            <span>{race.date}</span>
            <span className="rr-meta-dot">·</span>
            <span>Season {season}</span>
          </div>
        </div>
        <div className="rr-round-tag">Round {round}</div>
      </div>

      {/* Winner callout */}
      {winner && (
        <div className="rr-winner-box">
          <span className="rr-winner-label">🏆 Race Winner</span>
          <span className="rr-winner-name">
            {winner.Driver.givenName} {winner.Driver.familyName}
          </span>
          <span className="rr-winner-team">{winner.Constructor.name}</span>
          {winner.Time?.time && (
            <span className="rr-winner-time">{winner.Time.time}</span>
          )}
        </div>
      )}

      {/* Results table */}
      <div className="table-responsive rr-results-wrap">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th style={{ width: 48 }}>Pos</th>
              <th>Driver</th>
              <th>Constructor</th>
              <th>Status</th>
              <th className="th-right">Time / Gap</th>
              <th className="th-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {race.Results.map((r) => (
              <tr key={r.position}>
                <td>
                  <span className={posClass(r.position)}>{r.position}</span>
                </td>

                <td>
                  <div className="rr-driver-cell">
                    {r.Driver.givenName} {r.Driver.familyName}
                    {r.FastestLap?.rank === "1" && (
                      <span className="rr-fl-badge">⚡ FL</span>
                    )}
                  </div>
                </td>

                <td className="rr-constructor-col">{r.Constructor.name}</td>

                <td>
                  <span className={statusClass(r.status)}>{r.status}</span>
                </td>

                <td className="rr-time-cell">{r.Time?.time || "—"}</td>

                <td className="rr-pts-cell">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
