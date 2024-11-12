import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/kh-donghua.appspot.com/o/logo%2F_1_logo_donghua.png?alt=media&token=c029014a-8ad1-4d2f-a08a-e075791b720e" 
            alt="KH-DONGHUA Logo" 
            className="footer-logo"
          />
          <span className="footer-brand-name">KH-DONGHUA</span>
        </div>
        
        <nav className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </nav>

        <div className="footer-copyright">
          © {new Date().getFullYear()} KH-DONGHUA. Developed by <span className="developer-name">SEANG SENGLY</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 