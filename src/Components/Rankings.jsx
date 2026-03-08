import React, { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────
//  DATA STRATEGY — 3-layer approach
//
//  Layer 1 — localStorage cache
//    Standings are saved with a timestamp + race key.
//    On load we show the cache instantly (no spinner).
//
//  Layer 2 — OpenF1 staleness check  (api.openf1.org)
//    OpenF1 pulls directly from F1's live timing system.
//    We ask: "Has a new race ended since we last cached?"
//    If yes → refetch Ergast for updated standings.
//    If no  → cache is still valid → skip the slow Ergast call.
//
//  Layer 3 — Ergast fetch (only when stale)
//    Hit Jolpica/Ergast only when OpenF1 confirms a new race
//    has finished. Avoids hammering a slow API on every load.
//
//  Result:
//    Race day + after  → OpenF1 detects completion → auto refresh
//    Normal days       → instant from cache, zero slow API calls
// ─────────────────────────────────────────────────────────────────

const SEASON = 2026;
const CACHE_KEY = `f1_standings_${SEASON}`;
const OPENF1_BASE = "https://api.openf1.org/v1";
const ERGAST_BASE = "https://api.jolpi.ca/ergast/f1";

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

// ── Cache helpers ─────────────────────────────────────────────
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Treat cache as missing if it has no actual standings data
    if (!parsed?.drivers?.length) {
      localStorage.removeItem(CACHE_KEY); // purge corrupt/empty cache
      return null;
    }
    // Ensure legacy full-list caches are trimmed to top 5
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
    /* storage full — ignore */
  }
}

// ── OpenF1: find the latest completed race ─────────────────────
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

// ── Ergast: fetch current standings ───────────────────────────
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

      // Show cache immediately — no spinner on return visits
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
        // OpenF1 check: what's the last completed race?
        const latest = await getLatestCompletedRace();

        if (latest) {
          const raceKey = `${SEASON}-${latest.session_key}`;
          setLastRace(`${latest.location}`);

          // Refetch Ergast if: no cache, stale race key, OR cache has no actual data
          const cacheEmpty =
            !cache?.drivers?.length || !cache?.constructors?.length;
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
            setDataSource("live"); // cache matches latest race — already up to date
          }
        } else {
          // No race ended yet this season
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
    const props = {
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
    }[dataSource];

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
                {tab === "drivers" && <th>Team</th>}
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
