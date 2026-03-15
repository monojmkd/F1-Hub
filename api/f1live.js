// api/f1live.js  ─── deploy at /api/f1live.js in your Vercel project root
//
// Bridges the F1 Official SignalR live timing stream to a simple REST endpoint.
// Your React app polls GET /api/f1live every 3s — no CORS issues because the
// browser is talking to your own domain, not livetiming.formula1.com.
//
// Protocol:
//   1. GET  livetiming.formula1.com/signalr/negotiate  → ConnectionToken + cookie
//   2. WSS  livetiming.formula1.com/signalr/connect    → WebSocket (with those creds)
//   3. Send Subscribe message for the topics we care about
//   4. Server replies immediately with a snapshot of current state (msg.R)
//   5. Parse + normalise → return JSON to the browser
//
// Add to your project's package.json dependencies: "ws": "^8.0.0"

const { WebSocket } = require("ws");
const zlib = require("zlib");
const https = require("https");

const SIGNALR = "https://livetiming.formula1.com/signalr";
const TOPICS = [
  "TimingData",
  "DriverList",
  "Position.z",
  "WeatherData",
  "RaceControlMessages",
  "TrackStatus",
  "SessionInfo",
  "LapCount",
  "TimingAppData",
  "Heartbeat",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function decompressZlib(b64) {
  try {
    return JSON.parse(zlib.inflateRawSync(Buffer.from(b64, "base64")).toString());
  } catch {
    return null;
  }
}

function safeFloat(v) {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ── Step 1: negotiate ─────────────────────────────────────────────────────────

function negotiate() {
  return new Promise((resolve, reject) => {
    const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
    const url = `${SIGNALR}/negotiate?connectionData=${hub}&clientProtocol=1.5`;

    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "BestHTTP",
          "Accept-Encoding": "gzip, identity",
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (d) => (raw += d));
        res.on("end", () => {
          try {
            const body = JSON.parse(raw);
            const cookie = (res.headers["set-cookie"] || [])
              .map((c) => c.split(";")[0])
              .join("; ");
            resolve({ token: body.ConnectionToken, cookie });
          } catch (e) {
            reject(new Error("Negotiate parse failed: " + e.message));
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(6000, () => {
      req.destroy();
      reject(new Error("Negotiate timeout"));
    });
  });
}

// ── Step 2: connect + subscribe + wait for snapshot ───────────────────────────

function getSnapshot(token, cookie) {
  return new Promise((resolve, reject) => {
    const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
    const wsUrl =
      `wss://livetiming.formula1.com/signalr/connect` +
      `?clientProtocol=1.5&transport=webSockets` +
      `&connectionToken=${encodeURIComponent(token)}` +
      `&connectionData=${hub}`;

    let settled = false;
    const finish = (data) => {
      if (!settled) {
        settled = true;
        try { ws.close(); } catch {}
        clearTimeout(giveUp);
        resolve(data);
      }
    };

    // 8s hard timeout — Vercel hobby functions have a 10s limit
    const giveUp = setTimeout(
      () => finish(null),
      8000
    );

    const ws = new WebSocket(wsUrl, {
      headers: {
        "User-Agent": "BestHTTP",
        "Accept-Encoding": "gzip,identity",
        Cookie: cookie,
      },
    });

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          H: "Streaming",
          M: "Subscribe",
          A: [TOPICS],
          I: 1,
        })
      );
    });

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        // msg.R is the snapshot that arrives right after Subscribe
        // msg.I === "1" matches our subscribe call's I: 1
        if (msg.R && msg.I === "1") {
          finish(msg.R);
        }
      } catch {}
    });

    ws.on("error", (err) => {
      clearTimeout(giveUp);
      reject(err);
    });
  });
}

// ── Step 3: normalise snapshot into clean JSON ────────────────────────────────

