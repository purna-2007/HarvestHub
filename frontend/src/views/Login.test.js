import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Login from "./Login";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../Languagecontext", () => ({
  useLanguage: () => ({ language: "en" }),
}));

beforeEach(() => {
  localStorage.clear();
  mockNavigate.mockClear();
});

test.each([
  ["farmer", "/farmer/dashboard"],
  ["worker", "/worker/dashboard"],
])("continues to %s dashboard with a valid 10-digit number and no OTP", (role, route) => {
  render(<Login role={role} />);

  const phoneInput = screen.getByPlaceholderText("Enter mobile number");
  fireEvent.change(phoneInput, {
    target: { value: "9876543210" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));

  expect(mockNavigate).toHaveBeenCalledWith(route);
  expect(localStorage.getItem("harvesthub_phone")).toBe("9876543210");
  expect(localStorage.getItem("harvesthub_role")).toBe(role);
  expect(screen.queryByLabelText("6-digit OTP")).toBeNull();
});

test.each(["2345678909", "5123456789", "987654321"])(
  "rejects invalid mobile number %s",
  (phone) => {
    render(<Login role="farmer" />);

    fireEvent.change(screen.getByPlaceholderText("Enter mobile number"), {
      target: { value: phone },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert").textContent).toBe(
      "Enter a valid 10-digit Indian mobile number"
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.getItem("harvesthub_phone")).toBeNull();
  }
);

test("accepts digits only and limits the mobile number input to 10 digits", () => {
  render(<Login role="worker" />);

  const phoneInput = screen.getByPlaceholderText("Enter mobile number");
  expect(phoneInput.maxLength).toBe(10);
  fireEvent.change(phoneInput, {
    target: { value: "98765abc10" },
  });

  expect(phoneInput.value).toBe("");
  expect(mockNavigate).not.toHaveBeenCalled();
});
