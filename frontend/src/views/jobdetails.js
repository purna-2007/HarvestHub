import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../Languagecontext";
import BackButton from "../components/BackButton";
import Map from "../components/map";
import { apiRequest } from "../services/api";
import { getUserCurrentLocation } from "../utils/geolocation";

function JobDetails() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { translate = (text) => text } = useLanguage();
  const [job, setJob] = useState(location.state?.job || null);
  const [loading, setLoading] = useState(!location.state?.job);
  const [error, setError] = useState("");

  useEffect(() => {
    if (job) return undefined;
    let cancelled = false;

    const loadJob = async () => {
      try {
        const coordinates = await getUserCurrentLocation();
        const response = await apiRequest(
          `/jobs/feed?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`
        );
        const foundJob = response.jobs?.find(
          (item) => String(item.id) === String(jobId)
        );
        if (!foundJob) {
          throw new Error(translate("This job is no longer available."));
        }
        if (!cancelled) setJob(foundJob);
      } catch (loadError) {
        console.error("Could not load job details:", loadError);
        if (!cancelled) {
          setError(loadError.message || translate("Could not load job details."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadJob();
    return () => {
      cancelled = true;
    };
  }, [job, jobId, translate]);

  const coordinateValue = (value) =>
    value === null || value === undefined || value === "" ? undefined : value;

  return (
    <main style={{ minHeight: "100vh", background: "#f3f7f2", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <BackButton />
        {loading && <p role="status">{translate("Loading job details...")}</p>}
        {error && <p role="alert">{error}</p>}
        {job && (
          <article
            style={{
              marginTop: 18,
              padding: 24,
              background: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
            }}
          >
            <h1>{translate(job.title || job.crop_type || "Job details")}</h1>
            <p><strong>{translate("Crop")}:</strong> {translate(job.crop_type || "Not specified")}</p>
            <p><strong>{translate("Required skill")}:</strong> {translate(job.required_skill || "Not specified")}</p>
            <p><strong>{translate("Description")}:</strong> {translate(job.description || "No additional details.")}</p>
            <p>
              <strong>{translate("Daily Wage")}:</strong>{" "}
              ₹{job.final_wage ?? job.daily_wage ?? "—"}
            </p>
            <p><strong>{translate("Workers needed")}:</strong> {job.workers_needed ?? "—"}</p>
            <p><strong>{translate("Work Date")}:</strong> {job.start_date || translate("Not specified")}</p>
            <p><strong>{translate("Work Location")}:</strong> {job.location_name || translate("Not specified")}</p>
            {job.farmer_phone && (
              <p>
                <a href={`tel:${job.farmer_phone}`}>
                  {translate("Contact farmer")} ({job.farmer_phone})
                </a>
              </p>
            )}
            <Map
              latitude={coordinateValue(job.latitude)}
              longitude={coordinateValue(job.longitude)}
              label={translate("Job location")}
            />
            <button
              type="button"
              onClick={() => navigate("/worker/dashboard")}
              style={{ marginTop: 18 }}
            >
              {translate("Back to available jobs")}
            </button>
          </article>
        )}
      </div>
    </main>
  );
}

export default JobDetails;