
import React, { useState } from "react";
import { useLanguage } from "./Languagecontext";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./views/Login";
import "./App.css";


// Welcome Screen
function WelcomeScreen() {
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = useState(
    language || ""
  );

  const [started, setStarted] = useState(Boolean(language));

  const handleContinue = () => {
    if (!selectedLanguage) {
      alert("Please select a language / దయచేసి భాషను ఎంచుకోండి");
      return;
    }

    changeLanguage(selectedLanguage);
    setStarted(true);
  };

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    changeLanguage(newLanguage);
  };

  return (
    <div className="app-container">
      {!started ? (
        <div className="language-card">
          <div className="app-logo">🌾</div>

          <h1>Harvest Hub</h1>

          <p className="tagline">
            Connecting Farmers and Workers
          </p>

          <h2>Choose Your Language</h2>
          <h3>మీ భాషను ఎంచుకోండి</h3>

          <div className="language-options">
            <button
              className={
                selectedLanguage === "en"
                  ? "language-btn selected"
                  : "language-btn"
              }
              onClick={() => setSelectedLanguage("en")}
            >
              🇬🇧 English
            </button>

            <button
              className={
                selectedLanguage === "te"
                  ? "language-btn selected"
                  : "language-btn"
              }
              onClick={() => setSelectedLanguage("te")}
            >
              🇮🇳 తెలుగు
            </button>
          </div>

          <button
            className="continue-btn"
            onClick={handleContinue}
          >
            Continue / కొనసాగించండి →
          </button>
        </div>
      ) : (
        <div className="welcome-card">
          <div className="top-bar">
            <h2>{t.appName}</h2>

            <select
              value={language}
              onChange={(e) =>
                handleLanguageChange(e.target.value)
              }
              aria-label="Change language"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          <div className="welcome-content">
            <div className="app-logo">🌾</div>

            <h1>{t.welcome}</h1>

            <p>{t.description}</p>

            <h3>{t.selectRole}</h3>

            <div className="role-options">
              <button
                className="role-btn"
                onClick={() => navigate("/farmer-login")}
              >
                👨‍🌾 {t.farmer}
              </button>

              <button
                className="role-btn"
                onClick={() => navigate("/worker-login")}
              >
                👷 {t.worker}
              </button>
            </div>

            <p className="coming-soon">
              {t.dashboard} — Coming Soon
            </p>
          </div>
        </div>
      )}
    </div>
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
  const { language } = useLanguage();
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

    alert(
      isTelugu
        ? "ఫారమ్ విజయవంతంగా ధృవీకరించబడింది! Backend త్వరలో కనెక్ట్ చేయబడుతుంది."
        : "Form validated successfully! Backend integration will be added soon."
    );
  };

  return (
    <div className="app-container">
      <div className="welcome-card">

        <div className="top-bar">
          <h2>🌾 Harvest Hub</h2>

          <select
            value={language}
            onChange={(e) => {
              const newLanguage = e.target.value;
              // Update language through the shared provider
              window.dispatchEvent(
                new CustomEvent("harvest-language-change", {
                  detail: newLanguage,
                })
              );
            }}
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
  const { language } = useLanguage();
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

    alert(
      isTelugu
        ? "ఫారమ్ విజయవంతంగా ధృవీకరించబడింది!"
        : "Form validated successfully! Backend integration will be added soon."
    );
  };

  return (
    <div className="app-container">
      <div className="welcome-card">

        <div className="top-bar">
          <h2>🌾 Harvest Hub</h2>

          <select
            value={language}
            onChange={(e) => {
              window.dispatchEvent(
                new CustomEvent("harvest-language-change", {
                  detail: e.target.value,
                })
              );
            }}
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
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/farmer-login" element={<FarmerLogin />} />
      <Route path="/worker-login" element={<WorkerLogin />} />
    </Routes>
  );
}

export default App;