import React, { useState } from "react";
import { startVoiceRecognition } from "../utils/voiceRecognition";

function JobForm({
  crop,
  acres,
  workType,
  workDate,
  location,
  wage,
  cropData,
  selectedCrop,
  workersRequired,
  onCropChange,
  onAcresChange,
  onWorkTypeChange,
  onWorkDateChange,
  onLocationChange,
  onWageChange,
  onSubmit,
  onClear,
  translate = (text) => text
}) {
  const [voiceStatus, setVoiceStatus] = useState("");

  const handleVoiceInput = () => {
    setVoiceStatus("");
    try {
      startVoiceRecognition({
        language: localStorage.getItem("harvesthub_language") === "te"
          ? "te-IN"
          : "en-IN",
        onResult: (transcript) => {
          onLocationChange(`${location}${location ? " " : ""}${transcript}`);
        },
        onError: (error) => setVoiceStatus(error.message),
        onEnd: () => setVoiceStatus("")
      });
      setVoiceStatus(translate("Listening..."));
    } catch (error) {
      console.error("Voice input could not start:", error);
      setVoiceStatus(translate(error.message));
    }
  };

  return (
    <section className="dashboard-card">
      <div className="card-heading">
        <div>
          <h2>{translate("Find Agricultural Workers")}</h2>
          <p>{translate("Enter your farm details to find suitable workers.")}</p>
        </div>
        <div className="heading-icon">👥</div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-section-title">
          {translate("🌱 Farm Information")}
        </div>
        <div className="form-grid">
          <div className="dashboard-field">
            <label>{translate("Crop Type")} <span>*</span></label>
            <select value={crop} onChange={onCropChange} required>
              <option value="">{translate("Select crop")}</option>
              {Object.entries(cropData).map(([key, item]) => (
                <option value={key} key={key}>
                  {item.icon} {translate(item.name)}
                </option>
              ))}
            </select>
          </div>
          <div className="dashboard-field">
            <label>{translate("Land Area")} <span>*</span></label>
            <div className="input-with-unit">
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder={translate("Enter acres")}
                value={acres}
                onChange={(event) => onAcresChange(event.target.value)}
                required
              />
              <span>{translate("Acres")}</span>
            </div>
          </div>
        </div>

        <div className="worker-calculation">
          <div className="calculation-icon">👥</div>
          <div className="calculation-text">
            <span>{translate("Estimated workers required")}</span>
            <strong>{workersRequired || "--"}</strong>
            <small>
              {selectedCrop
                ? `${selectedCrop.workersPerAcre} ${translate("workers per acre for")} ${translate(selectedCrop.name)}`
                : translate("Select crop and land area")}
            </small>
          </div>
          {workersRequired > 0 && (
            <div className="calculation-success">{translate("✓ Calculated")}</div>
          )}
        </div>

        <div className="form-section-title">{translate("🧑‍🌾 Work Details")}</div>
        <div className="form-grid">
          <div className="dashboard-field">
            <label>{translate("Work Type")} <span>*</span></label>
            <select
              value={workType}
              onChange={(event) => onWorkTypeChange(event.target.value)}
              disabled={!selectedCrop}
              required
            >
              <option value="">{translate("Select work type")}</option>
              {selectedCrop?.workTypes.map((type) => (
                <option key={type} value={type}>{translate(type)}</option>
              ))}
            </select>
          </div>
          <div className="dashboard-field">
            <label>{translate("Work Date")} <span>*</span></label>
            <input
              type="date"
              value={workDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(event) => onWorkDateChange(event.target.value)}
              required
            />
          </div>
          <div className="dashboard-field full-width">
            <label>{translate("Work Location")} <span>*</span></label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder={translate("Enter village / area")}
                value={location}
                onChange={(event) => onLocationChange(event.target.value)}
                required
              />
              <button type="button" onClick={handleVoiceInput}>
                {translate("🎙️ Speak")}
              </button>
            </div>
            {voiceStatus && <small role="status">{voiceStatus}</small>}
          </div>
          <div className="dashboard-field">
            <label>{translate("Daily Wage")}</label>
            <div className="input-with-unit">
              <span className="currency">₹</span>
              <input
                type="number"
                min="0"
                placeholder={translate("e.g. 500")}
                value={wage}
                onChange={(event) => onWageChange(event.target.value)}
              />
              <span>{translate("per day")}</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClear}
          >
            {translate("Clear")}
          </button>
          <button type="submit" className="primary-button">
            {translate("🔎 Find Workers")}
          </button>
        </div>
      </form>
    </section>
  );
}

export default JobForm;