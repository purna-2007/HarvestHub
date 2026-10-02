import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import WorkerDashboard from "./WorkerDashboard";
import socket from "../services/socket";
import { apiRequest } from "../services/api";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));
let mockLanguage = "te";
const mockTranslate = (text) => text;
jest.mock("../Languagecontext", () => ({
  useLanguage: () => ({ language: mockLanguage, translate: mockTranslate }),
}));
jest.mock("../services/socket", () => ({
  __esModule: true,
  default: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
}));
jest.mock("../services/api", () => ({
  apiRequest: jest.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  mockLanguage = "te";
  jest.clearAllMocks();
  apiRequest.mockResolvedValue({ success: true, applications: [] });
});

test("registers the worker and displays incoming Telugu hire notifications", () => {
  localStorage.setItem("harvesthub_role", "worker");
  localStorage.setItem("harvesthub_phone", "9876543211");
  let receiveHireNotification;
  socket.on.mockImplementation((eventName, callback) => {
    if (eventName === "worker_hired") receiveHireNotification = callback;
  });

  const { unmount } = render(<WorkerDashboard />);

  expect(socket.emit).toHaveBeenCalledWith("register_worker", {
    phone: "9876543211",
  });
  act(() => {
    receiveHireNotification({
      message:
        "రైతు Wheat పంటలో Pruning పని కోసం మిమ్మల్ని ఎంపిక చేశారు. దయచేసి రైతును ఈ మొబైల్ నంబర్‌లో సంప్రదించండి: 9876500000",
      farmer_phone: "9876500000",
    });
  });

  expect(
    screen.getByText(/రైతు Wheat పంటలో Pruning పని కోసం/)
  ).toBeTruthy();
  expect(screen.getByText(/9876500000/)).toBeTruthy();
  expect(screen.getByRole("link", { name: "రైతుకు కాల్ చేయండి" }).getAttribute("href"))
    .toBe("tel:9876500000");

  unmount();
  expect(socket.emit).toHaveBeenCalledWith("unregister_worker");
});

test("applies for a job, receives the farmer decision, and completes accepted work", async () => {
  localStorage.setItem("harvesthub_phone", "9876543211");
  mockLanguage = "en";
  const job = {
    id: 101,
    title: "Paddy harvesting",
    crop_type: "Paddy",
    required_skill: "Harvesting",
    daily_wage: 520,
    distance_km: 2.4,
    location_name: "Samalkot",
    start_date: "2030-01-01",
  };
  apiRequest.mockImplementation((endpoint) => {
    if (endpoint.startsWith("/jobs/worker/")) {
      return Promise.resolve({ success: true, applications: [] });
    }
    if (endpoint.startsWith("/jobs/feed")) {
      return Promise.resolve({ success: true, jobs: [job] });
    }
    if (endpoint === "/jobs/101/apply") {
      return Promise.resolve({
        success: true,
        application: {
          application_id: 501,
          job_id: 101,
          title: "Paddy work",
          status: "pending",
        },
      });
    }
    if (endpoint === "/jobs/applications/501/complete") {
      return Promise.resolve({
        success: true,
        application: { application_id: 501, job_id: 101, status: "completed" },
      });
    }
    return Promise.resolve({ success: true });
  });
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (success) =>
        success({ coords: { latitude: 16.9, longitude: 82.2, accuracy: 10 } }),
    },
  });
  let updateApplication;
  socket.on.mockImplementation((eventName, callback) => {
    if (eventName === "application_status") updateApplication = callback;
  });

  render(<WorkerDashboard />);
  await waitFor(() =>
    expect(apiRequest).toHaveBeenCalledWith(
      "/jobs/worker/9876543211/applications"
    )
  );
  fireEvent.click(
    screen.getByRole("button", { name: "📍 Find Jobs Near Me" })
  );
  await screen.findByText("Paddy harvesting");
  expect(screen.getByText(/Samalkot/)).toBeTruthy();
  expect(screen.getByText(/2030-01-01/)).toBeTruthy();
  expect(screen.getByText("Jobs found")).toBeTruthy();
  expect(screen.queryByText(/AI Match Score/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Apply for Job" }));
  await waitFor(() => {
    expect(apiRequest).toHaveBeenCalledWith("/jobs/101/apply", "POST", {
      worker_phone: "9876543211",
      agreed_wage: 520,
    });
  });
  expect(screen.getAllByText("Application pending").length).toBeGreaterThan(0);

  act(() => {
    updateApplication({
      application_id: 501,
      job_id: 101,
      farmer_phone: "9876500000",
      status: "accepted",
    });
  });
  expect(screen.getAllByText("Application accepted").length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole("button", { name: "Mark Job Complete" }));
  await waitFor(() => {
    expect(apiRequest).toHaveBeenCalledWith(
      "/jobs/applications/501/complete",
      "POST",
      { worker_phone: "9876543211" }
    );
  });
});

