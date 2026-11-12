import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Reading } from "../types/reading.types";
import DashboardPage from "./DashboardPage";

const { addReadingMock, fetchReadingsMock, removeReadingMock, updateReadingMock } = vi.hoisted(() => ({
  addReadingMock: vi.fn(),
  fetchReadingsMock: vi.fn(),
  removeReadingMock: vi.fn(),
  updateReadingMock: vi.fn(),
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ user: { id: 8, name: "Sam", email: "sam@example.com" }, logout: vi.fn() }),
}));

vi.mock("../services/reading.service", () => ({
  addReading: addReadingMock,
  fetchReadings: fetchReadingsMock,
  removeReading: removeReadingMock,
  updateReading: updateReadingMock,
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe("DashboardPage reading form", () => {
  const reading: Reading = {
    id: 31,
    reading_date: "2026-11-12",
    slot: "Morning fasting",
    value: 110,
    created_at: "2026-11-12T08:00:00.000Z",
  };

  beforeEach(() => {
    fetchReadingsMock.mockResolvedValue([]);
    addReadingMock.mockResolvedValue(reading);
    updateReadingMock.mockResolvedValue({ ...reading, value: 145 });
    removeReadingMock.mockResolvedValue(undefined);
  });

  test("submits a valid new reading", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.type(await screen.findByLabelText("Glucose value"), "115");
    await user.click(screen.getByRole("button", { name: /save reading/i }));

    await waitFor(() => expect(addReadingMock).toHaveBeenCalledWith({
      readingDate: (screen.getByLabelText("Reading date") as HTMLInputElement).value,
      slot: "Morning fasting",
      value: 115,
    }));
  });

  test("loads a reading into the form and submits an update", async () => {
    fetchReadingsMock.mockResolvedValue([reading]);
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("button", { name: "Edit Morning fasting reading" }));
    const valueInput = screen.getByLabelText("Glucose value");
    await user.clear(valueInput);
    await user.type(valueInput, "145");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateReadingMock).toHaveBeenCalledWith(31, {
      readingDate: (screen.getByLabelText("Reading date") as HTMLInputElement).value,
      slot: "Morning fasting",
      value: 145,
    }));
  });
});