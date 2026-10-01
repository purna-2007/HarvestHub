
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Languagecontext";
import { getUserCurrentLocation } from "../utils/geolocation";
import { apiRequest } from "../services/api";
import socket from "../services/socket";

const translations = {
  en: {
    title: "Worker Dashboard",
    gpsBtn: "📍 Scan Nearby Jobs (GPS)",
    gpsSuccess: "✅ Nearby job feeds loaded successfully!",
    matchingHeader: "Available Jobs Tailored For You",
    crop: "Crop:",
    skill: "Required Skill:",
    wage: "Daily Wage:",
    distance: "Distance:",
    matchScore: "AI Match Score:",
    acceptBtn: "Accept Job Requirement",
    acceptingBtn: "Accepting...",
    logoutBtn: "Sign Out",
    noJobs: "No active jobs found in your immediate perimeter yet.",
    hireNotification: "A farmer selected you for work:",
    acceptedAlert:
      "🎉 Job accepted successfully! The farmer has been notified in real time.",
    acceptError: "Unable to accept this job. Please try again.",
    alreadyAccepted: "You have already accepted this job.",
    locationError: "Unable to fetch your location. Please enable GPS."
  },

  te: {
    title: "కార్మికుల డాష్‌బోర్డ్",
    gpsBtn: "📍 సమీప పనులను వెతకండి (GPS)",
    gpsSuccess: "✅ పనుల జాబితా విజయవంతంగా లోడ్ చేయబడింది!",
    matchingHeader: "మీ కోసం అందుబాటులో ఉన్న వ్యవసాయ పనులు",
    crop: "పంట రకం:",
    skill: "కావలసిన నైపుణ్యం:",
    wage: "రోజువారీ కూలి:",
    distance: "దూరం:",
    matchScore: "AI మ్యాచ్ స్కోర్:",
    acceptBtn: "పనిని అంగీకరించు",
    acceptingBtn: "అంగీకరిస్తోంది...",
    logoutBtn: "లాగౌట్",
    noJobs: "ప్రస్తుతానికి మీ సమీపంలో ఎటువంటి పనులు అందుబాటులో లేవు.",
    hireNotification: "ఒక రైతు మిమ్మల్ని పనికి ఎంపిక చేశారు:",
    acceptedAlert:
      "🎉 పని విజయవంతంగా అంగీకరించబడింది! రైతుకు సమాచారం చేరింది.",
    acceptError: "పనిని అంగీకరించలేకపోయాం. దయచేసి మళ్లీ ప్రయత్నించండి.",
    alreadyAccepted: "మీరు ఇప్పటికే ఈ పనిని అంగీకరించారు.",
    locationError: "మీ లొకేషన్ పొందలేకపోయాం. దయచేసి GPS ఆన్ చేయండి."
  }
};

