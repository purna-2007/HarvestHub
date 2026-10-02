import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import FarmerDashboard from "./FarmerDashboard";
import socket from "../services/socket";
import { apiRequest } from "../services/api";
import { getUserCurrentLocation } from "../utils/geolocation";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock("../services/socket", () => ({
  __esModule: true,
  default: {
    on: (eventName, callback) => {
      mockSocketHandlers[eventName] = callback;
    },
    off: jest.fn(),
    timeout: () => ({
      emit: (...args) => {
        mockSocketEmit(...args);
      },
    }),
    emit: jest.fn(),
  },
}));
jest.mock("../services/api", () => ({
  apiRequest: jest.fn(),
}));
jest.mock("../utils/geolocation", () => ({
  getUserCurrentLocation: jest.fn(),
}));

const mockSocketEmit = jest.fn();
const mockSocketHandlers = {};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("harvesthub_phone", "9876500000");
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  apiRequest.mockImplementation((endpoint) => {
    if (endpoint.startsWith("/users/workers/search?")) {
      return Promise.resolve({
        success: true,
        workers: [{
          id: 56,
          name: "Suresh Naidu",
          mobile: "9876543211",
          village: "Samalkot",
          skills: ["Wheat", "Pruning"],
          skill_match_score: 70.71,
          experience_years: 5,
          expected_daily_wage: 480,
        }],
      });
    }
    if (endpoint.startsWith("/jobs/farmer/by-phone/")) {
      return Promise.resolve({
        success: true,
        jobs: [
          {
            id: 12,
            title: "Wheat - Pruning",
            crop_type: "Wheat",
            required_skill: "Pruning",
            location_name: "Samalkot",
            status: "open",
          },
          {
            id: 13,
            title: "Paddy - Harvesting",
            crop_type: "Paddy",
            required_skill: "Harvesting",
            location_name: "Samalkot",
            status: "open",
          },
        ],
      });
    }
    if (endpoint.startsWith("/jobs/12/applications?")) {
      return Promise.resolve({
        success: true,
        applications: [{
          application_id: 34,
          job_id: 12,
          worker_id: 56,
          worker_name: "Suresh Naidu",
          worker_phone: "9876543211",
          worker_village: "East Godavari",
          worker_skills: ["Wheat", "Pruning"],
          worker_experience_years: 5,
          agreed_wage: 480,
          status: "pending",
        }],
      });
    }
    if (endpoint.startsWith("/jobs/13/applications?")) {
      return Promise.resolve({
        success: true,
        applications: [{
          application_id: 35,
          job_id: 13,
          worker_id: 57,
          worker_name: "Ramesh Kumar",
          worker_phone: "9876543210",
          worker_skills: ["Paddy", "Harvesting"],
          status: "pending",
        }],
      });
    }
    return Promise.resolve({ success: true });
  });
  window.alert = jest.fn();
  Object.keys(mockSocketHandlers).forEach((eventName) => {
    delete mockSocketHandlers[eventName];
  });
  jest.clearAllMocks();
});

