import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Languagecontext";
import BackButton from "../components/BackButton";
import { getDiseaseHistory } from "../services/pestService";

function PredictionHistory() {
  const navigate = useNavigate();
  const { translate = (text) => text } = useLanguage();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setHistory(getDiseaseHistory());
    } catch (loadError) {
      console.error("Could not load disease prediction history:", loadError);
      setError(translate("Saved prediction history could not be loaded."));
    }
  }, [translate]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f7f2",
        padding: "28px 16px",
        color: "#1f2937"
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <BackButton />
        <h1 style={{ color: "#226538" }}>
          {translate("Disease prediction history")}
        </h1>
        {error && <p role="alert">{error}</p>}
        {!error && history.length === 0 && (
          <p role="status">{translate("No disease predictions saved yet.")}</p>
        )}
        <div style={{ display: "grid", gap: 14 }}>
          {history.map(({ id, imageName, analysis, createdAt }) => (
            <article
              key={id}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 18
              }}
            >
              <h2 style={{ marginTop: 0 }}>{translate(analysis.crop || "Crop")}</h2>
              <p><strong>{translate("Image")}:</strong> {imageName}</p>
              <p><strong>{translate("Disease")}:</strong> {translate(analysis.disease)}</p>
              <p>
                <strong>{translate("Confidence")}:</strong>{" "}
                {Number(analysis.confidence).toFixed(2)}%
              </p>
              <time dateTime={createdAt}>
                {new Date(createdAt).toLocaleString()}
              </time>
            </article>
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate("/pest-detection")}
          style={{ marginTop: 20 }}
        >
          {translate("Analyze another image")}
        </button>
      </div>
    </main>
  );
}

export default PredictionHistory;