
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Languagecontext";
import { getUserCurrentLocation } from "../utils/geolocation";
import { apiRequest } from "../services/api";
import socket from "../services/socket";
import WorkerProfile from "./Workerprofile";
import JobCard from "../components/jobcard";
import Notification from "../components/Notification";

const translations = {
  en: {
    title: "Worker Dashboard",
    welcomeTitle: "Find your next farm job",
    welcomeDescription: "Explore nearby work, apply with confidence, and track every update in one place.",
    availableJobsStat: "Jobs found",
    applicationsStat: "Applications",
    acceptedStat: "Accepted",
    rejectedStat: "Not selected",
    searchJobsHint: "Search nearby jobs to see current openings.",
    applicationsMenu: "My Applications",
    gpsBtn: "📍 Find Jobs Near Me",
    gpsSuccess: "Nearby jobs loaded.",
    jobsFound: (count) => `✅ ${count} open job(s) found near your location.`,
    profileLocationNotice: "Current location unavailable; showing jobs near your saved profile location.",
    crop: "Crop:",
    skill: "Required Skill:",
    wage: "Daily Wage:",
    distance: "Distance:",
    workLocation: "Work location:",
    workDate: "Work date:",
    farmer: "Farmer:",
    description: "Work details:",
    logoutBtn: "Sign Out",
    noJobs:
      "There are no open jobs available right now. Farmers need to post a job before it appears here. Check again later.",
    scanPrompt:
      "Select “Find Jobs Near Me” and allow location access to see open farm jobs. Jobs appear here after a farmer posts them.",
    guideDecision: "4. Track the farmer’s decision in My Applications. Work is confirmed only after the farmer accepts.",
    addedWorkersHint:
      "These are worker profiles added from this account. Each worker signs in with their own registered mobile number.",
    hireNotification: "A farmer selected you for work:",
    acceptedAlert:
      "🎉 Job accepted successfully! The farmer has been notified in real time.",
    acceptError: "Unable to accept this job. Please try again.",
    alreadyAccepted: "You have already accepted this job.",
    locationError: "Unable to fetch your location. Please enable GPS.",
    tracking: "Tracking field proximity...",
    cachedJobs: "⚠️ Using cached local grid logs due to device hardware constraint.",
    callFarmer: "Call farmer",
    acceptedCount: "job(s) accepted successfully.",
    perDay: "per day",
    acceptWorkMenu: "Find & Apply",
    addWorkerMenu: "Add Worker",
    workersMenu: "Workers",
    workersMenuHint: "View added workers",
    addedWorkersTitle: "Added Workers",
    noWorkersAdded: "No workers added yet.",
    workerAdded: "worker(s) added",
    profileRequired: "Create your worker profile before applying for jobs.",
    profileLoaded: "Worker profile loaded.",
    applyBtn: "Apply for Job",
    applyingBtn: "Applying...",
    applicationsLoading: "Loading your applications...",
    applicationsLoadError: "Could not load your applications. Please try again.",
    pendingStatus: "Application pending",
    acceptedStatus: "Application accepted",
    rejectedStatus: "Application rejected",
    completedStatus: "Job completed",
    applicationsTitle: "My Applications",
    noApplications:
      "You have not applied yet. After applying to a job above, your application status and the farmer’s decision will appear here.",
    acceptedStatusHelp: "The farmer accepted your application. Contact the farmer to confirm when to start.",
    rejectedStatusHelp: "The farmer did not select your application for this job.",
    completedStatusHelp: "You marked this job as complete.",
    applySuccess: "Your application was sent to the farmer.",
    applyError: "Could not submit your application. Please try again.",
    completeBtn: "Mark Job Complete",
    completingBtn: "Completing...",
    completeSuccess: "Job marked as completed.",
    completeError: "Could not complete the job. Please try again."
  },

  te: {
    title: "కార్మికుల డాష్‌బోర్డ్",
    welcomeTitle: "మీ తదుపరి వ్యవసాయ పనిని వెతకండి",
    welcomeDescription: "సమీప పనులను చూడండి, దరఖాస్తు చేయండి, ప్రతి అప్‌డేట్‌ను ఇక్కడ తెలుసుకోండి.",
    availableJobsStat: "దొరికిన పనులు",
    applicationsStat: "దరఖాస్తులు",
    acceptedStat: "అంగీకరించినవి",
    rejectedStat: "ఎంపిక కానివి",
    searchJobsHint: "ప్రస్తుతం అందుబాటులో ఉన్న పనులను చూడటానికి సమీప పనుల కోసం వెతకండి.",
    applicationsMenu: "నా దరఖాస్తులు",
    gpsBtn: "📍 సమీప పనులను వెతకండి (GPS)",
    gpsSuccess: "✅ పనుల జాబితా విజయవంతంగా లోడ్ చేయబడింది!",
    jobsFound: (count) => `✅ మీ ప్రాంతంలో ${count} పనులు అందుబాటులో ఉన్నాయి.`,
    profileLocationNotice: "ప్రస్తుత లొకేషన్ అందుబాటులో లేదు; మీ ప్రొఫైల్‌లో సేవ్ చేసిన ప్రదేశానికి దగ్గరలోని పనులను చూపిస్తున్నాం.",
    crop: "పంట రకం:",
    skill: "కావలసిన నైపుణ్యం:",
    wage: "రోజువారీ కూలి:",
    distance: "దూరం:",
    workLocation: "పని ప్రదేశం:",
    workDate: "పని తేదీ:",
    farmer: "రైతు:",
    description: "పని వివరాలు:",
    logoutBtn: "లాగౌట్",
    noJobs:
      "ప్రస్తుతం అందుబాటులో ఉన్న పనులు లేవు. రైతు పని పోస్ట్ చేసిన తర్వాత ఇక్కడ కనిపిస్తుంది. తర్వాత మళ్లీ చూడండి.",
    scanPrompt:
      "సమీపంలోని పనులు చూడటానికి “నా దగ్గర పనులు వెతకండి” ఎంచుకుని లొకేషన్ అనుమతించండి. రైతు పని పోస్ట్ చేసిన తర్వాత ఇక్కడ కనిపిస్తుంది.",
    guideDecision: "4. నా దరఖాస్తుల్లో రైతు నిర్ణయాన్ని చూడండి. రైతు అంగీకరించిన తర్వాతే పని ఖరారు అవుతుంది.",
    addedWorkersHint:
      "ఇవి ఈ ఖాతా నుంచి జోడించిన కార్మికుల ప్రొఫైళ్లు. ప్రతి కార్మికుడు తన నమోదైన మొబైల్ నంబర్‌తో లాగిన్ అవ్వాలి.",
    hireNotification: "ఒక రైతు మిమ్మల్ని పనికి ఎంపిక చేశారు:",
    acceptedAlert:
      "🎉 పని విజయవంతంగా అంగీకరించబడింది! రైతుకు సమాచారం చేరింది.",
    acceptError: "పనిని అంగీకరించలేకపోయాం. దయచేసి మళ్లీ ప్రయత్నించండి.",
    alreadyAccepted: "మీరు ఇప్పటికే ఈ పనిని అంగీకరించారు.",
    locationError: "మీ లొకేషన్ పొందలేకపోయాం. దయచేసి GPS ఆన్ చేయండి.",
    tracking: "చుట్టుపక్కల పనులను వెతుకుతోంది...",
    cachedJobs: "⚠️ పరికర పరిమితి కారణంగా సేవ్ చేసిన స్థానిక పని వివరాలను చూపిస్తోంది.",
    callFarmer: "రైతుకు కాల్ చేయండి",
    acceptedCount: "పనులు విజయవంతంగా అంగీకరించబడ్డాయి.",
    perDay: "రోజుకు",
    acceptWorkMenu: "పని వెతికి దరఖాస్తు",
    addWorkerMenu: "కార్మికుడిని జోడించండి",
    workersMenu: "కార్మికులు",
    workersMenuHint: "జోడించిన కార్మికులను చూడండి",
    addedWorkersTitle: "జోడించిన కార్మికులు",
    noWorkersAdded: "ఇంకా కార్మికులను జోడించలేదు.",
    workerAdded: "కార్మికులు జోడించబడ్డారు",
    profileRequired: "పనులకు దరఖాస్తు చేయడానికి ముందుగా మీ కార్మికుడి ప్రొఫైల్‌ను నమోదు చేయండి.",
    profileLoaded: "కార్మికుడి ప్రొఫైల్ లోడ్ అయింది.",
    applyBtn: "పని కోసం దరఖాస్తు చేయండి",
    applyingBtn: "దరఖాస్తు చేస్తోంది...",
    applicationsLoading: "మీ దరఖాస్తులను లోడ్ చేస్తోంది...",
    applicationsLoadError: "మీ దరఖాస్తులను లోడ్ చేయలేకపోయాం. మళ్లీ ప్రయత్నించండి.",
    pendingStatus: "దరఖాస్తు పెండింగ్‌లో ఉంది",
    acceptedStatus: "దరఖాస్తు ఆమోదించబడింది",
    rejectedStatus: "దరఖాస్తు తిరస్కరించబడింది",
    completedStatus: "పని పూర్తయింది",
    applicationsTitle: "నా దరఖాస్తులు",
    noApplications:
      "మీరు ఇంకా దరఖాస్తు చేయలేదు. పై పనికి దరఖాస్తు చేసిన తర్వాత మీ దరఖాస్తు స్థితి, రైతు నిర్ణయం ఇక్కడ కనిపిస్తాయి.",
    acceptedStatusHelp: "రైతు మీ దరఖాస్తును అంగీకరించారు. పని ఎప్పుడు ప్రారంభించాలో రైతును సంప్రదించండి.",
    rejectedStatusHelp: "ఈ పనికి రైతు మీ దరఖాస్తును ఎంపిక చేయలేదు.",
    completedStatusHelp: "మీరు ఈ పని పూర్తయినట్లు నమోదు చేశారు.",
    applySuccess: "మీ దరఖాస్తు రైతుకు పంపబడింది.",
    applyError: "దరఖాస్తు పంపలేకపోయాం. మళ్లీ ప్రయత్నించండి.",
    completeBtn: "పని పూర్తయిందని గుర్తించండి",
    completingBtn: "పూర్తి చేస్తోంది...",
    completeSuccess: "పని పూర్తయినట్లు నమోదు అయింది.",
    completeError: "పనిని పూర్తి చేయలేకపోయాం. మళ్లీ ప్రయత్నించండి."
  }
};

