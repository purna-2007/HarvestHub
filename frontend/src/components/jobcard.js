import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Languagecontext";
import MatchScore from "./Matchscore";

function JobCard({ job, onAccept, isAccepting = false, labels = {} }) {
  const navigate = useNavigate();
  const { translate = (text) => text } = useLanguage();
  const wage = job.final_wage ?? job.daily_wage;
  const distance = Number(job.distance_km);

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #e2ebe3",
        borderRadius: 12,
        padding: 18,
        boxShadow: "0 4px 15px rgba(20,83,45,0.05)"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap"
        }}
      >
        <strong>
          🌱 {labels.crop || "Crop:"} {translate(job.crop_type || "Farm work")}
        </strong>
        {job.match_score !== undefined && job.match_score !== null && (
          <MatchScore
            score={job.match_score}
            label={labels.matchScore || "Match score"}
          />
        )}
      </div>

      <div style={{ margin: "14px 0", lineHeight: 1.8 }}>
        {job.title && <p style={{ margin: 0 }}>{translate(job.title)}</p>}
        <p style={{ margin: 0 }}>
          💼 <strong>{labels.skill || "Required skill:"}</strong>{" "}
          {translate(job.required_skill || "Not specified")}
        </p>
        <p style={{ margin: 0 }}>
          💰 <strong>{labels.wage || "Daily wage:"}</strong>{" "}
          {wage == null ? "—" : `₹${wage}`}{" "}
          {labels.perDay || "per day"}
        </p>
        {job.farmer_name && (
          <p style={{ margin: 0 }}>
            🧑‍🌾 <strong>{labels.farmer || "Farmer:"}</strong>{" "}
            {job.farmer_name}
          </p>
        )}
        {job.location_name && (
          <p style={{ margin: 0 }}>
            📌 <strong>{labels.workLocation || "Work location:"}</strong>{" "}
            {job.location_name}
          </p>
        )}
        {job.start_date && (
          <p style={{ margin: 0 }}>
            📅 <strong>{labels.workDate || "Work date:"}</strong>{" "}
            {String(job.start_date).slice(0, 10)}
          </p>
        )}
        {job.description && (
          <p style={{ margin: 0 }}>
            <strong>{labels.description || "Work details:"}</strong>{" "}
            {job.description}
          </p>
        )}
        {Number.isFinite(distance) && (
          <p style={{ margin: 0 }}>
            📍 <strong>{labels.distance || "Distance:"}</strong>{" "}
            {distance.toFixed(1)} km
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() =>
            navigate(`/jobs/${encodeURIComponent(job.id)}`, {
              state: { job }
            })
          }
          style={{
            padding: "10px 14px",
            border: "1px solid #166534",
            borderRadius: 6,
            color: "#166534",
            background: "#ffffff",
            cursor: "pointer"
          }}
        >
          {labels.details || "Job details"}
        </button>
        <button
          type="button"
          onClick={() => onAccept(job)}
          disabled={isAccepting || typeof onAccept !== "function"}
          style={{
            flex: 1,
            minWidth: 150,
            padding: "10px 14px",
            border: 0,
            borderRadius: 6,
            color: "#ffffff",
            background: "#166534",
            cursor: isAccepting ? "wait" : "pointer",
            opacity: isAccepting ? 0.65 : 1
          }}
        >
          {isAccepting
            ? labels.accepting || "Accepting..."
            : labels.accept || "Accept job"}
        </button>
      </div>
    </article>
  );
}

export default JobCard;