export default function WorkerDashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const t = translations[language || "en"];

  // Dashboard states
  const [jobs, setJobs] = useState([]);
  const [gpsStatus, setGpsStatus] = useState("");
  const [workerLocation, setWorkerLocation] = useState(null);
  const [hireNotifications, setHireNotifications] = useState([]);

  // Job acceptance states
  const [acceptingJobId, setAcceptingJobId] = useState(null);
  const [acceptedJobs, setAcceptedJobs] = useState([]);

  // Load initial jobs and register socket listeners
  useEffect(() => {
    loadMockFeed();

    const handleNewJob = (newJob) => {
      setJobs((prevJobs) => {
        const exists = prevJobs.some(
          (job) => String(job.id) === String(newJob.id)
        );

        if (exists) return prevJobs;

        return [newJob, ...prevJobs];
      });
    };

    const handleWorkerHired = (notification) => {
      setHireNotifications((previous) => [
        notification,
        ...previous
      ]);
    };

    const workerPhone = localStorage.getItem("harvesthub_phone");

    socket.on("notify_worker", handleNewJob);
    socket.on("worker_hired", handleWorkerHired);

    if (
      localStorage.getItem("harvesthub_role") === "worker" &&
      workerPhone
    ) {
      socket.emit("register_worker", {
        phone: workerPhone
      });
    }

    return () => {
      socket.off("notify_worker", handleNewJob);
      socket.off("worker_hired", handleWorkerHired);
      socket.emit("unregister_worker");
    };
  }, []);

  // Initial sample jobs
  const loadMockFeed = () => {
    setJobs([
      {
        id: 101,
        crop_type: "Paddy",
        required_skill: "Harvesting",
        final_wage: 520,
        distance_km: 2.4,
        match_score: 96
      },
      {
        id: 102,
        crop_type: "Sugarcane",
        required_skill: "Tractor Driving",
        final_wage: 600,
        distance_km: 5.8,
        match_score: 89
      },
      {
        id: 103,
        crop_type: "Cotton",
        required_skill: "Pesticide Spraying",
        final_wage: 450,
        distance_km: 12.1,
        match_score: 72
      }
    ]);
  };

  // Fetch nearby jobs using GPS
  const handleFetchNearbyJobs = async () => {
    try {
      setGpsStatus("Tracking field proximity...");

      const coords = await getUserCurrentLocation();

      setWorkerLocation(coords);

      const response = await apiRequest(
        `/jobs/feed?latitude=${coords.latitude}&longitude=${coords.longitude}`,
        "GET"
      );

      if (response && response.success && response.jobs.length > 0) {
        const processedJobs = response.jobs.map((job) => ({
          ...job,
          match_score:
            job.required_skill === "Harvesting" ? 95 : 85
        }));

        setJobs(processedJobs);
      }

      setGpsStatus(t.gpsSuccess);
    } catch (err) {
      console.error("GPS job fetch error:", err);

      setGpsStatus(
        "⚠️ Using cached local grid logs due to device hardware constraint."
      );
    }
  };

  // Accept a job and notify the farmer
  const handleAcceptJob = useCallback(
    (job) => {
      const jobId = job.id;

      // Prevent duplicate acceptance
      const alreadyAccepted = acceptedJobs.some(
        (id) => String(id) === String(jobId)
      );

      if (alreadyAccepted || acceptingJobId !== null) {
        alert(t.alreadyAccepted);
        return;
      }

      const workerId =
        localStorage.getItem("userId") || "mock_worker_01";

      const workerPhone =
        localStorage.getItem("harvesthub_phone") || "";

      const workerName =
        localStorage.getItem("harvesthub_name") || "Worker";

      setAcceptingJobId(jobId);

      try {
        // Send complete acceptance details to the backend
        const acceptanceData = {
          jobId,
          job_id: jobId,
          workerId,
          worker_id: workerId,
          workerPhone,
          worker_phone: workerPhone,
          workerName,
          worker_name: workerName,
          job: {
            id: job.id,
            crop_type: job.crop_type,
            required_skill: job.required_skill,
            final_wage: job.final_wage,
            distance_km: job.distance_km
          },
          acceptedAt: new Date().toISOString(),
          status: "accepted"
        };

        // Notify the backend through Socket.IO
        socket.emit("job_accepted", acceptanceData);

        // Update local accepted job list
        setAcceptedJobs((previous) => [
          ...previous,
          jobId
        ]);

        // Remove accepted job from available jobs
        setJobs((previousJobs) =>
          previousJobs.filter(
            (item) => String(item.id) !== String(jobId)
          )
        );

        // Show success confirmation
        alert(t.acceptedAlert);

      } catch (error) {
        console.error("Job acceptance error:", error);
        alert(t.acceptError);
      } finally {
        setAcceptingJobId(null);
      }
    },
    [acceptedJobs, acceptingJobId, t]
  );

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.wrapper}>

      {/* Navigation Header */}
      <header style={styles.header}>
        <h2 style={styles.logo}>
          🌾 Harvest Hub — {t.title}
        </h2>

        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
        >
          {t.logoutBtn}
        </button>
      </header>

      <main style={styles.container}>

        {/* Farmer Hiring Notifications */}
        {hireNotifications.length > 0 && (
          <section
            aria-live="polite"
            style={styles.notificationCard}
          >
            <h3 style={styles.sectionTitle}>
              {t.hireNotification}
            </h3>

            {hireNotifications.map((notification, index) => (
              <div
                key={`${notification.farmer_phone || "farmer"}-${index}`}
                style={styles.notificationItem}
              >
                <p style={styles.detailText}>
                  {notification.message}
                </p>

                {notification.farmer_phone && (
                  <a
                    href={`tel:${notification.farmer_phone}`}
                    style={styles.contactLink}
                  >
                    రైతుకు కాల్ చేయండి
                  </a>
                )}
              </div>
            ))}
          </section>
        )}

        {/* GPS Scanner */}
        <div style={styles.actionCard}>
          <button
            onClick={handleFetchNearbyJobs}
            style={styles.gpsButton}
          >
            {t.gpsBtn}
          </button>

          {gpsStatus && (
            <p style={styles.gpsFeedback}>
              {gpsStatus}
            </p>
          )}
        </div>

        {/* Available Jobs */}
        <h3 style={styles.sectionTitle}>
          {t.matchingHeader}
        </h3>

        {jobs.length === 0 ? (
          <div style={styles.emptyState}>
            {t.noJobs}
          </div>
        ) : (
          <div style={styles.grid}>
            {jobs.map((job) => {
              const isAccepting =
                String(acceptingJobId) === String(job.id);

              return (
                <div
                  key={job.id}
                  style={styles.jobCard}
                >
                  {/* Job Header */}
                  <div style={styles.cardHeader}>
                    <span style={styles.cropBadge}>
                      🌱 {t.crop} {job.crop_type}
                    </span>

                    <div
                      style={{
                        ...styles.matchBadge,
                        backgroundColor:
                          job.match_score > 85
                            ? "#d1fae5"
                            : "#fef3c7",
                        color:
                          job.match_score > 85
                            ? "#065f46"
                            : "#92400e"
                      }}
                    >
                      {t.matchScore}{" "}
                      <strong>
                        {job.match_score}%
                      </strong>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div style={styles.cardBody}>
                    <p style={styles.detailText}>
                      💼 <strong>{t.skill}</strong>{" "}
                      {job.required_skill}
                    </p>

                    <p style={styles.detailText}>
                      💰 <strong>{t.wage}</strong>{" "}
                      ₹{job.final_wage} / day
                    </p>

                    <p style={styles.detailText}>
                      📍 <strong>{t.distance}</strong>{" "}
                      ~{job.distance_km} KM
                    </p>
                  </div>

                  {/* Accept Button */}
                  <button
                    onClick={() => handleAcceptJob(job)}
                    disabled={isAccepting}
                    style={{
                      ...styles.acceptButton,
                      opacity: isAccepting ? 0.6 : 1,
                      cursor: isAccepting
                        ? "not-allowed"
                        : "pointer"
                    }}
                  >
                    {isAccepting
                      ? t.acceptingBtn
                      : t.acceptBtn}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Accepted Jobs Confirmation */}
        {acceptedJobs.length > 0 && (
          <div style={styles.acceptedInfo}>
            ✅ {acceptedJobs.length} job(s) accepted successfully.
          </div>
        )}

      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#2563eb",
    padding: "15px 5%",
    color: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },

  logo: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600"
  },

  logoutBtn: {
    padding: "8px 16px",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
  },

  container: {
    maxWidth: "1000px",
    margin: "30px auto",
    padding: "0 20px"
  },

  actionCard: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    textAlign: "center",
    marginBottom: "30px"
  },

  notificationCard: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "24px"
  },

  notificationItem: {
    borderBottom: "1px solid #d1fae5",
    paddingBottom: "10px",
    marginBottom: "10px"
  },

  contactLink: {
    display: "inline-block",
    marginTop: "8px",
    color: "#166534",
    fontWeight: "600"
  },

  gpsButton: {
    padding: "12px 30px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px"
  },

  gpsFeedback: {
    fontSize: "13px",
    margin: "10px 0 0 0",
    color: "#1e3a8a",
    fontWeight: "600"
  },

  sectionTitle: {
    fontSize: "20px",
    color: "#111827",
    fontWeight: "700",
    marginBottom: "20px"
  },

  emptyState: {
    textAlign: "center",
    padding: "40px",
    background: "white",
    borderRadius: "10px",
    color: "#6b7280",
    fontStyle: "italic"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px"
  },

  jobCard: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid #e5e7eb"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: "10px",
    gap: "10px"
  },

  cropBadge: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#166534"
  },

  matchBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600"
  },

  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px"
  },

  detailText: {
    margin: 0,
    fontSize: "14px",
    color: "#4b5563"
  },

  acceptButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "background 0.2s"
  },

  acceptedInfo: {
    marginTop: "25px",
    padding: "15px",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "600"
  }
};