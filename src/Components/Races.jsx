import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";

export default function Races() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(2026);

  useEffect(() => {
    async function fetchRaces() {
      setLoading(true);
      const response = await fetch(
        `https://api.jolpi.ca/ergast/f1/${season}.json`,
      );
      const data = await response.json();
      setRaces(data.MRData.RaceTable.Races);
      setLoading(false);
    }
    fetchRaces();
  }, [season]);

  const now = new Date();

  function raceStatus(race) {
    const raceDate = new Date(`${race.date}T${race.time || "00:00:00"}`);
    if (raceDate < now) return "completed";
    if (raceDate - now < 7 * 24 * 60 * 60 * 1000) return "next";
    return "upcoming";
  }

  function statusBarClass(status) {
    if (status === "completed") return "rc-status-bar rc-status-bar--done";
    if (status === "next") return "rc-status-bar rc-status-bar--next";
    return "rc-status-bar rc-status-bar--upcoming";
  }

  function rowClass(status) {
    if (status === "completed") return "rc-row rc-row--completed";
    if (status === "next") return "rc-row rc-row--next";
    return "rc-row";
  }

  function badgeClass(status) {
    if (status === "completed") return "rc-badge rc-badge--done";
    if (status === "next") return "rc-badge rc-badge--next";
    return "rc-badge rc-badge--upcoming";
  }

  return (
    <div className="container rc-page">
      {/* Header */}
      <div className="rc-page-header">
        <div>
          <h2 className="section-title">Race Calendar</h2>
          <p className="subtle subtle--flush">Formula 1 · Season {season}</p>
        </div>

        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="form-select rc-season-select"
        >
          {Array.from({ length: 20 }, (_, i) => 2026 - i).map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="panel loading-panel">
          <span className="loading-text">Loading races…</span>
        </div>
      ) : (
        <div className="rc-list">
          {races.map((race) => {
            const status = raceStatus(race);
            const localTime = race.time
              ? new Date(`${race.date}T${race.time}`).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "TBC";

            return (
              <div key={race.round} className={rowClass(status)}>
                <div className="rc-round">R{race.round}</div>

                <div className={statusBarClass(status)} />

                <div>
                  <div className="rc-race-name">{race.raceName}</div>
                  <div className="rc-circuit">{race.Circuit.circuitName}</div>
                </div>

                <div className="rc-date-col">
                  <div className="rc-date-main">{race.date}</div>
                  <div className="rc-date-time">{localTime} IST</div>
                </div>

                <div className="rc-badge-col">
                  <span className={badgeClass(status)}>
                    {status === "completed"
                      ? "Done"
                      : status === "next"
                        ? "Next ▶"
                        : "Upcoming"}
                  </span>
                </div>

                <Link
                  to={`/races/${season}/${race.round}/results`}
                  className="rc-view-btn"
                  title="View Results"
                >
                  <IoEyeSharp />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
