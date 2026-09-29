
import React from "react";
import BackButton from "../components/BackButton";

function FarmerDashboard() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <BackButton label="Back" />
      <h1>👨‍🌾 Welcome to Farmer Dashboard</h1>
      <p>Manage your agricultural activities with Harvest Hub.</p>

      <div style={{ marginTop: "25px" }}>
        <h2>My Dashboard</h2>
        <p>Post jobs, find workers, and manage applications.</p>
      </div>

      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>📋 Post a Job</h3>
          <p>Create a new agricultural job.</p>
        </div>

        <div style={cardStyle}>
          <h3>👷 Find Workers</h3>
          <p>Discover available agricultural workers.</p>
        </div>

        <div style={cardStyle}>
          <h3>📝 My Jobs</h3>
          <p>View your posted jobs.</p>
        </div>

        <div style={cardStyle}>
          <h3>🌱 Pest Detection</h3>
          <p>AI-powered crop pest detection will be available here.</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#f0fdf4",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #bbf7d0",
  minWidth: "180px",
};

export default FarmerDashboard;