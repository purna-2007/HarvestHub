import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LanguageProvider } from "./Languagecontext";

import Home from "./views/Home";
import Login from "./views/Login";
import FarmerDashboard from "./views/FarmerDashboard";
import WorkerDashboard from "./views/WorkerDashboard";
import Workerprofile from "./views/Workerprofile";
import PestDetection from "./views/PestDetection";
import JobDetails from "./views/jobdetails";
import PredictionHistory from "./views/PredictionHistory";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Farmer Login */}
          <Route
            path="/farmer/login"
            element={<Login role="farmer" />}
          />

          {/* Worker Login */}
          <Route
            path="/worker/login"
            element={<Login role="worker" />}
          />

          {/* Farmer Dashboard */}
          <Route
            path="/farmer/dashboard"
            element={<FarmerDashboard />}
          />

          {/* Worker Dashboard */}
          <Route
            path="/worker/dashboard"
            element={<WorkerDashboard />}
          />
          <Route
            path="/worker/profile"
            element={<Workerprofile />}
          />
          <Route
            path="/pest-detection"
            element={<PestDetection />}
          />
          <Route
            path="/jobs/:jobId"
            element={<JobDetails />}
          />
          <Route
            path="/pest-detection/history"
            element={<PredictionHistory />}
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;