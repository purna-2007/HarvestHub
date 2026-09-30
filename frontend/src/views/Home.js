import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../Languagecontext";
import Navbar from "../components/navbar";

const workCategories = [
  {
    name: "Harvesting",
    telugu: "పంట కోత",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
    icon: "🌾",
  },
  {
    name: "Sowing",
    telugu: "విత్తనాలు వేయడం",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80",
    icon: "🌱",
  },
  {
    name: "Weeding",
    telugu: "కలుపు తీయడం",
    image:
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80",
    icon: "🌿",
  },
  {
    name: "Planting",
    telugu: "నాట్లు వేయడం",
    image:
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80",
    icon: "🌳",
  },
];

function Home() {
  const { language } = useLanguage();

  const isTelugu = language === "te";

  return (
    <div className="hh-home">

      <Navbar />

      {/* ================= HERO ================= */}
      <section className="hh-hero">

        <div className="hh-hero-overlay"></div>

        <div className="hh-hero-content">

          <div className="hh-hero-badge">
            🌱{" "}
            {isTelugu
              ? "రైతులు మరియు వ్యవసాయ కార్మికులను కలుపుతూ"
              : "Connecting farmers & agricultural workers"}
          </div>

          <h1>
            {isTelugu ? (
              <>
                వ్యవసాయానికి
                <span> సరైన వ్యక్తులు.</span>
              </>
            ) : (
              <>
                The right people
                <span> for every farm.</span>
              </>
            )}
          </h1>

          <p>
            {isTelugu
              ? "రైతులు తమ పొలాలకు అవసరమైన కార్మికులను సులభంగా కనుగొనడానికి మరియు వ్యవసాయ కార్మికులు సరైన పనులను కనుగొనడానికి HarvestHub సహాయపడుతుంది."
              : "HarvestHub helps farmers find the right agricultural workers and helps workers discover suitable farm opportunities near them."}
          </p>

          <div className="hh-hero-buttons">

            <Link
              to="/farmer/login"
              className="hh-primary-button"
            >
              🌾{" "}
              {isTelugu
                ? "రైతిగా ప్రారంభించండి"
                : "Continue as Farmer"}
              <span>→</span>
            </Link>

            <Link
              to="/worker/login"
              className="hh-secondary-button"
            >
              👷{" "}
              {isTelugu
                ? "పనిని కనుగొనండి"
                : "Find Work"}
              <span>→</span>
            </Link>

          </div>

          {/* Trust indicators */}
          <div className="hh-hero-stats">

            <div>
              <strong>🌾</strong>
              <span>
                {isTelugu ? "వ్యవసాయ పనులు" : "Farm Jobs"}
              </span>
            </div>

            <div>
              <strong>👨‍🌾</strong>
              <span>
                {isTelugu ? "రైతులు" : "Farmers"}
              </span>
            </div>

            <div>
              <strong>👷</strong>
              <span>
                {isTelugu ? "కార్మికులు" : "Workers"}
              </span>
            </div>

          </div>

        </div>

        <div className="hh-scroll-indicator">
          <span>↓</span>
          <small>
            {isTelugu ? "మరింత చూడండి" : "Explore more"}
          </small>
        </div>

      </section>

      {/* ================= WORK CATEGORIES ================= */}
      <section
        className="hh-section hh-categories"
        id="work-categories"
      >

        <div className="hh-section-heading">

          <div>
            <span className="hh-section-label">
              {isTelugu ? "పని విభాగాలు" : "WORK CATEGORIES"}
            </span>

            <h2>
              {isTelugu
                ? "మీ వ్యవసాయ పనికి సరైన కార్మికులను కనుగొనండి"
                : "Find workers for every farm task"}
            </h2>
          </div>

          <p>
            {isTelugu
              ? "వివిధ వ్యవసాయ పనుల కోసం కార్మికులను సులభంగా కనుగొనండి."
              : "Connect with workers experienced in different types of agricultural work."}
          </p>

        </div>

        <div className="hh-category-grid">

          {workCategories.map((category) => (
            <div
              className="hh-category-card"
              key={category.name}
            >

              <div className="hh-category-image">

                <img
                  src={category.image}
                  alt={category.name}
                />

                <div className="hh-category-icon">
                  {category.icon}
                </div>

              </div>

              <div className="hh-category-content">

                <h3>
                  {isTelugu
                    ? category.telugu
                    : category.name}
                </h3>

                <span>
                  {isTelugu
                    ? "కార్మికులను కనుగొనండి"
                    : "Find workers"}{" "}
                  →
                </span>

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        className="hh-section hh-how"
        id="how-it-works"
      >

        <div className="hh-section-heading centered">

          <span className="hh-section-label">
            {isTelugu ? "ఎలా పనిచేస్తుంది" : "HOW IT WORKS"}
          </span>

          <h2>
            {isTelugu
              ? "వ్యవసాయ పనిని సులభంగా మార్చండి"
              : "Making agricultural work simpler"}
          </h2>

          <p>
            {isTelugu
              ? "HarvestHub రైతులు మరియు కార్మికులను ఒకే ప్లాట్‌ఫారమ్‌లో కలుపుతుంది."
              : "HarvestHub brings farmers and agricultural workers together on one simple platform."}
          </p>

        </div>

        <div className="hh-steps">

          <div className="hh-step">
            <div className="hh-step-number">01</div>
            <div className="hh-step-icon">🌾</div>

            <h3>
              {isTelugu
                ? "మీ పంటను ఎంచుకోండి"
                : "Select your crop"}
            </h3>

            <p>
              {isTelugu
                ? "మీ పొలంలో పండిస్తున్న పంటను ఎంచుకోండి."
                : "Choose the crop you are working with."}
            </p>
          </div>

          <div className="hh-step">
            <div className="hh-step-number">02</div>
            <div className="hh-step-icon">👷</div>

            <h3>
              {isTelugu
                ? "కార్మికులను కనుగొనండి"
                : "Find workers"}
            </h3>

            <p>
              {isTelugu
                ? "మీ అవసరానికి సరిపోయే కార్మికులను కనుగొనండి."
                : "Discover workers based on your farm requirements."}
            </p>
          </div>

          <div className="hh-step">
            <div className="hh-step-number">03</div>
            <div className="hh-step-icon">🤝</div>

            <h3>
              {isTelugu
                ? "పని ప్రారంభించండి"
                : "Get the work done"}
            </h3>

            <p>
              {isTelugu
                ? "కార్మికులతో కనెక్ట్ అయి పనిని ప్రారంభించండి."
                : "Connect with workers and get your farm work started."}
            </p>
          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="hh-cta">

        <div className="hh-cta-content">

          <span>🌱</span>

          <h2>
            {isTelugu
              ? "మీ వ్యవసాయ పనిని ఈరోజే ప్రారంభించండి"
              : "Ready to get your farm work started?"}
          </h2>

          <p>
            {isTelugu
              ? "HarvestHubతో రైతులు మరియు వ్యవసాయ కార్మికులతో కనెక్ట్ అవ్వండి."
              : "Connect with farmers and agricultural workers through HarvestHub."}
          </p>

          <div className="hh-cta-buttons">

            <Link
              to="/farmer/login"
              className="hh-primary-button"
            >
              {isTelugu ? "రైతుగా చేరండి" : "Join as Farmer"} →
            </Link>

            <Link
              to="/worker/login"
              className="hh-outline-button"
            >
              {isTelugu ? "కార్మికుడిగా చేరండి" : "Join as Worker"} →
            </Link>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="hh-footer">

        <div className="hh-footer-inner">

          <div className="hh-footer-brand">

            <div className="hh-logo">
              <div className="hh-logo-icon">🌾</div>

              <div className="hh-logo-text">
                <span>Harvest</span>
                <strong>Hub</strong>
              </div>
            </div>

            <p>
              {isTelugu
                ? "రైతులు మరియు వ్యవసాయ కార్మికులను కలిపే స్మార్ట్ ప్లాట్‌ఫారమ్."
                : "A smart platform connecting farmers and agricultural workers."}
            </p>

          </div>

          <div className="hh-footer-links">

            <Link to="/">
              {isTelugu ? "హోమ్" : "Home"}
            </Link>

            <Link to="/farmer/login">
              {isTelugu ? "రైతు లాగిన్" : "Farmer Login"}
            </Link>

            <Link to="/worker/login">
              {isTelugu ? "కార్మికుల లాగిన్" : "Worker Login"}
            </Link>

          </div>

        </div>

        <div className="hh-footer-bottom">
          © {new Date().getFullYear()} HarvestHub. Built for agriculture.
        </div>

      </footer>

    </div>
  );
}

export default Home;