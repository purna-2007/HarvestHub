import React from "react";
import { act, render, screen } from "@testing-library/react";
import WorkerDashboard from "./WorkerDashboard";
import socket from "../services/socket";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock("../Languagecontext", () => ({
  useLanguage: () => ({ language: "te" }),
}));
jest.mock("../services/socket", () => ({
  __esModule: true,
  default: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
}));

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
