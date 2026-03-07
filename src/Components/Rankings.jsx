import React, { useEffect, useState } from "react";

const TEAM_COLORS = {
  "Red Bull": "#3671C6",
  Ferrari: "#E8002D",
  McLaren: "#FF8000",
  Mercedes: "#27F4D2",
  "Aston Martin": "#229971",
  Alpine: "#FF87BC",
  Williams: "#64C4FF",
  "Kick Sauber": "#52E252",
  RB: "#6692FF",
  Haas: "#B6BABD",
};

function teamColor(name = "") {
  for (const [key, val] of Object.entries(TEAM_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "#555";
}

const Rankings = () => {
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("drivers");

  useEffect(() => {
    async function fetchRankings() {
      try {
        const [drRes, ctRes] = await Promise.all([
          fetch("https://api.jolpi.ca/ergast/f1/2026/driverstandings.json"),
          fetch(
            "https://api.jolpi.ca/ergast/f1/2026/constructorstandings.json",
          ),
        ]);
        const drData = await drRes.json();
        const ctData = await ctRes.json();

        setStandings({
          drivers: (
            drData?.MRData?.StandingsTable?.StandingsLists[0]
              ?.DriverStandings || []
          ).slice(0, 10),
          constructors: (
            ctData?.MRData?.StandingsTable?.StandingsLists[0]
              ?.ConstructorStandings || []
          ).slice(0, 10),
        });
      } catch (e) {
        console.error("Error fetching rankings:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, []);

  const rows = tab === "drivers" ? standings.drivers : standings.constructors;
  const maxPts = Number(rows?.[0]?.points) || 1;

  return (
    <section id="rankings">
      <h2 className="section-title">Championship Standings</h2>
      <p className="subtle">2026 Season · Live Rankings</p>

      <div className="rk-tabs">
        {["drivers", "constructors"].map((t) => (
          <button
            key={t}
            className={`rk-tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "drivers" ? "Drivers" : "Constructors"}
          </button>
        ))}
      </div>

      <div className="panel panel--flush">
        {loading ? (
          <div className="rk-loading">Loading standings…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>Pos</th>
                <th>{tab === "drivers" ? "Driver" : "Constructor"}</th>
                {tab === "drivers" && <th>Team</th>}
                <th>Wins</th>
                <th className="th-right">Points</th>
                <th style={{ minWidth: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows?.map((s) => {
                const name =
                  tab === "drivers"
                    ? `${s.Driver.givenName} ${s.Driver.familyName}`
                    : s.Constructor.name;
                const team =
                  tab === "drivers"
                    ? s.Constructors[0]?.name
                    : s.Constructor.name;
                const color = teamColor(team);
                const pct = (Number(s.points) / maxPts) * 100;
                const key =
                  tab === "drivers"
                    ? s.Driver.driverId
                    : s.Constructor.constructorId;

                return (
                  <tr key={key}>
                    <td>
                      <span className="badge">{s.position}</span>
                    </td>

                    <td>
                      <div className="rk-driver-cell">
                        {/* background is runtime data — must stay inline */}
                        <span
                          className="rk-color-dot"
                          style={{ background: color }}
                        />
                        <div>
                          <div className="rk-driver-name">{name}</div>
                          {tab === "drivers" && (
                            <div className="rk-team-sub">{team}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {tab === "drivers" && (
                      <td className="rk-team-col">{team}</td>
                    )}

                    <td>
                      <span className="rk-mono">{s.wins}</span>
                    </td>

                    <td className="td-right">
                      <span className="rk-mono">{s.points}</span>
                    </td>

                    <td>
                      <div className="rk-bar-wrap">
                        {/* width + background are runtime data — must stay inline */}
                        <div
                          className="rk-bar"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default Rankings;
