import { ArrowUp, ArrowUpRight } from 'lucide-react';
import './Footer.css';
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top"><p className="mono">BUILT WITH INTENTION.<br />ALWAYS IN PROGRESS.</p><a className="footer-up" href="#home" aria-label="Back to top"><span className="mono">BACK TO TOP</span><span><ArrowUp size={21} aria-hidden="true" /></span></a></div>
        <a href="#home" className="footer-brand" aria-label="Suprem Shrestha, back to home">suprem<span aria-hidden="true">✳</span></a>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} Suprem Shrestha</p><p className="footer-thanks">Made in Kathmandu. Built for everywhere.</p><a href="https://github.com/SupremShrestha/Portfolio" target="_blank" rel="noopener noreferrer">View source <ArrowUpRight size={13} aria-hidden="true" /></a></div>
      </div>
    </footer>
  );
}
