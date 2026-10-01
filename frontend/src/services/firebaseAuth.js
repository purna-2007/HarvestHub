
import { getApp, getApps, initializeApp } from "firebase/app";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

// Firebase Auth instance
let firebaseAuth = null;

// reCAPTCHA instance
let recaptchaVerifier = null;

// Firebase configuration and initialization
function getFirebaseAuth() {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
      process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };

  // Check missing Firebase settings
  const missingSettings = Object.entries(config)
    .filter(([, value]) => {
      if (!value) return true;
      const normalized = String(value).trim();
      return /^YOUR_|^your_|^REPLACE_|^replace_|^PASTE_/.test(normalized);
    })
    .map(([key]) => key);

  if (missingSettings.length > 0) {
    throw new Error(
      `Firebase configuration missing: ${missingSettings.join(", ")}. Check frontend/.env and restart the server.`
    );
  }

  // Use a dedicated Firebase app to avoid conflicts
  // with other Firebase initialization in the project.
  const appName = "harvesthub-phone-auth";

  const existingApp = getApps().find(
    (app) => app.name === appName
  );

  const app =
    existingApp || initializeApp(config, appName);

  // Verify Firebase project
  if (app.options.projectId !== config.projectId) {
    throw new Error(
      `Firebase project mismatch. Expected: ${config.projectId}, Found: ${app.options.projectId}`
    );
  }

  firebaseAuth = getAuth(app);

  return firebaseAuth;
}

// Create invisible reCAPTCHA verifier
export function createPhoneRecaptcha(container) {
  const auth = getFirebaseAuth();

  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }

  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    container,
    {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA verification successful");
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired. Please try again.");
      },
    }
  );

  return recaptchaVerifier;
}

// Send OTP to mobile number
export function sendPhoneVerificationCode(
  phoneNumber,
  verifier
) {
  const auth = getFirebaseAuth();

  if (!phoneNumber) {
    throw new Error("Please enter a valid mobile number.");
  }

  if (!verifier) {
    throw new Error("reCAPTCHA verification is required.");
  }

  return signInWithPhoneNumber(
    auth,
    phoneNumber,
    verifier
  );
}

// Confirm OTP
export function confirmPhoneVerification(
  confirmation,
  code
) {
  if (!confirmation) {
    throw new Error("OTP confirmation session is missing.");
  }

  if (!code || code.length !== 6) {
    throw new Error("Please enter a valid 6-digit OTP.");
  }

  return confirmation.confirm(code);
}

// Reset reCAPTCHA
export function resetPhoneRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}