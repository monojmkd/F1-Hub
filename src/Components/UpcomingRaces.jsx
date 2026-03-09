import React, { useEffect, useState } from "react";

const circuitImages = {
  yas_marina: "/assets/Abu Dhabi.png",
  vegas: "/assets/Las Vegas.png",
  losail: "/assets/Qatar.png",
  albert_park: "/assets/Australian.png",
  shanghai: "/assets/Chinese.png",
  suzuka: "/assets/Japanese.png",
  bahrain: "/assets/Bahrain.png",
  jeddah: "/assets/Saudi Arabian.png",
  miami: "/assets/Miami.png",
  villeneuve: "/assets/Canadian.png",
  monaco: "/assets/Monaco.png",
  catalunya: "/assets/Barcelona.png",
  red_bull_ring: "/assets/Austrian.png",
  silverstone: "/assets/British.png",
  spa: "/assets/Belgian.png",
  hungaroring: "/assets/Hungarian.png",
  zandvoort: "/assets/Dutch.png",
  monza: "/assets/Italian.png",
  madring: "/assets/Spanish.png",
  baku: "/assets/Azerbaijan.png",
  marina_bay: "/assets/Singapore.png",
  americas: "/assets/United States.png",
  rodriguez: "/assets/Mexico City.png",
  interlagos: "/assets/Brazilian.png",
};

function fmtSession(dateStr, timeStr) {
  if (!dateStr) return null;
  const dt = new Date(`${dateStr}T${timeStr || "00:00:00Z"}`);
  const day = dt.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = timeStr
    ? dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;
  return { day, time };
}

// Build the ordered session list for a race object.
// The Ergast API returns FirstPractice, SecondPractice, ThirdPractice,
// Qualifying, Sprint, and SprintQualifying inside each race object.
function buildSessions(race) {
  const isSprint = !!race.Sprint;

  const sessions = [];

  // Practice 1
  if (race.FirstPractice)
    sessions.push({
      label: "FP1",
      ...fmtSession(race.FirstPractice.date, race.FirstPractice.time),
    });

  // Sprint weekend: FP2 is replaced by Sprint Qualifying / Shootout
  if (isSprint) {
    if (race.SecondPractice)
      sessions.push({
        label: "Sprint Quali",
        ...fmtSession(race.SecondPractice.date, race.SecondPractice.time),
      });
    sessions.push({
      label: "Sprint",
      ...fmtSession(race.Sprint.date, race.Sprint.time),
    });
    if (race.ThirdPractice)
      sessions.push({
        label: "FP2",
        ...fmtSession(race.ThirdPractice.date, race.ThirdPractice.time),
      });
  } else {
    if (race.SecondPractice)
      sessions.push({
        label: "FP2",
        ...fmtSession(race.SecondPractice.date, race.SecondPractice.time),
      });
    if (race.ThirdPractice)
      sessions.push({
        label: "FP3",
        ...fmtSession(race.ThirdPractice.date, race.ThirdPractice.time),
      });
  }

  // Qualifying
  if (race.Qualifying)
    sessions.push({
      label: "Qualifying",
      ...fmtSession(race.Qualifying.date, race.Qualifying.time),
    });

  // Race
  sessions.push({
    label: "Race",
    isRace: true,
    ...fmtSession(race.date, race.time),
  });

  return sessions;
}

// Is this session in the past?
function isPast(dateStr, timeStr) {
  if (!dateStr) return false;
  return new Date(`${dateStr}T${timeStr || "00:00:00Z"}`) < new Date();
}

// Is this session happening now (within 3h window)?
function isLive(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const start = new Date(`${dateStr}T${timeStr}`);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const now = new Date();
  return now >= start && now <= end;
}

// ── Component ─────────────────────────────────────────────────
const UpcomingRaces = ({ season = 2026 }) => {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `https://api.jolpi.ca/ergast/f1/${season}.json`,
        );
        const data = await res.json();
        const races = data?.MRData?.RaceTable?.Races || [];
        const now = new Date();

        const index = races.findIndex((r) => {
          const raceEnd = new Date(`${r.date}T${r.time || "14:00:00"}`);
          raceEnd.setHours(raceEnd.getHours() + 3);
          return raceEnd > now;
        });

        setUpcoming(index !== -1 ? races.slice(index, index + 3) : []);
      } catch (err) {
        console.error("Upcoming races error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [season]);

  if (loading) {
    return (
      <section className="upcoming-section">
        <h2 className="section-title">Upcoming Races</h2>
        <div className="uc-loading-row">
          {[0, 1, 2].map((i) => (
            <div key={i} className="uc-skeleton shimmer" />
          ))}
        </div>
      </section>
    );
  }

  if (!upcoming.length) {
    return (
      <section className="upcoming-section">
        <h2 className="section-title">Upcoming Races</h2>
        <p className="subtle">No upcoming races scheduled.</p>
      </section>
    );
  }

  return (
    <section className="upcoming-section">
      <h2 className="section-title">Upcoming Races</h2>
      <p className="subtle">Next {upcoming.length} races on the calendar</p>

      <div className="upcoming-list">
        {upcoming.map((race, i) => {
          const img =
            circuitImages[race.Circuit.circuitId] || "/assets/default.jpg";
          const sessions = buildSessions(race);
          const isSprint = !!race.Sprint;

          return (
            <div key={race.round} className="upcoming-card">
              {i === 0 && <div className="uc-next-tag">Next Race ▶</div>}

              {/* Circuit image */}
              <img src={img} alt={race.raceName} className="circuit-image" />

              {/* Race header info */}
              <div className="uc-info">
                <div className="uc-round-row">
                  <span className="round">Round {race.round}</span>
                  {isSprint && <span className="uc-sprint-badge">Sprint</span>}
                </div>
                <div className="name">{race.raceName}</div>
                <div className="location">
                  {race.Circuit.Location.locality},{" "}
                  {race.Circuit.Location.country}
                </div>
              </div>

              {/* Session schedule */}
              <div className="uc-sessions">
                {sessions.map((s) => {
                  const past = isPast(
                    s.label === "Race"
                      ? race.date
                      : race.FirstPractice?.date, // fallback — state determined by label
                    s.time,
                  );
                  const live = isLive(
                    s.label === "Race" ? race.date : null,
                    s.label === "Race" ? race.time : null,
                  );

                  return (
                    <div
                      key={s.label}
                      className={[
                        "uc-session",
                        s.isRace ? "uc-session--race" : "",
                        live ? "uc-session--live" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="uc-session-label">{s.label}</span>
                      <span className="uc-session-datetime">
                        <span className="uc-session-day">{s.day}</span>
                        {s.time && (
                          <span className="uc-session-time">{s.time}</span>
                        )}
                      </span>
                      {live && <span className="uc-live-pip" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingRaces;
