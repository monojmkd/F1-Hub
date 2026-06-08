import React, { useEffect, useState, useRef } from "react";

const ERGAST_BASE = "https://api.jolpi.ca/ergast/f1";
const CURRENT_YEAR = 2026;
const MIN_YEAR = 2000;

const TEAM_META = {
  "Red Bull": { color: "#3671C6" },
  Ferrari: { color: "#E8002D" },
  McLaren: { color: "#FF8000" },
  Mercedes: { color: "#27F4D2" },
  "Aston Martin": { color: "#229971" },
  Alpine: { color: "#FF87BC" },
  Audi: { color: "#FF2D00" },
  Cadillac: { color: "#AAAAAD" },
  RB: { color: "#6692FF" },
  Haas: { color: "#B6BABD" },
  Williams: { color: "#1868DB" },
  Renault: { color: "#FFF500" },
  "Force India": { color: "#FF80C7" },
  Sauber: { color: "#00E700" },
  Lotus: { color: "#FFB800" },
  Brawn: { color: "#B8FF00" },
  Toyota: { color: "#EB2130" },
  BMW: { color: "#1C62B9" },
  Honda: { color: "#e3000f" },
  "Toro Rosso": { color: "#469BFF" },
  "Racing Point": { color: "#F596C8" },
  AlphaTauri: { color: "#4E7C99" },
  "Alfa Romeo": { color: "#C92D4B" },
  Jordan: { color: "#F3BF19" },
  Minardi: { color: "#191919" },
  Jaguar: { color: "#236C2E" },
  BAR: { color: "#003F85" },
  Stewart: { color: "#FFFFFF" },
  Arrows: { color: "#D47215" },
  Benetton: { color: "#20BBEF" },
  Tyrrell: { color: "#2A5EA6" },
  Brabham: { color: "#006D37" },
  Cooper: { color: "#007A3D" },
  Vanwall: { color: "#007A40" },
  Maserati: { color: "#C0392B" },
};

function teamColor(name = "") {
  for (const [key, val] of Object.entries(TEAM_META)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val.color;
  }
  return "#555";
}

// ── Nationality flag emoji helper ─────────────────────────
const NAT_FLAGS = {
  British: "🇬🇧",
  German: "🇩🇪",
  Dutch: "🇳🇱",
  Spanish: "🇪🇸",
  Finnish: "🇫🇮",
  Australian: "🇦🇺",
  French: "🇫🇷",
  Brazilian: "🇧🇷",
  Canadian: "🇨🇦",
  Italian: "🇮🇹",
  Mexican: "🇲🇽",
  Monegasque: "🇲🇨",
  Japanese: "🇯🇵",
  American: "🇺🇸",
  Thai: "🇹🇭",
  Danish: "🇩🇰",
  Chinese: "🇨🇳",
  Austrian: "🇦🇹",
  Swiss: "🇨🇭",
  Swedish: "🇸🇪",
  Belgian: "🇧🇪",
  Polish: "🇵🇱",
  Russian: "🇷🇺",
  Argentine: "🇦🇷",
  New: "🇳🇿",
  South: "🇿🇦",
  Venezuelan: "🇻🇪",
  Colombian: "🇨🇴",
  Hungarian: "🇭🇺",
  Czech: "🇨🇿",
  Indian: "🇮🇳",
  Indonesian: "🇮🇩",
};
function flag(nat = "") {
  for (const [k, v] of Object.entries(NAT_FLAGS)) {
    if (nat.startsWith(k)) return v;
  }
  return "🏁";
}

// ── API ───────────────────────────────────────────────────
async function fetchStandings(year) {
  const [drRes, ctRes] = await Promise.all([
    fetch(`${ERGAST_BASE}/${year}/driverstandings.json?limit=100`),
    fetch(`${ERGAST_BASE}/${year}/constructorstandings.json?limit=100`),
  ]);
  const drData = await drRes.json();
  const ctData = await ctRes.json();
  return {
    drivers:
      drData?.MRData?.StandingsTable?.StandingsLists[0]?.DriverStandings || [],
    constructors:
      ctData?.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings ||
      [],
    round: drData?.MRData?.StandingsTable?.StandingsLists[0]?.round || null,
    raceName:
      drData?.MRData?.StandingsTable?.StandingsLists[0]?.raceName || null,
  };
}

