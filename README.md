<div align="center">
  <img src="https://github.com/monojmkd/F1-Hub/blob/main/public/Screenshot-home.png" alt="Formula One Hub Preview" width="800px" />
</div>

# 🏎️ Formula One Hub — Live F1 Dashboard

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Responsive](https://img.shields.io/badge/Responsive%20UI-Yes-blue?style=for-the-badge)

> ⚡ A sleek, real-time **Formula 1 dashboard** built with React + Vite — featuring live race streams, driver standings, upcoming races, results, and highlights powered by the **Ergast F1 API**.

---

## 🚀 Live Demo

🔴 **[View Demo on Vercel →](https://f1-hub-one.vercel.app/)**

---

## 🏁 Overview

**Formula One Hub** is a real-time, API-powered Formula 1 Dashboard.  
It combines race schedules, driver standings, race stats, live streams, and highlights — all in one clean, F1-inspired interface.

<div align="center">
  <img src="https://github.com/monojmkd/F1-Hub/blob/main/public/f1.png" alt="Formula One Hub Preview" width="500px" />
</div>

---

## 🧩 Features

### 🎥 Live Stream

- Watch Formula 1 races from multiple streaming sources
- Popup-blocked iframe overlay
- Seamless **server switching (Server 1–4)**
- Fully **responsive**, adjusts aspect ratio dynamically

### 🧑‍💼 Driver Rankings

- Displays **Top 5 drivers** with names, teams, and points
- Auto-fetched from **Ergast F1 API**

### 🏎️ Race Stats

- Fetches latest race results and winners
- Displays laps, date, and track info dynamically

### 📅 Upcoming Races

- Shows **next races** based on real-time date
- Displays **circuit name, location, and image preview**

### 🎬 Highlights

- YouTube highlight thumbnails
- Lazy-loaded preview + shimmer loading
- Carousel navigation

### 💡 UI/UX

- Modern **dark F1 theme**
- Clean typography (`Orbitron`, `Rajdhani`)
- Mobile-first responsive layout

---

## ⚙️ Tech Stack

| Tech                                  | Purpose                             |
| ------------------------------------- | ----------------------------------- |
| ⚛️ **React + Vite**                   | Frontend framework & fast bundling  |
| 🧮 **Ergast F1 API**                  | Race data, standings, and schedules |
| 🎞️ **YouTube API**                    | Highlights and media integration    |
| 💅 **CSS3 / Flexbox / Media Queries** | Responsive design                   |
| 🔁 **React Router**                   | Page navigation                     |
| 🌐 **Fetch API**                      | Async data calls                    |

---

## 📡 API References

| Endpoint                | URL                                                        |
| ----------------------- | ---------------------------------------------------------- |
| 🧑‍🚀 **Driver Standings** | `https://api.jolpi.ca/ergast/f1/2025/driverstandings.json` |
| 🏁 **Race Schedule**    | `https://api.jolpi.ca/ergast/f1/2025.json`                 |
| 🧾 **Race Results**     | `https://api.jolpi.ca/ergast/f1/2025/{round}/results.json` |
| 🏢 **Constructors**     | `https://api.jolpi.ca/ergast/f1/constructors.json`         |

---

👨‍💻 Developer
Developed by Monoj Das

## 📜 License

This project is licensed under the MIT License — free to use, modify, and distribute with attribution.

This website does not create, host, or share any video content. All video streams are from external websites that are freely available online.
