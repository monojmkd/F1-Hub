import React, { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────
//  LIVE RACE PANEL
//
//  Polls your own Vercel endpoint /api/f1live every 3s.
//  That function handles the F1 SignalR connection server-side —
//  no CORS issues, works in every browser.
//
//  Left   → Timing Tower
//  Middle → Track Map  (SVG, positions accumulate into a circuit outline)
//  Right  → Weather card + Race Control feed
// ─────────────────────────────────────────────────────────────────

const POLL_MS = 3000;
const SVG_W = 480;
const SVG_H = 360;
const PAD = 44;

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

// ── SVG normaliser ────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
//  Leaderboard
// ─────────────────────────────────────────────────────────────────
function Leaderboard({ drivers, leaderboard, sessionType, lapInfo }) {
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
          const compound = entry.compound;
          const compColor = compound
            ? COMPOUND_COLOR[compound] || "#888"
            : null;
          const compAbbr = compound ? COMPOUND_ABBR[compound] || "?" : null;
          const isLeader = i === 0;
          return (
            <div
              key={entry.driverNum}
              className={`ltm-lb-row${isLeader ? " ltm-lb-row--leader" : ""}`}
            >
              <span className="ltm-lb-pos">{entry.position || i + 1}</span>
              <span className="ltm-lb-bar" style={{ background: d.color }} />
              <span className="ltm-lb-code" style={{ color: d.color }}>
                {d.code}
              </span>
              <span className="ltm-lb-gap">
                {isLeader ? (
                  <span className="ltm-lb-leader-tag">LEADER</span>
                ) : entry.gap ? (
                  `+${entry.gap}`
                ) : (
                  "—"
                )}
              </span>
              {!isLeader && entry.interval && (
                <span className="ltm-lb-interval">▲ {entry.interval}</span>
              )}
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
//  Track Map SVG
// ─────────────────────────────────────────────────────────────────
function TrackMap({ drivers, positions, trackPoints, status, sessionName }) {
  // Offline or error — show a clean placeholder, no empty SVG
  if (status === "offline" || status === "error") {
    return (
      <div className="ltm-map-offline">
        <div className="ltm-map-offline-icon">⬡</div>
        <p className="ltm-map-offline-title">
          {status === "error" ? "Map Unavailable" : "No Live Session"}
        </p>
        <p className="ltm-map-offline-sub">
          {status === "error"
            ? "Could not connect to timing stream"
            : "Track map streams during live sessions only"}
        </p>
        {sessionName && status === "offline" && (
          <p className="ltm-map-offline-last">Last: {sessionName}</p>
        )}
      </div>
    );
  }

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

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="ltm-svg"
      aria-label="Live F1 track map"
    >
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
          fontFamily="Barlow Condensed,sans-serif"
          letterSpacing="3"
        >
          {status === "init" ? "CONNECTING…" : "BUILDING TRACK…"}
        </text>
      )}
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
//  Weather Card
// ─────────────────────────────────────────────────────────────────
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
                {weather.track_temperature != null
                  ? `${weather.track_temperature}°`
                  : "—"}
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
//  Race Control Feed
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
            const raw = (m.flag || "").toUpperCase().replace(/[\s-]/g, "_");
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
//  Parent — polls /api/f1live, owns all state
// ─────────────────────────────────────────────────────────────────
export default function LiveTrackMap() {
  const [sessionName, setSessionName] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [lapInfo, setLapInfo] = useState("");
  const [drivers, setDrivers] = useState({});
  const [positions, setPositions] = useState([]);
  const [trackPoints, setTrackPoints] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [weather, setWeather] = useState(null);
  const [raceControl, setRaceControl] = useState([]);
  const [status, setStatus] = useState("init");
  const [lastUpdate, setLastUpdate] = useState(null);
  const trackRef = useRef([]);
  const pollerRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/f1live");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Drivers
      if (data.drivers && Object.keys(data.drivers).length)
        setDrivers(data.drivers);

      // Session meta
      if (data.sessionName) setSessionName(data.sessionName);
      if (data.sessionType) setSessionType(data.sessionType);
      if (data.lapInfo) setLapInfo(data.lapInfo);

      // Timing tower
      if (data.leaderboard?.length) setLeaderboard(data.leaderboard);

      // Weather + race control
      if (data.weather) setWeather(data.weather);
      if (data.raceControl?.length) setRaceControl(data.raceControl);

      // Track positions — accumulate for circuit outline
      if (data.positions?.length) {
        setPositions(data.positions);

        // Merge new points into the running track outline
        trackRef.current = [
          ...trackRef.current,
          ...data.positions.map((p) => ({ x: p.x, y: p.y })),
        ];
        // Deduplicate on a 2m grid so the array doesn't grow infinitely
        const seen = new Set();
        trackRef.current = trackRef.current.filter((p) => {
          const k = `${Math.round(p.x / 2)},${Math.round(p.y / 2)}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        setTrackPoints([...trackRef.current]);
      }

      setStatus(data.live ? "live" : "offline");
      setLastUpdate(new Date());
    } catch (err) {
      console.warn("[LiveTrackMap] poll error:", err.message);
      if (status === "init") setStatus("error");
    }
  }, [status]);

  useEffect(() => {
    poll();
    // Only keep polling during a live session.
    // When offline, a single fetch is enough — no point hammering the API.
    // Check again every 5 minutes in case a session goes live.
    const rate = status === "live" ? POLL_MS : 5 * 60 * 1000;
    pollerRef.current = setInterval(poll, rate);
    return () => clearInterval(pollerRef.current);
  }, [poll, status]);

  // ── Status badge ──────────────────────────────────────────────
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
      {/* Header */}
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

      {/* Three-panel body */}
      <div className="ltm-body">
        {/* LEFT — Timing Tower */}
        <div className="ltm-panel ltm-panel--left">
          <div className="ltm-panel-label">TIMING TOWER</div>
          <Leaderboard
            drivers={drivers}
            leaderboard={leaderboard}
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
              sessionName={sessionName}
            />
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

        {/* RIGHT — Weather + Race Control */}
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
