
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getApiErrorMessage } from "../services/apiError";
import {
  addReading,
  fetchReadings,
  removeReading,
  updateReading,
} from "../services/reading.service";
import type {
  Reading,
  ReadingSlot,
} from "../types/reading.types";

const slots: ReadingSlot[] = [
  "Morning fasting",
  "After breakfast",
  "After lunch",
  "After dinner",
];

const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [date, setDate] = useState(getLocalDate);
  const [slot, setSlot] = useState<ReadingSlot>(slots[0]);
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const average = readings.length
    ? Math.round(readings.reduce((total, reading) => total + reading.value, 0) / readings.length)
    : null;
  const range = readings.length
    ? `${Math.min(...readings.map((reading) => reading.value))}–${Math.max(...readings.map((reading) => reading.value))}`
    : null;
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    let active = true;

    fetchReadings(date)
      .then((data) => {
        if (active) setReadings(data);
      })
      .catch((err: unknown) => {
        if (active) setError(getApiErrorMessage(err, "Unable to load readings."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [date]);

  const refreshReadings = async () => {
    try {
      setReadings(await fetchReadings(date));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Unable to load readings."));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const numericValue = Number(value);

    if (!Number.isInteger(numericValue) || numericValue < 40 || numericValue > 600) {
      setError("Enter a whole number between 40 and 600.");
      return;
    }

    if (editingId === null && readings.length >= 4) {
      setError("You can add a maximum of four readings per day.");
      return;
    }

    if (readings.some((reading) => reading.slot === slot && reading.id !== editingId)) {
      setError("A reading already exists for this slot.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        readingDate: date,
        slot,
        value: numericValue,
      };
      if (editingId === null) {
        await addReading(payload);
      } else {
        await updateReading(editingId, payload);
      }

      setValue("");
      setEditingId(null);
      setSuccess(editingId === null ? "Reading saved successfully." : "Reading updated successfully.");
      await refreshReadings();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Unable to save reading."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (reading: Reading) => {
    setEditingId(reading.id);
    setSlot(reading.slot);
    setValue(String(reading.value));
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSlot(slots[0]);
    setValue("");
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: number) => {
    setError("");
    setSuccess("");

    try {
      await removeReading(id);
      if (editingId === id) cancelEdit();
      setSuccess("Reading deleted successfully.");
      await refreshReadings();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Unable to delete reading."));
    }
  };

  return (
    <div className="journal-grid min-h-screen bg-[#101a17] text-[#edf3e9]">
      <header className="border-b border-white/10 bg-[#101a17]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="/dashboard" className="flex items-center gap-3 no-underline">
            <span className="grid size-10 place-items-center rounded-lg bg-[#c4f06a] font-display text-xl font-bold text-[#16221a]">S</span>
            <span>
              <span className="block font-display text-lg font-bold leading-tight text-[#f4f6ed]">Sweety</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#93a49a]">Glucose journal</span>
            </span>
          </a>

          <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main navigation">
            <Link to="/reports" className="rounded-md px-3 py-2 text-sm text-[#bdc9bd] transition hover:bg-white/5 hover:text-white">Reports</Link>
            <span className="hidden text-sm text-[#a3b2a7] sm:inline">{user?.name || "Your account"}</span>
            <button
              onClick={logout}
              className="rounded-md border border-white/15 px-3 py-2 text-sm text-[#dce5d8] transition hover:border-[#c4f06a]/60 hover:text-[#c4f06a]"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-7 sm:px-8 sm:pt-10">
        <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c4f06a]">Daily journal</p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-[#f4f6ed] sm:text-4xl">Glucose readings</h1>
          </div>
          <div className="border-l-2 border-[#f28d75] pl-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#91a197]">Selected day</p>
            <p className="mt-1 font-display text-lg font-medium text-[#f4f6ed]">{formattedDate}</p>
          </div>
        </section>

        <section aria-label="Daily summary" className="mb-6 grid grid-cols-3 border-y border-white/10 py-4">
          <div className="pr-3 sm:pr-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#91a197] sm:text-xs">Check-ins</p>
            <p className="mt-1.5 font-display text-xl font-semibold text-[#f4f6ed] sm:text-2xl">{readings.length}<span className="ml-1 text-xs font-normal text-[#819087]">/ 4</span></p>
          </div>
          <div className="border-l border-white/10 px-3 sm:px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#91a197] sm:text-xs">Daily average</p>
            <p className="mt-1.5 font-display text-xl font-semibold text-[#c4f06a] sm:text-2xl">{average ?? "—"}<span className="ml-1 text-[10px] font-normal text-[#91a197]">{average === null ? "" : "mg/dL"}</span></p>
          </div>
          <div className="border-l border-white/10 pl-3 sm:pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#91a197] sm:text-xs">Today's range</p>
            <p className="mt-1.5 font-display text-xl font-semibold text-[#f28d75] sm:text-2xl">{range ?? "—"}<span className="ml-1 text-[10px] font-normal text-[#91a197]">{range === null ? "" : "mg/dL"}</span></p>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-white/10 bg-[#182520] p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f28d75]">New entry</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-[#f4f6ed]">{editingId === null ? "Log a reading" : "Edit reading"}</h2>
            </div>
            <span className="font-mono text-[10px] text-[#91a197]">40–600 mg/dL</span>
          </div>

          <form onSubmit={handleSubmit} className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1.1fr_0.8fr_auto]">
            <div>
              <label htmlFor="reading-date" className="mb-2 block text-xs font-medium text-[#bac8bc]">Reading date</label>
              <input
                id="reading-date"
                type="date"
                required
                max={getLocalDate()}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setLoading(true);
                  setEditingId(null);
                  setSlot(slots[0]);
                  setValue("");
                }}
                className="w-full rounded-md border border-white/10 bg-[#101a17] px-3.5 py-3 text-sm text-[#f4f6ed] outline-none transition focus:border-[#c4f06a] focus:ring-2 focus:ring-[#c4f06a]/15"
              />
            </div>

            <div>
              <label htmlFor="reading-slot" className="mb-2 block text-xs font-medium text-[#bac8bc]">Time of day</label>
              <select
                id="reading-slot"
                value={slot}
                onChange={(e) => setSlot(e.target.value as ReadingSlot)}
                className="w-full rounded-md border border-white/10 bg-[#101a17] px-3.5 py-3 text-sm text-[#f4f6ed] outline-none transition focus:border-[#c4f06a] focus:ring-2 focus:ring-[#c4f06a]/15"
              >
                {slots.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="glucose-value" className="mb-2 block text-xs font-medium text-[#bac8bc]">Glucose value</label>
              <div className="flex items-center rounded-md border border-white/10 bg-[#101a17] pr-3 transition focus-within:border-[#c4f06a] focus-within:ring-2 focus-within:ring-[#c4f06a]/15">
                <input
                  id="glucose-value"
                  type="number"
                  min="40"
                  max="600"
                  step="1"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="110"
                  className="w-full min-w-0 bg-transparent px-3.5 py-3 font-mono text-lg text-[#f4f6ed] outline-none placeholder:text-[#56665c]"
                />
                <span className="shrink-0 font-mono text-[10px] uppercase text-[#91a197]">mg/dL</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || (editingId === null && readings.length >= 4)}
                className="flex min-w-0 flex-1 items-center justify-between rounded-md bg-[#c4f06a] px-4 py-3.5 text-sm font-bold text-[#16221a] transition hover:bg-[#d3fa82] disabled:cursor-not-allowed disabled:opacity-50 xl:min-w-40"
              >
                <span>{submitting ? "Saving..." : editingId === null && readings.length >= 4 ? "Limit reached" : editingId === null ? "Save reading" : "Save changes"}</span>
                <span aria-hidden="true" className="font-mono text-lg">→</span>
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-md border border-white/15 px-3 text-sm text-[#bdc9bd] transition hover:border-white/30 hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && <p role="alert" className="mt-4 rounded-md border border-[#f28d75]/25 bg-[#f28d75]/10 px-3 py-2.5 text-sm text-[#ffad9b]">{error}</p>}
          {success && <p role="status" className="mt-4 rounded-md border border-[#c4f06a]/20 bg-[#c4f06a]/[0.07] px-3 py-2.5 text-sm text-[#c4f06a]">{success}</p>}
        </section>

        <section aria-labelledby="readings-heading" className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#91a197]">Your record</p>
              <h2 id="readings-heading" className="mt-1 font-display text-xl font-semibold text-[#f4f6ed]">Daily readings</h2>
            </div>
            <span className="font-mono text-xs text-[#c4f06a]">{readings.length} of 4 logged</span>
          </div>

          {loading ? (
            <p className="py-8 text-sm text-[#aab8ad]" role="status">Loading readings...</p>
          ) : readings.length === 0 ? (
            <div className="border-l-2 border-[#f28d75] py-3 pl-4">
              <p className="font-display text-lg font-medium text-[#e8eee5]">No readings for this day yet.</p>
              <p className="mt-1 text-sm leading-6 text-[#91a197]">Your saved check-ins will appear here.</p>
            </div>
          ) : (
            <ol className="divide-y divide-white/10">
              {readings.map((reading, index) => (
                <li key={reading.id} className="flex items-center gap-4 py-4">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-md font-mono text-xs ${index % 2 === 0 ? "bg-[#f28d75]/15 text-[#f28d75]" : "bg-[#c4f06a]/10 text-[#c4f06a]"}`} aria-hidden="true">0{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#edf3e9]">{reading.slot}</p>
                    <p className="mt-1 font-mono text-[10px] text-[#819087]">{reading.reading_date}</p>
                  </div>
                  <p className="shrink-0 font-display text-xl font-semibold text-[#f4f6ed]">
                    {reading.value}<span className="ml-1.5 font-mono text-[10px] font-normal text-[#91a197]">mg/dL</span>
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(reading)}
                      aria-label={`Edit ${reading.slot} reading`}
                      className="rounded-md px-2 py-2 text-xs text-[#c4f06a] transition hover:bg-[#c4f06a]/10"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(reading.id)}
                      aria-label={`Remove ${reading.slot} reading`}
                      className="rounded-md px-2 py-2 text-xs text-[#91a197] transition hover:bg-[#f28d75]/10 hover:text-[#ffad9b]"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
