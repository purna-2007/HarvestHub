import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../Languagecontext";

function Navbar() {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <nav className="hh-navbar">
      <div className="hh-navbar-container">

        {/* Logo */}
        <Link to="/" className="hh-logo">
          <div className="hh-logo-icon">🌾</div>

          <div className="hh-logo-text">
            <span>Harvest</span>
            <strong>Hub</strong>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hh-nav-links">
          <Link to="/" className="hh-nav-link">
            {t("home")}
          </Link>

          <a href="#how-it-works" className="hh-nav-link">
            {t("howItWorks")}
          </a>

          <a href="#work-categories" className="hh-nav-link">
            {t("workCategories")}
          </a>
        </div>

        {/* Right Side */}
        <div className="hh-navbar-actions">

          {/* Language */}
          <div className="hh-language-wrapper">
            <span className="hh-language-icon">🌐</span>

            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="hh-language-select"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          {/* Login buttons */}
          <Link to="/farmer/login" className="hh-login-btn farmer-login">
            🌱 {t("farmerLogin")}
          </Link>

          <Link to="/worker/login" className="hh-login-btn worker-login">
            👷 {t("workerLogin")}
          </Link>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;