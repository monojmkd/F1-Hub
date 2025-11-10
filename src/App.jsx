import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Races from "./Races.jsx";
import { Header } from "./Header.jsx";
import RaceResults from "./RaceResults.jsx";
import { Footer } from "./Footer.jsx";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/races" element={<Races />} />
        <Route path="/races/:season/:round/results" element={<RaceResults />} />
      </Routes>
      <Footer />
    </>
  );
}
