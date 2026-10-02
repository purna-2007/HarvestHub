
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Languagecontext";
import { apiRequest } from "../services/api";

function WorkerProfile({
  createWorker = false,
  onWorkerCreated,
  onProfileSaved
}) {
  const navigate = useNavigate();
  const { translate } = useLanguage();

  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [wage, setWage] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [mobile, setMobile] = useState(() =>
    createWorker ? "" : localStorage.getItem("harvesthub_phone") || ""
  );
  const existingMobile = localStorage.getItem("harvesthub_phone") || "";
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (createWorker || !existingMobile) return undefined;
    let cancelled = false;
    setLoadingProfile(true);

    apiRequest(`/users/worker/${encodeURIComponent(existingMobile)}`)
      .then((response) => {
        if (cancelled || !response?.profile) return;
        const profile = response.profile;
        setName(profile.name || "");
        setVillage(profile.village || "");
        setSkills(
          Array.isArray(profile.skills)
            ? profile.skills.join(", ")
            : typeof profile.skills === "string"
              ? (() => {
                  try {
                    const parsed = JSON.parse(profile.skills);
                    return Array.isArray(parsed)
                      ? parsed.join(", ")
                      : profile.skills;
                  } catch {
                    return profile.skills;
                  }
                })()
              : ""
        );
        setExperience(profile.experience_years ?? "");
        setWage(profile.expected_daily_wage ?? "");
        setLatitude(profile.latitude ?? null);
        setLongitude(profile.longitude ?? null);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Worker profile load error:", error);
          setMessage(
            error.message || translate("Could not load worker profile.")
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [createWorker, existingMobile, translate]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setMessage(translate("Your browser does not support GPS."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMessage(translate("Location captured successfully."));
      },
      () => {
        setMessage(translate("Please allow location access."));
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!mobile) {
      setMessage(translate("Please login first."));
      return;
    }

    if (latitude === null || longitude === null) {
      setMessage(translate("Please capture your location before submitting."));
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        mobile,
        name,
        role: "worker",
        village,
        skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        experience_years: Number(experience) || 0,
        expected_daily_wage: Number(wage),
        latitude,
        longitude
      };
      const result = createWorker
        ? await apiRequest("/users/register", "POST", profileData)
        : await apiRequest("/users/profile/update", "PUT", {
            ...profileData,
            current_mobile: existingMobile
          });

      if (result.success) {
        setMessage(translate("Worker profile saved successfully!"));

        if (createWorker) {
          onWorkerCreated?.({
            id: result.userId,
            mobile,
            name,
            village,
            skills: profileData.skills,
            experience_years: profileData.experience_years,
            expected_daily_wage: profileData.expected_daily_wage
          });
        } else {
          localStorage.setItem("harvesthub_user_id", mobile);
          if (onProfileSaved) {
            onProfileSaved(profileData);
          } else {
            setTimeout(() => {
              navigate("/worker/dashboard");
            }, 1000);
          }
        }
      } else {
        setMessage(result.message || translate("Could not save profile."));
      }
    } catch (error) {
  console.error("Worker profile save error:", error);

  setMessage(
    error.message || translate("Unknown error occurred. Check browser console.")
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
        <h2>
          {translate(createWorker ? "Add New Worker" : "Worker Profile")}
        </h2>
        <p className="login-subtitle">
          {translate(
            createWorker
              ? "Enter the new worker's details to add them to the dashboard."
              : "Enter your details to find nearby agricultural jobs."
          )}
        </p>

        {loadingProfile && (
          <p role="status">{translate("Loading worker profile...")}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{translate("Full Name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={translate("Enter your name")}
              required
            />
          </div>

          <div className="form-group">
            <label>{translate("Mobile Number")}</label>
            <input
  type="tel"
  value={mobile}
  onChange={(e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) setMobile(value);
  }}
  placeholder={translate("Enter mobile number")}
  inputMode="numeric"
  pattern="[6-9][0-9]{9}"
  maxLength={10}
  readOnly={!createWorker}
  required
/>
          </div>

          <div className="form-group">
            <label>{translate("Village")}</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder={translate("Enter your village")}
              required
            />
          </div>

          <div className="form-group">
            <label>{translate("Skills (comma separated)")}</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder={translate("Harvesting, Sowing, Tractor Driving")}
              required
            />
          </div>

          <div className="form-group">
            <label>{translate("Experience (years)")}</label>
            <input
              type="number"
              min="0"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder={translate("Enter experience")}
            />
          </div>

          <div className="form-group">
            <label>{translate("Expected Daily Wage (₹)")}</label>
            <input
              type="number"
              min="1"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              placeholder={translate("Enter expected wage")}
              required
            />
          </div>

          <button type="button" onClick={getLocation}>
            {translate("📍 Capture My Location")}
          </button>

          <p>{message}</p>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? translate("Saving...")
              : translate(createWorker ? "Add Worker" : "Save Worker Profile")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default WorkerProfile;