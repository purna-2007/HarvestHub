
import React, { useState } from "react";
import { useLanguage } from "./Languagecontext";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./views/Login";
import FarmerDashboard from "./views/FarmerDashboard";
import WorkerDashboard from "./views/WorkerDashboard";
import "./App.css";

function WelcomeScreen() {
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();

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
      </div>
    );
  }

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
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
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
      <Route
        path="/farmer-dashboard"
        element={<FarmerDashboard />}
      />

      {/* WORKER DASHBOARD */}
      <Route
        path="/worker-dashboard"
        element={<WorkerDashboard />}
      />

      {/* UNKNOWN PATH */}
      <Route path="*" element={<WelcomeScreen />} />
    </Routes>
  );
}

export default App;