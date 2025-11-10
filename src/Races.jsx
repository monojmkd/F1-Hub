import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";
export default function Races() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(2025);

  useEffect(() => {
    async function fetchRaces() {
      setLoading(true);
      const response = await fetch(
        `https://api.jolpi.ca/ergast/f1/${season}.json`
      );
      const data = await response.json();
      setRaces(data.MRData.RaceTable.Races);
      setLoading(false);
    }

    fetchRaces();
  }, [season]);

  if (loading) {
    return (
      <div className="container">
        <p>Loading races...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: "20px" }}>
      <h2>F1 Season {season} — Races</h2>

      {/* Season Selector */}
      <div style={{ margin: "15px 0" }}>
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="form-select"
          style={{ maxWidth: "150px" }}
        >
          {Array.from({ length: 20 }, (_, i) => 2025 - i).map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>

      {/* Races Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Round</th>
              <th>Race Name</th>
              <th>Circuit</th>
              <th>Date</th>
              <th>Local Time(IST)</th>
              <th>Results</th>
            </tr>
          </thead>

          <tbody>
            {races.map((race) => (
              <tr key={race.round}>
                <td>{race.round}</td>
                <td>{race.raceName}</td>
                <td>{race.Circuit.circuitName}</td>
                <td>{race.date}</td>
                <td>
                  {" "}
                  {race.time
                    ? new Date(`${race.date}T${race.time}`).toLocaleTimeString()
                    : "N/A"}
                </td>

                {/* View Results */}
                <td style={{ display: "flex", textAlign: "center" }}>
                  <Link
                    to={`/races/${season}/${race.round}/results`}
                    style={{ color: "#ffffff", fontSize: "18px" }}
                  >
                    <IoEyeSharp />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
