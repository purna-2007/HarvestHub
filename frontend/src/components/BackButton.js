
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Languagecontext";

function BackButton() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const label = language === "te" ? "వెనక్కి" : "Back";

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "6px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        background: "#ffffff",
        color: "#374151",
        fontSize: "13px",
        cursor: "pointer",
      }}
    >
      ← {label}
    </button>
  );
}

export default BackButton;