
import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const translations = {
  en: {
    appName: "Harvest Hub",
    tagline: "Connecting Farmers and Workers",
    chooseLanguage: "Choose Your Language",
    welcome: "Welcome to Harvest Hub",
    description:
      "A simple platform to connect farmers with nearby agricultural workers.",
    continue: "Continue",
    farmer: "Farmer",
    worker: "Worker",
    farmerLogin: "Farmer login",
    workerLogin: "Worker login",
    loginOptions: "Login options",
    fieldWork: "Agricultural work",
    workKicker: "FIELD WORK",
    workHeading: "Skills for the growing season",
    workSeeding: "Seeding",
    workSeedingAlt: "A farmer tending young crops in a green field",
    workHarvesting: "Harvesting",
    workHarvestingAlt: "Golden crops ready for harvest",
    workPruning: "Pruning",
    workPruningAlt: "Rows of crops growing in a farm field",
    workTractor: "Tractor driving",
    workTractorAlt: "Tractor working across a cultivated field",
    language: "Language",
    settings: "Settings",
    dashboard: "Dashboard",
    selectRole: "How would you like to continue?",
  },

  te: {
    appName: "హార్వెస్ట్ హబ్",
    tagline: "రైతులు మరియు కూలీల అనుసంధానం",
    chooseLanguage: "మీ భాషను ఎంచుకోండి",
    welcome: "హార్వెస్ట్ హబ్‌కు స్వాగతం",
    description:
      "రైతులను దగ్గరలోని వ్యవసాయ కూలీలతో అనుసంధానించే సులభమైన వేదిక.",
    continue: "కొనసాగించండి",
    farmer: "రైతు",
    worker: "కూలీ",
    farmerLogin: "రైతు లాగిన్",
    workerLogin: "కార్మికుల లాగిన్",
    loginOptions: "లాగిన్ ఎంపికలు",
    fieldWork: "వ్యవసాయ పనులు",
    workKicker: "వ్యవసాయ పనులు",
    workHeading: "పంట కాలంలోని పనులు",
    workSeeding: "విత్తనాలు వేయడం",
    workSeedingAlt: "పచ్చని పొలంలో పంటలను చూసుకుంటున్న రైతు",
    workHarvesting: "పంట కోత",
    workHarvestingAlt: "కోతకు సిద్ధంగా ఉన్న బంగారు పంట",
    workPruning: "కొమ్మల కత్తిరింపు",
    workPruningAlt: "వ్యవసాయ పొలంలో పెరుగుతున్న పంట వరుసలు",
    workTractor: "ట్రాక్టర్ నడపడం",
    workTractorAlt: "సాగు చేసిన పొలంలో పనిచేస్తున్న ట్రాక్టర్",
    language: "భాష",
    settings: "సెట్టింగ్స్",
    dashboard: "డ్యాష్‌బోర్డ్",
    selectRole: "మీరు ఎలా కొనసాగాలనుకుంటున్నారు?",
  },
};


export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("harvest-language") || "en";
  });

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("harvest-language", newLanguage);
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}