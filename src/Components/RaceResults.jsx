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
          `https://api.jolpi.ca/ergast/f1/${season}/${round}/results.json`
        );
        const data = await response.json();
        const raceData = data.MRData.RaceTable.Races[0];
        setRace(raceData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [season, round]);

  if (loading) {
    return (
      <div className="container">
        <p>Loading results...</p>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="container">
        <p>No results found.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: "20px" }}>
      <Link
        to={`/races`}
        className="btn btn-dark"
        style={{ marginBottom: "15px" }}
      >
        ← Back to Races
      </Link>

      <h2>
        {race.raceName} — {season}
      </h2>

      <p>
        <strong>Circuit:</strong> {race.Circuit.circuitName}
      </p>
      <p>
        <strong>Date:</strong> {race.date}
      </p>

      {/* Results Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Driver</th>
              <th>Constructor</th>
              <th>Status</th>
              <th>Time</th>
              <th>Points</th>
            </tr>
          </thead>

          <tbody>
            {race.Results.map((r) => (
              <tr key={r.position}>
                <td>{r.position}</td>
                <td>
                  {r.Driver.givenName} {r.Driver.familyName}
                </td>
                <td>{r.Constructor.name}</td>
                <td>{r.status}</td>
                <td>{r.Time?.time || r.FastestLap?.Time?.time || "-"}</td>
                <td>{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
