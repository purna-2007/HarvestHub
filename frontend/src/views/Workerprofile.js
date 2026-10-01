
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function WorkerProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [wage, setWage] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [mobile, setMobile] = useState("");
const existingMobile = localStorage.getItem("harvesthub_phone") || "";

  const getLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMessage("Location captured successfully.");
      },
      () => {
        setMessage("Please allow location access.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!mobile) {
      setMessage("Please login first.");
      return;
    }

    if (latitude === null || longitude === null) {
      setMessage("Please capture your location before submitting.");
      return;
    }

    setLoading(true);

    try {
const result = await apiRequest("/users/profile/update", "PUT", {
  current_mobile: existingMobile,
  mobile,
  name,
  role: "worker",
  village,
  skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
  experience_years: Number(experience) || 0,
  expected_daily_wage: Number(wage),
  latitude,
  longitude
});

      if (result.success) {
        setMessage("Worker profile saved successfully!");
        localStorage.setItem("harvesthub_user_id", mobile);

        setTimeout(() => {
          navigate("/worker/dashboard");
        }, 1000);
      } else {
        setMessage(result.message || "Could not save profile.");
      }
    } catch (error) {
  console.error("Worker profile save error:", error);

  setMessage(
    error.message || "Unknown error occurred. Check browser console."
  );
} finally {
  setLoading(false);
}
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🌾</div>
        <h1>HarvestHub</h1>
        <h2>Worker Profile</h2>
        <p className="login-subtitle">
          Enter your details to find nearby agricultural jobs.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
  type="tel"
  value={mobile}
  onChange={(e) => setMobile(e.target.value)}
  placeholder="Enter your mobile number"
  maxLength={10}
  required
/>
          </div>

          <div className="form-group">
            <label>Village</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="Enter your village"
              required
            />
          </div>

          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Harvesting, Sowing, Tractor Driving"
              required
            />
          </div>

          <div className="form-group">
            <label>Experience (years)</label>
            <input
              type="number"
              min="0"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Enter experience"
            />
          </div>

          <div className="form-group">
            <label>Expected Daily Wage (₹)</label>
            <input
              type="number"
              min="1"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              placeholder="Enter expected wage"
              required
            />
          </div>

          <button type="button" onClick={getLocation}>
            📍 Capture My Location
          </button>

          <p>{message}</p>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Worker Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default WorkerProfile;