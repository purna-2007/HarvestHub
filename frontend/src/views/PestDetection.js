import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Languagecontext";
import { analyzeDiseaseImage, saveDiseasePrediction } from "../services/pestService";

function PestDetection() {
  const navigate = useNavigate();
  const { translate = (text) => text } = useLanguage();
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleImageChange = (event) => {
    const selectedImage = event.target.files?.[0] || null;
    setAnalysis(null);
    setError("");

    if (selectedImage && selectedImage.size > 10 * 1024 * 1024) {
      setImage(null);
      setError(translate("Image must be 10 MB or smaller."));
      event.target.value = "";
      return;
    }

    setImage(selectedImage);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setAnalysis(null);

    if (!image) {
      setError(translate("Choose an image before analyzing."));
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeDiseaseImage(image);
      setAnalysis(result);
      try {
        saveDiseasePrediction({ imageName: image.name, analysis: result });
      } catch (saveError) {
        console.error("Could not save disease prediction history:", saveError);
        setError(translate("Analysis completed, but its history could not be saved."));
      }
    } catch (requestError) {
      console.error("Disease analysis failed:", requestError);
      setError(
        requestError.message ||
          translate("Disease analysis failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const isHealthy = analysis?.predicted_class?.endsWith("_Healthy");
  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 24,
    boxShadow: "0 8px 24px rgba(31, 41, 55, 0.08)"
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f7f2",
        padding: "32px 16px",
        color: "#1f2937"
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate("/farmer/dashboard")}
          style={{
            border: 0,
            background: "transparent",
            color: "#226538",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 16,
            padding: 0
          }}
        >
          {translate("← Farmer Dashboard")}
        </button>

        <section style={cardStyle}>
          <h1 style={{ color: "#226538", marginTop: 0 }}>
            🌿 {translate("Plant Disease Detection")}
          </h1>
          <p>{translate("Upload a clear photo of a crop leaf to check for common diseases.")}</p>
          <button
            type="button"
            onClick={() => navigate("/pest-detection/history")}
            style={{ marginBottom: 16 }}
          >
            {translate("View prediction history")}
          </button>

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="disease-image"
              style={{ display: "block", fontWeight: 600, marginBottom: 8 }}
            >
              {translate("Select a leaf image")}
            </label>
            <input
              id="disease-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={handleImageChange}
              style={{ display: "block", marginBottom: 10, maxWidth: "100%" }}
            />
            <p style={{ color: "#4b5563", fontSize: 14 }}>
              {translate("Supported formats: JPG, PNG, WebP. Maximum size: 10 MB.")}
            </p>

            {previewUrl && (
              <img
                src={previewUrl}
                alt={translate("Selected crop leaf")}
                style={{
                  display: "block",
                  maxHeight: 280,
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: 8,
                  margin: "16px 0"
                }}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#6b8f72" : "#226538",
                border: 0,
                borderRadius: 8,
                color: "#ffffff",
                cursor: loading ? "wait" : "pointer",
                fontSize: 16,
                fontWeight: 600,
                padding: "12px 20px"
              }}
            >
              {loading
                ? translate("Analyzing image...")
                : translate("Analyze image")}
            </button>
          </form>

          {error && (
            <p role="alert" style={{ color: "#b42318", marginTop: 16 }}>
              {error}
            </p>
          )}
        </section>

        {analysis && (
          <section
            aria-live="polite"
            style={{ ...cardStyle, marginTop: 24 }}
          >
            <h2 style={{ color: "#226538", marginTop: 0 }}>
              {translate("Analysis result")}
            </h2>
            <p><strong>{translate("Crop")}:</strong> {translate(analysis.crop)}</p>
            <p>
              <strong>{translate("Disease")}:</strong>{" "}
              {translate(analysis.disease)}
              {isHealthy && ` (${translate("Healthy plant")})`}
            </p>
            <p>
              <strong>{translate("Confidence")}:</strong>{" "}
              {Number(analysis.confidence).toFixed(2)}%
            </p>
            <p><strong>{translate("Symptoms")}:</strong> {translate(analysis.symptoms)}</p>
            <p>
              <strong>{translate("Prevention and management")}:</strong>{" "}
              {translate(analysis.precautions)}
            </p>
            <p>
              <strong>{translate("Treatment guidance")}:</strong>{" "}
              {translate(analysis.treatment_pesticide_information)}
            </p>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 0 }}>
              {translate("AI predictions are for guidance only. Confirm the diagnosis with a local agricultural expert before treatment.")}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

export default PestDetection;