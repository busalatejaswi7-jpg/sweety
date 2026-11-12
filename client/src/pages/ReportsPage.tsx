
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchReport,
  type Report,
  type ReportType,
} from "../services/report.service";

const reportTabs: { label: string; value: ReportType }[] = [
  { label: "Daily", value: "daily" },
  { label: "Month to date", value: "month-to-date" },
  { label: "Previous month", value: "previous-month" },
];

const getLocalDate = () => {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

export default function ReportsPage() {
  const [date, setDate] = useState(getLocalDate);
  const [type, setType] = useState<ReportType>("daily");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadReport = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchReport(type, date);
        if (active) setReport(data);
      } catch (err: unknown) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };

        if (active) {
          setError(
            axiosError.response?.data?.message || "Unable to load report."
          );
          setReport(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadReport();

    return () => {
      active = false;
    };
  }, [type, date]);

  const stats = [
    { label: "Highest", value: report?.highest ?? 0, unit: "mg/dL" },
    { label: "Lowest", value: report?.lowest ?? 0, unit: "mg/dL" },
    { label: "Average", value: report?.average ?? 0, unit: "mg/dL" },
    { label: "Total readings", value: report?.count ?? 0, unit: "readings" },
  ];

  return (
    <main className="min-h-screen bg-[#f4f8f5]">
      <header className="flex items-center justify-between border-b bg-white px-6 py-5 md:px-10">
        <h1 className="text-2xl font-bold text-green-700">Sweety</h1>
        <Link
          to="/dashboard"
          className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <h2 className="text-3xl font-bold text-gray-800">Glucose Reports</h2>
        <p className="mt-2 text-gray-500">
          Review your blood glucose reading statistics.
        </p>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select report date
          </label>

          <input
            type="date"
            max={getLocalDate()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 md:w-auto"
          />

          <div className="mt-6 flex flex-wrap gap-3">
            {reportTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setType(tab.value)}
                className={`rounded-lg px-5 py-3 text-sm font-medium transition ${
                  type === tab.value
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-gray-500">Loading report...</p>
        ) : report && (
          <>
            <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-green-700">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{stat.unit}</p>
                </div>
              ))}
            </section>

            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">
                {type === "daily"
                  ? "Daily reading details"
                  : "Report period"}
              </h3>

              {type !== "daily" && (
                <p className="mb-4 text-sm text-gray-500">
                  {report.startDate} to {report.endDate}
                </p>
              )}

              {type === "daily" && (
                report.readings?.length ? (
                  <div className="space-y-3">
                    {report.readings.map((reading) => (
                      <div
                        key={reading.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                      >
                        <span className="font-medium text-gray-700">
                          {reading.slot}
                        </span>
                        <span className="font-bold text-green-700">
                          {reading.value} mg/dL
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-gray-500">
                    No readings found for this date.
                  </p>
                )
              )}

              {report.count === 0 && type !== "daily" && (
                <p className="py-6 text-center text-gray-500">
                  No readings found for this period.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
