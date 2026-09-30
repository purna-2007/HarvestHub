import React, { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    home: "Home",
    farmerLogin: "Farmer Login",
    workerLogin: "Worker Login",
    farmer: "Farmer",
    worker: "Worker",

    heroTitle: "Welcome to HarvestHub",
    heroSubtitle:
      "Connecting farmers and agricultural workers for a better harvest.",

    exploreWork: "Explore Agricultural Work",
    getStarted: "Get Started",

    farmerDescription:
      "Find skilled workers and manage your agricultural work easily.",

    workerDescription:
      "Find suitable agricultural jobs and connect with farmers.",

    farmerLoginTitle: "Farmer Login",
    workerLoginTitle: "Worker Login",

    phone: "Phone Number",
    password: "Password",
    login: "Login",

    enterPhone: "Enter your phone number",
    enterPassword: "Enter your password",

    noAccount: "Don't have an account?",
    register: "Register",

    selectLanguage: "Language",

    availableWork: "Available Agricultural Work",

    backHome: "Back to Home",

    loginSuccess: "Login successful",
    invalidCredentials: "Invalid phone number or password",

    footer:
      "HarvestHub - Connecting Farmers and Agricultural Workers"
  },

  te: {
    home: "హోమ్",
    farmerLogin: "రైతు లాగిన్",
    workerLogin: "కార్మికుల లాగిన్",
    farmer: "రైతు",
    worker: "కార్మికుడు",

    heroTitle: "హార్వెస్ట్‌హబ్‌కు స్వాగతం",
    heroSubtitle:
      "మెరుగైన పంట కోసం రైతులు మరియు వ్యవసాయ కార్మికులను కలుపుతుంది.",

    exploreWork: "వ్యవసాయ పనులను చూడండి",
    getStarted: "ప్రారంభించండి",

    farmerDescription:
      "నైపుణ్యం కలిగిన కార్మికులను కనుగొని వ్యవసాయ పనులను సులభంగా నిర్వహించండి.",

    workerDescription:
      "సరైన వ్యవసాయ పనులను కనుగొని రైతులతో కనెక్ట్ అవ్వండి.",

    farmerLoginTitle: "రైతు లాగిన్",
    workerLoginTitle: "కార్మికుల లాగిన్",

    phone: "ఫోన్ నంబర్",
    password: "పాస్‌వర్డ్",
    login: "లాగిన్",

    enterPhone: "మీ ఫోన్ నంబర్ నమోదు చేయండి",
    enterPassword: "మీ పాస్‌వర్డ్ నమోదు చేయండి",

    noAccount: "ఖాతా లేదా?",
    register: "రిజిస్టర్",

    selectLanguage: "భాష",

    availableWork: "అందుబాటులో ఉన్న వ్యవసాయ పనులు",

    backHome: "హోమ్‌కు తిరిగి వెళ్ళండి",

    loginSuccess: "లాగిన్ విజయవంతమైంది",
    invalidCredentials: "ఫోన్ నంబర్ లేదా పాస్‌వర్డ్ తప్పు",

    footer:
      "హార్వెస్ట్‌హబ్ - రైతులు మరియు వ్యవసాయ కార్మికులను కలుపుతుంది"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("harvesthub_language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("harvesthub_language", language);
  }, [language]);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};