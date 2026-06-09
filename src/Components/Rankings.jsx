import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SEASON = 2026;
const CACHE_KEY = `f1_standings_${SEASON}`;
const OPENF1_BASE = "https://api.openf1.org/v1";
const ERGAST_BASE = "https://api.jolpi.ca/ergast/f1";

const TEAM_META = {
  "Red Bull": {
    color: "#3671C6",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp",
  },
  Ferrari: {
    color: "#E8002D",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/ferrari/2026ferrarilogowhite.webp",
  },
  McLaren: {
    color: "#FF8000",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/mclaren/2026mclarenlogowhite.webp",
  },
  Mercedes: {
    color: "#27F4D2",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/mercedes/2026mercedeslogowhite.webp",
  },
  "Aston Martin": {
    color: "#229971",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp",
  },
  Alpine: {
    color: "#FF87BC",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/alpine/2026alpinelogowhite.webp",
  },
  Audi: {
    color: "#FF2D00",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/audi/2026audilogowhite.webp",
  },
  Cadillac: {
    color: "#AAAAAD",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/cadillac/2026cadillaclogowhite.webp",
  },
  RB: {
    color: "#6692FF",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/racingbulls/2026racingbullslogowhite.webp",
  },
  Haas: {
    color: "#B6BABD",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp",
  },
  Williams: {
    color: "#1868DB",
    logo: "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000000/common/f1/2026/williams/2026williamslogowhite.webp",
  },
};

function teamMeta(name = "") {
  for (const [key, val] of Object.entries(TEAM_META)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { color: "#555", logo: null };
}

// ── Cache helpers ─────────────────────────────────────────────
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.drivers?.length) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return {
      ...parsed,
      drivers: parsed.drivers.slice(0, 5),
      constructors: (parsed.constructors || []).slice(0, 5),
    };
  } catch {
    return null;
  }
}

function writeCache(drivers, constructors, raceKey) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        drivers,
        constructors,
        raceKey,
        savedAt: Date.now(),
      }),
    );
  } catch {
    /* storage full */
  }
}

// ── OpenF1: latest completed race ─────────────────────────────
async function getLatestCompletedRace() {
  const res = await fetch(
    `${OPENF1_BASE}/sessions?session_type=Race&year=${SEASON}`,
  );
  const data = await res.json();
  if (!data?.length) return null;
  const now = Date.now();
  const past = data
    .filter((s) => s.date_end && new Date(s.date_end).getTime() < now)
    .sort((a, b) => new Date(b.date_end) - new Date(a.date_end));
  return past[0] || null;
}

// ── Ergast: fetch standings ────────────────────────────────────
async function fetchErgastStandings() {
  const [drRes, ctRes] = await Promise.all([
    fetch(`${ERGAST_BASE}/${SEASON}/driverstandings.json`),
    fetch(`${ERGAST_BASE}/${SEASON}/constructorstandings.json`),
  ]);
  const drData = await drRes.json();
  const ctData = await ctRes.json();
  return {
    drivers: (
      drData?.MRData?.StandingsTable?.StandingsLists[0]?.DriverStandings || []
    ).slice(0, 5),
    constructors: (
      ctData?.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings ||
      []
    ).slice(0, 5),
  };
}

