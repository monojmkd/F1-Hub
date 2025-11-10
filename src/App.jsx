import React, { useEffect, useRef, useState } from 'react'

export default function App(){
  const [menuOpen, setMenuOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const heroRef = useRef(null)
  const heroInnerRef = useRef(null)
  const trackRef = useRef(null)
  // const audioCtxRef = useRef(null)

  // Dynamic year
  const year = new Date().getFullYear()

  // IntersectionObserver fade-in
  useEffect(()=>{
    const els = document.querySelectorAll('.fade-in')
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('is-visible') })
    }, { threshold: .15 })
    els.forEach(el=>obs.observe(el))
    return ()=>obs.disconnect()
  }, [])

  // Hero tilt interaction
  useEffect(()=>{
    const hero = heroRef.current
    const inner = heroInnerRef.current
    if(!hero || !inner) return

    const onMove = (e)=>{
      const { clientX, clientY } = e
      const x = (clientX / window.innerWidth - 0.5) * 20
      const y = (clientY / window.innerHeight - 0.5) * 20
      inner.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`
    }
    const onLeave = ()=>{ inner.style.transform = 'rotateY(0deg) rotateX(0deg)' }
    hero.addEventListener('mousemove', onMove)
    hero.addEventListener('mouseleave', onLeave)
    return ()=>{
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // Carousel wheel horizontal scroll
  useEffect(()=>{
    const track = trackRef.current
    if(!track) return
    const onWheel = (e)=>{
      if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
        e.preventDefault()
        track.scrollLeft += e.deltaY
      }
    }
    track.addEventListener('wheel', onWheel, { passive:false })
    return ()=> track.removeEventListener('wheel', onWheel)
  }, [])


  useEffect(()=>{
    const hero = heroRef.current
    if(!hero) return
    const onEnter = ()=> playEngineRev()
    const onClick = ()=> playEngineRev()
    hero.addEventListener('mouseenter', onEnter)
    hero.addEventListener('click', onClick)
    return ()=>{
      hero.removeEventListener('mouseenter', onEnter)
      hero.removeEventListener('click', onClick)
    }
  }, [soundOn])

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <header className="container flex space">
          <div className="brand">
            <div className="logo" aria-label="F1 Logo placeholder"></div>
            <div className="brand-title">Formula One Hub</div>
          </div>
          <nav className="flex">
            <button className="menu-btn" aria-label="Toggle menu" title="Menu" onClick={()=>setMenuOpen(v=>!v)}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <ul id="navlist" className={menuOpen ? 'open' : ''}>
              <li><a href="#home">Home</a></li>
              <li><a href="#rankings">Rankings</a></li>
              <li><a href="#live">Live Stream</a></li>
              <li><a href="#schedule">Schedule</a></li>
              <li><a href="#highlights">Highlights</a></li>
              {/* <li><a href="#contact" className="cta-small">Contact</a></li> */}
            </ul>
          </nav>
        </header>
      </div>

      {/* Hero */}
      <section id="home" className="hero" ref={heroRef}>
        <div className="slideshow">
          {/* Replace with your images */}
          <div className="slide" style={{backgroundImage:"url('/img3.png')"}}></div>
          <div className="slide" style={{backgroundImage:"url('/img2.png')"}}></div>
          <div className="slide" style={{backgroundImage:"url('/img1.png')"}}></div>
        </div>
        <div className="hero-inner container fade-in" ref={heroInnerRef}>
          <h1>Experience the Thrill of Formula 1</h1>
          <p>Live speed. Live strategy. Live drama. Catch real‑time updates and stream every heart‑pounding lap.</p>
          <div className="actions">
            <a href="#live" className="btn btn-red">Watch Live</a>
            <a href="#rankings" className="btn btn-dark">View Rankings</a>
            {/* <button
              className={`sound-toggle ${soundOn ? 'on' : ''}`}
              aria-pressed={soundOn ? 'true' : 'false'}
              onClick={()=>setSoundOn(s=>!s)}
              title={soundOn ? 'Sound: ON' : 'Sound: OFF'}
            >
              🔊
            </button> */}
          </div>
        </div>
      </section>

      {/* Rankings */}
      <section id="rankings" className="container">
        <h2 className="section-title">Driver Rankings</h2>
        <p className="subtle">Table-style layout with alternating red/black glass rows. Replace with dynamic data later.</p>
        <div className="panel rankings fade-in">
          <table className="table" aria-label="F1 Driver Rankings">
            <thead>
              <tr>
                <th>Position</th>
                <th>Driver</th>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><span className="badge">1</span></td><td>Max Placeholder</td><td>Red Bull Placeholder</td><td>402</td></tr>
              <tr><td><span className="badge">2</span></td><td>Lewis Placeholder</td><td>Mercedes Placeholder</td><td>366</td></tr>
              <tr><td><span className="badge">3</span></td><td>Charles Placeholder</td><td>Ferrari Placeholder</td><td>312</td></tr>
              <tr><td><span className="badge">4</span></td><td>Lando Placeholder</td><td>McLaren Placeholder</td><td>280</td></tr>
              <tr><td><span className="badge">5</span></td><td>Fernando Placeholder</td><td>Aston Martin Placeholder</td><td>210</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Live Stream */}
      <section id="live" className="container">
        <h2 className="section-title">Live Stream</h2>
        <p className="subtle">Embed your player in the black‑bordered area. Right panel shows lap count, race stats, and top 5 in real time.</p>
        <div className="live-grid fade-in">
          <div className="player" aria-label="Live streaming player placeholder"></div>
          <div className="server-switch">
            <button className="btn btn-red server-btn">Server 1</button>
            <button className="btn btn-dark server-btn">Server 2</button>
            <button className="btn btn-dark server-btn">Server 3</button>
            <select className="server-dropdown" defaultValue="Server 1">
              <option>Server 1</option>
              <option>Server 2</option>
              <option>Server 3</option>
            </select>
          </div>
          <aside className="stats" aria-label="Live race stats">
            <h4>Race Stats</h4>
            <div className="stat-grid">
              <div className="stat"><div>Lap</div><strong>36 / 58</strong></div>
              <div className="stat"><div>Track Temp</div><strong>44°C</strong></div>
              <div className="stat"><div>Safety Car</div><strong>No</strong></div>
              <div className="stat"><div>DRS</div><strong>Enabled</strong></div>
            </div>
            <h4>Top 5</h4>
            <ol className="top5">
              <li><span>1. Max Placeholder</span> <strong>— +0.0s</strong></li>
              <li><span>2. Charles Placeholder</span> <strong>— +1.2s</strong></li>
              <li><span>3. Lando Placeholder</span> <strong>— +2.9s</strong></li>
              <li><span>4. Lewis Placeholder</span> <strong>— +5.1s</strong></li>
              <li><span>5. Fernando Placeholder</span> <strong>— +7.6s</strong></li>
            </ol>
          </aside>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="container">
        <h2 className="section-title">Upcoming Races</h2>
        <p className="subtle">Grid cards with circuit image placeholder and date/time. Red hover glow effect.</p>
        <div className="cards fade-in">
          <article className="card"><div className="thumb"></div><div className="body"><div className="badge-red">Round 1</div><h3 style={{margin:'10px 0 6px'}}>Bahrain Grand Prix</h3><div style={{opacity:.85}}>Sakhir | Sun, 20:30 IST</div></div></article>
          <article className="card"><div className="thumb"></div><div className="body"><div className="badge-red">Round 2</div><h3 style={{margin:'10px 0 6px'}}>Saudi Arabian Grand Prix</h3><div style={{opacity:.85}}>Jeddah | Sat, 22:00 IST</div></div></article>
          <article className="card"><div className="thumb"></div><div className="body"><div className="badge-red">Round 3</div><h3 style={{margin:'10px 0 6px'}}>Australian Grand Prix</h3><div style={{opacity:.85}}>Melbourne | Sun, 05:30 IST</div></div></article>
          <article className="card"><div className="thumb"></div><div className="body"><div className="badge-red">Round 4</div><h3 style={{margin:'10px 0 6px'}}>Japanese Grand Prix</h3><div style={{opacity:.85}}>Suzuka | Sun, 08:30 IST</div></div></article>
        </div>
      </section>

      {/* Highlights */}
      <section id="highlights" className="container">
        <h2 className="section-title">Highlights</h2>
        <p className="subtle">Scroll‑snap carousel with recap thumbnails and minimal play icon.</p>
        <div className="carousel fade-in">
          <div className="track" id="carouselTrack" ref={trackRef}>
            <article className="slide-card"><div className="thumb"><span className="play" aria-hidden="true"></span></div><div className="body"><strong>Race Recap — Monza</strong><div style={{opacity:.85}}>3:42</div></div></article>
            <article className="slide-card"><div className="thumb"><span className="play" aria-hidden="true"></span></div><div className="body"><strong>Last‑lap Drama — Silverstone</strong><div style={{opacity:.85}}>5:01</div></div></article>
            <article className="slide-card"><div className="thumb"><span className="play" aria-hidden="true"></span></div><div className="body"><strong>Under the Lights — Singapore</strong><div style={{opacity:.85}}>4:15</div></div></article>
            <article className="slide-card"><div className="thumb"><span className="play" aria-hidden="true"></span></div><div className="body"><strong>Wheel‑to‑Wheel — Austin</strong><div style={{opacity:.85}}>2:58</div></div></article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact">
        <div className="accent-line"></div>
        <div className="container foot-grid">
          <small>© <span>{year}</span> Formula One Hub. All rights reserved.</small>
          {/* <div className="social" aria-label="social links">
            <a href="#" aria-label="Facebook" title="Facebook">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 9H16V6h-2.5C11.57 6 10 7.57 10 9.5V11H8v3h2v6h3v-6h2.1l.9-3H13v-1.5c0-.28.22-.5.5-.5Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="#" aria-label="YouTube" title="YouTube">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 12s0-3.5-.45-5.1c-.25-.95-.99-1.7-1.94-1.94C18.96 4.5 12 4.5 12 4.5s-6.96 0-8.61.46c-.95.24-1.7.99-1.94 1.94C1 8.5 1 12 1 12s0 3.5.45 5.1c.24.95.99 1.7 1.94 1.94C5.04 19.5 12 19.5 12 19.5s6.96 0 8.61-.46c.95-.24 1.69-.99 1.94-1.94C23 15.5 23 12 23 12Zm-13 3.05v-6.1L16 12 10 15.05Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram" title="Instagram">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7a5 5 0 100 10 5 5 0 000-10Zm7-1.5a1.5 1.5 0 11-3.001-.001A1.5 1.5 0 0119 5.5ZM12 2c2.717 0 3.056.01 4.124.06 1.066.049 1.795.218 2.434.465.66.255 1.218.597 1.775 1.154.557.557.899 1.115 1.154 1.775.247.639.416 1.368.465 2.434.05 1.068.06 1.407.06 4.124s-.01 3.056-.06 4.124c-.049 1.066-.218 1.795-.465 2.434a4.83 4.83 0 01-1.154 1.775 4.83 4.83 0 01-1.775 1.154c-.639.247-1.368.416-2.434.465-1.068.05-1.407.06-4.124.06s-3.056-.01-4.124-.06c-1.066-.049-1.795-.218-2.434-.465a4.83 4.83 0 01-1.775-1.154 4.83 4.83 0 01-1.154-1.775c-.247.639-.416 1.368-.465 2.434C2.01 15.056 2 14.717 2 12s.01-3.056.06-4.124c.049-1.066.218-1.795.465-2.434.255-.66.597-1.218 1.154-1.775.557-.557 1.115-.899 1.775-1.154.639-.247 1.368-.416 2.434-.465C8.944 2.01 9.283 2 12 2Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="#" aria-label="X/Twitter" title="X">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3l8.3 10.2L3.6 21h2.8l6-6.7 4.7 6.7H21l-8.7-12L20.3 3h-2.8l-5.5 6.1L7.6 3H3z" fill="currentColor"/>
              </svg>
            </a>
          </div> */}
        </div>
        <div className="container" >
          <nav className="foot-nav">
            <a href="#home">Home</a>
            <a href="#rankings">Rankings</a>
            <a href="#live">Live</a>
            <a href="#schedule">Schedule</a>
            <a href="#highlights">Highlights</a>
            <a href="#contact">Contact</a>
          </nav>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" , marginTop:"-18px"}}>
  <p>-</p>
  <p style={{ color: "black" }}>Made by MKD</p>
</div>
        </div>
    
      </footer>
    </div>
  )
}