test("finds registered worker profiles without requiring a job application", async () => {
  render(<FarmerDashboard />);
  expect(screen.queryByText("Suresh Naidu")).toBeNull();

  const [cropSelect, workTypeSelect] = screen.getAllByRole("combobox");
  const [acresInput] = screen.getAllByRole("spinbutton");
  expect(
    Array.from(cropSelect.options)
      .map((option) => option.value)
      .filter(Boolean)
      .sort()
  ).toEqual(["chilli", "cotton", "paddy", "sugarcane", "wheat"]);
  fireEvent.change(cropSelect, { target: { value: "wheat" } });
  expect(
    Array.from(workTypeSelect.options)
      .map((option) => option.value)
      .filter(Boolean)
  ).toEqual([
    "Seeding",
    "Irrigation Setup",
    "Pesticide Spraying",
    "Pruning",
    "Harvesting",
    "Tractor Driving",
  ]);
  fireEvent.change(workTypeSelect, { target: { value: "Pruning" } });
  fireEvent.change(acresInput, { target: { value: "5" } });
  fireEvent.change(document.querySelector('input[type="date"]'), {
    target: { value: "2030-01-01" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter village / area"), {
    target: { value: "Samalkot" },
  });
  fireEvent.change(screen.getByPlaceholderText("e.g. 500"), {
    target: { value: "500" },
  });
  fireEvent.submit(cropSelect.closest("form"));

  expect(await screen.findByText("Suresh Naidu")).toBeTruthy();
  expect(screen.getByText("📍 Samalkot,")).toBeTruthy();
  expect(screen.getByText("Skill match: 70.71%")).toBeTruthy();
  expect(getUserCurrentLocation).not.toHaveBeenCalled();
  expect(screen.queryByText("Ramesh Kumar")).toBeNull();
  expect(
    screen.getByText("1 matching workers found for Wheat Pruning.")
  ).toBeTruthy();
  const searchRequest = apiRequest.mock.calls.find(([endpoint]) =>
    endpoint.startsWith("/users/workers/search?")
  );
  const searchParams = new URLSearchParams(searchRequest[0].split("?")[1]);
  expect(searchParams.get("skill")).toBe("Pruning");
  expect(searchParams.get("location")).toBe("Samalkot");
  expect(searchParams.get("max_daily_wage")).toBe("500");
  expect(searchParams.has("latitude")).toBe(false);
  expect(searchParams.has("longitude")).toBe(false);
});

test("shows a worker's application in farmer notifications and opens its review", async () => {
  render(<FarmerDashboard />);
  const notifyFarmer = mockSocketHandlers.job_application;
  expect(notifyFarmer).toBeTruthy();
  await act(async () => {
    await notifyFarmer({
      job_id: 12,
      worker_name: "Suresh Naidu",
      status: "pending",
    });
  });

  await act(async () => {
    fireEvent.click(
      screen.getAllByRole("button", { name: /Notifications/ })[0]
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  expect(await screen.findByText("New worker applications")).toBeTruthy();
  expect(screen.getByText("Suresh Naidu")).toBeTruthy();
  expect(screen.getByText("Wheat - Pruning")).toBeTruthy();
  expect(
    screen.getAllByRole("button", { name: "Review in My Jobs" })
  ).toHaveLength(2);

  await act(async () => {
    fireEvent.click(
      screen.getAllByRole("button", { name: "Review in My Jobs" })[0]
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  expect(await screen.findAllByRole("button", { name: "Accept" })).toHaveLength(2);
});

test("loads accepted workers from saved applications when farmer opens notifications", async () => {
  apiRequest.mockImplementation((endpoint) => {
    if (endpoint.startsWith("/jobs/farmer/by-phone/")) {
      return Promise.resolve({
        success: true,
        jobs: [{
          id: 12,
          title: "Wheat - Pruning",
          crop_type: "Wheat",
          required_skill: "Pruning",
          location_name: "Samalkot",
          daily_wage: 480,
          status: "accepted",
          accepted_worker_id: 56,
          accepted_at: "2030-01-01 10:00:00",
          worker_name: "Suresh Naidu",
          worker_phone: "9876543211",
          worker_village: "East Godavari",
          worker_skills: ["Pruning"],
          worker_experience_years: 5,
        }],
      });
    }
    if (endpoint.startsWith("/jobs/12/applications?")) {
      return Promise.resolve({
        success: true,
        applications: [{
          application_id: 34,
          job_id: 12,
          worker_id: 56,
          worker_name: "Suresh Naidu",
          worker_phone: "9876543211",
          worker_village: "East Godavari",
          worker_skills: ["Pruning"],
          worker_experience_years: 5,
          agreed_wage: 480,
          status: "accepted",
          decided_at: "2030-01-01 10:00:00",
        }],
      });
    }
    return Promise.resolve({ success: true });
  });

  render(<FarmerDashboard />);
  fireEvent.click(
    screen.getAllByRole("button", { name: /Notifications/ })[0]
  );

  expect(await screen.findByText("Workers accepted")).toBeTruthy();
  expect(screen.getByText("Suresh Naidu")).toBeTruthy();
  expect(screen.getByText("Wheat - Pruning")).toBeTruthy();
  expect(screen.queryByText("No workers have accepted your jobs yet.")).toBeNull();
});

test("sends a Telugu hire notification with the farmer contact to the selected worker", async () => {
  render(<FarmerDashboard />);

  const [cropSelect, workTypeSelect] = screen.getAllByRole("combobox");
  const [acresInput] = screen.getAllByRole("spinbutton");
  fireEvent.change(cropSelect, { target: { value: "wheat" } });
  fireEvent.change(workTypeSelect, { target: { value: "Pruning" } });
  fireEvent.change(acresInput, { target: { value: "1" } });
  fireEvent.change(document.querySelector('input[type="date"]'), {
    target: { value: "2030-01-01" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter village / area"), {
    target: { value: "East Godavari" },
  });
  fireEvent.submit(cropSelect.closest("form"));
  await screen.findByRole("button", { name: "Hire Worker" });
  fireEvent.click(screen.getByRole("button", { name: "Hire Worker" }));

  expect(mockSocketEmit).toHaveBeenCalledWith("hire_worker", {
    worker_phone: "9876543211",
    worker_name: "Suresh Naidu",
    farmer_phone: "9876500000",
    crop_type: "Wheat",
    required_skill: "Pruning",
  }, expect.any(Function));
});

test("confirms hiring only after backend acknowledges the SMS", async () => {
  render(<FarmerDashboard />);
  const [cropSelect, workTypeSelect] = screen.getAllByRole("combobox");
  const [acresInput] = screen.getAllByRole("spinbutton");
  fireEvent.change(cropSelect, { target: { value: "wheat" } });
  fireEvent.change(workTypeSelect, { target: { value: "Pruning" } });
  fireEvent.change(acresInput, { target: { value: "1" } });
  fireEvent.change(document.querySelector('input[type="date"]'), {
    target: { value: "2030-01-01" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter village / area"), {
    target: { value: "East Godavari" },
  });
  fireEvent.submit(cropSelect.closest("form"));
  await screen.findByRole("button", { name: "Hire Worker" });
  fireEvent.click(screen.getByRole("button", { name: "Hire Worker" }));

  const [, , acknowledge] = mockSocketEmit.mock.calls[0];
  act(() => acknowledge(null, { success: true }));

  expect(window.alert).toHaveBeenCalledWith(
    "Suresh Naidu selected. SMS sent with your contact number."
  );

  fireEvent.click(screen.getByRole("button", { name: /Hiring History/ }));
  expect(screen.getByText("Suresh Naidu")).toBeTruthy();
  expect(screen.getByText(/SMS Sent/)).toBeTruthy();
  expect(localStorage.getItem("harvesthub_hiring_history:9876500000")).toContain(
    '"smsStatus":"sent"'
  );
});

test("reports hire SMS failures instead of showing a success message", async () => {
  render(<FarmerDashboard />);
  const [cropSelect, workTypeSelect] = screen.getAllByRole("combobox");
  const [acresInput] = screen.getAllByRole("spinbutton");
  fireEvent.change(cropSelect, { target: { value: "wheat" } });
  fireEvent.change(workTypeSelect, { target: { value: "Pruning" } });
  fireEvent.change(acresInput, { target: { value: "1" } });
  fireEvent.change(document.querySelector('input[type="date"]'), {
    target: { value: "2030-01-01" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter village / area"), {
    target: { value: "East Godavari" },
  });
  fireEvent.submit(cropSelect.closest("form"));
  await screen.findByRole("button", { name: "Hire Worker" });
  fireEvent.click(screen.getByRole("button", { name: "Hire Worker" }));

  const [, , acknowledge] = mockSocketEmit.mock.calls[0];
  act(() => acknowledge(null, {
    success: false,
    message: "SMS service is not configured.",
  }));

  expect(window.alert).toHaveBeenCalledWith("SMS service is not configured.");

  fireEvent.click(screen.getByRole("button", { name: /Hiring History/ }));
  expect(screen.getByText("Suresh Naidu")).toBeTruthy();
  expect(screen.getByText(/Not sent/)).toBeTruthy();
  expect(screen.getByText("SMS service is not configured.")).toBeTruthy();
  expect(localStorage.getItem("harvesthub_hiring_history:9876500000")).toContain(
    '"smsStatus":"failed"'
  );
});

test("shows an empty state when the farmer has no hiring history", () => {
  render(<FarmerDashboard />);

  fireEvent.click(screen.getByRole("button", { name: /Hiring History/ }));

  expect(screen.getByText("No worker selections yet.")).toBeTruthy();
});

test("shows a worker profile in notifications after the worker accepts a job", () => {
  render(<FarmerDashboard />);

  act(() => {
    mockSocketHandlers.notify_farmer({
      job_id: 42,
      job_title: "Harvest the paddy field",
      crop_type: "Paddy",
      required_skill: "Harvesting",
      daily_wage: 600,
      worker_id: 17,
      worker_name: "Ravi Kumar",
      worker_phone: "9876543210",
      worker_village: "Samalkot",
      worker_skills: ["Paddy", "Harvesting"],
      worker_experience_years: 7,
      status: "accepted",
    });
  });

  fireEvent.click(screen.getByRole("button", { name: /Latest updates/ }));

  expect(screen.getByText("Workers accepted")).toBeTruthy();
  expect(screen.getByText("Ravi Kumar")).toBeTruthy();
  expect(screen.getByText(/Samalkot/)).toBeTruthy();
  expect(screen.getByText(/7 years experience/)).toBeTruthy();
  expect(screen.getByText("Ravi Kumar").closest("article").textContent)
    .toContain("Harvesting");
  expect(screen.getByText("Harvest the paddy field")).toBeTruthy();
  expect(screen.getByText("₹600 / per day")).toBeTruthy();
  expect(screen.getByRole("link", { name: "9876543210" }).getAttribute("href"))
    .toBe("tel:9876543210");
  expect(localStorage.getItem("harvesthub_hiring_history:9876500000"))
    .toContain('"workerName":"Ravi Kumar"');
  expect(
    screen.getByRole("button", { name: "Notifications" }).querySelector("span")
      .textContent
  ).toBe("1");
});

test("loads posted jobs and lets the farmer accept a saved worker application", async () => {
  const job = {
    id: 40,
    title: "Paddy - Harvesting",
    crop_type: "Paddy",
    required_skill: "Harvesting",
    workers_needed: 4,
    daily_wage: 500,
    location_name: "Samalkot",
    status: "open",
  };
  let applicationStatus = "pending";
  apiRequest.mockImplementation((endpoint) => {
    if (endpoint.startsWith("/jobs/farmer/by-phone/")) {
      return Promise.resolve({ success: true, jobs: [job] });
    }
    if (endpoint.startsWith("/jobs/40/applications?")) {
      return Promise.resolve({
        success: true,
        applications: [{
          application_id: 91,
          job_id: 40,
          worker_name: "Ravi Worker",
          worker_phone: "9876543211",
          worker_village: "Samalkot",
          agreed_wage: 500,
          status: applicationStatus,
        }],
      });
    }
    if (endpoint.endsWith("/decision")) {
      applicationStatus = "accepted";
      return Promise.resolve({ success: true });
    }
    return Promise.resolve({ success: true });
  });

  render(<FarmerDashboard />);
  fireEvent.click(screen.getByRole("button", { name: /My Jobs/ }));

  expect(await screen.findByText("Paddy - Harvesting")).toBeTruthy();
  expect(screen.getByText("Ravi Worker")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Accept" }));

  expect(await screen.findByText("Worker application accepted.")).toBeTruthy();
  expect(apiRequest).toHaveBeenCalledWith(
    "/jobs/40/applications/91/decision",
    "POST",
    { farmer_phone: "9876500000", decision: "accept" }
  );
});

test("posts a job to the backend using the farmer phone and captured location", async () => {
  let jobCreated = false;
  const postedJob = {
    id: 41,
    title: "Paddy - Harvesting",
    crop_type: "Paddy",
    required_skill: "Harvesting",
    daily_wage: 600,
    location_name: "Samalkot",
    status: "open",
  };
  apiRequest.mockImplementation((endpoint) => {
    if (endpoint.startsWith("/jobs/farmer/by-phone/")) {
      return Promise.resolve({
        success: true,
        jobs: jobCreated ? [postedJob] : [],
      });
    }
    if (endpoint === "/jobs/create") {
      jobCreated = true;
      return Promise.resolve({ success: true, job: postedJob });
    }
    return Promise.resolve({ success: true, applications: [] });
  });
  getUserCurrentLocation.mockResolvedValue({
    latitude: 16.9,
    longitude: 82.2,
  });

  render(<FarmerDashboard />);
  fireEvent.click(screen.getByRole("button", { name: /My Jobs/ }));
  const [cropSelect, workTypeSelect] = screen.getAllByRole("combobox");
  fireEvent.change(cropSelect, { target: { value: "paddy" } });
  fireEvent.change(workTypeSelect, { target: { value: "Harvesting" } });
  fireEvent.change(screen.getByPlaceholderText("Enter acres"), {
    target: { value: "2" },
  });
  fireEvent.change(document.querySelector('input[type="date"]'), {
    target: { value: "2030-01-01" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter village / area"), {
    target: { value: "Samalkot" },
  });
  fireEvent.change(screen.getByPlaceholderText("e.g. 500"), {
    target: { value: "600" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Post a Job" }));

  await screen.findByText("Job posted successfully.");
  expect(await screen.findByText("Paddy - Harvesting")).toBeTruthy();
  expect(apiRequest).toHaveBeenCalledWith("/jobs/create", "POST", {
    farmer_phone: "9876500000",
    title: "Paddy - Harvesting",
    description: "2 acres",
    crop_type: "Paddy",
    required_skill: "Harvesting",
    workers_needed: 8,
    daily_wage: 600,
    start_date: "2030-01-01",
    location_name: "Samalkot",
    latitude: 16.9,
    longitude: 82.2,
  });
});
