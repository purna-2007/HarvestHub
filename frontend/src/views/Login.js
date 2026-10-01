import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Languagecontext";

function Login({ role }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const isFarmer = role === "farmer";

  const handleLogin = (e) => {
    e.preventDefault();

    const mobileNumber = phone.trim();
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError(language === "te"
        ? "చెల్లుబాటు అయ్యే 10 అంకెల భారతీయ మొబైల్ నంబర్ నమోదు చేయండి"
        : "Enter a valid 10-digit Indian mobile number");
      return;
    }

    localStorage.setItem("harvesthub_phone", mobileNumber);
    localStorage.setItem("harvesthub_role", role);
    navigate(isFarmer ? "/farmer/dashboard" : "/worker/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🌾</div>

        <h1>HarvestHub</h1>

        <h2>{isFarmer ? "Farmer Login" : "Worker Login"}</h2>

        <p className="login-subtitle">
          {isFarmer
            ? "Manage your farm and find workers"
            : "Find agricultural jobs near you"}
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-phone">Mobile Number</label>
            <input
              id="login-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              pattern="[6-9][0-9]{9}"
              title="Enter a valid 10-digit Indian mobile number"
              placeholder="Enter mobile number"
              value={phone}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) {
                  setPhone(value);
                  setError("");
                }
              }}
              required
            />
          </div>

          {error && <p role="alert">{error}</p>}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="login-demo">
          Enter your 10-digit mobile number to continue. No OTP is required.
        </p>
      </div>
    </div>
  );
}

export default Login;
