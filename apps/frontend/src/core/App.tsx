import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calculator, CircleDollarSign, Coins, Goal, Grid3X3, Landmark, Search, ShieldCheck, Target, TrendingUp, WalletCards } from "lucide-react";
import { calculators } from "../calculators/definitions";
import { BrandFooter } from "./BrandFooter";

export function App() {
  return (
    <main>
      <section className="hero">
        <nav className="nav" aria-label="Primary">
          <Link to="/" className="brand-lockup" aria-label="TrueMFD calculators home">
            <span className="brand-mark">T</span>
            <span>
              <strong>TrueMFD</strong>
              <small>AMFI registered mutual fund distributor</small>
            </span>
          </Link>
          <a href="#contact">Contact</a>
        </nav>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="hero-grid">
          <div>
            <p className="eyebrow">calculators@TrueMFD</p>
            <h1>Premium financial calculators for thoughtful investors.</h1>
            <p className="lede">Plan SIPs, withdrawals, PPF, goals, and cashflow returns with clear projections, schedules, and export-ready results.</p>
            <div className="search-box">
              <Search aria-hidden />
              <input aria-label="Quick search calculators" placeholder="Search SIP, SWP, PPF, XIRR..." />
            </div>
          </div>
          <div className="trust-panel" aria-label="Trust highlights">
            <ShieldCheck aria-hidden />
            <h2>Built for advisory confidence</h2>
            <p>Reusable financial engine, transparent assumptions, responsive UI, and API-first architecture.</p>
          </div>
        </motion.div>
      </section>

      <section className="brand-principles" aria-label="TrueMFD principles">
        {["Trust", "Focus", "Integrity", "Relationships"].map((item) => (
          <div key={item}>
            <strong>{item}</strong>
            <span>{item === "Trust" ? "Honest advice." : item === "Focus" ? "Goal based investing." : item === "Integrity" ? "Always putting interests first." : "Long-term guidance."}</span>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Featured calculators</p>
          <h2>Choose a planning tool</h2>
        </div>
        <div className="card-grid">
          {calculators.map((calculator) => (
            <Link className="calculator-card" to={`/calculators/${calculator.slug}`} key={calculator.slug}>
              <span className="calculator-icon">{iconFor(calculator.slug)}</span>
              <span>{calculator.category}</span>
              <h3>{calculator.name}</h3>
              <p>{calculator.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section split" id="contact">
        <div>
          <p className="eyebrow">Investor education</p>
          <h2>Clear assumptions, no black boxes.</h2>
        </div>
        <div className="faq-list">
          <details open>
            <summary>Are returns guaranteed?</summary>
            <p>No. Calculations are illustrations based on entered assumptions and do not promise future performance.</p>
          </details>
          <details>
            <summary>Can this integrate with truemfd.com?</summary>
            <p>Yes. The app is static frontend plus versioned REST APIs, ready for website embedding and deployment.</p>
          </details>
        </div>
      </section>
      <BrandFooter />
    </main>
  );
}

function iconFor(slug: string) {
  switch (slug) {
    case "standard-sip": return <Target aria-hidden />;
    case "step-up-sip": return <TrendingUp aria-hidden />;
    case "lumpsum": return <Coins aria-hidden />;
    case "goal-sip": return <Goal aria-hidden />;
    case "swp": return <WalletCards aria-hidden />;
    case "ppf": return <Landmark aria-hidden />;
    case "sip-vs-lumpsum": return <CircleDollarSign aria-hidden />;
    case "xirr": return <Calculator aria-hidden />;
    default: return <Grid3X3 aria-hidden />;
  }
}
