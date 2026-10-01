import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";

// Crop and skill names mirror the project datasets.
const datasetWorkTypes = [
  "Seeding",
  "Irrigation Setup",
  "Pesticide Spraying",
  "Pruning",
  "Harvesting",
  "Tractor Driving",
];

const cropData = {
  paddy: {
    name: "Paddy",
    icon: "🌾",
    workersPerAcre: 4,
    workTypes: datasetWorkTypes,
  },
  wheat: {
    name: "Wheat",
    icon: "🌾",
    workersPerAcre: 3,
    workTypes: datasetWorkTypes,
  },
  cotton: {
    name: "Cotton",
    icon: "🌱",
    workersPerAcre: 5,
    workTypes: datasetWorkTypes,
  },
  chilli: {
    name: "Chilli",
    icon: "🌶️",
    workersPerAcre: 4,
    workTypes: datasetWorkTypes,
  },
  sugarcane: {
    name: "Sugarcane",
    icon: "🎋",
    workersPerAcre: 6,
    workTypes: datasetWorkTypes,
  },
};

// DEMO WORKERS
// Later replace this array with backend API data.
const demoWorkers = [
  {
    id: 1,
    name: "Ramesh Kumar",
    age: 32,
    gender: "Male",
    location: "Kakinada",
    district: "East Godavari",
    skills: ["Cotton", "Paddy", "Seeding", "Irrigation Setup"],
    experience: 8,
    rating: 4.8,
    wage: 450,
    available: true,
    phone: "9876543210",
    avatar: "👨‍🌾",
  },
  {
    id: 2,
    name: "Suresh Naidu",
    age: 28,
    gender: "Male",
    location: "Rajahmundry",
    district: "East Godavari",
    skills: ["Cotton", "Wheat", "Harvesting", "Pruning"],
    experience: 5,
    rating: 4.6,
    wage: 480,
    available: true,
    phone: "9876543211",
    avatar: "👨‍🌾",
  },
  {
    id: 3,
    name: "Lakshmi Devi",
    age: 35,
    gender: "Female",
    location: "Samalkot",
    district: "Kakinada",
    skills: ["Paddy", "Chilli", "Pruning", "Seeding"],
    experience: 10,
    rating: 4.9,
    wage: 400,
    available: true,
    phone: "9876543212",
    avatar: "👩‍🌾",
  },
  {
    id: 4,
    name: "Ravi Teja",
    age: 30,
    gender: "Male",
    location: "Peddapuram",
    district: "Kakinada",
    skills: ["Sugarcane", "Cotton", "Tractor Driving", "Seeding"],
    experience: 6,
    rating: 4.7,
    wage: 500,
    available: true,
    phone: "9876543213",
    avatar: "👨‍🌾",
  },
  {
    id: 5,
    name: "Anitha",
    age: 27,
    gender: "Female",
    location: "Pithapuram",
    district: "Kakinada",
    skills: ["Paddy", "Wheat", "Harvesting", "Pesticide Spraying"],
    experience: 4,
    rating: 4.5,
    wage: 420,
    available: true,
    phone: "9876543214",
    avatar: "👩‍🌾",
  },
  {
    id: 6,
    name: "Venkat Rao",
    age: 40,
    gender: "Male",
    location: "Kakinada",
    district: "East Godavari",
    skills: [
      "Cotton",
      "Chilli",
      "Pesticide Spraying",
      "Irrigation Setup",
      "Harvesting",
    ],
    experience: 15,
    rating: 4.9,
    wage: 550,
    available: true,
    phone: "9876543215",
    avatar: "👨‍🌾",
  },
];

const getHiringHistoryStorageKey = (phone) =>
  `harvesthub_hiring_history:${phone}`;

