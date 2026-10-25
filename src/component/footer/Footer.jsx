import { ArrowUp, ArrowUpRight } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top"><div><p className="handwritten">that’s all. (for now.)</p><a href="#home" className="footer-brand">suprem.sh <span aria-hidden="true">✳</span></a></div><a className="footer-up" href="#home" aria-label="Back to top"><ArrowUp size={34} strokeWidth={1.5} aria-hidden="true" /><span>one more lap?</span></a></div>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} Suprem Shrestha</p><p className="footer-thanks">Thanks for stopping by. Go make something.</p><a href="https://github.com/SupremShrestha/Portfolio" target="_blank" rel="noopener noreferrer">Peek at the code <ArrowUpRight size={14} aria-hidden="true" /></a></div>
      </div>
    </footer>
  );
}
