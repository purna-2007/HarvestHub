import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import FarmerDashboard from "./FarmerDashboard";
import socket from "../services/socket";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock("../services/socket", () => ({
  __esModule: true,
  default: {
    timeout: () => ({
      emit: (...args) => {
        mockSocketEmit(...args);
      },
    }),
    emit: jest.fn(),
  },
}));

const mockSocketEmit = jest.fn();

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("harvesthub_phone", "9876500000");
  window.alert = jest.fn();
  jest.clearAllMocks();
});

test("shows available profiles matching the selected crop and work type", () => {
  render(<FarmerDashboard />);

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
    target: { value: "East Godavari" },
  });
  fireEvent.submit(cropSelect.closest("form"));

  expect(screen.getByText("Suresh Naidu")).toBeTruthy();
  expect(
    screen.getByText("1 matching workers found for Wheat Pruning.")
  ).toBeTruthy();
});

test("sends a Telugu hire notification with the farmer contact to the selected worker", () => {
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
  fireEvent.click(screen.getByRole("button", { name: "Hire Worker" }));

  expect(mockSocketEmit).toHaveBeenCalledWith("hire_worker", {
    worker_phone: "9876543211",
    worker_name: "Suresh Naidu",
    farmer_phone: "9876500000",
    crop_type: "Wheat",
    required_skill: "Pruning",
  }, expect.any(Function));
});

test("confirms hiring only after backend acknowledges the SMS", () => {
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
  fireEvent.click(screen.getByRole("button", { name: "Hire Worker" }));

  const [, , acknowledge] = mockSocketEmit.mock.calls[0];
  act(() => acknowledge(null, { success: true }));

  expect(window.alert).toHaveBeenCalledWith(
    "Suresh Naidu selected. SMS sent with your contact number."
  );

  fireEvent.click(screen.getByRole("button", { name: /Hiring History/ }));
  expect(screen.getByText("Suresh Naidu")).toBeTruthy();
  expect(screen.getByText("SMS: Sent")).toBeTruthy();
  expect(localStorage.getItem("harvesthub_hiring_history:9876500000")).toContain(
    '"smsStatus":"sent"'
  );
});

test("reports hire SMS failures instead of showing a success message", () => {
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
  fireEvent.click(screen.getByRole("button", { name: "Hire Worker" }));

  const [, , acknowledge] = mockSocketEmit.mock.calls[0];
  act(() => acknowledge(null, {
    success: false,
    message: "SMS service is not configured.",
  }));

  expect(window.alert).toHaveBeenCalledWith("SMS service is not configured.");

  fireEvent.click(screen.getByRole("button", { name: /Hiring History/ }));
  expect(screen.getByText("Suresh Naidu")).toBeTruthy();
  expect(screen.getByText("SMS: Not sent")).toBeTruthy();
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
