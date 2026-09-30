
import React, { useState } from "react";
import { useLanguage } from "./Languagecontext";
import { Routes, Route, useNavigate } from "react-router-dom";
<<<<<<< HEAD
=======
import Login from "./views/Login";
>>>>>>> dcfc78ae4a564c43c7ecf7aff1809c882cdce3db
import FarmerDashboard from "./views/FarmerDashboard";
import WorkerDashboard from "./views/WorkerDashboard";
import "./App.css";

<<<<<<< HEAD


// Welcome Screen
=======
>>>>>>> dcfc78ae4a564c43c7ecf7aff1809c882cdce3db
function WelcomeScreen() {
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
<<<<<<< HEAD
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
=======

  const [selectedLanguage, setSelectedLanguage] = useState(
    language || ""
  );

  const [started, setStarted] = useState(Boolean(language));

  const isTelugu = language === "te";

  const handleContinue = () => {
    if (!selectedLanguage) {
      alert("Please select a language / దయచేసి భాషను ఎంచుకోండి");
      return;
    }

    changeLanguage(selectedLanguage);
    setStarted(true);
  };

  const services = [
    {
      icon: "🌱",
      en: "Paddy Planting",
      te: "వరి నాట్లు వేయడం",
      enDesc: "Planting young rice seedlings in the field.",
      teDesc: "పొలంలో వరి నారు నాటడం.",
    },
    {
      icon: "🌾",
      en: "Harvesting",
      te: "పంట కోత",
      enDesc: "Collecting mature crops from the field.",
      teDesc: "పంట చేతికి వచ్చినప్పుడు కోయడం.",
    },
    {
      icon: "🌿",
      en: "Weeding",
      te: "కలుపు తీయడం",
      enDesc: "Removing unwanted plants from crops.",
      teDesc: "పంటలోని కలుపు మొక్కలను తొలగించడం.",
    },
    {
      icon: "💧",
      en: "Irrigation",
      te: "నీటి పారుదల",
      enDesc: "Supplying water to agricultural fields.",
      teDesc: "పంట పొలాలకు నీటిని అందించడం.",
    },
    {
      icon: "🚜",
      en: "Land Preparation",
      te: "భూమి సిద్ధం చేయడం",
      enDesc: "Preparing soil before cultivation.",
      teDesc: "సాగుకు ముందు భూమిని సిద్ధం చేయడం.",
    },
    {
      icon: "🌻",
      en: "Fertilizer Application",
      te: "ఎరువులు వేయడం",
      enDesc: "Applying fertilizers to support crop growth.",
      teDesc: "పంట పెరుగుదలకు ఎరువులు వేయడం.",
    },
  ];

  // LANGUAGE SELECTION SCREEN
  if (!started) {
    return (
      <div className="app-container">
        <div className="language-card">
          <div className="app-logo">🌾</div>
>>>>>>> dcfc78ae4a564c43c7ecf7aff1809c882cdce3db

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
<<<<<<< HEAD
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
=======
      </div>
    );
  }
>>>>>>> dcfc78ae4a564c43c7ecf7aff1809c882cdce3db

  // HOME DASHBOARD
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f7f1",
        width: "100%",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#ffffff",
          padding: "15px 5%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ color: "#167044", margin: 0 }}>
          🌾 Harvest Hub
        </h2>

        {/* RIGHT TOP CORNER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
<<<<<<< HEAD
=======
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
>>>>>>> dcfc78ae4a564c43c7ecf7aff1809c882cdce3db
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
          </select>

          <button
            onClick={() => navigate("/farmer-login")}
            style={{
              background: "#167044",
              color: "white",
              border: "none",
              padding: "11px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            👨‍🌾 {isTelugu ? "రైతు లాగిన్" : "Farmer Login"}
          </button>

          <button
            onClick={() => navigate("/worker-login")}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "11px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            👷 {isTelugu ? "కార్మికుల లాగిన్" : "Worker Login"}
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        {/* HERO SECTION */}
        <section
          style={{
            background: "white",
            padding: "45px 25px",
            borderRadius: "18px",
            textAlign: "center",
            boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: "55px" }}>🌾</div>

          <h1 style={{ color: "#166534", fontSize: "38px" }}>
            {isTelugu
              ? "హార్వెస్ట్ హబ్‌కు స్వాగతం"
              : "Welcome to Harvest Hub"}
          </h1>

          <h2 style={{ color: "#374151" }}>
            {isTelugu
              ? "రైతులు మరియు వ్యవసాయ కార్మికులను కలిపే వేదిక"
              : "Connecting Farmers and Agricultural Workers"}
          </h2>

          <p style={{ color: "#6b7280", lineHeight: "1.8" }}>
            {isTelugu
              ? "వ్యవసాయ పనులను కనుగొనండి, కార్మికులతో అనుసంధానం అవ్వండి మరియు స్మార్ట్ వ్యవసాయ సేవలను పొందండి."
              : "Discover agricultural work, connect with workers, and explore smart farming assistance in one place."}
          </p>
        </section>

        {/* AGRICULTURAL WORK CATEGORIES */}
        <section style={{ marginTop: "45px" }}>
          <h2
            style={{
              textAlign: "center",
              color: "#166534",
              fontSize: "30px",
            }}
          >
            {isTelugu
              ? "వ్యవసాయ పనులు"
              : "Agricultural Work Categories"}
          </h2>

          <p style={{ textAlign: "center", color: "#6b7280" }}>
            {isTelugu
              ? "రైతులకు అవసరమైన వివిధ వ్యవసాయ పనులు"
              : "Explore common agricultural activities"}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "20px",
              marginTop: "25px",
            }}
          >
            {services.map((service, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  padding: "25px 20px",
                  borderRadius: "14px",
                  textAlign: "center",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: "42px" }}>
                  {service.icon}
                </div>

                <h3 style={{ color: "#166534" }}>
                  {isTelugu ? service.te : service.en}
                </h3>

                <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                  {isTelugu
                    ? service.teDesc
                    : service.enDesc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          style={{
            marginTop: "45px",
            background: "#e2f3e7",
            padding: "30px 20px",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#166534" }}>
            {isTelugu ? "ఇది ఎలా పనిచేస్తుంది?" : "How It Works"}
          </h2>

          <p style={{ color: "#374151", lineHeight: "1.8" }}>
            {isTelugu
              ? "రైతులు పనులను పోస్ట్ చేయవచ్చు. కార్మికులు అందుబాటులో ఉన్న పనులను చూసి దరఖాస్తు చేసుకోవచ్చు."
              : "Farmers can post jobs. Workers can explore available opportunities and apply for work."}
          </p>
        </section>

        {/* CNN FEATURE */}
        <section
          style={{
            marginTop: "25px",
            background: "white",
            padding: "30px 20px",
            borderRadius: "16px",
            textAlign: "center",
            border: "1px solid #d1fae5",
          }}
        >
          <div style={{ fontSize: "40px" }}>🤖🌿</div>

          <h2 style={{ color: "#166534" }}>
            {isTelugu ? "AI పంట సహాయం" : "AI Crop Assistance"}
          </h2>

          <p style={{ color: "#6b7280", lineHeight: "1.7" }}>
            {isTelugu
              ? "CNN ఆధారిత పంట సమస్యల గుర్తింపు ఫీచర్ త్వరలో అందుబాటులో ఉంటుంది."
              : "CNN-based crop problem recognition will be available as a future feature."}
          </p>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          background: "#166534",
          color: "white",
          textAlign: "center",
          padding: "20px",
          marginTop: "30px",
        }}
      >
        © 2026 Harvest Hub | Smart Agriculture Platform
      </footer>
    </div>
  );
}

