import React, { useEffect, useState } from "react";

// ── Track image slugs (F1 CDN) ────────────────────────────────
const trackMapSlugs = {
  albert_park: "albertpark",
  shanghai: "shanghai",
  suzuka: "suzuka",
  bahrain: "bahrain",
  jeddah: "jeddah",
  miami: "miami",
  imola: "imola",
  monaco: "monaco",
  catalunya: "catalunya",
  villeneuve: "villeneuve",
  red_bull_ring: "spielberg",
  silverstone: "silverstone",
  spa: "spa",
  hungaroring: "hungaroring",
  zandvoort: "zandvoort",
  monza: "monza",
  baku: "baku",
  marina_bay: "marinabay",
  americas: "americas",
  hermanos_rodriguez: "mexicocity",
  interlagos: "interlagos",
  vegas: "lasvegas",
  losail: "losail",
  yas_marina: "yasmarina",
};

// ── Circuit data ──────────────────────────────────────────────
const circuitInfo = {
  albert_park: {
    laps: 58,
    turns: 16,
    length: "5.278 km",
    distance: "306.124 km",
    fastestLap: "1:19.813",
    fastestLapDriver: "Charles Leclerc",
  },
  bahrain: {
    laps: 57,
    turns: 15,
    length: "5.412 km",
    distance: "308.238 km",
    fastestLap: "1:31.447",
    fastestLapDriver: "Pedro de la Rosa",
  },
  jeddah: {
    laps: 50,
    turns: 27,
    length: "6.174 km",
    distance: "308.450 km",
    fastestLap: "1:30.734",
    fastestLapDriver: "Lewis Hamilton",
  },
  shanghai: {
    laps: 56,
    turns: 16,
    length: "5.451 km",
    distance: "305.066 km",
    fastestLap: "1:32.238",
    fastestLapDriver: "Michael Schumacher",
  },
  suzuka: {
    laps: 53,
    turns: 18,
    length: "5.807 km",
    distance: "307.471 km",
    fastestLap: "1:30.965",
    fastestLapDriver: "Kimi Antonelli",
  },
  miami: {
    laps: 57,
    turns: 19,
    length: "5.412 km",
    distance: "308.326 km",
    fastestLap: "1:29.708",
    fastestLapDriver: "Max Verstappen",
  },
  imola: {
    laps: 63,
    turns: 19,
    length: "4.909 km",
    distance: "309.049 km",
    fastestLap: "1:15.484",
    fastestLapDriver: "Lewis Hamilton",
  },
  monaco: {
    laps: 78,
    turns: 19,
    length: "3.337 km",
    distance: "260.286 km",
    fastestLap: "1:12.909",
    fastestLapDriver: "Lewis Hamilton",
  },
  villeneuve: {
    laps: 70,
    turns: 14,
    length: "4.361 km",
    distance: "305.270 km",
    fastestLap: "1:13.078",
    fastestLapDriver: "Valtteri Bottas",
  },
  catalunya: {
    laps: 66,
    turns: 14,
    length: "4.657 km",
    distance: "307.236 km",
    fastestLap: "1:16.330",
    fastestLapDriver: "Oscar Piastri",
  },
  red_bull_ring: {
    laps: 71,
    turns: 10,
    length: "4.318 km",
    distance: "306.452 km",
    fastestLap: "1:05.619",
    fastestLapDriver: "Carlos Sainz",
  },
  silverstone: {
    laps: 52,
    turns: 18,
    length: "5.891 km",
    distance: "306.198 km",
    fastestLap: "1:27.097",
    fastestLapDriver: "Max Verstappen",
  },
  hungaroring: {
    laps: 70,
    turns: 14,
    length: "4.381 km",
    distance: "306.630 km",
    fastestLap: "1:16.627",
    fastestLapDriver: "Lewis Hamilton",
  },
  spa: {
    laps: 44,
    turns: 19,
    length: "7.004 km",
    distance: "308.052 km",
    fastestLap: "1:44.701",
    fastestLapDriver: "Sergio Perez",
  },
  zandvoort: {
    laps: 72,
    turns: 14,
    length: "4.259 km",
    distance: "306.587 km",
    fastestLap: "1:11.097",
    fastestLapDriver: "Lewis Hamilton",
  },
  monza: {
    laps: 53,
    turns: 11,
    length: "5.793 km",
    distance: "306.720 km",
    fastestLap: "1:20.901",
    fastestLapDriver: "Lando Norris",
  },
  baku: {
    laps: 51,
    turns: 20,
    length: "6.003 km",
    distance: "306.049 km",
    fastestLap: "1:43.009",
    fastestLapDriver: "Charles Leclerc",
  },
  marina_bay: {
    laps: 62,
    turns: 23,
    length: "4.940 km",
    distance: "306.143 km",
    fastestLap: "1:35.867",
    fastestLapDriver: "Lewis Hamilton",
  },
  americas: {
    laps: 56,
    turns: 20,
    length: "5.513 km",
    distance: "308.405 km",
    fastestLap: "1:36.169",
    fastestLapDriver: "Charles Leclerc",
  },
  hermanos_rodriguez: {
    laps: 71,
    turns: 17,
    length: "4.304 km",
    distance: "305.354 km",
    fastestLap: "1:17.774",
    fastestLapDriver: "Valtteri Bottas",
  },
  interlagos: {
    laps: 71,
    turns: 15,
    length: "4.309 km",
    distance: "305.879 km",
    fastestLap: "1:10.540",
    fastestLapDriver: "Valtteri Bottas",
  },
  vegas: {
    laps: 50,
    turns: 17,
    length: "6.201 km",
    distance: "309.958 km",
    fastestLap: "1:33.365",
    fastestLapDriver: "Max Verstappen",
  },
  losail: {
    laps: 57,
    turns: 16,
    length: "5.380 km",
    distance: "306.587 km",
    fastestLap: "1:22.384",
    fastestLapDriver: "Lando Norris",
  },
  yas_marina: {
    laps: 58,
    turns: 16,
    length: "5.281 km",
    distance: "306.183 km",
    fastestLap: "1:26.103",
    fastestLapDriver: "Max Verstappen",
  },
};

