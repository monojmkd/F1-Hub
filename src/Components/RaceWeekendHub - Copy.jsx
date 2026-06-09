import React, { useEffect, useState } from "react";

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
  catalunya: {
    laps: 66,
    turns: 14,
    length: "4.657 km",
    distance: "307.236 km",
    fastestLap: "1:16.330",
    fastestLapDriver: "Oscar Piastri",
  },
  villeneuve: {
    laps: 70,
    turns: 14,
    length: "4.361 km",
    distance: "305.270 km",
    fastestLap: "1:13.078",
    fastestLapDriver: "Valtteri Bottas",
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
  suzuka: {
    laps: 53,
    turns: 18,
    length: "5.807 km",
    distance: "307.471 km",
    fastestLap: "1:30.965",
    fastestLapDriver: "Kimi Antonelli",
  },
};

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

const tyreCompounds = {
  albert_park: ["C3", "C4", "C5"],
  bahrain: ["C1", "C2", "C3"],
  jeddah: ["C2", "C3", "C4"],
  shanghai: ["C2", "C3", "C4"],
  miami: ["C2", "C3", "C4"],
  imola: ["C3", "C4", "C5"],
  monaco: ["C3", "C4", "C5"],
  catalunya: ["C1", "C2", "C3"],
  villeneuve: ["C3", "C4", "C5"],
  red_bull_ring: ["C3", "C4", "C5"],
  silverstone: ["C1", "C2", "C3"],
  hungaroring: ["C3", "C4", "C5"],
  spa: ["C2", "C3", "C4"],
  zandvoort: ["C1", "C2", "C3"],
  monza: ["C3", "C4", "C5"],
  baku: ["C3", "C4", "C5"],
  marina_bay: ["C3", "C4", "C5"],
  americas: ["C2", "C3", "C4"],
  hermanos_rodriguez: ["C2", "C3", "C4"],
  interlagos: ["C2", "C3", "C4"],
  vegas: ["C3", "C4", "C5"],
  losail: ["C1", "C2", "C3"],
  yas_marina: ["C3", "C4", "C5"],
  suzuka: ["C1", "C2", "C3"],
};

