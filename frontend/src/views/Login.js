import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Languagecontext";

function Login({ role }) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const isFarmer = role === "farmer";

  const handleLogin = (e) => {
    e.preventDefault();

    if (!phone || !password) {
      alert(
        language === "te"
          ? "దయచేసి అన్ని వివరాలను నమోదు చేయండి"
          : "Please enter all details"
      );
      return;
    }

    // Temporary login navigation
    // Later this will be replaced with backend authentication.
    if (isFarmer) {
      navigate("/farmer/dashboard");
    } else {
      navigate("/worker/dashboard");
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          🌾
        </div>

        <h1>HarvestHub</h1>

        <h2>
          {isFarmer ? "Farmer Login" : "Worker Login"}
        </h2>

        <p className="login-subtitle">
          {isFarmer
            ? "Manage your farm and find workers"
            : "Find agricultural jobs near you"}
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Mobile Number</label>

            <input
              type="tel"
              placeholder="Enter mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>

        </form>

        <p className="login-demo">
          Demo login — backend authentication will be connected later.
        </p>

      </div>

    </div>
  );
}

export default Login;