test("hides the how-to guide and initial jobs placeholder but reports an empty search", async () => {
  localStorage.setItem("harvesthub_phone", "9876543211");
  mockLanguage = "en";
  apiRequest.mockImplementation((endpoint) => {
    if (endpoint === "/users/worker/9876543211") {
      return Promise.resolve({ success: true, profile: { mobile: "9876543211" } });
    }
    if (endpoint.startsWith("/jobs/worker/")) {
      return Promise.resolve({ success: true, applications: [] });
    }
    if (endpoint.startsWith("/jobs/feed")) {
      return Promise.resolve({ success: true, jobs: [] });
    }
    return Promise.resolve({ success: true });
  });
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (success) =>
        success({ coords: { latitude: 16.9, longitude: 82.2, accuracy: 10 } }),
    },
  });

  render(<WorkerDashboard />);
  expect(screen.queryByText("How to find and accept work")).toBeNull();
  expect(screen.queryByText("Nearby Farm Jobs")).toBeNull();
  expect(
    screen.queryByText(/No search yet\. Select “Find Jobs Near Me”/)
  ).toBeNull();
  expect(
    screen.getByText(/Jobs appear here after a farmer posts them/)
  ).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "📍 Find Jobs Near Me" })
  );

  expect(
    await screen.findByText(
      "There are no open jobs available right now. Farmers need to post a job before it appears here. Check again later."
    )
  ).toBeTruthy();
});

test("shows apply actions from the saved profile location when GPS is unavailable", async () => {
  localStorage.setItem("harvesthub_phone", "9876543211");
  mockLanguage = "en";
  const job = {
    id: 202,
    title: "Paddy - Harvesting",
    crop_type: "Paddy",
    required_skill: "Harvesting",
    daily_wage: 500,
    location_name: "Samalkot",
    distance_km: 1.2,
  };
  apiRequest.mockImplementation((endpoint) => {
    if (endpoint === "/users/worker/9876543211") {
      return Promise.resolve({
        success: true,
        profile: {
          mobile: "9876543211",
          latitude: "16.81",
          longitude: "82.24",
        },
      });
    }
    if (endpoint.startsWith("/jobs/worker/")) {
      return Promise.resolve({ success: true, applications: [] });
    }
    if (endpoint.startsWith("/jobs/feed?")) {
      return Promise.resolve({ success: true, jobs: [job] });
    }
    if (endpoint === "/jobs/202/apply") {
      return Promise.resolve({
        success: true,
        application: { application_id: 602, job_id: 202, status: "pending" },
      });
    }
    return Promise.resolve({ success: true });
  });
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (_success, failure) =>
        failure({ code: 1, message: "Location permission was denied." }),
    },
  });

  render(<WorkerDashboard />);
  fireEvent.click(
    screen.getByRole("button", { name: "📍 Find Jobs Near Me" })
  );

  expect(await screen.findByText("Paddy - Harvesting")).toBeTruthy();
  expect(
    await screen.findByText(/showing jobs near your saved profile location/i)
  ).toBeTruthy();
  expect(apiRequest).toHaveBeenCalledWith(
    "/jobs/feed?latitude=16.81&longitude=82.24",
    "GET"
  );

  fireEvent.click(screen.getByRole("button", { name: "Apply for Job" }));
  await waitFor(() => {
    expect(apiRequest).toHaveBeenCalledWith("/jobs/202/apply", "POST", {
      worker_phone: "9876543211",
      agreed_wage: 500,
    });
  });
  expect(await screen.findAllByText("Application pending")).not.toHaveLength(0);
});

test("opens a separate applications view without relying on sample worker or job data", async () => {
  localStorage.setItem("harvesthub_phone", "9876543211");
  mockLanguage = "en";
  apiRequest.mockImplementation((endpoint) => {
    if (endpoint === "/users/worker/9876543211") {
      return Promise.resolve({ success: true, profile: { mobile: "9876543211" } });
    }
    if (endpoint.startsWith("/jobs/worker/")) {
      return Promise.resolve({ success: true, applications: [] });
    }
    return Promise.resolve({ success: true });
  });

  render(<WorkerDashboard />);
  fireEvent.click(
    screen.getByRole("button", { name: /My Applications/ })
  );

  expect(await screen.findByRole("heading", { name: "My Applications" })).toBeTruthy();
  expect(screen.getByText(/You have not applied yet/)).toBeTruthy();
});

test("refreshes the worker application status from the server when opening applications", async () => {
  localStorage.setItem("harvesthub_phone", "9876543211");
  mockLanguage = "en";
  let applicationLoads = 0;
  apiRequest.mockImplementation((endpoint) => {
    if (endpoint === "/users/worker/9876543211") {
      return Promise.resolve({ success: true, profile: { mobile: "9876543211" } });
    }
    if (endpoint === "/jobs/worker/9876543211/applications") {
      applicationLoads += 1;
      return Promise.resolve({
        success: true,
        applications: [{
          application_id: 501,
          job_id: 101,
          title: "Paddy work",
          status: applicationLoads === 1 ? "pending" : "accepted",
        }],
      });
    }
    return Promise.resolve({ success: true });
  });

  render(<WorkerDashboard />);
  await waitFor(() => expect(applicationLoads).toBe(1));
  fireEvent.click(
    screen.getByRole("button", { name: /My Applications/ })
  );

  await waitFor(() => expect(applicationLoads).toBe(2));
  expect(await screen.findAllByText("Application accepted")).not.toHaveLength(0);
});

