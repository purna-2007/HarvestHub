import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Languagecontext";
import socket from "../services/socket";
import JobForm from "../components/jobform";
import { apiRequest } from "../services/api";
import { getUserCurrentLocation } from "../utils/geolocation";

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

const parseWorkerSkills = (skills) => {
  if (Array.isArray(skills)) return skills;
  if (typeof skills !== "string") return [];

  try {
    const parsedSkills = JSON.parse(skills);
    return Array.isArray(parsedSkills) ? parsedSkills : [];
  } catch (error) {
    console.error("Could not parse worker skills:", error);
    return [];
  }
};

const getHiringHistoryStorageKey = (phone) =>
  `harvesthub_hiring_history:${phone}`;

function FarmerDashboard() {
  const navigate = useNavigate();
  const { translate = (text) => text } = useLanguage();

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
  const [farmerJobs, setFarmerJobs] = useState([]);
  const [applicationsByJob, setApplicationsByJob] = useState({});
  const [loadingFarmerJobs, setLoadingFarmerJobs] = useState(false);
  const [farmerJobsLoadError, setFarmerJobsLoadError] = useState("");
  const [postingJob, setPostingJob] = useState(false);
  const [pendingDecisionId, setPendingDecisionId] = useState(null);
  const [jobFlowMessage, setJobFlowMessage] = useState("");
  const [jobCrop, setJobCrop] = useState("");
  const [jobAcres, setJobAcres] = useState("");
  const [jobSkill, setJobSkill] = useState("");
  const [jobDate, setJobDate] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobWage, setJobWage] = useState("");

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

  const loadFarmerJobs = useCallback(async () => {
    if (!farmerPhone) {
      const message = translate(
        "Please log in with the farmer mobile number before managing jobs."
      );
      setFarmerJobsLoadError(message);
      setJobFlowMessage(message);
      return;
    }

    setLoadingFarmerJobs(true);
    setFarmerJobsLoadError("");
    try {
      const response = await apiRequest(
        `/jobs/farmer/by-phone/${encodeURIComponent(farmerPhone)}`
      );
      if (!response?.success || !Array.isArray(response.jobs)) {
        throw new Error(response?.message || translate("Could not load your jobs."));
      }
      setFarmerJobs(response.jobs);
      const applicationEntries = await Promise.all(
        response.jobs.map(async (job) => {
          const applicationResponse = await apiRequest(
            `/jobs/${job.id}/applications?farmer_phone=${encodeURIComponent(farmerPhone)}`
          );
          if (!applicationResponse?.success) {
            throw new Error(
              applicationResponse?.message ||
                translate("Could not load job applications.")
            );
          }
          return [String(job.id), applicationResponse.applications || []];
        })
      );
      setApplicationsByJob(Object.fromEntries(applicationEntries));
    } catch (error) {
      console.error("Could not load farmer jobs:", error);
      const message = translate(error.message || "Could not load your jobs.");
      setFarmerJobsLoadError(message);
      setJobFlowMessage(message);
    } finally {
      setLoadingFarmerJobs(false);
    }
  }, [farmerPhone, translate]);

  useEffect(() => {
    if (activeMenu === "jobs" || activeMenu === "notifications") {
      loadFarmerJobs();
    }
  }, [activeMenu, loadFarmerJobs]);

  const handleCreateJob = async (event) => {
    event.preventDefault();
    setJobFlowMessage("");
    if (!farmerPhone) {
      setJobFlowMessage(
        translate("Please log in with the farmer mobile number before managing jobs.")
      );
      return;
    }
    if (!jobCrop || !jobSkill || !jobDate || !jobLocation || !jobWage) {
      setJobFlowMessage(translate("Please complete all required fields."));
      return;
    }

    setPostingJob(true);
    try {
      const coordinates = await getUserCurrentLocation();
      const cropDetails = cropData[jobCrop];
      const response = await apiRequest("/jobs/create", "POST", {
        farmer_phone: farmerPhone,
        title: `${cropDetails.name} - ${jobSkill}`,
        description: `${jobAcres || 1} acres`,
        crop_type: cropDetails.name,
        required_skill: jobSkill,
        workers_needed: Math.max(
          1,
          Math.ceil(Number(jobAcres || 1) * cropDetails.workersPerAcre)
        ),
        daily_wage: Number(jobWage),
        start_date: jobDate,
        location_name: jobLocation,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      });
      if (!response?.success) {
        throw new Error(response?.message || translate("Could not post the job."));
      }
      setJobFlowMessage(translate("Job posted successfully."));
      setJobCrop("");
      setJobAcres("");
      setJobSkill("");
      setJobDate("");
      setJobLocation("");
      setJobWage("");
      await loadFarmerJobs();
    } catch (error) {
      console.error("Could not post farmer job:", error);
      setJobFlowMessage(
        translate(
          error.message ||
            "Could not post the job. Please enable location and try again."
        )
      );
    } finally {
      setPostingJob(false);
    }
  };

  const handleApplicationDecision = async (job, application, decision) => {
    setPendingDecisionId(application.application_id);
    setJobFlowMessage("");
    try {
      const response = await apiRequest(
        `/jobs/${job.id}/applications/${application.application_id}/decision`,
        "POST",
        { farmer_phone: farmerPhone, decision }
      );
      if (!response?.success) {
        throw new Error(response?.message || translate("Could not update this application."));
      }
      setJobFlowMessage(
        translate(decision === "accept" ? "Worker application accepted." : "Worker application rejected.")
      );
      await loadFarmerJobs();
    } catch (error) {
      console.error("Could not decide worker application:", error);
      setJobFlowMessage(
        translate(error.message || "Could not update this application.")
      );
    } finally {
      setPendingDecisionId(null);
    }
  };

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

        const existingIndex = previous.findIndex((entry) =>
          jobId
            ? String(entry.jobId || entry.id) === String(jobId)
            : workerPhone &&
              entry.workerPhone === workerPhone &&
              entry.cropType === cropType
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
          workerId:
            acceptedJob.worker_id ||
            acceptedJob.workerId ||
            (existingIndex >= 0
              ? previous[existingIndex].workerId
              : undefined),
          workerVillage:
            acceptedJob.worker_village ||
            acceptedJob.workerVillage ||
            (existingIndex >= 0
              ? previous[existingIndex].workerVillage
              : ""),
          workerSkills:
            acceptedJob.worker_skills ||
            acceptedJob.workerSkills ||
            (existingIndex >= 0
              ? previous[existingIndex].workerSkills
              : []),
          workerExperience:
            acceptedJob.worker_experience_years ??
            acceptedJob.workerExperience ??
            (existingIndex >= 0
              ? previous[existingIndex].workerExperience
              : undefined),
          jobTitle:
            acceptedJob.job_title ||
            acceptedJob.jobTitle ||
            acceptedJob.title ||
            (existingIndex >= 0
              ? previous[existingIndex].jobTitle
              : ""),
          cropType,
          dailyWage:
            acceptedJob.daily_wage ||
            acceptedJob.final_wage ||
            acceptedJob.job?.final_wage ||
            (existingIndex >= 0
              ? previous[existingIndex].dailyWage
              : undefined),

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
      loadFarmerJobs();

      alert(
        translate(data.message) ||
          `${data.worker_name || translate("A worker")} ${translate("accepted your job.")}`
      );
    };

    const handleJobApplication = (application = {}) => {
      const workerName = application.worker_name || translate("A worker");
      setJobFlowMessage(
        `${workerName} ${translate("applied for one of your jobs.")}`
      );
      return loadFarmerJobs();
    };

    const handleJobCompleted = () => {
      loadFarmerJobs();
      setJobFlowMessage(translate("A worker marked the job as completed."));
    };

    socket.on("notify_farmer", handleWorkerAccepted);
    socket.on("job_application", handleJobApplication);
    socket.on("job_completed", handleJobCompleted);

    return () => {
      socket.off("notify_farmer", handleWorkerAccepted);
      socket.off("job_application", handleJobApplication);
      socket.off("job_completed", handleJobCompleted);

      socket.emit("unregister_farmer", {
        farmer_phone: farmerPhone,
      });
    };
  }, [activeMenu, farmerPhone, loadFarmerJobs, translate, updateHiringHistory]);

  const selectedCrop = cropData[crop];
  const acceptedWorkersByJob = new Map();
  hiringHistory
    .filter(
      (entry) =>
        entry.smsStatus === "accepted" ||
        String(entry.status || "").toLowerCase() === "accepted"
    )
    .forEach((entry, index) => {
      acceptedWorkersByJob.set(
        String(entry.jobId || entry.id || entry.workerPhone || index),
        entry
      );
    });
  const acceptedJobs = farmerJobs
    .filter(
      (job) =>
        ["accepted", "closed"].includes(String(job.status || "").toLowerCase()) &&
        job.worker_name
    )
    .map((job) => ({
      id: job.id,
      jobId: job.id,
      workerName: job.worker_name,
      workerPhone: job.worker_phone,
      workerId: job.accepted_worker_id,
      workerVillage: job.worker_village,
      workerSkills: parseWorkerSkills(job.worker_skills),
      workerExperience: job.worker_experience_years,
      jobTitle: job.title,
      cropType: job.crop_type,
      requiredSkill: job.required_skill,
      dailyWage: job.daily_wage,
      requestedAt: job.accepted_at || job.created_at,
      status: "Accepted"
    }));
  const acceptedApplications = farmerJobs.flatMap((job) =>
    (applicationsByJob[String(job.id)] || [])
      .filter((application) =>
        ["accepted", "completed"].includes(
          String(application.status || "").toLowerCase()
        )
      )
      .map((application) => ({
        id: application.application_id,
        jobId: job.id,
        workerName: application.worker_name,
        workerPhone: application.worker_phone,
        workerId: application.worker_id,
        workerVillage: application.worker_village,
        workerSkills: parseWorkerSkills(application.worker_skills),
        workerExperience: application.worker_experience_years,
        jobTitle: job.title,
        cropType: job.crop_type,
        requiredSkill: job.required_skill,
        dailyWage: application.agreed_wage,
        requestedAt:
          application.decided_at || job.accepted_at || application.applied_at,
        status: "Accepted"
      }))
  );
  [...acceptedJobs, ...acceptedApplications].forEach((entry) => {
    acceptedWorkersByJob.set(String(entry.jobId), entry);
  });
  const acceptedWorkers = Array.from(acceptedWorkersByJob.values());
  const pendingWorkerApplications = farmerJobs.flatMap((job) =>
    (applicationsByJob[String(job.id)] || [])
      .filter(
        (application) =>
          String(application.status || "").toLowerCase() === "pending" &&
          String(job.status || "").toLowerCase() === "open"
      )
      .map((application) => ({ ...application, job }))
  );
  const notificationCount =
    acceptedWorkers.length + pendingWorkerApplications.length;

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
  const handleFindWorkers = async (e) => {
    e.preventDefault();

    if (
      !crop ||
      !acres ||
      Number(acres) <= 0 ||
      !workType ||
      !workDate ||
      !location
    ) {
      alert(translate("Please complete all required fields."));
      return;
    }

    if (!farmerPhone) {
      alert(translate("Please log in with the farmer mobile number before managing jobs."));
      return;
    }

    try {
      const params = new URLSearchParams({
        skill: workType,
        location: location.trim(),
      });
      if (wage) params.set("max_daily_wage", wage);
      const response = await apiRequest(
        `/users/workers/search?${params.toString()}`
      );
      if (!response?.success || !Array.isArray(response.workers)) {
        throw new Error(response?.message || translate("Could not load available workers."));
      }

      const workersById = new Map();
      response.workers.forEach((profile) => {
        const workerId = profile.id || profile.mobile;
        if (!workerId || workersById.has(String(workerId))) return;

        workersById.set(String(workerId), {
          id: workerId,
          name: profile.name,
          age: "—",
          gender: "",
          location: profile.village || "—",
          district: Number.isFinite(Number(profile.distance_km))
            ? `${Number(profile.distance_km).toFixed(1)} km away`
            : "",
          skills: parseWorkerSkills(profile.skills),
          experience: Number(profile.experience_years) || 0,
          rating: "—",
          wage: Number(profile.expected_daily_wage) || 0,
          skillMatchScore:
            profile.skill_match_score == null
              ? null
              : Number(profile.skill_match_score),
          available: true,
          phone: profile.mobile,
          avatar: "👨‍🌾",
        });
      });

      setMatchedWorkers(Array.from(workersById.values()));
      setSearchPerformed(true);

      setTimeout(() => {
        document
          .getElementById("worker-results")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      console.error("Could not find available workers:", error);
      setMatchedWorkers([]);
      setSearchPerformed(true);
      alert(translate(error.message || "Could not load available workers."));
    }
  };

  // Hire worker
  const handleHireWorker = (worker) => {
    if (
      hiredWorkers.some(
        (item) => item.id === worker.id
      )
    ) {
      alert(`${worker.name} ${translate("is already selected.")}`);
      return false;
    }

    if (pendingHireWorkerId !== null) return false;

    const farmerPhone =
      localStorage.getItem("harvesthub_phone");

    if (!farmerPhone) {
      alert(
        translate("Please log in with the farmer mobile number before hiring a worker.")
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
            translate("No response from the backend. Check that the backend is running and try again.");

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
          result.message || translate("SMS sent.")
        );

        alert(
          `${worker.name} ${translate("selected. SMS sent with your contact number.")}`
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
            <span>{translate("Farmer Portal")}</span>
          </div>
        </div>

        <div className="farmer-profile-mini">
          <div className="profile-avatar">👨‍🌾</div>

          <div>
            <strong>{translate("Farmer")}</strong>
            <span>{translate("Farm Owner")}</span>
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
              <strong>{translate("Find Workers")}</strong>
              <small>{translate("Hire farm workers")}</small>
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
              <strong>{translate("Hiring History")}</strong>
              <small>{translate("View worker selections")}</small>
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
              <strong>{translate("Disease Detection")}</strong>
              <small>{translate("Check crop health")}</small>
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
              <strong>{translate("My Jobs")}</strong>
              <small>{translate("Manage your jobs")}</small>
            </div>
          </button>

          <button
            className={
              activeMenu === "notifications"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              setActiveMenu("notifications")
            }
          >
            <span>🔔</span>

            <div>
              <strong>{translate("Notifications")}</strong>
              <small>{translate("Latest updates")}</small>
            </div>

            {notificationCount > 0 && (
              <span className="notification-badge">
                {notificationCount}
              </span>
            )}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-item">
            <span>⚙️</span>

            <div>
              <strong>{translate("Settings")}</strong>
              <small>{translate("Account settings")}</small>
            </div>
          </button>

          <button
            className="sidebar-item logout-item"
            onClick={logout}
          >
            <span>🚪</span>

            <div>
              <strong>{translate("Logout")}</strong>
              <small>{translate("Sign out")}</small>
            </div>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="farmer-main">
        <header className="farmer-header">
          <div>
            <p className="welcome-text">
              {translate("Welcome back 👋")}
            </p>

            <h1>{translate("Farmer Dashboard")}</h1>

            <p className="header-description">
              {translate("Find the right workers for your farm quickly and easily.")}
            </p>
          </div>

          <div className="header-actions">
            <button
              className="notification-button"
              aria-label={translate("Notifications")}
              onClick={() => setActiveMenu("notifications")}
            >
              🔔
              {notificationCount > 0 && (
                <span>{notificationCount}</span>
              )}
            </button>

            <div className="header-profile">
              <div className="profile-avatar">
                👨‍🌾
              </div>

              <div>
                <strong>{translate("Farmer")}</strong>
                <small>{translate("Farm Owner")}</small>
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
              <span>{translate("Available Workers")}</span>
              <strong>128</strong>
              <small>{translate("Demo statistics")}</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange-icon">
              📋
            </div>

            <div>
              <span>{translate("Active Jobs")}</span>
              <strong>4</strong>
              <small>{translate("Currently running")}</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue-icon">
              ✅
            </div>

            <div>
              <span>{translate("Completed Jobs")}</span>
              <strong>23</strong>
              <small>{translate("This season")}</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple-icon">
              ⭐
            </div>

            <div>
              <span>{translate("Worker Rating")}</span>
              <strong>4.8</strong>
              <small>{translate("Average rating")}</small>
            </div>
          </div>
        </section>

        {activeMenu === "jobs" && (
          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>{translate("My Jobs")}</h2>
                <p>{translate("Post jobs and review worker applications.")}</p>
              </div>
              <div className="heading-icon">📋</div>
            </div>

            <form onSubmit={handleCreateJob}>
              <div className="form-grid">
                <div className="dashboard-field">
                  <label>{translate("Crop Type")} <span>*</span></label>
                  <select
                    value={jobCrop}
                    onChange={(event) => {
                      setJobCrop(event.target.value);
                      setJobSkill("");
                    }}
                    required
                  >
                    <option value="">{translate("Select crop")}</option>
                    {Object.entries(cropData).map(([key, item]) => (
                      <option value={key} key={key}>
                        {item.icon} {translate(item.name)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="dashboard-field">
                  <label>{translate("Work Type")} <span>*</span></label>
                  <select
                    value={jobSkill}
                    onChange={(event) => setJobSkill(event.target.value)}
                    disabled={!jobCrop}
                    required
                  >
                    <option value="">{translate("Select work type")}</option>
                    {cropData[jobCrop]?.workTypes.map((skill) => (
                      <option key={skill} value={skill}>{translate(skill)}</option>
                    ))}
                  </select>
                </div>
                <div className="dashboard-field">
                  <label>{translate("Land Area")} <span>*</span></label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={jobAcres}
                    onChange={(event) => setJobAcres(event.target.value)}
                    placeholder={translate("Enter acres")}
                    required
                  />
                </div>
                <div className="dashboard-field">
                  <label>{translate("Work Date")} <span>*</span></label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={jobDate}
                    onChange={(event) => setJobDate(event.target.value)}
                    required
                  />
                </div>
                <div className="dashboard-field">
                  <label>{translate("Work Location")} <span>*</span></label>
                  <input
                    value={jobLocation}
                    onChange={(event) => setJobLocation(event.target.value)}
                    placeholder={translate("Enter village / area")}
                    required
                  />
                </div>
                <div className="dashboard-field">
                  <label>{translate("Daily Wage")} (₹) <span>*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={jobWage}
                    onChange={(event) => setJobWage(event.target.value)}
                    placeholder={translate("e.g. 500")}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="primary-button"
                disabled={postingJob}
              >
                {postingJob
                  ? translate("Posting job...")
                  : translate("Post a Job")}
              </button>
            </form>

            {jobFlowMessage && (
              <p role="status" style={{ marginTop: 14 }}>
                {jobFlowMessage}
              </p>
            )}

            <h3 style={{ marginTop: 28 }}>{translate("Posted Jobs")}</h3>
            {loadingFarmerJobs ? (
              <p role="status">{translate("Loading your jobs...")}</p>
            ) : farmerJobs.length === 0 ? (
              <p role="status">{translate("You have not posted any jobs yet.")}</p>
            ) : (
              <div className="worker-cards-grid">
                {farmerJobs.map((job) => {
                  const jobApplications = applicationsByJob[String(job.id)] || [];
                  return (
                    <article className="worker-profile-card" key={job.id}>
                      <div className="worker-card-top">
                        <div>
                          <h3>{translate(job.title)}</h3>
                          <p className="worker-location">
                            {translate(job.crop_type)} · {translate(job.required_skill)}
                          </p>
                        </div>
                        <span className="worker-available">
                          {translate(job.status)}
                        </span>
                      </div>
                      <p>
                        <strong>{translate("Daily Wage")}:</strong>{" "}
                        ₹{job.daily_wage} / {translate("per day")}
                      </p>
                      <p>
                        <strong>{translate("Work Location")}:</strong>{" "}
                        {job.location_name}
                      </p>
                      <p>
                        {translate("Workers needed")}: {job.workers_needed}
                      </p>
                      <h4>{translate("Applications")} ({jobApplications.length})</h4>
                      {jobApplications.length === 0 ? (
                        <p>{translate("No workers have applied yet.")}</p>
                      ) : (
                        jobApplications.map((application) => {
                          const isPending = application.status === "pending";
                          const isWorking =
                            String(pendingDecisionId) ===
                            String(application.application_id);
                          return (
                            <div
                              key={application.application_id}
                              style={{
                                borderTop: "1px solid #e5e7eb",
                                padding: "12px 0"
                              }}
                            >
                              <strong>{application.worker_name}</strong>
                              {application.worker_phone && (
                                <p>
                                  <a href={`tel:${application.worker_phone}`}>
                                    {application.worker_phone}
                                  </a>
                                </p>
                              )}
                              {application.worker_village && (
                                <p>{translate("Village")}: {application.worker_village}</p>
                              )}
                              <p>
                                {translate("Status:")}{" "}
                                {translate(application.status)}
                              </p>
                              {isPending && job.status === "open" && (
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    type="button"
                                    className="primary-button"
                                    disabled={isWorking}
                                    onClick={() =>
                                      handleApplicationDecision(job, application, "accept")
                                    }
                                  >
                                    {translate("Accept")}
                                  </button>
                                  <button
                                    type="button"
                                    className="secondary-button"
                                    disabled={isWorking}
                                    onClick={() =>
                                      handleApplicationDecision(job, application, "reject")
                                    }
                                  >
                                    {translate("Reject")}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeMenu === "notifications" && (
          <section
            className="dashboard-card"
            aria-label={translate("Notifications")}
          >
            <div className="card-heading">
              <div>
                <h2>{translate("Notifications")}</h2>
                <p>{translate("Worker applications and accepted jobs")}</p>
              </div>
              <div className="heading-icon">🔔</div>
            </div>

            {farmerJobsLoadError && (
              <p role="alert">{farmerJobsLoadError}</p>
            )}

            {pendingWorkerApplications.length > 0 && (
              <>
                <h3>{translate("New worker applications")}</h3>
                <div className="worker-cards-grid">
                  {pendingWorkerApplications.map((application) => (
                    <article
                      className="worker-profile-card"
                      key={application.application_id}
                    >
                      <div className="worker-card-top">
                        <div className="worker-avatar">👷</div>
                        <span className="worker-available">
                          {translate("Application pending")}
                        </span>
                      </div>
                      <h3>{application.worker_name || translate("Worker")}</h3>
                      <p>
                        <strong>{translate("Job title")}:</strong>{" "}
                        {translate(application.job.title)}
                      </p>
                      <p>
                        <strong>{translate("Work Location")}:</strong>{" "}
                        {application.job.location_name}
                      </p>
                      {application.worker_village && (
                        <p className="worker-location">
                          📍 {translate("Village")}: {application.worker_village}
                        </p>
                      )}
                      {application.worker_phone && (
                        <p>
                          {translate("Worker phone")}:{" "}
                          <a href={`tel:${application.worker_phone}`}>
                            {application.worker_phone}
                          </a>
                        </p>
                      )}
                      <p>
                        <strong>{translate("Agreed daily wage")}:</strong>{" "}
                        ₹{application.agreed_wage} / {translate("per day")}
                      </p>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => setActiveMenu("jobs")}
                      >
                        {translate("Review in My Jobs")}
                      </button>
                    </article>
                  ))}
                </div>
              </>
            )}

            {acceptedWorkers.length > 0 && (
              <>
                <h3>{translate("Workers accepted")}</h3>
                <div className="worker-cards-grid">
                  {acceptedWorkers.map((worker) => (
                    <article
                      className="worker-profile-card"
                      key={worker.jobId || worker.id}
                    >
                      <div className="worker-card-top">
                        <div className="worker-avatar">👷</div>
                        <span className="worker-available">
                          ✓ {translate("Job accepted")}
                        </span>
                      </div>

                      <h3>{worker.workerName || translate("Worker")}</h3>
                      <p className="worker-location">
                        {translate("Worker profile")}
                        {worker.workerId ? ` · #${worker.workerId}` : ""}
                      </p>

                      {worker.workerPhone && (
                        <p>
                          {translate("Worker phone:")}{" "}
                          <a href={`tel:${worker.workerPhone}`}>
                            {worker.workerPhone}
                          </a>
                        </p>
                      )}
                      {worker.workerVillage && (
                        <p className="worker-location">
                          📍 {translate("Village")}: {worker.workerVillage}
                        </p>
                      )}
                      {worker.workerExperience !== undefined && (
                        <p>
                          <strong>{translate("Experience")}:</strong>{" "}
                          {worker.workerExperience} {translate("years experience")}
                        </p>
                      )}
                      {Array.isArray(worker.workerSkills) &&
                        worker.workerSkills.length > 0 && (
                          <div className="worker-skills">
                            {worker.workerSkills.map((skill) => (
                              <span key={skill}>{translate(skill)}</span>
                            ))}
                          </div>
                        )}

                      <p>
                        <strong>{translate("Accepted job")}:</strong>{" "}
                        {worker.jobTitle || worker.cropType}
                      </p>
                      {worker.jobTitle && worker.cropType && (
                        <p className="worker-location">{worker.cropType}</p>
                      )}
                      {worker.requiredSkill && (
                        <p>
                          <strong>{translate("Work Type")}:</strong>{" "}
                          {translate(worker.requiredSkill)}
                        </p>
                      )}
                      {worker.dailyWage && (
                        <p>
                          <strong>{translate("Agreed daily wage")}:</strong>{" "}
                          ₹{worker.dailyWage} / {translate("per day")}
                        </p>
                      )}
                      <p>
                        {translate("Selected:")}{" "}
                        {new Date(worker.requestedAt).toLocaleString(
                          localStorage.getItem("harvesthub_language") === "te"
                            ? "te-IN"
                            : "en-IN"
                        )}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}

            {notificationCount === 0 &&
              !loadingFarmerJobs &&
              !farmerJobsLoadError && (
              <p role="status">
                {translate("No worker applications or accepted jobs yet.")}
              </p>
            )}
          </section>
        )}

        {/* HIRING HISTORY */}
        {activeMenu === "hiring-history" && (
          <section
            className="dashboard-card"
            aria-label={translate("Hiring history")}
          >
            <div className="card-heading">
              <div>
                <h2>{translate("Hiring History")}</h2>

                <p>
                  {translate("Worker selections and SMS delivery status for this account.")}
                </p>
              </div>

              <div className="heading-icon">
                🗂️
              </div>
            </div>

            {hiringHistory.length === 0 ? (
              <p role="status">
                {translate("No worker selections yet.")}
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
                      {translate("Worker phone:")}{" "}
                      <a
                        href={`tel:${entry.workerPhone}`}
                      >
                        {entry.workerPhone}
                      </a>
                    </p>

                    <p>
                      {translate("Selected:")}{" "}
                      {new Date(
                        entry.requestedAt
                      ).toLocaleString(
                        localStorage.getItem("harvesthub_language") === "te"
                          ? "te-IN"
                          : "en-IN"
                      )}
                    </p>

                    <p role="status">
                      {translate("Status:")}{" "}
                      {translate(entry.status) ||
                        (entry.smsStatus === "sent"
                          ? translate("SMS Sent")
                          : entry.smsStatus === "accepted"
                            ? translate("Accepted")
                            : translate("Not sent"))}
                    </p>

                    {entry.smsStatus !== "sent" &&
                      entry.smsStatus !== "accepted" && (
                        <p role="alert">
                          {translate(entry.smsMessage)}
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
          <JobForm
            crop={crop}
            acres={acres}
            workType={workType}
            workDate={workDate}
            location={location}
            wage={wage}
            cropData={cropData}
            selectedCrop={selectedCrop}
            workersRequired={workersRequired}
            onCropChange={handleCropChange}
            onAcresChange={setAcres}
            onWorkTypeChange={setWorkType}
            onWorkDateChange={setWorkDate}
            onLocationChange={setLocation}
            onWageChange={setWage}
            onSubmit={handleFindWorkers}
            onClear={handleClear}
            translate={translate}
          />
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
                    {translate("SEARCH RESULTS")}
                  </span>

                  <h2>{translate("Available Workers")}</h2>

                  <p>
                    {matchedWorkers.length} {translate("matching workers found for")}{" "}
                    {translate(selectedCrop?.name)} {translate(workType)}.
                  </p>
                </div>

                <div className="results-count">
                  {matchedWorkers.length} {translate("Found")}
                </div>
              </div>

              <div className="results-summary">
                <div>
                  <span>{translate("Crop")}</span>
                  <strong>
                    {translate(selectedCrop?.name)}
                  </strong>
                </div>

                <div>
                  <span>{translate("Land Area")}</span>
                  <strong>{acres} {translate("Acres")}</strong>
                </div>

                <div>
                  <span>{translate("Workers Required")}</span>
                  <strong>{workersRequired}</strong>
                </div>

                <div>
                  <span>{translate("Workers Found")}</span>
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
                            ● {translate("Available")}
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
                            · {worker.experience} {translate("years experience")}
                          </span>
                        </div>

                        <div className="worker-skills">
                          {worker.skills.map(
                            (skill) => (
                              <span key={skill}>
                                {translate(skill)}
                              </span>
                            )
                          )}
                        </div>

                        {Number.isFinite(worker.skillMatchScore) && (
                          <p className="worker-rating">
                            {translate("Skill match")}: {worker.skillMatchScore}%
                          </p>
                        )}

                        <div className="worker-card-divider" />

                        <div className="worker-card-footer">
                          <div className="worker-wage">
                            <strong>
                              ₹{worker.wage}
                            </strong>

                            <span>/ {translate("per day")}</span>
                          </div>

                          <span className="worker-age">
                            {worker.age} {translate("Age")}
                          </span>
                        </div>

                        <div className="worker-card-actions">
                          <button
                            className="view-profile-button"
                            onClick={() =>
                              setSelectedWorker(worker)
                            }
                          >
                            {translate("View Profile")}
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
                              ? translate("✓ Selected")
                              : isSendingHire
                                ? translate("Sending SMS...")
                                : translate("Hire Worker")}
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
                    {translate("No matching workers found")}
                  </h3>

                  <p>
                    {translate("Try changing the crop type or work type to see other available workers.")}
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
                  <span>{translate("Rating")}</span>
                  <strong>
                    ⭐ {selectedWorker.rating}
                  </strong>
                </div>

                <div>
                  <span>{translate("Experience")}</span>
                  <strong>
                    {selectedWorker.experience} {translate("years experience")}
                  </strong>
                </div>

                <div>
                  <span>{translate("Age")}</span>
                  <strong>
                    {selectedWorker.age}
                  </strong>
                </div>

                <div>
                  <span>{translate("Daily Wage")}</span>
                  <strong>
                    ₹{selectedWorker.wage}
                  </strong>
                </div>
              </div>

              <h4>{translate("Skills")}</h4>

              <div className="worker-skills">
                {selectedWorker.skills.map(
                  (skill) => (
                    <span key={skill}>
                      {translate(skill)}
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
                {translate("Hire This Worker")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default FarmerDashboard;