import React, { useState, useEffect } from "react";
import RaceStats from "./RaceStats";

const AutoRaceStats = ({ year = 2025 }) => {
  const [round, setRound] = useState(null);

  useEffect(() => {
    async function fetchLatestRound() {
      try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
        const data = await res.json();

        const races = data?.MRData?.RaceTable?.Races || [];
        if (!races.length) return;

        const now = new Date();

        // Only races whose date/time is BEFORE now
        const completed = races.filter((r) => {
          const raceDate = new Date(`${r.date}T${r.time}`);
          return raceDate < now;
        });

        // Pick the latest completed race
        const latest = completed[completed.length - 1];

        if (latest) {
          setRound(latest.round);
        } else {
          // If no races have happened yet → show first race
          setRound(1);
        }
      } catch (e) {
        console.error("Error loading schedule:", e);
      }
    }

    fetchLatestRound();
  }, [year]);

  if (!round) return <p>Loading latest race...</p>;

  return <RaceStats year={year} round={round} />;
};

export default AutoRaceStats;