test("prompts a new worker to create the profile required before applying", async () => {
  localStorage.setItem("harvesthub_phone", "9876543211");
  mockLanguage = "en";
  apiRequest.mockImplementation((endpoint) => {
    if (endpoint === "/users/worker/9876543211") {
      return Promise.resolve({ success: true, profile: null });
    }
    if (endpoint === "/users/profile/update") {
      return Promise.resolve({ success: true, userId: 22 });
    }
    return Promise.resolve({ success: true, applications: [] });
  });
  const getCurrentPosition = jest.fn();
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition },
  });

  render(<WorkerDashboard />);
  expect(await screen.findByText("Worker Profile")).toBeTruthy();
  expect(screen.getByText("Create your worker profile before applying for jobs."))
    .toBeTruthy();

  fireEvent.change(screen.getByPlaceholderText("Enter your name"), {
    target: { value: "Registered Worker" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter your village"), {
    target: { value: "Samalkot" },
  });
  fireEvent.change(
    screen.getByPlaceholderText("Harvesting, Sowing, Tractor Driving"),
    { target: { value: "Harvesting" } }
  );
  fireEvent.change(screen.getByPlaceholderText("Enter expected wage"), {
    target: { value: "500" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Capture My Location/ }));
  act(() => {
    getCurrentPosition.mock.calls[0][0]({
      coords: { latitude: 16.9, longitude: 82.2 },
    });
  });
  fireEvent.click(screen.getByRole("button", { name: "Save Worker Profile" }));

  await waitFor(() => {
    expect(apiRequest).toHaveBeenCalledWith("/users/profile/update", "PUT", {
      mobile: "9876543211",
      name: "Registered Worker",
      role: "worker",
      village: "Samalkot",
      skills: ["Harvesting"],
      experience_years: 0,
      expected_daily_wage: 500,
      latitude: 16.9,
      longitude: 82.2,
      current_mobile: "9876543211",
    });
  });
  expect(
    screen.getByRole("button", { name: "📍 Find Jobs Near Me" })
  ).toBeTruthy();
});

test("hides My Profile while keeping the other worker dashboard sections", () => {
  localStorage.setItem("harvesthub_phone", "9876543211");
  mockLanguage = "en";
  render(<WorkerDashboard />);

  expect(screen.queryByRole("button", { name: /My Profile/ })).toBeNull();
  expect(screen.getByRole("button", { name: /Find & Apply/ })).toBeTruthy();
  expect(screen.getByRole("button", { name: /My Applications/ })).toBeTruthy();
  expect(screen.getByRole("button", { name: /Add Worker/ })).toBeTruthy();
  expect(screen.getByRole("button", { name: /Workers/ })).toBeTruthy();
});

test("adds a new worker from the dashboard using the existing worker profile form", async () => {
  localStorage.setItem("harvesthub_phone", "9876543211");
  apiRequest.mockResolvedValue({
    success: true,
    applications: [],
    userId: 22,
  });
  const getCurrentPosition = jest.fn();
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition },
  });

  render(<WorkerDashboard />);
  fireEvent.click(
    screen.getByRole("button", { name: /కార్మికుడిని జోడించండి/ })
  );

  const form = screen.getByText("Add New Worker").closest(".login-card")
    .querySelector("form");
  fireEvent.change(screen.getByPlaceholderText("Enter your name"), {
    target: { value: "New Worker" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter mobile number"), {
    target: { value: "9876543212" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter your village"), {
    target: { value: "Samalkot" },
  });
  fireEvent.change(
    screen.getByPlaceholderText("Harvesting, Sowing, Tractor Driving"),
    { target: { value: "Harvesting, Sowing" } }
  );
  fireEvent.change(screen.getByPlaceholderText("Enter expected wage"), {
    target: { value: "500" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Capture My Location/ }));
  act(() => {
    getCurrentPosition.mock.calls[0][0]({
      coords: { latitude: 16.9, longitude: 82.2 },
    });
  });
  fireEvent.submit(form);

  await waitFor(() => {
    expect(apiRequest).toHaveBeenCalledWith("/users/register", "POST", {
      mobile: "9876543212",
      name: "New Worker",
      role: "worker",
      village: "Samalkot",
      skills: ["Harvesting", "Sowing"],
      experience_years: 0,
      expected_daily_wage: 500,
      latitude: 16.9,
      longitude: 82.2,
    });
  });
  expect(screen.getByText("New Worker")).toBeTruthy();
  expect(screen.getByText(/Samalkot/)).toBeTruthy();
  expect(
    JSON.parse(
      localStorage.getItem("harvesthub_created_workers:9876543211")
    )
  ).toHaveLength(1);
});
