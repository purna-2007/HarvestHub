import React from "react";

function MatchScore({ score, label = "Match score" }) {
  const numericScore = Number(score);
  const validScore = Number.isFinite(numericScore)
    ? Math.min(100, Math.max(0, numericScore))
    : null;
  const color =
    validScore === null
      ? "#6b7280"
      : validScore >= 85
        ? "#065f46"
        : validScore >= 60
          ? "#92400e"
          : "#991b1b";
  const background =
    validScore === null
      ? "#f3f4f6"
      : validScore >= 85
        ? "#d1fae5"
        : validScore >= 60
          ? "#fef3c7"
          : "#fee2e2";

  return (
    <span
      aria-label={
        validScore === null ? `${label}: unavailable` : `${label}: ${validScore}%`
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 9px",
        borderRadius: 16,
        backgroundColor: background,
        color,
        fontSize: 13,
        fontWeight: 600
      }}
    >
      {label} <strong>{validScore === null ? "—" : `${validScore}%`}</strong>
    </span>
  );
}

export default MatchScore;