const tyreStrategy = {
  australian: ["C3", "C4", "C5"],
  chinese: ["C2", "C3", "C4"],
  japanese: ["C1", "C2", "C3"],
  bahrain: ["C1", "C2", "C3"],
  saudi_arabian: ["C3", "C4", "C5"],
  miami: ["C3", "C4", "C5"],
  emilia_romagna: ["C4", "C5", "C6"],
  monaco: ["C4", "C5", "C6"],
  spanish: ["C1", "C2", "C3"],
  canadian: ["C4", "C5", "C6"],
  austrian: ["C3", "C4", "C5"],
  british: ["C2", "C3", "C4"],
  belgian: ["C1", "C3", "C4"],
  hungarian: ["C3", "C4", "C5"],
  dutch: ["C2", "C3", "C4"],
  italian: ["C3", "C4", "C5"],
  azerbaijan: ["C4", "C5", "C6"],
  singapore: ["C3", "C4", "C5"],
  usa: ["C1", "C3", "C4"],
  mexico: ["C2", "C4", "C5"],
  brazil: ["C2", "C3", "C4"],
  las_vegas: ["C3", "C4", "C5"],
  qatar: ["C1", "C2", "C3"],
  abu_dhabi: ["C3", "C4", "C5"],
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

// ── Dynamic weather condition ─────────────────────────────────
function getWeatherCondition(temp, humidity, windSpeed) {
  if (humidity > 80) return { label: "🌧 Wet Conditions", cls: "wet" };
  if (windSpeed > 40) return { label: "💨 High Winds", cls: "windy" };
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
    } catch (err) {
      console.error(err);
    }
  }

  async function loadWeather(lat, lon) {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`,
      );
      const data = await res.json();
      setWeather(data.current);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadStandings() {
    try {
      const res = await fetch(
        "https://api.jolpi.ca/ergast/f1/current/driverStandings.json",
      );
      const data = await res.json();
      const s =
        data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ||
        [];
      setTopDrivers(s.slice(0, 7));
    } catch (err) {
      console.error(err);
    }
  }

  if (!race) return null;

  const circuitId = race.Circuit.circuitId;
  const slug = trackMapSlugs[circuitId] || circuitId.replace(/_/g, "");
  const trackImage = `https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000001/common/f1/2026/track/2026track${slug}detailed.webp`;
  const info = circuitInfo[circuitId] || {};
  const leader = topDrivers[0];

  const condition = weather
    ? getWeatherCondition(
        weather.temperature_2m,
        weather.relative_humidity_2m,
        weather.wind_speed_10m,
      )
    : null;

  const compounds = tyreCompounds[circuitId] || ["C2", "C3", "C4"];

  const strategy = tyreStrategy[circuitId] || ["Medium", "Hard"];

  const isWet = weather && weather.relative_humidity_2m > 80;

  return (
    <section className="rwh-section">
      <h2 className="section-title">Race Weekend Hub</h2>
      <p className="subtle">Next race · {race.raceName}</p>

      <div className="rwh-grid">
        {/* ── Circuit Card ─────────────────────────────── */}
        <div className="rwh-card rwh-card--circuit">
          <div className="rwh-card-label">Circuit</div>
          <div className="rwh-track-img-wrap">
            <img
              src={trackImage}
              alt={race.Circuit.circuitName}
              className="rwh-track-img"
              onError={(e) => {
                e.currentTarget.style.opacity = "0.2";
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
                <span className="rwh-stat-key">Distance</span>
              </div>
              <div className="rwh-stat rwh-stat--wide">
                <span className="rwh-stat-val rwh-stat-val--mono">
                  {info.fastestLap || "—"}
                </span>
                {info.fastestLapDriver && (
                  <span className="lap-record-driver">
                    {info.fastestLapDriver}
                  </span>
                )}
                <span className="rwh-stat-key">Lap Record</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Weather Card ─────────────────────────────── */}
        <div className="rwh-card rwh-card--weather">
          <div className="rwh-card-label">Weather & Tyres</div>
          <div className="rwh-card-body">
            {weather ? (
              <>
                <div
                  className={`rwh-condition rwh-condition--${condition.cls}`}
                >
                  {condition.label}
                </div>
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
                    <span className="rwh-wx-label">Wind Speed</span>
                    <span className="rwh-wx-val">
                      {weather.wind_speed_10m} km/h
                    </span>
                  </div>
                  {/* <div className="rwh-wx-row">
                    <span className="rwh-wx-icon">📍</span>
                    <span className="rwh-wx-label">Location</span>
                    <span className="rwh-wx-val">
                      {race.Circuit.Location.locality}
                    </span>
                  </div> */}
                </div>

                <div className="rwh-divider" />

                <div className="rwh-tyre-title">Weekend Compounds</div>

                <div className="rwh-tyre-display">
                  {isWet ? (
                    <>
                      <div className="strategy-tyre">
                        <img src={tyreImages.intermediate} alt="Intermediate" />
                        <span className="tyre-type">Intermediate</span>
                        <span className="tyre-code">Wet Track</span>
                      </div>

                      <div className="strategy-tyre">
                        <img src={tyreImages.fullWet} alt="Wet" />
                        <span className="tyre-type">Full Wet</span>
                        <span className="tyre-code">Heavy Rain</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="strategy-tyre">
                        <img src={tyreImages.hard} alt="Hard" />
                        <span className="tyre-type">Hard</span>
                        <span className="tyre-code">{compounds[0]}</span>
                      </div>

                      <div className="strategy-tyre">
                        <img src={tyreImages.medium} alt="Medium" />
                        <span className="tyre-type">Medium</span>
                        <span className="tyre-code">{compounds[1]}</span>
                      </div>

                      <div className="strategy-tyre">
                        <img src={tyreImages.soft} alt="Soft" />
                        <span className="tyre-type">Soft</span>
                        <span className="tyre-code">{compounds[2]}</span>
                      </div>
                    </>
                  )}
                </div>

                {!isWet && (
                  <>
                    <div className="rwh-divider" />
                    <div className="rwh-strategy-fit">
                      <div className="rwh-tyre-title">Typical Strategy : </div>
                      <div className="strategy-chain">
                        {" "}
                        {strategy.join(" ➜ ")}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="rwh-loading">Loading weather…</div>
            )}
          </div>
        </div>

        {/* ── Championship Card ─────────────────────────── */}
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
