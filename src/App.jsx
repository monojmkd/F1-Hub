import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Races from "./Components/Races.jsx";
import { Header } from "./Components/Header.jsx";
import RaceResults from "./Components/RaceResults.jsx";
import { Footer } from "./Components/Footer.jsx";

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
