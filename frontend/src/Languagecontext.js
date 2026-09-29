
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
    language: "భాష",
    settings: "సెట్టింగ్స్",
    dashboard: "డ్యాష్‌బోర్డ్",
    selectRole: "మీరు ఎలా కొనసాగాలనుకుంటున్నారు?",
  },
};


export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("harvest-language") || null;
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