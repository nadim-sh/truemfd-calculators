import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

export function BrandFooter() {
  return (
    <footer className="brand-footer">
      <div className="footer-brand">
        <img className="brand-logo footer-logo" src="/assets/truemfd-logo.png" alt="TrueMFD logo" />
        <div>
          <strong>TrueMFD</strong>
          <p>Nadim Sarfraz Husain</p>
          <span>AMFI Registered Mutual Fund Distributor | ARN-2213 | EUIN-E073190</span>
        </div>
      </div>
      <div className="footer-contact" aria-label="TrueMFD contact details">
        <a href="mailto:nadim@truemfd.com"><Mail aria-hidden /> nadim@truemfd.com</a>
        <a href="https://www.truemfd.com"><ShieldCheck aria-hidden /> www.truemfd.com</a>
        <span><Phone aria-hidden /> 9822204877 / 9284731200</span>
        <span><MapPin aria-hidden /> Nagpur, Maharashtra</span>
      </div>
      <p className="risk-note">Mutual fund investments are subject to market risks. Read all scheme related documents carefully.</p>
    </footer>
  );
}