// ── Tyre data: compounds + typical 1-stop strategy
// ALL keyed by circuitId (matches Jolpica/Ergast) ─────────────
const tyreData = {
  albert_park: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Medium", "Hard"],
    stops: 1,
    note: "1-stop typical",
  },
  bahrain: {
    compounds: ["C1", "C2", "C3"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "Hard tyres dominate",
  },
  jeddah: {
    compounds: ["C2", "C3", "C4"],
    strategy: ["Soft", "Medium"],
    stops: 1,
    note: "Softs for qualifying pace",
  },
  shanghai: {
    compounds: ["C2", "C3", "C4"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "High deg on rear",
  },
  suzuka: {
    compounds: ["C1", "C2", "C3"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "Hard stint opens strategy",
  },
  miami: {
    compounds: ["C2", "C3", "C4"],
    strategy: ["Soft", "Medium"],
    stops: 1,
    note: "Abrasive surface, 1-stop",
  },
  imola: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Hard"],
    stops: 1,
    note: "Limited overtaking, undercut key",
  },
  monaco: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Medium"],
    stops: 1,
    note: "Track position everything",
  },
  villeneuve: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Hard"],
    stops: 1,
    note: "Safety car likely",
  },
  catalunya: {
    compounds: ["C1", "C2", "C3"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "High deg, 1-stop marginal",
  },
  red_bull_ring: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Hard"],
    stops: 1,
    note: "Short lap = undercut power",
  },
  silverstone: {
    compounds: ["C1", "C2", "C3"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "High-speed deg on shoulders",
  },
  hungaroring: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Medium"],
    stops: 2,
    note: "2-stop faster but risky",
  },
  spa: {
    compounds: ["C2", "C3", "C4"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "Low deg, 1-stop comfortable",
  },
  zandvoort: {
    compounds: ["C1", "C2", "C3"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "VSC/SC can shuffle strategy",
  },
  monza: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Medium"],
    stops: 1,
    note: "Lowest downforce circuit",
  },
  baku: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Hard"],
    stops: 1,
    note: "SC likely, hard stint crucial",
  },
  marina_bay: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Medium"],
    stops: 1,
    note: "SC almost certain",
  },
  americas: {
    compounds: ["C2", "C3", "C4"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "Bumpy surface hurts tyres",
  },
  hermanos_rodriguez: {
    compounds: ["C2", "C3", "C4"],
    strategy: ["Soft", "Medium"],
    stops: 1,
    note: "Altitude reduces deg",
  },
  interlagos: {
    compounds: ["C2", "C3", "C4"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "Weather often disrupts",
  },
  vegas: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Hard"],
    stops: 1,
    note: "Cold track = slow warm-up",
  },
  losail: {
    compounds: ["C1", "C2", "C3"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "High deg on rears",
  },
  yas_marina: {
    compounds: ["C3", "C4", "C5"],
    strategy: ["Soft", "Medium"],
    stops: 1,
    note: "Final race, aggressive calls",
  },
};

// ── Pirelli tyre images ───────────────────────────────────────
const tyreImages = {
  hard: "https://tyre24.pirelli.com/motorsport/assets/motorsport/carousel/pirelli-motorsport-car-Formula1-SlickTyres-white-2026.png",
  medium:
    "https://tyre24.pirelli.com/motorsport/assets/motorsport/carousel/pirelli-motorsport-car-Formula1-SlickTyres-yellow-2026.png",
  soft: "https://tyre24.pirelli.com/motorsport/assets/motorsport/carousel/pirelli-motorsport-car-Formula1-SlickTyres-red-2026.png",
  intermediate:
    "https://tyre24.pirelli.com/motorsport/assets/motorsport/banners/pirelli-motorsport-car-Formula1-WetTyres-green-senzaombra-2026.png",
  fullWet:
    "https://tyre24.pirelli.com/motorsport/assets/motorsport/banners/pirelli-motorsport-car-Formula1-WetTyres-blu-senzaombra-2026.png",
};

const COMPOUND_COLOR = {
  C1: "#fff",
  C2: "#fff",
  C3: "#FFC906",
  C4: "#FFC906",
  C5: "#E8002D",
  C6: "#E8002D",
};
const COMPOUND_BG = {
  C1: "rgba(255,255,255,0.08)",
  C2: "rgba(255,255,255,0.08)",
  C3: "rgba(255,201,6,0.12)",
  C4: "rgba(255,201,6,0.12)",
  C5: "rgba(232,0,45,0.12)",
  C6: "rgba(232,0,45,0.12)",
};

const driverSlugOverrides = {
  antonelli: "kimi-antonelli",
  verstappen: "max-verstappen",
  hamilton: "lewis-hamilton",
  russell: "george-russell",
};
function getDriverImage(givenName, familyName) {
  const familyKey = familyName.toLowerCase();

  if (driverSlugOverrides[familyKey]) {
    return `https://www.kymillman.com/wp-content/uploads/f1/pages/driver-profiles/driver-faces/${driverSlugOverrides[familyKey]}-f1-driver-profile-picture.png`;
  }

  const slug = `${givenName}-${familyName}`.toLowerCase().replace(/\s+/g, "-");

  return `https://www.kymillman.com/wp-content/uploads/f1/pages/driver-profiles/driver-faces/${slug}-f1-driver-profile-picture.png`;
}

// ── Weather condition ─────────────────────────────────────────
function getCondition(temp, humidity, wind) {
  if (humidity > 80) return { label: "🌧 Wet Conditions", cls: "wet" };
  if (wind > 40) return { label: "💨 High Winds", cls: "windy" };
  if (temp > 35) return { label: "🔥 Extreme Heat", cls: "hot" };
  if (temp > 28) return { label: "☀ Ideal Racing", cls: "ideal" };
  if (temp < 15) return { label: "🌡 Cold Track", cls: "cold" };
  return { label: "⛅ Fair Conditions", cls: "fair" };
}

// ── Component ─────────────────────────────────────────────────
export default function RaceWeekendHub() {
  const [race, setRace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [topDrivers, setTopDrivers] = useState([]);

  useEffect(() => {
    loadRace();
    loadStandings();
  }, []);

  async function loadRace() {
    try {
      const res = await fetch("https://api.jolpi.ca/ergast/f1/current.json");
      const data = await res.json();
      const races = data?.MRData?.RaceTable?.Races || [];
      const now = new Date();
      const next = races.find(
        (r) => new Date(`${r.date}T${r.time || "00:00:00Z"}`) > now,
      );
      if (!next) return;
      setRace(next);
      loadWeather(next.Circuit.Location.lat, next.Circuit.Location.long);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadWeather(lat, lon) {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`,
      );
      const data = await res.json();
      setWeather(data.current);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadStandings() {
    try {
      // Use /api/standings (Vercel function) — fast, cached, no CORS
      const res = await fetch("/api/standings");
      const data = await res.json();
      if (data.drivers?.length) {
        // Remap to match shape expected below
        setTopDrivers(
          data.drivers.slice(0, 7).map((d) => ({
            position: String(d.position),
            points: d.points,
            Driver: {
              givenName: d.givenName,
              familyName: d.familyName,
              code: d.code,
            },
            Constructors: [{ name: d.team }],
          })),
        );
      }
    } catch {
      // Fallback to Jolpica if /api/standings unavailable
      try {
        const res = await fetch(
          "https://api.jolpi.ca/ergast/f1/current/driverStandings.json",
        );
        const data = await res.json();
        const s =
          data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ||
          [];
        setTopDrivers(s.slice(0, 7));
      } catch (e) {
        console.error(e);
      }
    }
  }

  if (!race) return null;

  const circuitId = race.Circuit.circuitId;
  const slug = trackMapSlugs[circuitId] || circuitId.replace(/_/g, "");
  const trackImage = `https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000001/common/f1/2026/track/2026track${slug}detailed.webp`;
  const info = circuitInfo[circuitId] || {};
  const tyre = tyreData[circuitId] || {
    compounds: ["C2", "C3", "C4"],
    strategy: ["Medium", "Hard"],
    stops: 1,
    note: "1-stop typical",
  };
  const leader = topDrivers[0];

  const isWet =
    weather &&
    (weather.relative_humidity_2m > 80 || (weather.precipitation ?? 0) > 0);
  const isFullWet = weather && weather.relative_humidity_2m > 92;
  const condition = weather
    ? getCondition(
        weather.temperature_2m,
        weather.relative_humidity_2m,
        weather.wind_speed_10m,
      )
    : null;

  // Compound pills for the 3 dry compounds
  const compoundPills = tyre.compounds.map((c, i) => {
    const names = ["Hard", "Medium", "Soft"];
    return {
      code: c,
      name: names[i] || c,
      color: COMPOUND_COLOR[c] || "#888",
      bg: COMPOUND_BG[c] || "rgba(255,255,255,0.06)",
    };
  });

  // Strategy arrow chain e.g. "Soft → Hard" or "Medium → Hard"
  const strategyChain = tyre.strategy.join(" → ");

  return (
    <section className="rwh-section">
      <h2 className="section-title">Race Weekend Hub</h2>
      <p className="subtle">Next race · {race.raceName}</p>

      <div className="rwh-grid">
        {/* ── Circuit Card ─────────────────────────── */}
        <div className="rwh-card rwh-card--circuit">
          <div className="rwh-card-label">Circuit</div>
          <div className="rwh-track-img-wrap">
            <img
              src={trackImage}
              alt={race.Circuit.circuitName}
              className="rwh-track-img"
              onError={(e) => {
                e.currentTarget.style.opacity = "0.15";
              }}
            />
          </div>
          <div className="rwh-card-body">
            <div className="rwh-circuit-name">{race.Circuit.circuitName}</div>
            <div className="rwh-circuit-loc">
              {race.Circuit.Location.locality}, {race.Circuit.Location.country}
            </div>
            <div className="rwh-stats-grid">
              <div className="rwh-stat">
                <span className="rwh-stat-val">{info.laps || "—"}</span>
                <span className="rwh-stat-key">Laps</span>
              </div>
              <div className="rwh-stat">
                <span className="rwh-stat-val">{info.turns || "—"}</span>
                <span className="rwh-stat-key">Turns</span>
              </div>
              <div className="rwh-stat">
                <span className="rwh-stat-val">{info.length || "—"}</span>
                <span className="rwh-stat-key">Length</span>
              </div>
              <div className="rwh-stat">
                <span className="rwh-stat-val">{info.distance || "—"}</span>
                <span className="rwh-stat-key">Race Dist.</span>
              </div>
              <div className="rwh-stat rwh-stat--wide">
                <span className="rwh-stat-val rwh-stat-val--mono">
                  {info.fastestLap || "—"}
                </span>
                {info.fastestLapDriver && (
                  <span className="rwh-lap-driver">
                    {info.fastestLapDriver}
                  </span>
                )}
                <span className="rwh-stat-key">Lap Record</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Weather & Tyres Card ─────────────────── */}
        <div className="rwh-card rwh-card--weather">
          <div className="rwh-card-label">Weather & Tyres</div>
          <div className="rwh-card-body">
            {weather ? (
              <>
                {/* Weather section */}
                <div
                  className={`rwh-condition rwh-condition--${condition.cls}`}
                >
                  {condition.label}
                </div>
                <div className="rwh-weather">
                  <div className="rwh-temp-big">
                    {Math.round(weather.temperature_2m)}
                    <span className="rwh-temp-unit">°C</span>
                  </div>
                  <div className="rwh-weather-rows">
                    <div className="rwh-wx-row">
                      <span className="rwh-wx-icon">🌡</span>
                      <span className="rwh-wx-label">Air Temp</span>
                      <span className="rwh-wx-val">
                        {Math.round(weather.temperature_2m)}°C
                      </span>
                    </div>
                    <div className="rwh-wx-row">
                      <span className="rwh-wx-icon">💧</span>
                      <span className="rwh-wx-label">Humidity</span>
                      <span className="rwh-wx-val">
                        {weather.relative_humidity_2m}%
                      </span>
                    </div>
                    <div className="rwh-wx-row">
                      <span className="rwh-wx-icon">💨</span>
                      <span className="rwh-wx-label">Wind</span>
                      <span className="rwh-wx-val">
                        {weather.wind_speed_10m} km/h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rwh-divider" />

                {/* Tyre section */}
                {isWet ? (
                  <>
                    <div className="rwh-tyre-title">
                      {isFullWet
                        ? "🔵 Full Wet Recommended"
                        : "🟢 Intermediates Recommended"}
                    </div>
                    <div className="rwh-tyre-display">
                      <div className="rwh-tyre-item">
                        <img
                          src={tyreImages.intermediate}
                          alt="Intermediate"
                          className="rwh-tyre-img"
                        />
                        <span className="rwh-tyre-name">Inter</span>
                        <span className="rwh-tyre-sub">Damp track</span>
                      </div>
                      <div className="rwh-tyre-item">
                        <img
                          src={tyreImages.fullWet}
                          alt="Full Wet"
                          className="rwh-tyre-img"
                        />
                        <span className="rwh-tyre-name">Full Wet</span>
                        <span className="rwh-tyre-sub">Heavy rain</span>
                      </div>
                    </div>
                    <div className="rwh-strategy-note">
                      ⚠ Dry strategy below — expect changes
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rwh-tyre-title">Weekend Compounds</div>
                    <div className="rwh-tyre-display">
                      {compoundPills.map(({ code, name, color, bg }) => (
                        <div key={code} className="rwh-tyre-item">
                          <img
                            src={tyreImages[name.toLowerCase()]}
                            alt={name}
                            className="rwh-tyre-img"
                          />
                          <span className="rwh-tyre-name" style={{ color }}>
                            {name}
                          </span>
                          <span
                            className="rwh-compound-pill"
                            style={{ color, background: bg }}
                          >
                            {code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="rwh-divider" />

                {/* Strategy */}
                <div className="rwh-tyre-title">
                  Typical {tyre.stops}-Stop Strategy
                </div>
                <div className="rwh-strategy-chain">{strategyChain}</div>
                <div className="rwh-strategy-note">{tyre.note}</div>
              </>
            ) : (
              <div className="rwh-loading">Loading weather…</div>
            )}
          </div>
        </div>

        {/* ── Championship Card ─────────────────────── */}
        <div className="rwh-card rwh-card--champ">
          <div className="rwh-card-label">Championship Battle</div>
          <div className="rwh-card-body">
            {leader ? (
              <>
                <div className="rwh-leader-img-wrap">
                  <img
                    src={getDriverImage(
                      leader.Driver.givenName,
                      leader.Driver.familyName,
                    )}
                    alt={leader.Driver.familyName}
                    onError={(e) => {
                      e.target.src = "/default-driver.png";
                    }}
                    className="rwh-leader-img"
                  />
                  <div className="rwh-leader-crown">👑</div>
                </div>
                <div className="rwh-leader-name">
                  {leader.Driver.givenName}{" "}
                  <strong>{leader.Driver.familyName}</strong>
                </div>
                <div className="rwh-leader-team">
                  {leader.Constructors?.[0]?.name || ""}
                </div>
                <div className="rwh-leader-pts">
                  {leader.points}
                  <span className="rwh-pts-label"> PTS</span>
                </div>
                <div className="rwh-battle-list">
                  {topDrivers.map((d) => {
                    const gap = Number(leader.points) - Number(d.points);
                    const pct =
                      (Number(d.points) / Number(leader.points)) * 100;
                    return (
                      <div key={d.position} className="rwh-battle-row">
                        <span className="rwh-br-pos">{d.position}</span>
                        <span className="rwh-br-name">
                          {d.Driver.familyName}
                        </span>
                        <div className="rwh-br-bar-wrap">
                          <div
                            className="rwh-br-bar"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="rwh-br-gap">
                          {d.position === "1" ? "Leader" : `+${gap}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="rwh-round-badge">
                  Round {race.round} · {race.Circuit.Location.country}
                </div>
              </>
            ) : (
              <div className="rwh-loading">Loading standings…</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
