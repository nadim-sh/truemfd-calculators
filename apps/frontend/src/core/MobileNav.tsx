import { BookOpen, Calculator, Home, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <Link to="/"><Home aria-hidden /> Home</Link>
      <Link to="/#calculators"><Calculator aria-hidden /> Calculators</Link>
      <Link to="/#education"><BookOpen aria-hidden /> Insights</Link>
      <a href="mailto:nadim@truemfd.com"><Mail aria-hidden /> Contact</a>
    </nav>
  );
}
