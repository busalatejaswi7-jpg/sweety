
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
    <main className="journal-grid min-h-screen text-[#edf3e9]">
      <header className="border-b border-white/10 bg-[#101a17]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-3 no-underline">
            <span className="grid size-10 place-items-center rounded-lg bg-[#c4f06a] font-display text-xl font-bold text-[#16221a]">S</span>
            <span>
              <span className="block font-display text-lg font-bold leading-tight text-[#f4f6ed]">Sweety</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#93a49a]">Glucose journal</span>
            </span>
          </Link>
          <Link to="/dashboard" className="rounded-md border border-white/15 px-3 py-2 text-sm text-[#dce5d8] transition hover:border-[#c4f06a]/60 hover:text-[#c4f06a]">Dashboard</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-9 sm:px-8 sm:pt-14">
        <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[#c4f06a]">Look back, notice patterns</p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-[#f4f6ed] sm:text-5xl">Glucose reports</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#aab8ad] sm:text-base">A useful view of the readings you have logged.</p>
          </div>
          <p className="border-l-2 border-[#f28d75] pl-4 font-mono text-xs text-[#aab8ad]">PRIVATE · PERSONAL · YOURS</p>
        </div>

        <section aria-label="Report filters" className="mb-8 flex flex-col gap-6 border-y border-white/10 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label htmlFor="report-date" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#91a197]">Report date</label>
            <input
              id="report-date"
              type="date"
              max={getLocalDate()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-[#182520] px-3.5 py-3 text-sm text-[#f4f6ed] outline-none focus:border-[#c4f06a] focus:ring-2 focus:ring-[#c4f06a]/15 sm:w-auto"
            />
          </div>

          <div className="flex max-w-full flex-wrap gap-2" role="group" aria-label="Report period">
            {reportTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={type === tab.value}
                onClick={() => setType(tab.value)}
                className={`rounded-md px-3.5 py-2.5 text-xs font-medium transition sm:text-sm ${
                  type === tab.value
                    ? "bg-[#c4f06a] text-[#16221a]"
                    : "border border-white/10 bg-[#182520] text-[#bac8bc] hover:border-white/25 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {error && <p role="alert" className="mb-6 rounded-md border border-[#f28d75]/25 bg-[#f28d75]/10 px-4 py-3 text-sm text-[#ffad9b]">{error}</p>}

        {loading ? (
          <p className="py-12 text-sm text-[#aab8ad]" role="status">Loading report...</p>
        ) : report && (
          <>
            <section aria-label="Report summary" className="mb-8 grid grid-cols-2 border-y border-white/10 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={stat.label} className={`py-5 ${index > 0 ? "border-l border-white/10 pl-4 sm:pl-6" : "pr-4 sm:pr-6"} ${index > 1 ? "border-t border-white/10 sm:border-t-0" : ""}`}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#91a197] sm:text-xs">{stat.label}</p>
                  <p className={`mt-2 font-display text-2xl font-semibold sm:text-3xl ${index === 0 ? "text-[#f28d75]" : index === 2 ? "text-[#c4f06a]" : "text-[#f4f6ed]"}`}>{stat.value}</p>
                  <p className="mt-1 font-mono text-[10px] text-[#819087]">{stat.unit}</p>
                </div>
              ))}
            </section>

            <section aria-labelledby="report-details-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#91a197]">{type === "daily" ? "Your check-ins" : "Selected period"}</p>
                  <h2 id="report-details-heading" className="mt-1 font-display text-2xl font-semibold text-[#f4f6ed]">{type === "daily" ? "Daily reading details" : "Report period"}</h2>
                </div>
                {type !== "daily" && <p className="font-mono text-xs text-[#c4f06a]">{report.startDate} to {report.endDate}</p>}
              </div>

              {type === "daily" && (
                report.readings?.length ? (
                  <ol className="divide-y divide-white/10">
                    {report.readings.map((reading, index) => (
                      <li key={reading.id} className="flex items-center gap-4 py-5">
                        <span className={`grid size-9 shrink-0 place-items-center rounded-md font-mono text-xs ${index % 2 === 0 ? "bg-[#f28d75]/15 text-[#f28d75]" : "bg-[#c4f06a]/10 text-[#c4f06a]"}`} aria-hidden="true">0{index + 1}</span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-[#edf3e9]">{reading.slot}</span>
                        <span className="shrink-0 font-display text-xl font-semibold text-[#f4f6ed]">{reading.value}<span className="ml-1.5 font-mono text-[10px] font-normal text-[#91a197]">mg/dL</span></span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="border-l-2 border-[#f28d75] py-3 pl-4 text-sm text-[#aab8ad]">No readings found for this date.</p>
                )
              )}

              {report.count === 0 && type !== "daily" && <p className="border-l-2 border-[#f28d75] py-3 pl-4 text-sm text-[#aab8ad]">No readings found for this period.</p>}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
