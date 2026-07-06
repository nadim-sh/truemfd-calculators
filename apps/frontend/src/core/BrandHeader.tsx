import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  { label: "Home", href: "/" },
  { label: "Calculators", href: "/#calculators" },
  { label: "About", href: "https://www.truemfd.com/" },
  { label: "Contact", href: "mailto:nadim@truemfd.com" }
];

export function BrandHeader() {
  return (
    <nav className="nav brand-header" aria-label="Primary">
      <Link to="/" className="brand-lockup" aria-label="TrueMFD calculators home">
        <span className="brand-mark">T</span>
        <span>
          <strong>TrueMFD</strong>
          <small>AMFI Registered Mutual Fund Distributor</small>
        </span>
      </Link>
      <div className="desktop-links">
        {links.map((link) => link.href.startsWith("/") ? (
          <Link key={link.label} to={link.href}>{link.label}</Link>
        ) : (
          <a key={link.label} href={link.href}>{link.label}</a>
        ))}
      </div>
      <details className="mobile-menu">
        <summary aria-label="Open menu"><Menu aria-hidden /></summary>
        <div>
          {links.map((link) => link.href.startsWith("/") ? (
            <Link key={link.label} to={link.href}>{link.label}</Link>
          ) : (
            <a key={link.label} href={link.href}>{link.label}</a>
          ))}
        </div>
      </details>
    </nav>
  );
}
