import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="topbar">
      <header className="container flex space">
        <div className="brand">
          <img className="logo" src="/f1.png" alt="F1 Logo" />
          <div className="brand-title">Formula One Hub</div>
        </div>

        <nav className="flex">
          <button className="menu-btn" onClick={() => setMenuOpen((v) => !v)}>
            {/* burger icon */}
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <ul id="navlist" className={menuOpen ? "open" : ""}>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <HashLink smooth to="/#rankings">
                Rankings
              </HashLink>
            </li>
            <li>
              <HashLink smooth to="/#live">
                Live Stream
              </HashLink>
            </li>
            <li>
              <HashLink smooth to="/#schedule">
                Schedule
              </HashLink>
            </li>
            <li>
              <HashLink smooth to="/#highlights">
                Highlights
              </HashLink>
            </li>
            <li>
              <Link className="cta-small" to="/races">
                Races
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
};
