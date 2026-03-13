import React, { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────
//  LIVE RACE PANEL  — OpenF1 API
//
//  Left  → Leaderboard: position, driver, gap, tire compound
//  Right → Track map:   SVG with live X/Y dots per car
//
//  Both panels share one data pipeline:
//    /sessions   → session key + live/offline state
//    /drivers    → code, team colour per car number
//    /location   → x,y coords   (track map + dot positions)
//    /position   → race position (leaderboard order)
//    /intervals  → gap to leader + interval to car ahead
//    /stints     → current tire compound per driver
// ─────────────────────────────────────────────────────────────────

const OPENF1 = "https://api.openf1.org/v1";
const SVG_W = 480;
const SVG_H = 360;
const PAD = 44;
const POLL_MS = 3000;

const COMPOUND_COLOR = {
  SOFT: "#E8002D",
  MEDIUM: "#FFC906",
  HARD: "#EBEBEB",
  INTERMEDIATE: "#39B54A",
  WET: "#0067FF",
};
const COMPOUND_ABBR = {
  SOFT: "S",
  MEDIUM: "M",
  HARD: "H",
  INTERMEDIATE: "I",
  WET: "W",
};

const FALLBACK_COLORS = {
  "red bull": "#3671C6",
  ferrari: "#E8002D",
  mclaren: "#FF8000",
  mercedes: "#27F4D2",
  "aston martin": "#229971",
  alpine: "#FF87BC",
  williams: "#1868DB",
  rb: "#6692FF",
  haas: "#B6BABD",
  sauber: "#52E252",
  audi: "#FF2D00",
  cadillac: "#AAAAAD",
};
function fallbackColor(name = "") {
  const t = name.toLowerCase();
  for (const [k, v] of Object.entries(FALLBACK_COLORS))
    if (t.includes(k)) return v;
  return "#888";
}

// ── SVG coordinate normaliser ─────────────────────────────────
function makeNorm(pts) {
  if (!pts.length) return () => ({ x: SVG_W / 2, y: SVG_H / 2 });
  const xs = pts.map((p) => p.x),
    ys = pts.map((p) => p.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const rX = maxX - minX || 1,
    rY = maxY - minY || 1;
  const dW = SVG_W - PAD * 2,
    dH = SVG_H - PAD * 2;
  const sc = Math.min(dW / rX, dH / rY);
  const oX = PAD + (dW - rX * sc) / 2,
    oY = PAD + (dH - rY * sc) / 2;
  return (x, y) => ({
    x: oX + (x - minX) * sc,
    y: SVG_H - (oY + (y - minY) * sc),
  });
}

// ── latestPerDriver: keep only most-recent entry per driver ────
function latestPer(arr, keyField = "driver_number") {
  const map = {};
  arr.forEach((e) => {
    const k = e[keyField];
    if (!map[k] || new Date(e.date) > new Date(map[k].date)) map[k] = e;
  });
  return Object.values(map);
}

// ─────────────────────────────────────────────────────────────────
//  SUB-COMPONENT: Leaderboard
// ─────────────────────────────────────────────────────────────────
function Leaderboard({
  drivers,
  leaderboard,
  stints,
  sessionName,
  sessionType,
  lapInfo,
}) {
  if (!leaderboard.length) {
    return (
      <div className="ltm-lb-empty">
        <span className="ltm-lb-empty-icon">⏱</span>
        <p>Timing data unavailable</p>
        <p className="ltm-lb-sub">Live during sessions only</p>
      </div>
    );
  }

  return (
    <div className="ltm-lb-wrap">
      {/* timing tower header */}
      <div className="ltm-lb-top">
        <span className="ltm-lb-type">{sessionType || "SESSION"}</span>
        {lapInfo && <span className="ltm-lb-lap">{lapInfo}</span>}
      </div>

      <div className="ltm-lb-rows">
        {leaderboard.map((entry, i) => {
          const d = drivers[entry.driverNum] || {
            code: `#${entry.driverNum}`,
            color: "#888",
          };
          const stint = stints[entry.driverNum];
          const compound = stint?.compound || null;
          const compColor = compound
            ? COMPOUND_COLOR[compound] || "#888"
            : null;
          const compAbbr = compound ? COMPOUND_ABBR[compound] || "?" : null;
          const isLeader = i === 0;

          return (
            <div
              key={entry.driverNum}
              className={`ltm-lb-row ${isLeader ? "ltm-lb-row--leader" : ""}`}
            >
              {/* position */}
              <span className="ltm-lb-pos">{entry.position || i + 1}</span>

              {/* team colour bar */}
              <span className="ltm-lb-bar" style={{ background: d.color }} />

              {/* driver code */}
              <span className="ltm-lb-code" style={{ color: d.color }}>
                {d.code}
              </span>

              {/* gap / interval */}
              <span className="ltm-lb-gap">
                {isLeader ? (
                  <span className="ltm-lb-leader-tag">LEADER</span>
                ) : entry.gap ? (
                  `+${entry.gap}`
                ) : (
                  "—"
                )}
              </span>

              {/* interval to car ahead */}
              {!isLeader && entry.interval && (
                <span className="ltm-lb-interval">▲ {entry.interval}</span>
              )}

              {/* tire compound badge */}
              {compColor && (
                <span
                  className="ltm-lb-tire"
                  style={{
                    background: compColor,
                    color: compound === "HARD" ? "#111" : "#fff",
                  }}
                >
                  {compAbbr}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SUB-COMPONENT: Track Map SVG
// ─────────────────────────────────────────────────────────────────
function TrackMap({ drivers, positions, trackPoints, status }) {
  const norm = makeNorm(trackPoints);
  const trackPath =
    trackPoints.length > 2
      ? trackPoints
          .map((p, i) => {
            const { x, y } = norm(p.x, p.y);
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ") + " Z"
      : null;

  if (status === "error") {
    return (
      <div className="ltm-unavailable">
        <span className="ltm-unavail-icon">⚑</span>
        <p>Map unavailable</p>
        <p className="ltm-lb-sub">OpenF1 unreachable</p>
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="ltm-svg"
      aria-label="Live F1 track map"
    >
      {/* ── Track layers ── */}
      {trackPath && (
        <>
          <path
            d={trackPath}
            fill="none"
            stroke="rgba(225,6,0,0.12)"
            strokeWidth="24"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={trackPath}
            fill="none"
            stroke="#252528"
            strokeWidth="18"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={trackPath}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="18"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="1 20"
          />
          <path
            d={trackPath}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            strokeDasharray="8 14"
          />
        </>
      )}

      {!trackPath && (
        <text
          x={SVG_W / 2}
          y={SVG_H / 2}
          textAnchor="middle"
          fill="rgba(255,255,255,0.18)"
          fontSize="12"
          fontFamily="Barlow Condensed, sans-serif"
          letterSpacing="3"
        >
          LOADING TRACK…
        </text>
      )}

      {/* ── Driver dots ── */}
      {positions.map(({ driverNum, x, y }) => {
        const d = drivers[driverNum] || {
          code: `#${driverNum}`,
          color: "#888",
        };
        const { x: sx, y: sy } = norm(x, y);
        return (
          <g key={driverNum} className="ltm-driver-pin">
            <circle
              cx={sx}
              cy={sy}
              r={13}
              fill="none"
              stroke={d.color}
              strokeWidth="1"
              opacity="0.25"
            />
            <circle
              cx={sx}
              cy={sy}
              r={8}
              fill={d.color}
              stroke="#0d0d0f"
              strokeWidth="1.5"
            />
            <text
              x={sx}
              y={sy - 13}
              textAnchor="middle"
              fill={d.color}
              fontSize="9"
              fontFamily="Orbitron,sans-serif"
              fontWeight="700"
              style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,1))" }}
            >
              {d.code}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SUB-COMPONENT: Weather Card
// ─────────────────────────────────────────────────────────────────
const FLAG_COLOR = {
  GREEN: "#22c55e",
  YELLOW: "#fbbf24",
  RED: "#E8002D",
  BLUE: "#3b82f6",
  BLACK: "#555",
  CHEQUERED: "#eee",
  CLEAR: "#22c55e",
  SC: "#fbbf24",
  VSC: "#fbbf24",
};
const FLAG_LABEL = {
  GREEN: "GRN",
  YELLOW: "YEL",
  RED: "RED",
  BLUE: "BLU",
  BLACK: "BLK",
  CHEQUERED: "END",
  CLEAR: "CLR",
  SC: "SC",
  VSC: "VSC",
};

function WeatherCard({ weather }) {
  return (
    <div className="ltm-wx-card">
      <span className="ltm-ic-label">WEATHER</span>
      {!weather ? (
        <span className="ltm-ic-empty">No data</span>
      ) : (
        <>
          <span
            className={`ltm-wx-condition ${weather.rainfall > 0 ? "ltm-wx-condition--wet" : "ltm-wx-condition--dry"}`}
          >
            {weather.rainfall > 0 ? "🌧 WET" : "☀ DRY"}
          </span>
          <div className="ltm-wx-grid">
            <div className="ltm-wx-item">
              <span className="ltm-wx-val">
                {weather.air_temperature ?? "—"}°
              </span>
              <span className="ltm-wx-key">AIR</span>
            </div>
            <div className="ltm-wx-item">
              <span className="ltm-wx-val">
                {weather.track_temperature ?? "—"}°
              </span>
              <span className="ltm-wx-key">TRACK</span>
            </div>
            <div className="ltm-wx-item">
              <span className="ltm-wx-val">{weather.humidity ?? "—"}%</span>
              <span className="ltm-wx-key">HUMID</span>
            </div>
            <div className="ltm-wx-item">
              <span className="ltm-wx-val">
                {weather.wind_speed ?? "—"}
                <span className="ltm-wx-unit"> km/h</span>
              </span>
              <span className="ltm-wx-key">
                WIND{" "}
                {weather.wind_direction != null
                  ? `${weather.wind_direction}°`
                  : ""}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SUB-COMPONENT: Race Control Feed
// ─────────────────────────────────────────────────────────────────
function RaceControlFeed({ messages }) {
  return (
    <div className="ltm-rc-card">
      <span className="ltm-ic-label">RACE CONTROL</span>
      {!messages.length ? (
        <span className="ltm-ic-empty">No messages</span>
      ) : (
        <div className="ltm-rc-list">
          {messages.map((m, i) => {
            const raw = (m.flag || m.category || "")
              .toUpperCase()
              .replace(/[\s-]/g, "_");
            const chipColor = FLAG_COLOR[raw] || "#555";
            const chipLabel = FLAG_LABEL[raw] || raw.slice(0, 3) || "—";
            const isDark = chipColor === "#eee" || chipColor === "#fbbf24";
            const time = m.date
              ? new Date(m.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : null;
            return (
              <div
                key={i}
                className={`ltm-rc-row${i === 0 ? " ltm-rc-row--latest" : ""}`}
              >
                <span
                  className="ltm-rc-chip"
                  style={{
                    background: chipColor,
                    color: isDark ? "#111" : "#fff",
                  }}
                >
                  {chipLabel}
                </span>
                <span className="ltm-rc-msg">{m.message}</span>
                {time && <span className="ltm-rc-time">{time}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  PARENT — fetches all data, owns state, renders both panels
// ─────────────────────────────────────────────────────────────────
export default function LiveTrackMap() {
  const [sessionKey, setSessionKey] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [sessionLive, setSessionLive] = useState(false);
  const [drivers, setDrivers] = useState({});
  const [positions, setPositions] = useState([]);
  const [trackPoints, setTrackPoints] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stints, setStints] = useState({});
  const [lapInfo, setLapInfo] = useState("");
  const [weather, setWeather] = useState(null);
  const [raceControl, setRaceControl] = useState([]);
  const [status, setStatus] = useState("init");
  const [lastUpdate, setLastUpdate] = useState(null);
  const trackRef = useRef([]);
  const pollerRef = useRef(null);

  // ── Init: session + drivers ───────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const sRes = await fetch(`${OPENF1}/sessions?session_key=latest`);
        const sData = await sRes.json();
        const sess = Array.isArray(sData) ? sData[0] : sData;
        if (!sess) throw new Error("No session");

        setSessionKey(sess.session_key);
        setSessionName(`${sess.location} — ${sess.session_name}`);
        setSessionType(sess.session_name?.toUpperCase() || "SESSION");

        const live = !sess.date_end || new Date(sess.date_end) > new Date();
        setSessionLive(live);
        setStatus(live ? "live" : "offline");

        const dRes = await fetch(
          `${OPENF1}/drivers?session_key=${sess.session_key}`,
        );
        const dData = await dRes.json();
        const dMap = {};
        (dData || []).forEach((d) => {
          dMap[d.driver_number] = {
            code: d.name_acronym || `#${d.driver_number}`,
            color: d.team_colour
              ? `#${d.team_colour}`
              : fallbackColor(d.team_name || ""),
            name: `${d.first_name || ""} ${d.last_name || ""}`.trim(),
          };
        });
        setDrivers(dMap);
      } catch (err) {
        console.warn("LiveTrackMap init:", err.message);
        setStatus("error");
      }
    }
    init();
  }, []);

  // ── Poll: location + position + intervals + stints ───────
  const poll = useCallback(async () => {
    if (!sessionKey) return;
    const since = new Date(Date.now() - 10000).toISOString();

    try {
      // Run all fetches in parallel
      const [locRes, posRes, intRes, stintRes, lapRes, wxRes, rcRes] =
        await Promise.allSettled([
          fetch(`${OPENF1}/location?session_key=${sessionKey}&date>=${since}`),
          fetch(`${OPENF1}/position?session_key=${sessionKey}&date>=${since}`),
          fetch(`${OPENF1}/intervals?session_key=${sessionKey}&date>=${since}`),
          fetch(`${OPENF1}/stints?session_key=${sessionKey}`),
          fetch(`${OPENF1}/laps?session_key=${sessionKey}&date>=${since}`),
          fetch(`${OPENF1}/weather?session_key=${sessionKey}`),
          fetch(`${OPENF1}/race_control?session_key=${sessionKey}`),
        ]);

      // ── Location → track pts + dot positions ──────────────
      if (locRes.status === "fulfilled") {
        const loc = await locRes.value.json();
        if (loc?.length) {
          const latest = latestPer(loc);
          setPositions(
            latest.map((p) => ({ driverNum: p.driver_number, x: p.x, y: p.y })),
          );

          // Accumulate track outline
          trackRef.current = [
            ...trackRef.current,
            ...loc.map((p) => ({ x: p.x, y: p.y })),
          ];
          const seen = new Set();
          trackRef.current = trackRef.current.filter((p) => {
            const k = `${Math.round(p.x / 2)},${Math.round(p.y / 2)}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          setTrackPoints([...trackRef.current]);
        }
      }

      // ── Race position ─────────────────────────────────────
      let posMap = {};
      if (posRes.status === "fulfilled") {
        const pos = await posRes.value.json();
        if (pos?.length)
          latestPer(pos).forEach((p) => {
            posMap[p.driver_number] = p.position;
          });
      }

      // ── Intervals ────────────────────────────────────────
      let gapMap = {},
        intMap = {};
      if (intRes.status === "fulfilled") {
        const ints = await intRes.value.json();
        if (ints?.length) {
          latestPer(ints).forEach((p) => {
            if (p.gap_to_leader !== null)
              gapMap[p.driver_number] = p.gap_to_leader?.toFixed(3);
            if (p.interval !== null)
              intMap[p.driver_number] = p.interval?.toFixed(3);
          });
        }
      }

      // ── Stints (tire compound) ────────────────────────────
      if (stintRes.status === "fulfilled") {
        const stintData = await stintRes.value.json();
        if (stintData?.length) {
          const latestStint = {};
          stintData.forEach((s) => {
            const n = s.driver_number;
            if (!latestStint[n] || s.stint_number > latestStint[n].stint_number)
              latestStint[n] = s;
          });
          setStints(latestStint);
        }
      }

      // ── Laps (current lap info) ───────────────────────────
      if (lapRes.status === "fulfilled") {
        const lapData = await lapRes.value.json();
        if (lapData?.length) {
          const latest = latestPer(lapData, "driver_number");
          const maxLap = Math.max(...latest.map((l) => l.lap_number || 0));
          if (maxLap) setLapInfo(`LAP ${maxLap}`);
        }
      }

      // ── Weather ───────────────────────────────────────────
      if (wxRes.status === "fulfilled") {
        const wx = await wxRes.value.json();
        if (wx?.length)
          setWeather(
            [...wx].sort((a, b) => new Date(b.date) - new Date(a.date))[0],
          );
      }

      // ── Race control ──────────────────────────────────────
      if (rcRes.status === "fulfilled") {
        const rc = await rcRes.value.json();
        if (rc?.length)
          setRaceControl(
            [...rc]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 8),
          );
      }

      // ── Build sorted leaderboard ──────────────────────────
      const allDrivers = Object.keys({ ...posMap, ...gapMap }).map(Number);
      if (allDrivers.length) {
        const rows = allDrivers
          .map((n) => ({
            driverNum: n,
            position: posMap[n] || 99,
            gap: gapMap[n] || null,
            interval: intMap[n] || null,
          }))
          .sort((a, b) => a.position - b.position);
        setLeaderboard(rows);
      }

      setLastUpdate(new Date());
      setStatus(sessionLive ? "live" : "offline");
    } catch (err) {
      console.warn("Poll failed:", err.message);
    }
  }, [sessionKey, sessionLive]);

  // ── Initial full-lap track trace + start polling ──────────
  useEffect(() => {
    if (!sessionKey) return;
    async function loadTrack() {
      try {
        // Fetch one driver's full-lap data to trace the track outline
        const res = await fetch(
          `${OPENF1}/location?session_key=${sessionKey}&driver_number=1`,
        );
        const data = await res.json();
        if (data?.length) {
          const raw = data.map((p) => ({ x: p.x, y: p.y }));
          trackRef.current = raw;
          setTrackPoints(raw);
        }
      } catch (_) {}
      poll();
    }
    loadTrack();
    if (sessionLive) pollerRef.current = setInterval(poll, POLL_MS);
    return () => clearInterval(pollerRef.current);
  }, [sessionKey, sessionLive, poll]);

  // ── Status badge ──────────────────────────────────────────
  const badgeCls =
    {
      live: "ltm-badge ltm-badge--live",
      offline: "ltm-badge ltm-badge--offline",
      error: "ltm-badge ltm-badge--error",
      init: "ltm-badge ltm-badge--init",
    }[status] || "ltm-badge ltm-badge--init";

  const badgeLabel =
    {
      live: "● Live",
      offline: "◉ Last Session",
      error: "⚠ Unavailable",
      init: "⟳ Connecting…",
    }[status] || "⟳ Connecting…";

  return (
    <section className="ltm-section">
      {/* ── Header ── */}
      <div className="ltm-header">
        <div>
          <h2 className="section-title">Live Race Panel</h2>
          <p className="subtle subtle--flush">
            {sessionName || "Loading session…"}
          </p>
        </div>
        <div className="ltm-header-right">
          <span className={badgeCls}>{badgeLabel}</span>
          {lastUpdate && (
            <span className="ltm-timestamp">
              {lastUpdate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>

      {/* ── Three-panel body ── */}
      <div className="ltm-body">
        {/* LEFT — Timing Tower */}
        <div className="ltm-panel ltm-panel--left">
          <div className="ltm-panel-label">TIMING TOWER</div>
          <Leaderboard
            drivers={drivers}
            leaderboard={leaderboard}
            stints={stints}
            sessionName={sessionName}
            sessionType={sessionType}
            lapInfo={lapInfo}
          />
        </div>

        {/* MIDDLE — Track Map */}
        <div className="ltm-panel ltm-panel--mid">
          <div className="ltm-panel-label">TRACK MAP</div>
          <div className="ltm-canvas-wrap">
            <TrackMap
              drivers={drivers}
              positions={positions}
              trackPoints={trackPoints}
              status={status}
            />
            {/* Mini legend */}
            {positions.length > 0 && (
              <div className="ltm-legend">
                {[...positions]
                  .sort((a, b) => a.driverNum - b.driverNum)
                  .map(({ driverNum }) => {
                    const d = drivers[driverNum];
                    if (!d) return null;
                    return (
                      <div key={driverNum} className="ltm-legend-item">
                        <span
                          className="ltm-legend-dot"
                          style={{ background: d.color }}
                        />
                        <span className="ltm-legend-code">{d.code}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Weather (top) + Race Control (bottom) */}
        <div className="ltm-panel--info">
          <WeatherCard weather={weather} />
          <RaceControlFeed messages={raceControl} />
        </div>
      </div>

      {status === "offline" && (
        <p className="ltm-offline-note">
          No live session active · showing last known data from {sessionName}
        </p>
      )}
    </section>
  );
}