// ── Component ─────────────────────────────────────────────────
const Rankings = () => {
  const [standings, setStandings] = useState({ drivers: [], constructors: [] });
  const [tab, setTab] = useState("drivers");
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState("");
  const [lastRace, setLastRace] = useState("");
  const [cacheAge, setCacheAge] = useState(null);

  useEffect(() => {
    async function load() {
      const cache = readCache();
      if (cache) {
        setStandings({
          drivers: cache.drivers,
          constructors: cache.constructors,
        });
        setLoading(false);
        setDataSource("cache");
        setCacheAge(Math.round((Date.now() - cache.savedAt) / 60000));
      }
      try {
        const latest = await getLatestCompletedRace();
        if (latest) {
          const raceKey = `${SEASON}-${latest.session_key}`;
          const cacheEmpty =
            !cache?.drivers?.length || !cache?.constructors?.length;
          setLastRace(latest.location);
          if (!cache || cache.raceKey !== raceKey || cacheEmpty) {
            setDataSource("fetching");
            const fresh = await fetchErgastStandings();
            setStandings({
              drivers: fresh.drivers,
              constructors: fresh.constructors,
            });
            writeCache(fresh.drivers, fresh.constructors, raceKey);
            setDataSource("fresh");
            setCacheAge(0);
          } else {
            setDataSource("live");
          }
        } else {
          if (!cache) {
            const fresh = await fetchErgastStandings();
            if (fresh.drivers.length) {
              setStandings({
                drivers: fresh.drivers,
                constructors: fresh.constructors,
              });
              writeCache(
                fresh.drivers,
                fresh.constructors,
                `${SEASON}-preseason`,
              );
            }
            setDataSource("fresh");
          }
        }
      } catch (err) {
        console.warn("Rankings check failed:", err.message);
        if (!cache) setDataSource("error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rows = tab === "drivers" ? standings.drivers : standings.constructors;
  const maxPts = Number(rows?.[0]?.points) || 1;

  function StatusBadge() {
    const map = {
      fetching: ["rk-status--loading", "⟳ Updating…"],
      fresh: ["rk-status--fresh", "✓ Just updated"],
      live: ["rk-status--live", "● Up to date"],
      error: ["rk-status--cache", "⚠ Couldn't refresh"],
      cache: [
        "rk-status--cache",
        cacheAge !== null
          ? `⏱ ${cacheAge < 60 ? `${cacheAge}m` : `${Math.round(cacheAge / 60)}h`} ago`
          : "⏱ Cached",
      ],
    };
    const props = map[dataSource];
    if (!props) return null;
    return <span className={`rk-status ${props[0]}`}>{props[1]}</span>;
  }

  return (
    <section id="rankings">
      <div className="rk-header-row">
        <div>
          <h2 className="section-title">Championship Standings</h2>
          <p className="subtle subtle--flush">
            {SEASON} Season{lastRace ? ` · After ${lastRace}` : ""}
          </p>
        </div>
        <StatusBadge />
      </div>

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
        ) : rows?.length === 0 ? (
          <div className="rk-loading">No standings data yet for {SEASON}.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>Pos</th>
                <th>{tab === "drivers" ? "Driver" : "Constructor"}</th>
                {tab === "drivers" && <th className="rk-th-team">Team</th>}
                <th>Wins</th>
                <th className="th-right">Points</th>
                <th style={{ minWidth: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const name =
                  tab === "drivers"
                    ? `${s.Driver.givenName} ${s.Driver.familyName}`
                    : s.Constructor.name;
                const team =
                  tab === "drivers"
                    ? s.Constructors[0]?.name
                    : s.Constructor.name;
                const meta = teamMeta(team);
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

                    {/* Name column — logo sits inline next to name */}
                    <td>
                      <div className="rk-driver-cell">
                        <span
                          className="rk-color-dot"
                          style={{ background: meta.color }}
                        />
                        <div className="rk-name-block">
                          <div className="rk-name-row">
                            {meta.logo && (
                              <img
                                src={meta.logo}
                                alt={team}
                                className="rk-team-logo"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <span className="rk-driver-name">{name}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Standalone Team column (drivers tab only) — text only, no logo */}
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
                        <div
                          className="rk-bar"
                          style={{ width: `${pct}%`, background: meta.color }}
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

      {/* ── View All button ── */}
      <div className="rk-view-all-wrap">
        <Link to="/rankings" className="btn btn-dark rk-view-all-btn">
          View All Rankings →
        </Link>
      </div>
    </section>
  );
};

export default Rankings;