const statusLabel = (status, languageStrings) => {
  const normalizedStatus = String(status || "pending").toLowerCase();
  if (normalizedStatus === "accepted") return languageStrings.acceptedStatus;
  if (normalizedStatus === "rejected") return languageStrings.rejectedStatus;
  if (normalizedStatus === "completed") return languageStrings.completedStatus;
  return languageStrings.pendingStatus;
};

const getWorkerProfileLocation = (profile) => {
  const latitude = Number(profile?.latitude);
  const longitude = Number(profile?.longitude);
  if (
    profile?.latitude == null ||
    profile?.longitude == null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }
  return { latitude, longitude };
};

export default function WorkerDashboard() {
  const { language, translate = (text) => text } = useLanguage();
  const navigate = useNavigate();

  const t = translations[language || "en"];
  const workerPhone = localStorage.getItem("harvesthub_phone") || "";
  const createdWorkersStorageKey =
    `harvesthub_created_workers:${workerPhone || "local"}`;

  // Dashboard states
  const [activeSection, setActiveSection] = useState("accept-work");
  const [createdWorkers, setCreatedWorkers] = useState(() => {
    try {
      const savedWorkers = JSON.parse(
        localStorage.getItem(createdWorkersStorageKey) || "[]"
      );
      return Array.isArray(savedWorkers) ? savedWorkers : [];
    } catch (error) {
      console.error("Could not read added workers:", error);
      return [];
    }
  });
  const [jobs, setJobs] = useState([]);
  const [hasSearchedJobs, setHasSearchedJobs] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("");
  const [workerProfileLocation, setWorkerProfileLocation] = useState(null);
  const [hireNotifications, setHireNotifications] = useState([]);
  const [workerProfileReady, setWorkerProfileReady] = useState(null);

  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationsLoadError, setApplicationsLoadError] = useState("");
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [completingApplicationId, setCompletingApplicationId] = useState(null);
  const acceptedApplications = applications.filter(
    (application) => String(application.status).toLowerCase() === "accepted"
  ).length;
  const rejectedApplications = applications.filter(
    (application) => String(application.status).toLowerCase() === "rejected"
  ).length;

  const loadWorkerApplications = useCallback(async () => {
    if (!workerPhone) return;
    setLoadingApplications(true);
    setApplicationsLoadError("");
    try {
      const response = await apiRequest(
        `/jobs/worker/${encodeURIComponent(workerPhone)}/applications`
      );
      if (!response?.success || !Array.isArray(response.applications)) {
        throw new Error(response?.message || t.applicationsLoadError);
      }
      setApplications(response.applications);
    } catch (error) {
      console.error("Could not load job applications:", error);
      setApplicationsLoadError(
        translate(error.message || t.applicationsLoadError)
      );
    } finally {
      setLoadingApplications(false);
    }
  }, [workerPhone, t.applicationsLoadError, translate]);

  const handleWorkerCreated = (worker) => {
    setCreatedWorkers((previous) => {
      const next = [
        worker,
        ...previous.filter((item) => item.mobile !== worker.mobile)
      ];
      localStorage.setItem(createdWorkersStorageKey, JSON.stringify(next));
      return next;
    });
    setActiveSection("workers");
  };

  const handleProfileSaved = (profile) => {
    setWorkerProfileReady(true);
    setWorkerProfileLocation(getWorkerProfileLocation(profile));
    setGpsStatus(t.profileLoaded);
    setActiveSection("accept-work");
  };

  useEffect(() => {
    if (!workerPhone) {
      setWorkerProfileReady(false);
      setActiveSection("register-worker");
      return undefined;
    }

    let cancelled = false;
    apiRequest(`/users/worker/${encodeURIComponent(workerPhone)}`)
      .then((response) => {
        if (cancelled) return;
        const profileExists =
          response &&
          Object.prototype.hasOwnProperty.call(response, "profile")
            ? Boolean(response.profile)
            : true;
        setWorkerProfileReady(profileExists);
        setWorkerProfileLocation(getWorkerProfileLocation(response?.profile));
        if (!profileExists) {
          setActiveSection("register-worker");
          setGpsStatus(t.profileRequired);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Could not verify worker profile:", error);
        setWorkerProfileReady(false);
        setActiveSection("register-worker");
        setGpsStatus(translate(error.message || t.applyError));
      });

    return () => {
      cancelled = true;
    };
  }, [workerPhone, t.profileRequired, t.applyError, translate]);

  // Load initial jobs and register socket listeners
  useEffect(() => {
    loadWorkerApplications();

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

    const handleApplicationStatus = (updatedApplication) => {
      setApplications((previous) => {
        const existing = previous.find(
          (application) =>
            String(application.job_id) === String(updatedApplication.job_id)
        );
        if (!existing) return [updatedApplication, ...previous];
        return previous.map((application) =>
          String(application.job_id) === String(updatedApplication.job_id)
            ? { ...application, ...updatedApplication }
            : application
        );
      });
    };

    socket.on("notify_worker", handleNewJob);
    socket.on("worker_hired", handleWorkerHired);
    socket.on("application_status", handleApplicationStatus);

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
      socket.off("application_status", handleApplicationStatus);
      socket.emit("unregister_worker");
    };
  }, [workerPhone, t.applyError, translate, loadWorkerApplications]);

  // Fetch nearby jobs using GPS
  const handleFetchNearbyJobs = async () => {
    if (loadingJobs) return;

    setLoadingJobs(true);
    try {
      setGpsStatus(t.tracking);

      let coords;
      let usedProfileLocation = false;
      try {
        coords = await getUserCurrentLocation({
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000
        });
      } catch (locationError) {
        let profileLocation = workerProfileLocation;
        if (!profileLocation && workerPhone) {
          const profileResponse = await apiRequest(
            `/users/worker/${encodeURIComponent(workerPhone)}`
          );
          profileLocation = getWorkerProfileLocation(profileResponse?.profile);
          setWorkerProfileLocation(profileLocation);
        }
        if (!profileLocation) throw locationError;
        console.warn(
          "Current location unavailable; using the saved worker profile location:",
          locationError
        );
        coords = profileLocation;
        usedProfileLocation = true;
      }

      const response = await apiRequest(
        `/jobs/feed?latitude=${encodeURIComponent(coords.latitude)}&longitude=${encodeURIComponent(coords.longitude)}`,
        "GET"
      );

      if (response && response.success && Array.isArray(response.jobs)) {
        setJobs(response.jobs);
        setHasSearchedJobs(true);
        const locationNotice = usedProfileLocation
          ? `${t.profileLocationNotice} `
          : "";
        setGpsStatus(
          `${locationNotice}${
            response.jobs.length > 0
              ? t.jobsFound(response.jobs.length)
              : t.gpsSuccess
          }`
        );
      } else {
        throw new Error(response?.message || t.locationError);
      }
    } catch (err) {
      console.error("GPS job fetch error:", err);
      setGpsStatus(translate(err.message || t.locationError));
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleApplyForJob = useCallback(
    async (job) => {
      const jobId = job.id;
      const existingApplication = applications.find(
        (application) => String(application.job_id) === String(jobId)
      );
      if (existingApplication) {
        setGpsStatus(statusLabel(existingApplication.status, t));
        return;
      }
      if (workerProfileReady !== true) {
        setActiveSection("register-worker");
        setGpsStatus(t.profileRequired);
        return;
      }
      if (applyingJobId !== null) {
        return;
      }

      setApplyingJobId(jobId);

      try {
        const response = await apiRequest(
          `/jobs/${jobId}/apply`,
          "POST",
          {
            worker_phone: workerPhone,
            agreed_wage: job.final_wage || job.daily_wage
          }
        );

        if (!response?.success) {
          throw new Error(response?.message || t.applyError);
        }

        const application = response.application || {
          job_id: jobId,
          title: job.title,
          crop_type: job.crop_type,
          required_skill: job.required_skill,
          agreed_wage: job.final_wage || job.daily_wage,
          status: "pending"
        };
        setApplications((previous) => [
          application,
          ...previous.filter(
            (item) => String(item.job_id) !== String(jobId)
          )
        ]);
        setGpsStatus(t.applySuccess);

      } catch (error) {
        console.error("Job application error:", error);
        setGpsStatus(translate(error.message || t.applyError));
      } finally {
        setApplyingJobId(null);
      }
    },
    [applications, applyingJobId, workerPhone, workerProfileReady, t, translate]
  );

  const handleCompleteJob = useCallback(
    async (application) => {
      setCompletingApplicationId(application.application_id);
      try {
        const response = await apiRequest(
          `/jobs/applications/${application.application_id}/complete`,
          "POST",
          { worker_phone: workerPhone }
        );
        if (!response?.success) {
          throw new Error(response?.message || t.completeError);
        }
        setApplications((previous) =>
          previous.map((item) =>
            String(item.application_id) === String(application.application_id)
              ? { ...item, status: "completed" }
              : item
          )
        );
        setGpsStatus(t.completeSuccess);
      } catch (error) {
        console.error("Job completion error:", error);
        setGpsStatus(translate(error.message || t.completeError));
      } finally {
        setCompletingApplicationId(null);
      }
    },
    [t, translate, workerPhone]
  );

  // Logout
  const handleLogout = () => {
    const selectedLanguage = localStorage.getItem("harvesthub_language");
    localStorage.clear();
    if (selectedLanguage) {
      localStorage.setItem("harvesthub_language", selectedLanguage);
    }
    navigate("/");
  };

  return (
    <div style={styles.wrapper}>

      {/* Navigation Header */}
      <header style={styles.header}>
        <h2 style={styles.logo}>🌿 HarvestHub</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          {t.logoutBtn}
        </button>
      </header>

      <div style={styles.dashboardLayout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarBrand}>
            <span style={styles.sidebarAvatar} aria-hidden="true">🌾</span>
            <strong>{t.title}</strong>
          </div>
          <button
            type="button"
            style={activeSection === "accept-work" ? styles.navButtonActive : styles.navButton}
            onClick={() => setActiveSection("accept-work")}
          >
            <span aria-hidden="true">⌕</span> {t.acceptWorkMenu}
          </button>
          <button
            type="button"
            style={activeSection === "applications" ? styles.navButtonActive : styles.navButton}
            onClick={() => {
              setActiveSection("applications");
              loadWorkerApplications();
            }}
          >
            <span aria-hidden="true">▤</span> {t.applicationsMenu}
          </button>
          <button
            type="button"
            style={activeSection === "add-worker" ? styles.navButtonActive : styles.navButton}
            onClick={() => setActiveSection("add-worker")}
          >
            ➕ {t.addWorkerMenu}
          </button>
          <button
            type="button"
            style={activeSection === "workers" ? styles.navButtonActive : styles.navButton}
            onClick={() => setActiveSection("workers")}
          >
            👥 {t.workersMenu}
            {createdWorkers.length > 0 && (
              <span style={styles.workerCount}>{createdWorkers.length}</span>
            )}
          </button>
          <small style={styles.sidebarHint}>{t.workersMenuHint}</small>
        </aside>

        <main style={styles.container}>
        <section style={styles.welcomeCard}>
          <div>
            <p style={styles.welcomeEyebrow}>{t.title}</p>
            <h1 style={styles.welcomeTitle}>{t.welcomeTitle}</h1>
            <p style={styles.welcomeDescription}>{t.welcomeDescription}</p>
          </div>
          <span style={styles.welcomeMark} aria-hidden="true">🌱</span>
        </section>

        <section style={styles.statsGrid} aria-label={t.title}>
          {[
            {
              label: t.availableJobsStat,
              value: jobs.length,
              hint: t.searchJobsHint,
              color: "#2563eb",
              icon: "⌕"
            },
            {
              label: t.applicationsStat,
              value: applications.length,
              hint: t.applicationsTitle,
              color: "#b45309",
              icon: "▤"
            },
            {
              label: t.acceptedStat,
              value: acceptedApplications,
              hint: t.acceptedStatus,
              color: "#15803d",
              icon: "✓"
            },
            {
              label: t.rejectedStat,
              value: rejectedApplications,
              hint: t.rejectedStatus,
              color: "#b91c1c",
              icon: "×"
            }
          ].map((stat) => (
            <article key={stat.label} style={styles.statCard}>
              <span style={{ ...styles.statIcon, color: stat.color }}>{stat.icon}</span>
              <div style={styles.statContent}>
                <span style={styles.statLabel}>{stat.label}</span>
                <strong style={{ ...styles.statValue, color: stat.color }}>{stat.value}</strong>
                <small style={styles.statHint}>{stat.hint}</small>
              </div>
            </article>
          ))}
        </section>

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
              <Notification
                key={`${notification.farmer_phone || "farmer"}-${index}`}
                title={t.hireNotification}
                message={translate(notification.message)}
              >
                {notification.farmer_phone && (
                  <a
                    href={`tel:${notification.farmer_phone}`}
                    style={styles.contactLink}
                  >
                    {t.callFarmer}
                  </a>
                )}
              </Notification>
            ))}
          </section>
        )}

        {activeSection === "add-worker" && (
          <>
            <p style={styles.instructions}>{t.addedWorkersHint}</p>
            <WorkerProfile
              createWorker
              onWorkerCreated={handleWorkerCreated}
            />
          </>
        )}

        {activeSection === "register-worker" && (
          <>
            <p role="status" style={styles.gpsFeedback}>
              {t.profileRequired}
            </p>
            <WorkerProfile onProfileSaved={handleProfileSaved} />
          </>
        )}

        {activeSection === "workers" && (
          <section style={styles.workerList}>
            <h2 style={styles.sectionTitle}>{t.addedWorkersTitle}</h2>
            <p style={styles.instructions}>{t.addedWorkersHint}</p>
            {createdWorkers.length === 0 ? (
              <div style={styles.emptyState}>{t.noWorkersAdded}</div>
            ) : (
              <div style={styles.grid}>
                {createdWorkers.map((worker) => (
                  <article key={worker.mobile} style={styles.jobCard}>
                    <h3>{worker.name}</h3>
                    <p style={styles.detailText}>📞 {worker.mobile}</p>
                    {worker.village && (
                      <p style={styles.detailText}>📍 {worker.village}</p>
                    )}
                    {worker.experience_years !== undefined && (
                      <p style={styles.detailText}>
                        {worker.experience_years} {language === "te" ? "సంవత్సరాల అనుభవం" : "years experience"}
                      </p>
                    )}
                    {worker.expected_daily_wage && (
                      <p style={styles.detailText}>
                        ₹{worker.expected_daily_wage} / {t.perDay}
                      </p>
                    )}
                    <div style={styles.workerSkills}>
                      {(worker.skills || []).map((skill) => (
                        <span key={skill}>{translate(skill)}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === "accept-work" && (
          <>
        {/* GPS Scanner */}
        <div style={styles.actionCard}>
          <button
            onClick={handleFetchNearbyJobs}
            disabled={loadingJobs}
            style={styles.gpsButton}
          >
            {loadingJobs ? t.tracking : t.gpsBtn}
          </button>

          <p style={styles.instructions}>
            {t.scanPrompt}
          </p>

          {gpsStatus && (
            <p style={styles.gpsFeedback}>
              {gpsStatus}
            </p>
          )}
        </div>

        {jobs.length === 0 ? (
          hasSearchedJobs && (
            <div style={styles.emptyState} role="status">
              {t.noJobs}
            </div>
          )
        ) : (
          <div style={styles.grid}>
            {jobs.map((job) => {
              const application = applications.find(
                (item) => String(item.job_id) === String(job.id)
              );
              const isApplying =
                String(applyingJobId) === String(job.id);

              return (
                <JobCard
                  key={job.id}
                  job={job}
                  onAccept={handleApplyForJob}
                  isAccepting={isApplying || Boolean(application)}
                  labels={{
                    crop: t.crop,
                    skill: t.skill,
                    wage: t.wage,
                    distance: t.distance,
                    workLocation: t.workLocation,
                    workDate: t.workDate,
                    farmer: t.farmer,
                    description: t.description,
                    perDay: t.perDay,
                    details: language === "te" ? "పని వివరాలు" : "Job details",
                    accept: application
                      ? statusLabel(application.status, t)
                      : t.applyBtn,
                    accepting: isApplying
                      ? t.applyingBtn
                      : statusLabel(application?.status, t)
                  }}
                />
              );
            })}
          </div>
        )}

          </>
        )}

        {(activeSection === "accept-work" || activeSection === "applications") && (
        <section style={styles.applicationList}>
          <h3 style={styles.sectionTitle}>{t.applicationsTitle}</h3>
          {loadingApplications ? (
            <p role="status">{t.applicationsLoading}</p>
          ) : applicationsLoadError ? (
            <p role="alert">{applicationsLoadError}</p>
          ) : applications.length === 0 ? (
            <p style={styles.detailText}>{t.noApplications}</p>
          ) : (
            <div style={styles.grid}>
              {applications.map((application) => {
                const status = String(application.status || "pending").toLowerCase();
                const isAccepted = status === "accepted";
                const isCompleting =
                  String(completingApplicationId) ===
                  String(application.application_id);
                return (
                  <article
                    key={application.application_id || application.job_id}
                    style={styles.jobCard}
                  >
                    <h4>{application.title || application.job_title || application.crop_type}</h4>
                    <p style={styles.detailText}>
                      {translate(application.required_skill || "")}
                    </p>
                    {application.location_name && (
                      <p style={styles.detailText}>
                        📍 {t.workLocation} {application.location_name}
                      </p>
                    )}
                    {application.start_date && (
                      <p style={styles.detailText}>
                        📅 {t.workDate} {String(application.start_date).slice(0, 10)}
                      </p>
                    )}
                    {application.farmer_name && (
                      <p style={styles.detailText}>
                        {t.farmer} {application.farmer_name}
                      </p>
                    )}
                    <p style={styles.applicationStatus}>
                      {statusLabel(status, t)}
                    </p>
                    <p style={styles.detailText}>
                      {status === "pending"
                        ? t.guideDecision
                        : status === "accepted"
                          ? t.acceptedStatusHelp
                          : status === "rejected"
                            ? t.rejectedStatusHelp
                            : t.completedStatusHelp}
                    </p>
                    {isAccepted && (
                      <>
                        {application.farmer_phone && (
                          <a href={`tel:${application.farmer_phone}`}>
                            {t.callFarmer}: {application.farmer_phone}
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCompleteJob(application)}
                          disabled={isCompleting}
                          style={styles.acceptButton}
                        >
                          {isCompleting ? t.completingBtn : t.completeBtn}
                        </button>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
        )}

        </main>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f5f7f5",
    color: "#172b23"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
    padding: "14px clamp(18px, 4vw, 56px)",
    color: "#14532d",
    borderBottom: "1px solid #e4ebe5",
    boxShadow: "0 2px 8px rgba(20,83,45,0.05)"
  },

  logo: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "750",
    letterSpacing: "-0.5px"
  },

  logoutBtn: {
    padding: "8px 16px",
    background: "#f0f7f1",
    color: "#14532d",
    border: "1px solid #d6e7d8",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
  },

  container: {
    flex: "1 1 700px",
    minWidth: 0,
    maxWidth: "1100px",
    margin: "24px auto",
    padding: "0 0 24px"
  },
  dashboardLayout: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: "20px",
    maxWidth: "1480px",
    margin: "0 auto",
    padding: "0 clamp(14px, 2vw, 28px)"
  },
  sidebar: {
    flex: "0 1 220px",
    marginTop: "12px",
    padding: "18px 14px",
    borderRadius: "12px",
    background: "linear-gradient(165deg, #14532d 0%, #064e3b 100%)",
    boxShadow: "0 8px 24px rgba(6,78,59,0.16)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignSelf: "flex-start"
  },
  sidebarBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#ffffff",
    padding: "8px 8px 18px",
    marginBottom: "6px",
    borderBottom: "1px solid rgba(255,255,255,0.2)"
  },
  sidebarAvatar: {
    width: "38px",
    height: "38px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.16)",
    fontSize: "20px"
  },
  navButton: {
    padding: "12px 10px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "8px",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: "600",
    color: "#ecfdf5",
    fontSize: "14px"
  },
  navButtonActive: {
    padding: "12px 10px",
    background: "#e7f5e9",
    border: "1px solid #c4e4ca",
    borderRadius: "8px",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: "700",
    color: "#14532d",
    fontSize: "14px"
  },
  workerCount: {
    float: "right",
    minWidth: "22px",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#ffffff",
    textAlign: "center"
  },
  sidebarHint: {
    color: "#c8e3d1",
    padding: "8px 10px"
  },
  welcomeCard: {
    minHeight: "120px",
    padding: "24px 28px",
    borderRadius: "14px",
    background: "linear-gradient(110deg, #e7f4ea 0%, #f1f8f2 60%, #d9eee0 100%)",
    border: "1px solid #d9eadd",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    overflow: "hidden",
    marginBottom: "12px"
  },
  welcomeEyebrow: {
    margin: "0 0 6px",
    color: "#38704b",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },
  welcomeTitle: {
    margin: 0,
    color: "#14532d",
    fontSize: "clamp(22px, 3vw, 30px)",
    lineHeight: 1.2
  },
  welcomeDescription: {
    margin: "8px 0 0",
    color: "#365b43",
    fontSize: "15px",
    lineHeight: 1.5
  },
  welcomeMark: {
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    width: "84px",
    height: "84px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.62)",
    fontSize: "42px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginBottom: "16px"
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
    padding: "15px",
    borderRadius: "12px",
    background: "#ffffff",
    border: "1px solid #e5ece6",
    boxShadow: "0 3px 12px rgba(20,83,45,0.04)"
  },
  statIcon: {
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#f0f7f1",
    fontSize: "23px",
    fontWeight: "700"
  },
  statContent: {
    minWidth: 0,
    display: "grid",
    gap: "2px"
  },
  statLabel: {
    color: "#475569",
    fontSize: "12px",
    fontWeight: "600"
  },
  statValue: {
    fontSize: "22px",
    lineHeight: 1.1
  },
  statHint: {
    overflow: "hidden",
    color: "#64748b",
    fontSize: "11px",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  workerList: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
  },
  workerSkills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  },

  actionCard: {
    background: "white",
    padding: "18px 20px",
    borderRadius: "12px",
    border: "1px solid #e5ece6",
    boxShadow: "0 2px 10px rgba(20,83,45,0.04)",
    textAlign: "left",
    marginBottom: "18px"
  },
  instructions: {
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: 1.6,
    margin: "12px 0 0"
  },
  guideCard: {
    background: "#f0f7f1",
    border: "1px solid #d8e9da",
    padding: "18px 20px",
    borderRadius: "12px",
    marginBottom: "20px"
  },
  guideList: {
    display: "grid",
    gap: "10px",
    paddingLeft: "24px",
    margin: 0,
    color: "#365b43",
    lineHeight: 1.6
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
    padding: "12px 20px",
    backgroundColor: "#166534",
    color: "white",
    border: "none",
    borderRadius: "8px",
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
    fontSize: "19px",
    color: "#14532d",
    fontWeight: "700",
    marginBottom: "20px"
  },
  applicationList: {
    background: "#ffffff",
    padding: "20px",
    margin: "18px 0",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
  },
  applicationStatus: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "14px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: "700"
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