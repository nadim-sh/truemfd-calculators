import { Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Calculator, CircleDollarSign, Coins, Goal, Grid3X3, Handshake, Landmark, ShieldCheck, Target, TrendingUp, WalletCards } from "lucide-react";
import { calculators } from "../calculators/definitions";
import { BrandFooter } from "./BrandFooter";
import { MobileNav } from "./MobileNav";
import { BrandHeader } from "./BrandHeader";
import { applySeo } from "./Seo";

export function App() {
  useEffect(() => {
    applySeo({
      title: "Premium Financial Calculators | calculators@TrueMFD",
      description: "Plan SIPs, withdrawals, PPF, goals, and cashflow returns with premium TrueMFD financial calculators.",
      canonical: "https://truemfd-calculators-web.onrender.com/"
    });
  }, []);

  return (
    <main>
      <section className="hero">
        <BrandHeader />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="hero-grid">
          <div>
            <p className="eyebrow ornamental">CALCULATORS@TRUEMFD</p>
            <h1>Premium Financial Calculators</h1>
            <h2 className="hero-subtitle">for Thoughtful Investors</h2>
            <p className="lede">Plan SIPs, withdrawals, PPF, goals, and cashflow returns with clear projections, schedules, and export-ready results.</p>
            <div className="hero-actions">
              <a className="button-link" href="#calculators">Explore Calculators</a>
              <a className="button-link outline" href="https://www.truemfd.com/">Visit TrueMFD.com</a>
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
        {[
          { item: "Trust", text: "Honest advice.", icon: ShieldCheck },
          { item: "Focus", text: "Goal based investing.", icon: Target },
          { item: "Integrity", text: "Always putting interests first.", icon: BadgeCheck },
          { item: "Relationships", text: "Long-term guidance.", icon: Handshake }
        ].map(({ item, text, icon: Icon }) => (
          <div key={item}>
            <Icon aria-hidden />
            <strong>{item}</strong>
            <span>{text}</span>
          </div>
        ))}
      </section>

      <section className="section" id="calculators">
        <div className="section-heading">
          <p className="eyebrow centered">FEATURED CALCULATORS</p>
          <h2>Choose a planning tool</h2>
        </div>
        <div className="card-grid">
          {calculators.map((calculator) => (
            <Link className="calculator-card" to={`/calculators/${calculator.slug}`} key={calculator.slug}>
              <span className="calculator-icon">{iconFor(calculator.slug)}</span>
              <span>{calculator.category}</span>
              <h3>{calculator.name}</h3>
              <p>{calculator.summary}</p>
              <b>Calculate -&gt;</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="section split" id="education">
        <div>
          <p className="eyebrow">Investor education</p>
          <h2>Clear assumptions, no black boxes.</h2>
          <p>Every formula is transparent. Every result is explainable.</p>
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
      <MobileNav />
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