function normalise(snap) {
  const out = {
    live: false,
    sessionName: "",
    sessionType: "",
    lapInfo: "",
    drivers: {},
    leaderboard: [],
    positions: [],
    weather: null,
    raceControl: [],
    trackStatus: "",
    ts: Date.now(),
  };

  if (!snap) return out;

  // ── DriverList ─────────────────────────────────────────────────────────────
  const dl = snap.DriverList || {};
  Object.entries(dl).forEach(([num, d]) => {
    if (typeof d !== "object" || !d.RacingNumber) return;
    const n = parseInt(d.RacingNumber || num);
    out.drivers[n] = {
      code: d.Tla || d.BroadcastName || `#${n}`,
      color: d.TeamColour ? `#${d.TeamColour}` : "#888888",
      name: `${d.FirstName || ""} ${d.LastName || ""}`.trim() || d.FullName || "",
      team: d.TeamName || "",
      line: d.Line ?? 99,  // grid order
    };
  });

  // ── SessionInfo ────────────────────────────────────────────────────────────
  const si = snap.SessionInfo;
  if (si) {
    const circuit =
      si.Meeting?.Circuit?.ShortName ||
      si.Meeting?.Name ||
      si.Meeting?.OfficialName ||
      "";
    const sName = si.Name || "";
    out.sessionName = [circuit, sName].filter(Boolean).join(" — ");
    out.sessionType = sName.toUpperCase();
  }

  // ── LapCount ───────────────────────────────────────────────────────────────
  const lc = snap.LapCount;
  if (lc?.CurrentLap) {
    out.lapInfo = lc.TotalLaps
      ? `LAP ${lc.CurrentLap} / ${lc.TotalLaps}`
      : `LAP ${lc.CurrentLap}`;
  }

  // ── TrackStatus ────────────────────────────────────────────────────────────
  const ts = snap.TrackStatus;
  if (ts) {
    out.trackStatus = ts.Message || "";
    // Status "0" means no session; any other value means something is live
    out.live = ts.Status !== "0" && ts.Status != null && Object.keys(out.drivers).length > 0;
  }

  // ── TimingAppData → current tire compound per driver ──────────────────────
  const compounds = {};
  const appLines = snap.TimingAppData?.Lines || {};
  Object.entries(appLines).forEach(([num, d]) => {
    const stints = d.Stints;
    if (!stints) return;
    const arr = Array.isArray(stints) ? stints : Object.values(stints);
    // Last stint = current stint
    const cur = arr[arr.length - 1];
    if (cur?.Compound) compounds[parseInt(num)] = cur.Compound;
  });

  // ── TimingData → leaderboard ───────────────────────────────────────────────
  const timingLines = snap.TimingData?.Lines || {};
  const rows = Object.entries(timingLines).map(([num, d]) => {
    const n = parseInt(num);
    return {
      driverNum: n,
      position: parseInt(d.Position) || 99,
      gap: d.GapToLeader || null,
      interval: d.IntervalToPositionAhead?.Value || null,
      compound: compounds[n] || null,
      retired: d.Retired || false,
      inPit: d.InPit || false,
    };
  });
  out.leaderboard = rows.sort((a, b) => a.position - b.position);

  // ── Position.z → car X/Y on track ─────────────────────────────────────────
  const posRaw = snap["Position.z"];
  if (posRaw) {
    const posData = decompressZlib(posRaw);
    // posData.Position is an array of timestamped snapshots;
    // the last one is the most recent
    const latest = posData?.Position?.[posData.Position.length - 1];
    if (latest?.Entries) {
      out.positions = Object.entries(latest.Entries)
        .filter(([, e]) => e.Status === "OnTrack" || e.Status === "OnTrackRetired")
        .map(([num, e]) => ({
          driverNum: parseInt(num),
          x: e.X,
          y: e.Y,
        }));
    }
  }

  // ── WeatherData ────────────────────────────────────────────────────────────
  const w = snap.WeatherData;
  if (w) {
    out.weather = {
      air_temperature: safeFloat(w.AirTemp),
      track_temperature: safeFloat(w.TrackTemp),
      humidity: safeFloat(w.Humidity),
      wind_speed: safeFloat(w.WindSpeed),
      wind_direction: safeFloat(w.WindDirection),
      rainfall: safeFloat(w.Rainfall) ?? 0,
    };
  }

  // ── RaceControlMessages ────────────────────────────────────────────────────
  const rcm = snap.RaceControlMessages?.Messages;
  if (rcm) {
    const arr = Array.isArray(rcm) ? rcm : Object.values(rcm);
    out.raceControl = arr
      .sort((a, b) => new Date(b.Utc || 0) - new Date(a.Utc || 0))
      .slice(0, 8)
      .map((m) => ({
        message: m.Message || "",
        flag: m.Flag || m.Category || "",
        date: m.Utc || null,
      }));
  }

  return out;
}

// ── Vercel handler ────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { token, cookie } = await negotiate();
    const snapshot = await getSnapshot(token, cookie);
    const data = normalise(snapshot);
    return res.status(200).json(data);
  } catch (err) {
    console.error("[f1live]", err.message);
    return res.status(200).json({
      live: false,
      error: err.message,
      sessionName: "",
      drivers: {},
      leaderboard: [],
      positions: [],
      weather: null,
      raceControl: [],
    });
  }
};
