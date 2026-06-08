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
  red_bull_ring: {
    laps: 71,
    turns: 10,
    length: "4.318 km",
  },
  catalunya: {
    laps: 66,
    turns: 14,
    length: "4.657 km",
  },
  interlagos: {
    laps: 71,
    turns: 15,
    length: "4.309 km",
  },
  vegas: {
    laps: 50,
    turns: 17,
    length: "6.201 km",
  },
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

      const nextRace = races.find(
        (r) => new Date(`${r.date}T${r.time || "00:00:00Z"}`) > now,
      );

      if (!nextRace) return;

      setRace(nextRace);

      loadWeather(
        nextRace.Circuit.Location.lat,
        nextRace.Circuit.Location.long,
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function loadWeather(lat, lon) {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`,
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

      const standings =
        data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ||
        [];

      setTopDrivers(standings.slice(0, 3));
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

  return (
    <section className="race-weekend-hub">
      <h2 className="section-title">Race Weekend Hub</h2>

      <div className="hub-grid">
        {/* Circuit Card */}
        <div className="hub-card">
          <h3>Circuit of the Week</h3>

          <img
            src={trackImage}
            alt={race.Circuit.circuitName}
            className="track-image"
          />

          <h4>{race.raceName}</h4>

          <p>{race.Circuit.circuitName}</p>

          <div className="track-stats">
            <span>Length: {info.length || "--"}</span>
            <span>Turns: {info.turns || "--"}</span>
            <span>Laps: {info.laps || "--"}</span>
          </div>
        </div>

        {/* Weather Card */}
        <div className="hub-card">
          <h3>Weather at Track</h3>

          {weather ? (
            <>
              <div className="weather-temp">
                {Math.round(weather.temperature_2m)}°C
              </div>

              <div className="weather-details">
                <div className="weather-row">
                  <span>🌡 Air Temp</span>
                  <strong>{Math.round(weather.temperature_2m)}°C</strong>
                </div>

                <div className="weather-row">
                  <span>💧 Humidity</span>
                  <strong>{weather.relative_humidity_2m}%</strong>
                </div>

                <div className="weather-row">
                  <span>💨 Wind</span>
                  <strong>{weather.wind_speed_10m} km/h</strong>
                </div>

                <div className="weather-row">
                  <span>📍 Location</span>
                  <strong>{race.Circuit.Location.locality}</strong>
                </div>
              </div>

              <div className="weather-condition">☀ Ideal Racing Conditions</div>
            </>
          ) : (
            <p>Loading weather...</p>
          )}
        </div>

        {/* Championship Card */}
        <div className="hub-card championship-card">
          <h3>Championship Battle</h3>

          {leader && (
            <>
              <img
                className="leader-image"
                src={getDriverImage(
                  leader.Driver.givenName,
                  leader.Driver.familyName,
                )}
                alt={leader.Driver.familyName}
                onError={(e) => {
                  e.target.src = "/default-driver.png";
                }}
              />

              <h4>
                {leader.Driver.givenName} {leader.Driver.familyName}
              </h4>

              <div className="leader-points">{leader.points} pts</div>

              <div className="battle-list">
                {topDrivers.map((driver) => {
                  const gap = Number(leader.points) - Number(driver.points);

                  return (
                    <div key={driver.position} className="battle-row">
                      <span>
                        {driver.position}. {driver.Driver.familyName}
                      </span>

                      <span>
                        {driver.position === "1" ? "Leader" : `+${gap}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="race-badge">Round {race.round}</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