function FarmerDashboard() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("workers");

  const [crop, setCrop] = useState("");
  const [acres, setAcres] = useState("");
  const [workType, setWorkType] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [location, setLocation] = useState("");
  const [wage, setWage] = useState("");

  // Search results
  const [matchedWorkers, setMatchedWorkers] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [hiredWorkers, setHiredWorkers] = useState([]);
  const [pendingHireWorkerId, setPendingHireWorkerId] = useState(null);

  const [hiringHistory, setHiringHistory] = useState(() => {
    const farmerPhone = localStorage.getItem("harvesthub_phone");

    if (!farmerPhone) return [];

    const savedHistory = localStorage.getItem(
      getHiringHistoryStorageKey(farmerPhone)
    );

    if (!savedHistory) return [];

    try {
      const parsedHistory = JSON.parse(savedHistory);

      if (Array.isArray(parsedHistory)) return parsedHistory;

      console.error("Saved hiring history is not a list.");
    } catch (error) {
      console.error("Could not read saved hiring history:", error);
    }

    return [];
  });

  // Farmer phone number
  const farmerPhone = localStorage.getItem("harvesthub_phone") || "";

  // Update Hiring History when worker accepts a job
  const updateHiringHistory = useCallback(
    (acceptedJob) => {
      if (!farmerPhone || !acceptedJob) return;

      setHiringHistory((previous) => {
        const jobId =
          acceptedJob.jobId ||
          acceptedJob.job_id ||
          acceptedJob.id;

        const workerPhone =
          acceptedJob.worker_phone ||
          acceptedJob.workerPhone ||
          "";

        const workerName =
          acceptedJob.worker_name ||
          acceptedJob.workerName ||
          "Worker";

        const cropType =
          acceptedJob.crop_type ||
          acceptedJob.cropType ||
          "";

        const existingIndex = previous.findIndex(
          (entry) =>
            (jobId &&
              String(entry.jobId || entry.id) === String(jobId)) ||
            (workerPhone &&
              entry.workerPhone === workerPhone &&
              entry.cropType === cropType)
        );

        const acceptedEntry = {
          ...(existingIndex >= 0
            ? previous[existingIndex]
            : {}),

          id:
            jobId ||
            (existingIndex >= 0
              ? previous[existingIndex].id
              : `accepted-${Date.now()}`),

          jobId: jobId || undefined,
          workerName,
          workerPhone,
          cropType,

          requiredSkill:
            acceptedJob.required_skill ||
            acceptedJob.requiredSkill ||
            "",

          requestedAt:
            acceptedJob.accepted_at ||
            acceptedJob.acceptedAt ||
            new Date().toISOString(),

          status: "Accepted",

          smsStatus:
            existingIndex >= 0
              ? previous[existingIndex].smsStatus
              : "accepted",

          smsMessage: "Worker accepted your job.",
        };

        const next = [...previous];

        if (existingIndex >= 0) {
          next[existingIndex] = acceptedEntry;
        } else {
          next.unshift(acceptedEntry);
        }

        localStorage.setItem(
          getHiringHistoryStorageKey(farmerPhone),
          JSON.stringify(next)
        );

        return next;
      });
    },
    [farmerPhone]
  );

  // Register farmer socket room and listen for worker acceptance
  useEffect(() => {
    if (!farmerPhone) return undefined;

    socket.emit("register_farmer", {
      farmer_phone: farmerPhone,
    });

    const handleWorkerAccepted = (data = {}) => {
      updateHiringHistory(data);

      alert(
        data.message ||
          `${data.worker_name || "A worker"} accepted your job.`
      );
    };

    socket.on("notify_farmer", handleWorkerAccepted);

    return () => {
      socket.off("notify_farmer", handleWorkerAccepted);

      socket.emit("unregister_farmer", {
        farmer_phone: farmerPhone,
      });
    };
  }, [farmerPhone, updateHiringHistory]);

  const selectedCrop = cropData[crop];

  const workersRequired =
    selectedCrop && acres
      ? Math.ceil(
          Number(acres) * selectedCrop.workersPerAcre
        )
      : 0;

  // Crop change
  const handleCropChange = (e) => {
    setCrop(e.target.value);
    setWorkType("");
    setMatchedWorkers([]);
    setSearchPerformed(false);
  };

  // Find workers
  const handleFindWorkers = (e) => {
    e.preventDefault();

    if (
      !crop ||
      !acres ||
      Number(acres) <= 0 ||
      !workType ||
      !workDate ||
      !location
    ) {
      alert("Please complete all required fields.");
      return;
    }

    // Temporary frontend demo matching
    const results = demoWorkers.filter((worker) => {
      const hasCrop = worker.skills.some(
        (skill) =>
          skill.toLowerCase() === crop.toLowerCase()
      );

      const hasWork = worker.skills.some(
        (skill) =>
          skill.toLowerCase() === workType.toLowerCase()
      );

      return worker.available && hasCrop && hasWork;
    });

    setMatchedWorkers(results);
    setSearchPerformed(true);

    setTimeout(() => {
      document
        .getElementById("worker-results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // Hire worker
  const handleHireWorker = (worker) => {
    if (
      hiredWorkers.some(
        (item) => item.id === worker.id
      )
    ) {
      alert(`${worker.name} is already selected.`);
      return false;
    }

    if (pendingHireWorkerId !== null) return false;

    const farmerPhone =
      localStorage.getItem("harvesthub_phone");

    if (!farmerPhone) {
      alert(
        "Please log in with the farmer mobile number before hiring a worker."
      );
      return false;
    }

    setPendingHireWorkerId(worker.id);

    const historyEntryId =
      `${Date.now()}-${worker.id}`;

    const saveHistoryEntry = (
      smsStatus,
      smsMessage
    ) => {
      const historyEntry = {
        id: historyEntryId,
        workerName: worker.name,
        workerPhone: worker.phone,
        cropType: selectedCrop?.name || "",
        requiredSkill: workType,
        requestedAt: new Date().toISOString(),
        smsStatus,
        smsMessage,
      };

      setHiringHistory((previous) => {
        const next = [historyEntry, ...previous];

        localStorage.setItem(
          getHiringHistoryStorageKey(farmerPhone),
          JSON.stringify(next)
        );

        return next;
      });
    };

    socket.timeout(15000).emit(
      "hire_worker",
      {
        worker_phone: worker.phone,
        worker_name: worker.name,
        farmer_phone: farmerPhone,
        crop_type: selectedCrop?.name,
        required_skill: workType,
      },
      (timeoutError, result) => {
        setPendingHireWorkerId(null);

        if (timeoutError || !result?.success) {
          const message =
            result?.message ||
            "No response from the backend. Check that the backend is running and try again.";

          saveHistoryEntry("failed", message);
          alert(message);
          return;
        }

        setHiredWorkers((previous) => [
          ...previous,
          worker,
        ]);

        saveHistoryEntry(
          "sent",
          result.message || "SMS sent."
        );

        alert(
          `${worker.name} selected. SMS sent with your contact number.`
        );
      }
    );

    return true;
  };

  // Clear form
  const handleClear = () => {
    setCrop("");
    setAcres("");
    setWorkType("");
    setWorkDate("");
    setLocation("");
    setWage("");
    setMatchedWorkers([]);
    setSearchPerformed(false);
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
          <div className="profile-avatar">👨‍🌾</div>

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
              activeMenu === "hiring-history"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              setActiveMenu("hiring-history")
            }
          >
            <span>🗂️</span>

            <div>
              <strong>Hiring History</strong>
              <small>View worker selections</small>
            </div>
          </button>

          <button
            className="sidebar-item"
            onClick={() =>
              navigate("/pest-detection")
            }
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
            className="sidebar-item"
            onClick={() =>
              setActiveMenu("notifications")
            }
          >
            <span>🔔</span>

            <div>
              <strong>Notifications</strong>
              <small>Latest updates</small>
            </div>

            <span className="notification-badge">
              3
            </span>
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

      {/* MAIN CONTENT */}
      <main className="farmer-main">
        <header className="farmer-header">
          <div>
            <p className="welcome-text">
              Welcome back 👋
            </p>

            <h1>Farmer Dashboard</h1>

            <p className="header-description">
              Find the right workers for your farm
              quickly and easily.
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
              <small>Demo statistics</small>
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

        {/* HIRING HISTORY */}
        {activeMenu === "hiring-history" && (
          <section
            className="dashboard-card"
            aria-label="Hiring history"
          >
            <div className="card-heading">
              <div>
                <h2>Hiring History</h2>

                <p>
                  Worker selections and SMS delivery
                  status for this account.
                </p>
              </div>

              <div className="heading-icon">
                🗂️
              </div>
            </div>

            {hiringHistory.length === 0 ? (
              <p role="status">
                No worker selections yet.
              </p>
            ) : (
              <div className="worker-cards-grid">
                {hiringHistory.map((entry) => (
                  <article
                    className="worker-profile-card"
                    key={entry.id}
                  >
                    <h3>{entry.workerName}</h3>

                    <p className="worker-location">
                      {entry.cropType} ·{" "}
                      {entry.requiredSkill}
                    </p>

                    <p>
                      Worker phone:{" "}
                      <a
                        href={`tel:${entry.workerPhone}`}
                      >
                        {entry.workerPhone}
                      </a>
                    </p>

                    <p>
                      Selected:{" "}
                      {new Date(
                        entry.requestedAt
                      ).toLocaleString()}
                    </p>

                    <p role="status">
                      Status:{" "}
                      {entry.status ||
                        (entry.smsStatus === "sent"
                          ? "SMS Sent"
                          : entry.smsStatus === "accepted"
                            ? "Accepted"
                            : "Not sent")}
                    </p>

                    {entry.smsStatus !== "sent" &&
                      entry.smsStatus !== "accepted" && (
                        <p role="alert">
                          {entry.smsMessage}
                        </p>
                      )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* WORKER SEARCH FORM */}
        {activeMenu === "workers" && (
          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>Find Agricultural Workers</h2>

                <p>
                  Enter your farm details to find
                  suitable workers.
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

                <div className="dashboard-field">
                  <label>
                    Land Area <span>*</span>
                  </label>

                  <div className="input-with-unit">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="Enter acres"
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
                      : "Select crop and land area"}
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
                      Select work type
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

                <div className="dashboard-field">
                  <label>
                    Work Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    value={workDate}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) =>
                      setWorkDate(e.target.value)
                    }
                  />
                </div>

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

                <div className="dashboard-field">
                  <label>Daily Wage</label>

                  <div className="input-with-unit">
                    <span className="currency">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
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
                  onClick={handleClear}
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  🔎 Find Workers
                </button>
              </div>
            </form>
          </section>
        )}

        {/* WORKER RESULTS */}
        {activeMenu === "workers" &&
          searchPerformed && (
            <section
              className="worker-results-section"
              id="worker-results"
            >
              <div className="results-header">
                <div>
                  <span className="results-eyebrow">
                    SEARCH RESULTS
                  </span>

                  <h2>Available Workers</h2>

                  <p>
                    {matchedWorkers.length} matching
                    workers found for{" "}
                    {selectedCrop?.name} {workType}.
                  </p>
                </div>

                <div className="results-count">
                  {matchedWorkers.length} Found
                </div>
              </div>

              <div className="results-summary">
                <div>
                  <span>Crop</span>
                  <strong>
                    {selectedCrop?.name}
                  </strong>
                </div>

                <div>
                  <span>Land Area</span>
                  <strong>{acres} Acres</strong>
                </div>

                <div>
                  <span>Workers Required</span>
                  <strong>{workersRequired}</strong>
                </div>

                <div>
                  <span>Workers Found</span>
                  <strong>
                    {matchedWorkers.length}
                  </strong>
                </div>
              </div>

              {matchedWorkers.length > 0 ? (
                <div className="worker-cards-grid">
                  {matchedWorkers.map((worker) => {
                    const isHired =
                      hiredWorkers.some(
                        (item) =>
                          item.id === worker.id
                      );

                    const isSendingHire =
                      pendingHireWorkerId ===
                      worker.id;

                    return (
                      <article
                        className="worker-profile-card"
                        key={worker.id}
                      >
                        <div className="worker-card-top">
                          <div className="worker-avatar">
                            {worker.avatar}
                          </div>

                          <span className="worker-available">
                            ● Available
                          </span>
                        </div>

                        <h3>{worker.name}</h3>

                        <p className="worker-location">
                          📍 {worker.location},{" "}
                          {worker.district}
                        </p>

                        <div className="worker-rating">
                          ⭐ {worker.rating}
                          <span>
                            {" "}
                            · {worker.experience} years
                            experience
                          </span>
                        </div>

                        <div className="worker-skills">
                          {worker.skills.map(
                            (skill) => (
                              <span key={skill}>
                                {skill}
                              </span>
                            )
                          )}
                        </div>

                        <div className="worker-card-divider" />

                        <div className="worker-card-footer">
                          <div className="worker-wage">
                            <strong>
                              ₹{worker.wage}
                            </strong>

                            <span>/ day</span>
                          </div>

                          <span className="worker-age">
                            {worker.age} years
                          </span>
                        </div>

                        <div className="worker-card-actions">
                          <button
                            className="view-profile-button"
                            onClick={() =>
                              setSelectedWorker(worker)
                            }
                          >
                            View Profile
                          </button>

                          <button
                            className={
                              isHired
                                ? "hire-worker-button hired"
                                : "hire-worker-button"
                            }
                            onClick={() =>
                              handleHireWorker(worker)
                            }
                            disabled={
                              isHired ||
                              isSendingHire ||
                              pendingHireWorkerId !== null
                            }
                          >
                            {isHired
                              ? "✓ Selected"
                              : isSendingHire
                                ? "Sending SMS..."
                                : "Hire Worker"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="no-workers">
                  <div>🔎</div>

                  <h3>
                    No matching workers found
                  </h3>

                  <p>
                    Try changing the crop type or work
                    type to see other available workers.
                  </p>
                </div>
              )}
            </section>
          )}

        {/* WORKER PROFILE MODAL */}
        {selectedWorker && (
          <div
            className="worker-modal-overlay"
            onClick={() =>
              setSelectedWorker(null)
            }
          >
            <div
              className="worker-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <button
                className="modal-close"
                onClick={() =>
                  setSelectedWorker(null)
                }
              >
                ✕
              </button>

              <div className="modal-avatar">
                {selectedWorker.avatar}
              </div>

              <h2>{selectedWorker.name}</h2>

              <p className="worker-location">
                📍 {selectedWorker.location},{" "}
                {selectedWorker.district}
              </p>

              <div className="modal-details">
                <div>
                  <span>Rating</span>
                  <strong>
                    ⭐ {selectedWorker.rating}
                  </strong>
                </div>

                <div>
                  <span>Experience</span>
                  <strong>
                    {selectedWorker.experience} years
                  </strong>
                </div>

                <div>
                  <span>Age</span>
                  <strong>
                    {selectedWorker.age}
                  </strong>
                </div>

                <div>
                  <span>Daily Wage</span>
                  <strong>
                    ₹{selectedWorker.wage}
                  </strong>
                </div>
              </div>

              <h4>Skills</h4>

              <div className="worker-skills">
                {selectedWorker.skills.map(
                  (skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  )
                )}
              </div>

              <p className="modal-phone">
                📞 {selectedWorker.phone}
              </p>

              <button
                className="hire-worker-button modal-hire"
                onClick={() => {
                  if (
                    handleHireWorker(selectedWorker)
                  ) {
                    setSelectedWorker(null);
                  }
                }}
              >
                Hire This Worker
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default FarmerDashboard;