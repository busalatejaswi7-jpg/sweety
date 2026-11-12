import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import SignupPage from "./SignupPage";

const { signupMock } = vi.hoisted(() => ({ signupMock: vi.fn() }));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ signup: signupMock, loading: false }),
}));

function renderSignupPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  );
}

describe("SignupPage", () => {
  beforeEach(() => {
    signupMock.mockResolvedValue(undefined);
  });

  test("rejects mismatched passwords without sending the request", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText("Full name"), "Sam Patient");
    await user.type(screen.getByLabelText("Email"), "sam@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm password"), "different123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Passwords do not match.");
    expect(signupMock).not.toHaveBeenCalled();
  });

  test("submits matching passwords and navigates to the dashboard", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText("Full name"), "Sam Patient");
    await user.type(screen.getByLabelText("Email"), "sam@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm password"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(signupMock).toHaveBeenCalledWith({
      name: "Sam Patient",
      email: "sam@example.com",
      password: "password123",
      confirmPassword: "password123",
    }));
    expect(await screen.findByText("Create an account")).toBeInTheDocument();
  });
});