import { Link } from "react-router-dom";
import { BrandFooter } from "./BrandFooter";
import { MobileNav } from "./MobileNav";

export function NotFound() {
  return (
    <main>
      <section className="page-hero not-found-hero">
        <Link to="/" className="brand-lockup back-link">
          <span className="brand-mark">T</span>
          <span>
            <strong>TrueMFD</strong>
            <small>calculators</small>
          </span>
        </Link>
        <p className="eyebrow">Page not found</p>
        <h1>Calculator route not found.</h1>
        <p>The calculator you opened is unavailable or the link is incomplete.</p>
      </section>
      <section className="section">
        <Link className="button-link" to="/">Back to calculators</Link>
      </section>
      <BrandFooter />
      <MobileNav />
    </main>
  );
}
