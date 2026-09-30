import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const cropData = {
  rice: {
    name: "Rice",
    icon: "🌾",
    workersPerAcre: 4,
    color: "green",
    workTypes: ["Sowing", "Transplanting", "Weeding", "Harvesting"],
  },

  wheat: {
    name: "Wheat",
    icon: "🌾",
    workersPerAcre: 3,
    color: "yellow",
    workTypes: ["Sowing", "Weeding", "Harvesting"],
  },

  cotton: {
    name: "Cotton",
    icon: "🌱",
    workersPerAcre: 5,
    color: "blue",
    workTypes: ["Sowing", "Weeding", "Picking"],
  },

  maize: {
    name: "Maize",
    icon: "🌽",
    workersPerAcre: 3,
    color: "orange",
    workTypes: ["Sowing", "Weeding", "Harvesting"],
  },

  sugarcane: {
    name: "Sugarcane",
    icon: "🎋",
    workersPerAcre: 6,
    color: "purple",
    workTypes: ["Planting", "Weeding", "Harvesting"],
  },
};

function FarmerDashboard() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("workers");

  const [crop, setCrop] = useState("");
  const [acres, setAcres] = useState("");
  const [workType, setWorkType] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [location, setLocation] = useState("");
  const [wage, setWage] = useState("");

  const selectedCrop = cropData[crop];

  const workersRequired =
    selectedCrop && acres
      ? Math.ceil(Number(acres) * selectedCrop.workersPerAcre)
      : 0;

  const handleCropChange = (e) => {
    setCrop(e.target.value);
    setWorkType("");
  };

  const handleFindWorkers = (e) => {
    e.preventDefault();

    if (!crop || !acres || !workType || !workDate || !location) {
      alert("Please complete all required fields.");
      return;
    }

    const job = {
      crop,
      acres,
      workersRequired,
      workType,
      workDate,
      location,
      wage,
    };

    console.log("Job created:", job);

    alert(
      `We will find ${workersRequired} workers for your ${selectedCrop.name} farm.`
    );
  };

  const logout = () => {
    navigate("/");
  };

  return (
    <div className="farmer-dashboard">

      {/* SIDEBAR */}

      <aside className="farmer-sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">🌾</div>

          <div>
            <h2>HarvestHub</h2>
            <span>Farmer Portal</span>
          </div>
        </div>

        <div className="farmer-profile-mini">

          <div className="profile-avatar">
            👨‍🌾
          </div>

          <div>
            <strong>Farmer</strong>
            <span>Farm Owner</span>
          </div>

        </div>

        <nav className="sidebar-menu">

          <button
            className={
              activeMenu === "workers"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => setActiveMenu("workers")}
          >
            <span>👥</span>
            <div>
              <strong>Find Workers</strong>
              <small>Hire farm workers</small>
            </div>
          </button>

          <button
            className={
              activeMenu === "disease"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => {
              setActiveMenu("disease");
              navigate("/pest-detection");
            }}
          >
            <span>🌿</span>

            <div>
              <strong>Disease Detection</strong>
              <small>Check crop health</small>
            </div>
          </button>

          <button
            className={
              activeMenu === "jobs"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => setActiveMenu("jobs")}
          >
            <span>📋</span>

            <div>
              <strong>My Jobs</strong>
              <small>Manage your jobs</small>
            </div>
          </button>

          <button
            className={
              activeMenu === "notifications"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => setActiveMenu("notifications")}
          >
            <span>🔔</span>

            <div>
              <strong>Notifications</strong>
              <small>Latest updates</small>
            </div>

            <span className="notification-badge">3</span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button className="sidebar-item">
            <span>⚙️</span>

            <div>
              <strong>Settings</strong>
              <small>Account settings</small>
            </div>
          </button>

          <button
            className="sidebar-item logout-item"
            onClick={logout}
          >
            <span>🚪</span>

            <div>
              <strong>Logout</strong>
              <small>Sign out</small>
            </div>
          </button>

        </div>

      </aside>

      {/* MAIN AREA */}

      <main className="farmer-main">

        <header className="farmer-header">

          <div>
            <p className="welcome-text">
              Welcome back 👋
            </p>

            <h1>
              Farmer Dashboard
            </h1>

            <p className="header-description">
              Find the right workers for your farm quickly and easily.
            </p>
          </div>

          <div className="header-actions">

            <button className="notification-button">
              🔔
              <span>3</span>
            </button>

            <div className="header-profile">
              <div className="profile-avatar">
                👨‍🌾
              </div>

              <div>
                <strong>Farmer</strong>
                <small>Farm Owner</small>
              </div>
            </div>

          </div>

        </header>

        {/* STATS */}

        <section className="farmer-stats">

          <div className="stat-card">

            <div className="stat-icon green-icon">
              👥
            </div>

            <div>
              <span>Available Workers</span>
              <strong>128</strong>
              <small>Workers nearby</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon orange-icon">
              📋
            </div>

            <div>
              <span>Active Jobs</span>
              <strong>4</strong>
              <small>Currently running</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon blue-icon">
              ✅
            </div>

            <div>
              <span>Completed Jobs</span>
              <strong>23</strong>
              <small>This season</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple-icon">
              ⭐
            </div>

            <div>
              <span>Worker Rating</span>
              <strong>4.8</strong>
              <small>Average rating</small>
            </div>

          </div>

        </section>

        {/* WORKER SEARCH */}

        {activeMenu === "workers" && (

          <section className="dashboard-card">

            <div className="card-heading">

              <div>
                <h2>Find Agricultural Workers</h2>

                <p>
                  Tell us about your farm work and we'll help you find suitable workers.
                </p>
              </div>

              <div className="heading-icon">
                👥
              </div>

            </div>

            <form onSubmit={handleFindWorkers}>

              <div className="form-section-title">
                🌱 Farm Information
              </div>

              <div className="form-grid">

                {/* CROP */}

                <div className="dashboard-field">

                  <label>
                    Crop Type <span>*</span>
                  </label>

                  <select
                    value={crop}
                    onChange={handleCropChange}
                  >
                    <option value="">
                      Select crop
                    </option>

                    {Object.entries(cropData).map(
                      ([key, item]) => (
                        <option
                          value={key}
                          key={key}
                        >
                          {item.icon} {item.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* ACRES */}

                <div className="dashboard-field">

                  <label>
                    Land Area <span>*</span>
                  </label>

                  <div className="input-with-unit">

                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="e.g. 5"
                      value={acres}
                      onChange={(e) =>
                        setAcres(e.target.value)
                      }
                    />

                    <span>Acres</span>

                  </div>

                </div>

              </div>

              {/* WORKER CALCULATION */}

              <div className="worker-calculation">

                <div className="calculation-icon">
                  👥
                </div>

                <div className="calculation-text">

                  <span>
                    Estimated workers required
                  </span>

                  <strong>
                    {workersRequired || "--"}
                  </strong>

                  <small>
                    {selectedCrop
                      ? `${selectedCrop.workersPerAcre} workers per acre for ${selectedCrop.name}`
                      : "Select a crop and enter land area"}
                  </small>

                </div>

                {workersRequired > 0 && (
                  <div className="calculation-success">
                    ✓ Calculated
                  </div>
                )}

              </div>

              <div className="form-section-title">
                🧑‍🌾 Work Details
              </div>

              <div className="form-grid">

                {/* WORK TYPE */}

                <div className="dashboard-field">

                  <label>
                    Work Type <span>*</span>
                  </label>

                  <select
                    value={workType}
                    onChange={(e) =>
                      setWorkType(e.target.value)
                    }
                    disabled={!selectedCrop}
                  >

                    <option value="">
                      {selectedCrop
                        ? "Select work type"
                        : "Select crop first"}
                    </option>

                    {selectedCrop?.workTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* DATE */}

                <div className="dashboard-field">

                  <label>
                    Work Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    value={workDate}
                    onChange={(e) =>
                      setWorkDate(e.target.value)
                    }
                  />

                </div>

                {/* LOCATION */}

                <div className="dashboard-field full-width">

                  <label>
                    Work Location <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Enter village / area"
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                  />

                </div>

                {/* WAGE */}

                <div className="dashboard-field">

                  <label>
                    Daily Wage
                  </label>

                  <div className="input-with-unit">

                    <span className="currency">
                      ₹
                    </span>

                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={wage}
                      onChange={(e) =>
                        setWage(e.target.value)
                      }
                    />

                    <span>per day</span>

                  </div>

                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setCrop("");
                    setAcres("");
                    setWorkType("");
                    setWorkDate("");
                    setLocation("");
                    setWage("");
                  }}
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <span>🔎</span>
                  Find Workers
                </button>

              </div>

            </form>

          </section>

        )}

        {/* QUICK ACTIONS */}

        <section className="quick-actions">

          <h2>Quick Actions</h2>

          <div className="quick-action-grid">

            <button
              onClick={() => setActiveMenu("workers")}
            >
              <span>👥</span>
              <strong>Find Workers</strong>
              <small>Hire workers for your farm</small>
            </button>

            <button
              onClick={() =>
                navigate("/pest-detection")
              }
            >
              <span>🌿</span>
              <strong>Check Crop Disease</strong>
              <small>Detect crop diseases using AI</small>
            </button>

            <button
              onClick={() => setActiveMenu("jobs")}
            >
              <span>📋</span>
              <strong>Manage Jobs</strong>
              <small>View your active jobs</small>
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default FarmerDashboard;