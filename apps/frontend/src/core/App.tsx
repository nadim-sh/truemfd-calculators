import { Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Calculator, CircleDollarSign, Coins, Goal, Grid3X3, Handshake, Landmark, ShieldCheck, Target, TrendingUp, WalletCards } from "lucide-react";
import { calculators } from "../calculators/definitions";
import { BrandFooter } from "./BrandFooter";
import { MobileNav } from "./MobileNav";
import { BrandHeader } from "./BrandHeader";
import { applySeo } from "./Seo";
import { InstallPrompt } from "./InstallPrompt";

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
      <section className="landing-top">
        <BrandHeader />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landing-hero">
          <div className="hero-copy">
            <div className="hero-brand-card" aria-label="TrueMFD identity">
              <img src="/assets/truemfd-logo.png" alt="TrueMFD logo" />
              <div>
                <strong>TrueMFD</strong>
                <span>AMFI REGISTERED MUTUAL FUND DISTRIBUTOR</span>
              </div>
            </div>
            <div className="hero-founder-line" aria-label="Founder and registration details">
              <span>NADIM SARFRAZ HUSAIN</span>
              <span>ARN-2213</span>
              <span>EUIN-E073190</span>
            </div>
            <p className="eyebrow ornamental">PREMIUM FINANCIAL CALCULATORS</p>
            <h1>Plan Smarter. Invest Better. Grow Confidently.</h1>
            <p className="lede">Powerful financial calculators designed to help investors make informed investment decisions with confidence.</p>
            <div className="trust-badges" aria-label="Calculator strengths">
              {["Accurate", "Reliable", "Insightful", "Investor-First"].map((item) => <span key={item}><BadgeCheck aria-hidden /> {item}</span>)}
            </div>
            <div className="hero-actions">
              <a className="button-link" href="#calculators">Explore Calculators</a>
              <a className="button-link outline" href="#education">Learn More</a>
            </div>
          </div>

          <div className="hero-insights" aria-label="Premium investment workspace">
            <div className="wealth-card main">
              <span>SIP Future Value</span>
              <strong>Rs 2,45,67,890</strong>
              <small>Illustrative projection for long-term planning</small>
            </div>
            <div className="hero-chart" aria-hidden>
              {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
            </div>
            <div className="wealth-card compact">
              <span>Estimated Return</span>
              <strong>13.24%</strong>
            </div>
            <div className="wealth-card compact second">
              <span>Total Investment</span>
              <strong>Rs 36,00,000</strong>
            </div>
          </div>
        </motion.div>
        <div className="brand-strip" aria-label="TrueMFD brand details">
          <img src="/assets/truemfd-logo.png" alt="TrueMFD logo" />
          <div>
            <strong>TrueMFD</strong>
            <span>AMFI Registered Mutual Fund Distributor</span>
          </div>
          <p>9822204877 / 9284731200</p>
          <p>nadim@truemfd.com</p>
          <p>www.truemfd.com</p>
          <p>ARN-2213 | EUIN-E073190</p>
        </div>

        <section className="calculator-dashboard" id="calculators" aria-label="Calculator selection dashboard">
          <div className="dashboard-heading">
            <div>
              <p className="eyebrow">OUR CALCULATORS</p>
              <h2>Choose a Planning Tool</h2>
            </div>
            <span>Nine precision financial calculators for every investment decision.</span>
          </div>
          <div className="dashboard-grid">
            {calculators.map((calculator, index) => (
              <Link className="calculator-card" style={{ animationDelay: `${index * 80}ms` }} to={`/calculators/${calculator.slug}`} key={calculator.slug}>
                <span className="calculator-icon">{iconFor(calculator.slug)}</span>
                <span>{calculator.category}</span>
                <h3>{calculator.name}</h3>
                <p>{calculator.summary}</p>
                <b>Calculate -&gt;</b>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <section className="benefits-section" aria-label="Benefits">
        {[
          ["Fast Decisions", "Live calculations update as assumptions change."],
          ["Clear Outputs", "Charts, schedules, copy, PDF, and CSV exports stay consistent."],
          ["Advisory Ready", "Designed for client conversations and goal-based planning."]
        ].map(([title, text]) => (
          <article key={title}>
            <ShieldCheck aria-hidden />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="why-section" aria-label="Why TrueMFD">
        <div className="why-heading">
          <p className="eyebrow centered">WHY TRUEMFD</p>
          <h2>Premium guidance with clarity and care.</h2>
        </div>
        <div className="brand-principles">
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
      <InstallPrompt />
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
