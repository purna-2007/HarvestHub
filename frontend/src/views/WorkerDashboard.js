
import React from "react";
import BackButton from "../components/BackButton";

function WorkerDashboard() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
         <BackButton label="Back" />
      <h1>👷 Welcome to Worker Dashboard</h1>
      <p>Find agricultural jobs and connect with farmers.</p>

      <div style={{ marginTop: "25px" }}>
        <h2>My Dashboard</h2>
        <p>Explore jobs and manage your applications.</p>
      </div>

      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>🔍 Available Jobs</h3>
          <p>Explore agricultural work opportunities.</p>
        </div>

        <div style={cardStyle}>
          <h3>📝 My Applications</h3>
          <p>Track your job applications.</p>
        </div>

        <div style={cardStyle}>
          <h3>👤 My Profile</h3>
          <p>View and manage your worker profile.</p>
        </div>

        <div style={cardStyle}>
          <h3>🔔 Notifications</h3>
          <p>Stay updated about your applications.</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#eff6ff",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #bfdbfe",
  minWidth: "180px",
};

export default WorkerDashboard;