// ── Year dropdown ─────────────────────────────────────────
function YearSelect({ value, onChange }) {
  const years = [];
  for (let y = CURRENT_YEAR; y >= MIN_YEAR; y--) years.push(y);
  return (
    <div className="rkp-year-wrap">
      <label className="rkp-year-label">Season</label>
      <select
        className="rkp-year-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Driver standings table ────────────────────────────────
function DriverTable({ rows, loading }) {
  const maxPts = Number(rows[0]?.points) || 1;
  if (loading)
    return (
      <div className="rkp-loading">
        <span className="rkp-spinner" />
        Loading standings…
      </div>
    );
  if (!rows.length)
    return (
      <div className="rkp-empty">No driver standings data for this season.</div>
    );

  return (
    <div className="rkp-table-wrap">
      <table className="rkp-table">
        <thead>
          <tr>
            <th className="rkp-th-pos">Pos</th>
            <th>Driver</th>
            <th className="rkp-th-nat">Nat</th>
            <th>Team</th>
            <th className="rkp-th-num">Wins</th>
            <th className="rkp-th-num">Points</th>
            <th className="rkp-th-bar"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const name = `${s.Driver.givenName} ${s.Driver.familyName}`;
            const team = s.Constructors[0]?.name || "—";
            const color = teamColor(team);
            const pct = (Number(s.points) / maxPts) * 100;
            const pos = Number(s.position);
            return (
              <tr
                key={s.Driver.driverId}
                className={pos <= 3 ? "rkp-tr--top3" : ""}
              >
                <td>
                  <span
                    className={`rkp-pos rkp-pos--${pos <= 3 ? pos : "rest"}`}
                  >
                    {pos <= 3 ? ["🥇", "🥈", "🥉"][pos - 1] : pos}
                  </span>
                </td>
                <td>
                  <div className="rkp-driver-cell">
                    <span className="rkp-dot" style={{ background: color }} />
                    <div>
                      <div className="rkp-driver-name">{name}</div>
                      <div className="rkp-driver-code">
                        {s.Driver.code ||
                          s.Driver.driverId.toUpperCase().slice(0, 3)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="rkp-nat">
                  {flag(s.Driver.nationality)}{" "}
                  <span className="rkp-nat-text">{s.Driver.nationality}</span>
                </td>
                <td>
                  <span className="rkp-team-pill" style={{ "--tc": color }}>
                    {team}
                  </span>
                </td>
                <td className="rkp-num">{s.wins}</td>
                <td className="rkp-num rkp-pts">{s.points}</td>
                <td className="rkp-bar-cell">
                  <div className="rkp-bar-track">
                    <div
                      className="rkp-bar-fill"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Constructor standings table ───────────────────────────
function ConstructorTable({ rows, loading }) {
  const maxPts = Number(rows[0]?.points) || 1;
  if (loading)
    return (
      <div className="rkp-loading">
        <span className="rkp-spinner" />
        Loading standings…
      </div>
    );
  if (!rows.length)
    return (
      <div className="rkp-empty">
        No constructor standings data for this season.
      </div>
    );

  return (
    <div className="rkp-table-wrap">
      <table className="rkp-table">
        <thead>
          <tr>
            <th className="rkp-th-pos">Pos</th>
            <th>Constructor</th>
            <th className="rkp-th-nat">Nat</th>
            <th className="rkp-th-num">Wins</th>
            <th className="rkp-th-num">Points</th>
            <th className="rkp-th-bar"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const name = s.Constructor.name;
            const color = teamColor(name);
            const pct = (Number(s.points) / maxPts) * 100;
            const pos = Number(s.position);
            return (
              <tr
                key={s.Constructor.constructorId}
                className={pos <= 3 ? "rkp-tr--top3" : ""}
              >
                <td>
                  <span
                    className={`rkp-pos rkp-pos--${pos <= 3 ? pos : "rest"}`}
                  >
                    {pos <= 3 ? ["🥇", "🥈", "🥉"][pos - 1] : pos}
                  </span>
                </td>
                <td>
                  <div className="rkp-driver-cell">
                    <span
                      className="rkp-dot rkp-dot--lg"
                      style={{ background: color }}
                    />
                    <span className="rkp-driver-name">{name}</span>
                  </div>
                </td>
                <td className="rkp-nat">
                  {flag(s.Constructor.nationality)}{" "}
                  <span className="rkp-nat-text">
                    {s.Constructor.nationality}
                  </span>
                </td>
                <td className="rkp-num">{s.wins}</td>
                <td className="rkp-num rkp-pts">{s.points}</td>
                <td className="rkp-bar-cell">
                  <div className="rkp-bar-track">
                    <div
                      className="rkp-bar-fill"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main RankingsPage ─────────────────────────────────────
export default function RankingsPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [tab, setTab] = useState("drivers");
  const [data, setData] = useState({
    drivers: [],
    constructors: [],
    round: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    fetchStandings(year)
      .then((d) => {
        if (!ctrl.signal.aborted) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) {
          setError("Failed to load standings. Please try again.");
          setLoading(false);
        }
      });
    return () => ctrl.abort();
  }, [year]);

  const subtitle = data.round
    ? `After Round ${data.round}${data.raceName ? ` · ${data.raceName}` : ""}`
    : `${year} Season`;

  return (
    <div className="rkp-page container">
      {/* ── Page header ── */}
      <div className="rkp-header">
        <div className="rkp-header-left">
          <h1 className="section-title rkp-title">Championship Standings</h1>
          <p className="subtle subtle--flush">
            {year} · {subtitle}
          </p>
        </div>
        <YearSelect value={year} onChange={setYear} />
      </div>

      {error && <div className="rkp-error">⚠ {error}</div>}

      {/* ── Tabs ── */}
      <div className="rk-tabs rkp-tabs">
        {["drivers", "constructors"].map((t) => (
          <button
            key={t}
            className={`rk-tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "drivers" ? "🏎 Drivers" : "🏭 Constructors"}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="panel panel--flush rkp-panel">
        {tab === "drivers" ? (
          <DriverTable rows={data.drivers} loading={loading} />
        ) : (
          <ConstructorTable rows={data.constructors} loading={loading} />
        )}
      </div>

      {/* ── Legend counts ── */}
      {!loading && (
        <div className="rkp-footer-note">
          {tab === "drivers"
            ? `${data.drivers.length} drivers`
            : `${data.constructors.length} constructors`}{" "}
          · Data via Ergast / Jolpica
        </div>
      )}
    </div>
  );
}