<<<<<<< HEAD
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
=======
// ==========================================
// APPLICATION ROUTES
// ==========================================

function App() {
  return (
    <Routes>
      {/* COMMON HOME DASHBOARD */}
      <Route path="/" element={<WelcomeScreen />} />

      {/* FARMER LOGIN */}
      <Route
        path="/farmer-login"
        element={
          <Login
            role="farmer"
            onBack={() => window.history.back()}
          />
        }
      />

      {/* WORKER LOGIN */}
      <Route
        path="/worker-login"
        element={
          <Login
            role="worker"
            onBack={() => window.history.back()}
          />
        }
      />

      {/* FARMER DASHBOARD */}
>>>>>>> dcfc78ae4a564c43c7ecf7aff1809c882cdce3db
      <Route
        path="/farmer-dashboard"
        element={<FarmerDashboard />}
      />

<<<<<<< HEAD
=======
      {/* WORKER DASHBOARD */}
>>>>>>> dcfc78ae4a564c43c7ecf7aff1809c882cdce3db
      <Route
        path="/worker-dashboard"
        element={<WorkerDashboard />}
      />
<<<<<<< HEAD
=======

      {/* UNKNOWN PATH */}
      <Route path="*" element={<WelcomeScreen />} />
>>>>>>> dcfc78ae4a564c43c7ecf7aff1809c882cdce3db
    </Routes>
  );
}

export default App;