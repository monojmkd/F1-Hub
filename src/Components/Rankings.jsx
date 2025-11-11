import React, { useEffect, useState } from "react";

const Rankings = () => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const response = await fetch(
          "https://api.jolpi.ca/ergast/f1/2025/driverstandings.json"
        );
        const data = await response.json();

        const list =
          data?.MRData?.StandingsTable?.StandingsLists[0]?.DriverStandings ||
          [];

        setStandings(list.slice(0, 5));
      } catch (e) {
        console.error("Error fetching rankings:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchRankings();
  }, []);

  useEffect(() => {
    // console.log("Updated standings:", standings);
  }, [standings]);

  return (
    <section id="rankings" className="container">
      <h2 className="section-title">Top 5 Driver Rankings</h2>
      <div className="panel rankings fade-in">
        <table className="table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Driver</th>
              <th>Team</th>
              <th>Points</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((s) => (
              <tr key={s.Driver.driverId}>
                <td>
                  <span className="badge">{s.position}</span>
                </td>
                <td>
                  {s.Driver.givenName} {s.Driver.familyName}
                </td>
                <td>{s.Constructors[0]?.name}</td>
                <td>{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Rankings;
