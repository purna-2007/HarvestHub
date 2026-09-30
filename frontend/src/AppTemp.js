
import React, { useState } from "react";
import { useLanguage } from "./Languagecontext";
import { Routes, Route, useNavigate } from "react-router-dom";
import FarmerDashboard from "./views/FarmerDashboard";
import WorkerDashboard from "./views/WorkerDashboard";
import "./App.css";



// Welcome Screen
function WelcomeScreen() {
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const workTypes = [
    {
      title: t.workSeeding,
      image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=640&q=80",
      alt: t.workSeedingAlt,
    },
    {
      title: t.workHarvesting,
      image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=640&q=80",
      alt: t.workHarvestingAlt,
    },
    {
      title: t.workPruning,
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=640&q=80",
      alt: t.workPruningAlt,
    },
    {
      title: t.workTractor,
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=640&q=80",
      alt: t.workTractorAlt,
    },
  ];

  return (
    <main className="landing-page">
      <header className="site-nav">
        <button className="brand" onClick={() => navigate("/")} aria-label={t.appName}>
          <span className="brand-mark" aria-hidden="true">H</span>
          <span>{t.appName}</span>
        </button>

        <nav className="nav-actions" aria-label={t.loginOptions}>
          <select
            value={language || "en"}
            onChange={(event) => changeLanguage(event.target.value)}
            aria-label={t.language}
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
          </select>
          <button className="nav-login farmer-login" onClick={() => navigate("/farmer-login")}>
            {t.farmerLogin}
          </button>
          <button className="nav-login worker-login" onClick={() => navigate("/worker-login")}>
            {t.workerLogin}
          </button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="hero-kicker">{t.tagline}</p>
          <h1>{t.appName}</h1>
          <p className="hero-description">{t.description}</p>
          <p className="hero-note">{t.selectRole}</p>
        </div>
        <span className="hero-location">{t.fieldWork}</span>
      </section>

      <section className="work-section" aria-labelledby="work-heading">
        <div className="work-heading">
          <p className="section-kicker">{t.workKicker}</p>
          <h2 id="work-heading">{t.workHeading}</h2>
        </div>
        <div className="work-grid">
          {workTypes.map((work) => (
            <article className="work-item" key={work.title}>
              <img src={work.image} alt={work.alt} loading="lazy" />
              <h3>{work.title}</h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "7px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "15px",
  boxSizing: "border-box",
  outlineColor: "#167044",
};

function FarmerLogin() {
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const isTelugu = language === "te";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister && !name.trim()) {
      alert(
        isTelugu
          ? "దయచేసి మీ పేరు నమోదు చేయండి"
          : "Please enter your full name"
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      alert(
        isTelugu
          ? "సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి"
          : "Please enter a valid 10-digit mobile number"
      );
      return;
    }

    if (password.length < 6) {
      alert(
        isTelugu
          ? "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి"
          : "Password must contain at least 6 characters"
      );
      return;
    }
    navigate("/farmer-dashboard");
  };

  return (
    <div className="app-container">
      <div className="welcome-card">

        <div className="top-bar">
          <h2>🌾 Harvest Hub</h2>

          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>

        <div className="welcome-content">

          <div className="app-logo">👨‍🌾</div>

          <h1>
            {isRegister
              ? isTelugu
                ? "రైతు నమోదు"
                : "Farmer Registration"
              : isTelugu
                ? "రైతు లాగిన్"
                : "Farmer Login"}
          </h1>

          <p>
            {isTelugu
              ? "హార్వెస్ట్ హబ్‌కు స్వాగతం"
              : "Welcome to Harvest Hub"}
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              textAlign: "left",
              marginTop: "25px",
            }}
          >

            {isRegister && (
              <div>
                <label>
                  {isTelugu ? "పూర్తి పేరు" : "Full Name"}
                </label>

                <input
                  type="text"
                  placeholder={
                    isTelugu
                      ? "మీ పేరు నమోదు చేయండి"
                      : "Enter your full name"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

            <div>
              <label>
                {isTelugu ? "మొబైల్ నంబర్" : "Mobile Number"}
              </label>

              <input
                type="tel"
                placeholder={
                  isTelugu
                    ? "10 అంకెల మొబైల్ నంబర్"
                    : "Enter 10-digit mobile number"
                }
                value={mobile}
                maxLength={10}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, ""))
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                {isTelugu ? "పాస్‌వర్డ్" : "Password"}
              </label>

              <input
                type="password"
                placeholder={
                  isTelugu
                    ? "మీ పాస్‌వర్డ్ నమోదు చేయండి"
                    : "Enter your password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              className="continue-btn"
            >
              {isRegister
                ? isTelugu
                  ? "నమోదు చేయండి"
                  : "Register"
                : isTelugu
                  ? "లాగిన్"
                  : "Login"}
            </button>

          </form>

          <p style={{ marginTop: "20px" }}>
            {isRegister
              ? isTelugu
                ? "ఇప్పటికే ఖాతా ఉందా?"
                : "Already have an account?"
              : isTelugu
                ? "ఖాతా లేదా?"
                : "Don't have an account?"}
          </p>

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setName("");
              setMobile("");
              setPassword("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#167044",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {isRegister
              ? isTelugu
                ? "లాగిన్‌కు తిరిగి వెళ్ళండి"
                : "Back to Login"
              : isTelugu
                ? "కొత్త రైతుగా నమోదు చేసుకోండి"
                : "Register as a new Farmer"}
          </button>

          <button
            className="continue-btn"
            type="button"
            onClick={() => navigate("/")}
            style={{ marginTop: "15px" }}
          >
            ← {isTelugu ? "హోమ్‌కు తిరిగి వెళ్ళండి" : "Back to Home"}
          </button>

        </div>
      </div>
    </div>
  );
}

function WorkerLogin() {
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const isTelugu = language === "te";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister && !name.trim()) {
      alert(
        isTelugu
          ? "దయచేసి మీ పేరు నమోదు చేయండి"
          : "Please enter your full name"
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      alert(
        isTelugu
          ? "సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి"
          : "Please enter a valid 10-digit mobile number"
      );
      return;
    }

    if (password.length < 6) {
      alert(
        isTelugu
          ? "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి"
          : "Password must contain at least 6 characters"
      );
      return;
    }
  navigate("/worker-dashboard");
  };

  return (
    <div className="app-container">
      <div className="welcome-card">

        <div className="top-bar">
          <h2>🌾 Harvest Hub</h2>

          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>

        <div className="welcome-content">

          <div className="app-logo">👷</div>

          <h1>
            {isRegister
              ? isTelugu
                ? "కార్మికుల నమోదు"
                : "Worker Registration"
              : isTelugu
                ? "కార్మికుల లాగిన్"
                : "Worker Login"}
          </h1>

          <p>
            {isTelugu
              ? "హార్వెస్ట్ హబ్‌కు స్వాగతం"
              : "Welcome to Harvest Hub"}
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              textAlign: "left",
              marginTop: "25px",
            }}
          >

            {isRegister && (
              <div>
                <label>
                  {isTelugu ? "పూర్తి పేరు" : "Full Name"}
                </label>

                <input
                  type="text"
                  placeholder={
                    isTelugu
                      ? "మీ పేరు నమోదు చేయండి"
                      : "Enter your full name"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

            <div>
              <label>
                {isTelugu ? "మొబైల్ నంబర్" : "Mobile Number"}
              </label>

              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                maxLength={10}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, ""))
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                {isTelugu ? "పాస్‌వర్డ్" : "Password"}
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button type="submit" className="continue-btn">
              {isRegister
                ? isTelugu
                  ? "నమోదు చేయండి"
                  : "Register"
                : isTelugu
                  ? "లాగిన్"
                  : "Login"}
            </button>

          </form>

          <p style={{ marginTop: "20px" }}>
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}
          </p>

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setName("");
              setMobile("");
              setPassword("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#167044",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {isRegister
              ? "Back to Login"
              : "Register as a new Worker"}
          </button>

          <button
            className="continue-btn"
            type="button"
            onClick={() => navigate("/")}
            style={{ marginTop: "15px" }}
          >
            ← Back to Home
          </button>

        </div>
      </div>
    </div>
  );
}

// Main Application Routes
function App() {
  return (
    <Routes>
      {/* Welcome Screen */}
      <Route path="/" element={<WelcomeScreen />} />

      {/* Login Pages */}
      <Route path="/farmer-login" element={<FarmerLogin />} />
      <Route path="/worker-login" element={<WorkerLogin />} />

      {/* Dashboard Pages */}
      <Route
        path="/farmer-dashboard"
        element={<FarmerDashboard />}
      />

      <Route
        path="/worker-dashboard"
        element={<WorkerDashboard />}
      />
    </Routes>
  );
}

export default App;