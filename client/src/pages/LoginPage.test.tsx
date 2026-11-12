import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import LoginPage from "./LoginPage";

const { loginMock, logoutMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  logoutMock: vi.fn(),
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ login: loginMock, logout: logoutMock, loading: false }),
}));

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
}

function renderLogin(path = "/login") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CurrentPath />
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage portal selection", () => {
  beforeEach(() => {
    loginMock.mockResolvedValue({
      id: 12,
      name: "Dr. Lee",
      email: "doctor@example.com",
      role: "doctor",
    });
  });

  test("routes an authenticated doctor to the doctor workspace", async () => {
    const user = userEvent.setup();
    renderLogin("/login?portal=doctor");

    await user.type(screen.getByLabelText("Email address"), "doctor@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByTestId("current-path")).toHaveTextContent("/doctor"));
    expect(logoutMock).not.toHaveBeenCalled();
  });

  test("rejects a doctor account selected under the patient portal", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email address"), "doctor@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Choose Doctor");
    expect(logoutMock).toHaveBeenCalledOnce();
    expect(screen.getByTestId("current-path")).toHaveTextContent("/login");
  });
});