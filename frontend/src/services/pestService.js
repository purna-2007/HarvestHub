import { apiRequest } from "./api";

const HISTORY_KEY_PREFIX = "harvesthub_disease_history:";

const getHistoryKey = () =>
  `${HISTORY_KEY_PREFIX}${localStorage.getItem("harvesthub_phone") || "local"}`;

export const analyzeDiseaseImage = async (image) => {
  if (!(image instanceof File)) {
    throw new TypeError("Choose an image file before starting the analysis.");
  }
  if (!image.type.startsWith("image/")) {
    throw new TypeError("The selected file is not an image.");
  }

  const formData = new FormData();
  formData.append("image", image);
  const response = await apiRequest("/disease/analyze", "POST", formData);
  const analysis = response?.analysis;
  if (!analysis?.predicted_class || !analysis?.disease) {
    throw new Error("The disease service returned an incomplete analysis.");
  }
  return analysis;
};

export const getDiseaseHistory = () => {
  const saved = localStorage.getItem(getHistoryKey());
  if (!saved) return [];

  const history = JSON.parse(saved);
  if (!Array.isArray(history)) {
    throw new Error("Saved disease history is not a list.");
  }
  return history;
};

export const saveDiseasePrediction = ({ imageName, analysis }) => {
  if (!analysis?.predicted_class || !analysis?.disease) {
    throw new TypeError("A complete disease analysis is required.");
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    imageName: imageName || "Crop image",
    analysis,
    createdAt: new Date().toISOString()
  };
  const nextHistory = [entry, ...getDiseaseHistory()].slice(0, 50);
  localStorage.setItem(getHistoryKey(), JSON.stringify(nextHistory));
  return entry;
};