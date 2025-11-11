import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer id="contact">
      <div className="accent-line"></div>

      <div className="container foot-grid" style={{ display: "block" }}>
        <small>
          © <span>{year}</span> Formula One Hub. All rights reserved.
        </small>
        <span> </span>
        <small>
          Formula One Hub is an unofficial project and is not associated in any
          way with the Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA
          FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade
          marks of Formula One Licensing B.V.
        </small>
      </div>

      <div className="container">
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            marginTop: "-18px",
          }}
        >
          <p>-</p>
          <p style={{ color: "black" }}>Made by MKD</p>
        </div>
      </div>
    </footer>
  );
};
